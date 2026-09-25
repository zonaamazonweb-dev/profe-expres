import type { Metadata } from "next";
import { Baloo_2, Nunito, Geist_Mono } from "next/font/google";
import { BottomNav } from "@/components/app/BottomNav";
import "./globals.css";

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Profe Exprés — Fichas de actividades en segundos",
  description:
    "Genera fichas de actividades escolares en PDF, listas para imprimir, en un solo flujo semanal.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${baloo.variable} ${nunito.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-dvh flex flex-col bg-background text-foreground font-sans">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
          <main className="flex-1 px-5 pb-4 pt-6">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
