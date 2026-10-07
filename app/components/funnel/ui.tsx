"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Check } from "@phosphor-icons/react";
import type { ReactNode } from "react";

/** Botón principal del camino de venta: 56px, un solo color de acento, sombra tintada. */
export function Cta({
  href, onClick, children, disabled = false, className = "",
}: { href?: string; onClick?: () => void; children: ReactNode; disabled?: boolean; className?: string }) {
  const cls = `flex min-h-14 w-full items-center justify-center gap-2 rounded-[14px] px-6 text-[17px] font-extrabold text-white transition-opacity ${disabled ? "opacity-50" : ""} ${className}`;
  const style = { background: "var(--primary)", boxShadow: disabled ? "none" : "0 12px 28px -10px color-mix(in oklab, var(--primary) 55%, transparent)" };
  if (href && !disabled) {
    return (
      <motion.div whileTap={{ scale: 0.97 }} transition={{ duration: 0.12 }}>
        <Link href={href} onClick={onClick} className={cls} style={style}>{children}</Link>
      </motion.div>
    );
  }
  return (
    <motion.button type="button" whileTap={disabled ? undefined : { scale: 0.97 }} transition={{ duration: 0.12 }}
      onClick={disabled ? undefined : onClick} disabled={disabled} className={cls} style={style}>
      {children}
    </motion.button>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-[12px] font-extrabold uppercase tracking-wide" style={{ color: "var(--primary)" }}>{children}</p>;
}

export function H1({ children }: { children: ReactNode }) {
  return <h1 className="font-display text-[30px] font-extrabold leading-[1.12]">{children}</h1>;
}

export function H2({ children }: { children: ReactNode }) {
  return <h2 className="font-display text-[24px] font-extrabold leading-tight">{children}</h2>;
}

/** Palabra que vende: va en el color de acento. */
export function Accent({ children }: { children: ReactNode }) {
  return <span style={{ color: "var(--primary)" }}>{children}</span>;
}

export function Card({ children, className = "", sunken = false }: { children: ReactNode; className?: string; sunken?: boolean }) {
  return (
    <div className={`rounded-[20px] p-5 ${className}`}
      style={sunken ? { background: "var(--sunken)" } : { background: "var(--card)", boxShadow: "0 10px 28px -18px color-mix(in oklab, var(--primary) 45%, transparent)" }}>
      {children}
    </div>
  );
}

/** Check propio de la marca (nunca el ✓ del sistema). */
export function CheckDot() {
  return (
    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full"
      style={{ background: "color-mix(in oklab, var(--primary) 14%, transparent)", color: "var(--primary)" }}>
      <Check size={14} weight="bold" />
    </span>
  );
}

export function CheckList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((t, i) => (
        <li key={i} className="flex items-start gap-3 text-[16px] leading-snug">
          <CheckDot />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

export function IconChip({ children }: { children: ReactNode }) {
  return (
    <span className="flex size-11 shrink-0 items-center justify-center rounded-[14px]"
      style={{ background: "color-mix(in oklab, var(--primary) 11%, transparent)", color: "var(--primary)" }}>
      {children}
    </span>
  );
}
