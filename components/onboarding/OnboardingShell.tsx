import Link from "next/link";
import type { ReactNode } from "react";

export function OnboardingTopbar() {
  return (
    <header className="h-[72px] flex items-center justify-between px-6 sm:px-12 border-b border-rule bg-cream">
      <Link
        href="/"
        aria-label="Eztadia, inicio"
        className="inline-flex items-start gap-1.5 font-serif italic font-medium text-[20px] sm:text-[24px] text-ink tracking-[-0.015em]"
      >
        Eztadia
        <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-gold mt-2" />
      </Link>
      <a
        href="/dashboard"
        className="text-[13px] font-medium text-ink-muted hover:text-ink transition-colors"
      >
        Salir
      </a>
    </header>
  );
}

export function OnboardingBody({
  form,
  tips,
}: {
  form: ReactNode;
  tips: ReactNode;
}) {
  return (
    <div className="max-w-[1140px] mx-auto px-5 sm:px-12 py-14 grid gap-10 lg:gap-20 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)]">
      <div className="max-w-[640px] min-w-0 w-full">{form}</div>
      <aside className="lg:sticky lg:top-20 lg:self-start order-last lg:order-none">
        {tips}
      </aside>
    </div>
  );
}

export function TipCard({
  eyebrow,
  title,
  children,
  withOrnament = false,
}: {
  eyebrow?: string;
  title: string;
  children: ReactNode;
  withOrnament?: boolean;
}) {
  return (
    <article className="bg-paper border border-rule rounded-[20px] px-6 py-6 relative mb-3.5">
      {withOrnament && (
        <svg
          className="absolute top-4 right-4 text-gold opacity-55"
          width={36}
          height={24}
          viewBox="0 0 60 30"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.4}
          strokeLinecap="round"
          aria-hidden
        >
          <path d="M 2 20 C 12 8, 28 28, 40 14 S 56 16, 58 10" />
        </svg>
      )}
      {eyebrow && (
        <span className="block text-[11px] font-medium tracking-[0.14em] uppercase text-gold-dark mb-2.5">
          {eyebrow}
        </span>
      )}
      <h3 className="font-serif italic font-medium text-[18px] text-ink m-0 mb-2 tracking-[-0.015em] leading-[1.25]">
        {title}
      </h3>
      <div className="text-sm leading-[1.6] text-ink-soft m-0">{children}</div>
    </article>
  );
}

export function OnboardingHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle: string;
}) {
  return (
    <header className="mb-9">
      <span className="block text-[11px] font-medium tracking-[0.14em] uppercase text-gold-dark mb-3.5">
        {eyebrow}
      </span>
      <h1 className="font-serif italic font-medium text-[clamp(32px,5vw,40px)] text-ink m-0 mb-3.5 tracking-[-0.025em] leading-[1.05]">
        {title}
      </h1>
      <p className="text-base leading-[1.55] text-ink-soft m-0 max-w-[56ch]">
        {subtitle}
      </p>
    </header>
  );
}
