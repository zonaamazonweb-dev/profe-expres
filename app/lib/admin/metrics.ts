/** Métricas del panel: funciones PURAS (reciben datos y la hora; no leen nada ni inventan nada). */
import type {
  AiCallRow, CostRow, ErrorRow, EventRow, MembershipEventRow, ProfileRow, Range, SpendRow, TxRow, WebhookRow,
} from "./types";

export const DAY_MS = 86_400_000;

export function makeRange(days: number, now: number = Date.now()): Range {
  return { start: new Date(now - days * DAY_MS), end: new Date(now) };
}

export function previousRange(r: Range): Range {
  const len = r.end.getTime() - r.start.getTime();
  return { start: new Date(r.start.getTime() - len), end: new Date(r.start.getTime()) };
}

const inRange = (iso: string, r: Range) => {
  const t = new Date(iso).getTime();
  return t >= r.start.getTime() && t < r.end.getTime();
};

export function dayKey(iso: string | Date): string {
  return (typeof iso === "string" ? new Date(iso) : iso).toISOString().slice(0, 10);
}

export function seenWithinDays(rows: Array<{ last_seen_at: string | null }>, days: number, now: number = Date.now()): number {
  const limit = now - days * DAY_MS;
  return rows.filter((r) => r.last_seen_at && new Date(r.last_seen_at).getTime() > limit).length;
}

/** Serie diaria continua (días sin datos = 0) para que los gráficos no mientan por huecos. */
export function fillDays(range: Range, byDay: Map<string, number>): Array<{ day: string; value: number }> {
  const out: Array<{ day: string; value: number }> = [];
  for (let t = Date.UTC(range.start.getUTCFullYear(), range.start.getUTCMonth(), range.start.getUTCDate()); t <= range.end.getTime(); t += DAY_MS) {
    const key = new Date(t).toISOString().slice(0, 10);
    out.push({ day: key, value: byDay.get(key) ?? 0 });
  }
  return out;
}

/* ───────────────────────────── VENTAS ───────────────────────────── */

export interface SalesByCurrency {
  currency: string;
  gross: number;
  refunds: number;
  net: number;
  sales: number;
  refundCount: number;
  series: Array<{ day: string; value: number }>;
}

export function salesSummary(txs: TxRow[], range: Range): SalesByCurrency[] {
  const map = new Map<string, { gross: number; refunds: number; sales: number; refundCount: number; byDay: Map<string, number> }>();
  for (const t of txs) {
    if (!inRange(t.occurred_at, range)) continue;
    const m = map.get(t.currency) ?? { gross: 0, refunds: 0, sales: 0, refundCount: 0, byDay: new Map() };
    if (t.economic_kind === "sale") {
      m.gross += t.amount_minor;
      m.sales += 1;
      const k = dayKey(t.occurred_at);
      m.byDay.set(k, (m.byDay.get(k) ?? 0) + t.amount_minor);
    } else {
      m.refunds += t.amount_minor;
      m.refundCount += 1;
    }
    map.set(t.currency, m);
  }
  return [...map.entries()]
    .map(([currency, m]) => ({
      currency, gross: m.gross, refunds: m.refunds, net: m.gross - m.refunds, sales: m.sales,
      refundCount: m.refundCount, series: fillDays(range, m.byDay),
    }))
    .sort((a, b) => b.gross - a.gross);
}

/** MRR = lo que entra cada mes de las cuentas pagas vigentes. Un plan anual se reparte en 12 (nunca entero). */
export function mrrByCurrency(profiles: ProfileRow[], txs: TxRow[]): Record<string, number> {
  const paying = new Set(
    profiles.filter((p) => p.access_origin === "hotmart" && (p.status === "active" || p.status === "past_due")).map((p) => p.id),
  );
  const latest = new Map<string, TxRow>();
  for (const t of txs) {
    if (t.economic_kind !== "sale" || !t.user_id || !paying.has(t.user_id)) continue;
    const prev = latest.get(t.user_id);
    if (!prev || new Date(t.occurred_at) > new Date(prev.occurred_at)) latest.set(t.user_id, t);
  }
  const out: Record<string, number> = {};
  for (const t of latest.values()) out[t.currency] = (out[t.currency] ?? 0) + Math.round(t.amount_minor / Math.max(1, t.interval_months));
  return out;
}

