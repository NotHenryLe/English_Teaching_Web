import type { Metadata } from "next";
import { AdminSettings } from "@/components/admin/people-admin";
import { StaffShell } from "@/components/admin/shell";

export const metadata: Metadata = { title: "Cài đặt", robots: { index: false } };

export default function Page() {
  return (
    <StaffShell need="admin" active="/quan-tri/cai-dat" title="Cài đặt">
      <AdminSettings />
    </StaffShell>
  );
}
