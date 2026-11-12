// Truy vấn nội dung công khai. Cùng một hàm chạy được ở hai nơi:
//  - lúc build, để in sẵn nội dung vào HTML (tốt cho SEO, mở trang là thấy ngay);
//  - trên trình duyệt, để làm mới nội dung sau khi admin chỉnh sửa mà không cần build lại.
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CallanPackage,
  ContactSettings,
  IeltsTest,
  IeltsTestSummary,
  Tense,
  TenseWithExercises,
  VocabTopic,
  VocabTopicWithWords,
} from "./types";
import { EMPTY_CONTACT } from "./types";

function unwrap<T>(result: { data: unknown; error: { message: string } | null }): T {
  if (result.error) throw result.error;
  return result.data as T;
}

export async function fetchVocabTopics(db: SupabaseClient): Promise<VocabTopic[]> {
  type Row = VocabTopic & { vocab_words: { count: number }[] };
  const rows = unwrap<Row[]>(
    await db.from("vocab_topics").select("*, vocab_words(count)").eq("published", true).order("sort_order").order("title_en"),
  );
  return rows.map(({ vocab_words, ...topic }) => ({ ...topic, word_count: vocab_words?.[0]?.count ?? 0 }));
}

export async function fetchVocabTopic(db: SupabaseClient, slug: string): Promise<VocabTopicWithWords | null> {
  type Row = VocabTopic & { vocab_words: VocabTopicWithWords["words"] };
  const row = unwrap<Row | null>(
    await db
      .from("vocab_topics")
      .select("*, vocab_words(*)")
      .eq("slug", slug)
      .eq("published", true)
      .order("sort_order", { referencedTable: "vocab_words" })
      .maybeSingle(),
  );
  if (!row) return null;
  const { vocab_words, ...topic } = row;
  return { ...topic, words: vocab_words ?? [], word_count: vocab_words?.length ?? 0 };
}

export async function fetchTenses(db: SupabaseClient): Promise<Tense[]> {
  return unwrap<Tense[]>(await db.from("tenses").select("*").eq("published", true).order("sort_order"));
}

export async function fetchTense(db: SupabaseClient, slug: string): Promise<TenseWithExercises | null> {
  type Row = Tense & { tense_exercises: TenseWithExercises["exercises"] };
  const row = unwrap<Row | null>(
    await db
      .from("tenses")
      .select("*, tense_exercises(*)")
      .eq("slug", slug)
      .eq("published", true)
      .order("sort_order", { referencedTable: "tense_exercises" })
      .maybeSingle(),
  );
  if (!row) return null;
  const { tense_exercises, ...tense } = row;
  return { ...tense, exercises: tense_exercises ?? [] };
}

const IELTS_SUMMARY = "id, slug, title, skill, description_vi, duration_minutes, question_count, sort_order, published";

export async function fetchIeltsTests(db: SupabaseClient): Promise<IeltsTestSummary[]> {
  return unwrap<IeltsTestSummary[]>(
    await db.from("ielts_tests").select(IELTS_SUMMARY).eq("published", true).order("sort_order").order("title"),
  );
}

export async function fetchIeltsTest(db: SupabaseClient, slug: string): Promise<IeltsTest | null> {
  return unwrap<IeltsTest | null>(
    await db.from("ielts_tests").select(`${IELTS_SUMMARY}, content`).eq("slug", slug).eq("published", true).maybeSingle(),
  );
}

export async function fetchCallanPackages(db: SupabaseClient): Promise<CallanPackage[]> {
  return unwrap<CallanPackage[]>(
    await db.from("callan_packages").select("*").eq("active", true).order("sort_order").order("price_vnd"),
  );
}

export async function fetchContact(db: SupabaseClient): Promise<ContactSettings> {
  const row = unwrap<{ value: Partial<ContactSettings> } | null>(
    await db.from("site_settings").select("value").eq("key", "contact").maybeSingle(),
  );
  return { ...EMPTY_CONTACT, ...(row?.value ?? {}) };
}
