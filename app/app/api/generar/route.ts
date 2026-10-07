import { NextResponse } from "next/server";
import { z } from "zod";
import { generarFicha } from "@/lib/ai-adapter";
import { getAppAccess } from "@/lib/access";
import { allow } from "@/lib/rate-limit";
import { logError, logEvent } from "@/lib/telemetry";

const bodySchema = z.object({
  materia: z.string().min(1),
  tema: z.string().min(1).max(200),
  grado: z.string().min(1),
  pais: z.string().min(1),
  tiposPregunta: z.array(z.string()).min(1),
  cantidadPreguntas: z.number().int().min(1).max(15),
});

export async function POST(request: Request) {
  // Solo cuentas con acceso activo gastan IA; además hay un tope por cuenta contra abusos.
  const access = await getAppAccess();
  if (!access) return NextResponse.json({ error: "Necesitas iniciar sesión con una cuenta activa." }, { status: 401 });
  if (!(await allow(`generar:${access.userId}`, 60, 3600))) {
    return NextResponse.json({ error: "Generaste muchas fichas seguidas. Espera un rato y vuelve a intentar." }, { status: 429 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos para generar la ficha." },
      { status: 400 }
    );
  }

  try {
    const resultado = await generarFicha({
      ...parsed.data,
      userId: access.userId,
      tiposPregunta: parsed.data.tiposPregunta as never,
    });
    await logEvent("ficha_generada", {
      userId: access.userId,
      metadata: { materia: parsed.data.materia, grado: parsed.data.grado, cantidad: parsed.data.cantidadPreguntas },
    });
    return NextResponse.json(resultado);
  } catch (err) {
    await logError(err, "api/generar", { path: "/api/generar", userId: access.userId });
    const mensaje = err instanceof Error ? err.message : "Error generando la ficha.";
    return NextResponse.json({ error: mensaje }, { status: 500 });
  }
}
