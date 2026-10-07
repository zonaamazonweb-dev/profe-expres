/** Métricas del panel: funciones PURAS (reciben datos y la hora; no leen nada ni inventan nada). */

export const DAY_MS = 86_400_000;

export function seenWithinDays(rows: Array<{ last_seen_at: string | null }>, days: number, now: number = Date.now()): number {
  const limit = now - days * DAY_MS;
  return rows.filter((r) => r.last_seen_at && new Date(r.last_seen_at).getTime() > limit).length;
}
