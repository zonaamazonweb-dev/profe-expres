import { NextResponse, type NextRequest } from "next/server";
import { createSessionClient } from "@/lib/supabase/server";
import { logEvent } from "@/lib/telemetry";

function safeNext(value: string | null): string {
  return value && value.startsWith("/") && !value.startsWith("//") && !value.includes("\\") ? value : "/app";
}

/** Recibe el enlace del correo (flujo PKCE): intercambia el código por una sesión en ESTE navegador. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  if (code) {
    try {
      const supabase = await createSessionClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error && data.user) {
        await logEvent("sesion_iniciada", { userId: data.user.id, metadata: { via: "enlace" } });
        return NextResponse.redirect(new URL(next, origin));
      }
    } catch {
      // cae al mensaje genérico de abajo
    }
  }
  return NextResponse.redirect(new URL("/login?error=enlace", origin));
}
