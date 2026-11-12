"use client";

import { useSpeech } from "./providers";
import { cx } from "./ui";

const SPEEDS = [
  { value: 0.65, label: "Chậm" },
  { value: 0.95, label: "Vừa" },
  { value: 1.1, label: "Nhanh" },
];

/** Chọn giọng Anh-Mỹ / Anh-Anh và tốc độ đọc. Lựa chọn được nhớ cho lần sau. */
export function SpeechSettings({ className }: { className?: string }) {
  const { supported, prefs, setPrefs } = useSpeech();
  const speed = SPEEDS.reduce((best, item) => (Math.abs(item.value - prefs.rate) < Math.abs(best.value - prefs.rate) ? item : best));

  return (
    <div className={cx("flex flex-wrap items-center gap-x-4 gap-y-2 text-sm", className)}>
      <fieldset className="flex items-center gap-2">
        <legend className="sr-only">Giọng đọc</legend>
        <span aria-hidden className="font-semibold text-muted">
          Giọng
        </span>
        <div className="inline-flex rounded-xl border-[1.5px] border-line bg-white p-0.5">
          {(
            [
              ["en-US", "🇺🇸 Anh-Mỹ"],
              ["en-GB", "🇬🇧 Anh-Anh"],
            ] as const
          ).map(([accent, label]) => (
            <label
              key={accent}
              className={cx(
                "cursor-pointer rounded-[0.6rem] px-3 py-1.5 font-semibold transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-sun-400",
                prefs.accent === accent ? "bg-brand-600 text-white" : "text-ink hover:bg-brand-50",
              )}
            >
              <input
                type="radio"
                name="accent"
                value={accent}
                checked={prefs.accent === accent}
                onChange={() => setPrefs({ accent })}
                className="sr-only"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="flex items-center gap-2">
        <span className="font-semibold text-muted">Tốc độ</span>
        <select
          className="input !min-h-9 !w-auto !py-1 !text-sm"
          value={speed.value}
          onChange={(event) => setPrefs({ rate: Number(event.target.value) })}
        >
          {SPEEDS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      {!supported ? <span className="text-bad-700">Trình duyệt này chưa hỗ trợ đọc phát âm.</span> : null}
    </div>
  );
}
