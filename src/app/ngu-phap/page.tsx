import type { Metadata } from "next";
import { TenseList } from "@/components/tense-views";
import { PageHeader } from "@/components/ui";
import { getTenses } from "@/lib/content-source";

export const metadata: Metadata = {
  title: "12 thì trong tiếng Anh kèm bài tập",
  description: "Học 12 thì tiếng Anh: công thức, cách dùng, dấu hiệu nhận biết giải thích bằng tiếng Việt, kèm bài tập có đáp án và lời giải.",
};

export default async function GrammarPage() {
  const tenses = await getTenses();
  return (
    <div className="container-page py-10">
      <PageHeader
        eyebrow="Ngữ pháp"
        title="12 thì trong tiếng Anh"
        description="Mỗi bài gồm công thức, cách dùng, dấu hiệu nhận biết và bài tập có lời giải. Nên học lần lượt từ các thì đơn trước."
      />
      <TenseList initial={tenses} />
    </div>
  );
}
