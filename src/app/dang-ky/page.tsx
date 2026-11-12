import type { Metadata } from "next";
import { SignupForm } from "@/components/auth-forms";

export const metadata: Metadata = { title: "Đăng ký tài khoản", robots: { index: false } };

export default function Page() {
  return <SignupForm />;
}
