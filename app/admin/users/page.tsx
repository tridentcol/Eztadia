import type { Metadata } from "next";
import {
  getAdminUsers,
  getAdminUserDetail,
  type AdminUserDetail,
} from "@/lib/admin";
import { UsersPageClient } from "@/components/admin/users/UsersPageClient";

export const metadata: Metadata = {
  title: "Admin · Usuarios — Eztadia",
};

export default function AdminUsersPage() {
  const rows = getAdminUsers();
  const details = rows.reduce<Record<string, AdminUserDetail>>((acc, r) => {
    const d = getAdminUserDetail(r.id);
    if (d) acc[r.id] = d;
    return acc;
  }, {});

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
