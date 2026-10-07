import { requireAdmin } from "@/lib/admin/auth";
import { createSessionClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { MfaPanel } from "@/components/admin/MfaPanel";
import { PageTitle } from "@/components/admin/ui";

const ACCIONES: Record<string, string> = {
  "usuaria.alta_manual": "Agregó una usuaria a mano",
  "usuaria.desactivar": "Desactivó una cuenta",
  "usuaria.activar": "Reactivó una cuenta",
  "usuaria.enlace_acceso": "Generó un enlace de acceso",
  "gasto.adquisicion": "Registró un gasto de adquisición",
  "gasto.costo": "Registró un costo",
};

export default async function SeguridadPage({ searchParams }: { searchParams: Promise<{ necesario?: string }> }) {
  const admin = await requireAdmin();
  const { necesario } = await searchParams;

  const supabase = await createSessionClient();
  const { data: factors } = await supabase.auth.mfa.listFactors();
  const verified = factors?.totp?.find((f) => f.status === "verified") ?? null;

  const { data: audit } = await createServiceClient()
    .from("admin_audit_log")
    .select("id, action, target_email, created_at")
    .order("created_at", { ascending: false })
    .limit(15);

  return (
    <div className="flex flex-col gap-6">
      <PageTitle titulo="Seguridad" sub="Quién puede entrar al panel y qué se hizo en él." />
      <MfaPanel factorId={verified?.id ?? null} mfaVerified={admin.mfaVerified} required={necesario === "1"} />

      <section>
        <h2 className="mb-2 text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">Registro de actividad</h2>
        {!audit || audit.length === 0 ? (
          <p className="rounded-[20px] border-[1.5px] border-dashed border-border p-4 text-[13px] text-muted-foreground">
            Sin datos. Cada acción delicada que hagas en el panel va a quedar anotada aquí.
          </p>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-[20px] bg-card">
            {audit.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 px-4 py-3 text-[13px]">
                <span className="font-bold">{ACCIONES[a.action] ?? a.action}{a.target_email ? ` · ${a.target_email}` : ""}</span>
                <time className="shrink-0 text-[12px] text-muted-foreground">
                  {new Date(a.created_at).toLocaleString("es", { dateStyle: "medium", timeStyle: "short" })}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
