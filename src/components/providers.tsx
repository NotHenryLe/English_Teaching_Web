"use client";

import type { User } from "@supabase/supabase-js";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { fetchContact } from "@/lib/queries";
import { DEFAULT_SPEECH_PREFS, isSpeechSupported, speak, stopSpeaking, type SpeechPrefs } from "@/lib/speech";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import type { ContactSettings, Profile } from "@/lib/types";

// ---------------------------------------------------------------------------
// Đăng nhập
// ---------------------------------------------------------------------------
interface AuthState {
  /** false cho tới khi biết chắc người dùng đã đăng nhập hay chưa. */
  ready: boolean;
  user: User | null;
  profile: Profile | null;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  ready: false,
  user: null,
  profile: null,
  refreshProfile: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

async function fetchProfile(id: string): Promise<Profile | null> {
  const db = getSupabase();
  if (!db) return null;
  try {
    const { data } = await db.from("profiles").select("*").eq("id", id).maybeSingle();
    return (data as Profile | null) ?? null;
  } catch {
    return null;
  }
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sessionKnown, setSessionKnown] = useState(!isSupabaseConfigured);
  const [profileFor, setProfileFor] = useState<string | null>(null);

  useEffect(() => {
    const db = getSupabase();
    if (!db) return;
    // onAuthStateChange phát INITIAL_SESSION ngay khi đăng ký, kể cả khi vừa quay lại
    // từ Google hoặc từ link trong email (token nằm trên URL).
    const { data } = db.auth.onAuthStateChange((_event, session) => {
      setUser((current) => (current?.id === session?.user?.id ? current : (session?.user ?? null)));
      setSessionKnown(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const userId = user?.id ?? null;

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    void fetchProfile(userId).then((loaded) => {
      if (cancelled) return;
      // Dù lỗi mạng (loaded = null) vẫn đánh dấu "đã thử" để các trang không treo ở trạng thái đang tải.
      setProfile(loaded);
      setProfileFor(userId);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const value = useMemo<AuthState>(
    () => ({
      ready: sessionKnown && (!userId || profileFor === userId),
      user,
      profile: userId && profileFor === userId ? profile : null,
      refreshProfile: async () => {
        if (!userId) return;
        setProfile(await fetchProfile(userId));
        setProfileFor(userId);
      },
      signOut: async () => {
        await getSupabase()?.auth.signOut();
        setUser(null);
        setProfile(null);
      },
    }),
    [sessionKnown, user, userId, profile, profileFor],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ---------------------------------------------------------------------------
// Thông tin tổ chức (tên, liên hệ) — in sẵn lúc build, làm mới khi mở trang
// ---------------------------------------------------------------------------
const SiteContext = createContext<ContactSettings | null>(null);

export function useContact(): ContactSettings {
  const value = useContext(SiteContext);
  if (!value) throw new Error("useContact phải nằm trong <Providers>");
  return value;
}

/** Nội dung in sẵn lúc build + làm mới từ Supabase khi trang mở (để thấy chỉnh sửa mới nhất). */
export function useLive<T>(initial: T, fetcher: (db: NonNullable<ReturnType<typeof getSupabase>>) => Promise<T>, key: string) {
  const [state, setState] = useState<{ key: string; data: T; fresh: boolean }>({ key, data: initial, fresh: false });
  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  useEffect(() => {
    const db = getSupabase();
    if (!db) return;
    let cancelled = false;
    fetcherRef
      .current(db)
      .then((data) => {
        if (!cancelled) setState({ key, data, fresh: true });
      })
      .catch(() => {
        // Mất mạng hoặc Supabase tạm dừng: giữ nội dung đã in sẵn.
      });
    return () => {
      cancelled = true;
    };
  }, [key]);

  return state.key === key ? { data: state.data, fresh: state.fresh } : { data: initial, fresh: false };
}

// ---------------------------------------------------------------------------
// Phát âm
// ---------------------------------------------------------------------------
interface SpeechState {
  supported: boolean;
  prefs: SpeechPrefs;
  setPrefs: (prefs: Partial<SpeechPrefs>) => void;
  /** Văn bản đang được đọc (để nút loa tương ứng đổi trạng thái). */
  speaking: string | null;
  say: (text: string, overrides?: Partial<SpeechPrefs>) => void;
  stop: () => void;
}

const SpeechContext = createContext<SpeechState>({
  supported: false,
  prefs: DEFAULT_SPEECH_PREFS,
  setPrefs: () => {},
  speaking: null,
  say: () => {},
  stop: () => {},
});

export const useSpeech = () => useContext(SpeechContext);

const PREFS_KEY = "etw.speech";

function SpeechProvider({ children }: { children: React.ReactNode }) {
  const [supported, setSupported] = useState(false);
  const [prefs, setPrefsState] = useState<SpeechPrefs>(DEFAULT_SPEECH_PREFS);
  const [speaking, setSpeaking] = useState<string | null>(null);

  useEffect(() => {
    // Chỉ biết được sau khi chạy trên trình duyệt (HTML in sẵn không có window).
    const available = isSpeechSupported();
    let stored: Partial<SpeechPrefs> = {};
    try {
      stored = JSON.parse(window.localStorage.getItem(PREFS_KEY) ?? "{}") as Partial<SpeechPrefs>;
    } catch {
      // localStorage bị chặn hoặc dữ liệu hỏng: dùng mặc định.
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- đồng bộ một lần với API chỉ có ở trình duyệt
    setSupported(available);
    setPrefsState((current) => ({
      accent: stored.accent === "en-GB" || stored.accent === "en-US" ? stored.accent : current.accent,
      rate: typeof stored.rate === "number" && stored.rate >= 0.5 && stored.rate <= 1.2 ? stored.rate : current.rate,
    }));
    if (available) window.speechSynthesis.getVoices(); // kích trình duyệt nạp danh sách giọng
    return () => stopSpeaking();
  }, []);

  const setPrefs = useCallback((patch: Partial<SpeechPrefs>) => {
    setPrefsState((current) => {
      const next = { ...current, ...patch };
      try {
        window.localStorage.setItem(PREFS_KEY, JSON.stringify(next));
      } catch {
        // bỏ qua
      }
      return next;
    });
  }, []);

  const say = useCallback(
    (text: string, overrides?: Partial<SpeechPrefs>) => {
      setSpeaking(text);
      void speak(text, { ...prefs, ...overrides }).then(() => {
        setSpeaking((current) => (current === text ? null : current));
      });
    },
    [prefs],
  );

  const stop = useCallback(() => {
    stopSpeaking();
    setSpeaking(null);
  }, []);

  const value = useMemo(
    () => ({ supported, prefs, setPrefs, speaking, say, stop }),
    [supported, prefs, setPrefs, speaking, say, stop],
  );
  return <SpeechContext.Provider value={value}>{children}</SpeechContext.Provider>;
}

// ---------------------------------------------------------------------------
// Thông báo ngắn (toast)
// ---------------------------------------------------------------------------
type ToastKind = "ok" | "error";
const ToastContext = createContext<(message: string, kind?: ToastKind) => void>(() => {});
export const useToast = () => useContext(ToastContext);

function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<{ id: number; message: string; kind: ToastKind }[]>([]);
  const nextId = useRef(1);

  const push = useCallback((message: string, kind: ToastKind = "ok") => {
    const id = nextId.current++;
    setToasts((current) => [...current.slice(-2), { id, message, kind }]);
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), kind === "error" ? 7000 : 3500);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4" aria-live="polite">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.kind === "error" ? "alert" : "status"}
            className={`pointer-events-auto max-w-md rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg ${
              toast.kind === "error" ? "bg-bad-600" : "bg-ink"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ---------------------------------------------------------------------------

export function Providers({ initialContact, children }: { initialContact: ContactSettings; children: React.ReactNode }) {
  const { data: contact } = useLive(initialContact, fetchContact, "contact");
  return (
    <SiteContext.Provider value={contact}>
      <AuthProvider>
        <SpeechProvider>
          <ToastProvider>{children}</ToastProvider>
        </SpeechProvider>
      </AuthProvider>
    </SiteContext.Provider>
  );
}