export interface ChurnSummary {
  activeAtStart: number;
  voluntary: number;
  involuntary: number;
  unclassified: number;
  refunded: number;
  rate: number | null;
  involuntaryShare: number | null;
}

export function churnSummary(events: MembershipEventRow[], profiles: ProfileRow[], range: Range): ChurnSummary {
  const hotmartIds = new Set(profiles.filter((p) => p.access_origin === "hotmart").map((p) => p.id));
  let voluntary = 0, involuntary = 0, unclassified = 0, refunded = 0;
  for (const e of events) {
    if (!hotmartIds.has(e.user_id) || !inRange(e.occurred_at, range)) continue;
    if (e.to_status === "cancelled") {
      if (e.churn_kind === "voluntary") voluntary++;
      else if (e.churn_kind === "involuntary") involuntary++;
      else unclassified++;
    } else if (e.to_status === "refunded" || e.to_status === "chargeback") refunded++;
  }
  const startMs = range.start.getTime();
  const activeAtStart = profiles.filter((p) => {
    if (p.access_origin !== "hotmart") return false;
    const from = new Date(p.first_paid_at ?? p.created_at).getTime();
    const to = p.cancelled_at ? new Date(p.cancelled_at).getTime() : Infinity;
    return from <= startMs && to > startMs;
  }).length;
  const churned = voluntary + involuntary + unclassified;
  return {
    activeAtStart, voluntary, involuntary, unclassified, refunded,
    rate: activeAtStart > 0 ? churned / activeAtStart : null,
    involuntaryShare: churned > 0 ? involuntary / churned : null,
  };
}

/* ─────────────────────────── GANANCIA REAL ─────────────────────────── */

function overlapFraction(startIso: string, endIso: string, range: Range): number {
  const s = Date.parse(startIso + "T00:00:00Z");
  const e = Date.parse(endIso + "T00:00:00Z") + DAY_MS; // el último día cuenta completo
  const o = Math.min(e, range.end.getTime()) - Math.max(s, range.start.getTime());
  return o <= 0 ? 0 : o / (e - s);
}

export interface ProfitLine {
  currency: string;
  income: number;       // ventas − reembolsos
  providerFees: number;
  affiliateFees: number;
  taxes: number;
  ai: number | null;    // null = no restable (moneda distinta de USD)
  infra: number;
  email: number;
  other: number;
  profit: number;
  margin: number | null;
  /** Qué falta o se supuso: mientras exista algo aquí, el número es una ESTIMACIÓN. */
  assumptions: string[];
}

export function profitSummary(args: { txs: TxRow[]; aiCalls: AiCallRow[]; costs: CostRow[]; range: Range }): ProfitLine[] {
  const { txs, aiCalls, costs, range } = args;
  const aiUsd = aiCalls.filter((c) => inRange(c.created_at, range)).reduce((a, c) => a + (c.cost_usd ?? 0), 0);
  const aiMissingCost = aiCalls.some((c) => inRange(c.created_at, range) && c.status === "ok" && c.cost_usd == null);
  const lines: ProfitLine[] = [];
  const currencies = new Set<string>();
  txs.forEach((t) => inRange(t.occurred_at, range) && currencies.add(t.currency));

  for (const currency of currencies) {
    const inR = txs.filter((t) => t.currency === currency && inRange(t.occurred_at, range));
    const sales = inR.filter((t) => t.economic_kind === "sale");
    const refunds = inR.filter((t) => t.economic_kind !== "sale");
    const income = sales.reduce((a, t) => a + t.amount_minor, 0) - refunds.reduce((a, t) => a + t.amount_minor, 0);
    const providerFees = sales.reduce((a, t) => a + (t.provider_fee_minor ?? 0), 0);
    const affiliateFees = sales.reduce((a, t) => a + (t.affiliate_fee_minor ?? 0), 0);
    const taxesTx = sales.reduce((a, t) => a + (t.tax_minor ?? 0), 0);

    const manual = (kind: CostRow["kind"]) =>
      costs.filter((c) => c.currency === currency && c.kind === kind)
        .reduce((a, c) => a + Math.round(c.amount_minor * overlapFraction(c.period_start, c.period_end, range)), 0);
    const infra = manual("infra"), email = manual("email"), other = manual("other"), taxManual = manual("tax");
    const taxes = taxesTx + taxManual;

    const assumptions: string[] = [];
    if (sales.some((t) => t.provider_fee_minor == null)) assumptions.push("Falta la tarifa real de Hotmart en alguna venta (se tomó como 0).");
    if (sales.some((t) => t.affiliate_fee_minor == null)) assumptions.push("Falta la comisión de afiliado en alguna venta (se tomó como 0).");
    if (taxes === 0) assumptions.push("No hay impuestos registrados: anótalos en «Ganancia real» si aplican.");
    if (infra === 0) assumptions.push("No registraste el costo de servidores (Vercel, Supabase) de este periodo.");
    if (email === 0) assumptions.push("No registraste el costo de emails (Resend) de este periodo.");

    let ai: number | null = 0;
    if (aiUsd > 0) {
      if (currency === "USD") ai = Math.round(aiUsd * 100);
      else { ai = null; assumptions.push(`El gasto de IA (${aiUsd.toFixed(2)} USD) no se pudo restar: tus ventas están en ${currency} y no hay tipo de cambio.`); }
    }
    if (aiMissingCost) assumptions.push("Alguna llamada de IA no trae su costo (revisa el precio configurado del modelo).");
    assumptions.push("Aún no se concilia con la liquidación de Hotmart: es una estimación, no un cierre contable.");

    const costsTotal = providerFees + affiliateFees + taxes + (ai ?? 0) + infra + email + other;
    const profit = income - costsTotal;
    lines.push({ currency, income, providerFees, affiliateFees, taxes, ai, infra, email, other, profit, margin: income > 0 ? profit / income : null, assumptions });
  }
  return lines.sort((a, b) => b.income - a.income);
}

