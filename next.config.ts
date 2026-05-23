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
  serverExternalPackages: ["node-ical"],
  experimental: {
    optimizePackageImports: [],
    // Middleware corre en Node.js (no Edge) porque @supabase/ssr usa
    // __dirname al bundlearse, que no existe en Edge runtime y crasheaba
    // el middleware en Vercel con ReferenceError: __dirname is not defined.
    // @ts-expect-error nodeMiddleware existe en Next 15.5 runtime pero no en sus tipos públicos todavía.
    nodeMiddleware: true,
  },
};

export default nextConfig;
