"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ShieldWarning, ArrowClockwise } from "@phosphor-icons/react";
import { createBrowserSupabase } from "@/lib/supabase/browser";

interface Props {
  factorId: string | null; // factor TOTP ya verificado (si existe)
  mfaVerified: boolean;
  required: boolean;
}

export function MfaPanel({ factorId, mfaVerified, required }: Props) {
  const router = useRouter();
  const [enroll, setEnroll] = useState<{ id: string; qr: string; secret: string } | null>(null);
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function startEnroll() {
    setBusy(true);
    setMsg("");
    const supabase = createBrowserSupabase();
    // Si quedó un intento a medias sin verificar, se limpia para no acumular factores.
    const { data: list } = await supabase.auth.mfa.listFactors();
    for (const f of list?.all ?? []) {
      if (f.factor_type === "totp" && f.status === "unverified") await supabase.auth.mfa.unenroll({ factorId: f.id });
    }
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "Autenticador" });
    setBusy(false);
    if (error || !data) return setMsg("No se pudo iniciar. Intenta de nuevo.");
    setEnroll({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
  }

  async function verify(id: string) {
    if (!/^\d{6}$/.test(code)) return setMsg("El código tiene 6 dígitos.");
    setBusy(true);
    setMsg("");
    const supabase = createBrowserSupabase();
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: id, code });
    setBusy(false);
    if (error) return setMsg("Código incorrecto. Revisa el de tu app autenticadora.");
    setEnroll(null);
    setCode("");
    router.refresh();
  }

  if (mfaVerified) {
    return (
      <Estado ok titulo="Doble verificación activa en esta sesión">
        Ya puedes agregar usuarias, activar o desactivar cuentas y generar enlaces de acceso.
      </Estado>
    );
  }

  if (factorId) {
    return (
      <div className="flex flex-col gap-3">
        <Estado titulo={required ? "Esta acción pide tu código" : "Falta verificar tu código en esta sesión"}>
          Abre tu app autenticadora (Google Authenticator, Authy, 1Password…) y escribe el código de 6 dígitos.
        </Estado>
        <CodeForm code={code} setCode={setCode} busy={busy} onSubmit={() => verify(factorId)} label="Verificar" />
        {msg && <p className="text-[12.5px] font-semibold text-destructive">{msg}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Estado titulo={required ? "Primero activa la doble verificación" : "La doble verificación no está activa"}>
        Protege las acciones delicadas del panel (agregar usuarias, desactivar cuentas). Se hace una sola vez.
      </Estado>
      {!enroll ? (
        <button
          onClick={startEnroll}
          disabled={busy}
          className="flex h-11 w-fit items-center gap-2 rounded-[14px] px-5 text-[14px] font-bold text-white disabled:opacity-60"
          style={{ background: "var(--primary)" }}
        >
          {busy && <ArrowClockwise size={16} className="animate-spin" />} Activar doble verificación
        </button>
      ) : (
        <div className="flex flex-col gap-3 rounded-[20px] bg-card p-4">
          <p className="text-[13px] font-bold">1. Escanea este código con tu app autenticadora</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={enroll.qr} alt="Código QR para tu app autenticadora" className="h-44 w-44 rounded-[12px] bg-white p-2" />
          <p className="text-[12px] text-muted-foreground">
            ¿No puedes escanear? Escribe esta clave a mano: <span className="font-mono font-bold text-foreground">{enroll.secret}</span>
          </p>
          <p className="text-[13px] font-bold">2. Escribe el código de 6 dígitos que te muestra</p>
          <CodeForm code={code} setCode={setCode} busy={busy} onSubmit={() => verify(enroll.id)} label="Activar" />
          {msg && <p className="text-[12.5px] font-semibold text-destructive">{msg}</p>}
        </div>
      )}
      {msg && !enroll && <p className="text-[12.5px] font-semibold text-destructive">{msg}</p>}
    </div>
  );
}

function CodeForm({ code, setCode, busy, onSubmit, label }: { code: string; setCode: (v: string) => void; busy: boolean; onSubmit: () => void; label: string }) {
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
      className="flex items-center gap-2"
    >
      <input
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
        inputMode="numeric"
        autoComplete="one-time-code"
        placeholder="000000"
        aria-label="Código de 6 dígitos"
        className="font-display h-12 w-40 rounded-[14px] border-[1.5px] border-border bg-card text-center text-[22px] font-extrabold tracking-[0.3em] outline-none focus:border-[var(--primary)]"
      />
      <button
        type="submit"
        disabled={busy}
        className="flex h-12 items-center gap-2 rounded-[14px] px-5 text-[14px] font-bold text-white disabled:opacity-60"
        style={{ background: "var(--primary)" }}
      >
        {busy && <ArrowClockwise size={16} className="animate-spin" />} {label}
      </button>
    </form>
  );
}

function Estado({ ok, titulo, children }: { ok?: boolean; titulo: string; children: React.ReactNode }) {
  const Icon = ok ? ShieldCheck : ShieldWarning;
  return (
    <div className="flex items-start gap-3 rounded-[20px] bg-card p-4">
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px]"
        style={{ background: ok ? "color-mix(in oklab, #2F9E5B 14%, transparent)" : "color-mix(in oklab, #F5A623 18%, transparent)" }}
      >
        <Icon size={20} weight="fill" color={ok ? "#2F9E5B" : "#B7791F"} />
      </span>
      <div>
        <h3 className="text-[14px] font-extrabold">{titulo}</h3>
        <p className="mt-0.5 text-[12.5px] text-muted-foreground">{children}</p>
      </div>
    </div>
  );
}
