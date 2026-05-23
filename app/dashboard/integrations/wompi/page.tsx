import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  getCurrentProfile,
  getActivePropertyId,
} from "@/lib/auth/session";
import { getWompiConfigForUI } from "@/lib/db/mutations/wompi";
import { PropertyTabs } from "@/components/calendar/PropertyTabs";
import { WompiConfigForm } from "@/components/integrations/WompiConfigForm";

export const metadata: Metadata = {
  title: "Wompi · Configuración — Eztadia",
};

export default async function WompiConfigPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const propertyId = await getActivePropertyId();
  if (!propertyId) redirect("/onboarding");

  const cfg = await getWompiConfigForUI(propertyId);
  const isConnected = !!(cfg?.public_key && cfg.hasPrivateKey);
  const isPaused = isConnected && !cfg?.is_active;
  const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/webhooks/wompi`;

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
                style={{ background: "linear-gradient(135deg, #21B563 0%, #0F8A48 100%)" }}
              >
                Wompi
              </span>
              <h1 className="font-serif italic font-medium text-[28px] text-ink m-0 tracking-[-0.02em]">
                Configuración
              </h1>
              {isConnected && !isPaused && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-medium uppercase tracking-[0.08em] bg-sage-tint text-sage border border-[rgba(92,117,103,0.18)]">
                  <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-sage" />
                  Conectada
                </span>
              )}
              {isPaused && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-medium uppercase tracking-[0.08em] bg-linen text-ink-soft border border-rule">
                  <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-ink-muted" />
                  Pausada
                </span>
              )}
            </div>
            <p className="text-sm text-ink-soft m-0 max-w-[56ch] leading-[1.55]">
              Tus credenciales se cifran end-to-end. Solo tú puedes verlas en este formulario.
            </p>
          </div>
        </header>

        <WompiConfigForm
          propertyId={propertyId}
          initial={
            cfg
              ? {
                  publicKey: cfg.public_key ?? "",
                  isTestMode: cfg.is_test_mode,
                  isActive: cfg.is_active,
                  hasPrivateKey: cfg.hasPrivateKey,
                  hasEventsSecret: cfg.hasEventsSecret,
                }
              : null
          }
          webhookUrl={webhookUrl}
        />
      </main>
    </>
  );
}
