import "server-only";
import { createSessionClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { SupabaseNotConfiguredError } from "@/lib/supabase/config";

export interface AppAccess {
  userId: string;
  email: string;
}

/**
 * ¿Quien pide tiene acceso a la app? Se decide EN EL SERVIDOR:
 * sesión válida (getUser contra Supabase) + cuenta activa o dueña. Cualquier duda → sin acceso (fail-closed).
 * "past_due" conserva acceso mientras se resuelve el cobro; cancelada, reembolsada, contracargo y desactivada no.
 */
export async function getAppAccess(): Promise<AppAccess | null> {
  try {
    const supabase = await createSessionClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    const { data: profile } = await createServiceClient()
      .from("profiles")
      .select("role,status")
      .eq("id", data.user.id)
      .maybeSingle();
    if (!profile) return null;
    const ok = profile.role === "admin" ? profile.status !== "disabled" : profile.status === "active" || profile.status === "past_due";
    return ok ? { userId: data.user.id, email: data.user.email ?? "" } : null;
  } catch (err) {
    if (err instanceof SupabaseNotConfiguredError) return null;
    throw err;
  }
}
