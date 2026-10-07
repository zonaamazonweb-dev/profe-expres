import "server-only";
import { createServiceClient } from "@/lib/supabase/admin";

export async function writeAudit(entry: {
  adminId: string;
  action: string;
  targetUserId?: string | null;
  targetEmail?: string | null;
  details?: Record<string, unknown>;
}) {
  const { error } = await createServiceClient().from("admin_audit_log").insert({
    admin_id: entry.adminId,
    action: entry.action,
    target_user_id: entry.targetUserId ?? null,
    target_email: entry.targetEmail ?? null,
    details: entry.details ?? {},
  });
  if (error) throw new Error("No se pudo registrar la auditoría: " + error.message);
}
