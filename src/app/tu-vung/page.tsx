import type { Metadata } from "next";
import { VocabTopicList } from "@/components/vocab-views";
import { PageHeader } from "@/components/ui";
import { getVocabTopics } from "@/lib/content-source";

export const metadata: Metadata = {
  title: "Từ vựng tiếng Anh theo chủ đề",
  description: "Học từ vựng tiếng Anh theo các chủ đề gần gũi: gia đình, đồ ăn, du lịch, công việc… có phiên âm IPA, nghĩa tiếng Việt, câu ví dụ và phát âm.",
};

export default async function VocabularyPage() {
  const topics = await getVocabTopics();
  return (
    <div className="container-page py-10">
      <PageHeader
        eyebrow="Từ vựng"
        title="Từ vựng theo chủ đề"
        description="Chọn một chủ đề quen thuộc để bắt đầu. Mỗi từ đều có phiên âm, nghĩa tiếng Việt, câu ví dụ và nút nghe phát âm."
      />
      <VocabTopicList initial={topics} />
    </div>
  );
}
