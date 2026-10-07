"use client";

import { useActionState, useState } from "react";
import { UserPlus, Copy, Check, LinkSimple, Prohibit, ArrowCounterClockwise, ArrowClockwise } from "@phosphor-icons/react";
import { addUser, setUserActive, accessLinkFor, type ActionState } from "@/app/admin/usuarias/actions";

const vacio: ActionState = { ok: false, message: "" };

function CopyLink({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-2 flex items-center gap-2 rounded-[14px] bg-[var(--sunken)] p-2">
      <input readOnly value={link} aria-label="Enlace de acceso" onFocus={(e) => e.currentTarget.select()}
        className="min-w-0 flex-1 bg-transparent px-2 text-[12px] font-mono outline-none" />
      <button
        type="button"
        onClick={async () => { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
        className="flex h-9 shrink-0 items-center gap-1.5 rounded-[10px] px-3 text-[12px] font-bold text-white"
        style={{ background: "var(--primary)" }}
      >
        {copied ? <Check size={14} weight="bold" /> : <Copy size={14} />} {copied ? "Copiado" : "Copiar"}
      </button>
    </div>
  );
}

export function AddUserForm({ canAct }: { canAct: boolean }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(addUser, vacio);

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 items-center gap-2 rounded-[14px] px-5 text-[14px] font-bold text-white"
        style={{ background: "var(--primary)", boxShadow: "0 10px 24px -8px color-mix(in oklab, var(--primary) 45%, transparent)" }}
      >
        <UserPlus size={18} weight="bold" /> Agregar usuaria
      </button>
      {open && (
        <div className="mt-3 max-w-xl rounded-[20px] bg-card p-4 shadow-[0_8px_20px_-14px_rgb(123_93_251_/_0.30)]">
          <p className="text-[13px] text-muted-foreground">
            Crea la cuenta a mano con su correo y nombre. Después te doy un enlace de acceso para que se lo pases.
          </p>
          {!canAct ? (
            <p className="mt-3 text-[13px] font-bold">
              Primero activa la doble verificación en <a className="underline" style={{ color: "var(--primary)" }} href="/admin/seguridad?necesario=1">Seguridad</a>.
            </p>
          ) : (
            <form action={action} className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">
                Nombre
                <input name="fullName" required minLength={2} maxLength={120} autoComplete="off"
                  className="h-11 rounded-[14px] border-[1.5px] border-border bg-transparent px-3 text-[14px] font-bold normal-case tracking-normal text-foreground outline-none focus:border-[var(--primary)]" />
              </label>
              <label className="flex flex-col gap-1.5 text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">
                Correo
                <input name="email" type="email" required maxLength={254} autoComplete="off"
                  className="h-11 rounded-[14px] border-[1.5px] border-border bg-transparent px-3 text-[14px] font-bold normal-case tracking-normal text-foreground outline-none focus:border-[var(--primary)]" />
              </label>
              <div className="sm:col-span-2">
                <button type="submit" disabled={pending}
                  className="flex h-11 items-center gap-2 rounded-[14px] px-5 text-[14px] font-bold text-white disabled:opacity-60"
                  style={{ background: "var(--primary)" }}>
                  {pending && <ArrowClockwise size={16} className="animate-spin" />} Crear cuenta
                </button>
              </div>
            </form>
          )}
          {state.message && (
            <div className="mt-3" role="status">
              <p className="text-[13px] font-bold" style={{ color: state.ok ? "#2F9E5B" : "#E5484D" }}>{state.message}</p>
              {state.link && <CopyLink link={state.link} />}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function RowActions({ userId, status, canAct }: { userId: string; status: string; canAct: boolean }) {
  const [linkState, linkAction, linkPending] = useActionState(accessLinkFor, vacio);
  const [toggleState, toggleAction, togglePending] = useActionState(setUserActive, vacio);
  const disabled = status === "disabled";

  if (!canAct) return <span className="text-[11.5px] text-muted-foreground">Requiere doble verificación</span>;

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap justify-end gap-1.5">
        {!disabled && (
          <form action={linkAction}>
            <input type="hidden" name="userId" value={userId} />
            <button disabled={linkPending} className="flex h-8 items-center gap-1.5 rounded-[10px] border-[1.5px] border-border px-2.5 text-[11.5px] font-bold disabled:opacity-60">
              <LinkSimple size={14} /> Enlace de acceso
            </button>
          </form>
        )}
        <form action={toggleAction}>
          <input type="hidden" name="userId" value={userId} />
          <input type="hidden" name="activar" value={disabled ? "1" : "0"} />
          <button disabled={togglePending} className="flex h-8 items-center gap-1.5 rounded-[10px] border-[1.5px] border-border px-2.5 text-[11.5px] font-bold disabled:opacity-60"
            style={{ color: disabled ? "#2F9E5B" : "#E5484D" }}>
            {disabled ? <><ArrowCounterClockwise size={14} /> Reactivar</> : <><Prohibit size={14} /> Desactivar</>}
          </button>
        </form>
      </div>
      {(linkState.message || toggleState.message) && (
        <div className="w-full max-w-xs text-right" role="status">
          <p className="text-[11.5px] font-bold" style={{ color: (linkState.message ? linkState.ok : toggleState.ok) ? "#2F9E5B" : "#E5484D" }}>
            {linkState.message || toggleState.message}
          </p>
          {linkState.link && <CopyLink link={linkState.link} />}
        </div>
      )}
    </div>
  );
}
