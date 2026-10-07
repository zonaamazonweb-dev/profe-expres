"use client";

import { useActionState, useState } from "react";
import { ArrowClockwise, Plus } from "@phosphor-icons/react";
import { addCost, addSpend, type GastoState } from "@/app/admin/gastos/actions";

const vacio: GastoState = { ok: false, message: "" };
const MONEDAS = ["USD", "EUR", "BRL", "MXN", "COP", "ARS", "CLP", "PEN"];
const CANALES = ["ads_meta", "afiliado", "contenido", "email", "directo", "otro"];
const TIPOS = [
  { id: "infra", label: "Servidores (Vercel, Supabase)" },
  { id: "email", label: "Emails (Resend)" },
  { id: "tax", label: "Impuestos" },
  { id: "other", label: "Otro costo" },
];

const campo = "h-11 rounded-[14px] border-[1.5px] border-border bg-transparent px-3 text-[14px] font-bold normal-case tracking-normal text-foreground outline-none focus:border-[var(--primary)]";
const etiqueta = "flex flex-col gap-1.5 text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground";

export function GastoForm({ tipo, canAct, currencyDefault, mes }: { tipo: "gasto" | "costo"; canAct: boolean; currencyDefault: string; mes: { start: string; end: string } }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(tipo === "gasto" ? addSpend : addCost, vacio);

  return (
    <div>
      <button onClick={() => setOpen((v) => !v)} className="flex h-10 items-center gap-2 rounded-[14px] border-[1.5px] border-border bg-card px-4 text-[13px] font-bold">
        <Plus size={16} weight="bold" /> {tipo === "gasto" ? "Registrar gasto de adquisición" : "Registrar un costo"}
      </button>
      {open && (
        <div className="mt-3 max-w-2xl rounded-[20px] bg-card p-4">
          {!canAct ? (
            <p className="text-[13px] font-bold">Primero activa la doble verificación en <a className="underline" style={{ color: "var(--primary)" }} href="/admin/seguridad?necesario=1">Seguridad</a>.</p>
          ) : (
            <form action={action} className="grid gap-3 sm:grid-cols-2">
              {tipo === "gasto" ? (
                <label className={etiqueta}>Canal
                  <input name="channel" list="canales" required className={campo} placeholder="ads_meta, afiliado…" />
                  <datalist id="canales">{CANALES.map((c) => <option key={c} value={c} />)}</datalist>
                </label>
              ) : (
                <label className={etiqueta}>Qué costo es
                  <select name="kind" className={campo}>{TIPOS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}</select>
                </label>
              )}
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <label className={etiqueta}>Monto
                  <input name="amount" type="number" step="0.01" min="0.01" required className={campo} />
                </label>
                <label className={etiqueta}>Moneda
                  <select name="currency" defaultValue={currencyDefault} className={campo}>{MONEDAS.map((m) => <option key={m}>{m}</option>)}</select>
                </label>
              </div>
              <label className={etiqueta}>Desde
                <input name="periodStart" type="date" required defaultValue={mes.start} className={campo} />
              </label>
              <label className={etiqueta}>Hasta
                <input name="periodEnd" type="date" required defaultValue={mes.end} className={campo} />
              </label>
              <label className={`${etiqueta} sm:col-span-2`}>Nota (opcional)
                <input name="note" maxLength={200} className={campo} />
              </label>
              <div className="sm:col-span-2">
                <button type="submit" disabled={pending} className="flex h-11 items-center gap-2 rounded-[14px] px-5 text-[14px] font-bold text-white disabled:opacity-60" style={{ background: "var(--primary)" }}>
                  {pending && <ArrowClockwise size={16} className="animate-spin" />} Guardar
                </button>
              </div>
            </form>
          )}
          {state.message && <p role="status" className="mt-3 text-[13px] font-bold" style={{ color: state.ok ? "#2F9E5B" : "#E5484D" }}>{state.message}</p>}
        </div>
      )}
    </div>
  );
}
