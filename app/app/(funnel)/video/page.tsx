import type { Metadata } from "next";
import { VslView } from "@/components/funnel/VslView";

export const metadata: Metadata = { title: "Profe Exprés", robots: { index: false } };

export default function Page() {
  return <VslView />;
}
