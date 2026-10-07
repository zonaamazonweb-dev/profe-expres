/** Formato de números para el panel. El dinero SIEMPRE lleva su moneda; nunca se mezclan monedas. */

export function minorUnitDigits(currency: string): number {
  return new Intl.NumberFormat("en", { style: "currency", currency }).resolvedOptions().maximumFractionDigits ?? 2;
}

export function minorToMajor(amountMinor: number, currency: string): number {
  return amountMinor / 10 ** minorUnitDigits(currency);
}

export function majorToMinor(amountMajor: number, currency: string): number {
  return Math.round(amountMajor * 10 ** minorUnitDigits(currency));
}

export function formatMoney(amountMinor: number, currency: string): string {
  return new Intl.NumberFormat("es", { style: "currency", currency, currencyDisplay: "code" })
    .format(minorToMajor(amountMinor, currency))
    .replace(/ /g, " ");
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("es", { style: "currency", currency: "USD", currencyDisplay: "code", maximumFractionDigits: amount < 1 ? 4 : 2 })
    .format(amount)
    .replace(/ /g, " ");
}

export function formatPct(value: number | null, digits = 0): string {
  return value == null ? "Sin datos" : `${(value * 100).toFixed(digits)}%`;
}

export function formatInt(value: number): string {
  return new Intl.NumberFormat("es").format(value);
}

export function formatDate(iso: string | null | undefined): string {
  return iso ? new Date(iso).toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" }) : "—";
}

export function timeAgo(iso: string | null | undefined, now = new Date()): string {
  if (!iso) return "Nunca";
  const diffMs = now.getTime() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "Ahora";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  return d === 1 ? "ayer" : `hace ${d} días`;
}

export function monthBounds(now: number = Date.now()): { start: string; end: string } {
  const d = new Date(now);
  const first = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
  const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0));
  return { start: first.toISOString().slice(0, 10), end: last.toISOString().slice(0, 10) };
}

export function deltaText(current: number, previous: number | null): { text: string; tono: "bueno" | "malo" | "neutro" } {
  if (previous == null || previous === 0) return { text: current > 0 ? "Sin periodo anterior para comparar" : "Sin datos del periodo anterior", tono: "neutro" };
  const pct = ((current - previous) / previous) * 100;
  const arrow = pct >= 0 ? "↑" : "↓";
  return { text: `${arrow} ${Math.abs(pct).toFixed(0)}% frente al periodo anterior`, tono: pct >= 0 ? "bueno" : "malo" };
}
