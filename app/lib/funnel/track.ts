"use client";

import { useEffect } from "react";
import { getAttribution, visitorId } from "./attribution";

export type FunnelEvent =
  | "funnel_view" | "quiz_start" | "quiz_answer" | "quiz_complete" | "result_view"
  | "solution_view" | "vsl_view" | "offer_view" | "checkout_click";

/** Envía un evento al servidor. Nunca bloquea ni rompe la pantalla si falla. */
export function track(type: FunnelEvent, props: Record<string, string | number> = {}): void {
  try {
    const body = JSON.stringify({ type, vid: visitorId(), path: window.location.pathname, attr: getAttribution(), props });
    void fetch("/api/evento", { method: "POST", headers: { "content-type": "application/json" }, body, keepalive: true }).catch(() => {});
  } catch {
    // la medición jamás tumba la experiencia
  }
}

/** Dispara un evento de "vista" una sola vez por sesión del navegador. */
export function useTrackOnce(type: FunnelEvent): void {
  useEffect(() => {
    try {
      const key = `profe:seen:${type}`;
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // si no hay sessionStorage, se cuenta en cada visita: mejor medir de más que perder el dato
    }
    track(type);
  }, [type]);
}
