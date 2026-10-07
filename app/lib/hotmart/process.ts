import "server-only";
import { createServiceClient } from "@/lib/supabase/admin";
import { ECONOMIC_KIND, EVENT_STATUS, canTransition, type HotmartEvent, type MembershipStatus } from "./payload";

export type Outcome = "applied" | "duplicate" | "illegal" | "error";

type Service = ReturnType<typeof createServiceClient>;

interface ProfileRow {
  id: string;
  status: string;
  first_paid_at: string | null;
}

/** Busca la cuenta por correo; si no existe, la crea (sin contraseña: entra con el código que le llega por correo). */
async function findOrCreateUser(service: Service, email: string, name: string | null): Promise<{ id: string; created: boolean } | null> {
  const found = await service.from("profiles").select("id").ilike("email", email).maybeSingle();
  if (found.data) return { id: found.data.id, created: false };

  const created = await service.auth.admin.createUser({ email, email_confirm: true, user_metadata: name ? { full_name: name } : {} });
  if (created.data.user) return { id: created.data.user.id, created: true };

  // Caso raro: la cuenta de acceso existe pero su perfil no. Se busca en la lista de cuentas.
  for (let page = 1; page <= 10; page++) {
    const list = await service.auth.admin.listUsers({ page, perPage: 1000 });
    const hit = list.data?.users.find((u) => u.email?.toLowerCase() === email);
    if (hit) return { id: hit.id, created: false };
    if (!list.data || list.data.users.length < 1000) break;
  }
  return null;
}

async function recordTransition(service: Service, userId: string, from: string | null, to: string, churnKind: "voluntary" | "involuntary" | null) {
  if (from === to) return;
  await service.from("membership_events").insert({ user_id: userId, from_status: from, to_status: to, churn_kind: churnKind, origin: "hotmart" });
}

/**
 * Aplica UN aviso ya autenticado y ya validado contra el catálogo. Cada paso es repetible sin duplicar nada:
 * si algo falla a medias, el reintento de Hotmart termina el trabajo.
 */
export async function applyEvent(ev: HotmartEvent): Promise<Outcome> {
  const service = createServiceClient();

  const done = await service.from("processed_events").select("event_id").eq("event_id", ev.eventId).maybeSingle();
  if (done.data) return "duplicate";

  const target = EVENT_STATUS[ev.event];
  if (!target || !ev.email) return "applied"; // evento que no cambia acceso ni dinero: se registra y listo

  const kind = ECONOMIC_KIND[ev.event];
  const isAccessGrant = target === "active";

  // 1) Cuenta: solo una compra APROBADA puede crearla; el resto actúa sobre una cuenta existente.
  let profile: ProfileRow | null = null;
  let userId: string | null = null;
  const existing = await service.from("profiles").select("id,status,first_paid_at").ilike("email", ev.email).maybeSingle();
  if (existing.data) {
    profile = existing.data as ProfileRow;
    userId = profile.id;
  } else if (isAccessGrant) {
    const made = await findOrCreateUser(service, ev.email, ev.name);
    if (!made) return "error";
    userId = made.id;
    const again = await service.from("profiles").select("id,status,first_paid_at").eq("id", userId).maybeSingle();
    profile = (again.data as ProfileRow | null) ?? null;
  }

  // 2) Dinero: el libro de ventas tiene su propia clave (transacción + tipo), así que un mismo cobro no se cuenta dos veces.
  if (kind && ev.transactionId && ev.productId && ev.amountMinor != null && ev.currency) {
    const { error } = await service.from("payment_transactions").upsert(
      {
        provider: "hotmart",
        transaction_id: ev.transactionId,
        economic_kind: kind,
        user_id: userId,
        product_id: ev.productId,
        offer_id: ev.offerCode,
        source: ev.source,
        amount_minor: ev.amountMinor,
        currency: ev.currency,
        provider_fee_minor: ev.providerFeeMinor,
        affiliate_fee_minor: ev.affiliateFeeMinor,
        occurred_at: ev.occurredAt.toISOString(),
        raw_event_id: ev.eventId,
        interval_months: ev.intervalMonths,
      },
      { onConflict: "provider,transaction_id,economic_kind", ignoreDuplicates: true },
    );
    if (error) return "error";
  } else if (kind) {
    return "error"; // un cobro sin importe o moneda no se puede contabilizar: Hotmart reintenta y queda a la vista en el panel
  }

  if (!userId || !profile) return "applied"; // reembolso de alguien sin cuenta: solo queda el libro

  // 3) Estado de la cuenta.
  if (target === "plan_change") {
    await service.from("profiles").update({ plan: ev.planName }).eq("id", userId);
  } else {
    let sameTxRefunded = false;
    if (target === "active" && ev.transactionId) {
      const r = await service.from("payment_transactions").select("economic_kind").eq("provider", "hotmart").eq("transaction_id", ev.transactionId).in("economic_kind", ["refund", "chargeback"]).limit(1);
      sameTxRefunded = (r.data?.length ?? 0) > 0;
    }
    if (!canTransition(profile.status, target as MembershipStatus, sameTxRefunded)) return "illegal";

    const update: Record<string, unknown> = { status: target, access_origin: "hotmart" };
    let churn: "voluntary" | "involuntary" | null = null;
    if (target === "active") {
      update.plan = ev.planName;
      update.access_until = null;
      if (ev.subscriberCode) update.hotmart_subscriber_code = ev.subscriberCode;
      if (!profile.first_paid_at) update.first_paid_at = ev.occurredAt.toISOString();
      if (ev.source) update.source = ev.source;
    } else if (target === "cancelled") {
      churn = ev.event === "PURCHASE_EXPIRED" ? "involuntary" : "voluntary";
      update.cancelled_at = ev.occurredAt.toISOString();
      update.cancel_kind = churn;
      update.access_until = (ev.event === "SUBSCRIPTION_CANCELLATION" ? ev.nextChargeAt : null)?.toISOString() ?? new Date().toISOString();
    } else if (target === "refunded" || target === "chargeback") {
      update.access_until = new Date().toISOString();
    }
    // Un aviso de atraso o de baja no puede degradar una cuenta que ya cayó por reembolso o contracargo.
    const locked = (profile.status === "refunded" || profile.status === "chargeback") && (target === "past_due" || target === "cancelled");
    if (!locked) {
      const { error } = await service.from("profiles").update(update).eq("id", userId);
      if (error) return "error";
      await recordTransition(service, userId, profile.status, target, churn);
    }
  }

  return "applied";
}

export async function markProcessed(ev: HotmartEvent, payloadHash: string) {
  await createServiceClient()
    .from("processed_events")
    .upsert({ event_id: ev.eventId, event_type: ev.event, payload_hash: payloadHash }, { onConflict: "event_id", ignoreDuplicates: true });
}

export async function logWebhook(eventId: string | null, type: string | null, result: "applied" | "duplicate" | "illegal" | "unauthorized" | "error") {
  await createServiceClient().from("webhook_log").insert({ event_id: eventId, type, result });
}
