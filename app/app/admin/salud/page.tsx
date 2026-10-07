import { adminPageData } from "@/lib/admin/page-data";
import { AlertsBanner, PageTitle, RangeFilter, Section, SinDatos, Stat, StatGrid } from "@/components/admin/ui";
import { WEBHOOK_RESULTADOS, webhookTypeLabel } from "@/lib/admin/labels";
import { formatInt, timeAgo } from "@/lib/admin/format";

export default async function SaludPage({ searchParams }: { searchParams: Promise<{ rango?: string }> }) {
  const { rango, o } = await adminPageData(searchParams);
  const w = o.webhook;
  const recientes = o.webhooks.slice(0, 10);

  return (
    <div className="flex flex-col gap-6">
      <PageTitle titulo="Salud" sub="Si todo funciona: errores de la app y conexión con Hotmart." right={<RangeFilter base="/admin/salud" actual={rango.id} />} />
      <AlertsBanner alerts={o.alerts} hasData hideHref="/admin/salud" />

      <Section titulo="Errores recientes" sub="Los más frecuentes primero: son los que más urge arreglar.">
        {o.errorGroups.length === 0 ? <SinDatos>Ningún error registrado en este periodo.</SinDatos> : (
          <ul className="flex flex-col gap-2">
            {o.errorGroups.slice(0, 15).map((e) => (
              <li key={e.fingerprint} className="rounded-[18px] bg-card p-3.5">
                <p className="break-words text-[13.5px] font-extrabold leading-snug">{e.message}</p>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  {e.context ?? "Sin origen"} · <b className="text-foreground">{formatInt(e.count)} vez{e.count === 1 ? "" : "es"}</b> · última {timeAgo(e.last, new Date(o.now))}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section titulo="Avisos de pago de Hotmart" sub="Si dejan de llegar, podrías no estar dando acceso a quien pagó.">
        {w.total === 0 ? <SinDatos>Hotmart todavía no está conectado: aún no llega ningún aviso de pago.</SinDatos> : (
          <>
            <StatGrid cols={3}>
              <Stat label="Último aviso" value={timeAgo(w.last, new Date(o.now))} />
              <Stat label="Aplicados en 24 h" value={formatInt(w.applied24h)} />
              <Stat label="Fallidos en 24 h" value={formatInt(w.failed24h)} tono={w.failed24h > 0 ? "malo" : "neutro"} insight={w.failed24h > 0 ? "Revisa la conexión con Hotmart." : "Sin fallos."} span />
            </StatGrid>
            <ul className="mt-3 divide-y divide-border overflow-hidden rounded-[20px] bg-card text-[13px]">
              {recientes.map((l, i) => {
                const r = WEBHOOK_RESULTADOS[l.result] ?? { label: l.result, ok: false };
                return (
                  <li key={i} className="flex flex-wrap items-baseline justify-between gap-x-3 px-4 py-3">
                    <span className="font-bold">{webhookTypeLabel(l.type)}</span>
                    <span style={{ color: r.ok ? "#2F9E5B" : "#E5484D" }}>{r.label} <span className="text-muted-foreground">· {timeAgo(l.received_at, new Date(o.now))}</span></span>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </Section>

      <Section titulo="Diferencias entre Hotmart y tu base" sub="Cuentas activas aquí pero canceladas en Hotmart (o al revés). Lo sano es 0.">
        <SinDatos>El chequeo semanal contra Hotmart se activa cuando se conecte el pago.</SinDatos>
      </Section>
    </div>
  );
}
