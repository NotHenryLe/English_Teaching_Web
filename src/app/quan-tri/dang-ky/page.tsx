import type { Metadata } from "next";
import { AdminRegistrations } from "@/components/admin/callan-admin";
import { StaffShell } from "@/components/admin/shell";

export const metadata: Metadata = { title: "Đăng ký lớp Callan", robots: { index: false } };

export default function Page() {
  return (
    <StaffShell need="admin" active="/quan-tri/dang-ky" title="Đăng ký lớp Callan">
      <AdminRegistrations />
    </StaffShell>
  );
}
