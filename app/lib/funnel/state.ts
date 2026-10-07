"use client";

import { useSyncExternalStore } from "react";

/** Respuestas del quiz: viven SOLO en este navegador (no hay cuenta ni base de datos antes de pagar). */
const KEY = "profe:quiz:v1";
export type Answers = Record<string, number>; // clave de pregunta → índice de la opción elegida

let cacheRaw: string | null | undefined;
let cacheVal: Answers = {};
const EMPTY: Answers = {};
const listeners = new Set<() => void>();

function read(): Answers {
  let raw: string | null = null;
  try { raw = localStorage.getItem(KEY); } catch { /* sin almacenamiento */ }
  if (raw === cacheRaw) return cacheVal;
  cacheRaw = raw;
  try { cacheVal = raw ? (JSON.parse(raw) as Answers) : EMPTY; } catch { cacheVal = EMPTY; }
  return cacheVal;
}

export function saveAnswer(key: string, index: number): void {
  const next = { ...read(), [key]: index };
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* sin almacenamiento */ }
  cacheRaw = undefined;
  listeners.forEach((l) => l());
}

export function clearAnswers(): void {
  try { localStorage.removeItem(KEY); } catch { /* sin almacenamiento */ }
  cacheRaw = undefined;
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => { listeners.delete(cb); window.removeEventListener("storage", cb); };
}

export function useAnswers(): Answers {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}
