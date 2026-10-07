import "server-only";
import { z } from "zod";

const schema = z.object({
  url: z.url(),
  publishableKey: z.string().min(20),
  secretKey: z.string().min(20),
});

export class SupabaseNotConfiguredError extends Error {
  constructor() {
    super("Falta configurar Supabase en el servidor.");
    this.name = "SupabaseNotConfiguredError";
  }
}

/** Fail-closed: si falta una clave, cualquier ruta protegida se niega. Nunca cae a un modo abierto. */
export function getSupabaseConfig() {
  const parsed = schema.safeParse({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    secretKey: process.env.SUPABASE_SECRET_KEY,
  });
  if (!parsed.success) throw new SupabaseNotConfiguredError();
  return parsed.data;
}

export function isSupabaseConfigured(): boolean {
  return schema.safeParse({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    secretKey: process.env.SUPABASE_SECRET_KEY,
  }).success;
}
