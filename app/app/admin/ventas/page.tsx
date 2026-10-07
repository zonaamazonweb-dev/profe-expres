import { adminPageData } from "@/lib/admin/page-data";
import { PageTitle, Panel, RangeFilter, Section, SinDatos, Stat } from "@/components/admin/ui";
import { TrendChart } from "@/components/admin/charts";
import { deltaText, formatDate, formatInt, formatMoney, formatPct } from "@/lib/admin/format";

export default async function VentasPage({ searchParams }: { searchParams: Promise<{ rango?: string }> }) {
  const { rango, o } = await adminPageData(searchParams);
  const c = o.churn;
  const churned = c.voluntary + c.involuntary + c.unclassified;
  const recientes = o.txs.filter((t) => new Date(t.occurred_at) >= o.range.start).slice(0, 15);

  return (
    <div className="flex flex-col gap-6">
      <PageTitle titulo="Ventas" sub="Lo que entró, lo que se devolvió y cuántas clientas se van (y por qué)." right={<RangeFilter base="/admin/ventas" actual={rango.id} />} />

      {o.sales.length === 0 ? (
        <SinDatos>Todavía no hay ventas registradas. Se llenan solas cuando Hotmart avise de cada pago (paso siguiente del embudo). Las monedas nunca se mezclan: cada una tendrá su propio bloque.</SinDatos>
      ) : (
        o.sales.map((s) => {
          const prev = o.salesPrev.find((p) => p.currency === s.currency);
          const d = deltaText(s.gross, prev?.gross ?? null);
          return (
            <section key={s.currency} className="flex flex-col gap-3" aria-label={`Ventas en ${s.currency}`}>
              <h2 className="font-display text-[20px] font-extrabold">{s.currency}</h2>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Stat hero label="Cobrado (caja)" value={formatMoney(s.gross, s.currency)} insight={d.text} tono={d.tono} />
                <Stat label="Reembolsos y contracargos" value={formatMoney(s.refunds, s.currency)} insight={s.refundCount === 0 ? "Ninguno en el periodo." : `${s.refundCount} devoluciones`} tono={s.refundCount > 0 ? "aviso" : "neutro"} />
                <Stat label="Neto del periodo" value={formatMoney(s.net, s.currency)} />
                <Stat label="Compras" value={formatInt(s.sales)} insight={s.sales > 0 ? `Ticket promedio ${formatMoney(Math.round(s.gross / s.sales), s.currency)}` : undefined} />
              </div>
              <Panel><TrendChart data={s.series} label={`Ventas ${s.currency}`} format={{ kind: "money", currency: s.currency }} /></Panel>
              <p className="text-[12px] text-muted-foreground">«Cobrado» es la caja del periodo. Un plan anual entra completo aquí, pero en el ingreso mensual recurrente se reparte en 12 meses.</p>
            </section>
          );
        })
      )}

      <Section titulo="Ingreso mensual recurrente" sub="Lo que entra cada mes de las cuentas pagas vigentes.">
        {Object.keys(o.mrr).length === 0 ? <SinDatos>Aparece cuando haya cuentas pagas por Hotmart.</SinDatos> : (
          <div className="grid gap-3 sm:grid-cols-3">
            {Object.entries(o.mrr).map(([cur, v]) => <Stat key={cur} label={`Por mes (${cur})`} value={formatMoney(v, cur)} />)}
          </div>
        )}
      </Section>

      <Section titulo="Bajas del periodo" sub="Se separan porque se arreglan distinto: una se retiene con producto, la otra con recordatorios de cobro.">
        {c.activeAtStart === 0 && churned === 0 && c.refunded === 0 ? (
          <SinDatos>Aún no hay clientas pagas con historial para medir bajas.</SinDatos>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Se fueron por decisión propia" value={formatInt(c.voluntary)} insight="Hay que mejorar el producto o la retención." />
            <Stat label="Se fueron por pago fallido" value={formatInt(c.involuntary)} insight={c.involuntary > 0 ? "Eran clientas que querían seguir: se recuperan con recordatorios." : undefined} tono={c.involuntary > 0 ? "aviso" : "neutro"} />
            <Stat label="Tasa de bajas" value={c.rate == null ? null : formatPct(c.rate, 1)} insight={c.rate == null ? "Hace falta una base de clientas al inicio del periodo." : `${c.activeAtStart} clientas al inicio`} />
            <Stat label="De las bajas, por cobro" value={c.involuntaryShare == null ? null : formatPct(c.involuntaryShare)} insight="Lo normal es cerca de un tercio." />
          </div>
        )}
        {c.unclassified > 0 && <p className="mt-2 text-[12px] text-muted-foreground">{c.unclassified} baja(s) sin clasificar como voluntaria o involuntaria.</p>}
      </Section>

      <Section titulo="Últimas ventas">
        {recientes.length === 0 ? <SinDatos>Nada en este periodo.</SinDatos> : (
          <Panel className="overflow-x-auto !p-0">
            <table className="w-full min-w-[560px] text-left text-[13px]">
              <thead><tr className="border-b border-border text-[10.5px] font-extrabold uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Fecha</th><th className="px-3 py-3">Tipo</th><th className="px-3 py-3">Canal</th><th className="px-4 py-3 text-right">Monto</th></tr></thead>
              <tbody className="divide-y divide-border">
                {recientes.map((t) => (
                  <tr key={`${t.transaction_id}-${t.economic_kind}`}>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(t.occurred_at)}</td>
                    <td className="px-3 py-3 font-bold">{t.economic_kind === "sale" ? "Venta" : t.economic_kind === "refund" ? "Reembolso" : "Contracargo"}</td>
                    <td className="px-3 py-3">{t.source ?? "directo"}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-extrabold" style={{ color: t.economic_kind === "sale" ? undefined : "#E5484D" }}>
                      {t.economic_kind === "sale" ? "" : "− "}{formatMoney(t.amount_minor, t.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        )}
      </Section>
    </div>
  );
}
