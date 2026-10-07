/** Nombres legibles para el dueño: nunca se muestran identificadores técnicos crudos. */

const CANALES: Record<string, string> = {
  ads_meta: "Anuncios en Meta",
  afiliado: "Afiliados",
  contenido: "Contenido orgánico",
  organico: "Orgánico",
  email: "Email",
  directo: "Directo",
  manual: "Agregadas a mano",
  otro: "Otro",
};
export function channelLabel(c: string): string {
  return CANALES[c] ?? c.replace(/_/g, " ").replace(/^./, (m) => m.toUpperCase());
}

const FUNCIONES: Record<string, string> = { ficha: "Generar fichas" };
export function featureLabel(f: string): string {
  return FUNCIONES[f] ?? f.replace(/_/g, " ");
}

const WEBHOOK_TIPOS: Record<string, string> = {
  PURCHASE_APPROVED: "Compra aprobada",
  PURCHASE_COMPLETE: "Compra completa",
  PURCHASE_CANCELED: "Compra cancelada",
  PURCHASE_REFUNDED: "Reembolso",
  PURCHASE_CHARGEBACK: "Contracargo",
  PURCHASE_DELAYED: "Pago atrasado",
  SUBSCRIPTION_CANCELLATION: "Baja de suscripción",
};
export function webhookTypeLabel(t: string | null): string {
  return t ? (WEBHOOK_TIPOS[t] ?? t.replace(/_/g, " ").toLowerCase()) : "Aviso sin tipo";
}

export const WEBHOOK_RESULTADOS: Record<string, { label: string; ok: boolean }> = {
  applied: { label: "Aplicado", ok: true },
  duplicate: { label: "Repetido (normal)", ok: true },
  illegal: { label: "No permitido", ok: false },
  unauthorized: { label: "Sin autorización", ok: false },
  error: { label: "Con error", ok: false },
};
