// Phát âm bằng giọng đọc có sẵn của trình duyệt (Web Speech API): miễn phí, không cần API key.
// Chất lượng và số giọng tùy thiết bị; Chrome, Edge, Safari đều có sẵn giọng Anh-Mỹ và Anh-Anh.

export type Accent = "en-US" | "en-GB";

export interface SpeechPrefs {
  accent: Accent;
  /** 0.5 (rất chậm) → 1.2 (nhanh). 1 là tốc độ thường. */
  rate: number;
}

export const DEFAULT_SPEECH_PREFS: SpeechPrefs = { accent: "en-US", rate: 0.95 };

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

const normalizeLang = (lang: string) => lang.replace("_", "-").toLowerCase();

// Giọng tự nhiên hơn được ưu tiên trước (tên giọng khác nhau giữa các hệ điều hành).
const PREFERRED = [/natural/i, /google/i, /samantha|daniel|karen|serena|ava|kate|arthur|martha/i, /microsoft/i];

export function englishVoices(): SpeechSynthesisVoice[] {
  if (!isSpeechSupported()) return [];
  return window.speechSynthesis.getVoices().filter((voice) => normalizeLang(voice.lang).startsWith("en"));
}

export function pickVoice(accent: Accent, skip = 0): SpeechSynthesisVoice | null {
  const voices = englishVoices();
  if (!voices.length) return null;
  const wanted = accent.toLowerCase();
  const score = (voice: SpeechSynthesisVoice) => {
    const rank = PREFERRED.findIndex((pattern) => pattern.test(voice.name));
    return (normalizeLang(voice.lang) === wanted ? 0 : 100) + (rank === -1 ? PREFERRED.length : rank);
  };
  const ranked = [...voices].sort((a, b) => score(a) - score(b));
  return ranked[skip % ranked.length] ?? null;
}

/** Tách đoạn dài thành từng câu: Chrome tự ngắt các lượt đọc dài quá ~15 giây. */
export function splitForSpeech(text: string): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];
  const sentences = clean.match(/[^.!?…]+[.!?…]*["')\]]*\s*/g) ?? [clean];
  const chunks: string[] = [];
  for (const sentence of sentences) {
    let rest = sentence.trim();
    while (rest.length > 220) {
      const cut = rest.lastIndexOf(",", 220) > 80 ? rest.lastIndexOf(",", 220) + 1 : rest.lastIndexOf(" ", 220);
      chunks.push(rest.slice(0, cut > 0 ? cut : 220).trim());
      rest = rest.slice(cut > 0 ? cut : 220).trim();
    }
    if (rest) chunks.push(rest);
  }
  return chunks;
}

export interface SpeakOptions extends SpeechPrefs {
  /** Chọn giọng thứ n trong danh sách ưu tiên — dùng để phân biệt người nói trong bài nghe. */
  voiceIndex?: number;
  pitch?: number;
}

let currentToken = 0;

export function stopSpeaking(): void {
  currentToken++;
  if (isSpeechSupported()) window.speechSynthesis.cancel();
}

/**
 * Đọc một đoạn văn bản. Lời gọi mới sẽ ngắt lời đang đọc.
 * Promise trả về true nếu đọc hết, false nếu bị ngắt hoặc trình duyệt không hỗ trợ.
 */
export function speak(text: string, options: SpeakOptions): Promise<boolean> {
  if (!isSpeechSupported()) return Promise.resolve(false);
  const chunks = splitForSpeech(text);
  if (!chunks.length) return Promise.resolve(false);
  stopSpeaking();
  const token = currentToken;
  const voice = pickVoice(options.accent, options.voiceIndex ?? 0);

  return new Promise((resolve) => {
    const next = (index: number) => {
      if (token !== currentToken) return resolve(false);
      if (index >= chunks.length) return resolve(true);
      const utterance = new SpeechSynthesisUtterance(chunks[index]);
      utterance.lang = voice?.lang ?? options.accent;
      if (voice) utterance.voice = voice;
      utterance.rate = options.rate;
      utterance.pitch = options.pitch ?? 1;
      utterance.onend = () => next(index + 1);
      utterance.onerror = () => resolve(false);
      window.speechSynthesis.speak(utterance);
    };
    next(0);
  });
}
