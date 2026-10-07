"use client";

import { useMemo } from "react";
import Image from "next/image";
import { Clock, Heart } from "@phosphor-icons/react";
import { FunnelFrame } from "./FunnelFrame";
import { useRequireQuiz } from "./Gate";
import { Accent, Card, Cta, Eyebrow, H2 } from "./ui";
import { computeResultado, SEMANAS_DE_CLASE } from "@/lib/funnel/quiz";
import { useAnswers } from "@/lib/funnel/state";
import { useTrackOnce } from "@/lib/funnel/track";

export function ResultView() {
  const ok = useRequireQuiz();
  const answers = useAnswers();
  const r = useMemo(() => computeResultado(answers), [answers]);
  useTrackOnce("result_view");
  if (!ok) return <FunnelFrame progress={66}><div /></FunnelFrame>;

  return (
    <FunnelFrame progress={72} backHref="/quiz">
      <div className="stagger flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Eyebrow>Tu resultado</Eyebrow>
          <H2>{r.titulo}</H2>
          <p className="text-[16px] leading-snug text-muted-foreground">{r.explicacion}</p>
        </div>

        <Card>
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-[14px]" style={{ background: "color-mix(in oklab, var(--primary) 11%, transparent)", color: "var(--primary)" }}><Clock size={22} weight="duotone" /></span>
            <div>
              <p className="text-[14px] font-bold text-muted-foreground">Preparando fichas, hoy pierdes</p>
              <p className="font-display text-[40px] font-extrabold leading-none tabular-nums"><Accent>≈ {r.horasAnio}</Accent> h</p>
              <p className="mt-1 text-[14px] text-muted-foreground">al año ({r.horasSemana} h por semana × {SEMANAS_DE_CLASE} semanas de clase, según tus respuestas).</p>
            </div>
          </div>
          <div className="mt-5 flex flex-col gap-3" aria-label="Comparación de tiempo">
            <Barra label="Hoy" value="Tu semana de fichas, a mano" width={100} muted />
            <Barra label="Con Profe Exprés" value="Una ficha completa en 15–25 segundos" width={12} />
          </div>
        </Card>

        {r.visualizar && (
          <Card sunken>
            <div className="flex items-start gap-3">
              <Heart size={22} weight="fill" color="var(--accent-2)" className="mt-0.5 shrink-0" />
              <p className="text-[16px] leading-snug">Con ese tiempo, tú dijiste que querrías: <b>{r.visualizar.toLowerCase()}</b>.</p>
            </div>
          </Card>
        )}

        <div className="flex items-center gap-3">
          <Image src="/funnel/mascota.webp" alt="" width={56} height={56} className="size-14 shrink-0" />
          <p className="text-[15px] leading-snug"><b>Se puede resolver.</b> Te muestro cómo funciona Profe Exprés por dentro.</p>
        </div>

        <Cta href="/solucion">Ver cómo se resuelve</Cta>
      </div>
    </FunnelFrame>
  );
}

function Barra({ label, value, width, muted = false }: { label: string; value: string; width: number; muted?: boolean }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 text-[13px]"><span className="font-extrabold">{label}</span><span className="text-right text-muted-foreground">{value}</span></div>
      <div className="mt-1 h-3 rounded-full" style={{ background: "var(--sunken)" }}>
        <div className="h-full rounded-full" style={{ width: `${width}%`, background: muted ? "color-mix(in oklab, var(--muted-foreground) 55%, var(--sunken))" : "var(--primary)" }} />
      </div>
    </div>
  );
}
