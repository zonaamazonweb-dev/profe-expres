import { adminPageData } from "@/lib/admin/page-data";
import { PageTitle, Panel, RangeFilter, Section, SinDatos, Stat } from "@/components/admin/ui";
import { GastoForm } from "@/components/admin/GastoForm";
import { deleteEntry } from "@/app/admin/gastos/actions";
import { formatDate, formatMoney, formatPct, monthBounds } from "@/lib/admin/format";

const KIND: Record<string, string> = { infra: "Servidores", email: "Emails", tax: "Impuestos", other: "Otro" };

export default async function GananciaPage({ searchParams }: { searchParams: Promise<{ rango?: string }> }) {
  const { admin, rango, o } = await adminPageData(searchParams);
  const mes = monthBounds();
  const moneda = o.profit[0]?.currency ?? "USD";

  return (
    <div className="flex flex-col gap-6">
      <PageTitle titulo="Ganancia real" sub="Facturaste una cifra, pero te quedó otra. Aquí se ve cuánto, y de dónde se fue el resto." right={<RangeFilter base="/admin/ganancia" actual={rango.id} />} />

      {o.profit.length === 0 ? (
        <SinDatos>Sin ventas en este periodo no hay ganancia que calcular. Los costos que registres abajo se restan en cuanto entren ventas.</SinDatos>
      ) : o.profit.map((p) => {
        const filas: Array<{ label: string; value: number | null; tono?: "malo" }> = [
          { label: "Cobrado (neto de reembolsos)", value: p.income },
          { label: "Tarifa de Hotmart", value: -p.providerFees },
          { label: "Comisión de afiliados", value: -p.affiliateFees },
          { label: "Impuestos", value: -p.taxes },
          { label: "Inteligencia artificial", value: p.ai == null ? null : -p.ai },
          { label: "Servidores", value: -p.infra },
          { label: "Emails", value: -p.email },
          { label: "Otros costos", value: -p.other },
        ];
        return (
          <section key={p.currency} className="flex flex-col gap-3" aria-label={`Ganancia en ${p.currency}`}>
            <h2 className="font-display text-[20px] font-extrabold">{p.currency}</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <Stat hero label="Facturaste" value={formatMoney(p.income, p.currency)} />
              <Stat hero label="Te quedaron limpios" badge="Estimación" value={formatMoney(p.profit, p.currency)} tono={p.profit <= 0 ? "malo" : "bueno"}
                insight={`Facturaste ${formatMoney(p.income, p.currency)} y te quedaron ${formatMoney(p.profit, p.currency)} limpios.`} />
              <Stat hero label="Margen" value={p.margin == null ? null : formatPct(p.margin)} tono={p.margin != null && p.margin < 0.4 ? "aviso" : "neutro"}
                insight={p.margin == null ? undefined : p.margin >= 0.7 ? "Sano." : p.margin >= 0.4 ? "Aceptable, pero vigila los costos." : "Bajo: cada venta deja poco."} />
            </div>
            <Panel className="!p-0">
              <table className="w-full text-[13px]">
                <caption className="sr-only">De lo cobrado a lo que te quedó, en {p.currency}</caption>
                <tbody className="divide-y divide-border">
                  {filas.map((f) => (
                    <tr key={f.label}>
                      <td className="px-4 py-2.5 font-bold">{f.label}</td>
                      <td className="px-4 py-2.5 text-right font-extrabold tabular-nums" style={{ color: f.value != null && f.value < 0 ? "#E5484D" : undefined }}>
                        {f.value == null ? <span className="text-muted-foreground">No se pudo restar</span> : formatMoney(f.value, p.currency)}
                      </td>
                      <td className="w-16 px-4 py-2.5 text-right text-[12px] text-muted-foreground">{f.value != null && p.income > 0 ? formatPct(Math.abs(f.value) / p.income) : ""}</td>
                    </tr>
                  ))}
                  <tr className="bg-[var(--sunken)]">
                    <td className="px-4 py-3 font-extrabold">Te quedaron</td>
                    <td className="px-4 py-3 text-right font-display text-[18px] font-extrabold tabular-nums">{formatMoney(p.profit, p.currency)}</td>
                    <td />
                  </tr>
                </tbody>
              </table>
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
            <Panel className="overflow-x-auto !p-0">
              <table className="w-full min-w-[560px] text-left text-[13px]">
                <thead><tr className="border-b border-border text-[10.5px] font-extrabold uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3">Costo</th><th className="px-3 py-3">Periodo</th><th className="px-3 py-3 text-right">Monto</th><th className="px-4 py-3" /></tr></thead>
                <tbody className="divide-y divide-border">
                  {o.costs.map((c) => (
                    <tr key={c.id}>
                      <td className="px-4 py-3 font-bold">{KIND[c.kind]}{c.note ? <span className="font-normal text-muted-foreground"> · {c.note}</span> : null}</td>
                      <td className="px-3 py-3 text-muted-foreground">{formatDate(c.period_start)} – {formatDate(c.period_end)}</td>
                      <td className="px-3 py-3 text-right font-extrabold">{formatMoney(c.amount_minor, c.currency)}</td>
                      <td className="px-4 py-3 text-right">
                        {admin.mfaVerified && (
                          <form action={deleteEntry}><input type="hidden" name="table" value="cost_entries" /><input type="hidden" name="id" value={c.id} />
                            <button className="text-[12px] font-bold text-muted-foreground hover:text-[#E5484D]">Quitar</button></form>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          )}
        </div>
      </Section>
    </div>
  );
}
