import type { Metadata } from "next";
import { AdminClasses } from "@/components/admin/callan-admin";
import { StaffShell } from "@/components/admin/shell";

export const metadata: Metadata = { title: "Lớp & lịch học", robots: { index: false } };

export default function Page() {
  return (
    <StaffShell need="admin" active="/quan-tri/lop-hoc" title="Lớp & lịch học">
      <AdminClasses />
    </StaffShell>
  );
}
