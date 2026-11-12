import type { Metadata } from "next";
import { VocabAdmin } from "@/components/admin/content-admin";
import { StaffShell } from "@/components/admin/shell";

export const metadata: Metadata = { title: "Quản lý từ vựng", robots: { index: false } };

export default function Page() {
  return (
    <StaffShell need="staff" active="/quan-tri/tu-vung" title="Quản lý từ vựng">
      <VocabAdmin />
    </StaffShell>
  );
}
