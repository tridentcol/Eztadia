import type { Metadata } from "next";
import type { AdminUserDetail } from "@/lib/admin";
import {
  listAdminUsersFull,
  getAdminUserDetailFull,
} from "@/lib/db/queries/admin";
import { toAdminUserRow, toAdminUserDetail } from "@/lib/admin/adapter";
import { requireSuperAdmin } from "@/lib/auth/session";
import { UsersPageClient } from "@/components/admin/users/UsersPageClient";

export const metadata: Metadata = {
  title: "Admin · Usuarios — Eztadia",
};

export default async function AdminUsersPage() {
  const me = await requireSuperAdmin();
  const fullRows = await listAdminUsersFull({ limit: 200 });
  const rows = fullRows.map((r) => toAdminUserRow(r, me.id));

  // Pre-cargar detalles para los primeros 50 — el drawer abre instantáneo.
  // Para más, el drawer haría fetch on-demand; por ahora cabe en una página.
  const detailEntries = await Promise.all(
    fullRows.slice(0, 50).map(async (r) => {
      const full = await getAdminUserDetailFull(r.id);
      return full ? ([r.id, toAdminUserDetail(full, me.id)] as const) : null;
    }),
  );
  const details: Record<string, AdminUserDetail> = {};
  for (const entry of detailEntries) {
    if (entry) details[entry[0]] = entry[1];
  }

  return (
    <main
      id="main"
      className="max-w-[1320px] mx-auto px-5 sm:px-12 py-10 sm:py-12 pb-24"
    >
      <header className="mb-9">
        <h1 className="font-serif italic font-medium text-[clamp(26px,4vw,32px)] text-ink m-0 mb-2 tracking-[-0.02em] leading-[1.05]">
          Usuarios de la plataforma
        </h1>
        <p className="text-sm text-ink-muted m-0">
          <span className="oldstyle">{rows.length}</span> cuentas registradas
        </p>
      </header>

      <UsersPageClient rows={rows} details={details} />
    </main>
  );
}
