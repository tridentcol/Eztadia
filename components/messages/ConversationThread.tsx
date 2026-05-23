"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { ConversationMessage } from "@/lib/db/queries/messages";

export function ConversationThread({
  messages,
  counterpartPhone,
  guestName,
  bookingCode,
}: {
  messages: ConversationMessage[];
  counterpartPhone: string;
  guestName: string | null;
  bookingCode: string | null;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // Auto-scroll al final cuando entra la conversación
    el.scrollTop = el.scrollHeight;
  }, [counterpartPhone]);

  return (
    <div className="bg-paper border border-rule rounded-2xl flex flex-col h-[calc(100vh-180px)] min-h-[420px] overflow-hidden">
      <header className="px-5 py-4 border-b border-rule flex items-center gap-3 shrink-0">
        <Link
          href="/dashboard/messages"
          aria-label="Volver a la lista"
          className="md:hidden w-8 h-8 rounded-[10px] text-ink-soft hover:bg-linen hover:text-ink inline-flex items-center justify-center transition-colors shrink-0"
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 6-6 6 6 6" />
          </svg>
        </Link>
        <div className="flex-1 min-w-0">
          <p className="m-0 truncate">
            {guestName ? (
              <span className="font-serif italic font-medium text-[16px] text-ink">
                {guestName}
              </span>
            ) : (
              <span className="font-mono text-[14px] text-ink">{counterpartPhone}</span>
            )}
          </p>
          <p className="text-[11.5px] text-ink-muted m-0 mt-0.5">
            {guestName && (
              <>
                <span className="font-mono">{counterpartPhone}</span>
                {bookingCode && <> · </>}
              </>
            )}
            {bookingCode && <>Reserva {bookingCode}</>}
          </p>
        </div>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 py-6 bg-cream"
        role="log"
        aria-live="polite"
      >
        {messages.length === 0 ? (
          <p className="text-center text-[13px] text-ink-muted m-0">
            Sin mensajes con esta contraparte.
          </p>
        ) : (
          <div className="flex flex-col gap-3 max-w-[560px] mx-auto">
            {messages.map((m, idx) => {
              const prev = messages[idx - 1];
              const showDayDivider =
                !prev || dayKey(prev.created_at) !== dayKey(m.created_at);
              return (
                <div key={m.id}>
                  {showDayDivider && (
                    <div className="text-center text-[10.5px] text-ink-muted uppercase tracking-[0.08em] my-2">
                      {formatDayLabel(m.created_at)}
                    </div>
                  )}
                  <Bubble message={m} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <footer className="border-t border-rule px-5 py-4 bg-paper shrink-0">
        <div className="flex items-center gap-3 bg-linen rounded-2xl px-4 py-3 opacity-70">
          <input
            type="text"
            disabled
            placeholder="Envío manual estará disponible en Phase E2 (WhatsApp Cloud API)"
            className="flex-1 bg-transparent border-0 outline-0 text-[13px] text-ink-muted placeholder:text-ink-muted disabled:cursor-not-allowed"
          />
          <button
            type="button"
            disabled
            aria-label="Enviar (deshabilitado)"
            className="w-9 h-9 rounded-full bg-paper border border-rule text-ink-muted inline-flex items-center justify-center disabled:cursor-not-allowed shrink-0"
          >
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
              <path d="m22 2-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </div>
        <p className="text-[10.5px] text-ink-muted m-0 mt-2 text-center">
          Las plantillas Meta-aprobadas y el envío manual entran con la
          integración real de WhatsApp Cloud API.
        </p>
      </footer>
    </div>
  );
}

function Bubble({ message: m }: { message: ConversationMessage }) {
  const isOut = m.direction === "outbound";
  return (
    <div className={isOut ? "flex justify-end" : "flex justify-start"}>
      <div className="max-w-[78%]">
        <div
          className={[
            "rounded-2xl px-4 py-2.5 text-[13.5px] leading-[1.45]",
            isOut
              ? "bg-sage text-cream rounded-br-md"
              : "bg-paper border border-rule text-ink rounded-bl-md",
          ].join(" ")}
        >
          {m.body ?? <em className="opacity-70">Sin cuerpo</em>}
        </div>
        <p
          className={[
            "text-[10.5px] m-0 mt-1 tabular-nums flex items-center gap-1",
            isOut ? "justify-end text-ink-muted" : "text-ink-muted",
          ].join(" ")}
        >
          {m.template_name && (
            <span className="font-mono">{m.template_name}</span>
          )}
          <time dateTime={m.created_at}>{formatTime(m.created_at)}</time>
          {isOut && (
            <span
              className={[
                m.status === "read"
                  ? "text-sage"
                  : m.status === "failed"
                    ? "text-danger"
                    : "text-ink-muted",
              ].join(" ")}
              title={STATUS_LABEL[m.status]}
            >
              {STATUS_GLYPH[m.status]}
            </span>
          )}
          {m.error && (
            <span className="text-danger font-mono" title={m.error}>
              !
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

const STATUS_LABEL: Record<string, string> = {
  sent: "Enviado",
  delivered: "Entregado",
  read: "Leído",
  failed: "Falló",
};

const STATUS_GLYPH: Record<string, string> = {
  sent: "·",
  delivered: "··",
  read: "··",
  failed: "×",
};

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

function formatDayLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(Date.now() - 86_400_000);
  if (dayKey(iso) === dayKey(today.toISOString())) return "Hoy";
  if (dayKey(iso) === dayKey(yesterday.toISOString())) return "Ayer";
  return d.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: today.getFullYear() === d.getFullYear() ? undefined : "numeric",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
