/** Chuẩn hóa câu trả lời điền từ: không phân biệt hoa thường, dấu nháy cong, khoảng trắng thừa, dấu chấm cuối. */
export function normalizeAnswer(value: string): string {
  return value
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[.?!]+$/, "")
    .trim();
}

export function isAnswerCorrect(given: string, accepted: string[]): boolean {
  const normalized = normalizeAnswer(given);
  return normalized !== "" && accepted.some((answer) => normalizeAnswer(answer) === normalized);
}

export const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
