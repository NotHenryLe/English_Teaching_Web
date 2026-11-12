// Sinh supabase/seed.sql từ nội dung mẫu trong content/.
// Chạy: npm run seed:build
//
// File SQL sinh ra chạy lại nhiều lần vẫn an toàn: mục nào đã có (trùng slug) thì bỏ qua,
// nên không bao giờ ghi đè nội dung admin đã chỉnh sửa trong trang quản trị.
import { writeFileSync } from "node:fs";
import { IELTS_SEED } from "../content/ielts.ts";
import { TENSES_SEED } from "../content/tenses.ts";
import { VOCAB_SEED } from "../content/vocabulary.ts";

const text = (value: string) => `'${value.replace(/'/g, "''")}'`;
const json = (value: unknown) => `${text(JSON.stringify(value))}::jsonb`;

const out: string[] = [
  "-- =====================================================================",
  "-- Nội dung mẫu: từ vựng, 12 thì + bài tập, đề IELTS, gói học Callan ví dụ.",
  "-- FILE NÀY ĐƯỢC SINH TỰ ĐỘNG bằng `npm run seed:build` — đừng sửa tay.",
  "-- Chạy SAU file trong supabase/migrations/. Chạy lại nhiều lần vẫn an toàn.",
  "-- =====================================================================",
  "begin;",
  "",
];

out.push("-- ---------- Từ vựng ----------");
VOCAB_SEED.forEach((topic, index) => {
  const words = topic.words
    .map((word, i) => `    (${word.map(text).join(", ")}, ${i + 1})`)
    .join(",\n");
  out.push(
    `with topic as (
  insert into public.vocab_topics (slug, title_en, title_vi, description_vi, icon, sort_order)
  values (${[topic.slug, topic.title_en, topic.title_vi, topic.description_vi, topic.icon].map(text).join(", ")}, ${index + 1})
  on conflict (slug) do nothing
  returning id
)
insert into public.vocab_words (topic_id, word, ipa, part_of_speech, meaning_vi, example_en, example_vi, sort_order)
select topic.id, w.word, w.ipa, w.part_of_speech, w.meaning_vi, w.example_en, w.example_vi, w.sort_order
from topic
cross join (values
${words}
) as w(word, ipa, part_of_speech, meaning_vi, example_en, example_vi, sort_order);
`,
  );
});

out.push("-- ---------- Ngữ pháp: 12 thì ----------");
TENSES_SEED.forEach((tense, index) => {
  const exercises = tense.exercises
    .map(
      (exercise, i) =>
        `    (${text(exercise.options ? "choice" : "fill")}, ${text(exercise.prompt)}, ${json(exercise.options ?? [])}, ${json(exercise.answers)}, ${text(exercise.explanation_vi)}, ${i + 1})`,
    )
    .join(",\n");
  out.push(
    `with tense as (
  insert into public.tenses (slug, name_en, name_vi, time_group, summary_vi, formulas, usages, signals, notes_vi, sort_order)
  values (${[tense.slug, tense.name_en, tense.name_vi, tense.time_group, tense.summary_vi].map(text).join(", ")},
    ${json(tense.formulas)},
    ${json(tense.usages)},
    ${json(tense.signals)},
    ${text(tense.notes_vi)}, ${index + 1})
  on conflict (slug) do nothing
  returning id
)
insert into public.tense_exercises (tense_id, kind, prompt, options, answers, explanation_vi, sort_order)
select tense.id, e.kind, e.prompt, e.options, e.answers, e.explanation_vi, e.sort_order
from tense
cross join (values
${exercises}
) as e(kind, prompt, options, answers, explanation_vi, sort_order);
`,
  );
});

out.push("-- ---------- IELTS ----------");
IELTS_SEED.forEach((test, index) => {
  out.push(
    `with test as (
  insert into public.ielts_tests (slug, title, skill, description_vi, duration_minutes, content, sort_order, published)
  values (${text(test.slug)}, ${text(test.title)}, ${text(test.skill)}, ${text(test.description_vi)}, ${test.duration_minutes},
    ${json(test.content)},
    ${index + 1}, true)
  on conflict (slug) do nothing
  returning id
)
insert into public.ielts_answer_keys (test_id, answers)
select test.id, ${json(test.key)}
from test;
`,
  );
});

out.push(
  `-- ---------- Gói học Callan (ví dụ, đang TẮT) ----------
-- Giá dưới đây chỉ là số minh họa. Hãy sửa tên/giá rồi bật gói trong Quản trị → Gói học.
insert into public.callan_packages (name, description_vi, sessions, price_vnd, sort_order, active)
select * from (values
  ('Gói 8 buổi', 'Ví dụ: 2 buổi/tuần trong 1 tháng, lớp nhỏ qua Google Meet.', 8, 1200000, 1, false),
  ('Gói 24 buổi', 'Ví dụ: 2 buổi/tuần trong 3 tháng, lớp nhỏ qua Google Meet.', 24, 3200000, 2, false)
) as p(name, description_vi, sessions, price_vnd, sort_order, active)
where not exists (select 1 from public.callan_packages);
`,
  "commit;",
  "",
);

const file = new URL("../supabase/seed.sql", import.meta.url);
writeFileSync(file, out.join("\n"));
const words = VOCAB_SEED.reduce((sum, topic) => sum + topic.words.length, 0);
const exercises = TENSES_SEED.reduce((sum, tense) => sum + tense.exercises.length, 0);
console.log(
  `supabase/seed.sql: ${VOCAB_SEED.length} chủ đề / ${words} từ, ${TENSES_SEED.length} thì / ${exercises} bài tập, ${IELTS_SEED.length} đề IELTS`,
);
