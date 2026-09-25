import { z } from "zod";
import { env } from "./env";
import type { Pregunta, TipoPregunta } from "./types";

const preguntaSchema = z.discriminatedUnion("tipo", [
  z.object({
    tipo: z.literal("opcion_multiple"),
    enunciado: z.string(),
    opciones: z.array(z.string()).min(3).max(5),
    respuestaCorrecta: z.string(),
  }),
  z.object({
    tipo: z.enum(["desarrollo", "completar", "vocabulario"]),
    enunciado: z.string(),
    respuestaSugerida: z.string().optional(),
  }),
]);

const fichaGeneradaSchema = z.object({
  textoLectura: z.string().optional(),
  preguntas: z.array(preguntaSchema).min(1),
});

export interface GenerarFichaParams {
  materia: string;
  tema: string;
  grado: string;
  pais: string;
  tiposPregunta: TipoPregunta[];
  cantidadPreguntas: number;
}

export interface FichaGenerada {
  textoLectura?: string;
  preguntas: Pregunta[];
}

function construirPrompt(params: GenerarFichaParams): string {
  const incluyeLectura = params.tiposPregunta.includes("comprension_lectora");
  const tiposPregunta = params.tiposPregunta.filter((t) => t !== "comprension_lectora");
  const tiposFinal = tiposPregunta.length > 0 ? tiposPregunta : ["desarrollo"];
  const tipos = tiposFinal.join(", ");

  return `Eres un asistente pedagógico para docentes de primaria en países hispanohablantes.
Genera el CONTENIDO de una ficha de actividad escolar para imprimir, en español neutro, alineada al plan de estudios de ${params.pais} para ${params.grado}.

Materia: ${params.materia}
Tema: ${params.tema}
Cantidad total de preguntas: ${params.cantidadPreguntas}

IMPORTANTE sobre el campo "tipo" de cada pregunta: SOLO puede ser uno de estos 4 valores exactos:
"opcion_multiple", "desarrollo", "completar", "vocabulario". "comprension_lectora" NO es un tipo de
pregunta válido — nunca lo uses como valor de "tipo".

Tipos de pregunta a usar (mezcla real entre estos, no repitas el mismo tipo en todas): ${tipos}
${incluyeLectura ? `\nEsta ficha ES de comprensión lectora: incluye un textoLectura breve (120-220 palabras) apropiado para la edad, y basa la mayoría de las preguntas en él (usando los tipos de arriba, nunca "comprension_lectora" como tipo).` : ""}
Las preguntas deben ser específicas al tema (nunca genéricas), variadas en dificultad, y apropiadas para el grado.

Responde ÚNICAMENTE con JSON válido, sin texto adicional, con esta forma exacta:
{
  "textoLectura": "string opcional, omitir el campo si no aplica",
  "preguntas": [
    { "tipo": "opcion_multiple", "enunciado": "...", "opciones": ["...", "...", "...", "..."], "respuestaCorrecta": "..." },
    { "tipo": "desarrollo", "enunciado": "...", "respuestaSugerida": "..." }
  ]
}`;
}

export async function generarFicha(
  params: GenerarFichaParams
): Promise<FichaGenerada> {
  if (!env.ANTHROPIC_API_KEY) {
    throw new Error(
      "Falta configurar la clave de IA en el servidor (ANTHROPIC_API_KEY en .env.local)."
    );
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: env.AI_MODEL,
      max_tokens: 2048,
      messages: [{ role: "user", content: construirPrompt(params) }],
    }),
  });

  if (!res.ok) {
    const detalle = await res.text().catch(() => "");
    throw new Error(`La IA no respondió correctamente (${res.status}). ${detalle.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    content: Array<{ type: string; text?: string }>;
  };
  const texto = data.content.find((b) => b.type === "text")?.text ?? "";

  let json: unknown;
  try {
    const match = texto.match(/\{[\s\S]*\}/);
    json = JSON.parse(match ? match[0] : texto);
  } catch {
    throw new Error("La IA devolvió un formato inesperado. Intenta de nuevo.");
  }

  // Red de seguridad: si la IA igual etiqueta una pregunta como "comprension_lectora"
  // (no es un tipo válido, es la ficha entera la que ES de comprensión lectora),
  // la normalizamos a "desarrollo" en vez de fallar toda la generación.
  if (json && typeof json === "object" && Array.isArray((json as { preguntas?: unknown }).preguntas)) {
    const conPreguntas = json as { preguntas: Array<{ tipo?: string }> };
    for (const p of conPreguntas.preguntas) {
      if (p.tipo === "comprension_lectora") p.tipo = "desarrollo";
    }
  }

  const parsed = fichaGeneradaSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error("El contenido generado no tiene la forma esperada. Intenta de nuevo.");
  }

  return parsed.data as FichaGenerada;
}
