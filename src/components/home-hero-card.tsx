"use client";

import { useState } from "react";
import { SpeakButton, cx } from "./ui";

export interface HeroWord {
  word: string;
  ipa: string;
  meaning: string;
  example: string;
}

/** Thẻ từ vựng tương tác ở đầu trang chủ: bấm loa để nghe, bấm "Từ khác" để đổi từ. */
export function HomeHeroCard({ words }: { words: HeroWord[] }) {
  const [index, setIndex] = useState(0);
  const current = words[index % words.length];
  if (!current) return null;
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div aria-hidden className="absolute inset-0 translate-x-3 translate-y-3 rotate-3 rounded-[1.5rem] border-[1.5px] border-sun-400 bg-sun-100" />
      <div aria-hidden className="absolute inset-0 -translate-x-2 translate-y-1.5 -rotate-2 rounded-[1.5rem] border-[1.5px] border-brand-200 bg-brand-50" />
      <div className="card relative p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">Thử nghe một từ</p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-4xl font-extrabold tracking-tight break-words">{current.word}</p>
            <p className="ipa mt-1 text-lg">{current.ipa}</p>
          </div>
          <SpeakButton text={current.word} size="lg" />
        </div>
        <p className="mt-4 text-lg font-semibold text-brand-700">{current.meaning}</p>
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-paper p-3">
          <SpeakButton text={current.example} size="sm" label="Nghe câu ví dụ" />
          <p className="text-sm leading-relaxed">{current.example}</p>
        </div>
        <div className="mt-5 flex items-center justify-between">
          <div className="flex gap-1.5" aria-hidden>
            {words.map((item, i) => (
              <span key={item.word} className={cx("h-1.5 rounded-full transition-all", i === index % words.length ? "w-6 bg-brand-600" : "w-1.5 bg-line")} />
            ))}
          </div>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setIndex((value) => (value + 1) % words.length)}>
            Từ khác →
          </button>
        </div>
      </div>
    </div>
  );
}
