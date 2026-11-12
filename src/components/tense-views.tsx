"use client";

import { Check, RotateCcw, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { isAnswerCorrect, isUuid } from "@/lib/answers";
import { fetchTense, fetchTenses } from "@/lib/queries";
import { describeError, getSupabase } from "@/lib/supabase";
import type { Tense, TenseExercise, TenseWithExercises, TimeGroup } from "@/lib/types";
import { useAuth, useLive } from "./providers";
import { SpeechSettings } from "./speech-settings";
import { Breadcrumb, DraftBanner, EmptyState, Notice, PageHeader, SpeakButton, cx } from "./ui";

const GROUPS: { id: TimeGroup; label: string; tone: string }[] = [
  { id: "present", label: "Hiện tại", tone: "bg-brand-600" },
  { id: "past", label: "Quá khứ", tone: "bg-sun-500" },
  { id: "future", label: "Tương lai", tone: "bg-good-600" },
];

export function TenseList({ initial }: { initial: Tense[] }) {
  const { data: tenses } = useLive(initial, fetchTenses, "tenses");
  if (!tenses.length) return <EmptyState title="Chưa có bài học nào">Nội dung đang được cập nhật.</EmptyState>;
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {GROUPS.map((group) => (
        <section key={group.id} aria-labelledby={`nhom-${group.id}`}>
          <h2 id={`nhom-${group.id}`} className="mb-3 flex items-center gap-2 text-lg font-bold">
            <span aria-hidden className={cx("h-3 w-3 rounded-full", group.tone)} />
            {group.label}
          </h2>
          <ol className="grid gap-3">
            {tenses
              .filter((tense) => tense.time_group === group.id)
              .map((tense) => (
                <li key={tense.id}>
                  <Link href={`/ngu-phap/${tense.slug}`} className="card group block p-4 transition-transform hover:-translate-y-0.5">
                    <span className="block font-bold group-hover:text-brand-700">{tense.name_vi}</span>
                    <span lang="en" className="block text-sm text-muted">
                      {tense.name_en}
                    </span>
                    {tense.formulas[0] ? (
                      <code className="mt-2 inline-block rounded-md bg-paper px-2 py-1 text-xs font-semibold text-ink">{tense.formulas[0].pattern}</code>
                    ) : null}
                  </Link>
                </li>
              ))}
          </ol>
        </section>
      ))}
    </div>
  );
}

