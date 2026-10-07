"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { motion } from "motion/react";
import { ArrowLeft } from "@phosphor-icons/react";
import { captureAttribution } from "@/lib/funnel/attribution";
import { useTrackOnce } from "@/lib/funnel/track";

/**
 * Marco común de todas las pantallas del camino de venta: una columna centrada (~450px en escritorio),
 * barra de progreso y captura de los parámetros del anuncio.
 */
export function FunnelFrame({
  progress, backHref, onBack, children, bare = false,
}: { progress: number; backHref?: string; onBack?: () => void; children: React.ReactNode; bare?: boolean }) {
  useEffect(() => { captureAttribution(); }, []);
  useTrackOnce("funnel_view");

  return (
    <div className="min-h-dvh" style={{ background: "var(--sunken)" }}>
      <div className="mx-auto flex min-h-dvh w-full max-w-[450px] flex-col bg-background md:shadow-[0_0_80px_-30px_color-mix(in_oklab,var(--primary)_40%,transparent)]">
        <header className="sticky top-0 z-20 bg-background/95 backdrop-blur">
          <div className="flex h-14 items-center gap-2 px-4">
            <div className="flex w-11 justify-start">
              {onBack ? (
                <button type="button" onClick={onBack} aria-label="Volver a la pregunta anterior" className="flex size-11 items-center justify-center rounded-full">
                  <ArrowLeft size={22} weight="bold" />
                </button>
              ) : backHref ? (
                <Link href={backHref} aria-label="Volver" className="flex size-11 items-center justify-center rounded-full">
                  <ArrowLeft size={22} weight="bold" />
                </Link>
              ) : null}
            </div>
            <div className="flex flex-1 items-center justify-center gap-2">
              <Image src="/funnel/mascota.webp" alt="" width={28} height={28} className="size-7" />
              <span className="font-display text-[18px] font-extrabold">Profe Exprés</span>
            </div>
            <div className="w-11" />
          </div>
          <div className="h-1.5 w-full" style={{ background: "var(--sunken)" }} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)} aria-label="Avance">
            <motion.div className="h-full rounded-r-full" style={{ background: "var(--primary)" }} initial={false} animate={{ width: `${progress}%` }} transition={{ duration: 0.4, ease: "easeOut" }} />
          </div>
        </header>
        <main className={`flex flex-1 flex-col ${bare ? "" : "px-5 pb-12 pt-6"}`}>{children}</main>
      </div>
    </div>
  );
}
