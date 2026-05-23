import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  getCurrentProfile,
  getActivePropertyId,
} from "@/lib/auth/session";
import {
  listConversations,
  getConversationMessages,
} from "@/lib/db/queries/messages";
import { getWhatsAppConfigForUI } from "@/lib/db/queries/integrations";
import { PropertyTabs } from "@/components/calendar/PropertyTabs";
import { ConversationsList } from "@/components/messages/ConversationsList";
import { ConversationThread } from "@/components/messages/ConversationThread";

export const metadata: Metadata = {
  title: "Mensajes — Eztadia",
};

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ phone?: string }>;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const propertyId = await getActivePropertyId();
  if (!propertyId) redirect("/onboarding");

  const sp = await searchParams;
  const rawPhone = sp.phone?.trim() ?? "";
  // Sanity check — solo formato E.164 razonable
  const activePhone =
    rawPhone && /^\+\d{8,15}$/.test(rawPhone) ? rawPhone : null;

  const [waCfg, conversations] = await Promise.all([
    getWhatsAppConfigForUI(propertyId),
    listConversations(propertyId),
  ]);

  const messages = activePhone
    ? await getConversationMessages(propertyId, activePhone)
    : [];

  const activeConv = activePhone
    ? conversations.find((c) => c.counterpartPhone === activePhone) ?? null
    : null;

  const showThread = activePhone !== null;
  const isWhatsAppConnected = !!(
    waCfg?.businessAccountId && waCfg.hasAccessToken
  );

  return (
    <>
      <PropertyTabs />
      <main
        id="main"
        className="max-w-[1200px] mx-auto px-5 sm:px-12 py-10 sm:py-12 pb-24"
      >
        <header className="mb-7">
          <h1 className="font-serif italic font-medium text-[clamp(26px,4vw,32px)] text-ink m-0 mb-2 tracking-[-0.02em] leading-[1.05]">
            Mensajes
          </h1>
          <p className="text-sm text-ink-muted m-0 max-w-[60ch] leading-[1.55]">
            Conversaciones de WhatsApp con tus huéspedes — lectura en tiempo
            real, vinculadas a reservas cuando aplica.
          </p>
        </header>

        {!isWhatsAppConnected && (
          <div className="mb-6 bg-paper border-[1.5px] border-[rgba(184,146,62,0.45)] rounded-2xl p-5">
            <p className="text-[13.5px] text-ink m-0 mb-1.5 font-medium">
              WhatsApp no está conectado todavía
            </p>
            <p className="text-[12.5px] text-ink-soft m-0 leading-relaxed">
              Conecta tu cuenta para empezar a enviar y recibir mensajes.{" "}
              <a
                href="/dashboard/integrations/whatsapp"
                className="text-sage underline"
              >
                Ir a configuración
              </a>
              .
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-5">
          <section
            className={[
              "min-w-0",
              showThread ? "hidden md:block" : "block",
            ].join(" ")}
            aria-label="Conversaciones"
          >
            <ConversationsList
              conversations={conversations}
              activePhone={activePhone}
            />
          </section>

          <section
            className={[
              "min-w-0",
              showThread ? "block" : "hidden md:block",
            ].join(" ")}
            aria-label="Hilo de mensajes"
          >
            {activePhone ? (
              <ConversationThread
                messages={messages}
                counterpartPhone={activePhone}
                guestName={activeConv?.guestName ?? null}
                bookingCode={activeConv?.bookingCode ?? null}
              />
            ) : (
              <EmptyThread hasConversations={conversations.length > 0} />
            )}
          </section>
        </div>
      </main>
    </>
  );
}

function EmptyThread({ hasConversations }: { hasConversations: boolean }) {
  return (
    <div className="bg-paper border border-rule rounded-2xl p-10 text-center min-h-[420px] flex flex-col items-center justify-center">
      <p className="font-serif italic text-[20px] text-ink m-0 mb-2">
        {hasConversations
          ? "Selecciona una conversación"
          : "Aún no hay mensajes"}
      </p>
      <p className="text-[13px] text-ink-soft m-0 max-w-[40ch] leading-relaxed">
        {hasConversations
          ? "Elige una conversación de la lista para ver el hilo completo."
          : "Cuando un huésped escriba o cuando Eztadia envíe un mensaje automático, las conversaciones aparecerán aquí."}
      </p>
    </div>
  );
}
