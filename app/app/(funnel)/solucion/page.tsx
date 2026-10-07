import type { Metadata } from "next";
import { SolutionView } from "@/components/funnel/SolutionView";

export const metadata: Metadata = { title: "Profe Exprés", robots: { index: false } };

export default function Page() {
  return <SolutionView />;
}
