import "server-only";
import { requireAdmin } from "./auth";
import { loadOverview } from "./overview";
import { parseRango } from "@/components/admin/ui";

/** Cada página verifica admin POR SU CUENTA antes de leer datos (el layout no basta como guardia). */
export async function adminPageData(searchParams: Promise<{ rango?: string }>) {
  const admin = await requireAdmin();
  const { rango } = await searchParams;
  const r = parseRango(rango);
  const overview = await loadOverview(r.days);
  return { admin, rango: r, o: overview };
}
