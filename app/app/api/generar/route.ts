import { NextResponse } from "next/server";
import { z } from "zod";
import { generarFicha } from "@/lib/ai-adapter";

const bodySchema = z.object({
  materia: z.string().min(1),
  tema: z.string().min(1).max(200),
  grado: z.string().min(1),
  pais: z.string().min(1),
  tiposPregunta: z.array(z.string()).min(1),
  cantidadPreguntas: z.number().int().min(1).max(15),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos para generar la ficha." },
      { status: 400 }
    );
  }

  try {
    const resultado = await generarFicha({
      ...parsed.data,
      tiposPregunta: parsed.data.tiposPregunta as never,
    });
    return NextResponse.json(resultado);
  } catch (err) {
    const mensaje = err instanceof Error ? err.message : "Error generando la ficha.";
    return NextResponse.json({ error: mensaje }, { status: 500 });
  }
}
