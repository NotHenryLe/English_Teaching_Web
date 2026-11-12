import type { Metadata } from "next";
import { DynamicFallback } from "@/components/dynamic-fallback";

export const metadata: Metadata = { title: "Không tìm thấy trang", robots: { index: false } };

export default function NotFound() {
  return <DynamicFallback />;
}
