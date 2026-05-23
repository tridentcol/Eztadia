import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PropertyTabs } from "@/components/calendar/PropertyTabs";
import {
  WompiCard,
  WhatsAppCard,
  IcalCard,
} from "@/components/integrations/IntegrationCards";
import { ComingSoonSection } from "@/components/integrations/ComingSoon";
import { getIntegrations, type IntegrationStatus } from "@/lib/integrations";
import {
  getCurrentProfile,
  getActivePropertyId,
} from "@/lib/auth/session";
import { getWompiConfigForUI } from "@/lib/db/mutations/wompi";
import {
  getWhatsAppConfigForUI,
  listIcalFeeds,
  getPropertyIcalSecret,
} from "@/lib/db/queries/integrations";

export const metadata: Metadata = {
  title: "Integraciones — Eztadia",
};

export default async function IntegrationsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const propertyId = await getActivePropertyId();
  if (!propertyId) redirect("/onboarding");

  // Demo data sigue describiendo features estáticos (commission %, copy de
  // marketing). El status real lo computamos de DB y lo sobrescribimos.
  const demo = getIntegrations();

  const [wompiCfg, waCfg, icalFeeds, icalSecret] = await Promise.all([
    getWompiConfigForUI(propertyId),
    getWhatsAppConfigForUI(propertyId),
    listIcalFeeds(propertyId),
    getPropertyIcalSecret(propertyId),
  ]);

  const wompiStatus: IntegrationStatus = !wompiCfg
    ? "disconnected"
    : wompiCfg.public_key && wompiCfg.hasPrivateKey
      ? wompiCfg.is_active
        ? "connected"
        : "partial"
      : "disconnected";

  const whatsappStatus: IntegrationStatus = !waCfg
    ? "disconnected"
    : waCfg.hasAccessToken && waCfg.isActive
      ? "connected"
      : "partial";

  const inboundActive = icalFeeds.filter(
    (f) => f.direction === "inbound" && f.is_active,
  );
  const icalStatus: IntegrationStatus =
    !icalSecret && inboundActive.length === 0
      ? "disconnected"
      : icalSecret && inboundActive.length > 0
        ? "connected"
        : "partial";

  return (
    <>
      <PropertyTabs />
      <main id="main" className="max-w-[1140px] mx-auto px-5 sm:px-12 py-10 sm:py-12 pb-24">
        <header className="mb-9">
          <h1 className="font-serif italic font-medium text-[clamp(26px,4vw,32px)] text-ink m-0 mb-2 tracking-[-0.02em] leading-[1.05]">
            Conexiones
          </h1>
          <p className="text-sm text-ink-muted m-0 max-w-[60ch] leading-[1.55]">
            Eztadia se conecta con servicios externos para recibir pagos, enviar mensajes y sincronizar calendarios.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <WompiCard data={{ ...demo.wompi, status: wompiStatus }} />
          <WhatsAppCard data={{ ...demo.whatsapp, status: whatsappStatus }} />
          <IcalCard data={{ ...demo.ical, status: icalStatus }} />
        </div>

        <ComingSoonSection />
      </main>
    </>
  );
}
