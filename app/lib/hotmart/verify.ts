import "server-only";
import { timingSafeEqual } from "node:crypto";

/** Comparación en tiempo constante (un `===` filtra, por el tiempo de respuesta, cuántos caracteres acertó un atacante). */
export function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

/**
 * ¿El aviso viene de Hotmart? Compara el hottok recibido con el configurado en el servidor.
 * Fail-closed: si el servidor no tiene HOTMART_HOTTOK, NADA se autoriza (nunca hay un valor por defecto).
 */
export function verifyHottok(received: string | null | undefined): boolean {
  const expected = process.env.HOTMART_HOTTOK;
  if (!expected || !received) return false;
  return safeEqual(received, expected);
}