/* ────────────────────────────── IA ────────────────────────────── */

export interface AiSummary {
  totalUsd: number;
  todayUsd: number;
  calls: number;
  errors: number;
  avgCostUsd: number | null;
  series: Array<{ day: string; value: number }>;
  byFeature: Array<{ feature: string; calls: number; costUsd: number }>;
  byUser: Array<{ userId: string | null; calls: number; costUsd: number }>;
}

export function aiSummary(calls: AiCallRow[], range: Range, now: number = Date.now()): AiSummary {
  const inR = calls.filter((c) => inRange(c.created_at, range));
  const byDay = new Map<string, number>();
  const feat = new Map<string, { calls: number; costUsd: number }>();
  const usr = new Map<string | null, { calls: number; costUsd: number }>();
  let totalUsd = 0, errors = 0, costed = 0;
  const today = dayKey(new Date(now));
  let todayUsd = 0;
  for (const c of inR) {
    const cost = c.cost_usd ?? 0;
    totalUsd += cost;
    if (c.cost_usd != null) costed++;
    if (c.status !== "ok") errors++;
    byDay.set(dayKey(c.created_at), (byDay.get(dayKey(c.created_at)) ?? 0) + cost);
    if (dayKey(c.created_at) === today) todayUsd += cost;
    const f = feat.get(c.feature) ?? { calls: 0, costUsd: 0 }; f.calls++; f.costUsd += cost; feat.set(c.feature, f);
    const u = usr.get(c.user_id) ?? { calls: 0, costUsd: 0 }; u.calls++; u.costUsd += cost; usr.set(c.user_id, u);
  }
  return {
    totalUsd, todayUsd, calls: inR.length, errors,
    avgCostUsd: costed > 0 ? totalUsd / costed : null,
    series: fillDays(range, byDay),
    byFeature: [...feat.entries()].map(([feature, v]) => ({ feature, ...v })).sort((a, b) => b.costUsd - a.costUsd),
    byUser: [...usr.entries()].map(([userId, v]) => ({ userId, ...v })).sort((a, b) => b.costUsd - a.costUsd),
  };
}

/* ─────────────────────── USO, ACTIVACIÓN, RETENCIÓN ─────────────────────── */

export const ACTION_EVENT = "ficha_generada";
export const SESSION_EVENT = "sesion_iniciada";
const ACTIVITY = new Set([ACTION_EVENT, SESSION_EVENT]);

/** Cuentas que cuentan para el producto (no la del dueño, no las desactivadas). */
export function productUsers(profiles: ProfileRow[]): ProfileRow[] {
  return profiles.filter((p) => p.role !== "admin" && p.status !== "disabled");
}

export function activation(users: ProfileRow[], events: EventRow[]): { rate: number | null; activated: number; total: number } {
  const did = new Set(events.filter((e) => e.type === ACTION_EVENT && e.user_id).map((e) => e.user_id));
  const activated = users.filter((u) => did.has(u.id)).length;
  return { rate: users.length > 0 ? activated / users.length : null, activated, total: users.length };
}

