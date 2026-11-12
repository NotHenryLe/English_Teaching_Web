"use client";

import { Check, RotateCcw, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { fetchVocabTopic, fetchVocabTopics } from "@/lib/queries";
import type { VocabTopic, VocabTopicWithWords, VocabWord } from "@/lib/types";
import { useLive } from "./providers";
import { SpeechSettings } from "./speech-settings";
import { Breadcrumb, EmptyState, PageHeader, SpeakButton, cx } from "./ui";

export function VocabTopicList({ initial }: { initial: VocabTopic[] }) {
  const { data: topics } = useLive(initial, fetchVocabTopics, "vocab-topics");
  if (!topics.length) {
    return <EmptyState title="Chưa có chủ đề nào">Nội dung đang được cập nhật. Bạn quay lại sau nhé.</EmptyState>;
  }
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {topics.map((topic) => (
        <li key={topic.id}>
          <Link href={`/tu-vung/${topic.slug}`} className="card group flex h-full flex-col p-5 transition-transform hover:-translate-y-0.5">
            <span aria-hidden className="text-4xl">
              {topic.icon}
            </span>
            <span className="mt-3 text-lg font-bold group-hover:text-brand-700">{topic.title_vi}</span>
            <span className="text-sm text-muted">{topic.title_en}</span>
            <span className="mt-auto pt-4 text-sm font-semibold text-brand-700">{topic.word_count ?? 0} từ →</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

type Mode = "list" | "cards" | "quiz";

export function VocabTopicView({ slug, initial }: { slug: string; initial: VocabTopicWithWords | null }) {
  const { data: topic, fresh } = useLive(initial, (db) => fetchVocabTopic(db, slug), `vocab-topic:${slug}`);
  const [mode, setMode] = useState<Mode>("list");

  if (!topic) {
    return (
      <EmptyState title={fresh || initial === null ? "Không tìm thấy chủ đề này" : "Đang tải…"}>
        <Link href="/tu-vung" className="font-semibold text-brand-700 hover:underline">
          ← Xem tất cả chủ đề
        </Link>
      </EmptyState>
    );
  }

  const modes: { id: Mode; label: string }[] = [
    { id: "list", label: "Danh sách" },
    { id: "cards", label: "Thẻ ghi nhớ" },
    { id: "quiz", label: "Kiểm tra nhanh" },
  ];

  return (
    <>
      <Breadcrumb items={[{ href: "/tu-vung", label: "Từ vựng" }, { label: topic.title_vi }]} />
      <PageHeader title={`${topic.icon} ${topic.title_vi}`} description={topic.description_vi}>
        <p className="mt-1 text-muted">
          {topic.title_en} · {topic.words.length} từ
        </p>
      </PageHeader>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div role="tablist" aria-label="Cách học" className="inline-flex rounded-xl border-[1.5px] border-line bg-white p-1">
          {modes.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={mode === item.id}
              onClick={() => setMode(item.id)}
              className={cx(
                "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
                mode === item.id ? "bg-ink text-white" : "text-ink hover:bg-ink/5",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <SpeechSettings />
      </div>

      {topic.words.length === 0 ? (
        <EmptyState title="Chủ đề này chưa có từ nào" />
      ) : mode === "list" ? (
        <WordList words={topic.words} />
      ) : mode === "cards" ? (
        <Flashcards key={topic.id} words={topic.words} />
      ) : (
        <Quiz key={topic.id} words={topic.words} />
      )}
    </>
  );
}

function WordList({ words }: { words: VocabWord[] }) {
  return (
    <ul className="grid gap-3 lg:grid-cols-2">
      {words.map((word) => (
        <li key={word.id} className="card p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <SpeakButton text={word.word} />
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                <span lang="en" className="text-xl font-bold">
                  {word.word}
                </span>
                {word.ipa ? <span className="ipa">{word.ipa}</span> : null}
                {word.part_of_speech ? <span className="chip chip-gray">{word.part_of_speech}</span> : null}
              </p>
              <p className="mt-0.5 font-semibold text-brand-700">{word.meaning_vi}</p>
              {word.example_en ? (
                <div className="mt-2.5 flex items-start gap-2 rounded-xl bg-paper p-2.5">
                  <SpeakButton text={word.example_en} size="sm" label={`Nghe câu ví dụ: ${word.example_en}`} />
                  <p className="text-sm leading-relaxed">
                    <span lang="en">{word.example_en}</span>
                    {word.example_vi ? <span className="block text-muted">{word.example_vi}</span> : null}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function Flashcards({ words }: { words: VocabWord[] }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const word = words[index];
  const go = (step: number) => {
    setIndex((value) => (value + step + words.length) % words.length);
    setFlipped(false);
  };

  return (
    <div className="mx-auto max-w-xl">
      <p className="mb-3 text-center text-sm font-semibold text-muted" aria-live="polite">
        Thẻ {index + 1} / {words.length}
      </p>
      <div className="card flex min-h-72 flex-col items-center justify-center p-8 text-center">
        <p lang="en" className="text-4xl font-extrabold tracking-tight">
          {word.word}
        </p>
        {word.ipa ? <p className="ipa mt-2 text-xl">{word.ipa}</p> : null}
        <div className="mt-4 flex gap-2">
          <SpeakButton text={word.word} size="lg" />
          <SpeakButton text={word.word} size="lg" slow label={`Nghe chậm: ${word.word}`} className="!bg-white" />
        </div>
        <div className="mt-6 min-h-20 w-full" aria-live="polite">
          {flipped ? (
            <>
              <p className="text-xl font-bold text-brand-700">{word.meaning_vi}</p>
              {word.example_en ? (
                <p className="mt-2 text-sm text-muted">
                  <span lang="en" className="text-ink">
                    {word.example_en}
                  </span>
                  <br />
                  {word.example_vi}
                </p>
              ) : null}
            </>
          ) : (
            <button type="button" className="btn btn-sun" onClick={() => setFlipped(true)}>
              Xem nghĩa
            </button>
          )}
        </div>
      </div>
      <div className="mt-4 flex justify-between gap-3">
        <button type="button" className="btn btn-outline" onClick={() => go(-1)}>
          ← Trước
        </button>
        <button type="button" className="btn btn-primary" onClick={() => go(1)}>
          Tiếp →
        </button>
      </div>
    </div>
  );
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

interface QuizRound {
  word: VocabWord;
  choices: VocabWord[];
}

function buildQuiz(words: VocabWord[]): QuizRound[] {
  return shuffle(words)
    .slice(0, 10)
    .map((word) => ({
      word,
      choices: shuffle([word, ...shuffle(words.filter((other) => other.id !== word.id && other.meaning_vi !== word.meaning_vi)).slice(0, 3)]),
    }));
}

function Quiz({ words }: { words: VocabWord[] }) {
  // Trộn câu hỏi sau khi người dùng bấm bắt đầu để HTML in sẵn và trình duyệt không lệch nhau.
  const [rounds, setRounds] = useState<QuizRound[] | null>(null);
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const canPlay = useMemo(() => new Set(words.map((word) => word.meaning_vi)).size >= 4, [words]);

  const start = () => {
    setRounds(buildQuiz(words));
    setStep(0);
    setPicked(null);
    setScore(0);
  };

  if (!canPlay) return <EmptyState title="Cần ít nhất 4 từ để tạo bài kiểm tra" />;

  if (!rounds) {
    return (
      <div className="card mx-auto max-w-xl p-8 text-center">
        <p className="text-xl font-bold">Kiểm tra nhanh {Math.min(10, words.length)} từ</p>
        <p className="mt-2 text-muted">Nghe hoặc đọc từ tiếng Anh rồi chọn nghĩa tiếng Việt đúng.</p>
        <button type="button" className="btn btn-primary mt-5" onClick={start}>
          Bắt đầu
        </button>
      </div>
    );
  }

  if (step >= rounds.length) {
    const ratio = score / rounds.length;
    return (
      <div className="card mx-auto max-w-xl p-8 text-center" aria-live="polite">
        <p className="text-sm font-semibold uppercase tracking-wider text-muted">Kết quả</p>
        <p className="mt-2 text-5xl font-extrabold text-brand-700">
          {score}/{rounds.length}
        </p>
        <p className="mt-3 text-muted">
          {ratio === 1 ? "Tuyệt vời! Bạn nhớ hết các từ." : ratio >= 0.7 ? "Khá tốt! Ôn lại vài từ còn sai nhé." : "Hãy xem lại danh sách từ rồi thử lần nữa."}
        </p>
        <button type="button" className="btn btn-primary mt-5" onClick={start}>
          <RotateCcw size={16} aria-hidden /> Làm lại
        </button>
      </div>
    );
  }

  const round = rounds[step];
  const answered = picked !== null;

  return (
    <div className="mx-auto max-w-xl">
      <p className="mb-3 text-center text-sm font-semibold text-muted">
        Câu {step + 1} / {rounds.length} · Đúng {score}
      </p>
      <div className="card p-6">
        <div className="flex items-center justify-center gap-3">
          <p lang="en" className="text-3xl font-extrabold">
            {round.word.word}
          </p>
          <SpeakButton text={round.word.word} />
        </div>
        <p className="ipa mt-1 text-center">{round.word.ipa}</p>
        <div className="mt-5 grid gap-2.5" role="group" aria-label="Chọn nghĩa đúng">
          {round.choices.map((choice) => {
            const isCorrect = choice.id === round.word.id;
            const isPicked = picked === choice.id;
            return (
              <button
                key={choice.id}
                type="button"
                disabled={answered}
                onClick={() => {
                  setPicked(choice.id);
                  if (isCorrect) setScore((value) => value + 1);
                }}
                className={cx(
                  "flex items-center justify-between gap-3 rounded-xl border-[1.5px] px-4 py-3 text-left font-medium transition-colors",
                  !answered && "border-line bg-white hover:border-brand-500 hover:bg-brand-50",
                  answered && isCorrect && "border-good-600 bg-good-50 text-good-700",
                  answered && isPicked && !isCorrect && "border-bad-600 bg-bad-50 text-bad-700",
                  answered && !isCorrect && !isPicked && "border-line bg-white opacity-60",
                )}
              >
                {choice.meaning_vi}
                {answered && isCorrect ? <Check size={18} aria-label="Đáp án đúng" /> : null}
                {answered && isPicked && !isCorrect ? <X size={18} aria-label="Bạn chọn sai" /> : null}
              </button>
            );
          })}
        </div>
        <div className="mt-5 flex min-h-11 items-center justify-between gap-3" aria-live="polite">
          {answered ? (
            <>
              <p className="text-sm">
                {picked === round.word.id ? (
                  <span className="font-semibold text-good-700">Chính xác!</span>
                ) : (
                  <span className="font-semibold text-bad-700">Chưa đúng.</span>
                )}{" "}
                <span lang="en" className="text-muted">
                  {round.word.example_en}
                </span>
              </p>
              <button
                type="button"
                className="btn btn-primary shrink-0"
                onClick={() => {
                  setStep((value) => value + 1);
                  setPicked(null);
                }}
              >
                {step + 1 === rounds.length ? "Xem kết quả" : "Câu tiếp"}
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
