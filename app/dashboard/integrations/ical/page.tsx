import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  getCurrentProfile,
  getActivePropertyId,
} from "@/lib/auth/session";
import {
  listIcalFeeds,
  getPropertyIcalSecret,
  getIcalStats,
} from "@/lib/db/queries/integrations";
import { listRooms } from "@/lib/db/queries/rooms";
import { PropertyTabs } from "@/components/calendar/PropertyTabs";
import {
  IcalPageClient,
  type IcalFeedView,
} from "@/components/integrations/IcalPageClient";

export const metadata: Metadata = {
  title: "iCal · Sincronización — Eztadia",
};

export default async function IcalConfigPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const propertyId = await getActivePropertyId();
  if (!propertyId) redirect("/onboarding");

  const [feedsRaw, rooms, secret, stats] = await Promise.all([
    listIcalFeeds(propertyId),
    listRooms(propertyId, { onlyActive: true }),
    getPropertyIcalSecret(propertyId),
    getIcalStats(propertyId),
  ]);

  const feeds: IcalFeedView[] = feedsRaw.map((f) => ({
    id: f.id,
    name: f.name,
    url: f.url,
    direction: f.direction,
    isActive: f.is_active,
    lastSyncedAt: f.last_synced_at,
    lastSyncError: f.last_sync_error,
    roomId: f.room_id,
    room: f.room,
  }));

  const outgoingUrl = secret
    ? `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/ical/${propertyId}/${secret}.ics`
    : null;

  return (
    <>
      <PropertyTabs />
      <main
        id="main"
        className="max-w-[820px] mx-auto px-5 sm:px-8 py-10 sm:py-12 pb-24"
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
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-linen text-gold-dark font-bold text-[13px] tracking-[0.02em]"
              >
                iCal Sync
              </span>
              <h1 className="font-serif italic font-medium text-[28px] text-ink m-0 tracking-[-0.02em]">
                Sincronización
              </h1>
            </div>
            <p className="text-sm text-ink-soft m-0 max-w-[62ch] leading-[1.55]">
              Importa reservas desde otras plataformas (Booking, Airbnb, etc.)
              y publica tu disponibilidad para que actualicen sus calendarios.
              Sincronizamos automáticamente cada 15 minutos.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-3 border-y border-rule mb-9">
          <StatCell label="Feeds entrantes" value={stats.inboundCount} />
          <StatCell label="Feeds salientes" value={stats.outboundCount} bordered />
          <StatCell
            label="Bloqueos externos"
            value={stats.externalBlocks}
            bordered
          />
        </div>

        <IcalPageClient
          propertyId={propertyId}
          feeds={feeds}
          rooms={rooms.map((r) => ({ id: r.id, number: r.number }))}
          outgoingUrl={outgoingUrl}
        />
      </main>
    </>
  );
}

function StatCell({
  label,
  value,
  bordered = false,
}: {
  label: string;
  value: number;
  bordered?: boolean;
}) {
  return (
    <div className={["py-4 px-4", bordered ? "border-l border-rule" : ""].join(" ")}>
      <p className="text-[10.5px] tracking-[0.08em] uppercase text-ink-muted font-medium m-0 mb-1.5">
        {label}
      </p>
      <p
        className="font-serif oldstyle leading-none text-ink m-0 tabular-nums"
        style={{ fontSize: 28 }}
      >
        {value}
      </p>
    </div>
  );
}
