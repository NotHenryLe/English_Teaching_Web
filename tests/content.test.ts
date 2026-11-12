// Kiểm tra tính nhất quán của nội dung mẫu trong content/ (chạy: npm test).
// Bắt các lỗi soạn thảo dễ mắc: thiếu đáp án, đáp án không nằm trong lựa chọn, đánh số trùng…
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { IELTS_SEED } from "../content/ielts.ts";
import { TENSES_SEED } from "../content/tenses.ts";
import { VOCAB_SEED } from "../content/vocabulary.ts";

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const label = (option: string) => option.slice(0, option.indexOf(". "));

describe("từ vựng", () => {
  test("slug hợp lệ và không trùng", () => {
    const slugs = VOCAB_SEED.map((topic) => topic.slug);
    assert.equal(new Set(slugs).size, slugs.length);
    for (const slug of slugs) assert.match(slug, SLUG);
  });

  test("mỗi từ đủ 6 trường, có phiên âm và ví dụ chứa chính từ đó", () => {
    for (const topic of VOCAB_SEED) {
      assert.ok(topic.words.length >= 10, `${topic.slug} cần ít nhất 10 từ`);
      const seen = new Set<string>();
      for (const entry of topic.words) {
        assert.equal(entry.length, 6, `${topic.slug}: ${entry[0]}`);
        const [word, ipa, pos, meaning, exampleEn, exampleVi] = entry;
        for (const field of entry) assert.ok(field.trim().length > 0, `${topic.slug}: ${word} có trường trống`);
        assert.match(ipa, /^\/.+\/$/, `${word}: IPA phải nằm giữa hai dấu /`);
        assert.match(pos, /\.$/, `${word}: từ loại viết tắt kết thúc bằng dấu chấm`);
        assert.ok(!seen.has(word), `${topic.slug}: trùng từ ${word}`);
        seen.add(word);
        assert.notEqual(meaning, word);
        assert.notEqual(exampleEn, exampleVi);
        // Câu ví dụ phải dùng từ đang học (chấp nhận biến thể chia động từ / số nhiều).
        const stem = word.split(" ")[0].toLowerCase().replace(/(e|y)$/, "").slice(0, 4);
        assert.ok(exampleEn.toLowerCase().includes(stem), `${word}: ví dụ “${exampleEn}” không chứa từ`);
      }
    }
  });
});

describe("ngữ pháp", () => {
  test("đủ 12 thì, chia đều 3 nhóm thời gian", () => {
    assert.equal(TENSES_SEED.length, 12);
    for (const group of ["present", "past", "future"]) {
      assert.equal(TENSES_SEED.filter((tense) => tense.time_group === group).length, 4);
    }
    assert.equal(new Set(TENSES_SEED.map((tense) => tense.slug)).size, 12);
  });

  test("mỗi thì có công thức, cách dùng, dấu hiệu và bài tập hợp lệ", () => {
    for (const tense of TENSES_SEED) {
      assert.match(tense.slug, SLUG);
      assert.ok(tense.formulas.length >= 3, tense.slug);
      assert.ok(tense.usages.length >= 1, tense.slug);
      assert.ok(tense.signals.length >= 3, tense.slug);
      assert.ok(tense.exercises.length >= 6, tense.slug);
      for (const exercise of tense.exercises) {
        assert.ok(exercise.prompt.includes("___"), `${tense.slug}: câu hỏi cần có chỗ trống — ${exercise.prompt}`);
        assert.ok(exercise.answers.length > 0);
        assert.ok(exercise.explanation_vi.length > 0);
        if (exercise.options) {
          assert.equal(new Set(exercise.options).size, exercise.options.length, exercise.prompt);
          assert.equal(exercise.answers.length, 1, `trắc nghiệm chỉ có một đáp án: ${exercise.prompt}`);
          assert.ok(exercise.options.includes(exercise.answers[0]), `đáp án không nằm trong lựa chọn: ${exercise.prompt}`);
        }
      }
    }
  });
});

describe("IELTS", () => {
  for (const test_ of IELTS_SEED) {
    test(`${test_.slug}: 40 câu đánh số liên tục, câu nào cũng có đáp án hợp lệ`, () => {
      assert.match(test_.slug, SLUG);
      const numbers: number[] = [];
      for (const section of test_.content.sections) {
        if (test_.skill === "reading") assert.ok((section.passage ?? "").length > 1500, `${section.title}: bài đọc quá ngắn`);
        else assert.ok((section.transcript ?? []).length > 0, `${section.title}: thiếu transcript`);
        for (const group of section.groups) {
          for (const question of group.questions) {
            numbers.push(question.n);
            const entry = test_.key[question.n];
            assert.ok(entry?.accept.length, `câu ${question.n} thiếu đáp án`);
            assert.ok(entry.explain, `câu ${question.n} thiếu giải thích`);
            if (group.kind === "tfng") assert.ok(["TRUE", "FALSE", "NOT GIVEN"].includes(entry.accept[0]), `câu ${question.n}`);
            if (group.kind === "ynng") assert.ok(["YES", "NO", "NOT GIVEN"].includes(entry.accept[0]), `câu ${question.n}`);
            if (group.kind === "choice" || group.kind === "match") {
              const options = question.options ?? group.options ?? [];
              assert.ok(options.length >= 3, `câu ${question.n} thiếu lựa chọn`);
              for (const option of options) assert.ok(option.includes(". "), `lựa chọn phải có nhãn “A. …”: ${option}`);
              assert.equal(entry.accept.length, 1);
              assert.ok(options.map(label).includes(entry.accept[0]), `câu ${question.n}: đáp án ${entry.accept[0]} không có trong lựa chọn`);
            }
            if (group.kind === "fill") assert.ok(question.prompt.includes("________"), `câu ${question.n} cần có chỗ trống`);
          }
        }
      }
      assert.deepEqual(numbers, Array.from({ length: 40 }, (_, i) => i + 1));
      assert.deepEqual(Object.keys(test_.key).map(Number).sort((a, b) => a - b), numbers);
    });
  }

  test("bài đọc: đáp án điền từ lấy đúng từ có trong bài", () => {
    const reading = IELTS_SEED.find((item) => item.skill === "reading")!;
    for (const section of reading.content.sections) {
      for (const group of section.groups.filter((item) => item.kind === "fill")) {
        for (const question of group.questions) {
          const answer = reading.key[question.n].accept[0];
          assert.ok(section.passage!.toLowerCase().includes(answer.toLowerCase()), `câu ${question.n}: “${answer}” không có trong bài`);
        }
      }
    }
  });

  test("bài nghe: đáp án điền từ xuất hiện trong lời thoại", () => {
    const listening = IELTS_SEED.find((item) => item.skill === "listening")!;
    const spoken: Record<string, string> = { "6.30": "half past six", "9": "ninth", "95": "ninety-five", "10": "ten per cent" };
    for (const section of listening.content.sections) {
      const script = section.transcript!.map((line) => line.text).join(" ").toLowerCase();
      for (const group of section.groups.filter((item) => item.kind === "fill")) {
        for (const question of group.questions) {
          const answer = listening.key[question.n].accept[0];
          assert.ok(script.includes((spoken[answer] ?? answer).toLowerCase()), `câu ${question.n}: “${answer}” không có trong lời thoại`);
        }
      }
    }
  });
});
