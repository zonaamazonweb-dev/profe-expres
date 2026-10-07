"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { CalendarCheck, CaretDown, FilePdf, GlobeHemisphereWest, ClockCounterClockwise, ListChecks, Quotes, ShieldCheck, Sparkle } from "@phosphor-icons/react";
import { CountUp } from "./CountUp";
import { CheckoutButton } from "./CheckoutButton";
import { FunnelFrame } from "./FunnelFrame";
import { useRequireQuiz } from "./Gate";
import { Accent, Card, CheckList, Eyebrow, H2, IconChip } from "./ui";
import { FUNNEL, TESTIMONIALS } from "@/lib/funnel/config";
import { computeResultado, SEMANAS_DE_CLASE } from "@/lib/funnel/quiz";
import { useAnswers } from "@/lib/funnel/state";
import { useTrackOnce } from "@/lib/funnel/track";

const INCLUYE = [
  { Icon: Sparkle, t: "Generador de fichas con IA", d: "Elige materia, grado y tema; la ficha sale en segundos." },
  { Icon: CalendarCheck, t: "Planner semanal en lote", d: "Planifica la semana y genera todas las fichas juntas." },
  { Icon: FilePdf, t: "PDF listo para imprimir", d: "Con espacio para nombre y fecha, más el solucionario aparte." },
  { Icon: GlobeHemisphereWest, t: "Currículo de tu país", d: "Alineado a México, Colombia, Argentina, Chile, Perú, España y más." },
  { Icon: ClockCounterClockwise, t: "Historial de fichas", d: "Reutiliza lo que ya creaste sin empezar de cero." },
  { Icon: ListChecks, t: "Varios tipos de pregunta", d: "Opción múltiple, completar, desarrollo y vocabulario." },
];

const FAQ = [
  { q: "¿Tengo que crear una cuenta antes de pagar?", a: "No. Pagas en la página segura de Hotmart y, al terminar, recibes el acceso en el correo con el que compraste." },
  { q: "¿Sirve para mi país?", a: "Sí. Eliges tu país y las fichas se alinean a su currículo. Si el tuyo no está en la lista, hay una opción para otro país hispanohablante." },
  { q: "¿Puedo imprimir las fichas?", a: "Sí. Cada ficha se descarga en PDF, lista para imprimir, con espacio para nombre y fecha del alumno." },
  { q: "¿Y las respuestas?", a: "El PDF incluye una hoja de solucionario aparte, solo para ti, para corregir rápido." },
  { q: "¿Cómo puedo pagar?", a: "Con los medios que Hotmart ofrece en tu país. Los ves antes de confirmar la compra." },
];

