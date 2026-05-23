import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ForbiddenError, UnauthenticatedError } from "@/lib/errors";
import {
  listAdminProperties,
  getAdminPropertyDetail,
  type AdminPropertyDetail,
} from "@/lib/db/queries/admin";
import { PropertiesPageClient } from "@/components/admin/properties/PropertiesPageClient";

export const metadata: Metadata = {
  title: "Admin · Propiedades — Eztadia",
};

export default async function AdminPropertiesPage() {
  let rows: Awaited<ReturnType<typeof listAdminProperties>>;
  try {
    rows = await listAdminProperties();
  } catch (err) {
    if (err instanceof UnauthenticatedError) redirect("/login");
    if (err instanceof ForbiddenError) redirect("/forbidden");
    throw err;
  }

  // Carga detalles de las primeras 50 (para drawer sin round-trip).
  // Si en el futuro la lista crece, hacer lazy fetch por id.
  const detailsArr = await Promise.all(
    rows.slice(0, 50).map(async (r) => {
      try {
        return [r.id, await getAdminPropertyDetail(r.id)] as const;
      } catch {
        return [r.id, null] as const;
      }
    }),
  );

  const details: Record<string, AdminPropertyDetail> = {};
  for (const [id, d] of detailsArr) {
    if (d) details[id] = d;
  }

  const activeCount = rows.filter((r) => r.isActive).length;

  return (
    <main
      id="main"
      className="max-w-[1320px] mx-auto px-5 sm:px-12 py-10 sm:py-12 pb-24"
    >
      <header className="mb-9">
        <h1 className="font-serif italic font-medium text-[clamp(26px,4vw,32px)] text-ink m-0 mb-2 tracking-[-0.02em] leading-[1.05]">
          Propiedades en la plataforma
        </h1>
        <p className="text-sm text-ink-muted m-0">
          <span
            className="font-serif"
            style={{
              fontVariantNumeric: "oldstyle-nums tabular-nums",
              fontFeatureSettings: '"onum","tnum"',
            }}
          >
            {rows.length}
          </span>{" "}
          totales ·{" "}
          <span
            className="font-serif"
            style={{
              fontVariantNumeric: "oldstyle-nums tabular-nums",
              fontFeatureSettings: '"onum","tnum"',
            }}
          >
            {activeCount}
          </span>{" "}
          activas
        </p>
      </header>

      <PropertiesPageClient rows={rows} details={details} />
    </main>
  );
}