/** Retención al día N: de las cuentas con ≥N días de antigüedad, ¿cuántas volvieron justo el día N? */
export function retentionDn(users: ProfileRow[], events: EventRow[], n: number, now: number = Date.now()) {
  const byUser = new Map<string, number[]>();
  for (const e of events) {
    if (!e.user_id || !ACTIVITY.has(e.type)) continue;
    const arr = byUser.get(e.user_id) ?? [];
    arr.push(new Date(e.created_at).getTime());
    byUser.set(e.user_id, arr);
  }
  let eligible = 0, retained = 0;
  for (const u of users) {
    const t0 = new Date(u.created_at).getTime();
    if (now - t0 < (n + 1) * DAY_MS) continue;
    eligible++;
    const from = t0 + n * DAY_MS, to = from + DAY_MS;
    if ((byUser.get(u.id) ?? []).some((t) => t >= from && t < to)) retained++;
  }
  return { eligible, retained, rate: eligible > 0 ? retained / eligible : null };
}

/** CURR semanal: de las activas la semana pasada, qué parte volvió esta semana. */
export function currWeekly(events: EventRow[], now: number = Date.now()): { rate: number | null; base: number; returned: number } {
  const weekAgo = now - 7 * DAY_MS, twoWeeks = now - 14 * DAY_MS;
  const prev = new Set<string>(), cur = new Set<string>();
  for (const e of events) {
    if (!e.user_id || !ACTIVITY.has(e.type)) continue;
    const t = new Date(e.created_at).getTime();
    if (t >= twoWeeks && t < weekAgo) prev.add(e.user_id);
    else if (t >= weekAgo && t <= now) cur.add(e.user_id);
  }
  const returned = [...prev].filter((id) => cur.has(id)).length;
  return { rate: prev.size > 0 ? returned / prev.size : null, base: prev.size, returned };
}

/** Pagadoras fantasma: pagan (activas por Hotmart) pero llevan 14+ días sin entrar. */
export function ghostPayers(profiles: ProfileRow[], now: number = Date.now()): ProfileRow[] {
  const limit = now - 14 * DAY_MS;
  return profiles.filter((p) => {
    if (p.access_origin !== "hotmart" || p.status !== "active" || p.role === "admin") return false;
    if (new Date(p.created_at).getTime() > limit) return false;
    return !p.last_seen_at || new Date(p.last_seen_at).getTime() < limit;
  });
}

export const FUNNEL_STEPS = [
  { type: "quiz_iniciado", label: "Empezaron el quiz" },
  { type: "quiz_completado", label: "Terminaron el quiz" },
  { type: "oferta_vista", label: "Llegaron a la oferta" },
  { type: "checkout_iniciado", label: "Fueron al pago de Hotmart" },
  { type: "primer_cobro_confirmado", label: "Pagaron" },
] as const;

export function funnel(events: EventRow[], range: Range): Array<{ type: string; label: string; count: number }> {
  return FUNNEL_STEPS.map((s) => ({
    type: s.type, label: s.label,
    count: events.filter((e) => e.type === s.type && inRange(e.created_at, range)).length,
  }));
}

export function mainActionCounts(events: EventRow[], now: number = Date.now()) {
  const c = (days: number) => events.filter((e) => e.type === ACTION_EVENT && new Date(e.created_at).getTime() > now - days * DAY_MS).length;
  const startOfDay = new Date(now); startOfDay.setUTCHours(0, 0, 0, 0);
  return {
    today: events.filter((e) => e.type === ACTION_EVENT && new Date(e.created_at) >= startOfDay).length,
    week: c(7), month: c(30),
  };
}

/* ─────────────────────── NEGOCIO: CAC, LTV, CANAL ─────────────────────── */

export interface ChannelEconomics {
  channel: string;
  currency: string;
  newCustomers: number;
  activeCustomers: number;
  spend: number;
  cac: number | null;
  arpu: number | null;       // ingreso mensual por clienta activa
  monthlyChurn: number | null;
  /** Bajas en que se apoya el cálculo: con pocas, el LTV es una pista, no una cifra firme. */
  churnSample: number;
  ltv: number | null;
  ratio: number | null;
  paybackMonths: number | null;
}

