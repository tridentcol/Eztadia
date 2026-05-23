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
  },
};

export default nextConfig;
