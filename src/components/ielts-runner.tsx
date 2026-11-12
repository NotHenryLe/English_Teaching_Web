"use client";

import { Check, Clock, Pause, Play, RotateCcw, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { isUuid } from "@/lib/answers";
import { FIXED_OPTIONS, SKILL_LABEL, allQuestions, gradeLocally, splitOption } from "@/lib/ielts";
import { fetchIeltsTest } from "@/lib/queries";
import { speak, stopSpeaking } from "@/lib/speech";
import { describeError, getSupabase } from "@/lib/supabase";
import type { IeltsAnswerKey, IeltsGroup, IeltsQuestion, IeltsResult, IeltsSection, IeltsTest } from "@/lib/types";
import { useAuth, useLive, useSpeech } from "./providers";
import { SpeechSettings } from "./speech-settings";
import { Breadcrumb, DraftBanner, EmptyState, Modal, Notice, cx, safeUrl } from "./ui";

type Answers = Record<string, string>;
type Phase = "intro" | "running" | "result";

interface SavedProgress {
  answers: Answers;
  startedAt: number;
  endsAt: number;
}

const storageKey = (testId: string) => `etw.ielts.${testId}`;

function readProgress(testId: string): SavedProgress | null {
  try {
    const saved = JSON.parse(window.sessionStorage.getItem(storageKey(testId)) ?? "null") as SavedProgress | null;
    return saved && typeof saved.endsAt === "number" && saved.endsAt > Date.now() ? saved : null;
  } catch {
    return null;
  }
}

export function IeltsRunner({ slug, initial, demoKey }: { slug: string; initial: IeltsTest | null; demoKey: IeltsAnswerKey | null }) {
  const { data: live, settled } = useLive(initial, (db) => fetchIeltsTest(db, slug), `ielts:${slug}`);
  const { user } = useAuth();
  // Giữ nguyên bản đề từ lúc bắt đầu làm, kể cả khi nội dung được làm mới ở nền.
  const [frozen, setFrozen] = useState<IeltsTest | null>(null);
  const test = frozen ?? live;

  const [phase, setPhase] = useState<Phase>("intro");
  const [answers, setAnswers] = useState<Answers>({});
  const [sectionIndex, setSectionIndex] = useState(0);
  const [timing, setTiming] = useState<{ startedAt: number; endsAt: number } | null>(null);
  const [resumable, setResumable] = useState<SavedProgress | null>(null);
  const [result, setResult] = useState<IeltsResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [timeUp, setTimeUp] = useState(false);

  const testId = test?.id ?? null;
  const questions = useMemo(() => (test ? allQuestions(test.content) : []), [test]);
  const answeredCount = questions.filter(({ question }) => (answers[question.n] ?? "").trim() !== "").length;

  useEffect(() => {
    if (!testId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorage chỉ đọc được sau khi lên trình duyệt
    setResumable(readProgress(testId));
  }, [testId]);

  useEffect(() => {
    if (phase !== "running" || !testId || !timing) return;
    try {
      window.sessionStorage.setItem(storageKey(testId), JSON.stringify({ answers, ...timing } satisfies SavedProgress));
    } catch {
      // Hết dung lượng hoặc bị chặn: bỏ qua, bài làm vẫn nằm trong bộ nhớ trang.
    }
  }, [phase, testId, answers, timing]);

  useEffect(() => {
    if (phase !== "running") return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [phase]);

  useEffect(() => () => stopSpeaking(), []);

  const start = (saved?: SavedProgress | null) => {
    if (!live) return;
    const now = Date.now();
    setFrozen(live);
    setAnswers(saved?.answers ?? {});
    setTiming(saved ? { startedAt: saved.startedAt, endsAt: saved.endsAt } : { startedAt: now, endsAt: now + live.duration_minutes * 60_000 });
    setSectionIndex(0);
    setResult(null);
    setError("");
    setTimeUp(false);
    setPhase("running");
    window.scrollTo({ top: 0 });
  };

  const submit = useCallback(async () => {
    if (!test || !timing) return;
    setConfirmOpen(false);
    setSubmitting(true);
    setError("");
    stopSpeaking();
    try {
      const db = getSupabase();
      let graded: IeltsResult;
      if (db && isUuid(test.id)) {
        const { data, error: rpcError } = await db.rpc("submit_ielts_attempt", {
          p_test_id: test.id,
          p_answers: answers,
          p_duration_seconds: Math.max(0, Math.round((Date.now() - timing.startedAt) / 1000)),
        });
        if (rpcError) throw rpcError;
        graded = data as IeltsResult;
      } else if (demoKey) {
        graded = gradeLocally(test.skill, demoKey, answers);
      } else {
        throw new Error("Web chưa kết nối máy chủ nên chưa chấm được bài này.");
      }
      setResult(graded);
      setPhase("result");
      setResumable(null);
      try {
        window.sessionStorage.removeItem(storageKey(test.id));
      } catch {
        // bỏ qua
      }
      window.scrollTo({ top: 0 });
    } catch (caught) {
      setError(describeError(caught));
    } finally {
      setSubmitting(false);
    }
  }, [test, timing, answers, demoKey]);

  const onExpire = useCallback(() => {
    setTimeUp(true);
    void submit();
  }, [submit]);

  if (!test) {
    return (
      <div className="container-page py-10">
        <EmptyState title={settled ? "Không tìm thấy đề thi này" : "Đang tải…"}>
          <Link href="/ielts" className="font-semibold text-brand-700 hover:underline">
            ← Xem tất cả đề thi
          </Link>
        </EmptyState>
      </div>
    );
  }

  if (phase === "intro") {
    return (
      <div className="container-page max-w-3xl py-10">
        <Breadcrumb items={[{ href: "/ielts", label: "IELTS" }, { label: test.title }]} />
        {!test.published ? <DraftBanner /> : null}
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-brand-600">IELTS {SKILL_LABEL[test.skill]}</p>
        <h1 lang="en" className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          {test.title}
        </h1>
        <p className="mt-3 text-lg text-muted">{test.description_vi}</p>

        <dl className="mt-6 grid grid-cols-3 gap-3 text-center">
          {[
            ["Thời gian", `${test.duration_minutes} phút`],
            ["Số câu", `${questions.length}`],
            [test.skill === "listening" ? "Số phần" : "Số bài đọc", `${test.content.sections.length}`],
          ].map(([label, value]) => (
            <div key={label} className="card px-3 py-4">
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</dt>
              <dd className="mt-1 text-2xl font-extrabold">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="card mt-6 p-5">
          <h2 className="font-bold">Trước khi bắt đầu</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
            <li>Đồng hồ đếm ngược chạy ngay khi bạn bấm bắt đầu; hết giờ bài sẽ tự nộp.</li>
            <li>Bạn có thể chuyển qua lại giữa các phần và sửa đáp án cho tới lúc nộp bài.</li>
            {test.skill === "listening" ? (
              <>
                <li>
                  Phần nào chưa có file ghi âm sẽ được đọc bằng <strong>giọng máy của trình duyệt</strong>. Ở chế độ luyện tập bạn được nghe lại nhiều lần
                  (thi thật chỉ nghe một lần).
                </li>
                <li>Hãy bật loa hoặc đeo tai nghe và chọn giọng, tốc độ đọc bên dưới.</li>
              </>
            ) : (
              <li>Điền đúng chính tả với các câu điền từ; không phân biệt chữ hoa, chữ thường.</li>
            )}
            <li>Band điểm là ước tính theo bảng quy đổi phổ biến, chỉ để tham khảo.</li>
          </ul>
          {test.skill === "listening" ? <SpeechSettings className="mt-4" /> : null}
        </div>

        {resumable ? (
          <div className="mt-6">
            <Notice kind="warn">
              <p className="font-semibold">Bạn đang có một bài làm dở cho đề này.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" className="btn btn-primary btn-sm" onClick={() => start(resumable)}>
                  Tiếp tục bài đang làm
                </button>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => start(null)}>
                  Làm lại từ đầu
                </button>
              </div>
            </Notice>
          </div>
        ) : (
          <button type="button" className="btn btn-primary mt-6 !min-h-12 !px-8 !text-base" onClick={() => start(null)} disabled={!questions.length}>
            Bắt đầu làm bài
          </button>
        )}
        {!user ? (
          <p className="mt-4 text-sm text-muted">
            Bạn chưa đăng nhập: vẫn làm bài và xem điểm bình thường, nhưng kết quả sẽ không được lưu.{" "}
            <Link href="/dang-nhap" className="font-semibold text-brand-700 hover:underline">
              Đăng nhập
            </Link>
          </p>
        ) : null}
      </div>
    );
  }

  if (phase === "result" && result) {
    return <ResultView test={test} answers={answers} result={result} onRetry={() => start(null)} loggedIn={Boolean(user)} />;
  }

  const section = test.content.sections[sectionIndex];
  const jumpTo = (number: number) => {
    const target = questions.find(({ question }) => question.n === number);
    if (!target) return;
    setSectionIndex(target.section);
    window.setTimeout(() => document.getElementById(`cau-${number}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 60);
  };

  return (
    <div className="pb-16">
      <div className="sticky top-16 z-30 border-b-[1.5px] border-line bg-white">
        <div className="container-page flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-2.5">
          <div className="min-w-0">
            <p lang="en" className="truncate text-sm font-bold">
              {test.title}
            </p>
            <p className="text-xs text-muted" aria-live="polite">
              Đã trả lời {answeredCount}/{questions.length} câu
            </p>
          </div>
          <div className="flex items-center gap-3">
            {timing ? <Countdown endsAt={timing.endsAt} onExpire={onExpire} /> : null}
            <button type="button" className="btn btn-primary btn-sm" disabled={submitting} onClick={() => setConfirmOpen(true)}>
              {submitting ? "Đang chấm…" : "Nộp bài"}
            </button>
          </div>
        </div>
        <div className="container-page flex gap-1 overflow-x-auto pb-2" role="tablist" aria-label="Các phần của đề">
          {test.content.sections.map((item, index) => (
            <button
              key={item.title}
              type="button"
              role="tab"
              aria-selected={index === sectionIndex}
              onClick={() => {
                stopSpeaking();
                setSectionIndex(index);
                window.scrollTo({ top: 0 });
              }}
              className={cx(
                "shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold",
                index === sectionIndex ? "bg-ink text-white" : "bg-paper text-ink hover:bg-line/60",
              )}
            >
              {item.title}
            </button>
          ))}
        </div>
      </div>

      <div className="container-page pt-5">
        {error ? (
          <div className="mb-4">
            <Notice kind="bad">
              {timeUp ? "Đã hết giờ nhưng chưa nộp được bài. " : ""}
              {error} Bài làm của bạn vẫn được giữ — hãy bấm <strong>Nộp bài</strong> để thử lại.
            </Notice>
          </div>
        ) : null}

        <SectionView key={sectionIndex} section={section} skill={test.skill} answers={answers} setAnswers={setAnswers} />

        <nav aria-label="Bảng câu hỏi" className="card mt-8 p-4">
          <p className="mb-3 text-sm font-semibold">Bảng câu hỏi — bấm số để tới câu đó</p>
          <ol className="flex flex-wrap gap-1.5">
            {questions.map(({ question, section: owner }) => {
              const done = (answers[question.n] ?? "").trim() !== "";
              return (
                <li key={question.n}>
                  <button
                    type="button"
                    onClick={() => jumpTo(question.n)}
                    aria-label={`Câu ${question.n}${done ? ", đã trả lời" : ", chưa trả lời"}`}
                    className={cx(
                      "h-9 w-9 rounded-lg border-[1.5px] text-sm font-semibold",
                      done ? "border-brand-600 bg-brand-600 text-white" : "border-line bg-white hover:border-brand-500",
                      owner === sectionIndex && !done && "border-ink",
                    )}
                  >
                    {question.n}
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="mt-6 flex justify-between gap-3">
          <button type="button" className="btn btn-outline" disabled={sectionIndex === 0} onClick={() => { stopSpeaking(); setSectionIndex((value) => value - 1); window.scrollTo({ top: 0 }); }}>
            ← Phần trước
          </button>
          {sectionIndex < test.content.sections.length - 1 ? (
            <button type="button" className="btn btn-outline" onClick={() => { stopSpeaking(); setSectionIndex((value) => value + 1); window.scrollTo({ top: 0 }); }}>
              Phần tiếp →
            </button>
          ) : (
            <button type="button" className="btn btn-primary" disabled={submitting} onClick={() => setConfirmOpen(true)}>
              Nộp bài
            </button>
          )}
        </div>
      </div>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Nộp bài?">
        <p>
          Bạn đã trả lời <strong>{answeredCount}</strong> trên <strong>{questions.length}</strong> câu.
          {answeredCount < questions.length ? " Các câu bỏ trống sẽ tính là sai." : ""} Sau khi nộp bạn không sửa được đáp án nữa.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className="btn btn-outline" onClick={() => setConfirmOpen(false)}>
            Làm tiếp
          </button>
          <button type="button" className="btn btn-primary" onClick={() => void submit()}>
            Nộp bài
          </button>
        </div>
      </Modal>
    </div>
  );
}

function Countdown({ endsAt, onExpire }: { endsAt: number; onExpire: () => void }) {
  const [remaining, setRemaining] = useState(() => Math.max(0, endsAt - Date.now()));
  const expired = useRef(false);
  const onExpireRef = useRef(onExpire);
  useEffect(() => {
    onExpireRef.current = onExpire;
  });

  useEffect(() => {
    expired.current = false;
    const tick = () => {
      const left = Math.max(0, endsAt - Date.now());
      setRemaining(left);
      if (left === 0 && !expired.current) {
        expired.current = true;
        onExpireRef.current();
      }
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [endsAt]);

  const totalSeconds = Math.ceil(remaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const low = totalSeconds <= 300;
  return (
    <p
      role="timer"
      aria-label={`Còn ${minutes} phút ${seconds} giây`}
      className={cx("flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-base font-bold tabular-nums", low ? "bg-bad-50 text-bad-700" : "bg-paper")}
    >
      <Clock size={16} aria-hidden />
      {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
    </p>
  );
}

function SectionView({
  section,
  skill,
  answers,
  setAnswers,
}: {
  section: IeltsSection;
  skill: IeltsTest["skill"];
  answers: Answers;
  setAnswers: React.Dispatch<React.SetStateAction<Answers>>;
}) {
  const [pane, setPane] = useState<"passage" | "questions">("passage");
  const setAnswer = useCallback((number: number, value: string) => setAnswers((current) => ({ ...current, [number]: value })), [setAnswers]);

  const questionList = (
    <div className="grid gap-6">
      {section.groups.map((group, index) => (
        <QuestionGroup key={index} group={group} answers={answers} setAnswer={setAnswer} />
      ))}
    </div>
  );

  if (skill === "listening" || !section.passage) {
    return (
      <div className="mx-auto max-w-3xl">
        <h2 lang="en" className="text-xl font-bold">
          {section.title}
        </h2>
        {section.instructions ? (
          <p lang="en" className="mt-1 text-sm text-muted">
            {section.instructions}
          </p>
        ) : null}
        {skill === "listening" ? <ListeningPlayer section={section} /> : null}
        <div className="mt-6">{questionList}</div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 inline-flex rounded-xl border-[1.5px] border-line bg-white p-1 lg:hidden" role="tablist" aria-label="Xem bài đọc hoặc câu hỏi">
        {(
          [
            ["passage", "Bài đọc"],
            ["questions", "Câu hỏi"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={pane === id}
            onClick={() => setPane(id)}
            className={cx("rounded-lg px-4 py-2 text-sm font-semibold", pane === id ? "bg-ink text-white" : "hover:bg-ink/5")}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <section
          aria-label="Bài đọc"
          className={cx("card p-5 sm:p-6 lg:block lg:max-h-[calc(100dvh-12.5rem)] lg:overflow-y-auto", pane !== "passage" && "hidden")}
          tabIndex={0}
        >
          {section.instructions ? (
            <p lang="en" className="mb-3 text-sm text-muted">
              {section.instructions}
            </p>
          ) : null}
          <Passage title={section.passageTitle} text={section.passage} />
        </section>
        <section
          aria-label="Câu hỏi"
          className={cx("lg:block lg:max-h-[calc(100dvh-12.5rem)] lg:overflow-y-auto lg:pr-1", pane !== "questions" && "hidden")}
        >
          {questionList}
        </section>
      </div>
    </>
  );
}

function Passage({ title, text }: { title?: string; text: string }) {
  return (
    <div lang="en">
      {title ? <h2 className="mb-4 text-2xl font-extrabold tracking-tight">{title}</h2> : null}
      <div className="grid gap-4 text-[1.02rem] leading-[1.75]">
        {text
          .split(/\n{2,}/)
          .map((paragraph) => paragraph.trim())
          .filter(Boolean)
          .map((paragraph, index) => {
            const labelled = paragraph.match(/^\[([A-Z])\]\s*([\s\S]*)$/);
            return (
              <p key={index}>
                {labelled ? (
                  <>
                    <strong className="mr-2 inline-grid h-6 w-6 place-items-center rounded-md bg-ink text-sm text-white">{labelled[1]}</strong>
                    {labelled[2]}
                  </>
                ) : (
                  paragraph
                )}
              </p>
            );
          })}
      </div>
    </div>
  );
}

function ListeningPlayer({ section }: { section: IeltsSection }) {
  const { prefs, supported } = useSpeech();
  const audioUrl = safeUrl(section.audioUrl);
  const lines = useMemo(() => section.transcript ?? [], [section.transcript]);
  const speakers = useMemo(() => [...new Set(lines.map((line) => line.speaker))], [lines]);
  const [line, setLine] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [finished, setFinished] = useState(false);
  const run = useRef(0);

  useEffect(
    () => () => {
      run.current++;
      stopSpeaking();
    },
    [],
  );

  if (audioUrl) {
    return (
      <div className="card mt-4 p-4">
        <p className="mb-2 text-sm font-semibold">Bấm phát để nghe</p>
        {/* Bài thi nghe không có phụ đề — transcript chỉ hiện sau khi nộp bài. */}
        <audio controls preload="none" src={audioUrl} className="w-full" />
      </div>
    );
  }

  if (!lines.length) {
    return (
      <div className="mt-4">
        <Notice kind="warn">Phần này chưa có âm thanh.</Notice>
      </div>
    );
  }

  const play = (from: number) => {
    const token = ++run.current;
    setPlaying(true);
    setFinished(false);
    const step = async (index: number) => {
      if (token !== run.current) return;
      if (index >= lines.length) {
        setPlaying(false);
        setFinished(true);
        setLine(0);
        return;
      }
      setLine(index);
      const speaker = speakers.indexOf(lines[index].speaker);
      // Mỗi người nói một giọng (nếu máy có nhiều giọng) và cao độ khác nhau để dễ phân biệt.
      const done = await speak(lines[index].text, { ...prefs, voiceIndex: speaker, pitch: [1, 1.2, 0.8, 1.1][speaker % 4] });
      if (token !== run.current) return;
      if (!done) {
        setPlaying(false);
        return;
      }
      await new Promise((resolve) => window.setTimeout(resolve, 350));
      void step(index + 1);
    };
    void step(from);
  };

  const pause = () => {
    run.current++;
    stopSpeaking();
    setPlaying(false);
  };

  return (
    <div className="card mt-4 p-4">
      <div className="flex flex-wrap items-center gap-3">
        {playing ? (
          <button type="button" className="btn btn-sun" onClick={pause}>
            <Pause size={18} aria-hidden /> Tạm dừng
          </button>
        ) : (
          <button type="button" className="btn btn-primary" onClick={() => play(line)} disabled={!supported}>
            <Play size={18} aria-hidden /> {line > 0 ? "Nghe tiếp" : finished ? "Nghe lại" : "Nghe"}
          </button>
        )}
        <button type="button" className="btn btn-outline" onClick={() => { pause(); setLine(0); setFinished(false); }} disabled={!supported || (line === 0 && !playing)}>
          <RotateCcw size={16} aria-hidden /> Từ đầu
        </button>
        <p className="text-sm text-muted" aria-live="polite">
          {playing ? `Đang đọc đoạn ${line + 1}/${lines.length}` : finished ? "Đã đọc hết phần này" : line > 0 ? `Đang dừng ở đoạn ${line + 1}/${lines.length}` : "Âm thanh đọc bằng giọng máy"}
        </p>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line" aria-hidden>
        <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${finished ? 100 : (line / lines.length) * 100}%` }} />
      </div>
      {!supported ? <p className="mt-3 text-sm text-bad-700">Trình duyệt này không hỗ trợ đọc bằng giọng máy. Hãy thử Chrome, Edge hoặc Safari.</p> : null}
    </div>
  );
}

function QuestionGroup({ group, answers, setAnswer }: { group: IeltsGroup; answers: Answers; setAnswer: (number: number, value: string) => void }) {
  const fixed = FIXED_OPTIONS[group.kind];
  return (
    <div className="card p-4 sm:p-5">
      <p lang="en" className="text-sm font-semibold leading-relaxed">
        {group.instructions}
      </p>
      {group.kind === "match" && group.options?.length ? (
        <ul lang="en" className="mt-3 grid gap-1 rounded-xl bg-paper p-3 text-sm">
          {group.options.map((option) => {
            const { label, text } = splitOption(option);
            return (
              <li key={option} className="flex gap-2">
                <strong className="w-8 shrink-0">{label}</strong>
                <span>{text}</span>
              </li>
            );
          })}
        </ul>
      ) : null}
      <ol className="mt-4 grid gap-4">
        {group.questions.map((question) => (
          <li key={question.n} id={`cau-${question.n}`} className="scroll-mt-40">
            <QuestionInput group={group} question={question} fixed={fixed} value={answers[question.n] ?? ""} onChange={(value) => setAnswer(question.n, value)} />
          </li>
        ))}
      </ol>
    </div>
  );
}

function NumberBadge({ n }: { n: number }) {
  return (
    <span aria-hidden className="grid h-7 min-w-7 shrink-0 place-items-center rounded-full bg-ink px-1.5 text-xs font-bold text-white">
      {n}
    </span>
  );
}

function QuestionInput({
  group,
  question,
  fixed,
  value,
  onChange,
}: {
  group: IeltsGroup;
  question: IeltsQuestion;
  fixed?: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  if (group.kind === "fill") {
    const [before, ...rest] = question.prompt.split("________");
    const after = rest.join("________");
    return (
      <label lang="en" className="flex gap-3 leading-loose">
        <NumberBadge n={question.n} />
        <span>
          <span className="sr-only">Question {question.n}: </span>
          {before}
          <input
            type="text"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            aria-label={`Đáp án câu ${question.n}`}
            className="input mx-1 inline-block !min-h-9 !w-40 !py-1 align-baseline"
          />
          {after}
        </span>
      </label>
    );
  }

  if (group.kind === "match") {
    return (
      <label lang="en" className="flex flex-wrap items-center gap-3">
        <NumberBadge n={question.n} />
        <span className="min-w-0 flex-1 font-medium">{question.prompt}</span>
        <select value={value} onChange={(event) => onChange(event.target.value)} className="input !min-h-10 !w-28" aria-label={`Đáp án câu ${question.n}`}>
          <option value="">—</option>
          {(group.options ?? []).map((option) => {
            const { label } = splitOption(option);
            return (
              <option key={option} value={label}>
                {label}
              </option>
            );
          })}
        </select>
      </label>
    );
  }

  const options = fixed ? fixed.map((item) => ({ label: item, text: "" })) : (question.options ?? group.options ?? []).map(splitOption);
  return (
    <fieldset lang="en">
      <legend className="flex gap-3 font-medium">
        <NumberBadge n={question.n} />
        <span className="pt-0.5">{question.prompt}</span>
      </legend>
      <div className={cx("mt-2.5 ml-10 gap-2", fixed ? "flex flex-wrap" : "grid")}>
        {options.map((option) => (
          <label
            key={option.label}
            className={cx(
              "flex cursor-pointer items-start gap-2.5 rounded-xl border-[1.5px] px-3 py-2 text-sm transition-colors",
              value === option.label ? "border-brand-500 bg-brand-50" : "border-line bg-white hover:border-brand-200",
            )}
          >
            <input
              type="radio"
              name={`cau-${question.n}`}
              value={option.label}
              checked={value === option.label}
              onChange={() => onChange(option.label)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-brand-600"
            />
            <span>
              <strong className="font-semibold">{option.label}</strong>
              {option.text ? ` ${option.text}` : ""}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function ResultView({
  test,
  answers,
  result,
  onRetry,
  loggedIn,
}: {
  test: IeltsTest;
  answers: Answers;
  result: IeltsResult;
  onRetry: () => void;
  loggedIn: boolean;
}) {
  const describe = (group: IeltsGroup, question: IeltsQuestion, label: string) => {
    if (group.kind !== "choice" && group.kind !== "match") return label;
    const option = (question.options ?? group.options ?? []).map(splitOption).find((item) => item.label === label);
    return option?.text ? `${label}. ${option.text}` : label;
  };

  return (
    <div className="container-page max-w-3xl py-10">
      <Breadcrumb items={[{ href: "/ielts", label: "IELTS" }, { label: test.title }]} />
      <h1 className="text-3xl font-extrabold tracking-tight">Kết quả bài làm</h1>
      <p lang="en" className="mt-1 text-muted">
        {test.title}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2" aria-live="polite">
        <div className="card p-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted">Số câu đúng</p>
          <p className="mt-1 text-5xl font-extrabold text-brand-700">
            {result.correct}
            <span className="text-2xl text-muted">/{result.total}</span>
          </p>
        </div>
        <div className="card !border-sun-400 bg-sun-50 p-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-sun-700">Band ước tính</p>
          <p className="mt-1 text-5xl font-extrabold">{Number(result.band).toFixed(1)}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm">
          {result.saved ? (
            <span className="text-good-700">
              Kết quả đã được lưu.{" "}
              <Link href="/tai-khoan" className="font-semibold underline">
                Xem tiến độ của tôi
              </Link>
            </span>
          ) : loggedIn ? (
            <span className="text-muted">Kết quả này không được lưu.</span>
          ) : (
            <span className="text-muted">
              <Link href="/dang-nhap" className="font-semibold text-brand-700 hover:underline">
                Đăng nhập
              </Link>{" "}
              để lưu kết quả cho những lần thi sau.
            </span>
          )}
        </p>
        <button type="button" className="btn btn-outline" onClick={onRetry}>
          <RotateCcw size={16} aria-hidden /> Làm lại đề này
        </button>
      </div>

      <h2 className="mt-10 text-xl font-bold">Xem lại đáp án</h2>
      {test.content.sections.map((section) => (
        <section key={section.title} className="mt-5">
          <h3 lang="en" className="mb-3 text-lg font-bold">
            {section.title}
            {section.passageTitle ? <span className="font-normal text-muted"> — {section.passageTitle}</span> : null}
          </h3>
          <ol className="grid gap-2.5">
            {section.groups.flatMap((group) =>
              group.questions.map((question) => {
                const detail = result.detail[question.n];
                const given = (answers[question.n] ?? "").trim();
                const correct = Boolean(detail?.correct);
                return (
                  <li key={question.n} className={cx("card p-4", correct ? "!border-good-600/60" : "!border-bad-600/60")}>
                    <div className="flex gap-3">
                      <span
                        className={cx("grid h-7 w-7 shrink-0 place-items-center rounded-full text-white", correct ? "bg-good-600" : "bg-bad-600")}
                        role="img"
                        aria-label={correct ? "Đúng" : "Sai"}
                      >
                        {correct ? <Check size={15} aria-hidden /> : <X size={15} aria-hidden />}
                      </span>
                      <div className="min-w-0 text-sm">
                        <p lang="en" className="font-medium">
                          <span className="font-bold">{question.n}.</span> {question.prompt}
                        </p>
                        <p className="mt-1.5">
                          Bạn trả lời:{" "}
                          <strong lang="en" className={correct ? "text-good-700" : "text-bad-700"}>
                            {given ? describe(group, question, given) : "(bỏ trống)"}
                          </strong>
                        </p>
                        {!correct && detail ? (
                          <p>
                            Đáp án đúng:{" "}
                            <strong lang="en" className="text-good-700">
                              {detail.accept.map((item) => describe(group, question, item)).join(" / ")}
                            </strong>
                          </p>
                        ) : null}
                        {detail?.explain ? <p className="mt-1.5 text-muted">{detail.explain}</p> : null}
                      </div>
                    </div>
                  </li>
                );
              }),
            )}
          </ol>
          {section.transcript?.length ? (
            <details className="card mt-3 p-4">
              <summary className="cursor-pointer font-semibold">Xem lời thoại (transcript)</summary>
              <div lang="en" className="mt-3 grid gap-2 text-sm leading-relaxed">
                {section.transcript.map((line, index) => (
                  <p key={index}>
                    <strong>{line.speaker}:</strong> {line.text}
                  </p>
                ))}
              </div>
            </details>
          ) : null}
        </section>
      ))}
    </div>
  );
}
