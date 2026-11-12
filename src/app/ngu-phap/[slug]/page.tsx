import type { Metadata } from "next";
import { TenseLessonView } from "@/components/tense-views";
import { getTense, getTenses } from "@/lib/content-source";

export async function generateStaticParams() {
  return (await getTenses()).map((tense) => ({ slug: tense.slug }));
}

export async function generateMetadata({ params }: PageProps<"/ngu-phap/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const tense = await getTense(slug);
  if (!tense) return { title: "Ngữ pháp" };
  return {
    title: `Thì ${tense.name_vi} (${tense.name_en}): công thức, cách dùng, bài tập`,
    description: `${tense.summary_vi} Công thức, dấu hiệu nhận biết và ${tense.exercises.length} câu bài tập có đáp án.`,
  };
}

export default async function TensePage({ params }: PageProps<"/ngu-phap/[slug]">) {
  const { slug } = await params;
  const [tense, all] = await Promise.all([getTense(slug), getTenses()]);
  return (
    <div className="container-page py-10">
      <TenseLessonView slug={slug} initial={tense} siblings={all.map(({ slug: s, name_vi }) => ({ slug: s, name_vi }))} />
    </div>
  );
}
