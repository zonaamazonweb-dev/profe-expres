import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Refresca la sesión de Supabase en cada petición y hace un primer filtro para /admin.
 * El filtro de aquí es solo "optimista" (ahorra una carga): la verificación REAL de admin
 * ocurre en el servidor dentro de cada página y acción (requireAdmin).
 */
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const { pathname } = request.nextUrl;

  let response = NextResponse.next({ request });

  if (url && key) {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    });
    const { data } = await supabase.auth.getUser();

    if ((pathname.startsWith("/admin") || pathname.startsWith("/app")) && !data.user) {
      const login = new URL("/login", request.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
  } else if (pathname.startsWith("/admin") || pathname.startsWith("/app")) {
    // Sin configuración de Supabase el panel queda cerrado (fail-closed).
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/app") || pathname === "/login") {
    response.headers.set("Cache-Control", "no-store");
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
