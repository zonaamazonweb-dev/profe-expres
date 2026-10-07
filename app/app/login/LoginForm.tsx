"use client";

import { useActionState } from "react";
import { Sparkle, EnvelopeSimple, ArrowRight, ArrowClockwise } from "@phosphor-icons/react";
import { requestCode, verifyCode, type LoginState } from "./actions";

const inicial: LoginState = { step: "email" };

export function LoginForm({ next, errorEnlace }: { next: string; errorEnlace: boolean }) {
  const [emailState, emailAction, emailPending] = useActionState(requestCode, inicial);
  const [codeState, codeAction, codePending] = useActionState(verifyCode, inicial);

  const enPasoCodigo = emailState.step === "code" && codeState.step !== "email";
  const email = codeState.email ?? emailState.email ?? "";
  const mensaje = errorEnlace && !enPasoCodigo ? "El enlace no funcionó o venció. Pide uno nuevo." : enPasoCodigo ? (codeState.message ?? emailState.message) : emailState.message;

  return (
    <div className="w-full max-w-sm rounded-[24px] bg-card p-6 shadow-[0_18px_40px_-24px_rgb(123_93_251_/_0.45)]">
      <div className="flex items-center gap-2">
        <span
          className="flex h-[34px] w-[34px] items-center justify-center rounded-[11px]"
          style={{ background: "linear-gradient(135deg, var(--primary), var(--accent-2))" }}
        >
          <Sparkle size={18} weight="fill" color="#fff" />
        </span>
        <span className="font-display text-xl font-extrabold">Profe Exprés</span>
      </div>

      <h1 className="font-display mt-5 text-[22px] font-extrabold leading-tight">
        {enPasoCodigo ? "Revisa tu correo" : "Entra a tu cuenta"}
      </h1>
      <p className="mt-1 text-[13px] text-muted-foreground">
        {enPasoCodigo
          ? `Te escribimos a ${email}. Abre el enlace del correo desde este mismo navegador. Si el correo trae un código, escríbelo abajo.`
          : "Te enviamos un correo para entrar. Solo entran cuentas con acceso."}
      </p>

      {!enPasoCodigo ? (
        <form action={emailAction} className="mt-5 flex flex-col gap-3">
          <input type="hidden" name="next" value={next} />
          <label className="text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground" htmlFor="email">
            Tu correo
          </label>
          <div className="relative">
            <EnvelopeSimple size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              placeholder="tucorreo@ejemplo.com"
              className="h-12 w-full rounded-[14px] border-[1.5px] border-border bg-transparent pl-9 pr-3 text-[14px] font-bold outline-none focus:border-[var(--primary)]"
            />
          </div>
          <Boton pending={emailPending}>Enviarme el acceso</Boton>
        </form>
      ) : (
        <form action={codeAction} className="mt-5 flex flex-col gap-3">
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="next" value={next} />
          <label className="text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground" htmlFor="code">
            Código (si el correo lo trae)
          </label>
          <input
            id="code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6,8}"
            maxLength={8}
            required
            autoFocus
            placeholder="000000"
            className="font-display h-14 w-full rounded-[14px] border-[1.5px] border-border bg-transparent text-center text-[26px] font-extrabold tracking-[0.35em] outline-none focus:border-[var(--primary)]"
          />
          <Boton pending={codePending}>Entrar con el código</Boton>
        </form>
      )}

      {mensaje && (
        <p role="status" className="mt-3 text-[12.5px] font-semibold text-muted-foreground">
          {mensaje}
        </p>
      )}
    </div>
  );
}

function Boton({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-12 items-center justify-center gap-2 rounded-[14px] text-[15px] font-bold text-white disabled:opacity-60"
      style={{
        background: "linear-gradient(180deg, color-mix(in oklab, var(--primary) 88%, white), var(--primary))",
        boxShadow: "0 10px 24px -8px color-mix(in oklab, var(--primary) 45%, transparent)",
      }}
    >
      {pending ? <ArrowClockwise size={18} className="animate-spin" /> : null}
      {children}
      {!pending && <ArrowRight size={16} weight="bold" />}
    </button>
  );
}
