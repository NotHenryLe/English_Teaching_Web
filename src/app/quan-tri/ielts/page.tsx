import type { Metadata } from "next";
import { IeltsAdmin } from "@/components/admin/ielts-admin";
import { StaffShell } from "@/components/admin/shell";

export const metadata: Metadata = { title: "Quản lý đề IELTS", robots: { index: false } };

export default function Page() {
  return (
    <StaffShell need="staff" active="/quan-tri/ielts" title="Quản lý đề IELTS">
      <IeltsAdmin />
    </StaffShell>
  );
}
