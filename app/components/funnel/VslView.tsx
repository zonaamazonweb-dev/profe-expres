"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { PlayCircle } from "@phosphor-icons/react";
import { FunnelFrame } from "./FunnelFrame";
import { useRequireQuiz } from "./Gate";
import { Cta, Eyebrow, H2 } from "./ui";
import { FUNNEL } from "@/lib/funnel/config";
import { useTrackOnce } from "@/lib/funnel/track";

/** Etapa del video de ventas. Sin video configurado muestra el escenario reservado y el botón aparece de inmediato. */
export function VslView() {
  const ok = useRequireQuiz();
  useTrackOnce("vsl_view");
  const hasVideo = Boolean(FUNNEL.vslUrl);
  const [ready, setReady] = useState(!hasVideo);

  useEffect(() => {
    if (!hasVideo) return;
    const t = window.setTimeout(() => setReady(true), FUNNEL.vslButtonDelay * 1000);
    return () => window.clearTimeout(t);
  }, [hasVideo]);

  if (!ok) return <FunnelFrame progress={88}><div /></FunnelFrame>;

  const isFile = /\.(mp4|webm|m3u8)(\?|$)/i.test(FUNNEL.vslUrl);

  return (
    <FunnelFrame progress={94} backHref="/prueba-social">
      <div className="stagger flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Eyebrow>Mira esto antes de decidir</Eyebrow>
          <H2>Así se ve Profe Exprés trabajando</H2>
        </div>

        <div className="relative mx-auto aspect-[9/16] w-full max-w-[320px] overflow-hidden rounded-[20px]" style={{ background: "var(--sunken)", boxShadow: "0 18px 40px -20px color-mix(in oklab, var(--primary) 55%, transparent)" }}>
          {hasVideo ? (
            isFile ? (
              <video src={FUNNEL.vslUrl} controls playsInline className="size-full object-cover" />
            ) : (
              <iframe src={FUNNEL.vslUrl} title="Video de Profe Exprés" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen className="size-full border-0" />
            )
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-3 p-6 text-center">
              <Image src="/funnel/mascota.webp" alt="" width={96} height={96} />
              <PlayCircle size={48} weight="fill" color="var(--primary)" />
              <p className="text-[15px] font-bold">Aquí va el video de presentación</p>
              <p className="text-[13px] text-muted-foreground">Mientras llega, puedes ver la oferta completa.</p>
            </div>
          )}
        </div>

        <div className="min-h-14">
          {ready ? <Cta href="/oferta">Ver la oferta</Cta> : <p className="text-center text-[14px] text-muted-foreground">El botón aparece en unos segundos…</p>}
        </div>
      </div>
    </FunnelFrame>
  );
}
