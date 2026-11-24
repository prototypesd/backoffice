import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // prototy vive dentro de otro proyecto: fijar la raíz evita el aviso del lockfile
  turbopack: { root: process.cwd() },
  // URLs viejas → nuevas
  async redirects() {
    return [
      { source: "/solicitudes", destination: "/nuevas-solicitudes", permanent: false },
      { source: "/expediente/:id", destination: "/nuevas-solicitudes/expediente/:id", permanent: false },
    ];
  },
};

export default nextConfig;