export function OfferView() {
  const ok = useRequireQuiz();
  const answers = useAnswers();
  const r = useMemo(() => computeResultado(answers), [answers]);
  useTrackOnce("offer_view");

  const heroCta = useRef<HTMLDivElement>(null);
  const priceCta = useRef<HTMLDivElement>(null);
  const [heroVisible, setHeroVisible] = useState(true);
  const [priceVisible, setPriceVisible] = useState(false);
  useEffect(() => {
    const make = (set: (v: boolean) => void) => new IntersectionObserver(([e]) => set(e.isIntersecting));
    const a = make(setHeroVisible);
    const b = make(setPriceVisible);
    if (heroCta.current) a.observe(heroCta.current);
    if (priceCta.current) b.observe(priceCta.current);
    return () => { a.disconnect(); b.disconnect(); };
  }, [ok]);

  if (!ok) return <FunnelFrame progress={94}><div /></FunnelFrame>;
  const sticky = !heroVisible && !priceVisible;

  return (
    <FunnelFrame progress={100} backHref="/video">
      <div className="stagger flex flex-col gap-10 pb-24">
        <section className="flex flex-col gap-4">
          <Eyebrow>Tu decisión</Eyebrow>
          <H2>Puedes seguir como hoy, o <Accent>recuperar tu tiempo</Accent></H2>
          <div className="grid grid-cols-1 gap-3">
            <Card sunken>
              <p className="text-[13px] font-extrabold uppercase tracking-wide text-muted-foreground">Si sigues igual</p>
              <p className="mt-1 text-[16px] leading-snug">Domingos y tardes con Word abierto: <b>≈ <CountUp to={r.horasAnio} /> horas al año</b> ({r.horasSemana} h por semana × {SEMANAS_DE_CLASE} semanas) armando fichas desde cero.</p>
            </Card>
            <Card>
              <p className="text-[13px] font-extrabold uppercase tracking-wide" style={{ color: "var(--primary)" }}>Con Profe Exprés</p>
              <p className="mt-1 text-[16px] leading-snug">Planificas la semana una vez y recibes <b>cada ficha en 15–25 segundos</b>, lista para imprimir.</p>
            </Card>
          </div>
          <div ref={heroCta}><CheckoutButton where="decision" /></div>
        </section>

        <section className="flex flex-col gap-4">
          <H2>Qué recibes</H2>
          <ul className="flex flex-col gap-4">
            {INCLUYE.map(({ Icon, t, d }) => (
              <li key={t} className="flex items-start gap-3">
                <IconChip><Icon size={22} weight="duotone" /></IconChip>
                <div>
                  <p className="text-[16px] font-extrabold">{t}</p>
                  <p className="text-[14px] leading-snug text-muted-foreground">{d}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {TESTIMONIALS.length > 0 && (
          <section className="flex flex-col gap-3" aria-label="Opiniones de docentes">
            <H2>Docentes que ya la usan</H2>
            {TESTIMONIALS.map((t) => (
              <Card key={t.name}><Quotes size={20} weight="fill" color="var(--primary)" /><p className="mt-2 text-[16px] leading-snug">{t.text}</p><p className="mt-3 text-[13px] font-extrabold">{t.name} <span className="font-normal text-muted-foreground">· {t.role}, {t.country}</span></p></Card>
            ))}
          </section>
        )}

        <section ref={priceCta} className="flex flex-col gap-4" aria-label="Precio">
          <div className="rounded-[20px] p-[2px]" style={{ background: "linear-gradient(135deg, var(--primary), var(--accent-2))" }}>
            <div className="flex flex-col items-center gap-4 rounded-[18px] bg-card p-6 text-center">
              <Image src="/funnel/mascota.webp" alt="" width={64} height={64} className="size-16" />
              <p className="text-[14px] font-extrabold uppercase tracking-wide text-muted-foreground">Profe Exprés</p>
              {FUNNEL.priceLabel ? (
                <p className="font-display text-[40px] font-extrabold leading-none"><Accent>{FUNNEL.priceLabel}</Accent></p>
              ) : (
                <p className="font-display text-[26px] font-extrabold leading-tight text-muted-foreground">Precio por confirmar</p>
              )}
              <div className="w-full text-left"><CheckList items={["Todas las funciones de arriba", "Fichas para todos los grados de primaria", "Acceso desde tu celular o computadora"]} /></div>
              <div className="w-full"><CheckoutButton where="precio" /></div>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <IconChip><ShieldCheck size={22} weight="duotone" /></IconChip>
            <H2>{`Garantía de ${FUNNEL.guaranteeDays} días`}</H2>
          </div>
          <p className="text-[16px] leading-snug text-muted-foreground">{`Pruébala con calma: si no es lo que esperabas, pides la devolución dentro de los ${FUNNEL.guaranteeDays} días desde tu compra, directamente en Hotmart. El pago se hace en la página de Hotmart: aquí nunca se escriben datos de tarjeta.`}</p>
        </section>

        <section className="flex flex-col gap-3" aria-label="Preguntas frecuentes">
          <H2>Preguntas frecuentes</H2>
          <div className="flex flex-col gap-2">
            {FAQ.map((f) => (
              <details key={f.q} className="group rounded-[14px] px-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 text-[16px] font-extrabold">
                  {f.q}<CaretDown size={18} weight="bold" className="shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <p className="pb-4 text-[15px] leading-snug text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4 text-center">
          <H2>Tu semana de fichas, <Accent>lista en minutos</Accent></H2>
          <CheckoutButton where="final" />
          {FUNNEL.supportEmail && <p className="text-[14px] text-muted-foreground">¿Dudas? Escríbenos a <a className="font-bold underline" href={`mailto:${FUNNEL.supportEmail}`}>{FUNNEL.supportEmail}</a></p>}
        </section>
      </div>

      <motion.div aria-hidden={!sticky} initial={false} animate={{ y: sticky ? 0 : 120, opacity: sticky ? 1 : 0 }} transition={{ duration: 0.25, ease: "easeOut" }}
        className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[450px] px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-3"
        style={{ background: "color-mix(in oklab, var(--background) 92%, transparent)", backdropFilter: "blur(8px)", pointerEvents: sticky ? "auto" : "none" }}>
        <CheckoutButton where="sticky" />
      </motion.div>
    </FunnelFrame>
  );
}
