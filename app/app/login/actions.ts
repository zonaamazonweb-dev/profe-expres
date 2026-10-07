"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { createSessionClient } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { allow, clientIp } from "@/lib/rate-limit";
import { logEvent } from "@/lib/telemetry";

const emailSchema = z.string().trim().toLowerCase().pipe(z.email().max(254));
const codeSchema = z.string().trim().regex(/^\d{6,8}$/);

export interface LoginState {
  step: "email" | "code";
  email?: string;
  message?: string;
}

/** Solo rutas internas: evita redirecciones abiertas hacia otros sitios tras iniciar sesión. */
function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "/app";
  return next.startsWith("/") && !next.startsWith("//") && !next.includes("\\") ? next : "/app";
}

export async function requestCode(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) return { step: "email", message: "Escribe un correo válido." };
  const email = parsed.data;

  const ip = await clientIp();
  const okIp = await allow(`login:ip:${ip}`, 15, 15 * 60);
  const okEmail = await allow(`login:email:${email}`, 4, 10 * 60);
  if (!okIp || !okEmail) {
    return { step: "email", message: "Demasiados intentos. Espera unos minutos y vuelve a probar." };
  }

  try {
    // Flujo "implicit": el enlace del correo funciona en CUALQUIER navegador o celular (el PKCE exige abrirlo
    // en el mismo navegador que lo pidió, y casi nadie lo hace: el correo se abre en la app de Gmail).
    const { url, publishableKey } = getSupabaseConfig();
    const supabase = createClient(url, publishableKey, { auth: { flowType: "implicit", persistSession: false, autoRefreshToken: false } });
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
    const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
    const next = safeNext(formData.get("next"));
    const emailRedirectTo = `${proto}://${host}/auth/finish?next=${encodeURIComponent(next)}`;
    // shouldCreateUser:false → solo entra quien ya tiene cuenta (pagó o fue agregada por el dueño).
    await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false, emailRedirectTo } });
  } catch {
    // Respuesta idéntica exista o no el correo: no se revela quién tiene cuenta.
  }
  return { step: "code", email, message: "Si ese correo tiene acceso, te enviamos un correo para entrar." };
}

export async function verifyCode(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = emailSchema.safeParse(formData.get("email"));
  const code = codeSchema.safeParse(formData.get("code"));
  if (!email.success) return { step: "email", message: "Vuelve a escribir tu correo." };
  if (!code.success) return { step: "code", email: email.data, message: "El código tiene 6 dígitos." };

  const ip = await clientIp();
  const okEmail = await allow(`verify:email:${email.data}`, 6, 15 * 60);
  const okIp = await allow(`verify:ip:${ip}`, 25, 15 * 60);
  if (!okEmail || !okIp) {
    return { step: "code", email: email.data, message: "Demasiados intentos. Espera unos minutos y pide un código nuevo." };
  }

  const supabase = await createSessionClient();
  const { data, error } = await supabase.auth.verifyOtp({ email: email.data, token: code.data, type: "email" });
  if (error || !data.user) {
    return { step: "code", email: email.data, message: "Código incorrecto o vencido. Pide uno nuevo." };
  }

  await logEvent("sesion_iniciada", { userId: data.user.id });
  redirect(safeNext(formData.get("next")));
}

export async function signOut() {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/login");
}
