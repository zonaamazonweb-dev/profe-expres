import { adminPageData } from "@/lib/admin/page-data";
import { PageTitle, Panel, RangeFilter, Section, SinDatos, Stat } from "@/components/admin/ui";
import { HorizontalBars, TrendChart } from "@/components/admin/charts";
import { formatInt, formatPct, formatUsd } from "@/lib/admin/format";

export default async function IaPage({ searchParams }: { searchParams: Promise<{ rango?: string }> }) {
  const { rango, o } = await adminPageData(searchParams);
  const ai = o.ai;
  const incomeUsd = (o.sales.find((s) => s.currency === "USD")?.net ?? 0) / 100;
  const share = incomeUsd > 0 ? ai.totalUsd / incomeUsd : null;
  const emailOf = new Map(o.profiles.map((p) => [p.id, p.full_name ?? p.email]));
  const prevCmp = o.aiPrev.totalUsd > 0 ? ((ai.totalUsd - o.aiPrev.totalUsd) / o.aiPrev.totalUsd) * 100 : null;

  return (
    <div className="flex flex-col gap-6">
      <PageTitle titulo="Inteligencia artificial" sub="Cuánto te cuesta de verdad cada ficha, medido llamada por llamada." right={<RangeFilter base="/admin/ia" actual={rango.id} />} />

      {ai.calls === 0 ? <SinDatos>Aún no hay llamadas a la IA en este periodo. Cada ficha que se genere queda registrada aquí con su costo.</SinDatos> : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Stat hero label="Gastado en el periodo" value={formatUsd(ai.totalUsd)}
              insight={prevCmp == null ? "Sin periodo anterior para comparar." : `${prevCmp >= 0 ? "↑" : "↓"} ${Math.abs(prevCmp).toFixed(0)}% frente al periodo anterior`} tono={prevCmp != null && prevCmp > 30 ? "aviso" : "neutro"} />
            <Stat label="Gastado hoy" value={formatUsd(ai.todayUsd)} />
            <Stat label="Costo promedio por ficha" value={ai.avgCostUsd == null ? null : formatUsd(ai.avgCostUsd)} insight={ai.avgCostUsd == null ? "Las llamadas no traen costo: revisa el precio del modelo en la configuración." : undefined} />
            <Stat label="Parte de lo que cobras" value={share == null ? null : formatPct(share, 1)}
              tono={share != null && share > 0.2 ? "malo" : "neutro"}
              insight={share == null ? "Se calcula cuando haya ventas en USD." : share > 0.2 ? "Por encima del 20% sano." : "Dentro de lo sano (menos del 20%)."} />
          </div>
          {ai.errors > 0 && <p className="rounded-[14px] bg-[color-mix(in_oklab,#E5484D_10%,var(--card))] p-3 text-[12.5px] font-bold">{ai.errors} de {ai.calls} llamadas fallaron en este periodo (mira «Salud»).</p>}

          <Section titulo="Gasto por día"><Panel><TrendChart data={ai.series} label="Gasto IA" color="var(--accent-2)" format={(v) => formatUsd(v)} /></Panel></Section>

          <Section titulo="Por tipo de función">
            <Panel><HorizontalBars label="Gasto por función" data={ai.byFeature.map((f) => ({ name: `${f.feature} (${formatInt(f.calls)})`, value: f.costUsd }))} format={(v) => formatUsd(v)} /></Panel>
          </Section>

          <Section titulo="Por usuaria" sub="Para detectar a quien gasta de más (límite de uso justo).">
            <Panel className="!p-0">
              <table className="w-full text-left text-[13px]">
                <thead><tr className="border-b border-border text-[10.5px] font-extrabold uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3">Usuaria</th><th className="px-3 py-3 text-right">Llamadas</th><th className="px-4 py-3 text-right">Costo</th></tr></thead>
                <tbody className="divide-y divide-border">
                  {ai.byUser.slice(0, 15).map((u) => (
                    <tr key={u.userId ?? "anon"}>
                      <td className="px-4 py-3 font-bold">{u.userId ? emailOf.get(u.userId) ?? "Cuenta eliminada" : "Sin cuenta (uso desde la app pública)"}</td>
                      <td className="px-3 py-3 text-right tabular-nums">{formatInt(u.calls)}</td>
                      <td className="px-4 py-3 text-right font-extrabold tabular-nums">{formatUsd(u.costUsd)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          </Section>
        </>
      )}
    </div>
  );
}
