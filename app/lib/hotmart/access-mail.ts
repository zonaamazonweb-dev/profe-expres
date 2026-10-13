import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { logError, logEvent } from "@/lib/telemetry";

/**
 * Pide a Supabase que envíe el correo de acceso (sale por el correo propio configurado en Supabase).
 * NUNCA lanza error: si el correo falla, la venta y la cuenta ya están guardadas y el cliente puede pedir
 * otro enlace desde /login. El fallo queda registrado para verlo en el panel (Salud).
 */
export async function sendAccessEmail(email: string, userId: string): Promise<boolean> {
  try {
    const { url, publishableKey } = getSupabaseConfig();
    const supabase = createClient(url, publishableKey, { auth: { flowType: "implicit", persistSession: false, autoRefreshToken: false } });
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
    if (error) throw new Error(`${error.status ?? ""} ${error.code ?? error.message}`.trim());
    await logEvent("acceso_correo_enviado", { userId });
    return true;
  } catch (err) {
    await logError(err, "webhook/correo-de-acceso", { path: "/api/webhooks/hotmart", userId });
    await logEvent("acceso_correo_fallido", { userId });
    return false;
  }
}