export function channelEconomics(args: { profiles: ProfileRow[]; txs: TxRow[]; spends: SpendRow[]; range: Range }): ChannelEconomics[] {
  const { profiles, txs, spends, range } = args;
  const hotmart = profiles.filter((p) => p.access_origin === "hotmart" && p.role !== "admin");
  const channelOf = (p: ProfileRow) => p.source ?? "directo";
  const channels = new Set<string>([...hotmart.map(channelOf), ...spends.map((s) => s.channel)]);

  // moneda de cada clienta = la de su última venta
  const lastTx = new Map<string, TxRow>();
  for (const t of txs) {
    if (t.economic_kind !== "sale" || !t.user_id) continue;
    const prev = lastTx.get(t.user_id);
    if (!prev || new Date(t.occurred_at) > new Date(prev.occurred_at)) lastTx.set(t.user_id, t);
  }
  const currencies = new Set<string>([...[...lastTx.values()].map((t) => t.currency), ...spends.map((s) => s.currency)]);

  const out: ChannelEconomics[] = [];
  for (const channel of channels) for (const currency of currencies) {
    const people = hotmart.filter((p) => channelOf(p) === channel && lastTx.get(p.id)?.currency === currency);
    const spendRows = spends.filter((s) => s.channel === channel && s.currency === currency);
    if (people.length === 0 && spendRows.length === 0) continue;
    const spend = spendRows.reduce((a, s) => a + Math.round(s.amount_minor * overlapFraction(s.period_start, s.period_end, range)), 0);
    const newCustomers = people.filter((p) => p.first_paid_at && inRange(p.first_paid_at, range)).length;
    const active = people.filter((p) => p.status === "active" || p.status === "past_due");
    const arpu = active.length > 0
      ? active.reduce((a, p) => { const t = lastTx.get(p.id)!; return a + t.amount_minor / Math.max(1, t.interval_months); }, 0) / active.length
      : null;
    const startMs = range.start.getTime();
    const activeAtStart = people.filter((p) => new Date(p.first_paid_at ?? p.created_at).getTime() <= startMs && (!p.cancelled_at || new Date(p.cancelled_at).getTime() > startMs)).length;
    const cancelled = people.filter((p) => p.cancelled_at && inRange(p.cancelled_at, range)).length;
    const days = Math.max(1, (range.end.getTime() - range.start.getTime()) / DAY_MS);
    const monthlyChurn = activeAtStart > 0 ? (cancelled / activeAtStart) * (30 / days) : null;
    const cac = newCustomers > 0 && spend > 0 ? spend / newCustomers : null;
    const ltv = arpu != null && monthlyChurn != null && monthlyChurn > 0 ? arpu / monthlyChurn : null;
    out.push({
      channel, currency, newCustomers, activeCustomers: active.length, spend, cac, arpu, monthlyChurn, churnSample: cancelled, ltv,
      ratio: ltv != null && cac != null ? ltv / cac : null,
      paybackMonths: cac != null && arpu != null && arpu > 0 ? cac / arpu : null,
    });
  }
  return out.sort((a, b) => b.spend - a.spend);
}

/* ───────────────────────────── SALUD ───────────────────────────── */

export function groupErrors(errors: ErrorRow[], range: Range) {
  const g = new Map<string, { fingerprint: string; message: string; context: string | null; count: number; last: string }>();
  for (const e of errors) {
    if (!inRange(e.created_at, range)) continue;
    const cur = g.get(e.fingerprint);
    if (cur) { cur.count++; if (e.created_at > cur.last) cur.last = e.created_at; }
    else g.set(e.fingerprint, { fingerprint: e.fingerprint, message: e.message, context: e.context, count: 1, last: e.created_at });
  }
  return [...g.values()].sort((a, b) => b.count - a.count);
}

export function webhookHealth(logs: WebhookRow[], now: number = Date.now()) {
  const last = logs.reduce<string | null>((m, l) => (!m || l.received_at > m ? l.received_at : m), null);
  const day = now - DAY_MS;
  const recent = logs.filter((l) => new Date(l.received_at).getTime() > day);
  const failed24h = recent.filter((l) => l.result === "error" || l.result === "illegal" || l.result === "unauthorized").length;
  const hoursSinceLast = last ? (now - new Date(last).getTime()) / 3_600_000 : null;
  return { total: logs.length, last, failed24h, applied24h: recent.filter((l) => l.result === "applied").length, hoursSinceLast };
}

/* ───────────────────────────── AVISOS ───────────────────────────── */