export function TenseLessonView({
  slug,
  initial,
  siblings,
}: {
  slug: string;
  initial: TenseWithExercises | null;
  siblings: { slug: string; name_vi: string }[];
}) {
  const { data: tense, settled } = useLive(initial, (db) => fetchTense(db, slug), `tense:${slug}`);

  if (!tense) {
    return (
      <EmptyState title={settled ? "Không tìm thấy bài học này" : "Đang tải…"}>
        <Link href="/ngu-phap" className="font-semibold text-brand-700 hover:underline">
          ← Xem 12 thì
        </Link>
      </EmptyState>
    );
  }

  const position = siblings.findIndex((item) => item.slug === slug);
  const previous = position > 0 ? siblings[position - 1] : null;
  const next = position >= 0 && position < siblings.length - 1 ? siblings[position + 1] : null;

  return (
    <article className="mx-auto max-w-3xl">
      <Breadcrumb items={[{ href: "/ngu-phap", label: "Ngữ pháp" }, { label: tense.name_vi }]} />
      {!tense.published ? <DraftBanner /> : null}
      <PageHeader eyebrow={tense.name_en} title={`Thì ${tense.name_vi}`} description={tense.summary_vi} />
      <SpeechSettings className="mb-8" />

      <section aria-labelledby="cong-thuc" className="mb-10">
        <h2 id="cong-thuc" className="mb-3 text-xl font-bold">
          Công thức
        </h2>
        <ul className="grid gap-3">
          {tense.formulas.map((formula) => (
            <li key={formula.label} className="card p-4">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <span className="chip">{formula.label}</span>
                <code className="rounded-lg bg-ink px-3 py-1.5 text-sm font-semibold text-white">{formula.pattern}</code>
              </div>
              {formula.example_en ? <Example en={formula.example_en} vi={formula.example_vi} /> : null}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="cach-dung" className="mb-10">
        <h2 id="cach-dung" className="mb-3 text-xl font-bold">
          Cách dùng
        </h2>
        <ol className="grid gap-3">
          {tense.usages.map((usage, index) => (
            <li key={usage.text_vi} className="card p-4">
              <p className="flex gap-3 font-semibold">
                <span aria-hidden className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sun-300 text-xs font-bold">
                  {index + 1}
                </span>
                {usage.text_vi}
              </p>
              {usage.example_en ? <Example en={usage.example_en} vi={usage.example_vi} /> : null}
            </li>
          ))}
        </ol>
      </section>

      {tense.signals.length ? (
        <section aria-labelledby="dau-hieu" className="mb-10">
          <h2 id="dau-hieu" className="mb-3 text-xl font-bold">
            Dấu hiệu nhận biết
          </h2>
          <ul className="flex flex-wrap gap-2">
            {tense.signals.map((signal) => (
              <li key={signal} lang="en" className="rounded-full border-[1.5px] border-line bg-white px-3 py-1 text-sm font-medium">
                {signal}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {tense.notes_vi ? (
        <section aria-labelledby="luu-y" className="mb-10">
          <h2 id="luu-y" className="mb-3 text-xl font-bold">
            Lưu ý
          </h2>
          <div className="prose-lesson rounded-[1.25rem] border-[1.5px] border-sun-400 bg-sun-50 p-5 leading-relaxed">
            {tense.notes_vi.split(/\n{2,}/).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>
      ) : null}

      <section aria-labelledby="bai-tap" className="mb-10">
        <h2 id="bai-tap" className="mb-1 text-xl font-bold">
          Bài tập
        </h2>
        {tense.exercises.length ? (
          <ExerciseSet key={tense.id} tenseId={tense.id} exercises={tense.exercises} />
        ) : (
          <p className="text-muted">Bài tập cho thì này đang được biên soạn.</p>
        )}
      </section>

      <nav aria-label="Bài học khác" className="flex justify-between gap-3 border-t-[1.5px] border-line pt-6">
        {previous ? (
          <Link href={`/ngu-phap/${previous.slug}`} className="btn btn-outline">
            ← {previous.name_vi}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/ngu-phap/${next.slug}`} className="btn btn-outline">
            {next.name_vi} →
          </Link>
        ) : null}
      </nav>
    </article>
  );
}

function Example({ en, vi }: { en: string; vi: string }) {
  return (
    <div className="mt-3 flex items-start gap-2.5 rounded-xl bg-paper p-3">
      <SpeakButton text={en} size="sm" label={`Nghe ví dụ: ${en}`} />
      <p className="text-sm leading-relaxed">
        <span lang="en" className="font-medium">
          {en}
        </span>
        {vi ? <span className="block text-muted">{vi}</span> : null}
      </p>
    </div>
  );
}

function ExerciseSet({ tenseId, exercises }: { tenseId: string; exercises: TenseExercise[] }) {
  const { user } = useAuth();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saved" | "guest" | "error">("idle");
  const [saveError, setSaveError] = useState("");

  const results = exercises.map((exercise) => isAnswerCorrect(answers[exercise.id] ?? "", exercise.answers));
  const score = results.filter(Boolean).length;
  const answeredCount = exercises.filter((exercise) => (answers[exercise.id] ?? "").trim() !== "").length;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    const db = getSupabase();
    if (!db || !user || !isUuid(tenseId)) {
      setSaveState("guest");
      return;
    }
    const { error } = await db.from("exercise_attempts").insert({ tense_id: tenseId, score, total: exercises.length });
    if (error) {
      setSaveError(describeError(error));
      setSaveState("error");
    } else {
      setSaveState("saved");
    }
  };

  const reset = () => {
    setAnswers({});
    setSubmitted(false);
    setSaveState("idle");
  };

  return (
    <form onSubmit={submit} noValidate>
      <p className="mb-4 text-sm text-muted">
        Chọn hoặc điền đáp án cho {exercises.length} câu rồi bấm <strong>Nộp bài</strong> để xem kết quả và lời giải.
      </p>
      <ol className="grid gap-4">
        {exercises.map((exercise, index) => {
          const value = answers[exercise.id] ?? "";
          const correct = results[index];
          return (
            <li
              key={exercise.id}
              className={cx("card p-4 sm:p-5", submitted && (correct ? "!border-good-600" : "!border-bad-600"))}
            >
              <fieldset disabled={submitted}>
                <legend className="flex gap-3 font-semibold">
                  <span aria-hidden className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <span lang="en" className="pt-0.5">
                    {exercise.prompt}
                  </span>
                </legend>
                {exercise.kind === "choice" ? (
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {exercise.options.map((option) => (
                      <label
                        key={option}
                        className={cx(
                          "flex cursor-pointer items-center gap-2.5 rounded-xl border-[1.5px] px-3 py-2.5 text-sm font-medium transition-colors",
                          value === option ? "border-brand-500 bg-brand-50" : "border-line bg-white hover:border-brand-200",
                          submitted && "cursor-default",
                        )}
                      >
                        <input
                          type="radio"
                          name={exercise.id}
                          value={option}
                          checked={value === option}
                          onChange={() => setAnswers((current) => ({ ...current, [exercise.id]: option }))}
                          className="h-4 w-4 accent-brand-600"
                        />
                        <span lang="en">{option}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <input
                    type="text"
                    lang="en"
                    value={value}
                    onChange={(event) => setAnswers((current) => ({ ...current, [exercise.id]: event.target.value }))}
                    placeholder="Điền đáp án…"
                    aria-label={`Đáp án câu ${index + 1}`}
                    autoComplete="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    className="input mt-3 max-w-md"
                  />
                )}
              </fieldset>
              {submitted ? (
                <div className={cx("mt-3 rounded-xl p-3 text-sm", correct ? "bg-good-50 text-good-700" : "bg-bad-50 text-bad-700")}>
                  <p className="flex items-center gap-1.5 font-semibold">
                    {correct ? <Check size={16} aria-hidden /> : <X size={16} aria-hidden />}
                    {correct ? "Đúng" : value.trim() ? "Chưa đúng" : "Chưa trả lời"}
                    {!correct ? (
                      <span className="font-normal">
                        — Đáp án:{" "}
                        <strong lang="en" className="font-semibold">
                          {exercise.answers[0]}
                        </strong>
                      </span>
                    ) : null}
                  </p>
                  {exercise.explanation_vi ? <p className="mt-1 text-ink">{exercise.explanation_vi}</p> : null}
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>

      <div className="mt-6" aria-live="polite">
        {submitted ? (
          <div className="card flex flex-wrap items-center justify-between gap-4 p-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-muted">Kết quả</p>
              <p className="text-3xl font-extrabold text-brand-700">
                {score}/{exercises.length} câu đúng
              </p>
              <div className="mt-2 text-sm">
                {saveState === "saved" ? <span className="text-good-700">Đã lưu vào tiến độ học của bạn.</span> : null}
                {saveState === "guest" ? (
                  <span className="text-muted">
                    <Link href="/dang-nhap" className="font-semibold text-brand-700 hover:underline">
                      Đăng nhập
                    </Link>{" "}
                    để lưu điểm và theo dõi tiến bộ.
                  </span>
                ) : null}
                {saveState === "error" ? <span className="text-bad-700">Chưa lưu được điểm. {saveError}</span> : null}
              </div>
            </div>
            <button type="button" onClick={reset} className="btn btn-outline">
              <RotateCcw size={16} aria-hidden /> Làm lại
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-4">
            <button type="submit" className="btn btn-primary !min-h-12 !px-6">
              Nộp bài
            </button>
            <span className="text-sm text-muted">
              Đã làm {answeredCount}/{exercises.length} câu
            </span>
          </div>
        )}
      </div>
      {submitted && score === exercises.length ? (
        <div className="mt-4">
          <Notice kind="good">Xuất sắc! Bạn đã nắm chắc thì này. Hãy chuyển sang bài tiếp theo.</Notice>
        </div>
      ) : null}
    </form>
  );
}
