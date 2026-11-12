import type { Metadata } from "next";
import { PronounceTool } from "@/components/pronounce-tool";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = {
  title: "Luyện phát âm tiếng Anh: nghe đọc và tra phiên âm",
  description: "Gõ từ hoặc câu tiếng Anh để nghe phát âm giọng Anh-Mỹ, Anh-Anh, nghe chậm từng từ và tra phiên âm IPA, nghĩa, ví dụ.",
};

export default function PronunciationPage() {
  return (
    <div className="container-page py-10">
      <PageHeader
        eyebrow="Phát âm"
        title="Nghe phát âm & tra từ"
        description="Gõ một từ hoặc một câu tiếng Anh rồi bấm loa để nghe. Với từ đơn, bạn xem được cả phiên âm IPA, nghĩa và câu ví dụ."
      />
      <PronounceTool />
    </div>
  );
}
