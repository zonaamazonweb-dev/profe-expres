import { adminPageData } from "@/lib/admin/page-data";
import { ConfirmForm } from "@/components/admin/ConfirmForm";
import { channelLabel } from "@/lib/admin/labels";
import { PageTitle, Panel, RangeFilter, Section, SinDatos } from "@/components/admin/ui";
import { GastoForm } from "@/components/admin/GastoForm";
import { deleteEntry } from "@/app/admin/gastos/actions";
import { formatDate, formatMoney, monthBounds } from "@/lib/admin/format";

function lectura(c: { ratio: number | null; cac: number | null; ltv: number | null; currency: string; channel: string }): string {
  if (c.ratio == null || c.cac == null || c.ltv == null) return "Faltan datos (gasto, ventas o bajas) para opinar.";
  const por1 = c.ratio.toFixed(2);
  if (c.ratio < 1) return `Por cada 1 que gastas, recuperas ${por1}: pierdes dinero. Pausa «${channelLabel(c.channel)}».`;
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
            {o.channels.map((c) => {
              const malo = c.ratio != null && c.ratio < 1;
              const claves: Array<[string, string]> = [
                ["Costo por clienta", c.cac == null ? "Sin datos" : formatMoney(Math.round(c.cac), c.currency)],
                ["Deja en total", c.ltv == null ? "Sin datos" : formatMoney(Math.round(c.ltv), c.currency)],
                ["Recuperas por cada 1", c.ratio == null ? "Sin datos" : c.ratio.toFixed(2)],
              ];
              const detalle: Array<[string, string]> = [
                ["Clientas nuevas", String(c.newCustomers)],
                ["Gastaste", formatMoney(c.spend, c.currency)],
                ...(c.arpu == null ? [] : [["Deja por mes", formatMoney(Math.round(c.arpu), c.currency)] as [string, string]]),
                ...(c.paybackMonths == null ? [] : [["Meses para recuperar", c.paybackMonths.toFixed(1)] as [string, string]]),
              ];
              return (
                <Panel key={`${c.channel}-${c.currency}`}>
                  <h3 className="font-display text-[18px] font-extrabold">{channelLabel(c.channel)} <span className="text-[13px] font-bold text-muted-foreground">({c.currency})</span></h3>
                  <p className="mt-1 text-[13px] font-extrabold" style={{ color: malo ? "#E5484D" : "var(--foreground)" }}>{lectura(c)}</p>
                  <dl className="mt-3 grid grid-cols-3 gap-2 text-[13px]">
                    {claves.map(([k, v]) => (
                      <div key={k}><dt className="text-[10px] font-extrabold uppercase leading-tight tracking-wide text-muted-foreground">{k}</dt><dd className="mt-0.5 font-extrabold tabular-nums">{v}</dd></div>
                    ))}
                  </dl>
                  <details className="mt-2">
                    <summary className="min-h-11 cursor-pointer list-none py-2.5 text-[12.5px] font-extrabold" style={{ color: "var(--primary)" }}>Ver el detalle</summary>
                    <dl className="grid grid-cols-2 gap-3 text-[13px]">
                      {detalle.map(([k, v]) => (
                        <div key={k}><dt className="text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">{k}</dt><dd className="mt-0.5 font-extrabold tabular-nums">{v}</dd></div>
                      ))}
                    </dl>
                  </details>
                  {c.ltv != null && c.churnSample < 5 && <p className="mt-1 text-[12px] font-bold" style={{ color: "#B7791F" }}>Poca muestra: el «total que deja» se apoya en solo {c.churnSample} baja{c.churnSample === 1 ? "" : "s"}. Tómalo como pista, no como cifra firme.</p>}
                  {c.monthlyChurn == null && <p className="mt-1 text-[12px] text-muted-foreground">El «total que deja» necesita al menos una baja; mientras nadie cancele no se inventa.</p>}
                </Panel>
              );
            })}
          </div>
        )}
      </Section>

      <Section titulo="Lo que gastas en conseguir clientas" sub="Hotmart no sabe cuánto pagas en anuncios o a afiliados: lo registras tú.">
        <GastoForm tipo="gasto" canAct={admin.mfaVerified} currencyDefault={moneda} mes={mes} />
        <div className="mt-3">
          {o.spends.length === 0 ? <SinDatos>Aún no registraste gastos.</SinDatos> : (
            <Panel className="!p-0">
              <ul className="divide-y divide-border">
                {o.spends.map((s) => (
                  <li key={s.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-4 py-3 text-[13px]">
                    <div className="min-w-0">
                      <p className="font-bold">{channelLabel(s.channel)}{s.note ? <span className="font-normal text-muted-foreground"> · {s.note}</span> : null}</p>
                      <p className="text-[12px] text-muted-foreground">{formatDate(s.period_start)} – {formatDate(s.period_end)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="whitespace-nowrap font-extrabold">{formatMoney(s.amount_minor, s.currency)}</span>
                      {admin.mfaVerified && (
                        <ConfirmForm action={deleteEntry} fields={{ table: "acquisition_spend", id: String(s.id) }} label="Quitar"
                          confirmText="¿Quitar este gasto?" confirmLabel="Sí, quitar" />
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
