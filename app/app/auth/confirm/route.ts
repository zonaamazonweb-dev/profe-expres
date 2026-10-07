import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createSessionClient } from "@/lib/supabase/server";
import { logEvent } from "@/lib/telemetry";

const TIPOS: EmailOtpType[] = ["magiclink", "email", "recovery", "invite"];

function safeNext(value: string | null): string {
  return value && value.startsWith("/") && !value.startsWith("//") && !value.includes("\\") ? value : "/app";
}

/**
 * Enlace de acceso entregado a una clienta (por correo o copiado por el dueño). Va por token_hash,
 * no por PKCE, así funciona aunque se abra en otro navegador que el que lo pidió. Un solo uso.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeNext(searchParams.get("next"));

  if (tokenHash && type && TIPOS.includes(type)) {
    try {
      const supabase = await createSessionClient();
      const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
      if (!error && data.user) {
        await logEvent("sesion_iniciada", { userId: data.user.id, metadata: { via: "enlace_directo" } });
        return NextResponse.redirect(new URL(next, origin));
      }
    } catch {
      // cae al mensaje genérico
    }
  }
  return NextResponse.redirect(new URL("/login?error=enlace", origin));
}
