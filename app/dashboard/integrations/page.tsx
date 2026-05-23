import type { Metadata } from "next";
import { PropertyTabs } from "@/components/calendar/PropertyTabs";
import {
  WompiCard,
  WhatsAppCard,
  IcalCard,
} from "@/components/integrations/IntegrationCards";
import { ComingSoonSection } from "@/components/integrations/ComingSoon";
import { getIntegrations } from "@/lib/integrations";

export const metadata: Metadata = {
  title: "Integraciones · Casa Marina — Eztadia",
};

export default function IntegrationsPage() {
  const integrations = getIntegrations();

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
          <WompiCard data={integrations.wompi} />
          <WhatsAppCard data={integrations.whatsapp} />
          <IcalCard data={integrations.ical} />
        </div>

        <ComingSoonSection />
      </main>
    </>
  );
}
