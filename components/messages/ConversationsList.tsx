import Link from "next/link";
import type { ConversationSummary } from "@/lib/db/queries/messages";

export function ConversationsList({
  conversations,
  activePhone,
}: {
  conversations: ConversationSummary[];
  activePhone: string | null;
}) {
  if (conversations.length === 0) {
    return (
      <div className="bg-paper border border-rule rounded-2xl p-6 text-[13px] text-ink-muted">
        Sin conversaciones todavía. Los mensajes de huéspedes aparecerán aquí
        cuando WhatsApp esté conectado y se reciba el primer mensaje.
      </div>
    );
  }
  return (
    <nav
      aria-label="Conversaciones"
      className="bg-paper border border-rule rounded-2xl overflow-hidden"
    >
      {conversations.map((c, i) => {
        const isActive = c.counterpartPhone === activePhone;
        const displayName = c.guestName ?? c.counterpartPhone;
        const initials = computeInitials(c.guestName ?? c.counterpartPhone);
        return (
          <Link
            key={c.counterpartPhone}
            href={`/dashboard/messages?phone=${encodeURIComponent(c.counterpartPhone)}`}
            aria-current={isActive ? "true" : undefined}
            className={[
              "flex items-start gap-3 px-4 py-3.5 transition-colors",
              i > 0 ? "border-t border-rule" : "",
              isActive
                ? "bg-sage-tint"
                : "hover:bg-linen",
            ].join(" ")}
          >
            <span
              aria-hidden
              className={[
                "w-10 h-10 rounded-full inline-flex items-center justify-center text-[12px] font-medium shrink-0 font-serif italic",
                isActive
                  ? "bg-sage text-cream"
                  : "bg-cream text-ink-soft border border-rule",
              ].join(" ")}
            >
              {initials}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2 mb-0.5">
                <p
                  className={[
                    "text-[13.5px] m-0 truncate font-medium",
                    isActive ? "text-sage" : "text-ink",
                  ].join(" ")}
                >
                  {c.guestName ? (
                    <span className="font-serif italic">{c.guestName}</span>
                  ) : (
                    <span className="font-mono text-[12.5px]">{c.counterpartPhone}</span>
                  )}
                </p>
                <span className="text-[10.5px] text-ink-muted shrink-0 tabular-nums">
                  {formatRelative(c.lastAt)}
                </span>
              </div>
              <p className="text-[11.5px] text-ink-muted m-0 truncate leading-snug">
                {c.lastDirection === "outbound" ? "Tú: " : ""}
                {c.lastBody ?? <em>Sin contenido</em>}
              </p>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                {c.bookingCode && (
                  <span className="text-[10px] uppercase tracking-[0.06em] text-ink-muted">
                    Reserva {c.bookingCode}
                  </span>
                )}
                {c.unreadCount > 0 && (
                  <span
                    className="text-[10px] font-medium px-1.5 py-0.5 rounded-full text-cream bg-sage"
                  >
                    {c.unreadCount} sin leer
                  </span>
                )}
                {c.lastStatus === "failed" && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[rgba(168,72,60,0.10)] text-danger">
                    Falló
                  </span>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}

function computeInitials(s: string): string {
  if (s.startsWith("+")) {
    // Phone — usar dos primeros dígitos después del prefijo
    return s.replace(/\D/g, "").slice(2, 4) || "??";
  }
  return s
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatRelative(iso: string): string {
  const t = new Date(iso).getTime();
  const diffMin = Math.round((Date.now() - t) / 60000);
  if (diffMin < 1) return "ahora";
  if (diffMin < 60) return `${diffMin}m`;
  if (diffMin < 60 * 24) return `${Math.round(diffMin / 60)}h`;
  const days = Math.round(diffMin / (60 * 24));
  if (days < 30) return `${days}d`;
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
  });
}
