import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { PageTitle, Panel, SinDatos, Stat } from "@/components/admin/ui";
import { AddUserForm, RowActions } from "@/components/admin/UserActions";
import { formatDate, formatInt, timeAgo } from "@/lib/admin/format";
import { seenWithinDays } from "@/lib/admin/metrics";

const ESTADOS: Record<string, { label: string; color: string }> = {
  active: { label: "Activa", color: "#2F9E5B" },
  past_due: { label: "Pago atrasado", color: "#B7791F" },
  cancelled: { label: "Cancelada", color: "#716C7E" },
  refunded: { label: "Reembolsada", color: "#716C7E" },
  chargeback: { label: "Contracargo", color: "#E5484D" },
  disabled: { label: "Desactivada", color: "#E5484D" },
};

export default async function UsuariasPage({ searchParams }: { searchParams: Promise<{ q?: string; estado?: string }> }) {
  const admin = await requireAdmin();
  const { q = "", estado = "" } = await searchParams;

  const service = createServiceClient();
  const { data: todas } = await service
    .from("profiles")
    .select("id,email,full_name,role,status,access_origin,source,created_at,last_seen_at")
    .order("created_at", { ascending: false })
    .limit(500);

  const perfiles = todas ?? [];
  const termino = q.trim().toLowerCase().slice(0, 100);
  const visibles = perfiles.filter(
    (p) =>
      (!estado || p.status === estado) &&
      (!termino || p.email.toLowerCase().includes(termino) || (p.full_name ?? "").toLowerCase().includes(termino)),
  );

  const activas = perfiles.filter((p) => p.status === "active" && p.role !== "admin").length;
  const total = perfiles.filter((p) => p.role !== "admin").length;
  const activasSemana = seenWithinDays(perfiles, 7);

  return (
    <div className="flex flex-col gap-6">
      <PageTitle titulo="Usuarias" sub="Quién tiene acceso a tu app. Aquí también puedes agregar a alguien a mano si el acceso no le llegó." />
      <AddUserForm canAct={admin.mfaVerified} />

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Usuarias en total" value={formatInt(total)} insight={total === 0 ? "Aún no hay usuarias." : undefined} />
        <Stat label="Con acceso activo" value={formatInt(activas)} />
        <Stat label="Entraron en los últimos 7 días" value={total === 0 ? null : formatInt(activasSemana)} />
      </div>

      <form className="flex flex-wrap items-center gap-2" role="search">
        <input name="q" defaultValue={q} placeholder="Buscar por correo o nombre" aria-label="Buscar usuaria"
          className="h-10 w-full max-w-xs rounded-[14px] border-[1.5px] border-border bg-card px-3 text-[13px] font-bold outline-none focus:border-[var(--primary)]" />
        <select name="estado" defaultValue={estado} aria-label="Filtrar por estado"
          className="h-10 rounded-[14px] border-[1.5px] border-border bg-card px-3 text-[13px] font-bold">
          <option value="">Todos los estados</option>
          {Object.entries(ESTADOS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <button className="h-10 rounded-[14px] px-4 text-[13px] font-bold text-white" style={{ background: "var(--primary)" }}>Buscar</button>
        {(q || estado) && <Link href="/admin/usuarias" className="text-[12.5px] font-bold text-muted-foreground">Limpiar</Link>}
      </form>

      {visibles.length === 0 ? (
        <SinDatos>{perfiles.length <= 1 ? "Todavía no hay usuarias. Cuando alguien pague o la agregues a mano, aparece aquí." : "Ninguna cuenta coincide con esa búsqueda."}</SinDatos>
      ) : (
        <Panel className="overflow-x-auto !p-0">
          <table className="w-full min-w-[720px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-border text-[10.5px] font-extrabold uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Usuaria</th><th className="px-3 py-3">Estado</th><th className="px-3 py-3">Origen</th>
                <th className="px-3 py-3">Alta</th><th className="px-3 py-3">Última actividad</th><th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visibles.map((p) => {
                const st = ESTADOS[p.status] ?? { label: p.status, color: "#716C7E" };
                return (
                  <tr key={p.id}>
                    <td className="px-4 py-3">
                      <p className="font-extrabold">{p.full_name ?? "Sin nombre"}{p.role === "admin" && <span className="ml-2 rounded-full bg-[var(--sunken)] px-2 py-0.5 text-[10px] font-extrabold text-[var(--primary)]">Dueña</span>}</p>
                      <p className="text-[12px] text-muted-foreground">{p.email}</p>
                    </td>
                    <td className="px-3 py-3"><span className="font-bold" style={{ color: st.color }}>● {st.label}</span></td>
                    <td className="px-3 py-3">{p.access_origin === "manual" ? "A mano" : "Hotmart"}</td>
                    <td className="px-3 py-3 text-muted-foreground">{formatDate(p.created_at)}</td>
                    <td className="px-3 py-3 text-muted-foreground">{timeAgo(p.last_seen_at)}</td>
                    <td className="px-4 py-3">
                      {p.role === "admin" ? <span className="block text-right text-[11.5px] text-muted-foreground">—</span> : <RowActions userId={p.id} status={p.status} canAct={admin.mfaVerified} />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Panel>
      )}
    </div>
  );
}
