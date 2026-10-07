import { NextResponse } from "next/server";
import { z } from "zod";
import { allow, clientIp } from "@/lib/rate-limit";
import { logEvent } from "@/lib/telemetry";

/** Eventos PÚBLICOS del camino de venta (visitantes sin cuenta). Lista cerrada: nada fuera de ella se guarda. */
const TIPOS = [
  "funnel_view", "quiz_start", "quiz_answer", "quiz_complete", "result_view",
  "solution_view", "vsl_view", "offer_view", "checkout_click",
] as const;

const texto = z.string().max(200);
const bodySchema = z.object({
  type: z.enum(TIPOS),
  vid: z.string().min(8).max(64),
  path: z.string().max(100),
  attr: z.record(z.string(), texto).default({}),
  props: z.record(z.string(), z.union([texto, z.number()])).default({}),
});

const ATTR_OK = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "src", "sck", "fbclid", "ttclid"];

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return new NextResponse(null, { status: 400 });
  if (!(await allow(`evento:${await clientIp()}`, 300, 3600))) return new NextResponse(null, { status: 429 });

  const { type, vid, path, attr, props } = parsed.data;
  const limpio = Object.fromEntries(Object.entries(attr).filter(([k]) => ATTR_OK.includes(k)));
  await logEvent(type, {
    channel: attr.utm_source ?? attr.src ?? null,
    metadata: { vid, path, ...limpio, ...Object.fromEntries(Object.entries(props).slice(0, 8)) },
  });
  return new NextResponse(null, { status: 204 });
}
