import { createBrowserClient } from "@supabase/ssr";

/** Solo clave PÚBLICA (publishable). Se usa únicamente para el segundo factor (MFA) del admin. */
export function createBrowserSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Falta configurar Supabase.");
  return createBrowserClient(url, key);
}
