import type { Metadata } from "next";
import { OfferView } from "@/components/funnel/OfferView";

export const metadata: Metadata = { title: "Profe Exprés — Tu semana de fichas, lista en minutos", robots: { index: false } };

export default function Page() {
  return <OfferView />;
}
