import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { createServiceClient } from "@/lib/supabase/admin";
import { PageTitle, ResponsiveRows, SinDatos, Stat, StatGrid } from "@/components/admin/ui";
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
  const activasSemana = seenWithinDays(perfiles.filter((p) => p.role !== "admin"), 7);

  return (
    <div className="flex flex-col gap-6">
      <PageTitle titulo="Usuarias" sub="Quién tiene acceso a tu app. Aquí también puedes agregar a alguien a mano si el acceso no le llegó." />
      <AddUserForm canAct={admin.mfaVerified} />

      <StatGrid cols={3}>
        <Stat label="Usuarias en total" value={formatInt(total)} insight={total === 0 ? "Aún no hay usuarias." : undefined} />
        <Stat label="Con acceso activo" value={formatInt(activas)} />
        <Stat label="Entraron en los últimos 7 días" value={total === 0 ? null : formatInt(activasSemana)} span />
      </StatGrid>

      <form className="flex flex-wrap items-center gap-2" role="search">
        <input name="q" defaultValue={q} placeholder="Buscar por correo o nombre" aria-label="Buscar usuaria"
          className="h-11 w-full max-w-xs rounded-[14px] border-[1.5px] border-border bg-card px-3 text-[13px] font-bold outline-none focus:border-[var(--primary)]" />
        <select name="estado" defaultValue={estado} aria-label="Filtrar por estado"
          className="h-11 rounded-[14px] border-[1.5px] border-border bg-card px-3 text-[13px] font-bold">
          <option value="">Todos los estados</option>
          {Object.entries(ESTADOS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <button className="h-11 rounded-[14px] px-4 text-[13px] font-bold text-white" style={{ background: "var(--primary)" }}>Buscar</button>
        {(q || estado) && <Link href="/admin/usuarias" className="text-[12.5px] font-bold text-muted-foreground">Limpiar</Link>}
      </form>

      {visibles.length === 0 ? (
        <SinDatos>{perfiles.length <= 1 ? "Todavía no hay usuarias. Cuando alguien pague o la agregues a mano, aparece aquí." : "Ninguna cuenta coincide con esa búsqueda."}</SinDatos>
      ) : (
        <ResponsiveRows
          rows={visibles}
          rowKey={(p) => p.id}
          cols={[
            { label: "Usuaria", primary: true, render: (p) => (
              <>
                <span>{p.full_name ?? "Sin nombre"}</span>
                {p.role === "admin" && <span className="ml-2 rounded-full bg-[var(--sunken)] px-2 py-0.5 text-[10px] font-extrabold text-[var(--primary)]">Dueña</span>}
                <span className="block break-all text-[12px] font-normal text-muted-foreground">{p.email}</span>
              </>) },
            { label: "Estado", render: (p) => { const st = ESTADOS[p.status] ?? { label: p.status, color: "#716C7E" }; return <span style={{ color: st.color }}>● {st.label}</span>; } },
            { label: "Origen", render: (p) => (p.access_origin === "manual" ? "A mano" : "Hotmart") },
            { label: "Alta", render: (p) => formatDate(p.created_at) },
            { label: "Última actividad", render: (p) => timeAgo(p.last_seen_at) },
          ]}
          actions={(p) => (p.role === "admin" ? <span className="text-[11.5px] text-muted-foreground">—</span> : <RowActions userId={p.id} status={p.status} canAct={admin.mfaVerified} />)}
        />
      )}
    </div>
  );
}
