import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth-forms";

export const metadata: Metadata = { title: "Đặt lại mật khẩu", robots: { index: false } };

export default function Page() {
  return <ResetPasswordForm />;
}
