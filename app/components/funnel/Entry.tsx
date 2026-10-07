"use client";

import Image from "next/image";
import { Printer, CalendarCheck, GlobeHemisphereWest } from "@phosphor-icons/react";
import { FunnelFrame } from "./FunnelFrame";
import { Accent, Cta, Eyebrow, H1, IconChip } from "./ui";

export function Entry() {
  return (
    <FunnelFrame progress={0}>
      <div className="stagger flex flex-1 flex-col gap-6">
        <div className="flex flex-col gap-3">
          <Eyebrow>Para profes de primaria</Eyebrow>
          <H1>¿Eres profe? Prepara las fichas de <Accent>toda la semana</Accent> en minutos</H1>
          <p className="text-[17px] leading-snug text-muted-foreground">
            Responde 5 preguntas y te mostramos cómo. Toma <b className="text-foreground">menos de 2 minutos</b>.
          </p>
        </div>

        <div className="relative flex items-center justify-center rounded-[20px] py-8" style={{ background: "var(--sunken)" }}>
          <Image src="/funnel/mascota.webp" alt="Cerebrito, el asistente de Profe Exprés" width={150} height={150} priority className="size-[150px]" />
        </div>

        <ul className="flex flex-col gap-3">
          {[
            { Icon: Printer, t: "Fichas en PDF listas para imprimir" },
            { Icon: CalendarCheck, t: "Toda la semana de una sola vez" },
            { Icon: GlobeHemisphereWest, t: "Para docentes de países hispanohablantes" },
          ].map(({ Icon, t }) => (
            <li key={t} className="flex items-center gap-3 text-[16px] font-bold">
              <IconChip><Icon size={22} weight="duotone" /></IconChip>{t}
            </li>
          ))}
        </ul>

        <div className="mt-auto flex flex-col gap-3 pt-2">
          <Cta href="/quiz">Empezar el quiz</Cta>
          <p className="text-center text-[13px] text-muted-foreground">Sin registro ni contraseña. Tus respuestas se quedan en tu navegador.</p>
        </div>
      </div>
    </FunnelFrame>
  );
}
