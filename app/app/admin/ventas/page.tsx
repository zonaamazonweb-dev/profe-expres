import { adminPageData } from "@/lib/admin/page-data";
import { PageTitle, Panel, RangeFilter, ResponsiveRows, Section, SinDatos, Stat, StatGrid } from "@/components/admin/ui";
import { TrendChart } from "@/components/admin/charts";
import { channelLabel } from "@/lib/admin/labels";
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
        <SinDatos>Todavía no hay ventas registradas. Se llenan solas cuando Hotmart avise de cada pago. Cada moneda tendrá su propio bloque, nunca se mezclan.</SinDatos>
      ) : (
        o.sales.map((s) => {
          const prev = o.salesPrev.find((p) => p.currency === s.currency);
          const d = deltaText(s.gross, prev?.gross ?? null);
          return (
            <section key={s.currency} className="flex flex-col gap-3" aria-label={`Ventas en ${s.currency}`}>
              <h2 className="font-display text-[20px] font-extrabold">{s.currency}</h2>
              <StatGrid>
                <Stat hero span label="Cobrado (caja)" value={formatMoney(s.gross, s.currency)} insight={d.text} tono={d.tono} />
                <Stat label="Reembolsos y contracargos" value={formatMoney(s.refunds, s.currency)} insight={s.refundCount === 0 ? "Ninguno en el periodo." : `${s.refundCount} devoluciones`} tono={s.refundCount > 0 ? "aviso" : "neutro"} />
                <Stat label="Neto del periodo" value={formatMoney(s.net, s.currency)} />
                <Stat label="Compras" value={formatInt(s.sales)} insight={s.sales > 0 ? `Ticket promedio ${formatMoney(Math.round(s.gross / s.sales), s.currency)}` : undefined} />
              </StatGrid>
              <Panel><TrendChart data={s.series} label={`Ventas ${s.currency}`} format={{ kind: "money", currency: s.currency }} /></Panel>
              <p className="text-[12px] text-muted-foreground">«Cobrado» es la caja del periodo. Un plan anual entra completo aquí, pero en el ingreso mensual recurrente se reparte en 12 meses.</p>
            </section>
          );
        })
      )}

      <Section titulo="Ingreso mensual recurrente" sub="Lo que entra cada mes de las cuentas pagas vigentes.">
        {Object.keys(o.mrr).length === 0 ? <SinDatos>Aparece cuando haya cuentas pagas por Hotmart.</SinDatos> : (
          <StatGrid cols={3}>
            {Object.entries(o.mrr).map(([cur, v]) => <Stat key={cur} label={`Por mes (${cur})`} value={formatMoney(v, cur)} />)}
          </StatGrid>
        )}
      </Section>

      <Section titulo="Bajas del periodo" sub="Se separan porque se arreglan distinto: una se retiene con producto, la otra con recordatorios de cobro.">
        {c.activeAtStart === 0 && churned === 0 && c.refunded === 0 ? (
          <SinDatos>Aún no hay clientas pagas con historial para medir bajas.</SinDatos>
        ) : (
          <StatGrid>
            <Stat label="Se fueron por decisión propia" value={formatInt(c.voluntary)} insight="Hay que mejorar el producto o la retención." />
            <Stat label="Se fueron por pago fallido" value={formatInt(c.involuntary)} insight={c.involuntary > 0 ? "Eran clientas que querían seguir: se recuperan con recordatorios." : undefined} tono={c.involuntary > 0 ? "aviso" : "neutro"} />
            <Stat label="Tasa de bajas" value={c.rate == null ? null : formatPct(c.rate, 1)} insight={c.rate == null ? "Hace falta una base de clientas al inicio del periodo." : `${c.activeAtStart} clientas al inicio`} />
            <Stat label="De las bajas, por cobro" value={c.involuntaryShare == null ? null : formatPct(c.involuntaryShare)} insight="Lo normal es cerca de un tercio." />
          </StatGrid>
        )}
        {c.unclassified > 0 && <p className="mt-2 text-[12px] text-muted-foreground">{c.unclassified} baja(s) sin clasificar como voluntaria o involuntaria.</p>}
      </Section>

      <Section titulo="Últimas ventas">
        {recientes.length === 0 ? <SinDatos>Nada en este periodo.</SinDatos> : (
          <ResponsiveRows
            rows={recientes}
            rowKey={(t) => `${t.transaction_id}-${t.economic_kind}`}
            cols={[
              { label: "Tipo", primary: true, render: (t) => (t.economic_kind === "sale" ? "Venta" : t.economic_kind === "refund" ? "Reembolso" : "Contracargo") },
              { label: "Fecha", render: (t) => formatDate(t.occurred_at) },
              { label: "Canal", render: (t) => (t.source ? channelLabel(t.source) : "Directo") },
              { label: "Monto", align: "right", nowrap: true, render: (t) => (
                <span className="font-extrabold" style={{ color: t.economic_kind === "sale" ? undefined : "#E5484D" }}>
                  {t.economic_kind === "sale" ? "" : "− "}{formatMoney(t.amount_minor, t.currency)}
                </span>) },
            ]}
          />
        )}
      </Section>
    </div>
  );
}
