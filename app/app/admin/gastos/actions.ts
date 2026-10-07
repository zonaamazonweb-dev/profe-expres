"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminMfa } from "@/lib/admin/auth";
import { writeAudit } from "@/lib/admin/audit";
import { majorToMinor } from "@/lib/admin/format";
import { createServiceClient } from "@/lib/supabase/admin";
import { allow } from "@/lib/rate-limit";

export interface GastoState { ok: boolean; message: string }

const CURRENCIES = ["USD", "EUR", "BRL", "MXN", "COP", "ARS", "CLP", "PEN"] as const;

const base = z.object({
  amount: z.coerce.number().positive("El monto debe ser mayor que 0.").max(10_000_000),
  currency: z.enum(CURRENCIES),
  periodStart: z.iso.date("Elige la fecha de inicio."),
  periodEnd: z.iso.date("Elige la fecha de fin."),
  note: z.string().trim().max(200).optional(),
}).refine((v) => v.periodEnd >= v.periodStart, { message: "La fecha de fin no puede ser anterior al inicio." });

const spendSchema = base.safeExtend({ channel: z.string().trim().min(2, "Escribe el canal.").max(60).regex(/^[\p{L}\p{N}_\- ]+$/u, "El canal solo admite letras, números y guiones.") });
const costSchema = base.safeExtend({ kind: z.enum(["infra", "email", "tax", "other"]) });

const raw = (f: FormData) => Object.fromEntries([...f.entries()].filter(([, v]) => typeof v === "string"));

export async function addSpend(_p: GastoState, formData: FormData): Promise<GastoState> {
  const admin = await requireAdminMfa();
  const parsed = spendSchema.safeParse(raw(formData));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  if (!(await allow(`admin:gasto:${admin.userId}`, 60, 3600))) return { ok: false, message: "Demasiados registros seguidos. Espera un rato." };
  const v = parsed.data;
  const { error } = await createServiceClient().from("acquisition_spend").insert({
    channel: v.channel.toLowerCase(), amount_minor: majorToMinor(v.amount, v.currency), currency: v.currency,
    period_start: v.periodStart, period_end: v.periodEnd, note: v.note || null, created_by: admin.userId,
  });
  if (error) return { ok: false, message: "No se pudo guardar. Intenta de nuevo." };
  await writeAudit({ adminId: admin.userId, action: "gasto.adquisicion", details: { channel: v.channel, currency: v.currency, amount: v.amount } });
  revalidatePath("/admin/negocio");
  return { ok: true, message: "Gasto guardado." };
}

export async function addCost(_p: GastoState, formData: FormData): Promise<GastoState> {
  const admin = await requireAdminMfa();
  const parsed = costSchema.safeParse(raw(formData));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  if (!(await allow(`admin:gasto:${admin.userId}`, 60, 3600))) return { ok: false, message: "Demasiados registros seguidos. Espera un rato." };
  const v = parsed.data;
  const { error } = await createServiceClient().from("cost_entries").insert({
    kind: v.kind, amount_minor: majorToMinor(v.amount, v.currency), currency: v.currency,
    period_start: v.periodStart, period_end: v.periodEnd, note: v.note || null, created_by: admin.userId,
  });
  if (error) return { ok: false, message: "No se pudo guardar. Intenta de nuevo." };
  await writeAudit({ adminId: admin.userId, action: "gasto.costo", details: { kind: v.kind, currency: v.currency, amount: v.amount } });
  revalidatePath("/admin/ganancia");
  return { ok: true, message: "Costo guardado." };
}

const delSchema = z.object({ table: z.enum(["acquisition_spend", "cost_entries"]), id: z.coerce.number().int().positive() });

export async function deleteEntry(formData: FormData): Promise<void> {
  const admin = await requireAdminMfa();
  const parsed = delSchema.safeParse(raw(formData));
  if (!parsed.success) return;
  await createServiceClient().from(parsed.data.table).delete().eq("id", parsed.data.id);
  await writeAudit({ adminId: admin.userId, action: "gasto.eliminado", details: parsed.data });
  revalidatePath("/admin/negocio");
  revalidatePath("/admin/ganancia");
}
