import type { Metadata } from "next";
import { ProofView } from "@/components/funnel/ProofView";

export const metadata: Metadata = { title: "Profe Exprés", robots: { index: false } };

export default function Page() {
  return <ProofView />;
}
