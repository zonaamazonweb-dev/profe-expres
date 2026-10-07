import { describe, expect, it } from "vitest";
import {
  activation, aiSummary, buildAlerts, channelEconomics, churnSummary, currWeekly, ghostPayers, makeRange,
  mrrByCurrency, profitSummary, retentionDn, salesSummary, webhookHealth, groupErrors, DAY_MS,
} from "./metrics";
import { formatMoney, majorToMinor } from "./format";
import type { AiCallRow, EventRow, MembershipEventRow, ProfileRow, SpendRow, TxRow } from "./types";

const NOW = Date.parse("2026-10-30T12:00:00Z");
const iso = (daysAgo: number) => new Date(NOW - daysAgo * DAY_MS).toISOString();
const range = makeRange(30, NOW);

const profile = (o: Partial<ProfileRow> & { id: string }): ProfileRow => ({
  email: `${o.id}@x.com`, full_name: null, role: "user", status: "active", access_origin: "hotmart", source: null,
  first_paid_at: null, cancelled_at: null, cancel_kind: null, last_seen_at: null, created_at: iso(60), ...o,
});
const tx = (o: Partial<TxRow> & { transaction_id: string }): TxRow => ({
  provider: "hotmart", economic_kind: "sale", user_id: null, source: null, amount_minor: 1999, currency: "USD",
  provider_fee_minor: null, affiliate_fee_minor: null, tax_minor: null, occurred_at: iso(5), interval_months: 1, ...o,
});

describe("ventas", () => {
  it("separa bruto, reembolsos y neto por moneda sin mezclarlas", () => {
    const s = salesSummary([
      tx({ transaction_id: "a", amount_minor: 2000 }),
      tx({ transaction_id: "b", amount_minor: 3000 }),
      tx({ transaction_id: "c", economic_kind: "refund", amount_minor: 2000 }),
      tx({ transaction_id: "d", currency: "BRL", amount_minor: 9900 }),
      tx({ transaction_id: "viejo", amount_minor: 5000, occurred_at: iso(90) }),
    ], range);
    const usd = s.find((x) => x.currency === "USD")!;
    expect(usd).toMatchObject({ gross: 5000, refunds: 2000, net: 3000, sales: 2, refundCount: 1 });
    expect(s.find((x) => x.currency === "BRL")!.gross).toBe(9900);
  });

  it("MRR: el plan anual se reparte en 12 y solo cuentan cuentas pagas vigentes", () => {
    const profiles = [profile({ id: "u1" }), profile({ id: "u2" }), profile({ id: "u3", status: "cancelled" }), profile({ id: "u4", access_origin: "manual" })];
    const mrr = mrrByCurrency(profiles, [
      tx({ transaction_id: "1", user_id: "u1", amount_minor: 1500 }),
      tx({ transaction_id: "2", user_id: "u2", amount_minor: 12000, interval_months: 12 }),
      tx({ transaction_id: "3", user_id: "u3", amount_minor: 1500 }),
      tx({ transaction_id: "4", user_id: "u4", amount_minor: 1500 }),
    ]);
    expect(mrr).toEqual({ USD: 1500 + 1000 });
  });

  it("sin ventas no hay números: devuelve vacío (la pantalla dice «Sin datos»)", () => {
    expect(salesSummary([], range)).toEqual([]);
    expect(mrrByCurrency([], [])).toEqual({});
  });
});

describe("bajas (churn)", () => {
  it("separa voluntarias de involuntarias y calcula la tasa sobre las activas al inicio", () => {
    const profiles = [
      ...["a", "b", "c", "d"].map((id) => profile({ id, first_paid_at: iso(60) })),
      profile({ id: "nueva", first_paid_at: iso(3) }),
    ];
    const ev = (user_id: string, churn_kind: MembershipEventRow["churn_kind"], d = 4): MembershipEventRow =>
      ({ user_id, from_status: "active", to_status: "cancelled", churn_kind, origin: "hotmart", occurred_at: iso(d) });
    const c = churnSummary([ev("a", "voluntary"), ev("b", "involuntary"), ev("c", null), ev("d", "voluntary", 90)], profiles, range);
    expect(c).toMatchObject({ activeAtStart: 4, voluntary: 1, involuntary: 1, unclassified: 1 });
    expect(c.rate).toBeCloseTo(3 / 4);
    expect(c.involuntaryShare).toBeCloseTo(1 / 3);
  });

  it("sin base de clientas la tasa es null, no 0%", () => {
    expect(churnSummary([], [], range).rate).toBeNull();
  });
});

