import type { SystemEvent, EventKind } from "@/lib/admin";

const PILL: Record<EventKind, { label: string; cls: string }> = {
  reserva: { label: "Reserva", cls: "bg-sage-tint text-sage border-[rgba(92,117,103,0.18)]" },
  webhook: { label: "Webhook", cls: "bg-[rgba(91,123,150,0.14)] text-info border-[rgba(91,123,150,0.18)]" },
  usuario: { label: "Usuario", cls: "bg-sage-tint text-sage border-[rgba(92,117,103,0.18)]" },
  sync: { label: "Sync", cls: "bg-[rgba(184,146,62,0.14)] text-gold-dark border-[rgba(184,146,62,0.22)]" },
  error: { label: "Error", cls: "bg-[rgba(199,111,76,0.12)] text-clay border-[rgba(199,111,76,0.22)]" },
  login: { label: "Login", cls: "bg-linen text-ink-soft border-rule" },
  email: { label: "Email", cls: "bg-linen text-ink-soft border-rule" },
  payment: { label: "Pago", cls: "bg-sage-tint text-sage border-[rgba(92,117,103,0.18)]" },
};

const DOT_TONE: Record<EventKind, string> = {
  reserva: "bg-sage",
  webhook: "bg-info",
  usuario: "bg-sage",
  sync: "bg-gold",
  error: "bg-clay",
  login: "bg-ink-muted",
  email: "bg-ink-muted",
  payment: "bg-sage",
};

export function EventsFeed({ events }: { events: SystemEvent[] }) {
  return (
    <section className="mb-14">
      <header className="mb-[18px]">
        <span className="block text-[11px] font-medium tracking-[0.14em] uppercase text-gold-dark mb-2">
          Pulso del sistema
        </span>
        <h2 className="font-serif italic font-medium text-[22px] m-0 tracking-[-0.015em]">
          Últimos eventos.
        </h2>
      </header>

      <div className="relative pl-[22px]">
        <span
          aria-hidden
          className="absolute left-[5px] top-3 bottom-3 w-px bg-rule"
        />
        {events.map((e) => {
          const pill = PILL[e.kind];
          return (
            <div key={e.id} className="relative py-3 flex items-baseline gap-3.5">
              <span
                aria-hidden
                className={[
                  "absolute -left-[22px] top-[18px] w-2 h-2 rounded-full border-2 border-cream",
                  DOT_TONE[e.kind],
                ].join(" ")}
                style={{ boxShadow: "0 0 0 1px var(--color-rule)" }}
              />
              <span
                className="font-mono text-[12px] text-ink-muted shrink-0 tracking-[-0.01em]"
                style={{ width: 70 }}
              >
                {e.time}
              </span>
              <div className="flex-1 min-w-0">
                <span
                  className={`inline-flex items-center px-2 py-[3px] rounded-md text-[9.5px] font-semibold tracking-[0.08em] uppercase border mr-2 align-middle ${pill.cls}`}
                >
                  {pill.label}
                </span>
                <span className="text-sm text-ink leading-[1.5]">{e.text}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center mt-[18px]">
        <a className="text-[13px] font-medium text-sage underline underline-offset-[3px] decoration-1 decoration-[rgba(92,117,103,0.4)] hover:decoration-sage cursor-pointer">
          Ver todos los eventos →
        </a>
      </div>
    </section>
  );
}
