import Link from "next/link";
import type { ReactNode } from "react";

export function PageTitle({ titulo, sub, right }: { titulo: string; sub?: string; right?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-[26px] font-extrabold leading-tight sm:text-[30px]">{titulo}</h1>
        {sub && <p className="mt-1 max-w-2xl text-[13.5px] text-muted-foreground">{sub}</p>}
      </div>
      {right}
    </header>
  );
}

export function Section({ titulo, sub, children }: { titulo: string; sub?: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">{titulo}</h2>
      {sub && <p className="mt-0.5 text-[12.5px] text-muted-foreground">{sub}</p>}
      <div className="mt-2">{children}</div>
    </section>
  );
}

export function SinDatos({ children }: { children?: ReactNode }) {
  return (
    <p className="rounded-[20px] border-[1.5px] border-dashed border-border p-4 text-[13px] text-muted-foreground">
      <span className="font-extrabold text-foreground">Sin datos.</span> {children}
    </p>
  );
}

export type Tono = "neutro" | "bueno" | "malo" | "aviso";
const TONOS: Record<Tono, string> = { neutro: "var(--muted-foreground)", bueno: "#2F9E5B", malo: "#E5484D", aviso: "#B7791F" };

/** Grilla de datos: 2 columnas desde el celular (no una columna interminable). */
export function StatGrid({ children, cols = 4 }: { children: ReactNode; cols?: 2 | 3 | 4 }) {
  const lg = cols === 4 ? "xl:grid-cols-4" : cols === 3 ? "lg:grid-cols-3" : "";
  return <div className={`grid grid-cols-2 gap-2.5 sm:gap-3 ${lg}`}>{children}</div>;
}

