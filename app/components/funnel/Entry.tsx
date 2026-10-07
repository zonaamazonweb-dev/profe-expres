"use client";

import Image from "next/image";
import { Printer, CalendarCheck, GlobeHemisphereWest } from "@phosphor-icons/react";
import { FunnelFrame } from "./FunnelFrame";
import { Accent, Cta, Eyebrow, H1, IconChip } from "./ui";

export function Entry() {
  return (
    <FunnelFrame progress={0} hideProgress>
      <div className="stagger flex flex-1 flex-col gap-6">
        <div className="flex flex-col gap-3">
          <Eyebrow>Para profes de primaria</Eyebrow>
          <H1>Domingo en la noche, Word abierto… <Accent>¿y si la semana ya estuviera lista?</Accent></H1>
          <p className="text-[17px] leading-snug text-muted-foreground">
            Profe Exprés arma las fichas de toda tu semana en minutos. Responde 5 preguntas (<b className="text-foreground">menos de 2 minutos</b>) y mira cuántas horas puedes recuperar.
          </p>
        </div>

        <div className="rounded-[20px] p-[1.5px]" style={{ background: "linear-gradient(135deg, var(--primary), var(--accent-2))" }}>
          <div className="flex items-center gap-4 rounded-[18.5px] p-4" style={{ background: "var(--card)" }}>
            <Image src="/funnel/mascota.webp" alt="Cerebrito, el asistente de Profe Exprés" width={72} height={72} priority className="size-[72px] shrink-0" />
            <p className="text-[16px] font-bold leading-snug">Una ficha completa en <span style={{ color: "var(--primary)" }}>15–25 segundos</span>, sobre tu tema y tu grado.</p>
          </div>
        </div>

        <ul className="flex flex-col gap-3">
          {[
            { Icon: Printer, t: "Sobre tu tema y tu grado exactos" },
            { Icon: CalendarCheck, t: "Toda tu semana de una sola vez" },
            { Icon: GlobeHemisphereWest, t: "Con el currículo de tu país" },
          ].map(({ Icon, t }) => (
            <li key={t} className="flex items-center gap-3 text-[16px] font-bold">
              <IconChip><Icon size={22} weight="duotone" /></IconChip>{t}
            </li>
          ))}
        </ul>

        <div className="mt-auto flex flex-col gap-3 pt-2">
          <Cta href="/quiz">Empezar mis 5 preguntas</Cta>
          <p className="text-center text-[13px] text-muted-foreground">Sin registro ni contraseña. Tus respuestas se quedan en tu navegador.</p>
        </div>
      </div>
    </FunnelFrame>
  );
}
