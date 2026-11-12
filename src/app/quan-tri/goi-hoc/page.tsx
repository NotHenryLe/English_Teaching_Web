import type { Metadata } from "next";
import { AdminPackages } from "@/components/admin/callan-admin";
import { StaffShell } from "@/components/admin/shell";

export const metadata: Metadata = { title: "Gói học Callan", robots: { index: false } };

export default function Page() {
  return (
    <StaffShell need="admin" active="/quan-tri/goi-hoc" title="Gói học Callan">
      <AdminPackages />
    </StaffShell>
  );
}
