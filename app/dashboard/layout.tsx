import { getOwnerSnapshot } from "@/lib/dashboard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const snapshot = getOwnerSnapshot();
  return <DashboardShell snapshot={snapshot}>{children}</DashboardShell>;
}
