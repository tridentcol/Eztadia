"use client";

import { useState, type ReactNode } from "react";
import { Sidebar, type AvailableProperty } from "./Sidebar";
import { Topbar } from "./Topbar";
import type { OwnerSnapshot } from "@/lib/dashboard";

export function DashboardShell({
  snapshot,
  breadcrumb,
  availableProperties = [],
  activePropertyId = null,
  children,
}: {
  snapshot: OwnerSnapshot;
  breadcrumb?: { href?: string; label: string }[];
  availableProperties?: AvailableProperty[];
  activePropertyId?: string | null;
  children: ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="lg:grid lg:grid-cols-[240px_1fr] min-h-screen">
      <Sidebar
        snapshot={snapshot}
        availableProperties={availableProperties}
        activePropertyId={activePropertyId}
        mobileOpen={drawerOpen}
        onMobileClose={() => setDrawerOpen(false)}
      />

      {/* Mobile backdrop */}
      <div
        onClick={() => setDrawerOpen(false)}
        aria-hidden
        className={`lg:hidden fixed inset-0 z-[90] transition-opacity duration-250 ease-organic ${
          drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ background: "rgba(31,27,22,0.4)" }}
      />

      <div className="min-w-0">
        <Topbar snapshot={snapshot} breadcrumb={breadcrumb} onOpenDrawer={() => setDrawerOpen(true)} />
        {children}
      </div>
    </div>
  );
}
