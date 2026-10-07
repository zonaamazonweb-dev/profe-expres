"use client";

import { useState } from "react";

/** Acción destructiva en dos pasos: primero se pide confirmar, y solo el segundo toque ejecuta. */
export function ConfirmForm({
  action, fields, label, confirmText, confirmLabel, tone = "danger", className = "",
}: {
  action: (formData: FormData) => void | Promise<void>;
  fields: Record<string, string>;
  label: React.ReactNode;
  confirmText: string;
  confirmLabel: string;
  tone?: "danger" | "ok";
  className?: string;
}) {
  const [asking, setAsking] = useState(false);
  const color = tone === "danger" ? "#E5484D" : "#2F9E5B";

  if (!asking) {
    return (
      <button
        type="button"
        onClick={() => setAsking(true)}
        className={`flex min-h-11 items-center justify-center gap-1.5 rounded-[12px] border-[1.5px] border-border px-3 text-[12.5px] font-bold ${className}`}
        style={{ color }}
      >
        {label}
      </button>
    );
  }
  return (
    <form action={action} className="flex flex-col gap-2 rounded-[12px] bg-[var(--sunken)] p-2.5">
      {Object.entries(fields).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <p className="text-[12.5px] font-bold">{confirmText}</p>
      <div className="flex gap-2">
        <button type="submit" className="min-h-11 flex-1 rounded-[10px] px-3 text-[12.5px] font-extrabold text-white" style={{ background: color }}>
          {confirmLabel}
        </button>
        <button type="button" onClick={() => setAsking(false)} className="min-h-11 rounded-[10px] border-[1.5px] border-border bg-card px-3 text-[12.5px] font-bold">
          No
        </button>
      </div>
    </form>
  );
}
