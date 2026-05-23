import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["SOFT", "opsz"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Eztadia — La forma serena de gestionar habitaciones.",
  description:
    "Páginas públicas hermosas para cada propiedad, reservas con PSE o transferencia, WhatsApp nativo y calendario sincronizado con Booking y Airbnb. Sin pasarelas caras. Sin suscripciones por habitación.",
  openGraph: {
    title: "Eztadia — La forma serena de gestionar habitaciones.",
    description:
      "Páginas públicas hermosas para cada propiedad, reservas con PSE o transferencia, WhatsApp nativo y sincronización con Booking y Airbnb.",
    locale: "es_CO",
    alternateLocale: ["en_US"],
    type: "website",
    images: ["/og-image.jpg"],
  },
  alternates: {
    languages: { es: "/", en: "/en" },
  },
  metadataBase: new URL("https://eztadia.co"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${fraunces.variable} ${inter.variable} ${jetbrains.variable}`}
    >
      <body>
        <a href="#main" className="skip-link">Saltar al contenido</a>
        {children}
      </body>
    </html>
  );
}
