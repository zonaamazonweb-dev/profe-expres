import { adminPageData } from "@/lib/admin/page-data";
import { PageTitle, Panel, RangeFilter, Section, SinDatos, Stat } from "@/components/admin/ui";
import { TrendChart } from "@/components/admin/charts";
import { formatInt, formatPct, timeAgo } from "@/lib/admin/format";
import { ACTION_EVENT, activation, currWeekly, fillDays, funnel, ghostPayers, mainActionCounts, productUsers, retentionDn, dayKey } from "@/lib/admin/metrics";

export default async function UsoPage({ searchParams }: { searchParams: Promise<{ rango?: string }> }) {
  const { rango, o } = await adminPageData(searchParams);
  const users = productUsers(o.profiles);
  const act = activation(users, o.events);
  const d1 = retentionDn(users, o.events, 1, o.now);
  const d7 = retentionDn(users, o.events, 7, o.now);
  const d30 = retentionDn(users, o.events, 30, o.now);
  const curr = currWeekly(o.events, o.now);
  const ghosts = ghostPayers(o.profiles, o.now);
  const actions = mainActionCounts(o.events, o.now);
  const steps = funnel(o.events, o.range);
  const funnelHasData = steps.some((s) => s.count > 0);
  const maxStep = Math.max(1, ...steps.map((s) => s.count));

  const byDay = new Map<string, number>();
  for (const e of o.events) if (e.type === ACTION_EVENT && new Date(e.created_at) >= o.range.start) byDay.set(dayKey(e.created_at), (byDay.get(dayKey(e.created_at)) ?? 0) + 1);
  const series = fillDays(o.range, byDay);
  const totalActions = series.reduce((a, d) => a + d.value, 0);

  const sinCuentas = "Hace falta que haya usuarias con cuenta (el login llega con el embudo).";
  return (
    <div className="flex flex-col gap-6">
      <PageTitle titulo="Uso" sub="Si tu app retiene: quién empieza, quién vuelve y en qué paso se pierde gente." right={<RangeFilter base="/admin/uso" actual={rango.id} />} />

      <Section titulo="Activación y retención">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Stat label="Hicieron su primera ficha" value={act.rate == null ? null : formatPct(act.rate)} insight={act.rate == null ? sinCuentas : `${act.activated} de ${act.total} usuarias`} />
          <Stat label="Volvieron al día 1" value={d1.rate == null ? null : formatPct(d1.rate)} insight={d1.rate == null ? "Aún no hay cuentas con 2 días de antigüedad." : `${d1.retained} de ${d1.eligible}`} />
          <Stat label="Volvieron al día 7" value={d7.rate == null ? null : formatPct(d7.rate)} insight={d7.rate == null ? "Aún no hay cuentas con 8 días de antigüedad." : `${d7.retained} de ${d7.eligible}`} />
          <Stat label="Volvieron al día 30" value={d30.rate == null ? null : formatPct(d30.rate)} insight={d30.rate == null ? "Aún no hay cuentas con 31 días de antigüedad." : `${d30.retained} de ${d30.eligible}`} />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Stat label="Regreso semanal" value={curr.rate == null ? null : formatPct(curr.rate)}
            insight={curr.rate == null ? "Compara a las que usaron la app la semana pasada con las que volvieron esta." : `${curr.returned} de ${curr.base} volvieron esta semana`} />
          <Stat label="Pagan pero no entran hace 14+ días" value={o.profiles.some((p) => p.access_origin === "hotmart") ? formatInt(ghosts.length) : null}
            tono={ghosts.length > 0 ? "aviso" : "neutro"}
            insight={ghosts.length > 0 ? "Son las que más se van al renovar y las más fáciles de recuperar: escríbeles." : "Sin pagadoras todavía."} />
        </div>
      </Section>

      <Section titulo="Acción principal: crear fichas" sub="Cuántas veces se usó lo que tu app promete.">
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat label="Hoy" value={o.events.some((e) => e.type === ACTION_EVENT) ? formatInt(actions.today) : null} />
          <Stat label="Últimos 7 días" value={o.events.some((e) => e.type === ACTION_EVENT) ? formatInt(actions.week) : null} />
          <Stat label="Últimos 30 días" value={o.events.some((e) => e.type === ACTION_EVENT) ? formatInt(actions.month) : null} />
        </div>
        <div className="mt-3">
          {totalActions > 0 ? <Panel><TrendChart data={series} label="Fichas por día" format={(v) => formatInt(Math.round(v))} /></Panel>
            : <SinDatos>Sin fichas creadas en este periodo.</SinDatos>}
        </div>
      </Section>

      <Section titulo="Camino de venta" sub="Dónde se va la gente entre el quiz y el pago.">
        {!funnelHasData ? (
          <SinDatos>El camino de venta (quiz → ventas → Hotmart) todavía no existe: se mide solo cuando lo construyamos. Pasos que se medirán: {steps.map((s) => s.label.toLowerCase()).join(" → ")}.</SinDatos>
        ) : (
          <Panel>
            <ol className="flex flex-col gap-3">
              {steps.map((s, i) => {
                const prev = i > 0 ? steps[i - 1].count : null;
                return (
                  <li key={s.type}>
                    <div className="flex items-baseline justify-between text-[13px]">
                      <span className="font-bold">{s.label}</span>
                      <span className="font-extrabold tabular-nums">{formatInt(s.count)}{prev ? <span className="ml-2 font-normal text-muted-foreground">{formatPct(prev > 0 ? s.count / prev : null)} del paso anterior</span> : null}</span>
                    </div>
                    <div className="mt-1 h-2.5 rounded-full bg-[var(--sunken)]"><div className="h-full rounded-full" style={{ width: `${(s.count / maxStep) * 100}%`, background: "var(--primary)" }} /></div>
                  </li>
                );
              })}
            </ol>
          </Panel>
        )}
      </Section>

      {ghosts.length > 0 && (
        <Section titulo="A quién escribirle">
          <Panel className="!p-0"><ul className="divide-y divide-border">
            {ghosts.slice(0, 10).map((g) => (
              <li key={g.id} className="flex items-center justify-between gap-3 px-4 py-3 text-[13px]">
                <span className="font-bold">{g.full_name ?? g.email}<span className="font-normal text-muted-foreground"> · {g.email}</span></span>
                <span className="text-muted-foreground">Última vez: {timeAgo(g.last_seen_at)}</span>
              </li>))}
          </ul></Panel>
        </Section>
      )}
    </div>
  );
}
