import type { Metadata } from "next";
import { AdminOverview } from "@/components/admin/callan-admin";
import { StaffShell } from "@/components/admin/shell";

export const metadata: Metadata = { title: "Tổng quan", robots: { index: false } };

export default function Page() {
  return (
    <StaffShell need="admin" active="/quan-tri" title="Tổng quan">
      <AdminOverview />
    </StaffShell>
  );
}
