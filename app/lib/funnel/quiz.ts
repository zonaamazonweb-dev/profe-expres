import type { Answers } from "./state";

export interface Question {
  key: "metodo" | "horas" | "casa" | "visualizar" | "interes";
  title: string;
  hint?: string;
  options: string[];
}

/** Orden estratégico: reconocer → dimensionar → consecuencia → visualizar → interés. */
export const QUESTIONS: Question[] = [
  { key: "metodo", title: "¿Cómo preparas hoy tus fichas y actividades?", hint: "Elige la que más se parezca a ti.",
    options: ["Las armo a mano en Word o Docs", "Busco en internet y las adapto", "Uso ChatGPT u otra IA genérica", "Descargo fichas que ya existen"] },
  { key: "horas", title: "¿Cuántas horas a la semana te toma prepararlas?", hint: "Un cálculo aproximado está bien.",
    options: ["Menos de 1 hora", "Entre 1 y 3 horas", "Entre 3 y 6 horas", "Más de 6 horas"] },
  { key: "casa", title: "¿Con qué frecuencia te llevas ese trabajo a casa?",
    options: ["Casi nunca", "A veces", "Casi cada semana", "Siempre, hasta los fines de semana"] },
  { key: "visualizar", title: "Si recuperaras esas horas, ¿qué harías primero?",
    options: ["Descansar y desconectarme", "Estar más con mi familia", "Planificar mejor mis clases", "Dedicarme más a mis alumnos"] },
  { key: "interes", title: "Si tuvieras la semana de fichas lista en minutos, ¿qué tanto te interesaría?",
    options: ["Muchísimo, lo necesito ya", "Bastante", "Me da curiosidad", "Todavía no lo sé"] },
];

const HORAS_MEDIAS = [0.5, 2, 4.5, 7]; // punto medio de cada rango de la pregunta 2
export const SEMANAS_DE_CLASE = 40; // supuesto declarado en pantalla: un año escolar típico

export type PerfilId = "sobrecargada" | "dedicada" | "eficiente";

export interface Resultado {
  perfil: PerfilId;
  titulo: string;
  explicacion: string;
  horasSemana: number;
  horasAnio: number;
  visualizar: string | null;
}

export function isComplete(a: Answers): boolean {
  return QUESTIONS.every((q) => a[q.key] != null);
}

/** Personalización REAL: el perfil sale de lo que respondió (tiempo + trabajo en casa), no es el mismo para todas. */
export function computeResultado(a: Answers): Resultado {
  const h = a.horas ?? 1;
  const c = a.casa ?? 1;
  const score = h + c; // 0..6
  const horasSemana = HORAS_MEDIAS[h] ?? 2;
  const perfil: PerfilId = score >= 5 ? "sobrecargada" : score >= 2 ? "dedicada" : "eficiente";
  const textos: Record<PerfilId, { titulo: string; explicacion: string }> = {
    sobrecargada: {
      titulo: "Profe sobrecargada de preparación",
      explicacion: "Tus fichas te están quitando tardes y fines de semana. No es falta de ganas: es que cada ficha se hace desde cero.",
    },
    dedicada: {
      titulo: "Profe dedicada que pierde tiempo en lo repetitivo",
      explicacion: "Haces fichas de calidad, pero el tiempo se va en armarlas una por una. Esa parte se puede automatizar sin perder tu criterio.",
    },
    eficiente: {
      titulo: "Profe organizada que quiere ir más rápido",
      explicacion: "Ya tienes un buen método. Lo que te falta es preparar toda la semana de una vez, sin repetir el trabajo cada día.",
    },
  };
  return {
    perfil,
    ...textos[perfil],
    horasSemana,
    horasAnio: Math.round(horasSemana * SEMANAS_DE_CLASE),
    visualizar: a.visualizar != null ? (QUESTIONS[3].options[a.visualizar] ?? null) : null,
  };
}
