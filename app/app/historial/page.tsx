"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, Trash, FileText } from "@phosphor-icons/react";
import { useFichas, eliminarFicha } from "@/lib/storage";
import { descargarFichaPdf } from "@/lib/pdf";

export default function HistorialPage() {
  const fichas = useFichas();
  const [filtroMateria, setFiltroMateria] = useState<string>("todas");

  const materias = Array.from(new Set(fichas.map((f) => f.materia)));
  const visibles = filtroMateria === "todas" ? fichas : fichas.filter((f) => f.materia === filtroMateria);

  function borrar(id: string) {
    eliminarFicha(id);
  }

  return (
    <div className="flex flex-col">
      <h1 className="font-display text-xl font-extrabold">Tu historial</h1>
      <p className="mt-1 text-[12.5px] text-muted-foreground">Todas tus fichas creadas, listas para reusar.</p>

      {materias.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          <ChipFiltro activo={filtroMateria === "todas"} onClick={() => setFiltroMateria("todas")}>
            Todas
          </ChipFiltro>
          {materias.map((m) => (
            <ChipFiltro key={m} activo={filtroMateria === m} onClick={() => setFiltroMateria(m)}>
              {m}
            </ChipFiltro>
          ))}
        </div>
      )}

      {visibles.length === 0 ? (
        <div className="mt-4 rounded-[20px] border-[1.5px] border-dashed border-border p-4 text-center">
          <h4 className="text-[13.5px] font-extrabold">Todavía no hay fichas aquí</h4>
          <p className="mt-1 text-[11.5px] text-muted-foreground">
            <Link href="/crear" className="font-bold" style={{ color: "var(--primary)" }}>
              Crea tu primera ficha
            </Link>{" "}
            y va a aparecer en este historial.
          </p>
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-2">
          {visibles.map((f) => (
            <div key={f.id} className="rounded-[18px] bg-card p-3 shadow-[0_6px_16px_-12px_rgb(123_93_251_/_0.30)]">
              <div className="flex items-start gap-2.5">
                <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px]" style={{ background: "color-mix(in oklab, var(--primary) 10%, transparent)" }}>
                  <FileText size={17} color="var(--primary)" />
                </span>
                <div className="flex-1">
                  <h5 className="text-[13px] font-extrabold">{f.materia} · {f.tema}</h5>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {f.grado} · {f.preguntas.length} preguntas · {new Date(f.creadaEn).toLocaleDateString("es")}
                  </p>
                </div>
              </div>
              <div className="mt-2.5 flex gap-2">
                <button
                  onClick={() => descargarFichaPdf(f)}
                  className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-[10px] text-[12px] font-bold text-white"
                  style={{ background: "var(--primary)" }}
                >
                  <Download size={14} weight="bold" /> Descargar
                </button>
                <button
                  onClick={() => borrar(f.id)}
                  aria-label={`Eliminar ficha de ${f.materia}`}
                  className="flex h-9 w-9 items-center justify-center rounded-[10px] border-[1.5px] border-border text-destructive"
                >
                  <Trash size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ChipFiltro({
  activo,
  onClick,
  children,
}: {
  activo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-full border-[1.5px] px-2.5 py-1 text-[11px] font-bold"
      style={
        activo
          ? { borderColor: "var(--primary)", background: "color-mix(in oklab, var(--primary) 10%, transparent)", color: "var(--primary)" }
          : { borderColor: "color-mix(in oklab, var(--muted-foreground) 30%, transparent)", color: "var(--muted-foreground)" }
      }
    >
      {children}
    </button>
  );
}
