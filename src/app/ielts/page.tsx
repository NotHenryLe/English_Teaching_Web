import type { Metadata } from "next";
import { IeltsTestList } from "@/components/ielts-list";
import { PageHeader } from "@/components/ui";
import { getIeltsTests } from "@/lib/content-source";

export const metadata: Metadata = {
  title: "Thi thử IELTS Listening & Reading miễn phí",
  description: "Làm đề thi thử IELTS Listening và Reading trực tuyến: đúng cấu trúc 40 câu, có đồng hồ đếm giờ, chấm điểm, quy đổi band và giải thích đáp án.",
};

export default async function IeltsPage() {
  const tests = await getIeltsTests();
  return (
    <div className="container-page py-10">
      <PageHeader
        eyebrow="IELTS"
        title="Thi thử IELTS Listening & Reading"
        description="Đề luyện tập đúng cấu trúc bài thi thật: 40 câu, có đếm giờ. Nộp bài xong bạn nhận được số câu đúng, band ước tính và giải thích từng câu."
      />
      <IeltsTestList initial={tests} />
    </div>
  );
}