export type AlertTone = "malo" | "aviso" | "info";
export interface PanelAlert { id: string; tone: AlertTone; title: string; why: string; todo: string }

export interface AlertInput {
  profit: ProfitLine[];
  ai: AiSummary;
  incomeUsd: number; // ingresos netos USD, en centavos
  churn: ChurnSummary;
  channels: ChannelEconomics[];
  errors: ReturnType<typeof groupErrors>;
  errorsLast24h: number;
  errorsPrev24h: number;
  webhook: ReturnType<typeof webhookHealth>;
}

export function buildAlerts(i: AlertInput): PanelAlert[] {
  const alerts: PanelAlert[] = [];

  if (i.incomeUsd > 0 && i.ai.totalUsd > 0) {
    const share = i.ai.totalUsd / (i.incomeUsd / 100);
    if (share > 0.2) alerts.push({
      id: "ia-cara", tone: "malo",
      title: `La IA se está comiendo el ${Math.round(share * 100)}% de lo que cobras`,
      why: "Lo sano es menos del 20%. Cada ficha te deja menos margen de lo planeado.",
      todo: "Revisa los límites de uso por usuaria o sube el precio del plan.",
    });
  } else if (i.ai.totalUsd > 0 && i.incomeUsd === 0) {
    alerts.push({
      id: "ia-sin-ventas", tone: "info",
      title: `Llevas ${i.ai.totalUsd.toFixed(2)} USD gastados en IA y todavía no hay ventas`,
      why: "Mientras la app esté abierta al público, cualquiera con el enlace gasta tu saldo de IA.",
      todo: "Cuando el embudo y el login estén listos, solo podrán usarla quienes pagaron.",
    });
  }

  if (i.webhook.total > 0) {
    if (i.webhook.failed24h >= 3) alerts.push({
      id: "webhook-fallando", tone: "malo",
      title: `Hotmart te avisó ${i.webhook.failed24h} veces en el último día y falló`,
      why: "Los pagos podrían no estar dando acceso, o dárselo a quien no pagó.",
      todo: "Abre «Salud» para ver qué falló y revisa la conexión con Hotmart.",
    });
    else if (i.webhook.hoursSinceLast != null && i.webhook.hoursSinceLast > 24 * 3) alerts.push({
      id: "webhook-silencio", tone: "aviso",
      title: "Hace más de 3 días que Hotmart no te avisa de nada",
      why: "Si hubo ventas, es posible que el aviso de pago no esté llegando.",
      todo: "Compara con tus ventas en Hotmart. Si hay ventas sin acceso, agrégalas a mano en «Usuarias».",
    });
  }

  if (i.churn.involuntaryShare != null && i.churn.involuntaryShare > 0.4 && i.churn.involuntary >= 3) alerts.push({
    id: "churn-involuntario", tone: "aviso",
    title: `${Math.round(i.churn.involuntaryShare * 100)}% de las bajas son por pago fallido`,
    why: "Estás perdiendo clientas que sí querían seguir pagando.",
    todo: "Activa los recordatorios de cobro fallido: es la forma más barata de recuperarlas.",
  });

  for (const c of i.channels) if (c.ratio != null && c.ratio < 1) alerts.push({
    id: `canal-${c.channel}-${c.currency}`, tone: "malo",
    title: `El canal «${c.channel}» te trae clientas que cuestan más de lo que dejan`,
    why: `Por cada 1 que gastas, recuperas ${c.ratio.toFixed(2)}. Cada venta ahí te empobrece.`,
    todo: "Pausa el gasto en ese canal o mejora la retención de esas clientas.",
  });

  const top = i.errors[0];
  if (top && (top.count >= 5 || (i.errorsLast24h >= 5 && i.errorsLast24h > i.errorsPrev24h * 2))) alerts.push({
    id: "errores", tone: "aviso",
    title: `Un mismo error se repitió ${top.count} veces`,
    why: "Algo está fallando para varias personas.",
    todo: "Abre «Salud» y revisa el más frecuente primero.",
  });

  for (const p of i.profit) if (p.income > 0 && p.profit <= 0) alerts.push({
    id: `margen-${p.currency}`, tone: "malo",
    title: `En ${p.currency} estás perdiendo dinero este periodo`,
    why: "Vender más empeora el resultado mientras los costos superen lo que cobras.",
    todo: "Revisa «Ganancia real»: qué costo pesa más y si conviene subir el precio.",
  });

  return alerts;
}
