import type { Metadata } from "next";
import {
  getGlobalKpis,
  getRevenueSnapshot,
  getRecentEvents,
  getTopProperties,
  getAttentionProperties,
} from "@/lib/admin";
import { GlobalKpis } from "@/components/admin/overview/GlobalKpis";
import { RevenueChart } from "@/components/admin/overview/RevenueChart";
import { EventsFeed } from "@/components/admin/overview/EventsFeed";
import { TopProperties } from "@/components/admin/overview/TopProperties";

export const metadata: Metadata = {
  title: "Admin · Resumen — Eztadia",
};

export default function AdminOverviewPage() {
  const kpis = getGlobalKpis();
  const revenue = getRevenueSnapshot();
  const events = getRecentEvents();
  const top = getTopProperties();
  const attention = getAttentionProperties();

  return (
    <main
      id="main"
      className="max-w-[1320px] mx-auto px-5 sm:px-12 py-10 sm:py-12 pb-24"
    >
      <header className="mb-9">
        <span className="block text-[11px] font-medium tracking-[0.14em] uppercase text-gold-dark mb-2.5">
          Plataforma
        </span>
        <h1 className="font-serif italic font-medium text-[clamp(28px,4.5vw,36px)] text-ink m-0 mb-2 tracking-[-0.025em] leading-[1.04]">
          Eztadia en <em className="italic">números</em>.
        </h1>
        <p className="text-sm text-ink-muted m-0 max-w-[56ch]">
          Mayo <span className="oldstyle">2026</span> · Datos actualizados hace{" "}
          <span className="oldstyle">3</span> min
        </p>
      </header>

      <GlobalKpis kpis={kpis} />
      <RevenueChart data={revenue} />
      <EventsFeed events={events} />
      <TopProperties top={top} attention={attention} />
    </main>
  );
}