describe("ganancia real", () => {
  it("resta Hotmart, afiliado, impuestos, IA, infra y email; y rotula ESTIMACIÓN mientras falten datos", () => {
    const txs = [
      tx({ transaction_id: "1", amount_minor: 10000, provider_fee_minor: 1000, affiliate_fee_minor: 2000, tax_minor: 500 }),
      tx({ transaction_id: "2", amount_minor: 10000, provider_fee_minor: 1000, affiliate_fee_minor: 0, tax_minor: 500 }),
    ];
    const ai: AiCallRow[] = [{ user_id: null, feature: "ficha", model: "m", tokens_in: 1, tokens_out: 1, cost_usd: 1.5, latency_ms: 1, status: "ok", created_at: iso(2) }];
    const costs = [
      { id: 1, kind: "infra" as const, amount_minor: 3000, currency: "USD", period_start: "2026-10-01", period_end: "2026-10-30", note: null },
      { id: 2, kind: "email" as const, amount_minor: 600, currency: "USD", period_start: "2026-10-01", period_end: "2026-10-30", note: null },
    ];
    const [p] = profitSummary({ txs, aiCalls: ai, costs, range: makeRange(30, NOW) });
    expect(p.income).toBe(20000);
    // 20000 − (2000 hotmart + 2000 afiliado + 1000 impuestos + 150 IA + infra + email prorrateados)
    expect(p.ai).toBe(150);
    expect(p.providerFees).toBe(2000);
    expect(p.infra + p.email).toBeGreaterThan(3000); // casi todo el mes entra en el rango
    expect(p.profit).toBe(20000 - 2000 - 2000 - 1000 - 150 - p.infra - p.email);
    expect(p.margin).toBeCloseTo(p.profit / 20000);
    expect(p.assumptions.join(" ")).toContain("estimación");
  });

  it("si la venta es en otra moneda, la IA en USD NO se resta a ciegas", () => {
    const [p] = profitSummary({
      txs: [tx({ transaction_id: "1", currency: "BRL", amount_minor: 10000, provider_fee_minor: 0, affiliate_fee_minor: 0, tax_minor: 0 })],
      aiCalls: [{ user_id: null, feature: "ficha", model: "m", tokens_in: 1, tokens_out: 1, cost_usd: 2, latency_ms: 1, status: "ok", created_at: iso(1) }],
      costs: [], range,
    });
    expect(p.ai).toBeNull();
    expect(p.assumptions.join(" ")).toContain("tipo de cambio");
  });
});

describe("IA", () => {
  it("suma costo real, gasto de hoy y agrupa por feature y por usuaria", () => {
    const mk = (feature: string, user_id: string | null, cost: number, d: number): AiCallRow =>
      ({ user_id, feature, model: "m", tokens_in: 1, tokens_out: 1, cost_usd: cost, latency_ms: 10, status: "ok", created_at: iso(d) });
    const s = aiSummary([mk("ficha", "u1", 0.02, 0.01), mk("ficha", "u1", 0.03, 1), mk("otra", null, 0.1, 2)], range, NOW);
    expect(s.totalUsd).toBeCloseTo(0.15);
    expect(s.todayUsd).toBeCloseTo(0.02);
    expect(s.byFeature[0]).toMatchObject({ feature: "otra" });
    expect(s.byUser.find((u) => u.userId === "u1")?.calls).toBe(2);
  });
});

describe("uso", () => {
  const users = [profile({ id: "u1", created_at: iso(10) }), profile({ id: "u2", created_at: iso(10) }), profile({ id: "joven", created_at: iso(1) })];
  const ev = (user_id: string, type: string, d: number): EventRow => ({ type, user_id, channel: null, created_at: iso(d) });

  it("activación = quienes hicieron su primera ficha", () => {
    const a = activation(users, [ev("u1", "ficha_generada", 5)]);
    expect(a).toMatchObject({ activated: 1, total: 3 });
  });

  it("retención D1/D7 solo evalúa cuentas con antigüedad suficiente", () => {
    const events = [ev("u1", "sesion_iniciada", 9), ev("u1", "sesion_iniciada", 3)]; // creada hace 10 → día 1 = hace 9; día 7 = hace 3
    expect(retentionDn(users, events, 1, NOW)).toMatchObject({ eligible: 2, retained: 1, rate: 0.5 });
    expect(retentionDn(users, events, 7, NOW)).toMatchObject({ eligible: 2, retained: 1 });
    expect(retentionDn(users, events, 30, NOW).rate).toBeNull();
  });

  it("CURR semanal y pagadoras fantasma", () => {
    const events = [ev("u1", "sesion_iniciada", 10), ev("u2", "sesion_iniciada", 9), ev("u1", "sesion_iniciada", 2)];
    expect(currWeekly(events, NOW)).toMatchObject({ base: 2, returned: 1, rate: 0.5 });
    const g = ghostPayers([profile({ id: "g", last_seen_at: iso(20) }), profile({ id: "ok", last_seen_at: iso(2) }), profile({ id: "nueva", created_at: iso(3) })], NOW);
    expect(g.map((p) => p.id)).toEqual(["g"]);
  });
});

