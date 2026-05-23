import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ForbiddenError, UnauthenticatedError } from "@/lib/errors";
import {
  listAdminWebhookLogs,
  listAdminWebhookProviders,
} from "@/lib/db/queries/admin";
import { WebhooksPageClient } from "@/components/admin/webhooks/WebhooksPageClient";

export const metadata: Metadata = {
  title: "Admin · Webhooks — Eztadia",
};

export default async function AdminWebhooksPage() {
  let rows: Awaited<ReturnType<typeof listAdminWebhookLogs>>;
  let providers: string[];
  try {
    [rows, providers] = await Promise.all([
      listAdminWebhookLogs({ limit: 300 }),
      listAdminWebhookProviders(),
    ]);
  } catch (err) {
    if (err instanceof UnauthenticatedError) redirect("/login");
    if (err instanceof ForbiddenError) redirect("/forbidden");
    throw err;
  }

  return (
    <main
      id="main"
      className="max-w-[1320px] mx-auto px-5 sm:px-12 py-10 sm:py-12 pb-24"
    >
      <header className="mb-9">
        <h1 className="font-serif italic font-medium text-[clamp(26px,4vw,32px)] text-ink m-0 mb-2 tracking-[-0.02em] leading-[1.05]">
          Webhooks
        </h1>
        <p className="text-sm text-ink-muted m-0">
          Últimos{" "}
          <span
            className="font-serif"
            style={{
              fontVariantNumeric: "oldstyle-nums tabular-nums",
              fontFeatureSettings: '"onum","tnum"',
            }}
          >
            {rows.length}
          </span>{" "}
          eventos · Wompi, Meta WhatsApp y otros providers
        </p>
      </header>

      <WebhooksPageClient rows={rows} providers={providers} />
    </main>
  );
}
