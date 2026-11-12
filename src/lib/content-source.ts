// Nguồn nội dung LÚC BUILD (chỉ import từ Server Component).
// Ưu tiên đọc Supabase; nếu chưa cấu hình, không kết nối được, hoặc database còn trống
// thì dùng nội dung mẫu trong thư mục content/ — nhờ vậy web luôn build được và
// vẫn xem được ngay cả trước khi nối database.
import { IELTS_SEED } from "../../content/ielts";
import { TENSES_SEED } from "../../content/tenses";
import { VOCAB_SEED } from "../../content/vocabulary";
import {
  fetchCallanPackages,
  fetchContact,
  fetchIeltsTest,
  fetchIeltsTests,
  fetchTense,
  fetchTenses,
  fetchVocabTopic,
  fetchVocabTopics,
} from "./queries";
import { getSupabase } from "./supabase";
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

const warned = new Set<string>();

async function fromDatabase<T>(label: string, query: Parameters<typeof run>[1]): Promise<T | undefined> {
  return run<T>(label, query);
}

async function run<T>(
  label: string,
  query: (db: NonNullable<ReturnType<typeof getSupabase>>) => Promise<T>,
): Promise<T | undefined> {
  const db = getSupabase();
  if (!db) return undefined;
  try {
    return await Promise.race([
      query(db),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("hết thời gian chờ")), 15000)),
    ]);
  } catch (error) {
    if (!warned.has(label)) {
      warned.add(label);
      console.warn(`[content] Không đọc được ${label} từ Supabase, dùng nội dung mẫu:`, (error as Error)?.message ?? error);
    }
    return undefined;
  }
}

// ---- Nội dung mẫu, đưa về cùng hình dạng với dữ liệu trong database ----

const seedVocab: VocabTopicWithWords[] = VOCAB_SEED.map((topic, index) => {
  const id = `seed-${topic.slug}`;
  return {
    id,
    slug: topic.slug,
    title_en: topic.title_en,
    title_vi: topic.title_vi,
    description_vi: topic.description_vi,
    icon: topic.icon,
    sort_order: index + 1,
    published: true,
    word_count: topic.words.length,
    words: topic.words.map(([word, ipa, part_of_speech, meaning_vi, example_en, example_vi], i) => ({
      id: `${id}-${i}`,
      topic_id: id,
      word,
      ipa,
      part_of_speech,
      meaning_vi,
      example_en,
      example_vi,
      sort_order: i + 1,
    })),
  };
});

const seedTenses: TenseWithExercises[] = TENSES_SEED.map((tense, index) => {
  const id = `seed-${tense.slug}`;
  const { exercises, ...rest } = tense;
  return {
    ...rest,
    id,
    sort_order: index + 1,
    published: true,
    exercises: exercises.map((exercise, i) => ({
      id: `${id}-${i}`,
      tense_id: id,
      kind: exercise.options ? "choice" : "fill",
      prompt: exercise.prompt,
      options: exercise.options ?? [],
      answers: exercise.answers,
      explanation_vi: exercise.explanation_vi,
      sort_order: i + 1,
    })),
  };
});

const seedIelts: IeltsTest[] = IELTS_SEED.map((test, index) => ({
  id: `seed-${test.slug}`,
  slug: test.slug,
  title: test.title,
  skill: test.skill,
  description_vi: test.description_vi,
  duration_minutes: test.duration_minutes,
  question_count: Object.keys(test.key).length,
  sort_order: index + 1,
  published: true,
  content: test.content,
}));

// ---- API cho các trang ----

export async function getVocabTopics(): Promise<VocabTopic[]> {
  const rows = await fromDatabase<VocabTopic[]>("danh sách chủ đề từ vựng", fetchVocabTopics);
  if (rows?.length) return rows;
  return seedVocab.map(({ words: _words, ...topic }) => topic);
}

export async function getVocabTopic(slug: string): Promise<VocabTopicWithWords | null> {
  const row = await fromDatabase<VocabTopicWithWords | null>(`chủ đề ${slug}`, (db) => fetchVocabTopic(db, slug));
  return row ?? seedVocab.find((topic) => topic.slug === slug) ?? null;
}

export async function getTenses(): Promise<Tense[]> {
  const rows = await fromDatabase<Tense[]>("danh sách thì", fetchTenses);
  if (rows?.length) return rows;
  return seedTenses.map(({ exercises: _exercises, ...tense }) => tense);
}

export async function getTense(slug: string): Promise<TenseWithExercises | null> {
  const row = await fromDatabase<TenseWithExercises | null>(`thì ${slug}`, (db) => fetchTense(db, slug));
  return row ?? seedTenses.find((tense) => tense.slug === slug) ?? null;
}

export async function getIeltsTests(): Promise<IeltsTestSummary[]> {
  const rows = await fromDatabase<IeltsTestSummary[]>("danh sách đề IELTS", fetchIeltsTests);
  if (rows?.length) return rows;
  return seedIelts.map(({ content: _content, ...test }) => test);
}

export async function getIeltsTest(slug: string): Promise<IeltsTest | null> {
  const row = await fromDatabase<IeltsTest | null>(`đề ${slug}`, (db) => fetchIeltsTest(db, slug));
  return row ?? seedIelts.find((test) => test.slug === slug) ?? null;
}

export async function getCallanPackages(): Promise<CallanPackage[]> {
  return (await fromDatabase<CallanPackage[]>("gói học Callan", fetchCallanPackages)) ?? [];
}

export async function getContact(): Promise<ContactSettings> {
  return (await fromDatabase<ContactSettings>("thông tin liên hệ", fetchContact)) ?? EMPTY_CONTACT;
}
