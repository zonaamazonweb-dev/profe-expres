"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CaretDown, Download, ArrowClockwise } from "@phosphor-icons/react";
import {
  MATERIAS,
  GRADOS,
  PAISES,
  TIPOS_PREGUNTA_LABEL,
  type Ficha,
  type TipoPregunta,
} from "@/lib/types";
import { guardarFicha } from "@/lib/storage";
import { descargarFichaPdf } from "@/lib/pdf";

const TIPOS_DISPONIBLES: TipoPregunta[] = [
  "desarrollo",
  "opcion_multiple",
  "completar",
  "comprension_lectora",
  "vocabulario",
];

type Estado = "form" | "generando" | "lista" | "error";

export default function CrearActividadPage() {
  const router = useRouter();
  const [materia, setMateria] = useState<string>(MATERIAS[0]);
  const [tema, setTema] = useState("");
  const [grado, setGrado] = useState<string>(GRADOS[2]);
  const [pais, setPais] = useState<string>(PAISES[0]);
  const [tipos, setTipos] = useState<TipoPregunta[]>(["desarrollo", "opcion_multiple"]);
  const [cantidad, setCantidad] = useState(6);
  const [estado, setEstado] = useState<Estado>("form");
  const [error, setError] = useState("");
  const [fichaGenerada, setFichaGenerada] = useState<Ficha | null>(null);

  function alternarTipo(t: TipoPregunta) {
    setTipos((actuales) =>
      actuales.includes(t) ? actuales.filter((x) => x !== t) : [...actuales, t]
    );
  }

  async function generar() {
    if (!tema.trim()) {
      setError("Escribe el tema de la actividad.");
      return;
    }
    if (tipos.length === 0) {
      setError("Elige al menos un tipo de pregunta.");
      return;
    }
    setError("");
    setEstado("generando");

    try {
      const res = await fetch("/api/generar", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ materia, tema, grado, pais, tiposPregunta: tipos, cantidadPreguntas: cantidad }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo generar la ficha.");

      const ficha: Ficha = {
        id: crypto.randomUUID(),
        materia,
        tema,
        grado,
        pais,
        tiposPregunta: tipos,
        cantidadPreguntas: cantidad,
        textoLectura: data.textoLectura,
        preguntas: data.preguntas,
        creadaEn: new Date().toISOString(),
      };
      guardarFicha(ficha);
      setFichaGenerada(ficha);
      setEstado("lista");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo generar la ficha.");
      setEstado("error");
    }
  }

  if (estado === "lista" && fichaGenerada) {
    return (
      <div className="flex flex-col">
        <h1 className="font-display text-xl font-extrabold">¡Tu ficha está lista! 🎉</h1>
        <p className="mt-1 text-[12.5px] text-muted-foreground">
          {fichaGenerada.materia} · {fichaGenerada.tema} · {fichaGenerada.grado}
        </p>

        <div className="mt-4 max-h-[46vh] overflow-y-auto rounded-[20px] bg-card p-4 text-[12.5px] shadow-[0_8px_20px_-14px_rgb(123_93_251_/_0.30)]">
          {fichaGenerada.textoLectura && (
            <p className="mb-3 leading-relaxed text-muted-foreground">{fichaGenerada.textoLectura}</p>
          )}
          <ol className="flex flex-col gap-3">
            {fichaGenerada.preguntas.map((p, i) => (
              <li key={i}>
                <p className="font-bold">{i + 1}. {p.enunciado}</p>
                {p.tipo === "opcion_multiple" && (
                  <ul className="mt-1 flex flex-col gap-0.5 text-muted-foreground">
                    {p.opciones.map((op, idx) => (
                      <li key={idx}>{String.fromCharCode(97 + idx)}) {op}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        </div>

        <button
          onClick={() => descargarFichaPdf(fichaGenerada)}
          className="mt-4 flex h-12 items-center justify-center gap-2 rounded-[14px] text-[15px] font-bold text-white"
          style={{
            background: "linear-gradient(180deg, color-mix(in oklab, var(--primary) 88%, white), var(--primary))",
            boxShadow: "0 10px 24px -8px color-mix(in oklab, var(--primary) 45%, transparent)",
          }}
        >
          <Download size={18} weight="bold" /> Descargar PDF
        </button>
        <button
          onClick={() => {
            setEstado("form");
            setFichaGenerada(null);
            setTema("");
          }}
          className="mt-2 flex h-11 items-center justify-center gap-2 rounded-[14px] border-[1.5px] text-[13.5px] font-bold"
          style={{ borderColor: "color-mix(in oklab, var(--primary) 30%, transparent)", color: "var(--primary)" }}
        >
          Crear otra ficha
        </button>
        <button
          onClick={() => router.push("/historial")}
          className="mt-1 py-2 text-center text-[12.5px] font-bold text-muted-foreground"
        >
          Ver mi historial
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <h1 className="font-display text-xl font-extrabold">Crear actividad nueva</h1>
      <p className="mt-1 text-[12.5px] text-muted-foreground">Elige materia, tema y grado.</p>

      <div className="mt-3 flex flex-col gap-3 rounded-[20px] bg-card p-3.5 shadow-[0_8px_20px_-14px_rgb(123_93_251_/_0.30)]">
        <Campo label="Materia">
          <SelectNativo valor={materia} onCambio={setMateria} opciones={MATERIAS} />
        </Campo>
        <Campo label="Tema">
          <input
            value={tema}
            onChange={(e) => setTema(e.target.value)}
            placeholder="Ej: Fracciones equivalentes"
            className="h-[42px] w-full rounded-[14px] border-[1.5px] border-border bg-transparent px-3 text-[13px] font-bold outline-none focus:border-[var(--primary)]"
          />
        </Campo>
        <div className="grid grid-cols-2 gap-2.5">
          <Campo label="Grado">
            <SelectNativo valor={grado} onCambio={setGrado} opciones={GRADOS} />
          </Campo>
          <Campo label="País / currículo">
            <SelectNativo valor={pais} onCambio={setPais} opciones={PAISES} />
          </Campo>
        </div>
        <Campo label="Tipo de preguntas">
          <div className="flex flex-wrap gap-1.5">
            {TIPOS_DISPONIBLES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => alternarTipo(t)}
                className="rounded-full border-[1.5px] px-2.5 py-1.5 text-[11px] font-bold"
                style={
                  tipos.includes(t)
                    ? { borderColor: "var(--primary)", background: "color-mix(in oklab, var(--primary) 10%, transparent)", color: "var(--primary)" }
                    : { borderColor: "color-mix(in oklab, var(--muted-foreground) 30%, transparent)", color: "var(--muted-foreground)" }
                }
              >
                {TIPOS_PREGUNTA_LABEL[t]}
              </button>
            ))}
          </div>
        </Campo>
        <Campo label="Cantidad de preguntas">
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={3}
              max={12}
              value={cantidad}
              onChange={(e) => setCantidad(Number(e.target.value))}
              className="flex-1 accent-[var(--primary)]"
            />
            <span className="font-display w-6 text-right text-[15px] font-extrabold">{cantidad}</span>
          </div>
        </Campo>
      </div>

      {error && <p className="mt-2 text-[12px] font-semibold text-destructive">{error}</p>}

      {estado === "generando" && (
        <div className="mt-3.5 flex flex-col items-center gap-1.5 rounded-[20px] bg-[var(--sunken)] p-4 text-center">
          <Image src="/mascota.webp" alt="Mascota de Profe Exprés generando tu ficha" width={44} height={44} />
          <h5 className="text-[13px] font-extrabold">Armando tu ficha con IA…</h5>
          <p className="text-[11px] text-muted-foreground">Materia, tema y grado alineados</p>
        </div>
      )}

      <button
        onClick={generar}
        disabled={estado === "generando"}
        className="mt-3 flex h-12 items-center justify-center gap-2 rounded-[14px] text-[15px] font-bold text-white disabled:opacity-60"
        style={{
          background: "linear-gradient(180deg, color-mix(in oklab, var(--primary) 88%, white), var(--primary))",
          boxShadow: "0 10px 24px -8px color-mix(in oklab, var(--primary) 45%, transparent)",
        }}
      >
        {estado === "generando" ? (
          <><ArrowClockwise size={18} className="animate-spin" /> Generando…</>
        ) : (
          "Generar ficha"
        )}
      </button>
    </div>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function SelectNativo({
  valor,
  onCambio,
  opciones,
}: {
  valor: string;
  onCambio: (v: string) => void;
  opciones: readonly string[];
}) {
  return (
    <div className="relative">
      <select
        value={valor}
        onChange={(e) => onCambio(e.target.value)}
        className="h-[42px] w-full appearance-none rounded-[14px] border-[1.5px] border-border bg-transparent px-3 pr-9 text-[13px] font-bold outline-none focus:border-[var(--primary)]"
      >
        {opciones.map((op) => (
          <option key={op} value={op}>
            {op}
          </option>
        ))}
      </select>
      <CaretDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}
