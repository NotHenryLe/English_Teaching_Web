import type { Metadata } from "next";
import { AuthCallback } from "@/components/auth-forms";

export const metadata: Metadata = { title: "Đang đăng nhập", robots: { index: false } };

export default function Page() {
  return <AuthCallback />;
}
