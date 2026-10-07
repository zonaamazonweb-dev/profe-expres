import "server-only";
import { createHash } from "node:crypto";
import { createServiceClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/** Registro de eventos de producto. Nunca rompe la acción principal si falla. */
export async function logEvent(type: string, opts: { userId?: string | null; channel?: string | null; metadata?: Record<string, unknown> } = {}) {
  if (!isSupabaseConfigured()) return;
  try {
    const service = createServiceClient();
    await service.from("event_log").insert({
      type,
      user_id: opts.userId ?? null,
      channel: opts.channel ?? null,
      metadata: opts.metadata ?? {},
    });
    if (opts.userId && (type === "sesion_iniciada" || type === "ficha_generada")) {
      await service.from("profiles").update({ last_seen_at: new Date().toISOString() }).eq("id", opts.userId);
    }
  } catch {
    // la telemetría jamás debe tumbar la función principal
  }
}

export async function logError(error: unknown, context: string, opts: { path?: string; userId?: string | null } = {}) {
  if (!isSupabaseConfigured()) return;
  try {
    const message = error instanceof Error ? error.message : String(error);
    const fingerprint = createHash("sha256").update(`${context}|${message.slice(0, 160)}`).digest("hex").slice(0, 16);
    await createServiceClient().from("error_log").insert({
      message: message.slice(0, 500),
      context,
      path: opts.path ?? null,
      fingerprint,
      user_id: opts.userId ?? null,
    });
  } catch {
    // idem
  }
}

export interface AiCallRecord {
  feature: string;
  model: string;
  tokensIn?: number | null;
  tokensOut?: number | null;
  latencyMs?: number | null;
  status: "ok" | "error" | "timeout" | "moderated";
  error?: string | null;
  userId?: string | null;
}

/** Costo en USD con el precio por millón de tokens configurado en env. */
export function computeAiCostUsd(tokensIn: number, tokensOut: number): number | null {
  const pin = Number(process.env.AI_PRICE_INPUT_PER_MTOK);
  const pout = Number(process.env.AI_PRICE_OUTPUT_PER_MTOK);
  if (!Number.isFinite(pin) || !Number.isFinite(pout) || pin <= 0 || pout <= 0) return null;
  return (tokensIn * pin + tokensOut * pout) / 1_000_000;
}

export async function logAiCall(rec: AiCallRecord) {
  if (!isSupabaseConfigured()) return;
  try {
    const cost =
      rec.tokensIn != null && rec.tokensOut != null ? computeAiCostUsd(rec.tokensIn, rec.tokensOut) : null;
    await createServiceClient().from("ai_calls").insert({
      user_id: rec.userId ?? null,
      feature: rec.feature,
      model: rec.model,
      tokens_in: rec.tokensIn ?? null,
      tokens_out: rec.tokensOut ?? null,
      cost_usd: cost,
      latency_ms: rec.latencyMs ?? null,
      status: rec.status,
      error: rec.error?.slice(0, 300) ?? null,
    });
  } catch {
    // idem
  }
}