/** Tarjeta de un dato héroe + insight en lenguaje claro. value=null → "Sin datos" (nunca se inventa). */
export function Stat({
  label, value, insight, tono = "neutro", hero = false, badge, span = false,
}: { label: string; value: string | null; insight?: string; tono?: Tono; hero?: boolean; badge?: string; span?: boolean }) {
  return (
    <div
      className={`flex min-w-0 flex-col rounded-[20px] bg-card p-3.5 shadow-[0_8px_20px_-14px_rgb(123_93_251_/_0.35)] sm:p-4 ${span ? "col-span-2 sm:col-span-1" : ""}`}
      style={hero ? { border: "1.5px solid color-mix(in oklab, var(--primary) 35%, transparent)" } : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11.5px] font-bold leading-snug text-muted-foreground">{label}</p>
        {badge && (
          <span className="shrink-0 rounded-full px-2 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wide"
            style={{ background: "color-mix(in oklab, #F5A623 22%, transparent)", color: "#8A5A00" }}>{badge}</span>
        )}
      </div>
      {value == null ? (
        <p className="font-display mt-1 text-[18px] font-extrabold text-muted-foreground">Sin datos</p>
      ) : (
        <p className={`font-display mt-1 whitespace-nowrap font-extrabold tabular-nums ${hero ? "text-[24px] sm:text-[32px]" : "text-[20px] sm:text-[26px]"}`}>{value}</p>
      )}
      {insight && <p className="mt-1 text-[12px] font-semibold leading-snug" style={{ color: TONOS[tono] }}>{insight}</p>}
    </div>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-[20px] bg-card p-4 shadow-[0_8px_20px_-14px_rgb(123_93_251_/_0.30)] ${className}`}>{children}</div>;
}

export const RANGOS = [
  { id: "7d", label: "7 días", days: 7 },
  { id: "30d", label: "30 días", days: 30 },
  { id: "90d", label: "90 días", days: 90 },
] as const;
export type RangoId = (typeof RANGOS)[number]["id"];

export function parseRango(value: string | undefined): (typeof RANGOS)[number] {
  return RANGOS.find((r) => r.id === value) ?? RANGOS[1];
}

export function RangeFilter({ base, actual }: { base: string; actual: RangoId }) {
  return (
    <div className="flex gap-1 rounded-full bg-card p-1" role="group" aria-label="Rango de fechas">
      {RANGOS.map((r) => (
        <Link
          key={r.id}
          href={`${base}?rango=${r.id}`}
          className="flex min-h-9 items-center rounded-full px-3.5 text-[12px] font-bold"
          style={r.id === actual ? { background: "var(--primary)", color: "#fff" } : { color: "var(--muted-foreground)" }}
        >
          {r.label}
        </Link>
      ))}
    </div>
  );
}

export interface AlertItem { id: string; tone: "malo" | "aviso" | "info"; title: string; why: string; todo: string; href?: string; cta?: string }

export function AlertsBanner({ alerts, hasData, hideHref, max = 3 }: { alerts: AlertItem[]; hasData: boolean; hideHref?: string; max?: number }) {
  if (alerts.length === 0) {
    return (
      <div role="status" className="flex items-start gap-3 rounded-[20px] p-4" style={{ background: "color-mix(in oklab, #2F9E5B 10%, var(--card))", border: "1.5px solid color-mix(in oklab, #2F9E5B 30%, transparent)" }}>
        <span className="text-[18px]" aria-hidden>✅</span>
        <div>
          <p className="text-[14px] font-extrabold">Todo en orden este mes</p>
          <p className="text-[12.5px] text-muted-foreground">
            {hasData ? "Ningún aviso necesita tu atención." : "Todavía no hay ventas ni uso suficientes para evaluar. Los avisos aparecen solos cuando algo lo necesite."}
          </p>
        </div>
      </div>
    );
  }
  const color = { malo: "#E5484D", aviso: "#B7791F", info: "#7B5DFB" } as const;
  const order = { malo: 0, aviso: 1, info: 2 } as const;
  const sorted = [...alerts].sort((a, b) => order[a.tone] - order[b.tone]);
  const visibles = sorted.slice(0, max);
  const resto = sorted.slice(max);
  const card = (a: AlertItem) => (
    <div key={a.id} className="rounded-[20px] bg-card p-4" style={{ borderLeft: `5px solid ${color[a.tone]}` }}>
      <p className="text-[14px] font-extrabold leading-snug">{a.title}</p>
      <p className="mt-1 text-[12.5px] text-muted-foreground"><b className="text-foreground">Por qué importa:</b> {a.why}</p>
      <p className="mt-0.5 text-[12.5px] text-muted-foreground"><b className="text-foreground">Qué hacer:</b> {a.todo}</p>
      {a.href && a.href !== hideHref && (
        <Link href={a.href} className="mt-2 inline-flex min-h-11 items-center text-[13px] font-extrabold" style={{ color: "var(--primary)" }}>
          {a.cta ?? "Ver detalle"} →
        </Link>
      )}
    </div>
  );
  return (
    <div className="flex flex-col gap-2" role="alert">
      {visibles.map(card)}
      {resto.length > 0 && (
        <details className="rounded-[20px] bg-card p-3">
          <summary className="min-h-11 cursor-pointer list-none text-[13px] font-extrabold" style={{ color: "var(--primary)" }}>
            Ver {resto.length} aviso{resto.length > 1 ? "s" : ""} más
          </summary>
          <div className="mt-2 flex flex-col gap-2">{resto.map(card)}</div>
        </details>
      )}
    </div>
  );
}

export interface Col<T> {
  label: string;
  render: (row: T) => ReactNode;
  /** Columna principal: es el título de la tarjeta en el celular. */
  primary?: boolean;
  align?: "right";
  nowrap?: boolean;
  /** Solo en el celular se omite (la tarjeta no la muestra). */
  hideOnCard?: boolean;
}

/** Tabla en escritorio, tarjetas apiladas en celular: nada queda fuera de la pantalla. */
export function ResponsiveRows<T>({ rows, cols, rowKey, actions }: {
  rows: T[]; cols: Col<T>[]; rowKey: (r: T) => string; actions?: (r: T) => ReactNode;
}) {
  const primary = cols.find((c) => c.primary) ?? cols[0];
  const rest = cols.filter((c) => c !== primary && !c.hideOnCard);
  return (
    <>
      <div className="hidden overflow-x-auto rounded-[20px] bg-card shadow-[0_8px_20px_-14px_rgb(123_93_251_/_0.30)] md:block">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-border text-[10.5px] font-extrabold uppercase tracking-wide text-muted-foreground">
              {cols.map((c) => <th key={c.label} className={`px-4 py-3 ${c.align === "right" ? "text-right" : ""}`}>{c.label}</th>)}
              {actions && <th className="px-4 py-3 text-right">Acciones</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => (
              <tr key={rowKey(r)}>
                {cols.map((c) => (
                  <td key={c.label} className={`px-4 py-3 ${c.align === "right" ? "text-right" : ""} ${c.nowrap ? "whitespace-nowrap" : ""}`}>{c.render(r)}</td>
                ))}
                {actions && <td className="px-4 py-3 text-right">{actions(r)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="flex flex-col gap-2 md:hidden">
        {rows.map((r) => (
          <li key={rowKey(r)} className="rounded-[18px] bg-card p-3.5 shadow-[0_8px_20px_-14px_rgb(123_93_251_/_0.30)]">
            <div className="text-[14px] font-extrabold leading-snug">{primary.render(r)}</div>
            <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[12.5px]">
              {rest.map((c) => (
                <div key={c.label} className={c.align === "right" ? "" : ""}>
                  <dt className="text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">{c.label}</dt>
                  <dd className="font-bold">{c.render(r)}</dd>
                </div>
              ))}
            </dl>
            {actions && <div className="mt-3">{actions(r)}</div>}
          </li>
        ))}
      </ul>
    </>
  );
}
