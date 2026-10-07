import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "./config";

/**
 * Cliente con la clave SECRETA: salta RLS. Solo para código de servidor que YA verificó
 * que la persona es admin (requireAdmin) o que es un proceso del sistema (webhook, logs).
 * Jamás se importa desde un componente cliente (server-only lo impide).
 */
export function createServiceClient() {
  const { url, secretKey } = getSupabaseConfig();
  return createClient(url, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
