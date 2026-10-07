/**
 * Configuración del camino de venta. TODO lo que el dueño todavía no decidió vive aquí como variable:
 * si falta, la pantalla lo dice con honestidad en vez de inventar un dato (precio, garantía, link, soporte, video).
 * Son variables PÚBLICAS a propósito (NEXT_PUBLIC_*): nada de esto es secreto.
 */
export const FUNNEL = {
  /** Link de checkout de Hotmart del producto (vacío = el botón se muestra apagado). */
  checkoutUrl: process.env.NEXT_PUBLIC_HOTMART_CHECKOUT_URL?.trim() || "",
  /** Texto del precio tal como se cobra, ej. "US$ 9,90 / mes". Vacío = "Precio por confirmar". */
  priceLabel: process.env.NEXT_PUBLIC_PRICE_LABEL?.trim() || "",
  /** Días de garantía elegidos en Hotmart (7, 15, 21 o 30). Vacío = no se menciona un número. */
  guaranteeDays: Number(process.env.NEXT_PUBLIC_GUARANTEE_DAYS) || 0,
  /** Correo de soporte que se muestra al final de la oferta. */
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || "",
  /** URL del video de ventas (mp4 directo o embed). Vacío = escenario reservado. */
  vslUrl: process.env.NEXT_PUBLIC_VSL_URL?.trim() || "",
  /** Segundos antes de que aparezca el botón bajo el video (solo si hay video). */
  vslButtonDelay: Number(process.env.NEXT_PUBLIC_VSL_BUTTON_DELAY) || 20,
} as const;

/** Testimonios REALES. Mientras esté vacío no se muestra ninguno: jamás se inventan. */
export interface Testimonial { name: string; role: string; country: string; text: string }
export const TESTIMONIALS: Testimonial[] = [];
