import "server-only";
import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { SupabaseNotConfiguredError } from "@/lib/supabase/config";

export interface AdminSession {
  userId: string;
  email: string;
  /** aal2 = la persona verificó también su segundo factor (código del autenticador). */
  mfaVerified: boolean;
}

/**
 * Verifica EN EL SERVIDOR que quien pide es el dueño. No confía en que la ruta esté oculta.
 *  1. getUser() valida el token contra Supabase (no solo lee la cookie).
 *  2. El rol se lee de la base con la clave de servicio: no depende de nada que el usuario controle.
 *  3. Cualquier fallo → /login (o 404 si ya hay sesión pero no es admin: no se revela que /admin existe).
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const supabase = await createSessionClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;

    const service = createServiceClient();
    const { data: profile } = await service
      .from("profiles")
      .select("role,status")
      .eq("id", data.user.id)
      .maybeSingle();
    if (!profile || profile.role !== "admin" || profile.status === "disabled") return null;

    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    return {
      userId: data.user.id,
      email: data.user.email ?? "",
      mfaVerified: aal?.currentLevel === "aal2",
    };
  } catch (err) {
    if (err instanceof SupabaseNotConfiguredError) return null; // fail-closed
    throw err;
  }
}

export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect("/login?next=/admin");
  return session;
}

/** Para acciones delicadas (alta manual, desactivar): exige además el segundo factor. */
export async function requireAdminMfa(): Promise<AdminSession> {
  const session = await requireAdmin();
  if (!session.mfaVerified) redirect("/admin/seguridad?necesario=1");
  return session;
}
