import type { Metadata } from "next";
import { AdminUsers } from "@/components/admin/people-admin";
import { StaffShell } from "@/components/admin/shell";

export const metadata: Metadata = { title: "Người dùng", robots: { index: false } };

export default function Page() {
  return (
    <StaffShell need="admin" active="/quan-tri/nguoi-dung" title="Người dùng">
      <AdminUsers />
    </StaffShell>
  );
}
