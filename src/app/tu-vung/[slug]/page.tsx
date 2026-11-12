import type { Metadata } from "next";
import { VocabTopicView } from "@/components/vocab-views";
import { getVocabTopic, getVocabTopics } from "@/lib/content-source";

export async function generateStaticParams() {
  return (await getVocabTopics()).map((topic) => ({ slug: topic.slug }));
}

export async function generateMetadata({ params }: PageProps<"/tu-vung/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const topic = await getVocabTopic(slug);
  if (!topic) return { title: "Từ vựng" };
  return {
    title: `Từ vựng chủ đề ${topic.title_vi} (${topic.title_en})`,
    description: `${topic.words.length} từ vựng tiếng Anh chủ đề ${topic.title_vi}: ${topic.words
      .slice(0, 6)
      .map((word) => word.word)
      .join(", ")}… kèm phiên âm, nghĩa và phát âm.`,
  };
}

export default async function VocabTopicPage({ params }: PageProps<"/tu-vung/[slug]">) {
  const { slug } = await params;
  const topic = await getVocabTopic(slug);
  return (
    <div className="container-page py-10">
      <VocabTopicView slug={slug} initial={topic} />
    </div>
  );
}