describe("negocio por canal", () => {
  it("CAC, LTV, ratio y payback", () => {
    const profiles = [
      ...["a", "b", "c", "d"].map((id) => profile({ id, source: "ads_meta", first_paid_at: iso(60) })),
      profile({ id: "e", source: "ads_meta", first_paid_at: iso(5) }),
      profile({ id: "f", source: "ads_meta", first_paid_at: iso(60), status: "cancelled", cancelled_at: iso(10) }),
    ];
    const txs = ["a", "b", "c", "d", "e"].map((u, i) => tx({ transaction_id: `t${i}`, user_id: u, amount_minor: 2000, source: "ads_meta" }));
    const spends: SpendRow[] = [{ id: 1, channel: "ads_meta", amount_minor: 6000, currency: "USD", period_start: "2026-09-30", period_end: "2026-10-29", note: null }];
    const [row] = channelEconomics({ profiles, txs: [...txs, tx({ transaction_id: "tf", user_id: "f", amount_minor: 2000 })], spends, range });
    expect(row).toMatchObject({ channel: "ads_meta", currency: "USD", newCustomers: 1, activeCustomers: 5 });
    expect(row.arpu).toBeCloseTo(2000);
    expect(row.cac).toBeGreaterThan(0);
    expect(row.ltv).not.toBeNull();
    expect(row.ratio).toBeCloseTo((row.ltv as number) / (row.cac as number));
    expect(row.paybackMonths).toBeCloseTo((row.cac as number) / 2000);
  });

  it("sin cancelaciones no inventa un LTV infinito", () => {
    const [row] = channelEconomics({
      profiles: [profile({ id: "a", source: "x", first_paid_at: iso(60) })],
      txs: [tx({ transaction_id: "t", user_id: "a" })], spends: [], range,
    });
    expect(row.ltv).toBeNull();
    expect(row.ratio).toBeNull();
  });
});

describe("avisos", () => {
  const base = {
    profit: [], ai: aiSummary([], range, NOW), incomeUsd: 0,
    churn: { activeAtStart: 0, voluntary: 0, involuntary: 0, unclassified: 0, refunded: 0, rate: null, involuntaryShare: null },
    channels: [], errors: [], errorsLast24h: 0, errorsPrev24h: 0, webhook: webhookHealth([], NOW),
  };

  it("sin problemas no hay avisos", () => expect(buildAlerts(base)).toEqual([]));

  it("IA cara: se dispara por encima del 20% de los ingresos", () => {
    const ai = { ...base.ai, totalUsd: 30 };
    expect(buildAlerts({ ...base, ai, incomeUsd: 10000 }).map((a) => a.id)).toContain("ia-cara"); // 30 / 100 = 30%
    expect(buildAlerts({ ...base, ai, incomeUsd: 50000 }).map((a) => a.id)).not.toContain("ia-cara"); // 30 / 500 = 6%
  });

  it("webhook fallando, canal que pierde, margen negativo y churn involuntario", () => {
    const webhook = webhookHealth(
      [1, 2, 3].map((n) => ({ result: "error" as const, type: "PURCHASE_APPROVED", received_at: iso(n / 10) })), NOW);
    const ids = buildAlerts({
      ...base, webhook,
      channels: [{ channel: "ads", currency: "USD", newCustomers: 1, activeCustomers: 1, spend: 1, cac: 1, arpu: 1, monthlyChurn: 1, ltv: 0.5, ratio: 0.5, paybackMonths: 1 }],
      profit: [{ currency: "USD", income: 100, providerFees: 0, affiliateFees: 0, taxes: 0, ai: 0, infra: 200, email: 0, other: 0, profit: -100, margin: -1, assumptions: [] }],
      churn: { ...base.churn, voluntary: 1, involuntary: 4, involuntaryShare: 0.8 },
    }).map((a) => a.id);
    expect(ids).toEqual(expect.arrayContaining(["webhook-fallando", "canal-ads-USD", "margen-USD", "churn-involuntario"]));
  });

  it("errores agrupados por huella, el más frecuente primero", () => {
    const g = groupErrors([
      { message: "A", context: "x", fingerprint: "f1", created_at: iso(1) },
      { message: "B", context: "y", fingerprint: "f2", created_at: iso(1) },
      { message: "B", context: "y", fingerprint: "f2", created_at: iso(2) },
    ], range);
    expect(g.map((e) => [e.fingerprint, e.count])).toEqual([["f2", 2], ["f1", 1]]);
  });
});

describe("dinero", () => {
  it("convierte a unidad menor y formatea con su moneda", () => {
    expect(majorToMinor(19.99, "USD")).toBe(1999);
    expect(majorToMinor(1500, "COP")).toBe(150000); // Intl usa 2 decimales para COP
    expect(formatMoney(1999, "USD")).toContain("USD");
  });
});
