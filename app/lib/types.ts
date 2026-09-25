export type TipoPregunta =
  | "desarrollo"
  | "opcion_multiple"
  | "completar"
  | "comprension_lectora"
  | "vocabulario";

export interface PreguntaOpcionMultiple {
  tipo: "opcion_multiple";
  enunciado: string;
  opciones: string[];
  respuestaCorrecta: string;
}

export interface PreguntaDesarrollo {
  tipo: "desarrollo" | "completar" | "vocabulario";
  enunciado: string;
  respuestaSugerida?: string;
}

export type Pregunta = PreguntaOpcionMultiple | PreguntaDesarrollo;

export interface Ficha {
  id: string;
  materia: string;
  tema: string;
  grado: string;
  pais: string;
  tiposPregunta: TipoPregunta[];
  cantidadPreguntas: number;
  textoLectura?: string;
  preguntas: Pregunta[];
  creadaEn: string; // ISO date
  semanaId?: string;
}

export interface BloquePlanner {
  id: string;
  dia: "Lunes" | "Martes" | "Miércoles" | "Jueves" | "Viernes";
  materia: string;
  tema: string;
}

export interface SemanaPlanner {
  id: string;
  creadaEn: string;
  bloques: BloquePlanner[];
  fichaIdsGeneradas: string[];
}

export const MATERIAS = [
  "Matemática",
  "Lengua",
  "Ciencias Naturales",
  "Ciencias Sociales",
  "Inglés",
] as const;

export const GRADOS = [
  "1.º grado",
  "2.º grado",
  "3.º grado",
  "4.º grado",
  "5.º grado",
  "6.º grado",
] as const;

export const PAISES = [
  "México",
  "Colombia",
  "Argentina",
  "Chile",
  "Perú",
  "España",
  "Otro país hispanohablante",
] as const;

export const TIPOS_PREGUNTA_LABEL: Record<TipoPregunta, string> = {
  desarrollo: "Desarrollo",
  opcion_multiple: "Opción múltiple",
  completar: "Completar",
  comprension_lectora: "Comprensión lectora",
  vocabulario: "Vocabulario",
};
