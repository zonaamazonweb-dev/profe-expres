"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check } from "@phosphor-icons/react";
import { FunnelFrame } from "./FunnelFrame";
import { H2 } from "./ui";
import { isComplete, QUESTIONS } from "@/lib/funnel/quiz";
import { saveAnswer, useAnswers } from "@/lib/funnel/state";
import { track } from "@/lib/funnel/track";

const MENSAJES = ["Revisando tus respuestas…", "Calculando cuánto tiempo te llevan tus fichas…", "Armando tu plan para la semana…"];

export function QuizFlow() {
  const router = useRouter();
  const answers = useAnswers();
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const started = useRef(false);

  // Al volver al quiz, retoma en la primera pregunta sin responder (las respuestas se conservan).
  const firstPending = QUESTIONS.findIndex((q) => answers[q.key] == null);
  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    if (firstPending > 0) setStep(firstPending); // eslint-disable-line react-hooks/set-state-in-effect
  }, [firstPending]);

  const q = QUESTIONS[step];

  function choose(index: number) {
    if (!started.current) { started.current = true; track("quiz_start"); }
    saveAnswer(q.key, index);
    track("quiz_answer", { step: step + 1, question: q.key, answer: index });
    window.setTimeout(() => {
      if (step < QUESTIONS.length - 1) setStep(step + 1);
      else { track("quiz_complete"); setAnalyzing(true); }
    }, reduce ? 0 : 260);
  }

  if (analyzing) return <Analysis onDone={() => router.push("/resultado")} complete={isComplete({ ...answers })} />;

  return (
    <FunnelFrame progress={(step / QUESTIONS.length) * 62 + 6} onBack={step > 0 ? () => setStep(step - 1) : undefined} backHref={step === 0 ? "/" : undefined}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.section key={q.key} className="flex flex-1 flex-col gap-6"
          initial={reduce ? false : { opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={reduce ? undefined : { opacity: 0, x: -24 }} transition={{ duration: 0.25, ease: "easeOut" }}>
          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-extrabold text-muted-foreground">Pregunta {step + 1} de {QUESTIONS.length}</p>
            <H2>{q.title}</H2>
            <p className="text-[15px] text-muted-foreground">{q.hint ?? "Con tus respuestas calculamos cuántas horas de tu año puedes recuperar."}</p>
          </div>
          <div role="radiogroup" aria-label={q.title} className="flex flex-col gap-3">
            {q.options.map((opt, i) => {
              const on = answers[q.key] === i;
              return (
                <motion.button key={opt} type="button" role="radio" aria-checked={on} whileTap={{ scale: 0.98 }} transition={{ duration: 0.12 }}
                  onClick={() => choose(i)}
                  className="flex min-h-14 w-full items-center justify-between gap-3 rounded-[14px] px-4 py-3 text-left text-[17px] font-bold outline-none focus-visible:ring-4 focus-visible:ring-[color-mix(in_oklab,var(--primary)_35%,transparent)]"
                  style={{
                    background: on ? "color-mix(in oklab, var(--primary) 9%, var(--card))" : "var(--card)",
                    border: `2px solid ${on ? "var(--primary)" : "var(--border)"}`,
                  }}>
                  <span>{opt}</span>
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full" style={{ background: on ? "var(--primary)" : "transparent", border: on ? "none" : "2px solid var(--border)", color: "#fff" }}>
                    {on && <Check size={14} weight="bold" />}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.section>
      </AnimatePresence>
    </FunnelFrame>
  );
}

function Analysis({ onDone, complete }: { onDone: () => void; complete: boolean }) {
  const reduce = useReducedMotion();
  const [pct, setPct] = useState(0);
  const total = reduce ? 1200 : 3400;

  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / total);
      setPct(Math.round((1 - Math.pow(1 - p, 2)) * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else onDone();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [total, onDone]);

  const R = 70;
  const C = 2 * Math.PI * R;
  const msg = MENSAJES[Math.min(MENSAJES.length - 1, Math.floor((pct / 100) * MENSAJES.length))];

  return (
    <FunnelFrame progress={66}>
      <section className="flex flex-1 flex-col items-center justify-center gap-6 text-center" aria-live="polite">
        <div className="relative size-[180px]">
          <svg viewBox="0 0 180 180" className="size-full -rotate-90">
            <circle cx="90" cy="90" r={R} fill="none" stroke="var(--sunken)" strokeWidth="14" />
            <circle cx="90" cy="90" r={R} fill="none" stroke="var(--primary)" strokeWidth="14" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pct / 100)} />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center font-display text-[40px] font-extrabold tabular-nums">{pct}%</span>
        </div>
        <div className="flex flex-col gap-2">
          <H2>Estamos analizando tus respuestas</H2>
          <p className="min-h-6 text-[16px] text-muted-foreground">{msg}</p>
          {!complete && <p className="text-[13px] text-muted-foreground">Si saltaste alguna pregunta, tu resultado será más general.</p>}
        </div>
      </section>
    </FunnelFrame>
  );
}
