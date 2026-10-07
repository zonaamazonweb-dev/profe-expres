import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // La app salió de la raíz (ahora vive en /app, detrás de login): las rutas viejas redirigen.
  async redirects() {
    return ["crear", "planner", "historial"].map((r) => ({ source: `/${r}`, destination: `/app/${r}`, permanent: true }));
  },
};

export default nextConfig;
