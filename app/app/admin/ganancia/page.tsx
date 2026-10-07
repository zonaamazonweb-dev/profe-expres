import { adminPageData } from "@/lib/admin/page-data";
import { PageTitle, Panel, RangeFilter, Section, SinDatos, Stat, StatGrid } from "@/components/admin/ui";
import { ConfirmForm } from "@/components/admin/ConfirmForm";
import { GastoForm } from "@/components/admin/GastoForm";
import { deleteEntry } from "@/app/admin/gastos/actions";
import { formatDate, formatMoney, formatPct, monthBounds } from "@/lib/admin/format";

const KIND: Record<string, string> = { infra: "Servidores", email: "Emails", tax: "Impuestos", other: "Otro" };

export default async function GananciaPage({ searchParams }: { searchParams: Promise<{ rango?: string }> }) {
  const { admin, rango, o } = await adminPageData(searchParams);
  const mes = monthBounds();
  const neg = (n: number) => (n === 0 ? 0 : -n);
  const moneda = o.profit[0]?.currency ?? "USD";

  return (
    <div className="flex flex-col gap-6">
      <PageTitle titulo="Ganancia real" sub="Facturaste una cifra, pero te quedó otra. Aquí se ve cuánto, y de dónde se fue el resto." right={<RangeFilter base="/admin/ganancia" actual={rango.id} />} />

      {o.profit.length === 0 ? (
        <SinDatos>Sin ventas en este periodo no hay ganancia que calcular. Los costos que registres abajo se restan en cuanto entren ventas.</SinDatos>
      ) : o.profit.map((p) => {
        const filas: Array<{ label: string; value: number | null; tono?: "malo" }> = [
          { label: "Cobrado (neto de reembolsos)", value: p.income },
          { label: "Tarifa de Hotmart", value: neg(p.providerFees) },
          { label: "Comisión de afiliados", value: neg(p.affiliateFees) },
          { label: "Impuestos", value: neg(p.taxes) },
          { label: "Inteligencia artificial", value: p.ai == null ? null : neg(p.ai) },
          { label: "Servidores", value: neg(p.infra) },
          { label: "Emails", value: neg(p.email) },
          { label: "Otros costos", value: neg(p.other) },
        ];
        return (
          <section key={p.currency} className="flex flex-col gap-3" aria-label={`Ganancia en ${p.currency}`}>
            <h2 className="font-display text-[20px] font-extrabold">{p.currency}</h2>
            <StatGrid cols={3}>
              <Stat hero label="Cobrado (sin reembolsos)" value={formatMoney(p.income, p.currency)} />
              <Stat hero label="Te quedaron limpios" badge="Estimación" value={formatMoney(p.profit, p.currency)} tono={p.profit <= 0 ? "malo" : p.ai == null ? "aviso" : "bueno"}
                insight={p.ai == null ? "Aún sin restar la IA: puede ser menos." : `De ${formatMoney(p.income, p.currency)} cobrados.`} />
              <Stat hero span label="Margen" value={p.margin == null ? null : formatPct(p.margin)} tono={p.margin == null ? "neutro" : p.margin < 0.4 ? "aviso" : p.ai == null ? "neutro" : "bueno"}
                insight={p.margin == null ? undefined : p.ai == null ? "Provisorio: falta restar el gasto de IA." : p.margin >= 0.7 ? "Sano." : p.margin >= 0.4 ? "Aceptable, vigila los costos." : "Bajo: cada venta deja poco."} />
            </StatGrid>
            <Panel className="!p-0">
              <h3 className="sr-only">De lo cobrado a lo que te quedó, en {p.currency}</h3>
              <ul className="divide-y divide-border text-[13px]">
                {filas.map((f) => (
                  <li key={f.label} className="flex items-baseline justify-between gap-3 px-4 py-3">
                    <span className="font-bold">{f.label}{f.value != null && p.income > 0 && f.value !== p.income ? <span className="ml-1.5 text-[11.5px] font-normal text-muted-foreground">{formatPct(Math.abs(f.value) / p.income)}</span> : null}</span>
                    <span className="whitespace-nowrap text-right font-extrabold tabular-nums" style={{ color: f.value != null && f.value < 0 ? "#E5484D" : undefined }}>
                      {f.value == null ? <span className="font-bold text-muted-foreground">No se pudo restar</span> : formatMoney(f.value, p.currency)}
                    </span>
                  </li>
                ))}
                <li className="flex items-baseline justify-between gap-3 bg-[var(--sunken)] px-4 py-3">
                  <span className="font-extrabold">Te quedaron</span>
                  <span className="font-display text-[18px] font-extrabold tabular-nums">{formatMoney(p.profit, p.currency)}</span>
                </li>
              </ul>
            </Panel>
            <div className="rounded-[20px] border-[1.5px] border-dashed border-border p-4">
              <p className="text-[12px] font-extrabold uppercase tracking-wide text-muted-foreground">Por qué esto es una estimación</p>
              <ul className="mt-1.5 list-disc pl-5 text-[13px] text-muted-foreground">
                {p.assumptions.map((a) => <li key={a}>{a}</li>)}
              </ul>
            </div>
          </section>
        );
      })}

      <Section titulo="Costos que solo tú conoces" sub="Servidores, emails e impuestos no vienen de Hotmart: los registras tú y se reparten por días dentro del periodo.">
        <GastoForm tipo="costo" canAct={admin.mfaVerified} currencyDefault={moneda} mes={mes} />
        <div className="mt-3">
          {o.costs.length === 0 ? <SinDatos>Aún no registraste costos.</SinDatos> : (
            <Panel className="!p-0">
              <ul className="divide-y divide-border">
                {o.costs.map((c) => (
                  <li key={c.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-4 py-3 text-[13px]">
                    <div className="min-w-0">
                      <p className="font-bold">{KIND[c.kind]}{c.note ? <span className="font-normal text-muted-foreground"> · {c.note}</span> : null}</p>
                      <p className="text-[12px] text-muted-foreground">{formatDate(c.period_start)} – {formatDate(c.period_end)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="whitespace-nowrap font-extrabold">{formatMoney(c.amount_minor, c.currency)}</span>
                      {admin.mfaVerified && (
                        <ConfirmForm action={deleteEntry} fields={{ table: "cost_entries", id: String(c.id) }} label="Quitar"
                          confirmText="¿Quitar este costo?" confirmLabel="Sí, quitar" />
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>
      </Section>
    </div>
  );
}
