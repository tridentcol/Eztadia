import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  getCurrentProfile,
  getActivePropertyId,
} from "@/lib/auth/session";
import {
  getWhatsAppConfigForUI,
  listRecentWhatsAppMessages,
  getWhatsAppMessageStats,
} from "@/lib/db/queries/integrations";
import { PropertyTabs } from "@/components/calendar/PropertyTabs";
import { WhatsAppConfigForm } from "@/components/integrations/WhatsAppConfigForm";
import { WhatsAppMessagesList } from "@/components/integrations/WhatsAppMessagesList";

export const metadata: Metadata = {
  title: "WhatsApp · Configuración — Eztadia",
};

export default async function WhatsAppConfigPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const propertyId = await getActivePropertyId();
  if (!propertyId) redirect("/onboarding");

  const [cfg, messages, stats] = await Promise.all([
    getWhatsAppConfigForUI(propertyId),
    listRecentWhatsAppMessages(propertyId, 20),
    getWhatsAppMessageStats(propertyId),
  ]);

  const isConnected = !!(cfg?.businessAccountId && cfg.hasAccessToken);
  const isPaused = isConnected && !cfg?.isActive;

  return (
    <>
      <PropertyTabs />
      <main
        id="main"
        className="max-w-[720px] mx-auto px-5 sm:px-8 py-10 sm:py-12 pb-24"
      >
        <header className="flex items-start gap-4 mb-6">
          <Link
            href="/dashboard/integrations"
            aria-label="Volver a integraciones"
            className="w-9 h-9 rounded-[10px] text-ink-soft hover:bg-linen hover:text-ink inline-flex items-center justify-center transition-colors shrink-0 mt-1"
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 6-6 6 6 6" />
            </svg>
          </Link>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3.5 mb-2">
              <span
                className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-white font-bold text-[14px] tracking-[0.04em]"
                style={{ background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)" }}
              >
                WhatsApp
              </span>
              <h1 className="font-serif italic font-medium text-[28px] text-ink m-0 tracking-[-0.02em]">
                Configuración
              </h1>
              <StatusBadge
                state={
                  !isConnected
                    ? "disconnected"
                    : isPaused
                      ? "paused"
                      : "connected"
                }
              />
            </div>
            <p className="text-sm text-ink-soft m-0 max-w-[56ch] leading-[1.55]">
              Conecta tu cuenta de WhatsApp Business para enviar confirmaciones,
              recordatorios y recibir mensajes de huéspedes. Tu access token se
              cifra antes de guardarse en la base de datos.
            </p>
          </div>
        </header>

        {isConnected && (
          <Stats stats={stats} />
        )}

        <WhatsAppConfigForm
          propertyId={propertyId}
          initial={
            cfg
              ? {
                  businessAccountId: cfg.businessAccountId,
                  phoneNumberId: cfg.phoneNumberId,
                  hasAccessToken: cfg.hasAccessToken,
                  isActive: cfg.isActive,
                }
              : null
          }
        />

        <section className="mt-12">
          <header className="flex items-baseline justify-between mb-4">
            <h2 className="font-serif italic font-medium text-[20px] text-ink m-0">
              Mensajes recientes
            </h2>
            <span className="text-[11.5px] text-ink-muted">
              Últimos {messages.length}
            </span>
          </header>
          <WhatsAppMessagesList items={messages} />
        </section>
      </main>
    </>
  );
}

function StatusBadge({
  state,
}: {
  state: "connected" | "paused" | "disconnected";
}) {
  if (state === "connected") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-medium uppercase tracking-[0.08em] bg-sage-tint text-sage border border-[rgba(92,117,103,0.18)]">
        <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-sage" />
        Activa
      </span>
    );
  }
  if (state === "paused") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-medium uppercase tracking-[0.08em] bg-[rgba(184,146,62,0.14)] text-gold-dark border border-[rgba(184,146,62,0.22)]">
        <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-gold" />
        Pausada
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-medium uppercase tracking-[0.08em] bg-linen text-ink-muted border border-rule">
      <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-ink-muted" />
      Desconectada
    </span>
  );
}

function Stats({
  stats,
}: {
  stats: { totalLast30d: number; outboundLast30d: number; failedLast30d: number };
}) {
  return (
    <div className="grid grid-cols-3 border-y border-rule mb-9">
      <StatCell label="Mensajes 30d" value={stats.totalLast30d} />
      <StatCell label="Salientes 30d" value={stats.outboundLast30d} bordered />
      <StatCell
        label="Fallidos 30d"
        value={stats.failedLast30d}
        bordered
        warn={stats.failedLast30d > 0}
      />
    </div>
  );
}

function StatCell({
  label,
  value,
  bordered = false,
  warn = false,
}: {
  label: string;
  value: number;
  bordered?: boolean;
  warn?: boolean;
}) {
  return (
    <div className={["py-4 px-4", bordered ? "border-l border-rule" : ""].join(" ")}>
      <p className="text-[10.5px] tracking-[0.08em] uppercase text-ink-muted font-medium m-0 mb-1.5">
        {label}
      </p>
      <p
        className={[
          "font-serif oldstyle leading-none m-0 tabular-nums",
          warn ? "text-danger" : "text-ink",
        ].join(" ")}
        style={{ fontSize: 28 }}
      >
        {value}
      </p>
    </div>
  );
}
