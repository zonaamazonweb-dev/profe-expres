import { LoginForm } from "./LoginForm";

export const metadata = { title: "Entrar — Profe Exprés", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  const destino = next && next.startsWith("/") && !next.startsWith("//") ? next : "/app";
  return (
    <main className="flex flex-1 items-center justify-center px-5 py-10">
      <LoginForm next={destino} errorEnlace={error === "enlace"} />
    </main>
  );
}
