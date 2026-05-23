import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ForbiddenError, UnauthenticatedError } from "@/lib/errors";
import { listAdminWhatsappMessages } from "@/lib/db/queries/admin";
import { WhatsappPageClient } from "@/components/admin/whatsapp/WhatsappPageClient";

export const metadata: Metadata = {
  title: "Admin · WhatsApp logs — Eztadia",
};

export default async function AdminWhatsappPage() {
  let rows: Awaited<ReturnType<typeof listAdminWhatsappMessages>>;
  try {
    rows = await listAdminWhatsappMessages({ limit: 300 });
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
          WhatsApp
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
          mensajes · cross-tenant
        </p>
      </header>

      <WhatsappPageClient rows={rows} />
    </main>
  );
}
