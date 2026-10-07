import { adminPageData } from "@/lib/admin/page-data";
import { PageTitle, Panel, RangeFilter, Section, SinDatos, Stat, StatGrid } from "@/components/admin/ui";
import { TrendChart } from "@/components/admin/charts";
import { featureLabel } from "@/lib/admin/labels";
import { formatInt, formatPct, formatUsd } from "@/lib/admin/format";

export default async function IaPage({ searchParams }: { searchParams: Promise<{ rango?: string }> }) {
  const { rango, o } = await adminPageData(searchParams);
  const ai = o.ai;
  const incomeUsd = (o.sales.find((s) => s.currency === "USD")?.net ?? 0) / 100;
  const share = incomeUsd > 0 ? ai.totalUsd / incomeUsd : null;
  const emailOf = new Map(o.profiles.map((p) => [p.id, p.full_name ?? p.email]));
  const pico = ai.series.reduce<{ day: string; value: number } | null>((m, d) => (d.value > (m?.value ?? 0) ? d : m), null);
  const prevCmp = o.aiPrev.totalUsd > 0 ? ((ai.totalUsd - o.aiPrev.totalUsd) / o.aiPrev.totalUsd) * 100 : null;

  return (
    <div className="flex flex-col gap-6">
      <PageTitle titulo="Inteligencia artificial" sub="Cuánto te cuesta de verdad cada ficha, medido llamada por llamada." right={<RangeFilter base="/admin/ia" actual={rango.id} />} />

      {ai.calls === 0 ? <SinDatos>Aún no hay llamadas a la IA en este periodo. Cada ficha que se genere queda registrada aquí con su costo.</SinDatos> : (
        <>
          <StatGrid>
            <Stat hero span label="Gastado en el periodo" value={formatUsd(ai.totalUsd)}
              insight={prevCmp == null ? "Sin periodo anterior para comparar." : `${prevCmp >= 0 ? "↑" : "↓"} ${Math.abs(prevCmp).toFixed(0)}% frente al periodo anterior`} tono={prevCmp != null && prevCmp > 30 ? "aviso" : "neutro"} />
            <Stat label="Gastado hoy" value={formatUsd(ai.todayUsd)} />
            <Stat label="Costo promedio por ficha" value={ai.avgCostUsd == null ? null : formatUsd(ai.avgCostUsd)} insight={ai.avgCostUsd == null ? "Las llamadas no traen costo: revisa el precio del modelo en la configuración." : undefined} />
            <Stat label="Parte de lo que cobras" value={share == null ? null : formatPct(share, 1)}
              tono={share != null && share > 0.2 ? "malo" : "neutro"}
              insight={share == null ? "Se calcula cuando haya ventas en USD." : share > 0.2 ? "Por encima del 20% sano." : "Dentro de lo sano (menos del 20%)."} />
          </StatGrid>
          {ai.errors > 0 && <p className="rounded-[14px] bg-[color-mix(in_oklab,#E5484D_10%,var(--card))] p-3 text-[12.5px] font-bold">{ai.errors} de {ai.calls} llamadas fallaron en este periodo (mira «Salud»).</p>}

          <Section titulo="Gasto por día">
            <Panel>
              {pico && <p className="mb-1 text-[12.5px] font-bold">Día más caro: {pico.day.slice(8, 10)}/{pico.day.slice(5, 7)} con {formatUsd(pico.value)}.</p>}
              <TrendChart data={ai.series} label="Gasto IA" color="var(--accent-2)" format={{ kind: "usd" }} />
            </Panel>
          </Section>

          <Section titulo="Por tipo de función">
            <Panel className="!p-0">
              <ul className="divide-y divide-border text-[13px]">
                {ai.byFeature.map((f) => (
                  <li key={f.feature} className="flex items-baseline justify-between gap-3 px-4 py-3">
                    <span className="font-bold">{featureLabel(f.feature)} <span className="font-normal text-muted-foreground">· {formatInt(f.calls)} llamadas</span></span>
                    <span className="font-extrabold tabular-nums">{formatUsd(f.costUsd)}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          </Section>

          <Section titulo="Por usuaria" sub="Para detectar a quien gasta de más (límite de uso justo).">
            <Panel className="!p-0">
              <ul className="divide-y divide-border text-[13px]">
                {ai.byUser.slice(0, 15).map((u) => (
                  <li key={u.userId ?? "anon"} className="flex items-baseline justify-between gap-3 px-4 py-3">
                    <span className="min-w-0 break-words font-bold">{u.userId ? emailOf.get(u.userId) ?? "Cuenta eliminada" : "Sin cuenta (uso desde la app pública)"}
                      <span className="font-normal text-muted-foreground"> · {formatInt(u.calls)} llamadas</span></span>
                    <span className="whitespace-nowrap font-extrabold tabular-nums">{formatUsd(u.costUsd)}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          </Section>
        </>
      )}
    </div>
  );
}
