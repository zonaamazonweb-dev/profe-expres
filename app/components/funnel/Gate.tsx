"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useAnswers } from "@/lib/funnel/state";
import { isComplete } from "@/lib/funnel/quiz";

/** Si alguien llega a una pantalla avanzada sin haber hecho el quiz, vuelve al inicio del quiz. */
export function useRequireQuiz(): boolean {
  const router = useRouter();
  const answers = useAnswers();
  // En el servidor y en la primera pintura no se ven las respuestas guardadas: no se rebota hasta estar en el navegador.
  const hydrated = useSyncExternalStore(() => () => {}, () => true, () => false);
  const ok = isComplete(answers);
  useEffect(() => {
    if (hydrated && !ok) router.replace("/quiz");
  }, [hydrated, ok, router]);
  return ok;
}
