import { useSyncExternalStore } from "react";
import type { Ficha, SemanaPlanner } from "./types";

const FICHAS_KEY = "profe-expres:fichas";
const SEMANAS_KEY = "profe-expres:semanas";
const CAMBIO_EVENTO = "profe-expres:cambio";

/** Cachea por key el último string crudo leído + su versión ya parseada/ordenada,
 * para que useSyncExternalStore reciba SIEMPRE la misma referencia si nada cambió
 * (si no, getSnapshot() dispara un loop infinito de renders). */
const cache = new Map<string, { raw: string | null; valor: unknown[] }>();

function leerOrdenado<T extends { creadaEn?: string; id?: string }>(
  key: string,
  ordenar: (a: T, b: T) => number
): T[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(key);
  const previo = cache.get(key);
  if (previo && previo.raw === raw) return previo.valor as T[];

  let parsed: T[] = [];
  try {
    parsed = raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    parsed = [];
  }
  const ordenado = [...parsed].sort(ordenar);
  cache.set(key, { raw, valor: ordenado });
  return ordenado;
}

function leerCrudo<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function escribir<T>(key: string, valor: T[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(valor));
  window.dispatchEvent(new Event(CAMBIO_EVENTO));
}

function suscribirse(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CAMBIO_EVENTO, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CAMBIO_EVENTO, callback);
  };
}

export function listarFichas(): Ficha[] {
  return leerOrdenado<Ficha>(FICHAS_KEY, (a, b) => b.creadaEn.localeCompare(a.creadaEn));
}

export function guardarFicha(ficha: Ficha): void {
  const actuales = leerCrudo<Ficha>(FICHAS_KEY);
  escribir(FICHAS_KEY, [...actuales, ficha]);
}

export function eliminarFicha(id: string): void {
  const actuales = leerCrudo<Ficha>(FICHAS_KEY);
  escribir(FICHAS_KEY, actuales.filter((f) => f.id !== id));
}

export function listarSemanas(): SemanaPlanner[] {
  return leerOrdenado<SemanaPlanner>(SEMANAS_KEY, (a, b) => b.creadaEn.localeCompare(a.creadaEn));
}

export function guardarSemana(semana: SemanaPlanner): void {
  const actuales = leerCrudo<SemanaPlanner>(SEMANAS_KEY);
  const sinEsta = actuales.filter((s) => s.id !== semana.id);
  escribir(SEMANAS_KEY, [...sinEsta, semana]);
}

export function horasAhorradasEstimadas(cantidadFichas: number): number {
  // 45 min ahorrados por ficha vs. armarla a mano en Word — estimación conservadora
  return Math.round((cantidadFichas * 45) / 60);
}

const SIN_FICHAS: Ficha[] = [];
const SIN_SEMANAS: SemanaPlanner[] = [];

export function useFichas(): Ficha[] {
  return useSyncExternalStore(suscribirse, listarFichas, () => SIN_FICHAS);
}

export function useSemanas(): SemanaPlanner[] {
  return useSyncExternalStore(suscribirse, listarSemanas, () => SIN_SEMANAS);
}
