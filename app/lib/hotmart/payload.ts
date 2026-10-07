/** Lectura defensiva del aviso de Hotmart (v2): el cuerpo es entrada de internet, nada se asume. */

export type EconomicKind = "sale" | "refund" | "chargeback";

export interface HotmartEvent {
  eventId: string;
  event: string;
  productId: string | null;
  email: string | null;
  name: string | null;
  transactionId: string | null;
  amountMinor: number | null;
  currency: string | null;
  offerCode: string | null;
  source: string | null;
  providerFeeMinor: number | null;
  affiliateFeeMinor: number | null;
  planName: string | null;
  subscriberCode: string | null;
  occurredAt: Date;
  nextChargeAt: Date | null;
  intervalMonths: number;
}

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v.trim() : typeof v === "number" ? String(v) : null);
const num = (v: unknown): number | null => {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  return Number.isFinite(n) ? n : null;
};
const at = (o: unknown, ...path: string[]): unknown => path.reduce<unknown>((acc, k) => (isObj(acc) ? acc[k] : undefined), o);
const toMinor = (v: unknown): number | null => {
  const n = num(v);
  return n == null ? null : Math.round(n * 100);
};
function toDate(v: unknown): Date | null {
  const n = num(v);
  if (n != null && n > 0) return new Date(n < 1e12 ? n * 1000 : n);
  const s = str(v);
  if (s) {
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return null;
}

/** Plan anual si el nombre del plan lo dice; si no, mensual. Se confirma con el primer aviso real. */
export function intervalFromPlan(planName: string | null): number {
  if (!planName) return 1;
  return /anual|annual|year|12\s*mes|yearly/i.test(planName) ? 12 : 1;
}

export function normalize(raw: unknown): HotmartEvent | null {
  if (!isObj(raw)) return null;
  const event = str(raw.event);
  if (!event) return null;
  const data = isObj(raw.data) ? raw.data : {};
  const transactionId = str(at(data, "purchase", "transaction"));
  const email = str(at(data, "buyer", "email") ?? raw.email)?.toLowerCase() ?? null;
  const occurredAt = toDate(at(data, "purchase", "approved_date")) ?? toDate(raw.creation_date) ?? new Date();
  // El id del evento es estable entre reintentos de Hotmart; el compuesto es el respaldo determinista (nunca Date.now()).
  const eventId = str(raw.id) ?? str(raw.event_id) ?? `${event}:${transactionId ?? email ?? "sin-id"}:${occurredAt.getTime()}`;

  const commissions = Array.isArray(at(data, "commissions")) ? (at(data, "commissions") as unknown[]) : [];
  const currency = str(at(data, "purchase", "price", "currency_value"))?.toUpperCase() ?? null;
  // Una comisión solo se cuenta si está en la MISMA moneda que el cobro; mezclar monedas falsearía la ganancia.
  const fee = (source: string) => {
    const hit = commissions.find((c) => isObj(c) && str(c.source)?.toUpperCase() === source);
    if (!isObj(hit)) return null;
    const feeCurrency = str(hit.currency_value)?.toUpperCase() ?? null;
    return feeCurrency && currency && feeCurrency !== currency ? null : toMinor(hit.value);
  };
  const planName = str(at(data, "subscription", "plan", "name"));
  const origin = at(data, "purchase", "origin");

  return {
    eventId,
    event,
    productId: str(at(data, "product", "id")),
    email,
    name: str(at(data, "buyer", "name")),
    transactionId,
    amountMinor: toMinor(at(data, "purchase", "price", "value")),
    currency,
    offerCode: str(at(data, "purchase", "offer", "code")),
    source: isObj(origin) ? (str(origin.src) ?? str(origin.sck)) : null,
    providerFeeMinor: fee("MARKETPLACE"),
    affiliateFeeMinor: fee("AFFILIATE"),
    planName,
    subscriberCode: str(at(data, "subscription", "subscriber", "code")),
    occurredAt,
    nextChargeAt: toDate(at(data, "subscription", "date_next_charge")),
    intervalMonths: intervalFromPlan(planName),
  };
}

export type MembershipStatus = "active" | "past_due" | "cancelled" | "refunded" | "chargeback";

/** Qué estado implica cada evento. Lo que no está aquí se registra y se ignora (no se inventa). */
export const EVENT_STATUS: Record<string, MembershipStatus | "plan_change"> = {
  PURCHASE_APPROVED: "active",
  PURCHASE_COMPLETE: "active",
  PURCHASE_DELAYED: "past_due",
  SUBSCRIPTION_CANCELLATION: "cancelled",
  PURCHASE_EXPIRED: "cancelled",
  PURCHASE_REFUNDED: "refunded",
  PURCHASE_CHARGEBACK: "chargeback",
  SWITCH_PLAN: "plan_change",
};

export const ECONOMIC_KIND: Record<string, EconomicKind> = {
  PURCHASE_APPROVED: "sale",
  PURCHASE_COMPLETE: "sale",
  PURCHASE_REFUNDED: "refund",
  PURCHASE_CHARGEBACK: "chargeback",
};

/** Un reembolso/contracargo no se revierte con un aviso de compra reentregado de ESA misma transacción. */
export function canTransition(from: string | null, to: MembershipStatus, sameTransactionRefunded: boolean): boolean {
  if (from === "disabled") return false; // el dueño la desactivó a mano: un pago no la reactiva solo
  if ((from === "refunded" || from === "chargeback") && to === "active" && sameTransactionRefunded) return false;
  return true;
}
