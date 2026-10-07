"use client";

import { Quotes, Timer, Student, Books } from "@phosphor-icons/react";
import { FunnelFrame } from "./FunnelFrame";
import { useRequireQuiz } from "./Gate";
import { Accent, Card, Cta, Eyebrow, H2, IconChip } from "./ui";
import { TESTIMONIALS } from "@/lib/funnel/config";
import { GRADOS, MATERIAS } from "@/lib/types";

/** Prueba social REAL. Las cifras de aquí son verificables; los testimonios solo aparecen cuando existen de verdad. */
export function ProofView() {
  const ok = useRequireQuiz();
  if (!ok) return <FunnelFrame progress={80}><div /></FunnelFrame>;

  return (
    <FunnelFrame progress={88} backHref="/solucion">
      <div className="stagger flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Eyebrow>Hecha para el aula</Eyebrow>
          <H2>Lo que puedes <Accent>comprobar tú misma</Accent></H2>
          <p className="text-[16px] leading-snug text-muted-foreground">Sin cifras infladas: solo lo que Profe Exprés hace hoy.</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Dato Icon={Timer} valor="15–25 s" texto="por ficha completa, medido en generaciones reales" />
          <Dato Icon={Books} valor={String(MATERIAS.length)} texto="materias de primaria" />
          <Dato Icon={Student} valor={`${GRADOS.length}`} texto="grados, de 1.º a 6.º" />
          <Dato Icon={Timer} valor="PDF" texto="listo para imprimir, con solucionario" />
        </div>

        {TESTIMONIALS.length > 0 && (
          <ul className="flex flex-col gap-3" aria-label="Opiniones de docentes">
            {TESTIMONIALS.map((t) => (
              <li key={t.name}>
                <Card>
                  <Quotes size={22} weight="fill" color="var(--primary)" />
                  <p className="mt-2 text-[16px] leading-snug">{t.text}</p>
                  <p className="mt-3 text-[13px] font-extrabold">{t.name} <span className="font-normal text-muted-foreground">· {t.role}, {t.country}</span></p>
                </Card>
              </li>
            ))}
          </ul>
        )}

        <Card sunken>
          <p className="text-[15px] leading-snug">En el siguiente paso ves un video corto con el recorrido completo. Así decides con la app a la vista, no con promesas.</p>
        </Card>

        <Cta href="/video">Ver el video</Cta>
      </div>
    </FunnelFrame>
  );
}

function Dato({ Icon, valor, texto }: { Icon: React.ElementType; valor: string; texto: string }) {
  return (
    <Card className="!p-4">
      <IconChip><Icon size={22} weight="duotone" /></IconChip>
      <p className="mt-3 font-display text-[28px] font-extrabold leading-none"><Accent>{valor}</Accent></p>
      <p className="mt-1 text-[13px] leading-snug text-muted-foreground">{texto}</p>
    </Card>
  );
}
