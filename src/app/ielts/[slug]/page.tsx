import type { Metadata } from "next";
import { IELTS_SEED } from "../../../../content/ielts";
import { IeltsRunner } from "@/components/ielts-runner";
import { getIeltsTest, getIeltsTests } from "@/lib/content-source";
import { SKILL_LABEL } from "@/lib/ielts";
import { isSupabaseConfigured } from "@/lib/supabase";

export async function generateStaticParams() {
  return (await getIeltsTests()).map((test) => ({ slug: test.slug }));
}

export async function generateMetadata({ params }: PageProps<"/ielts/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const test = await getIeltsTest(slug);
  if (!test) return { title: "IELTS" };
  return {
    title: `${test.title} — thi thử IELTS ${SKILL_LABEL[test.skill]}`,
    description: test.description_vi,
  };
}

export default async function IeltsTestPage({ params }: PageProps<"/ielts/[slug]">) {
  const { slug } = await params;
  const test = await getIeltsTest(slug);
  // Chỉ ở chế độ xem thử (chưa nối Supabase) đáp án mẫu mới được gửi kèm để chấm tại trình duyệt.
  // Khi đã nối Supabase, đáp án nằm trong database và việc chấm do hàm submit_ielts_attempt đảm nhiệm.
  const demoKey = isSupabaseConfigured ? null : (IELTS_SEED.find((item) => item.slug === slug)?.key ?? null);
  return <IeltsRunner slug={slug} initial={test} demoKey={demoKey} />;
}
