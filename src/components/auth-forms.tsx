"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { describeError, getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "./providers";
import { Field, Notice, Spinner } from "./ui";

/** Chỉ nhận đường dẫn nội bộ ("/callan"), chặn chuyển hướng ra trang ngoài qua tham số ?next=. */
export function safeNext(value: string | null | undefined, fallback = "/tai-khoan"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  return value;
}

function useNextParam(): string | null {
  const [next, setNext] = useState<string | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- tham số URL chỉ đọc được trên trình duyệt (trang xuất tĩnh)
    setNext(new URLSearchParams(window.location.search).get("next"));
  }, []);
  return next;
}

function GoogleButton({ next }: { next: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <>
      <button
        type="button"
        className="btn btn-outline w-full !min-h-12"
        disabled={busy}
        onClick={async () => {
          const db = getSupabase();
          if (!db) return;
          setBusy(true);
          setError("");
          const { error: oauthError } = await db.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
          });
          if (oauthError) {
            setBusy(false);
            setError(
              /provider is not enabled|Unsupported provider/i.test(oauthError.message)
                ? "Đăng nhập bằng Google chưa được bật. Hãy dùng email và mật khẩu."
                : describeError(oauthError),
            );
          }
        }}
      >
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
          <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
          <path fill="#4285F4" d="M46.6 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.2 5.5-4.7 7.2l7.6 5.9c4.5-4.1 7-10.2 7-17.6z" />
          <path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z" />
          <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.2-13.5-9.9l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
        </svg>
        {busy ? "Đang chuyển tới Google…" : "Tiếp tục với Google"}
      </button>
      {error ? (
        <div className="mt-3">
          <Notice kind="bad">{error}</Notice>
        </div>
      ) : null}
    </>
  );
}

function PasswordInput({ id, value, onChange, autoComplete }: { id: string; value: string; onChange: (value: string) => void; autoComplete: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? "text" : "password"}
        className="input !pr-12"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        minLength={8}
        maxLength={72}
        required
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        className="absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-muted hover:bg-ink/5"
        aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        aria-pressed={visible}
      >
        {visible ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
      </button>
    </div>
  );
}

function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="container-page flex justify-center py-12">
      <div className="card w-full max-w-md p-6 sm:p-8">
        <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
        {subtitle ? <p className="mt-1 text-muted">{subtitle}</p> : null}
        <div className="mt-6">
          {isSupabaseConfigured ? children : <Notice kind="warn">Chức năng tài khoản sẽ hoạt động sau khi web được kết nối với máy chủ dữ liệu (Supabase).</Notice>}
        </div>
      </div>
    </div>
  );
}

const Divider = () => (
  <div className="my-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-muted">
    <span className="h-px flex-1 bg-line" />
    hoặc
    <span className="h-px flex-1 bg-line" />
  </div>
);

export function LoginForm() {
  const router = useRouter();
  const { ready, user } = useAuth();
  const next = safeNext(useNextParam());
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (ready && user) router.replace(next);
  }, [ready, user, next, router]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const db = getSupabase();
    if (!db) return;
    setBusy(true);
    setError("");
    const { error: signInError } = await db.auth.signInWithPassword({ email: email.trim(), password });
    if (signInError) {
      setBusy(false);
      setError(describeError(signInError));
    }
    // Thành công: AuthProvider nhận phiên mới và effect ở trên sẽ chuyển trang.
  };

  return (
    <AuthShell title="Đăng nhập" subtitle="Lưu điểm bài tập, kết quả thi thử và xem lịch học của bạn.">
      <GoogleButton next={next} />
      <Divider />
      <form onSubmit={submit} className="grid gap-4">
        <Field label="Email">
          {(props) => <input {...props} type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />}
        </Field>
        <Field label="Mật khẩu">{(props) => <PasswordInput id={props.id} value={password} onChange={setPassword} autoComplete="current-password" />}</Field>
        {error ? <Notice kind="bad">{error}</Notice> : null}
        <button type="submit" className="btn btn-primary !min-h-12" disabled={busy}>
          {busy ? "Đang đăng nhập…" : "Đăng nhập"}
        </button>
      </form>
      <div className="mt-5 flex flex-wrap justify-between gap-2 text-sm">
        <Link href="/quen-mat-khau" className="font-semibold text-brand-700 hover:underline">
          Quên mật khẩu?
        </Link>
        <span>
          Chưa có tài khoản?{" "}
          <Link href={`/dang-ky?next=${encodeURIComponent(next)}`} className="font-semibold text-brand-700 hover:underline">
            Đăng ký
          </Link>
        </span>
      </div>
    </AuthShell>
  );
}

