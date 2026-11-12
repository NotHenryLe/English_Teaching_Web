"use client";

import { CalendarDays, CheckCircle2, Clock3, Video, XCircle } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { fetchCallanPackages } from "@/lib/queries";
import { describeError, getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import type { CallanClass, CallanPackage, CallanRegistration, PaymentSettings } from "@/lib/types";
import { EMPTY_PAYMENT } from "@/lib/types";
import { useAuth, useLive, useToast } from "./providers";
import { Field, Notice, Spinner, cx, formatDate, formatDateTime, formatVnd, safeUrl } from "./ui";

const LEVELS = ["Mới bắt đầu", "Sơ cấp (A1–A2)", "Trung cấp (B1–B2)", "Nâng cao (C1 trở lên)", "Chưa rõ trình độ"];

export const REGISTRATION_STATUS: Record<CallanRegistration["status"], { label: string; chip: string }> = {
  pending: { label: "Chờ duyệt", chip: "chip chip-sun" },
  approved: { label: "Đã duyệt", chip: "chip chip-good" },
  rejected: { label: "Không được duyệt", chip: "chip chip-bad" },
  cancelled: { label: "Đã hủy", chip: "chip chip-gray" },
};

export const PAYMENT_STATUS: Record<CallanRegistration["payment_status"], { label: string; chip: string }> = {
  unpaid: { label: "Chưa thanh toán", chip: "chip chip-gray" },
  reported: { label: "Học viên báo đã chuyển khoản", chip: "chip chip-sun" },
  confirmed: { label: "Đã nhận học phí", chip: "chip chip-good" },
};

interface MyCallan {
  registrations: CallanRegistration[];
  classes: CallanClass[];
  payment: PaymentSettings;
}

async function fetchMyCallan(userId: string): Promise<{ data: MyCallan | null; error: string }> {
  const db = getSupabase();
  if (!db) return { data: null, error: "" };
  const [registrations, classes, payment] = await Promise.all([
    db.from("callan_registrations").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    db.from("callan_classes").select("*, callan_sessions(*)").order("starts_at", { referencedTable: "callan_sessions" }),
    db.from("site_settings").select("value").eq("key", "payment").maybeSingle(),
  ]);
  const failure = registrations.error ?? classes.error ?? payment.error;
  if (failure) return { data: null, error: describeError(failure) };
  const mine = (registrations.data ?? []) as CallanRegistration[];
  // Giáo viên / admin đọc được nhiều lớp hơn; ở đây chỉ lấy lớp mà chính họ được duyệt vào học.
  const approved = new Set(mine.filter((item) => item.status === "approved").map((item) => item.class_id));
  return {
    error: "",
    data: {
      registrations: mine,
      classes: ((classes.data ?? []) as CallanClass[]).filter((item) => approved.has(item.id)),
      payment: { ...EMPTY_PAYMENT, ...((payment.data?.value as Partial<PaymentSettings> | undefined) ?? {}) },
    },
  };
}

/** Đăng ký, lớp và lịch học của người đang đăng nhập. RLS chỉ trả về lớp mà họ đã được duyệt vào. */
function useMyCallan() {
  const { user } = useAuth();
  const [state, setState] = useState<{ userId: string; data: MyCallan | null; error: string } | null>(null);
  const userId = user?.id ?? null;

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    void fetchMyCallan(userId).then((result) => {
      if (!cancelled) setState({ userId, ...result });
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const reload = useCallback(async () => {
    if (!userId) return;
    const result = await fetchMyCallan(userId);
    setState({ userId, ...result });
  }, [userId]);

  const current = state && state.userId === userId ? state : null;
  return { data: current?.data ?? null, error: current?.error ?? "", reload };
}

// ---------------------------------------------------------------------------
// Trang /callan: gói học + đăng ký
// ---------------------------------------------------------------------------
export function CallanEnroll({ initialPackages }: { initialPackages: CallanPackage[] }) {
  const { data: packages } = useLive(initialPackages, fetchCallanPackages, "callan-packages");
  const { ready, user } = useAuth();
  const mine = useMyCallan();
  const pending = mine.data?.registrations.find((item) => item.status === "pending") ?? null;

  return (
    <div className="grid gap-8">
      <section aria-labelledby="goi-hoc">
        <h2 id="goi-hoc" className="text-2xl font-extrabold tracking-tight">
          Gói học
        </h2>
        {packages.length ? (
          <ul className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {packages.map((item) => (
              <li key={item.id} className="card flex flex-col p-5">
                <p className="text-lg font-bold">{item.name}</p>
                <p className="mt-1 text-3xl font-extrabold text-brand-700">{formatVnd(item.price_vnd)}</p>
                <p className="text-sm font-medium text-muted">
                  {item.sessions} buổi · khoảng {formatVnd(Math.round(item.price_vnd / item.sessions))}/buổi
                </p>
                {item.description_vi ? <p className="mt-3 text-sm">{item.description_vi}</p> : null}
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4">
            <Notice>
              Các gói học sẽ sớm được công bố. Bạn có thể{" "}
              <Link href="/lien-he" className="font-semibold underline">
                liên hệ với chúng tôi
              </Link>{" "}
              để được tư vấn trước.
            </Notice>
          </div>
        )}
      </section>

      <section aria-labelledby="dang-ky" id="dang-ky-hoc" className="scroll-mt-24">
        <h2 id="dang-ky" className="text-2xl font-extrabold tracking-tight">
          Đăng ký học
        </h2>
        <div className="mt-4">
          {!isSupabaseConfigured ? (
            <Notice kind="warn">Chức năng đăng ký sẽ hoạt động sau khi web được kết nối với máy chủ dữ liệu.</Notice>
          ) : !ready ? (
            <Spinner />
          ) : !user ? (
            <div className="card flex flex-wrap items-center justify-between gap-4 p-5">
              <p>Bạn cần đăng nhập để gửi đăng ký và nhận lịch học.</p>
              <div className="flex gap-2">
                <Link href="/dang-nhap?next=/callan" className="btn btn-primary">
                  Đăng nhập
                </Link>
                <Link href="/dang-ky?next=/callan" className="btn btn-outline">
                  Tạo tài khoản
                </Link>
              </div>
            </div>
          ) : mine.error ? (
            <Notice kind="bad">{mine.error}</Notice>
          ) : !mine.data ? (
            <Spinner />
          ) : (
            <div className="grid gap-5">
              <MyCallanPanel data={mine.data} reload={mine.reload} />
              {pending ? null : packages.length ? (
                <RegistrationForm packages={packages} onDone={mine.reload} hasHistory={mine.data.registrations.length > 0} />
              ) : null}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function RegistrationForm({ packages, onDone, hasHistory }: { packages: CallanPackage[]; onDone: () => Promise<void>; hasHistory: boolean }) {
  const { user, profile } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({
    full_name: profile?.full_name ?? "",
    phone: profile?.phone ?? "",
    email: user?.email ?? "",
    current_level: LEVELS[0],
    goals: "",
    preferred_schedule: "",
    package_id: packages[0]?.id ?? "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (patch: Partial<typeof form>) => setForm((current) => ({ ...current, ...patch }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const db = getSupabase();
    if (!db) return;
    if (form.full_name.trim().length < 2) return setError("Hãy nhập họ tên của bạn.");
    if (!/^[0-9+().\s-]{8,20}$/.test(form.phone.trim())) return setError("Số điện thoại chưa đúng. Ví dụ: 0901234567.");
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return setError("Email chưa đúng định dạng.");
    if (!form.package_id) return setError("Hãy chọn một gói học.");
    setBusy(true);
    setError("");
    const { error: insertError } = await db.from("callan_registrations").insert({
      full_name: form.full_name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      current_level: form.current_level,
      goals: form.goals.trim(),
      preferred_schedule: form.preferred_schedule.trim(),
      package_id: form.package_id,
    });
    setBusy(false);
    if (insertError) return setError(describeError(insertError));
    toast("Đã gửi đăng ký. Hãy xem hướng dẫn thanh toán bên dưới.");
    await onDone();
    document.getElementById("dang-ky-hoc")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <form onSubmit={submit} className="card grid gap-4 p-5 sm:p-6" noValidate>
      <h3 className="text-lg font-bold">{hasHistory ? "Đăng ký thêm gói học" : "Phiếu đăng ký"}</h3>
      <fieldset>
        <legend className="field-label">Chọn gói học</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {packages.map((item) => (
            <label
              key={item.id}
              className={cx(
                "flex cursor-pointer items-start gap-3 rounded-xl border-[1.5px] p-3 transition-colors",
                form.package_id === item.id ? "border-brand-500 bg-brand-50" : "border-line hover:border-brand-200",
              )}
            >
              <input
                type="radio"
                name="package"
                className="mt-1 h-4 w-4 accent-brand-600"
                checked={form.package_id === item.id}
                onChange={() => set({ package_id: item.id })}
              />
              <span>
                <span className="block font-semibold">{item.name}</span>
                <span className="block text-sm text-muted">
                  {item.sessions} buổi · {formatVnd(item.price_vnd)}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Họ và tên">
          {(props) => <input {...props} className="input" value={form.full_name} onChange={(e) => set({ full_name: e.target.value })} autoComplete="name" maxLength={120} required />}
        </Field>
        <Field label="Số điện thoại (Zalo)">
          {(props) => <input {...props} className="input" type="tel" inputMode="tel" value={form.phone} onChange={(e) => set({ phone: e.target.value })} autoComplete="tel" maxLength={20} required />}
        </Field>
        <Field label="Email">
          {(props) => <input {...props} className="input" type="email" value={form.email} onChange={(e) => set({ email: e.target.value })} autoComplete="email" maxLength={200} required />}
        </Field>
        <Field label="Trình độ hiện tại">
          {(props) => (
            <select {...props} className="input" value={form.current_level} onChange={(e) => set({ current_level: e.target.value })}>
              {LEVELS.map((level) => (
                <option key={level}>{level}</option>
              ))}
            </select>
          )}
        </Field>
      </div>
      <Field label="Thời gian bạn có thể học" hint="Ví dụ: tối thứ 3 và thứ 5 sau 19:30, hoặc sáng cuối tuần.">
        {(props) => <input {...props} className="input" value={form.preferred_schedule} onChange={(e) => set({ preferred_schedule: e.target.value })} maxLength={500} />}
      </Field>
      <Field label="Mục tiêu học (không bắt buộc)">
        {(props) => <textarea {...props} className="input" value={form.goals} onChange={(e) => set({ goals: e.target.value })} maxLength={2000} placeholder="Ví dụ: giao tiếp công việc, phỏng vấn, du lịch…" />}
      </Field>
      {error ? <Notice kind="bad">{error}</Notice> : null}
      <div>
        <button type="submit" className="btn btn-primary !min-h-12 !px-6" disabled={busy}>
          {busy ? "Đang gửi…" : "Gửi đăng ký"}
        </button>
        <p className="field-hint">Sau khi gửi, bạn sẽ thấy hướng dẫn chuyển khoản học phí. Lịch học và link Google Meet hiện ra khi đăng ký được duyệt.</p>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Dùng chung cho /callan và /tai-khoan: trạng thái đăng ký + lớp + lịch học
// ---------------------------------------------------------------------------
export function MyCallanSection() {
  const { data, error, reload } = useMyCallan();
  if (error) return <Notice kind="bad">{error}</Notice>;
  if (!data) return <Spinner />;
  if (!data.registrations.length) {
    return (
      <div className="card flex flex-wrap items-center justify-between gap-4 p-5">
        <p className="text-muted">Bạn chưa đăng ký lớp Callan nào.</p>
        <Link href="/callan" className="btn btn-outline btn-sm">
          Tìm hiểu lớp Callan
        </Link>
      </div>
    );
  }
  return <MyCallanPanel data={data} reload={reload} />;
}

function MyCallanPanel({ data, reload }: { data: MyCallan; reload: () => Promise<void> }) {
  const active = data.registrations.filter((item) => item.status === "pending");
  const history = data.registrations.filter((item) => item.status !== "pending");
  return (
    <div className="grid gap-5">
      {data.classes.map((item) => (
        <ClassCard key={item.id} klass={item} />
      ))}
      {active.map((item) => (
        <PendingCard key={item.id} registration={item} payment={data.payment} reload={reload} />
      ))}
      {history.length ? (
        <details className="card p-4" open={!active.length && !data.classes.length}>
          <summary className="cursor-pointer font-semibold">Lịch sử đăng ký ({history.length})</summary>
          <ul className="mt-3 grid gap-3">
            {history.map((item) => (
              <li key={item.id} className="rounded-xl bg-paper p-3 text-sm">
                <p className="flex flex-wrap items-center gap-2">
                  <strong>{item.package_name}</strong>
                  <span className={REGISTRATION_STATUS[item.status].chip}>{REGISTRATION_STATUS[item.status].label}</span>
                  <span className="text-muted">gửi ngày {formatDate(item.created_at)}</span>
                </p>
                {item.admin_note ? <p className="mt-1">Ghi chú từ trung tâm: {item.admin_note}</p> : null}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}

export function ClassCard({ klass, children, heading = "Lớp của bạn" }: { klass: CallanClass; children?: React.ReactNode; heading?: string }) {
  // Mốc "bây giờ" lấy một lần khi thẻ hiện ra — đủ chính xác để tách buổi sắp tới / đã qua.
  const [now] = useState(() => Date.now());
  const sessions = klass.callan_sessions ?? [];
  const upcoming = sessions.filter((session) => new Date(session.starts_at).getTime() + session.duration_minutes * 60_000 >= now);
  const past = sessions.length - upcoming.length;
  const classLink = safeUrl(klass.meet_link);

  return (
    <article className="card !border-good-600/50 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-good-700">
            <CheckCircle2 size={16} aria-hidden /> {heading}
          </p>
          <h3 className="mt-1 text-xl font-bold">{klass.name}</h3>
          <p className="mt-1 text-sm text-muted">
            {[klass.level, klass.teacher_name ? `Giáo viên: ${klass.teacher_name}` : "", klass.schedule_note].filter(Boolean).join(" · ")}
          </p>
          {klass.description_vi ? <p className="mt-2 text-sm">{klass.description_vi}</p> : null}
        </div>
        {classLink ? (
          <a href={classLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            <Video size={18} aria-hidden /> Vào lớp (Google Meet)
          </a>
        ) : (
          <span className="chip chip-gray">Link Meet sẽ được cập nhật</span>
        )}
      </div>

      <h4 className="mt-5 flex items-center gap-2 font-semibold">
        <CalendarDays size={18} aria-hidden /> Lịch học sắp tới
      </h4>
      {upcoming.length ? (
        <ol className="mt-2 grid gap-2">
          {upcoming.slice(0, 8).map((session) => {
            const link = safeUrl(session.meet_link) ?? classLink;
            return (
              <li key={session.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2.5 text-sm">
                <span>
                  <strong>{formatDateTime(session.starts_at)}</strong>
                  <span className="text-muted"> · {session.duration_minutes} phút</span>
                  {session.topic ? <span> · {session.topic}</span> : null}
                </span>
                {link ? (
                  <a href={link} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-700 hover:underline">
                    Link Meet
                  </a>
                ) : null}
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="mt-2 text-sm text-muted">Chưa có buổi học nào được xếp lịch. Trung tâm sẽ cập nhật sớm.</p>
      )}
      {upcoming.length > 8 ? <p className="mt-2 text-sm text-muted">… và {upcoming.length - 8} buổi nữa.</p> : null}
      {past ? <p className="mt-2 text-xs text-muted">Đã học {past} buổi.</p> : null}
      {children}
    </article>
  );
}

function PendingCard({ registration, payment, reload }: { registration: CallanRegistration; payment: PaymentSettings; reload: () => Promise<void> }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const hasBank = Boolean(payment.account_number && payment.bank_name);
  const qr =
    /^[A-Za-z0-9]{2,20}$/.test(payment.bank_bin) && /^[A-Za-z0-9]{4,24}$/.test(payment.account_number) && registration.price_vnd > 0
      ? `https://img.vietqr.io/image/${payment.bank_bin}-${payment.account_number}-compact2.png?amount=${registration.price_vnd}&addInfo=${encodeURIComponent(registration.payment_code)}&accountName=${encodeURIComponent(payment.account_name)}`
      : null;

  const call = async (fn: "report_callan_payment" | "cancel_callan_registration", message: string) => {
    const db = getSupabase();
    if (!db) return;
    setBusy(true);
    const { error } = await db.rpc(fn, { p_registration_id: registration.id });
    setBusy(false);
    if (error) return toast(describeError(error), "error");
    toast(message);
    await reload();
  };

  return (
    <article className="card !border-sun-400 p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <Clock3 size={18} className="text-sun-700" aria-hidden />
        <h3 className="text-lg font-bold">Đăng ký {registration.package_name}</h3>
        <span className={REGISTRATION_STATUS.pending.chip}>{REGISTRATION_STATUS.pending.label}</span>
        <span className={PAYMENT_STATUS[registration.payment_status].chip}>{PAYMENT_STATUS[registration.payment_status].label}</span>
      </div>
      <p className="mt-1 text-sm text-muted">
        Gửi ngày {formatDate(registration.created_at)} · {registration.sessions} buổi · {formatVnd(registration.price_vnd)}
      </p>

      {registration.payment_status === "confirmed" ? (
        <p className="mt-4">Trung tâm đã nhận học phí và đang xếp lớp cho bạn. Lịch học cùng link Google Meet sẽ hiện ở đây ngay khi được duyệt.</p>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto]">
          <div>
            <p className="font-semibold">Bước tiếp theo: chuyển khoản học phí</p>
            {hasBank ? (
              <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
                <dt className="text-muted">Ngân hàng</dt>
                <dd className="font-semibold">{payment.bank_name}</dd>
                <dt className="text-muted">Số tài khoản</dt>
                <dd className="font-semibold tabular-nums">{payment.account_number}</dd>
                <dt className="text-muted">Chủ tài khoản</dt>
                <dd className="font-semibold">{payment.account_name}</dd>
                <dt className="text-muted">Số tiền</dt>
                <dd className="font-semibold">{formatVnd(registration.price_vnd)}</dd>
                <dt className="text-muted">Nội dung</dt>
                <dd>
                  <code className="rounded-md bg-sun-100 px-2 py-0.5 text-base font-bold">{registration.payment_code}</code>
                </dd>
              </dl>
            ) : (
              <p className="mt-2 text-sm">
                Trung tâm sẽ liên hệ với bạn qua số điện thoại đã đăng ký để hướng dẫn thanh toán. Mã đăng ký của bạn:{" "}
                <code className="rounded-md bg-sun-100 px-2 py-0.5 font-bold">{registration.payment_code}</code>
              </p>
            )}
            {payment.note ? <p className="mt-3 text-sm text-muted">{payment.note}</p> : null}
            {hasBank ? (
              <p className="mt-3 text-sm text-muted">
                Hãy ghi đúng nội dung chuyển khoản để trung tâm đối soát nhanh. Sau khi chuyển, bấm “Tôi đã chuyển khoản”.
              </p>
            ) : null}
          </div>
          {qr ? (
            // eslint-disable-next-line @next/next/no-img-element -- ảnh QR sinh động từ dịch vụ VietQR, không qua next/image
            <img
              src={qr}
              alt={`Mã QR chuyển khoản ${formatVnd(registration.price_vnd)} với nội dung ${registration.payment_code}`}
              width={200}
              height={200}
              loading="lazy"
              className="h-auto w-48 justify-self-center rounded-xl border-[1.5px] border-line bg-white"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : null}
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        {registration.payment_status === "unpaid" ? (
          <button type="button" className="btn btn-primary" disabled={busy} onClick={() => void call("report_callan_payment", "Đã ghi nhận. Trung tâm sẽ kiểm tra và duyệt đăng ký của bạn.")}>
            Tôi đã chuyển khoản
          </button>
        ) : null}
        <button
          type="button"
          className="btn btn-danger"
          disabled={busy}
          onClick={() => {
            if (window.confirm("Hủy đăng ký này? Nếu đã chuyển khoản, hãy liên hệ trung tâm để được hỗ trợ.")) {
              void call("cancel_callan_registration", "Đã hủy đăng ký.");
            }
          }}
        >
          <XCircle size={16} aria-hidden /> Hủy đăng ký
        </button>
      </div>
    </article>
  );
}
