import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { verifyHottok } from "@/lib/hotmart/verify";
import { normalize } from "@/lib/hotmart/payload";
import { applyEvent, logWebhook, markProcessed } from "@/lib/hotmart/process";
import { allow, clientIp } from "@/lib/rate-limit";
import { logError } from "@/lib/telemetry";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const runtime = "nodejs";

/** Un aviso con más de 7 días ya no es un reintento de Hotmart: se trata como repetición sospechosa. */
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Webhook de Hotmart. Orden obligatorio:
 *  1. autenticidad (hottok en tiempo constante) → 2. catálogo (solo TU producto) → 3. frescura →
 *  4. dedupe + dinero + acceso → 5. marca "procesado" solo si todo salió bien.
 * Respuestas: 401 si no es Hotmart; 200 si se aplicó, es repetido o no corresponde (Hotmart no debe reintentar);
 * 500 si falló algo recuperable (Hotmart reintenta).
 */
export async function POST(request: Request) {
  if (!isSupabaseConfigured()) return new NextResponse(null, { status: 503 });

  const rawBody = await request.text();
  let body: unknown = null;
  try { body = JSON.parse(rawBody); } catch { /* se rechaza abajo */ }
  const bodyHottok = body && typeof body === "object" && "hottok" in body ? String((body as { hottok: unknown }).hottok) : null;
  const hottok = request.headers.get("x-hotmart-hottok") ?? bodyHottok;

  if (!verifyHottok(hottok)) {
    // Los intentos falsos se anotan (para ver ataques en el panel) pero con tope, para que nadie llene la tabla.
    if (await allow(`hotmart-unauth:${await clientIp()}`, 30, 3600)) await logWebhook(null, null, "unauthorized");
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const ev = normalize(body);
  if (!ev) {
    await logWebhook(null, null, "error");
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const allowedProduct = process.env.HOTMART_PRODUCT_ID?.trim();
  if (!allowedProduct || ev.productId !== allowedProduct) {
    // Producto ajeno o todavía sin configurar: no se concede nada. 200 para que Hotmart no reintente eternamente.
    await logWebhook(ev.eventId, ev.event, "illegal");
    return NextResponse.json({ received: true, ignored: "product" });
  }

  if (Date.now() - ev.occurredAt.getTime() > MAX_AGE_MS) {
    await logWebhook(ev.eventId, ev.event, "illegal");
    return NextResponse.json({ received: true, ignored: "stale" });
  }

  try {
    const outcome = await applyEvent(ev);
    if (outcome === "error") {
      await logWebhook(ev.eventId, ev.event, "error");
      return NextResponse.json({ error: "processing failed" }, { status: 500 });
    }
    if (outcome === "applied") await markProcessed(ev, createHash("sha256").update(rawBody).digest("hex"));
    await logWebhook(ev.eventId, ev.event, outcome);
    return NextResponse.json({ received: true, result: outcome });
  } catch (err) {
    await logError(err, "webhook/hotmart", { path: "/api/webhooks/hotmart" });
    await logWebhook(ev.eventId, ev.event, "error");
    return NextResponse.json({ error: "processing failed" }, { status: 500 });
  }
}
