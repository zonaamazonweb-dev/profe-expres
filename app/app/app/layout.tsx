import { redirect } from "next/navigation";
import { BottomNav } from "@/components/app/BottomNav";
import { getAppAccess } from "@/lib/access";

/** Zona privada: solo entra quien tiene sesión y acceso activo. El resto vuelve al inicio de sesión. */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const access = await getAppAccess();
  if (!access) redirect("/login?next=/app");
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
      <main className="flex-1 px-5 pb-4 pt-6">{children}</main>
      <BottomNav />
    </div>
  );
}
