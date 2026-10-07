import Link from "next/link";
import { adminPageData } from "@/lib/admin/page-data";
import { AlertsBanner, PageTitle, Panel, RangeFilter, Section, SinDatos, Stat } from "@/components/admin/ui";
import { TrendChart } from "@/components/admin/charts";
import { deltaText, formatInt, formatMoney, formatPct } from "@/lib/admin/format";
import { activation, mainActionCounts, productUsers, ACTION_EVENT } from "@/lib/admin/metrics";

export default async function ResumenPage({ searchParams }: { searchParams: Promise<{ rango?: string }> }) {
  const { rango, o } = await adminPageData(searchParams);

  const main = o.sales[0] ?? null;
  const prevMain = main ? o.salesPrev.find((s) => s.currency === main.currency) ?? null : null;
  const profitMain = main ? o.profit.find((p) => p.currency === main.currency) ?? null : null;
  const delta = main ? deltaText(main.gross, prevMain?.gross ?? null) : null;
  const mrrCurrency = main?.currency ?? Object.keys(o.mrr)[0];
  const users = productUsers(o.profiles);
  const payingActive = users.filter((u) => u.access_origin === "hotmart" && (u.status === "active" || u.status === "past_due")).length;
  const manualActive = users.filter((u) => u.access_origin === "manual" && u.status === "active").length;
  const act = activation(users, o.events);
  const actions = mainActionCounts(o.events, o.now);
  const hasData = o.sales.length > 0 || o.ai.calls > 0 || users.length > 0;
  const otherCurrencies = o.sales.slice(1).map((s) => s.currency);

  const conexiones = [
    { nombre: "Base de datos (Supabase)", ok: true, nota: "Conectada" },
    { nombre: "Inteligencia artificial", ok: o.ai.calls > 0, nota: o.ai.calls > 0 ? "Registrando cada ficha" : "Sin llamadas en este periodo" },
    { nombre: "Pagos de Hotmart", ok: o.webhook.total > 0, nota: o.webhook.total > 0 ? "Recibiendo avisos" : "Sin conectar todavía" },
    { nombre: "Emails de acceso (Resend)", ok: Boolean(process.env.RESEND_API_KEY), nota: process.env.RESEND_API_KEY ? "Configurado" : "Sin configurar: el acceso se entrega con enlace manual" },
    { nombre: "Errores detallados (Sentry)", ok: Boolean(process.env.SENTRY_DSN), nota: process.env.SENTRY_DSN ? "Conectado" : "Sin conectar (opcional)" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageTitle titulo="Resumen" sub="Tu negocio de un vistazo, con lo que necesita tu atención arriba." right={<RangeFilter base="/admin" actual={rango.id} />} />
      {o.truncated && <p className="rounded-[14px] bg-[var(--sunken)] p-3 text-[12.5px] font-bold">Hay más datos de los que el panel puede sumar de una vez; los totales pueden quedar cortos.</p>}

      <AlertsBanner alerts={o.alerts} hasData={hasData} />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat hero label={`Facturaste${main ? ` (${main.currency})` : ""}`}
          value={main ? formatMoney(main.gross, main.currency) : null}
          insight={main ? `${delta?.text}${otherCurrencies.length ? ` · También hay ventas en ${otherCurrencies.join(", ")} (mira Ventas)` : ""}` : "Aparece con la primera venta de Hotmart."}
          tono={delta?.tono ?? "neutro"} />
        <Stat hero label="Te quedaron limpios" badge="Estimación"
          value={profitMain ? formatMoney(profitMain.profit, profitMain.currency) : null}
          insight={profitMain ? (profitMain.margin != null ? `Margen del ${formatPct(profitMain.margin)} sobre lo cobrado` : undefined) : "Se calcula cuando haya ventas."}
          tono={profitMain && profitMain.profit <= 0 ? "malo" : "neutro"} />
        <Stat label="Clientas con acceso" value={users.length === 0 ? null : formatInt(payingActive + manualActive)}
          insight={users.length === 0 ? "Aún no hay usuarias." : `${payingActive} pagando · ${manualActive} agregadas a mano`} />
        <Stat label={`Ingreso mensual recurrente${mrrCurrency ? ` (${mrrCurrency})` : ""}`}
          value={mrrCurrency && o.mrr[mrrCurrency] != null ? formatMoney(o.mrr[mrrCurrency], mrrCurrency) : null}
          insight={mrrCurrency ? "Lo que entra cada mes de las cuentas pagas vigentes (plan anual repartido en 12)." : "Sin cuentas pagas todavía."} />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Fichas creadas en el periodo" value={o.events.some((e) => e.type === ACTION_EVENT) ? formatInt(o.events.filter((e) => e.type === ACTION_EVENT && new Date(e.created_at) >= o.range.start).length) : null}
          insight={`Hoy: ${actions.today} · 7 días: ${actions.week}`} />
        <Stat label="Gasto en IA" value={o.ai.calls > 0 ? `${o.ai.totalUsd.toFixed(2)} USD` : null}
          insight={o.ai.calls > 0 ? `${formatInt(o.ai.calls)} llamadas · hoy ${o.ai.todayUsd.toFixed(2)} USD` : "Sin llamadas a la IA en este periodo."} />
        <Stat label="Usuarias que ya hicieron su primera ficha" value={act.rate == null ? null : formatPct(act.rate)}
          insight={act.rate == null ? "Hace falta que haya usuarias con cuenta." : `${act.activated} de ${act.total}`} />
      </div>

      <Section titulo="Ventas por día">
        {main && main.sales > 0 ? (
          <Panel><TrendChart data={main.series} label={`Ventas ${main.currency}`} format={(v) => formatMoney(Math.round(v), main.currency).replace(/\.00$/, "")} /></Panel>
        ) : <SinDatos>Cuando entren las primeras ventas por Hotmart, aquí ves cómo evolucionan.</SinDatos>}
      </Section>

      <Section titulo="Qué está conectado" sub="Lo que falte aquí explica los «Sin datos» de arriba.">
        <Panel className="!p-0">
          <ul className="divide-y divide-border">
            {conexiones.map((c) => (
              <li key={c.nombre} className="flex items-center justify-between gap-3 px-4 py-3 text-[13px]">
                <span className="font-extrabold">{c.nombre}</span>
                <span className="text-right font-bold" style={{ color: c.ok ? "#2F9E5B" : "#B7791F" }}>{c.ok ? "●" : "○"} {c.nota}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <p className="mt-2 text-[12px] text-muted-foreground">
          Para ver cada número en detalle: <Link className="underline" href="/admin/ventas">Ventas</Link>, <Link className="underline" href="/admin/ganancia">Ganancia real</Link>, <Link className="underline" href="/admin/uso">Uso</Link>.
        </p>
      </Section>
    </div>
  );
}

