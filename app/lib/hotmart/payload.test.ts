import { describe, expect, it } from "vitest";
import { canTransition, intervalFromPlan, normalize } from "./payload";

const aprobada = {
  id: "evt-1", event: "PURCHASE_APPROVED", creation_date: 1791400000000,
  data: {
    product: { id: 555 },
    buyer: { email: " Profe@Correo.com ", name: "Ana Pérez" },
    purchase: { transaction: "HP123", approved_date: 1791400000000, price: { value: 7, currency_value: "usd" }, offer: { code: "abc" }, origin: { src: "meta", sck: "x" } },
    commissions: [{ source: "MARKETPLACE", value: 0.9 }, { source: "AFFILIATE", value: 1.2 }],
    subscription: { plan: { name: "Plan mensual" }, subscriber: { code: "SUB1" }, date_next_charge: 1794000000000 },
  },
};

describe("normalize", () => {
  it("lee los campos clave y los deja en formato propio", () => {
    const e = normalize(aprobada)!;
    expect(e.eventId).toBe("evt-1");
    expect(e.email).toBe("profe@correo.com");
    expect(e.productId).toBe("555");
    expect(e.amountMinor).toBe(700);
    expect(e.currency).toBe("USD");
    expect(e.providerFeeMinor).toBe(90);
    expect(e.affiliateFeeMinor).toBe(120);
    expect(e.source).toBe("meta");
    expect(e.subscriberCode).toBe("SUB1");
    expect(e.intervalMonths).toBe(1);
  });
  it("no cuenta una comisión que viene en otra moneda que el cobro", () => {
    const e = normalize({ ...aprobada, data: { ...aprobada.data, commissions: [{ source: "MARKETPLACE", value: 0.65, currency_value: "USD" }] } })!;
    expect(e.currency).toBe("USD");
    const otra = normalize({ ...aprobada, data: { ...aprobada.data, purchase: { ...aprobada.data.purchase, price: { value: 27, currency_value: "PEN" } }, commissions: [{ source: "MARKETPLACE", value: 0.65, currency_value: "USD" }] } })!;
    expect(otra.providerFeeMinor).toBeNull();
  });
  it("rechaza lo que no es un aviso", () => {
    expect(normalize(null)).toBeNull();
    expect(normalize("hola")).toBeNull();
    expect(normalize({ data: {} })).toBeNull();
  });
  it("sin id usa un compuesto estable (el mismo aviso da siempre el mismo id)", () => {
    const sinId = { ...aprobada, id: undefined };
    expect(normalize(sinId)!.eventId).toBe(normalize(sinId)!.eventId);
  });
  it("tolera campos que faltan sin inventar datos", () => {
    const e = normalize({ event: "PURCHASE_REFUNDED", data: {} })!;
    expect(e.amountMinor).toBeNull();
    expect(e.email).toBeNull();
    expect(e.productId).toBeNull();
  });
});

describe("plan anual", () => {
  it("lo detecta por el nombre del plan", () => {
    expect(intervalFromPlan("Plan Anual")).toBe(12);
    expect(intervalFromPlan("Mensual")).toBe(1);
    expect(intervalFromPlan(null)).toBe(1);
  });
});

describe("canTransition", () => {
  it("no resucita un reembolso con el aviso de compra de esa misma transacción", () => {
    expect(canTransition("refunded", "active", true)).toBe(false);
    expect(canTransition("chargeback", "active", true)).toBe(false);
  });
  it("sí permite una compra nueva de quien reembolsó antes", () => {
    expect(canTransition("refunded", "active", false)).toBe(true);
  });
  it("un pago no reactiva a quien el dueño desactivó a mano", () => {
    expect(canTransition("disabled", "active", false)).toBe(false);
  });
});
