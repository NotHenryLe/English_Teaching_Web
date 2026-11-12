import { normalizeAnswer } from "./answers";
import type { IeltsAnswerKey, IeltsContent, IeltsGroup, IeltsQuestion, IeltsResult, IeltsSkill } from "./types";

/** "B. a local charity" → { label: "B", text: "a local charity" } */
export function splitOption(option: string): { label: string; text: string } {
  const at = option.indexOf(". ");
  if (at <= 0 || at > 6) return { label: option, text: "" };
  return { label: option.slice(0, at), text: option.slice(at + 2) };
}

export const FIXED_OPTIONS: Partial<Record<IeltsGroup["kind"], string[]>> = {
  tfng: ["TRUE", "FALSE", "NOT GIVEN"],
  ynng: ["YES", "NO", "NOT GIVEN"],
};

export function allQuestions(content: IeltsContent): { section: number; group: IeltsGroup; question: IeltsQuestion }[] {
  return content.sections.flatMap((section, sectionIndex) =>
    section.groups.flatMap((group) => group.questions.map((question) => ({ section: sectionIndex, group, question }))),
  );
}

/** Bảng quy đổi band — phải khớp với hàm public.ielts_band trong database. */
export function ieltsBand(skill: IeltsSkill, correct: number, total: number): number {
  const raw = total > 0 ? Math.round((correct * 40) / total) : 0;
  const table: [number, number][] =
    skill === "listening"
      ? [[39, 9], [37, 8.5], [35, 8], [32, 7.5], [30, 7], [26, 6.5], [23, 6], [18, 5.5], [16, 5], [13, 4.5], [10, 4], [8, 3.5], [6, 3], [4, 2.5], [2, 2], [1, 1]]
      : [[39, 9], [37, 8.5], [35, 8], [33, 7.5], [30, 7], [27, 6.5], [23, 6], [19, 5.5], [15, 5], [13, 4.5], [10, 4], [8, 3.5], [6, 3], [4, 2.5], [2, 2], [1, 1]];
  return table.find(([min]) => raw >= min)?.[1] ?? 0;
}

/** Chấm tại trình duyệt — chỉ dùng ở chế độ xem thử (chưa nối Supabase) và ô "xem trước" của người soạn đề. */
export function gradeLocally(skill: IeltsSkill, key: IeltsAnswerKey, answers: Record<string, string>): IeltsResult {
  const detail: IeltsResult["detail"] = {};
  let correct = 0;
  const numbers = Object.keys(key);
  for (const number of numbers) {
    const entry = key[number];
    const given = normalizeAnswer(answers[number] ?? "");
    const ok = given !== "" && entry.accept.some((answer) => normalizeAnswer(answer) === given);
    if (ok) correct++;
    detail[number] = { correct: ok, accept: entry.accept, explain: entry.explain ?? "" };
  }
  return { correct, total: numbers.length, band: ieltsBand(skill, correct, numbers.length), saved: false, detail };
}

export const SKILL_LABEL: Record<IeltsSkill, string> = { listening: "Listening", reading: "Reading" };
