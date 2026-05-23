import type { WhatsAppMessageItem } from "@/lib/db/queries/integrations";

const STATUS_LABEL: Record<string, string> = {
  sent: "Enviado",
  delivered: "Entregado",
  read: "Leído",
  failed: "Falló",
};

const STATUS_TONE: Record<string, string> = {
  sent: "bg-linen text-ink-soft",
  delivered: "bg-linen text-ink-soft",
  read: "bg-sage-tint text-sage",
  failed: "bg-[rgba(168,72,60,0.10)] text-danger",
};

export function WhatsAppMessagesList({
  items,
}: {
  items: WhatsAppMessageItem[];
}) {
  if (items.length === 0) {
    return (
      <div className="bg-paper border border-rule rounded-2xl p-6 text-[13px] text-ink-muted">
        Aún no hay mensajes registrados.
      </div>
    );
  }
  return (
    <div className="bg-paper border border-rule rounded-2xl overflow-hidden">
      {items.map((m, i) => {
        const isOutbound = m.direction === "outbound";
        return (
          <div
            key={m.id}
            className={[
              "px-5 py-3.5 flex items-start gap-4",
              i > 0 ? "border-t border-rule" : "",
            ].join(" ")}
          >
            <span
              aria-hidden
              className={[
                "mt-1 w-1.5 h-1.5 rounded-full shrink-0",
                isOutbound ? "bg-sage" : "bg-gold",
              ].join(" ")}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center flex-wrap gap-2 mb-1">
                <span className="text-[11px] uppercase tracking-[0.06em] text-ink-muted">
                  {isOutbound ? "Saliente" : "Entrante"}
                </span>
                <span
                  className={[
                    "text-[10.5px] font-medium px-2 py-0.5 rounded-full",
                    STATUS_TONE[m.status] ?? "bg-linen text-ink-muted",
                  ].join(" ")}
                >
                  {STATUS_LABEL[m.status] ?? m.status}
                </span>
                {m.template_name && (
                  <span className="text-[11px] font-mono text-ink-muted">
                    {m.template_name}
                  </span>
                )}
              </div>
              <p className="text-[13px] text-ink m-0 truncate">
                {m.body ?? <span className="text-ink-muted italic">Sin cuerpo</span>}
              </p>
              {m.error && (
                <p className="text-[11.5px] text-danger m-0 mt-1">{m.error}</p>
              )}
              <p className="text-[11px] text-ink-muted m-0 mt-1 tabular-nums">
                {isOutbound ? `→ ${m.to_phone}` : `← ${m.from_phone}`}{" "}
                · {formatRelative(m.created_at)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function formatRelative(iso: string): string {
  const t = new Date(iso).getTime();
  const diffMin = Math.round((Date.now() - t) / 60000);
  if (diffMin < 1) return "ahora";
  if (diffMin < 60) return `hace ${diffMin} min`;
  if (diffMin < 60 * 24) return `hace ${Math.round(diffMin / 60)} h`;
  const days = Math.round(diffMin / (60 * 24));
  if (days < 30) return `hace ${days} d`;
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
