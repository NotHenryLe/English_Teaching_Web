import type { Metadata } from "next";
import { ContactDetails } from "@/components/contact-details";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = {
  title: "Liên hệ",
  description: "Thông tin liên hệ: địa chỉ, số điện thoại, email và các kênh hỗ trợ học viên.",
};

export default function ContactPage() {
  return (
    <div className="container-page max-w-3xl py-10">
      <PageHeader eyebrow="Liên hệ" title="Liên hệ với chúng tôi" description="Bạn cần hỗ trợ về bài học, tài khoản hay lớp Callan? Hãy liên hệ qua các kênh dưới đây." />
      <ContactDetails />
    </div>
  );
}
