"use client";

import Link from "next/link";
import { Sparkle, CalendarBlank, Clock, CheckCircle, FileText } from "@phosphor-icons/react";
import { useFichas, useSemanas, horasAhorradasEstimadas } from "@/lib/storage";

const FECHA_HOY = new Intl.DateTimeFormat("es", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
}).format(new Date());

function primeraLetraMayuscula(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export default function InicioPage() {
  const fichas = useFichas();
  const semanas = useSemanas();
  const semana = semanas[0] ?? null;

  const porcentajeSemana = semana && semana.bloques.length > 0
    ? Math.round((semana.fichaIdsGeneradas.length / semana.bloques.length) * 100)
    : 0;

  const radio = 51;
  const circunferencia = 2 * Math.PI * radio;
  const offset = circunferencia - (porcentajeSemana / 100) * circunferencia;

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2">
        <span
          className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px]"
          style={{ background: "linear-gradient(135deg, var(--primary), var(--accent-2))" }}
        >
          <Sparkle size={16} weight="fill" color="#fff" />
        </span>
        <h1 className="font-display text-lg font-extrabold">Profe Exprés</h1>
      </div>

      <p className="mt-1.5 text-[14.5px] font-bold">¡Hola, Profe! 👋</p>
      <p className="mt-0.5 text-[11px] font-semibold text-muted-foreground">
        {primeraLetraMayuscula(FECHA_HOY)}
      </p>

      <div className="relative mx-auto mt-4 h-[118px] w-[118px]">
        <svg width="118" height="118" viewBox="0 0 118 118" role="img" aria-label={`Semana al ${porcentajeSemana} por ciento`}>
          <circle cx="59" cy="59" r={radio} fill="none" strokeWidth="11" stroke="color-mix(in oklab, var(--primary) 14%, transparent)" />
          <circle
            cx="59" cy="59" r={radio} fill="none" strokeWidth="11" stroke="var(--primary)"
            strokeLinecap="round" strokeDasharray={circunferencia} strokeDashoffset={offset}
            transform="rotate(-90 59 59)" style={{ transition: "stroke-dashoffset 500ms ease-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-[26px] font-extrabold">{porcentajeSemana}%</span>
          <span className="text-[10px] font-bold text-muted-foreground">semana lista</span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-[20px] bg-card p-3 shadow-[0_8px_20px_-14px_rgb(123_93_251_/_0.35)]">
          <p className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
            <Clock size={13} color="var(--primary)" /> Horas ahorradas
          </p>
          <p className="font-display mt-0.5 text-[20px] font-extrabold">
            {horasAhorradasEstimadas(fichas.length)}
          </p>
        </div>
        <div className="rounded-[20px] bg-card p-3 shadow-[0_8px_20px_-14px_rgb(123_93_251_/_0.35)]">
          <p className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
            <CheckCircle size={13} color="var(--primary)" /> Fichas creadas
          </p>
          <p className="font-display mt-0.5 text-[20px] font-extrabold">{fichas.length}</p>
        </div>
      </div>

      <Link
        href="/crear"
        className="mt-2 flex items-center gap-2.5 rounded-[20px] bg-card p-3 shadow-[0_8px_20px_-14px_rgb(123_93_251_/_0.30)]"
      >
        <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[14px]" style={{ background: "color-mix(in oklab, var(--primary) 10%, transparent)" }}>
          <Sparkle size={19} color="var(--primary)" />
        </span>
        <div>
          <h4 className="text-[14.5px] font-extrabold">Crear actividad nueva</h4>
          <p className="mt-0.5 text-xs text-muted-foreground">Elige materia, tema y grado.</p>
        </div>
      </Link>

      <Link
        href="/planner"
        className="mt-2 flex items-center gap-2.5 rounded-[20px] bg-card p-3 shadow-[0_8px_20px_-14px_rgb(123_93_251_/_0.30)]"
      >
        <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[14px]" style={{ background: "color-mix(in oklab, var(--primary) 10%, transparent)" }}>
          <CalendarBlank size={19} color="var(--primary)" />
        </span>
        <div>
          <h4 className="text-[14.5px] font-extrabold">Tu planner de esta semana</h4>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {semana ? `${semana.fichaIdsGeneradas.length} de ${semana.bloques.length} fichas listas` : "Todavía no armaste tu horario."}
          </p>
        </div>
      </Link>

      <p className="mt-3 text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">
        Tus últimas fichas
      </p>
      {fichas.length === 0 ? (
        <div className="mt-1.5 rounded-[20px] border-[1.5px] border-dashed border-border p-4 text-center">
          <h4 className="text-[13.5px] font-extrabold">Aún no creas ninguna ficha</h4>
          <p className="mt-1 text-[11.5px] text-muted-foreground">
            Toca &quot;Crear actividad nueva&quot; y la IA arma la primera contigo.
          </p>
        </div>
      ) : (
        <div className="mt-1.5 flex flex-col gap-1.5">
          {fichas.slice(0, 4).map((f) => (
            <Link
              key={f.id}
              href="/historial"
              className="flex items-center gap-2.5 rounded-[14px] bg-card p-2.5 shadow-[0_6px_16px_-12px_rgb(123_93_251_/_0.30)]"
            >
              <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[9px]" style={{ background: "color-mix(in oklab, var(--primary) 10%, transparent)" }}>
                <FileText size={15} color="var(--primary)" />
              </span>
              <div>
                <h5 className="text-[12.5px] font-extrabold">{f.materia} · {f.tema}</h5>
                <p className="mt-px text-[10.5px] text-muted-foreground">
                  {f.grado} · {f.preguntas.length} preguntas
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
