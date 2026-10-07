import { adminPageData } from "@/lib/admin/page-data";
import { AlertsBanner, PageTitle, Panel, RangeFilter, Section, SinDatos, Stat } from "@/components/admin/ui";
import { formatInt, timeAgo } from "@/lib/admin/format";

export default async function SaludPage({ searchParams }: { searchParams: Promise<{ rango?: string }> }) {
  const { rango, o } = await adminPageData(searchParams);
  const w = o.webhook;
  const sano = o.alerts.filter((a) => a.tone !== "info").length === 0;
  const resultados = ["applied", "duplicate", "illegal", "unauthorized", "error"] as const;
  const etiqueta: Record<string, string> = { applied: "Aplicados", duplicate: "Repetidos (normal)", illegal: "Ilegales", unauthorized: "No autorizados", error: "Con error" };
  const recientes = o.webhooks.slice(0, 10);

  return (
    <div className="flex flex-col gap-6">
      <PageTitle titulo="Salud" sub="Si todo funciona: errores de la app y conexión con Hotmart." right={<RangeFilter base="/admin/salud" actual={rango.id} />} />
      <div className="rounded-[20px] bg-card p-4"><p className="text-[16px] font-extrabold">{sano ? "✅ Todo bien" : "⚠️ Hay incidencias"}</p></div>
      <AlertsBanner alerts={o.alerts} hasData />

      <Section titulo="Errores recientes" sub="Los más frecuentes primero: son los que más urge arreglar.">
        {o.errorGroups.length === 0 ? <SinDatos>Ningún error registrado en este periodo.</SinDatos> : (
          <Panel className="overflow-x-auto !p-0">
            <table className="w-full min-w-[560px] text-left text-[13px]">
              <thead><tr className="border-b border-border text-[10.5px] font-extrabold uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Qué pasó</th><th className="px-3 py-3">Dónde</th><th className="px-3 py-3 text-right">Veces</th><th className="px-4 py-3 text-right">Última</th></tr></thead>
              <tbody className="divide-y divide-border">
                {o.errorGroups.slice(0, 15).map((e) => (
                  <tr key={e.fingerprint}>
                    <td className="max-w-[320px] truncate px-4 py-3 font-bold" title={e.message}>{e.message}</td>
                    <td className="px-3 py-3 text-muted-foreground">{e.context ?? "—"}</td>
                    <td className="px-3 py-3 text-right font-extrabold tabular-nums">{formatInt(e.count)}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{timeAgo(e.last, new Date(o.now))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        )}
      </Section>

      <Section titulo="Avisos de pago de Hotmart" sub="Si dejan de llegar, podrías no estar dando acceso a quien pagó.">
        {w.total === 0 ? <SinDatos>Hotmart todavía no está conectado: aún no llega ningún aviso de pago.</SinDatos> : (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <Stat label="Último aviso" value={timeAgo(w.last, new Date(o.now))} />
              <Stat label="Aplicados en 24 h" value={formatInt(w.applied24h)} />
              <Stat label="Fallidos en 24 h" value={formatInt(w.failed24h)} tono={w.failed24h > 0 ? "malo" : "neutro"} insight={w.failed24h > 0 ? "Revisa la conexión con Hotmart." : "Sin fallos."} />
            </div>
            <Panel className="mt-3">
              <ul className="grid gap-2 sm:grid-cols-5 text-[13px]">
                {resultados.map((r) => <li key={r}><span className="text-[10.5px] font-extrabold uppercase tracking-wide text-muted-foreground">{etiqueta[r]}</span><br /><b className="tabular-nums">{formatInt(o.webhooks.filter((x) => x.result === r).length)}</b></li>)}
              </ul>
            </Panel>
            <ul className="mt-3 divide-y divide-border overflow-hidden rounded-[20px] bg-card text-[13px]">
              {recientes.map((l, i) => <li key={i} className="flex justify-between gap-3 px-4 py-2.5"><span className="font-bold">{l.type ?? "—"}</span><span className="text-muted-foreground">{etiqueta[l.result]} · {timeAgo(l.received_at, new Date(o.now))}</span></li>)}
            </ul>
          </>
        )}
      </Section>

      <Section titulo="Diferencias entre Hotmart y tu base" sub="Cuentas activas aquí pero canceladas en Hotmart (o al revés). Lo sano es 0.">
        <SinDatos>El chequeo semanal contra Hotmart se activa cuando se conecte el pago (paso siguiente del embudo).</SinDatos>
      </Section>
    </div>
  );
}