export function SignupForm() {
  const router = useRouter();
  const { ready, user } = useAuth();
  const next = safeNext(useNextParam());
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sentTo, setSentTo] = useState("");

  useEffect(() => {
    if (ready && user) router.replace(next);
  }, [ready, user, next, router]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const db = getSupabase();
    if (!db) return;
    if (fullName.trim().length < 2) return setError("Hãy nhập họ tên của bạn.");
    if (password.length < 8) return setError("Mật khẩu cần ít nhất 8 ký tự.");
    setBusy(true);
    setError("");
    const { data, error: signUpError } = await db.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim() },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    setBusy(false);
    if (signUpError) return setError(describeError(signUpError));
    // Khi bật xác nhận email, Supabase không báo lỗi cho email đã tồn tại (để tránh dò tài khoản)
    // mà trả về người dùng không có "identities".
    if (data.user && data.user.identities?.length === 0) return setError("Email này đã có tài khoản. Hãy đăng nhập hoặc dùng “Quên mật khẩu”.");
    if (!data.session) setSentTo(email.trim());
  };

  if (sentTo) {
    return (
      <AuthShell title="Kiểm tra hộp thư của bạn">
        <Notice kind="good">
          Chúng tôi đã gửi email xác nhận tới <strong>{sentTo}</strong>. Hãy bấm vào đường link trong thư để kích hoạt tài khoản.
        </Notice>
        <p className="mt-4 text-sm text-muted">Không thấy thư? Hãy xem cả mục Spam / Quảng cáo, hoặc chờ vài phút.</p>
        <Link href="/dang-nhap" className="btn btn-outline mt-5">
          Về trang đăng nhập
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Tạo tài khoản miễn phí" subtitle="Chỉ mất một phút. Toàn bộ bài học vẫn miễn phí.">
      <GoogleButton next={next} />
      <Divider />
      <form onSubmit={submit} className="grid gap-4" noValidate>
        <Field label="Họ và tên">
          {(props) => <input {...props} className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" maxLength={120} required />}
        </Field>
        <Field label="Email">
          {(props) => <input {...props} type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />}
        </Field>
        <Field label="Mật khẩu" hint="Ít nhất 8 ký tự.">
          {(props) => <PasswordInput id={props.id} value={password} onChange={setPassword} autoComplete="new-password" />}
        </Field>
        {error ? <Notice kind="bad">{error}</Notice> : null}
        <button type="submit" className="btn btn-primary !min-h-12" disabled={busy}>
          {busy ? "Đang tạo tài khoản…" : "Đăng ký"}
        </button>
      </form>
      <p className="mt-5 text-sm">
        Đã có tài khoản?{" "}
        <Link href={`/dang-nhap?next=${encodeURIComponent(next)}`} className="font-semibold text-brand-700 hover:underline">
          Đăng nhập
        </Link>
      </p>
    </AuthShell>
  );
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const db = getSupabase();
    if (!db) return;
    setBusy(true);
    setError("");
    const { error: resetError } = await db.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/dat-lai-mat-khau`,
    });
    setBusy(false);
    if (resetError) return setError(describeError(resetError));
    setSent(true);
  };

  return (
    <AuthShell title="Quên mật khẩu" subtitle="Nhập email đã đăng ký, chúng tôi sẽ gửi link đặt lại mật khẩu.">
      {sent ? (
        <>
          <Notice kind="good">
            Nếu <strong>{email.trim()}</strong> đã đăng ký tài khoản, một email chứa link đặt lại mật khẩu vừa được gửi đi.
          </Notice>
          <Link href="/dang-nhap" className="btn btn-outline mt-5">
            Về trang đăng nhập
          </Link>
        </>
      ) : (
        <form onSubmit={submit} className="grid gap-4">
          <Field label="Email">
            {(props) => <input {...props} type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />}
          </Field>
          {error ? <Notice kind="bad">{error}</Notice> : null}
          <button type="submit" className="btn btn-primary !min-h-12" disabled={busy}>
            {busy ? "Đang gửi…" : "Gửi link đặt lại mật khẩu"}
          </button>
          <Link href="/dang-nhap" className="text-sm font-semibold text-brand-700 hover:underline">
            ← Về trang đăng nhập
          </Link>
        </form>
      )}
    </AuthShell>
  );
}

/** Lỗi Supabase gắn trên URL khi link trong email hết hạn / không hợp lệ. */
function useUrlAuthError(): string {
  const [message, setMessage] = useState("");
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, "") || window.location.search);
    const description = params.get("error_description") ?? params.get("error");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- URL chỉ đọc được trên trình duyệt
    if (description) setMessage(/expired|invalid/i.test(description) ? "Đường link đã hết hạn hoặc đã được dùng rồi." : description);
  }, []);
  return message;
}

export function ResetPasswordForm() {
  const router = useRouter();
  const { ready, user } = useAuth();
  const urlError = useUrlAuthError();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const db = getSupabase();
    if (!db) return;
    if (password.length < 8) return setError("Mật khẩu cần ít nhất 8 ký tự.");
    setBusy(true);
    setError("");
    const { error: updateError } = await db.auth.updateUser({ password });
    setBusy(false);
    if (updateError) return setError(describeError(updateError));
    setDone(true);
    window.setTimeout(() => router.replace("/tai-khoan"), 1500);
  };

  return (
    <AuthShell title="Đặt lại mật khẩu">
      {!ready ? (
        <Spinner />
      ) : done ? (
        <Notice kind="good">Đã đổi mật khẩu. Đang chuyển tới trang tài khoản…</Notice>
      ) : !user ? (
        <>
          <Notice kind="bad">{urlError || "Đường link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn."}</Notice>
          <Link href="/quen-mat-khau" className="btn btn-primary mt-5">
            Gửi lại link mới
          </Link>
        </>
      ) : (
        <form onSubmit={submit} className="grid gap-4" noValidate>
          <p className="text-sm text-muted">
            Tài khoản: <strong className="text-ink">{user.email}</strong>
          </p>
          <Field label="Mật khẩu mới" hint="Ít nhất 8 ký tự.">
            {(props) => <PasswordInput id={props.id} value={password} onChange={setPassword} autoComplete="new-password" />}
          </Field>
          {error ? <Notice kind="bad">{error}</Notice> : null}
          <button type="submit" className="btn btn-primary !min-h-12" disabled={busy}>
            {busy ? "Đang lưu…" : "Lưu mật khẩu mới"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}

/** Trang đích sau khi đăng nhập Google hoặc bấm link xác nhận email. */
export function AuthCallback() {
  const router = useRouter();
  const { ready, user } = useAuth();
  const next = useNextParam();
  const urlError = useUrlAuthError();

  useEffect(() => {
    if (ready && user) router.replace(safeNext(next));
  }, [ready, user, next, router]);

  return (
    <AuthShell title={ready && !user ? "Chưa đăng nhập được" : "Đang đăng nhập…"}>
      {!ready || user ? (
        <Spinner label="Đang xác thực tài khoản…" />
      ) : (
        <>
          <Notice kind="bad">{urlError || "Không tìm thấy phiên đăng nhập. Đường link có thể đã hết hạn."}</Notice>
          <p className="mt-3 text-sm text-muted">Nếu bạn vừa xác nhận email trên một thiết bị khác, tài khoản đã được kích hoạt — hãy đăng nhập bằng email và mật khẩu.</p>
          <Link href="/dang-nhap" className="btn btn-primary mt-5">
            Về trang đăng nhập
          </Link>
        </>
      )}
    </AuthShell>
  );
}

/** Bọc các trang cần đăng nhập / cần quyền. Quyền thật sự do RLS ép ở database; đây chỉ là trải nghiệm. */
export function RequireAuth({ need, children }: { need?: "staff" | "admin"; children: React.ReactNode }) {
  const router = useRouter();
  const { ready, user, profile } = useAuth();

  useEffect(() => {
    if (isSupabaseConfigured && ready && !user) {
      router.replace(`/dang-nhap?next=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [ready, user, router]);

  if (!isSupabaseConfigured) {
    return (
      <div className="container-page max-w-2xl py-12">
        <Notice kind="warn">Trang này cần web được kết nối với máy chủ dữ liệu (Supabase). Xem hướng dẫn trong README.</Notice>
      </div>
    );
  }
  if (!ready || !user) return <Spinner className="py-24" />;

  const role = profile?.role ?? "student";
  const allowed = !need || role === "admin" || (need === "staff" && role === "teacher");
  if (!allowed) {
    return (
      <div className="container-page max-w-2xl py-12">
        <Notice kind="bad">
          <p className="font-semibold">Bạn không có quyền truy cập trang này.</p>
          <p className="mt-1">Trang dành cho {need === "admin" ? "quản trị viên" : "giáo viên và quản trị viên"}.</p>
        </Notice>
        <Link href="/" className="btn btn-outline mt-5">
          Về trang chủ
        </Link>
      </div>
    );
  }
  return <>{children}</>;
}
