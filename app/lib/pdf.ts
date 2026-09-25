import { jsPDF } from "jspdf";
import type { Ficha } from "./types";

export function descargarFichaPdf(ficha: Ficha): void {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margen = 48;
  const ancho = doc.internal.pageSize.getWidth() - margen * 2;
  let y = margen;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(ficha.materia.toUpperCase(), margen, y);
  y += 20;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`${ficha.grado} · ${ficha.tema}`, margen, y);
  y += 22;

  doc.setDrawColor(200);
  doc.line(margen, y, margen + ancho, y);
  y += 20;

  doc.setFontSize(10);
  doc.text("Nombre: _______________________________", margen, y);
  doc.text("Fecha: _______________", margen + ancho / 2 + 10, y);
  y += 18;
  doc.text("Profesor(a): ___________________________", margen, y);
  doc.text("Evaluación: __________", margen + ancho / 2 + 10, y);
  y += 26;

  if (ficha.textoLectura) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Lee el texto y responde:", margen, y);
    y += 16;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    const lineas = doc.splitTextToSize(ficha.textoLectura, ancho);
    doc.text(lineas, margen, y);
    y += lineas.length * 13 + 14;
  }

  ficha.preguntas.forEach((pregunta, i) => {
    if (y > doc.internal.pageSize.getHeight() - 100) {
      doc.addPage();
      y = margen;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    const enunciado = `${i + 1}. ${pregunta.enunciado}`;
    const lineasEnunciado = doc.splitTextToSize(enunciado, ancho);
    doc.text(lineasEnunciado, margen, y);
    y += lineasEnunciado.length * 13 + 6;

    doc.setFont("helvetica", "normal");
    if (pregunta.tipo === "opcion_multiple") {
      pregunta.opciones.forEach((op, idx) => {
        const letra = String.fromCharCode(97 + idx);
        doc.text(`${letra}) ${op}`, margen + 14, y);
        y += 14;
      });
    } else {
      doc.text("Respuesta: ______________________________________________", margen + 14, y);
      y += 16;
    }
    y += 10;
  });

  const nombreArchivo = `${ficha.materia}-${ficha.tema}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  doc.save(`${nombreArchivo || "ficha"}.pdf`);
}
