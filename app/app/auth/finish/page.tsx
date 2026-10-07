"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/browser";

/** Solo rutas internas (evita redirecciones abiertas). */
function safeNext(value: string | null): string {
  return value && value.startsWith("/") && !value.startsWith("//") && !value.includes("\\") ? value : "/app";
}

/**
 * Destino del enlace del correo. Supabase entrega la sesión en el fragmento de la URL (#access_token=…),
 * que solo el navegador puede leer: aquí se guarda como sesión y se entra a la app. Funciona en cualquier navegador.
 */
function Finish() {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    const fail = () => router.replace("/login?error=enlace");
    if (!access_token || !refresh_token) { fail(); return; }
    // El fragmento no debe quedarse en el historial ni en la barra de direcciones.
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    createBrowserSupabase().auth.setSession({ access_token, refresh_token }).then(({ error }) => {
      if (error) fail();
      else router.replace(next);
    });
  }, [next, router]);

  return (
    <main className="flex min-h-dvh items-center justify-center px-6 text-center">
      <p role="status" className="text-[16px] font-bold text-muted-foreground">Entrando a tu cuenta…</p>
    </main>
  );
}

export default function Page() {
  return <Suspense><Finish /></Suspense>;
}
