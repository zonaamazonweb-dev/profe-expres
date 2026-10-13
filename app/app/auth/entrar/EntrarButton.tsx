"use client";

import { useFormStatus } from "react-dom";
import { ArrowRight, ArrowClockwise } from "@phosphor-icons/react";

/** Muestra "Entrando…" mientras se abre la cuenta, para que no parezca que la página se quedó parada. */
export function EntrarButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-[14px] text-[17px] font-extrabold text-white disabled:opacity-80"
      style={{ background: "var(--primary)", boxShadow: "0 12px 28px -10px color-mix(in oklab, var(--primary) 55%, transparent)" }}>
      {pending ? <><ArrowClockwise size={18} weight="bold" className="animate-spin" /> Entrando…</> : <>Entrar a mi cuenta <ArrowRight size={18} weight="bold" /></>}
    </button>
  );
}
