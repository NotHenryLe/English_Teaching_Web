import type { Metadata } from "next";
import { StudentResults } from "@/components/admin/people-admin";
import { StaffShell } from "@/components/admin/shell";

export const metadata: Metadata = { title: "Kết quả học viên", robots: { index: false } };

export default function Page() {
  return (
    <StaffShell need="staff" active="/quan-tri/ket-qua" title="Kết quả học viên">
      <StudentResults />
    </StaffShell>
  );
}
