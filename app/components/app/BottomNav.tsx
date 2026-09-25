"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Sparkle, CalendarBlank, ClockCounterClockwise } from "@phosphor-icons/react";

const DESTINOS = [
  { href: "/", label: "Inicio", Icon: House },
  { href: "/crear", label: "Crear", Icon: Sparkle },
  { href: "/planner", label: "Planner", Icon: CalendarBlank },
  { href: "/historial", label: "Historial", Icon: ClockCounterClockwise },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación principal"
      className="sticky bottom-0 z-10 border-t border-border bg-card/90 backdrop-blur px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around">
        {DESTINOS.map(({ href, label, Icon }) => {
          const activo = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 px-3 py-1 text-[11px] font-bold"
              style={{ color: activo ? "var(--primary)" : "var(--muted-foreground)" }}
            >
              <span
                className="flex h-7 w-9 items-center justify-center rounded-[9px]"
                style={{
                  background: activo ? "color-mix(in oklab, var(--primary) 14%, transparent)" : "transparent",
                }}
              >
                <Icon size={19} weight={activo ? "fill" : "regular"} />
              </span>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
