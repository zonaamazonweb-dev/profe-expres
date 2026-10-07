"use client";

/** Parámetros de anuncio que viajan por TODO el camino de venta hasta el pago (Meta, TikTok, afiliados). */
const KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "src", "sck", "fbclid", "ttclid"] as const;
export type AttributionKey = (typeof KEYS)[number];
export type Attribution = Partial<Record<AttributionKey, string>>;

const STORE = "profe:attr:v1";
const VID = "profe:vid";

/** Lee los parámetros de la URL actual y los guarda; si la visita trae nuevos, reemplazan a los anteriores. */
export function captureAttribution(): Attribution {
  try {
    const params = new URLSearchParams(window.location.search);
    const fresh: Attribution = {};
    for (const k of KEYS) {
      const v = params.get(k);
      if (v) fresh[k] = v.slice(0, 200);
    }
    if (Object.keys(fresh).length > 0) {
      localStorage.setItem(STORE, JSON.stringify(fresh));
      return fresh;
    }
  } catch {
    // sin almacenamiento: el camino de venta sigue funcionando, solo no recuerda el origen
  }
  return getAttribution();
}

export function getAttribution(): Attribution {
  try {
    const raw = localStorage.getItem(STORE);
    return raw ? (JSON.parse(raw) as Attribution) : {};
  } catch {
    return {};
  }
}

/** Identificador anónimo de la visita (no es una cuenta ni un dato personal). */
export function visitorId(): string {
  try {
    let id = localStorage.getItem(VID);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(VID, id);
    }
    return id;
  } catch {
    return "sin-almacenamiento";
  }
}

/** Agrega al link de pago los parámetros guardados, sin pisar los que el link ya trae. */
export function withAttribution(url: string): string {
  try {
    const u = new URL(url);
    const attr = getAttribution();
    for (const [k, v] of Object.entries(attr)) if (v && !u.searchParams.has(k)) u.searchParams.set(k, v);
    return u.toString();
  } catch {
    return url;
  }
}
