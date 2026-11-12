import type { Metadata } from "next";
import { TensesAdmin } from "@/components/admin/content-admin";
import { StaffShell } from "@/components/admin/shell";

export const metadata: Metadata = { title: "Quản lý ngữ pháp", robots: { index: false } };

export default function Page() {
  return (
    <StaffShell need="staff" active="/quan-tri/ngu-phap" title="Quản lý ngữ pháp">
      <TensesAdmin />
    </StaffShell>
  );
}
