import Image from "next/image";
import Link from "next/link";

export type AuthQuote = {
  text: string;
  attribution: string;
};

export const QUOTES = {
  default: {
    text: "La hospitalidad es un oficio. Las herramientas también.",
    attribution: "— Equipo Eztadia",
  },
  signup: {
    text: "Tu propiedad merece más que una hoja de cálculo.",
    attribution: "— Equipo Eztadia",
  },
  reset: {
    text: "Cada habitación es una historia. Te ayudamos a contarla.",
    attribution: "— Equipo Eztadia",
  },
} as const;

export type ImageMeta = {
  src: string;
  alt: string;
  credit: string;
};

export const IMAGES = {
  bedroom: {
    src: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1400&q=85",
    alt: "Habitación de hotel boutique con linos blancos y luz dorada de la tarde",
    credit: "Casa Marina · Cartagena",
  },
  patio: {
    src: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1400&q=85",
    alt: "Patio interior tropical con buganvilla y hamaca",
    credit: "Casa Marina · Cartagena",
  },
} as const;

export function AuthSplitLayout({
  children,
  quote = QUOTES.default,
  image = IMAGES.bedroom,
  footer,
}: {
  children: React.ReactNode;
  quote?: AuthQuote;
  image?: ImageMeta;
  footer?: React.ReactNode;
}) {
  return (
    <main
      id="main"
      className="grid min-h-screen lg:grid-cols-2"
    >
      <section
        aria-label="Formulario de autenticación"
        className="bg-cream relative flex flex-col px-6 py-10 sm:px-14 sm:py-14 lg:px-20 lg:py-14"
      >
        <Link
          href="/"
          aria-label="Eztadia, ir a inicio"
          className="inline-flex items-center gap-1.5 font-serif italic font-medium text-[24px] sm:text-[28px] text-ink tracking-[-0.015em] self-start"
        >
          Eztadia
          <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-gold mt-2" />
        </Link>

        <div className="w-full max-w-[400px] mx-auto my-auto py-10">
          {children}
        </div>

        {footer && (
          <div className="text-center text-sm text-ink-soft pt-12">{footer}</div>
        )}
      </section>

      <aside
        aria-hidden
        className="hidden lg:block relative overflow-hidden bg-linen"
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <span
          className="absolute top-8 left-8 px-3 py-1.5 rounded-full font-serif italic font-medium text-xs text-ink tracking-[-0.005em]"
          style={{
            background: "rgba(251, 248, 242, 0.7)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.5)",
          }}
        >
          {image.credit}
        </span>
        <div
          className="absolute bottom-16 left-16 right-16 max-w-[360px] p-7 rounded-[20px]"
          style={{
            background: "rgba(251, 248, 242, 0.85)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.4)",
          }}
        >
          <p className="font-serif italic font-medium text-[23px] leading-[1.4] text-ink m-0 mb-4 tracking-[-0.015em]">
            {quote.text}
          </p>
          <hr className="border-0 h-px bg-rule m-0 mb-3.5" />
          <span className="text-[11px] font-medium tracking-[0.08em] uppercase text-ink-muted">
            {quote.attribution}
          </span>
        </div>
      </aside>
    </main>
  );
}

export function AuthHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
}) {
  return (
    <header>
      <span className="block text-[11px] font-medium tracking-[0.14em] uppercase text-gold-dark mb-3">
        {eyebrow}
      </span>
      <h1 className="font-serif italic font-medium text-[clamp(28px,4vw,32px)] text-ink m-0 mb-3 tracking-[-0.025em] leading-[1.08]">
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm leading-[1.55] text-ink-soft m-0">{subtitle}</p>
      )}
    </header>
  );
}
