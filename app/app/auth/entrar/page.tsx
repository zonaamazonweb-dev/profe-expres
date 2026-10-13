import { redirect } from "next/navigation";
import { Sparkle } from "@phosphor-icons/react/dist/ssr";
import { EntrarButton } from "./EntrarButton";
import { entrar } from "./actions";

export const metadata = { title: "Entrar — Profe Exprés", robots: { index: false } };

/** Paso intermedio del enlace del correo: nada se gasta al abrirla, solo al pulsar el botón. */
export default async function Page({ searchParams }: { searchParams: Promise<{ token_hash?: string; type?: string; next?: string }> }) {
  const { token_hash, type, next } = await searchParams;
  if (!token_hash || !type) redirect("/login?error=enlace");

  return (
    <main className="flex flex-1 items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm rounded-[24px] bg-card p-6 shadow-[0_18px_40px_-24px_rgb(123_93_251_/_0.45)]">
        <div className="flex items-center gap-2">
          <span className="flex h-[34px] w-[34px] items-center justify-center rounded-[11px]" style={{ background: "linear-gradient(135deg, var(--primary), var(--accent-2))" }}>
            <Sparkle size={18} weight="fill" color="#fff" />
          </span>
          <span className="font-display text-xl font-extrabold">Profe Exprés</span>
        </div>
        <h1 className="font-display mt-5 text-[24px] font-extrabold leading-tight">Todo listo para entrar</h1>
        <p className="mt-1 text-[15px] text-muted-foreground">Pulsa el botón para abrir tu cuenta. Este paso protege tu acceso: el enlace sirve una sola vez.</p>
        <form action={entrar} className="mt-6">
          <input type="hidden" name="token_hash" value={token_hash} />
          <input type="hidden" name="type" value={type} />
          <input type="hidden" name="next" value={next ?? "/app"} />
          <EntrarButton />
        </form>
      </div>
    </main>
  );
}
