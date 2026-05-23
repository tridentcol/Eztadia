import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  // node-ical depende de rrule (uso intensivo de BigInt) y de módulos nativos.
  // Excluirlo del bundling evita errores tipo "BigInt is not a function" en
  // la fase de collect page data y mejora el cold start.
  //
  // @prisma/client usa __dirname internamente; en Vercel runtime (ESM) crashea
  // el boot del lambda. Aunque nadie lo importa hoy, mantenemos la generacion
  // del cliente via postinstall por si en el futuro se necesita — esta opcion
  // garantiza que Next.js no lo incluya en el bundle del Edge/server.
  serverExternalPackages: ["node-ical", "@prisma/client", ".prisma/client"],
  experimental: {
    optimizePackageImports: [],
  },
};

export default nextConfig;
