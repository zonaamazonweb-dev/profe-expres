import "server-only";
import { headers } from "next/headers";
import { createServiceClient } from "@/lib/supabase/admin";

export async function siteOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/**
 * Enlace de acceso de un solo uso (vence en 15 min). Se entrega al dueño, que se lo pasa a la usuaria
 * cuando el correo no llega. Nunca se guarda ni se escribe en logs.
 */
export async function createAccessLink(email: string): Promise<string | null> {
  const { data, error } = await createServiceClient().auth.admin.generateLink({ type: "magiclink", email });
  const hashed = data?.properties?.hashed_token;
  if (error || !hashed) return null;
  const origin = await siteOrigin();
  return `${origin}/auth/confirm?token_hash=${encodeURIComponent(hashed)}&type=magiclink&next=${encodeURIComponent("/")}`;
}
