import { adminPageData } from "@/lib/admin/page-data";
import { PageTitle, Panel, RangeFilter, Section, SinDatos } from "@/components/admin/ui";
import { GastoForm } from "@/components/admin/GastoForm";
import { deleteEntry } from "@/app/admin/gastos/actions";
import { formatDate, formatMoney, monthBounds } from "@/lib/admin/format";

function lectura(c: { ratio: number | null; cac: number | null; ltv: number | null; currency: string; channel: string }): string {
  if (c.ratio == null || c.cac == null || c.ltv == null) return "Faltan datos (gasto, ventas o bajas) para opinar.";
  const por1 = c.ratio.toFixed(2);
  if (c.ratio < 1) return `Por cada 1 que gastas, recuperas ${por1}: pierdes dinero. Pausa «${c.channel}».`;
  if (c.ratio < 3) return `Por cada 1 que gastas, recuperas ${por1}: está bien, pero por debajo del 3 a 1 sano.`;
  if (c.ratio > 5) return `Por cada 1 que gastas, recuperas ${por1}: podrías invertir más aquí.`;
  return `Por cada 1 que gastas, recuperas ${por1}: saludable.`;
}

export default async function NegocioPage({ searchParams }: { searchParams: Promise<{ rango?: string }> }) {
  const { admin, rango, o } = await adminPageData(searchParams);
  const mes = monthBounds();
  const moneda = o.channels[0]?.currency ?? o.sales[0]?.currency ?? "USD";

  return (
    <div className="flex flex-col gap-6">
      <PageTitle titulo="Negocio" sub="Si cada canal te hace ganar o perder dinero al crecer: cuánto cuesta una clienta y cuánto deja en total." right={<RangeFilter base="/admin/negocio" actual={rango.id} />} />

      <Section titulo="Por canal">
        {o.channels.length === 0 ? (
          <SinDatos>Se calcula cuando haya clientas pagas con su canal de origen y gastos registrados. Sin gasto, el costo por clienta no existe: no se inventa.</SinDatos>
        ) : (
          <div className="flex flex-col gap-3">
            {o.channels.map((c) => (
              <Panel key={`${c.channel}-${c.currency}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-display text-[18px] font-extrabold">{c.channel} <span className="text-[13px] font-bold text-muted-foreground">({c.currency})</span></h3>
                  <p className="text-[12.5px] font-bold" style={{ color: c.ratio != null && c.ratio < 1 ? "#E5484D" : "var(--muted-foreground)" }}>{lectura(c)}</p>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7 text-[13px]">
                  {([
                    ["Clientas nuevas", String(c.newCustomers)],
                    ["Gastaste", formatMoney(c.spend, c.currency)],
                    ["Costo por clienta", c.cac == null ? "Sin datos" : formatMoney(Math.round(c.cac), c.currency)],
                    ["Deja por mes", c.arpu == null ? "Sin datos" : formatMoney(Math.round(c.arpu), c.currency)],
                    ["Deja en total", c.ltv == null ? "Sin datos" : formatMoney(Math.round(c.ltv), c.currency)],
                    ["Recuperas por cada 1", c.ratio == null ? "Sin datos" : c.ratio.toFixed(2)],
                    ["Meses para recuperar", c.paybackMonths == null ? "Sin datos" : c.paybackMonths.toFixed(1)],
                  ] as const).map(([k, v]) => (
                    <div key={k}><dt className="text-[10.5px] font-extrabold uppercase tracking-wide text-muted-foreground">{k}</dt><dd className="mt-0.5 font-extrabold tabular-nums">{v}</dd></div>
                  ))}
                </dl>
                {c.ltv != null && c.churnSample < 5 && <p className="mt-2 text-[12px] font-bold" style={{ color: "#B7791F" }}>Poca muestra: el «total que deja» se apoya en solo {c.churnSample} baja{c.churnSample === 1 ? "" : "s"}. Tómalo como pista, no como cifra firme.</p>}
                {c.monthlyChurn == null && <p className="mt-2 text-[12px] text-muted-foreground">El «total que deja» necesita al menos una baja para calcularse; mientras nadie cancele no se inventa.</p>}
              </Panel>
            ))}
          </div>
        )}
      </Section>

      <Section titulo="Lo que gastas en conseguir clientas" sub="Hotmart no sabe cuánto pagas en anuncios o a afiliados: lo registras tú.">
        <GastoForm tipo="gasto" canAct={admin.mfaVerified} currencyDefault={moneda} mes={mes} />
        <div className="mt-3">
          {o.spends.length === 0 ? <SinDatos>Aún no registraste gastos.</SinDatos> : (
            <Panel className="overflow-x-auto !p-0">
              <table className="w-full min-w-[560px] text-left text-[13px]">
                <thead><tr className="border-b border-border text-[10.5px] font-extrabold uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3">Canal</th><th className="px-3 py-3">Periodo</th><th className="px-3 py-3 text-right">Monto</th><th className="px-4 py-3" /></tr></thead>
                <tbody className="divide-y divide-border">
                  {o.spends.map((s) => (
                    <tr key={s.id}>
                      <td className="px-4 py-3 font-bold">{s.channel}{s.note ? <span className="font-normal text-muted-foreground"> · {s.note}</span> : null}</td>
                      <td className="px-3 py-3 text-muted-foreground">{formatDate(s.period_start)} – {formatDate(s.period_end)}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-right font-extrabold">{formatMoney(s.amount_minor, s.currency)}</td>
                      <td className="px-4 py-3 text-right">
                        {admin.mfaVerified && (
                          <form action={deleteEntry}><input type="hidden" name="table" value="acquisition_spend" /><input type="hidden" name="id" value={s.id} />
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
