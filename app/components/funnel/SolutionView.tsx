"use client";

import Image from "next/image";
import { CalendarCheck, FilePdf, ListChecks, Sparkle, ClockCounterClockwise, GlobeHemisphereWest } from "@phosphor-icons/react";
import { FunnelFrame } from "./FunnelFrame";
import { useRequireQuiz } from "./Gate";
import { Accent, Card, CheckList, Cta, Eyebrow, H2, IconChip } from "./ui";
import { GRADOS, MATERIAS, PAISES } from "@/lib/types";
import { useTrackOnce } from "@/lib/funnel/track";

const PASOS = [
  { Icon: CalendarCheck, t: "Eliges tu semana", d: "Materia, grado y tema de cada día, en un solo planner." },
  { Icon: Sparkle, t: "La IA arma las fichas", d: "Todas a la vez, alineadas al currículo de tu país." },
  { Icon: FilePdf, t: "Descargas e imprimes", d: "PDF listo, con el solucionario aparte para ti." },
];

const CAPTURAS = [
  { src: "/funnel/app-planner.png", alt: "Planner semanal de Profe Exprés con los temas de cada día", label: "Planner semanal" },
  { src: "/funnel/app-crear.png", alt: "Pantalla de crear una ficha con materia, grado y tema", label: "Crear una ficha" },
  { src: "/funnel/app-ficha.png", alt: "Ficha generada lista para descargar en PDF", label: "Ficha lista" },
];

export function SolutionView() {
  const ok = useRequireQuiz();
  useTrackOnce("solution_view");
  if (!ok) return <FunnelFrame progress={72}><div /></FunnelFrame>;

  return (
    <FunnelFrame progress={80} backHref="/resultado">
      <div className="stagger flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <Eyebrow>La solución</Eyebrow>
          <H2>Pide toda tu semana y recibe <Accent>las fichas ya hechas</Accent></H2>
          <p className="text-[16px] leading-snug text-muted-foreground">Profe Exprés genera las fichas por lotes: planificas la semana una vez y las descargas todas.</p>
        </div>

        <ol className="flex flex-col gap-4">
          {PASOS.map(({ Icon, t, d }, i) => (
            <li key={t} className="flex items-start gap-3">
              <IconChip><Icon size={22} weight="duotone" /></IconChip>
              <div>
                <p className="text-[17px] font-extrabold">{i + 1}. {t}</p>
                <p className="text-[15px] leading-snug text-muted-foreground">{d}</p>
              </div>
            </li>
          ))}
        </ol>

        <section aria-label="La app por dentro" className="flex flex-col gap-3">
          <p className="text-[13px] font-extrabold uppercase tracking-wide text-muted-foreground">La app por dentro</p>
          <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2">
            {CAPTURAS.map((c) => (
              <figure key={c.src} className="w-[220px] shrink-0 snap-center">
                <Image src={c.src} alt={c.alt} width={390} height={844} className="h-auto w-full rounded-[20px]" style={{ boxShadow: "0 14px 32px -16px color-mix(in oklab, var(--primary) 50%, transparent)", border: "1px solid var(--border)" }} />
                <figcaption className="mt-2 text-center text-[13px] font-bold text-muted-foreground">{c.label}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <Card>
          <p className="mb-3 font-display text-[19px] font-extrabold">Lo que incluye</p>
          <CheckList items={[
            "Fichas en PDF listas para imprimir",
            "Solucionario aparte, solo para ti",
            "Planner de la semana completa",
            "Historial de todo lo que creaste",
            "Currículo según tu país",
            "Preguntas de opción múltiple, completar, desarrollo y vocabulario",
          ]} />
        </Card>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2"><ListChecks size={20} weight="duotone" color="var(--primary)" /><p className="text-[15px] font-extrabold">Materias</p></div>
          <Chips items={[...MATERIAS]} />
          <div className="flex items-center gap-2 pt-1"><ClockCounterClockwise size={20} weight="duotone" color="var(--primary)" /><p className="text-[15px] font-extrabold">Grados</p></div>
          <Chips items={[...GRADOS]} />
          <div className="flex items-center gap-2 pt-1"><GlobeHemisphereWest size={20} weight="duotone" color="var(--primary)" /><p className="text-[15px] font-extrabold">Currículo de</p></div>
          <Chips items={[...PAISES]} />
        </div>

        <Cta href="/prueba-social">Continuar</Cta>
      </div>
    </FunnelFrame>
  );
}

function Chips({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((m) => <li key={m} className="rounded-full px-3 py-1.5 text-[13px] font-bold" style={{ background: "var(--sunken)" }}>{m}</li>)}
    </ul>
  );
}
