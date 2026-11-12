"use client";

import { Search, Square, Trash2, Volume2 } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { useSpeech } from "./providers";
import { SpeechSettings } from "./speech-settings";
import { Notice, SpeakButton, Spinner, cx, safeUrl } from "./ui";

const MAX_LENGTH = 500;
const SAMPLES = ["comfortable", "vegetable", "schedule", "How are you today?", "Could you say that again, please?"];
const WORD = /^[A-Za-z][A-Za-z'’-]*$/;

interface DictionaryEntry {
  word: string;
  phonetics: { text?: string; audio?: string }[];
  meanings: { partOfSpeech: string; definitions: { definition: string; example?: string }[] }[];
}

interface LocalMatch {
  word: string;
  ipa: string;
  part_of_speech: string;
  meaning_vi: string;
  example_en: string;
  example_vi: string;
  vocab_topics: { slug: string; title_vi: string } | null;
}

type Lookup =
  | { status: "idle" }
  | { status: "loading"; word: string }
  | { status: "done"; word: string; entries: DictionaryEntry[]; local: LocalMatch[]; dictionaryFailed: boolean };

async function lookupWord(word: string): Promise<Extract<Lookup, { status: "done" }>> {
  const dictionary = fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.toLowerCase())}`)
    .then(async (response) => {
      if (response.status === 404) return { entries: [] as DictionaryEntry[], failed: false };
      if (!response.ok) throw new Error(String(response.status));
      const body = (await response.json()) as unknown;
      return { entries: Array.isArray(body) ? (body as DictionaryEntry[]) : [], failed: false };
    })
    .catch(() => ({ entries: [] as DictionaryEntry[], failed: true }));

  const db = getSupabase();
  const local = db
    ? db
        .from("vocab_words")
        .select("word, ipa, part_of_speech, meaning_vi, example_en, example_vi, vocab_topics(slug, title_vi)")
        .ilike("word", word.replace(/[%_\\]/g, ""))
        .limit(3)
        .then(({ data }) => (data ?? []) as unknown as LocalMatch[])
    : Promise.resolve([] as LocalMatch[]);

  const [{ entries, failed }, localMatches] = await Promise.all([dictionary, local]);
  return { status: "done", word, entries, local: localMatches, dictionaryFailed: failed };
}

export function PronounceTool() {
  const { supported, say, stop, speaking, prefs } = useSpeech();
  const [text, setText] = useState("");
  const [lookup, setLookup] = useState<Lookup>({ status: "idle" });
  const requestId = useRef(0);

  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/) : [];
  const isSingleWord = words.length === 1 && WORD.test(words[0].replace(/[.,!?;:"]+$/g, ""));
  const isSpeakingText = speaking !== null && speaking === trimmed;

  const runLookup = async (raw: string) => {
    const word = raw.replace(/^[^A-Za-z]+|[^A-Za-z]+$/g, "");
    if (!WORD.test(word)) return;
    const id = ++requestId.current;
    setLookup({ status: "loading", word });
    const result = await lookupWord(word);
    if (id === requestId.current) setLookup(result);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!trimmed) return;
    say(trimmed);
    if (isSingleWord) void runLookup(words[0]);
  };

  const trySample = (sample: string) => {
    setText(sample);
    say(sample);
    if (WORD.test(sample)) void runLookup(sample);
    else setLookup({ status: "idle" });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section aria-label="Nhập văn bản để nghe" className="card flex flex-col p-5">
        <form onSubmit={submit} className="flex flex-1 flex-col">
          <label htmlFor="van-ban" className="field-label">
            Tiếng Anh
          </label>
          <textarea
            id="van-ban"
            lang="en"
            value={text}
            onChange={(event) => setText(event.target.value.slice(0, MAX_LENGTH))}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
            placeholder="Gõ từ hoặc câu tiếng Anh, ví dụ: comfortable"
            rows={5}
            spellCheck={false}
            autoCapitalize="none"
            className="input flex-1 !text-xl"
          />
          <div className="mt-1 flex justify-between text-xs text-muted">
            <span>Nhấn Enter để nghe · Shift + Enter để xuống dòng</span>
            <span>
              {text.length}/{MAX_LENGTH}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {isSpeakingText ? (
              <button type="button" className="btn btn-sun" onClick={stop}>
                <Square size={16} aria-hidden /> Dừng
              </button>
            ) : (
              <button type="submit" className="btn btn-primary" disabled={!trimmed || !supported}>
                <Volume2 size={18} aria-hidden /> Nghe
              </button>
            )}
            <button type="button" className="btn btn-outline" disabled={!trimmed || !supported} onClick={() => say(trimmed, { rate: Math.min(prefs.rate, 0.6) })}>
              🐢 Nghe chậm
            </button>
            {isSingleWord ? (
              <button type="button" className="btn btn-outline" onClick={() => void runLookup(words[0])}>
                <Search size={16} aria-hidden /> Tra từ
              </button>
            ) : null}
            <button
              type="button"
              className="btn btn-ghost ml-auto"
              disabled={!text}
              onClick={() => {
                stop();
                setText("");
                setLookup({ status: "idle" });
              }}
            >
              <Trash2 size={16} aria-hidden /> Xóa
            </button>
          </div>
        </form>

        <SpeechSettings className="mt-5 border-t border-line pt-4" />

        <div className="mt-5">
          <p className="mb-2 text-sm font-semibold text-muted">Thử nhanh</p>
          <div className="flex flex-wrap gap-2">
            {SAMPLES.map((sample) => (
              <button key={sample} type="button" lang="en" className="rounded-full border-[1.5px] border-line bg-white px-3 py-1 text-sm font-medium hover:border-brand-500 hover:bg-brand-50" onClick={() => trySample(sample)}>
                {sample}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section aria-label="Kết quả" aria-live="polite" className="card p-5">
        {words.length > 1 ? (
          <div className="mb-5">
            <p className="mb-2 text-sm font-semibold text-muted">Bấm vào từng từ để nghe riêng và tra nghĩa</p>
            <div lang="en" className="flex flex-wrap gap-1.5">
              {words.map((word, index) => {
                const clean = word.replace(/^[^A-Za-z]+|[^A-Za-z]+$/g, "");
                return (
                  <button
                    key={`${word}-${index}`}
                    type="button"
                    disabled={!clean}
                    onClick={() => {
                      say(clean);
                      void runLookup(clean);
                    }}
                    className={cx(
                      "rounded-lg border-[1.5px] px-2.5 py-1 text-lg font-medium",
                      lookup.status !== "idle" && lookup.word.toLowerCase() === clean.toLowerCase()
                        ? "border-brand-500 bg-brand-50"
                        : "border-line bg-white hover:border-brand-500",
                    )}
                  >
                    {word}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {lookup.status === "idle" ? (
          <div className="grid h-full min-h-40 place-items-center text-center text-muted">
            <p>
              Phiên âm, nghĩa và ví dụ của từ sẽ hiện ở đây.
              <br />
              Hãy nhập <strong>một từ</strong> rồi bấm <strong>Tra từ</strong>.
            </p>
          </div>
        ) : lookup.status === "loading" ? (
          <Spinner label={`Đang tra “${lookup.word}”…`} />
        ) : (
          <LookupResult lookup={lookup} />
        )}
      </section>
    </div>
  );
}

function LookupResult({ lookup }: { lookup: Extract<Lookup, { status: "done" }> }) {
  const { entries, local, word, dictionaryFailed } = lookup;
  const ipas = [...new Set(entries.flatMap((entry) => entry.phonetics.map((item) => item.text).filter((item): item is string => Boolean(item))))];
  const recordings = [...new Set(entries.flatMap((entry) => entry.phonetics.map((item) => safeUrl(item.audio)).filter((item): item is string => Boolean(item))))].slice(0, 2);
  const localIpa = local.find((item) => item.ipa)?.ipa;

  return (
    <div>
      <div className="flex items-center gap-3">
        <SpeakButton text={word} size="lg" />
        <div className="min-w-0">
          <p lang="en" className="text-3xl font-extrabold tracking-tight break-words">
            {word}
          </p>
          <p className="ipa text-lg">{ipas.length ? ipas.slice(0, 3).join("  ·  ") : (localIpa ?? "")}</p>
        </div>
      </div>

      {recordings.length ? (
        <div className="mt-4 grid gap-2">
          <p className="text-sm font-semibold text-muted">Bản ghi âm người thật</p>
          {recordings.map((url) => (
            <audio key={url} controls preload="none" src={url} className="h-10 w-full" />
          ))}
        </div>
      ) : null}

      {local.length ? (
        <div className="mt-5 rounded-xl border-[1.5px] border-brand-200 bg-brand-50 p-4">
          <p className="text-sm font-semibold text-brand-700">Nghĩa tiếng Việt</p>
          {local.map((item, index) => (
            <div key={index} className="mt-2">
              <p className="font-bold">
                {item.meaning_vi} <span className="chip chip-gray ml-1">{item.part_of_speech}</span>
              </p>
              {item.example_en ? (
                <p className="mt-1 text-sm">
                  <span lang="en">{item.example_en}</span> <span className="text-muted">— {item.example_vi}</span>
                </p>
              ) : null}
              {item.vocab_topics ? (
                <Link href={`/tu-vung/${item.vocab_topics.slug}`} className="mt-1 inline-block text-sm font-semibold text-brand-700 hover:underline">
                  Thuộc chủ đề {item.vocab_topics.title_vi} →
                </Link>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {entries.length ? (
        <div className="mt-5">
          <p className="text-sm font-semibold text-muted">Định nghĩa (tiếng Anh)</p>
          <div lang="en" className="mt-2 grid gap-4">
            {entries
              .flatMap((entry) => entry.meanings)
              .slice(0, 4)
              .map((meaning, index) => (
                <div key={index}>
                  <p className="chip chip-sun">{meaning.partOfSpeech}</p>
                  <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
                    {meaning.definitions.slice(0, 3).map((definition, i) => (
                      <li key={i}>
                        {definition.definition}
                        {definition.example ? <span className="mt-0.5 block text-muted">“{definition.example}”</span> : null}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
          </div>
          <p className="mt-4 text-xs text-muted">Nguồn định nghĩa: Free Dictionary API (dữ liệu Wiktionary).</p>
        </div>
      ) : (
        <div className="mt-5">
          <Notice kind={dictionaryFailed ? "warn" : "info"}>
            {dictionaryFailed
              ? "Chưa kết nối được từ điển trực tuyến. Bạn vẫn nghe phát âm được bằng nút loa."
              : local.length
                ? "Từ điển trực tuyến chưa có định nghĩa tiếng Anh cho từ này."
                : `Không tìm thấy “${word}” trong từ điển. Hãy kiểm tra lại chính tả.`}
          </Notice>
        </div>
      )}
    </div>
  );
}
