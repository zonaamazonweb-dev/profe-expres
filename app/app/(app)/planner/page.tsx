"use client";

import { useState } from "react";
import { Plus, Trash, Sparkle, Download } from "@phosphor-icons/react";
import Image from "next/image";
import { MATERIAS, GRADOS, type BloquePlanner, type Ficha, type SemanaPlanner } from "@/lib/types";
import { guardarFicha, guardarSemana } from "@/lib/storage";
import { descargarFichaPdf } from "@/lib/pdf";

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"] as const;

export default function PlannerPage() {
  const [grado, setGrado] = useState<string>(GRADOS[2]);
  const [bloques, setBloques] = useState<BloquePlanner[]>([
    { id: crypto.randomUUID(), dia: "Lunes", materia: MATERIAS[0], tema: "" },
  ]);
  const [generando, setGenerando] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [fichasListas, setFichasListas] = useState<Ficha[]>([]);
  const [error, setError] = useState("");

  function agregarBloque() {
    setBloques((b) => [
      ...b,
      { id: crypto.randomUUID(), dia: DIAS[b.length % DIAS.length], materia: MATERIAS[0], tema: "" },
    ]);
  }

  function actualizarBloque(id: string, cambios: Partial<BloquePlanner>) {
    setBloques((b) => b.map((x) => (x.id === id ? { ...x, ...cambios } : x)));
  }

  function quitarBloque(id: string) {
    setBloques((b) => b.filter((x) => x.id !== id));
  }

  async function generarSemana() {
    const validos = bloques.filter((b) => b.tema.trim());
    if (validos.length === 0) {
      setError("Escribe al menos un tema para generar tu semana.");
      return;
    }
    setError("");
    setGenerando(true);
    setProgreso(0);
    setFichasListas([]);

    const generadas: Ficha[] = [];
    for (const bloque of validos) {
      try {
        const res = await fetch("/api/generar", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            materia: bloque.materia,
            tema: bloque.tema,
            grado,
            pais: "Otro país hispanohablante",
            tiposPregunta: ["desarrollo", "opcion_multiple"],
            cantidadPreguntas: 6,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Error generando una ficha.");
        const ficha: Ficha = {
          id: crypto.randomUUID(),
          materia: bloque.materia,
          tema: bloque.tema,
          grado,
          pais: "Otro país hispanohablante",
          tiposPregunta: ["desarrollo", "opcion_multiple"],
          cantidadPreguntas: 6,
          textoLectura: data.textoLectura,
          preguntas: data.preguntas,
          creadaEn: new Date().toISOString(),
        };
        guardarFicha(ficha);
        generadas.push(ficha);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Una ficha no se pudo generar. Sigue con el resto.");
      }
      setProgreso((p) => p + 1);
    }

    const semana: SemanaPlanner = {
      id: crypto.randomUUID(),
      creadaEn: new Date().toISOString(),
      bloques: validos,
      fichaIdsGeneradas: generadas.map((f) => f.id),
    };
    guardarSemana(semana);
    setFichasListas(generadas);
    setGenerando(false);
  }

  if (fichasListas.length > 0) {
    return (
      <div className="flex flex-col">
        <h1 className="font-display text-xl font-extrabold">¡Tu semana está lista! 🎉</h1>
        <p className="mt-1 text-[12.5px] text-muted-foreground">
          {fichasListas.length} ficha{fichasListas.length > 1 ? "s" : ""} generada{fichasListas.length > 1 ? "s" : ""} de una sola vez.
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {fichasListas.map((f) => (
            <div key={f.id} className="flex items-center gap-2.5 rounded-[16px] bg-card p-3 shadow-[0_6px_16px_-12px_rgb(123_93_251_/_0.30)]">
              <div className="flex-1">
                <h5 className="text-[12.5px] font-extrabold">{f.materia} · {f.tema}</h5>
                <p className="text-[10.5px] text-muted-foreground">{f.grado}</p>
              </div>
              <button
                onClick={() => descargarFichaPdf(f)}
                className="flex h-9 w-9 items-center justify-center rounded-[10px] text-white"
                style={{ background: "var(--primary)" }}
                aria-label={`Descargar ${f.materia}`}
              >
                <Download size={15} weight="bold" />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() => {
            setFichasListas([]);
            setBloques([{ id: crypto.randomUUID(), dia: "Lunes", materia: MATERIAS[0], tema: "" }]);
          }}
          className="mt-3 flex h-11 items-center justify-center rounded-[14px] border-[1.5px] text-[13.5px] font-bold"
          style={{ borderColor: "color-mix(in oklab, var(--primary) 30%, transparent)", color: "var(--primary)" }}
        >
          Armar otra semana
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <h1 className="font-display text-xl font-extrabold">Tu planner semanal</h1>
      <p className="mt-1 text-[12.5px] text-muted-foreground">
        Arma todas las fichas de la semana en un solo flujo — el eje central de Profe Exprés.
      </p>

      <div className="mt-3">
        <label className="text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">Grado</label>
        <select
          value={grado}
          onChange={(e) => setGrado(e.target.value)}
          className="mt-1.5 h-[42px] w-full rounded-[14px] border-[1.5px] border-border bg-transparent px-3 text-[13px] font-bold outline-none focus:border-[var(--primary)]"
        >
          {GRADOS.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        {bloques.map((b) => (
          <div key={b.id} className="rounded-[16px] bg-card p-3 shadow-[0_6px_16px_-12px_rgb(123_93_251_/_0.30)]">
            <div className="flex items-center gap-2">
              <select
                value={b.dia}
                onChange={(e) => actualizarBloque(b.id, { dia: e.target.value as BloquePlanner["dia"] })}
                className="h-9 rounded-[10px] border-[1.5px] border-border bg-transparent px-2 text-[11.5px] font-bold"
              >
                {DIAS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <select
                value={b.materia}
                onChange={(e) => actualizarBloque(b.id, { materia: e.target.value })}
                className="h-9 flex-1 rounded-[10px] border-[1.5px] border-border bg-transparent px-2 text-[11.5px] font-bold"
              >
                {MATERIAS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <button
                onClick={() => quitarBloque(b.id)}
                aria-label="Quitar bloque"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-muted-foreground"
              >
                <Trash size={15} />
              </button>
            </div>
            <input
              value={b.tema}
              onChange={(e) => actualizarBloque(b.id, { tema: e.target.value })}
              placeholder="Tema de esta clase"
              className="mt-2 h-9 w-full rounded-[10px] border-[1.5px] border-border bg-transparent px-2.5 text-[12px] font-bold outline-none focus:border-[var(--primary)]"
            />
          </div>
        ))}
      </div>

      <button
        onClick={agregarBloque}
        className="mt-2 flex h-10 items-center justify-center gap-1.5 rounded-[12px] border-[1.5px] border-dashed border-border text-[12.5px] font-bold text-muted-foreground"
      >
        <Plus size={15} /> Agregar clase
      </button>

      {error && <p className="mt-2 text-[12px] font-semibold text-destructive">{error}</p>}

      {generando && (
        <div className="mt-3 flex flex-col items-center gap-1.5 rounded-[20px] bg-[var(--sunken)] p-4 text-center">
          <Image src="/mascota.webp" alt="Mascota de Profe Exprés armando tu semana" width={40} height={40} />
          <h5 className="text-[13px] font-extrabold">Armando tu semana…</h5>
          <p className="text-[11px] text-muted-foreground">{progreso} de {bloques.filter((b) => b.tema.trim()).length} fichas listas</p>
        </div>
      )}

      <button
        onClick={generarSemana}
        disabled={generando}
        className="mt-3 flex h-12 items-center justify-center gap-2 rounded-[14px] text-[15px] font-bold text-white disabled:opacity-60"
        style={{
          background: "linear-gradient(180deg, color-mix(in oklab, var(--primary) 88%, white), var(--primary))",
          boxShadow: "0 10px 24px -8px color-mix(in oklab, var(--primary) 45%, transparent)",
        }}
      >
        <Sparkle size={18} weight="fill" /> {generando ? "Generando…" : "Generar mi semana"}
      </button>
    </div>
  );
}
