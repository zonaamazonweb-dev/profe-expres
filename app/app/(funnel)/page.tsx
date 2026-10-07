import type { Metadata } from "next";
import { Entry } from "@/components/funnel/Entry";

export const metadata: Metadata = {
  title: "Profe Exprés — Las fichas de toda tu semana en minutos",
  description: "Responde 5 preguntas y descubre cómo preparar las fichas de la semana en minutos, listas para imprimir.",
};

export default function Page() {
  return <Entry />;
}
