import type { Metadata } from "next";
import { TeacherClasses } from "@/components/admin/people-admin";
import { StaffShell } from "@/components/admin/shell";

export const metadata: Metadata = { title: "Lớp tôi dạy", robots: { index: false } };

export default function Page() {
  return (
    <StaffShell need="staff" active="/giao-vien" title="Lớp tôi dạy">
      <TeacherClasses />
    </StaffShell>
  );
}
