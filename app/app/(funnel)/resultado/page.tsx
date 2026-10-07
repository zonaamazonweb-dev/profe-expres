import type { Metadata } from "next";
import { ResultView } from "@/components/funnel/ResultView";

export const metadata: Metadata = { title: "Profe Exprés", robots: { index: false } };

export default function Page() {
  return <ResultView />;
}
