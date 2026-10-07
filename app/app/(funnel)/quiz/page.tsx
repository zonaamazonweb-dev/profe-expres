import type { Metadata } from "next";
import { QuizFlow } from "@/components/funnel/QuizFlow";

export const metadata: Metadata = { title: "Quiz — Profe Exprés" };

export default function Page() {
  return <QuizFlow />;
}
