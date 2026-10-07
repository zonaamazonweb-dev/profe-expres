"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SquaresFour, CurrencyCircleDollar, Coins, Users, ChartLineUp, Target, Brain, HeartStraight, ShieldCheck,
} from "@phosphor-icons/react";

export const ADMIN_LINKS = [
  { href: "/admin", label: "Resumen", Icon: SquaresFour },
  { href: "/admin/ventas", label: "Ventas", Icon: CurrencyCircleDollar },
  { href: "/admin/ganancia", label: "Ganancia real", Icon: Coins },
  { href: "/admin/usuarias", label: "Usuarias", Icon: Users },
  { href: "/admin/uso", label: "Uso", Icon: ChartLineUp },
  { href: "/admin/negocio", label: "Negocio", Icon: Target },
  { href: "/admin/ia", label: "IA", Icon: Brain },
  { href: "/admin/salud", label: "Salud", Icon: HeartStraight },
  { href: "/admin/seguridad", label: "Seguridad", Icon: ShieldCheck },
] as const;

export function AdminNav({ orientation }: { orientation: "vertical" | "horizontal" }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Panel de administración"
      className={orientation === "vertical" ? "flex flex-col gap-1" : "flex gap-1.5 overflow-x-auto pb-1"}
    >
      {ADMIN_LINKS.map(({ href, label, Icon }) => {
        const activo = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={activo ? "page" : undefined}
            className="flex shrink-0 items-center gap-2.5 rounded-[12px] px-3 py-2 text-[13px] font-bold transition-colors"
            style={{
              color: activo ? "var(--primary)" : "var(--muted-foreground)",
              background: activo ? "color-mix(in oklab, var(--primary) 12%, transparent)" : "transparent",
            }}
          >
            <Icon size={18} weight={activo ? "fill" : "regular"} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
