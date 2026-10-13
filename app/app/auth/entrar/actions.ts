"use server";

import { redirect } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createSessionClient } from "@/lib/supabase/server";
import { allow, clientIp } from "@/lib/rate-limit";
import { logEvent } from "@/lib/telemetry";

const TIPOS: EmailOtpType[] = ["magiclink", "email"];

function safeNext(value: FormDataEntryValue | null): string {
  const v = typeof value === "string" ? value : "/app";
  return v.startsWith("/") && !v.startsWith("//") && !v.includes("\\") ? v : "/app";
}

/**
 * Consume el enlace del correo SOLO cuando la persona pulsa el botón (POST).
 * Los filtros de Gmail y otras apps abren los enlaces solos para revisarlos (GET): por eso el enlace
 * del correo lleva a una página con botón y no gasta el acceso hasta que alguien de verdad lo pide.
 */
export async function entrar(formData: FormData) {
  const tokenHash = String(formData.get("token_hash") ?? "");
  const type = String(formData.get("type") ?? "") as EmailOtpType;
  const next = safeNext(formData.get("next"));

  if (!tokenHash || tokenHash.length > 200 || !TIPOS.includes(type)) redirect("/login?error=enlace");
  if (!(await allow(`entrar:${await clientIp()}`, 30, 15 * 60))) redirect("/login?error=enlace");

  let ok = false;
  let userId: string | null = null;
  try {
    const supabase = await createSessionClient();
    // Según cómo se pidió el correo, Supabase marca el enlace como "email" o "magiclink": se prueba el indicado y, si no, el otro.
    for (const t of [type, ...TIPOS.filter((x) => x !== type)]) {
      const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: t });
      if (!error && data.user) { ok = true; userId = data.user.id; break; }
    }
  } catch {
    ok = false;
  }
  if (!ok) redirect("/login?error=enlace");
  await logEvent("sesion_iniciada", { userId, metadata: { via: "enlace_correo" } });
  redirect(next);
}
