"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminMfa } from "@/lib/admin/auth";
import { writeAudit } from "@/lib/admin/audit";
import { createAccessLink } from "@/lib/admin/access-link";
import { createServiceClient } from "@/lib/supabase/admin";
import { allow } from "@/lib/rate-limit";

export interface ActionState {
  ok: boolean;
  message: string;
  link?: string;
}

const addSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email().max(254)),
  fullName: z.string().trim().min(2, "Escribe el nombre.").max(120),
});

export async function addUser(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdminMfa();
  const parsed = addSchema.safeParse({ email: formData.get("email"), fullName: formData.get("fullName") });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  if (!(await allow(`admin:add:${admin.userId}`, 20, 3600))) {
    return { ok: false, message: "Demasiadas altas seguidas. Espera un rato." };
  }

  const service = createServiceClient();
  const { email, fullName } = parsed.data;
  const { data: created, error } = await service.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (error || !created.user) {
    const existe = /already|registered|exists/i.test(error?.message ?? "");
    return { ok: false, message: existe ? "Ese correo ya tiene una cuenta. Búscala en la lista." : "No se pudo crear la cuenta. Intenta de nuevo." };
  }

  const userId = created.user.id;
  await service
    .from("profiles")
    .update({ full_name: fullName, access_origin: "manual", source: "manual", status: "active" })
    .eq("id", userId);
  await service.from("membership_events").insert({ user_id: userId, from_status: null, to_status: "active", origin: "manual" });
  await writeAudit({ adminId: admin.userId, action: "usuaria.alta_manual", targetUserId: userId, targetEmail: email });

  const link = await createAccessLink(email);
  revalidatePath("/admin/usuarias");
  return {
    ok: true,
    message: link
      ? "Cuenta creada. Pásale este enlace (sirve una sola vez y vence en 15 minutos)."
      : "Cuenta creada, pero no se pudo generar el enlace. Usa «Enlace de acceso» en su fila.",
    link: link ?? undefined,
  };
}

const idSchema = z.string().uuid();

async function loadTarget(userId: string, adminId: string) {
  const id = idSchema.safeParse(userId);
  if (!id.success) return { error: "Usuaria inválida." as const };
  if (id.data === adminId) return { error: "No puedes hacer esto con tu propia cuenta." as const };
  const { data } = await createServiceClient().from("profiles").select("id,email,role,status").eq("id", id.data).maybeSingle();
  if (!data) return { error: "No se encontró la cuenta." as const };
  if (data.role === "admin") return { error: "Las cuentas de administración no se tocan desde aquí." as const };
  return { profile: data };
}

export async function setUserActive(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdminMfa();
  const activar = formData.get("activar") === "1";
  const target = await loadTarget(String(formData.get("userId") ?? ""), admin.userId);
  if ("error" in target) return { ok: false, message: target.error ?? "Error." };
  if (!(await allow(`admin:toggle:${admin.userId}`, 60, 3600))) return { ok: false, message: "Demasiadas acciones seguidas. Espera un rato." };

  const service = createServiceClient();
  const { profile } = target;
  const { error } = await service.auth.admin.updateUserById(profile.id, { ban_duration: activar ? "none" : "876000h" });
  if (error) return { ok: false, message: "No se pudo cambiar el acceso. Intenta de nuevo." };

  const nuevo = activar ? "active" : "disabled";
  await service.from("profiles").update({ status: nuevo }).eq("id", profile.id);
  await service.from("membership_events").insert({ user_id: profile.id, from_status: profile.status, to_status: nuevo, origin: "manual" });
  await writeAudit({
    adminId: admin.userId,
    action: activar ? "usuaria.activar" : "usuaria.desactivar",
    targetUserId: profile.id,
    targetEmail: profile.email,
    details: { desde: profile.status, hacia: nuevo },
  });
  revalidatePath("/admin/usuarias");
  return { ok: true, message: activar ? "Cuenta reactivada." : "Cuenta desactivada: ya no puede entrar." };
}

export async function accessLinkFor(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdminMfa();
  const target = await loadTarget(String(formData.get("userId") ?? ""), admin.userId);
  if ("error" in target) return { ok: false, message: target.error ?? "Error." };
  if (target.profile.status === "disabled") return { ok: false, message: "La cuenta está desactivada. Reactívala primero." };
  if (!(await allow(`admin:link:${admin.userId}`, 30, 3600))) return { ok: false, message: "Demasiados enlaces seguidos. Espera un rato." };

  const link = await createAccessLink(target.profile.email);
  if (!link) return { ok: false, message: "No se pudo generar el enlace." };
  await writeAudit({ adminId: admin.userId, action: "usuaria.enlace_acceso", targetUserId: target.profile.id, targetEmail: target.profile.email });
  return { ok: true, message: "Enlace listo (un solo uso, vence en 15 minutos).", link };
}
