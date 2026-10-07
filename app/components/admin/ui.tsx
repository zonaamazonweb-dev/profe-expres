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

/** Tarjeta de un dato héroe + insight en lenguaje claro. value=null → "Sin datos" (nunca se inventa). */
export function Stat({
  label, value, insight, tono = "neutro", hero = false, badge,
}: { label: string; value: string | null; insight?: string; tono?: Tono; hero?: boolean; badge?: string }) {
  return (
    <div
      className="flex flex-col rounded-[20px] bg-card p-4 shadow-[0_8px_20px_-14px_rgb(123_93_251_/_0.35)]"
      style={hero ? { border: "1.5px solid color-mix(in oklab, var(--primary) 35%, transparent)" } : undefined}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11.5px] font-bold text-muted-foreground">{label}</p>
        {badge && (
          <span className="rounded-full px-2 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wide"
            style={{ background: "color-mix(in oklab, #F5A623 22%, transparent)", color: "#8A5A00" }}>{badge}</span>
        )}
      </div>
      {value == null ? (
        <p className="font-display mt-1 text-[22px] font-extrabold text-muted-foreground">Sin datos</p>
      ) : (
        <p className={`font-display mt-1 font-extrabold tabular-nums ${hero ? "text-[32px]" : "text-[26px]"}`}>{value}</p>
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
          className="rounded-full px-3 py-1 text-[12px] font-bold"
          style={r.id === actual ? { background: "var(--primary)", color: "#fff" } : { color: "var(--muted-foreground)" }}
        >
          {r.label}
        </Link>
      ))}
    </div>
  );
}

export interface AlertItem { id: string; tone: "malo" | "aviso" | "info"; title: string; why: string; todo: string }

export function AlertsBanner({ alerts, hasData }: { alerts: AlertItem[]; hasData: boolean }) {
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
  return (
    <div className="flex flex-col gap-2" role="alert">
      {alerts.map((a) => (
        <div key={a.id} className="rounded-[20px] bg-card p-4" style={{ borderLeft: `5px solid ${color[a.tone]}` }}>
          <p className="text-[14px] font-extrabold">{a.title}</p>
          <p className="mt-1 text-[12.5px] text-muted-foreground"><b className="text-foreground">Por qué importa:</b> {a.why}</p>
          <p className="mt-0.5 text-[12.5px] text-muted-foreground"><b className="text-foreground">Qué hacer:</b> {a.todo}</p>
        </div>
      ))}
    </div>
  );
}
