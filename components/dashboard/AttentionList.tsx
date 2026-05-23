import Image from "next/image";
import { IconArrowRight, IconWhatsApp } from "./icons";
import { formatCOP } from "@/lib/format";
import type { AttentionItem } from "@/lib/dashboard";

export function AttentionList({ items }: { items: AttentionItem[] }) {
  return (
    <section aria-labelledby="attn-title">
      <header className="mb-5">
        <span className="block text-[11px] font-medium tracking-[0.14em] uppercase text-gold mb-2">
          Necesita tu atención
        </span>
        <h3
          id="attn-title"
          className="font-serif italic font-medium text-ink m-0 tracking-[-0.015em]"
          style={{ fontSize: 22 }}
        >
          Antes de pasar a otra cosa…
        </h3>
      </header>

      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="list-none p-0 m-0 flex flex-col gap-3.5">
          {items.map((item) => (
            <li key={item.id}>
              <AttentionCard item={item} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function AttentionCard({ item }: { item: AttentionItem }) {
  return (
    <article
      className="bg-paper border border-rule rounded-2xl px-5 py-[18px] grid items-center gap-4 transition-[transform,box-shadow,border-color] duration-300 ease-organic hover:-translate-y-px hover:border-rule-strong"
      style={{
        gridTemplateColumns: "auto 1fr auto",
        boxShadow: "var(--shadow-soft, none)",
      }}
    >
      <Avatar item={item} />
      <div className="min-w-0">
        {renderBody(item)}
      </div>
      {renderAction(item)}
    </article>
  );
}

function Avatar({ item }: { item: AttentionItem }) {
  if (item.kind === "checkin-today" && item.guestPhoto) {
    return (
      <span className="w-11 h-11 rounded-full overflow-hidden inline-block bg-sage-tint shrink-0">
        <Image
          src={item.guestPhoto}
          alt=""
          width={88}
          height={88}
          className="w-full h-full object-cover"
        />
      </span>
    );
  }
  const initials = "guestInitials" in item ? item.guestInitials : "";
  return (
    <span
      aria-hidden
      className="w-11 h-11 rounded-full bg-sage-tint text-sage inline-flex items-center justify-center text-sm font-medium shrink-0"
    >
      {initials}
    </span>
  );
}

function renderBody(item: AttentionItem) {
  if (item.kind === "payment-pending") {
    return (
      <>
        <p className="text-sm font-medium text-ink m-0 mb-0.5">{item.guestName}</p>
        <p className="text-[13px] text-ink-soft m-0 mb-2">
          {item.room} · <span className="oldstyle">{item.stayLabel}</span> · COP{" "}
          <span className="oldstyle">{formatCOP(item.totalCOP)}</span>
        </p>
        <Pill tone="gold">Esperando comprobante · {item.ageLabel}</Pill>
      </>
    );
  }
  if (item.kind === "checkin-today") {
    return (
      <>
        <p className="text-sm font-medium text-ink m-0 mb-0.5">{item.guestName}</p>
        <p className="text-[13px] text-ink-soft m-0 mb-2">
          {item.room} · {item.partyLabel} · Llegan hoy
        </p>
        <Pill tone="sage">
          Check-in en {item.hoursAway === 1 ? "1 hora" : `${item.hoursAway} horas`} ·{" "}
          <span className="oldstyle">{item.checkInTimeLabel}</span>
        </Pill>
      </>
    );
  }
  return (
    <>
      <p className="text-sm font-medium text-ink m-0 mb-0.5">
        {item.guestName}
        {item.guestNote && (
          <span className="text-ink-muted font-normal"> — {item.guestNote}</span>
        )}
      </p>
      <p className="font-serif italic text-[13px] text-ink-soft m-0 mb-2 leading-[1.45]">
        {item.quote}
      </p>
      <Pill tone="linen">vía WhatsApp · {item.ageLabel}</Pill>
    </>
  );
}

function renderAction(item: AttentionItem) {
  if (item.kind === "payment-pending") {
    return (
      <a
        href={`#payment-${item.id}`}
        className="inline-flex items-center justify-center gap-1.5 h-[38px] px-4 rounded-[10px] text-[13px] font-medium text-ink-soft bg-cream border border-rule hover:bg-linen hover:text-ink hover:border-rule-strong transition-colors whitespace-nowrap"
      >
        Ver comprobante
        <IconArrowRight className="w-[13px] h-[13px]" />
      </a>
    );
  }
  if (item.kind === "checkin-today") {
    return (
      <a
        href={`#welcome-${item.id}`}
        className="inline-flex items-center justify-center gap-1.5 h-[38px] px-4 rounded-[10px] text-[13px] font-medium text-cream bg-sage hover:bg-[#4F6759] transition-colors whitespace-nowrap"
      >
        <IconWhatsApp className="w-3.5 h-3.5" />
        Enviar bienvenida
      </a>
    );
  }
  return (
    <a
      href={`#reply-${item.id}`}
      className="inline-flex items-center justify-center gap-1.5 h-[38px] px-4 rounded-[10px] text-[13px] font-medium text-ink-soft bg-cream border border-rule hover:bg-linen hover:text-ink hover:border-rule-strong transition-colors whitespace-nowrap"
    >
      Responder
      <IconArrowRight className="w-[13px] h-[13px]" />
    </a>
  );
}

function Pill({ tone, children }: { tone: "gold" | "sage" | "linen" | "terra"; children: React.ReactNode }) {
  const classes = {
    gold: "bg-[rgba(184,146,62,0.14)] text-gold border-[rgba(184,146,62,0.18)]",
    sage: "bg-sage-tint text-sage border-[rgba(92,117,103,0.18)]",
    linen: "bg-linen text-ink-soft border-rule",
    terra: "bg-[rgba(199,111,76,0.12)] text-clay border-[rgba(199,111,76,0.22)]",
  }[tone];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium uppercase tracking-[0.05em] border ${classes}`}
    >
      {children}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-14 px-6 border border-dashed border-rule rounded-[20px] bg-cream">
      <svg
        viewBox="0 0 60 30"
        className="mx-auto mb-4 text-gold opacity-50"
        width={80}
        height={40}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
        aria-hidden
      >
        <path d="M 2 20 C 12 8, 28 28, 40 14 S 56 16, 58 10" />
      </svg>
      <h4 className="font-serif italic font-medium text-ink m-0 mb-2" style={{ fontSize: 22 }}>
        Nada urgente.
      </h4>
      <p className="text-sm text-ink-muted m-0 mx-auto max-w-[36ch]">
        Buen momento para revisar tu calendario o agregar fotos a la propiedad.
      </p>
    </div>
  );
}
