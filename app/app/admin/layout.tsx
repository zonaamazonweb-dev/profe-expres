import type { Metadata } from "next";
import { Sparkle, SignOut } from "@phosphor-icons/react/dist/ssr";
import { requireAdmin } from "@/lib/admin/auth";
import { signOut } from "@/app/login/actions";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata: Metadata = { title: "Panel — Profe Exprés", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-dvh flex-1 flex-col lg:flex-row">
      <aside className="hidden w-60 shrink-0 flex-col justify-between border-r border-border bg-card px-3 py-5 lg:flex">
        <div>
          <div className="flex items-center gap-2 px-2">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-[10px]"
              style={{ background: "linear-gradient(135deg, var(--primary), var(--accent-2))" }}
            >
              <Sparkle size={16} weight="fill" color="#fff" />
            </span>
            <div className="leading-tight">
              <p className="font-display text-[17px] font-extrabold">Profe Exprés</p>
              <p className="text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">Panel del dueño</p>
            </div>
          </div>
          <div className="mt-6">
            <AdminNav orientation="vertical" />
          </div>
        </div>
        <div className="px-2">
          <p className="truncate text-[11.5px] font-semibold text-muted-foreground" title={admin.email}>{admin.email}</p>
          <form action={signOut}>
            <button className="mt-2 flex items-center gap-2 text-[12.5px] font-bold text-muted-foreground hover:text-foreground">
              <SignOut size={16} /> Salir
            </button>
          </form>
        </div>
      </aside>

      <div className="border-b border-border bg-card px-4 pb-2 pt-3 lg:hidden">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-display text-[16px] font-extrabold">Panel · Profe Exprés</span>
          <form action={signOut}>
            <button className="text-[12px] font-bold text-muted-foreground">Salir</button>
          </form>
        </div>
        <AdminNav orientation="horizontal" />
      </div>

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
