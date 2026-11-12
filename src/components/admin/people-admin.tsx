"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { SKILL_LABEL } from "@/lib/ielts";
import type { CallanClass, ContactSettings, PaymentSettings, Profile, Role } from "@/lib/types";
import { EMPTY_CONTACT, EMPTY_PAYMENT } from "@/lib/types";
import { EXERCISE_ATTEMPT_COLUMNS, IELTS_ATTEMPT_COLUMNS, ROLE_LABEL, type ExerciseAttemptRow, type IeltsAttemptRow } from "../account-view";
import { ClassCard } from "../callan-views";
import { useAuth } from "../providers";
import { EmptyState, Notice, Spinner, cx, formatDate } from "../ui";
import { TextField, check, useAction, useLoad } from "./common";

// ---------------------------------------------------------------------------
// Người dùng & vai trò (admin)
// ---------------------------------------------------------------------------
export function AdminUsers() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [applied, setApplied] = useState("");
  const { data, error, reload } = useLoad(async (db) => {
    let request = db.from("profiles").select("*").order("created_at", { ascending: false }).limit(200);
    const term = applied.replace(/[%,()\\]/g, " ").trim();
    if (term) request = request.or(`full_name.ilike.%${term}%,email.ilike.%${term}%`);
    return check<Profile[]>(await request);
  }, `users:${applied}`);
  const { busy, run } = useAction();

  const changeRole = (profile: Profile, role: Role) => {
    if (role === profile.role) return;
    const name = profile.full_name || profile.email;
    const warning =
      role === "admin"
        ? `Cấp quyền QUẢN TRỊ cho ${name}? Người này sẽ có toàn quyền như bạn, kể cả đổi vai trò người khác.`
        : `Đổi vai trò của ${name} thành “${ROLE_LABEL[role]}”?`;
    if (!window.confirm(warning)) return;
    void run(async (db) => check(await db.from("profiles").update({ role }).eq("id", profile.id).select("id").single()), "Đã đổi vai trò.").then((ok) => ok && reload());
  };

  return (
    <div>
      <form
        className="mb-4 flex gap-2"
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          setApplied(query);
        }}
      >
        <label className="relative flex-1">
          <span className="sr-only">Tìm theo tên hoặc email</span>
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
          <input className="input !pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm theo tên hoặc email…" />
        </label>
        <button type="submit" className="btn btn-outline">
          Tìm
        </button>
      </form>
      <p className="mb-3 text-sm text-muted">
        Giáo viên được soạn nội dung, xem lớp mình dạy và kết quả học viên của lớp. Chỉ cấp quyền quản trị cho người bạn hoàn toàn tin tưởng.
      </p>
      {error && !data ? (
        <Notice kind="bad">{error}</Notice>
      ) : !data ? (
        <Spinner />
      ) : data.length === 0 ? (
        <EmptyState title="Không tìm thấy người dùng nào" />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Họ tên</th>
                <th scope="col">Email</th>
                <th scope="col">Điện thoại</th>
                <th scope="col">Ngày tạo</th>
                <th scope="col">Vai trò</th>
              </tr>
            </thead>
            <tbody>
              {data.map((profile) => (
                <tr key={profile.id}>
                  <td className="font-semibold">{profile.full_name || "—"}</td>
                  <td className="break-all">{profile.email}</td>
                  <td>{profile.phone || "—"}</td>
                  <td className="whitespace-nowrap">{formatDate(profile.created_at)}</td>
                  <td>
                    {profile.id === user?.id ? (
                      <span className="chip" title="Không thể tự đổi vai trò của chính mình">
                        {ROLE_LABEL[profile.role]} (bạn)
                      </span>
                    ) : (
                      <select
                        className="input !min-h-9 !w-auto !py-1 !text-sm"
                        value={profile.role}
                        disabled={busy}
                        aria-label={`Vai trò của ${profile.full_name || profile.email}`}
                        onChange={(event) => changeRole(profile, event.target.value as Role)}
                      >
                        {(Object.keys(ROLE_LABEL) as Role[]).map((role) => (
                          <option key={role} value={role}>
                            {ROLE_LABEL[role]}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {data && data.length >= 200 ? <p className="mt-3 text-sm text-muted">Đang hiện 200 tài khoản mới nhất. Hãy dùng ô tìm kiếm để tìm tài khoản cũ hơn.</p> : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Kết quả học viên (admin: tất cả; giáo viên: học viên các lớp mình dạy — do RLS lọc)
// ---------------------------------------------------------------------------
type WithStudent<T> = T & { profiles: { full_name: string; email: string } | null };

export function StudentResults() {
  const { user, profile } = useAuth();
  const [tab, setTab] = useState<"ielts" | "exercises">("ielts");
  const [term, setTerm] = useState("");
  const { data, error } = useLoad(async (db) => {
    const [ielts, exercises] = await Promise.all([
      db.from("ielts_attempts").select(`${IELTS_ATTEMPT_COLUMNS}, profiles(full_name, email)`).order("created_at", { ascending: false }).limit(300),
      db.from("exercise_attempts").select(`${EXERCISE_ATTEMPT_COLUMNS}, profiles(full_name, email)`).order("created_at", { ascending: false }).limit(300),
    ]);
    return { ielts: check<WithStudent<IeltsAttemptRow>[]>(ielts), exercises: check<WithStudent<ExerciseAttemptRow>[]>(exercises) };
  });

  if (error && !data) return <Notice kind="bad">{error}</Notice>;
  if (!data) return <Spinner />;

  const needle = term.trim().toLowerCase();
  const matches = (row: { user_id: string; profiles: { full_name: string; email: string } | null }) =>
    row.user_id !== user?.id && (!needle || `${row.profiles?.full_name ?? ""} ${row.profiles?.email ?? ""}`.toLowerCase().includes(needle));
  const ielts = data.ielts.filter(matches);
  const exercises = data.exercises.filter(matches);
  const student = (row: { profiles: { full_name: string; email: string } | null }) => (
    <>
      <span className="font-semibold">{row.profiles?.full_name || "—"}</span>
      <span className="block text-xs text-muted">{row.profiles?.email}</span>
    </>
  );

  return (
    <div>
      {profile?.role === "teacher" ? <p className="mb-3 text-sm text-muted">Bạn xem được kết quả của học viên trong các lớp Callan mà bạn được phân công dạy.</p> : null}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Loại kết quả" className="flex gap-1.5">
          {(
            [
              ["ielts", `Thi thử IELTS (${ielts.length})`],
              ["exercises", `Bài tập ngữ pháp (${exercises.length})`],
            ] as const
          ).map(([id, label]) => (
            <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={cx("rounded-lg px-3 py-1.5 text-sm font-semibold", tab === id ? "bg-ink text-white" : "bg-white hover:bg-brand-50")}>
              {label}
            </button>
          ))}
        </div>
        <label>
          <span className="sr-only">Lọc theo học viên</span>
          <input className="input !min-h-9 !py-1 !text-sm" value={term} onChange={(event) => setTerm(event.target.value)} placeholder="Lọc theo tên / email…" />
        </label>
      </div>

      {tab === "ielts" ? (
        ielts.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Học viên</th>
                  <th scope="col">Đề</th>
                  <th scope="col">Kỹ năng</th>
                  <th scope="col">Đúng</th>
                  <th scope="col">Band</th>
                  <th scope="col">Thời gian làm</th>
                  <th scope="col">Ngày</th>
                </tr>
              </thead>
              <tbody>
                {ielts.map((row) => (
                  <tr key={row.id}>
                    <td>{student(row)}</td>
                    <td lang="en">{row.ielts_tests?.title ?? "(đề đã xóa)"}</td>
                    <td>{row.ielts_tests ? SKILL_LABEL[row.ielts_tests.skill] : ""}</td>
                    <td className="tabular-nums">
                      {row.correct}/{row.total}
                    </td>
                    <td className="font-bold tabular-nums">{Number(row.band).toFixed(1)}</td>
                    <td className="tabular-nums">{row.duration_seconds != null ? `${Math.round(row.duration_seconds / 60)} phút` : "—"}</td>
                    <td className="whitespace-nowrap">{formatDate(row.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="Chưa có kết quả thi thử nào" />
        )
      ) : exercises.length ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Học viên</th>
                <th scope="col">Bài</th>
                <th scope="col">Điểm</th>
                <th scope="col">Ngày</th>
              </tr>
            </thead>
            <tbody>
              {exercises.map((row) => (
                <tr key={row.id}>
                  <td>{student(row)}</td>
                  <td>{row.tenses?.name_vi ?? "(bài đã xóa)"}</td>
                  <td className="font-semibold tabular-nums">
                    {row.score}/{row.total}
                  </td>
                  <td className="whitespace-nowrap">{formatDate(row.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="Chưa có kết quả bài tập nào" />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Trang giáo viên: các lớp được phân công
// ---------------------------------------------------------------------------
export function TeacherClasses() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const { data, error } = useLoad(async (db) => {
    const [classes, students] = await Promise.all([
      db.from("callan_classes").select("*, callan_sessions(*)").eq("teacher_id", userId).order("created_at", { ascending: false }).order("starts_at", { referencedTable: "callan_sessions" }),
      db.from("callan_registrations").select("class_id, full_name, phone, email, current_level, goals").eq("status", "approved"),
    ]);
    return {
      classes: check<CallanClass[]>(classes),
      students: check<{ class_id: string; full_name: string; phone: string; email: string; current_level: string; goals: string }[]>(students),
    };
  }, `teacher:${userId}`);

  if (error && !data) return <Notice kind="bad">{error}</Notice>;
  if (!data) return <Spinner />;
  if (!data.classes.length) {
    return (
      <EmptyState title="Bạn chưa được phân công lớp nào">
        Khi quản trị viên xếp bạn dạy một lớp Callan, lịch dạy, danh sách học viên và link Google Meet sẽ hiện ở đây.
      </EmptyState>
    );
  }

  return (
    <div className="grid gap-5">
      {data.classes.map((klass) => {
        const students = data.students.filter((student) => student.class_id === klass.id);
        return (
          <ClassCard key={klass.id} klass={klass} heading="Lớp bạn dạy">
            <h4 className="mt-5 font-semibold">Học viên ({students.length})</h4>
            {students.length ? (
              <div className="table-wrap mt-2">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Họ tên</th>
                      <th scope="col">Liên hệ</th>
                      <th scope="col">Trình độ</th>
                      <th scope="col">Mục tiêu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={`${student.email}-${student.phone}`}>
                        <td className="font-semibold">{student.full_name}</td>
                        <td>
                          {student.phone}
                          <span className="block text-xs text-muted">{student.email}</span>
                        </td>
                        <td>{student.current_level || "—"}</td>
                        <td>{student.goals || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-1 text-sm text-muted">Chưa có học viên nào được xếp vào lớp này.</p>
            )}
          </ClassCard>
        );
      })}
      <p className="text-sm text-muted">
        Xem điểm bài tập và thi thử của học viên tại{" "}
        <Link href="/quan-tri/ket-qua" className="font-semibold text-brand-700 hover:underline">
          Kết quả học viên
        </Link>
        .
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cài đặt trang (admin)
// ---------------------------------------------------------------------------
export function AdminSettings() {
  const { data, error } = useLoad(async (db) => {
    const rows = check<{ key: string; value: Record<string, string> }[]>(await db.from("site_settings").select("key, value"));
    const value = (key: string) => rows.find((row) => row.key === key)?.value ?? {};
    return { contact: { ...EMPTY_CONTACT, ...value("contact") } as ContactSettings, payment: { ...EMPTY_PAYMENT, ...value("payment") } as PaymentSettings };
  });
  if (error && !data) return <Notice kind="bad">{error}</Notice>;
  if (!data) return <Spinner />;
  return <SettingsForms initialContact={data.contact} initialPayment={data.payment} />;
}

function SettingsForms({ initialContact, initialPayment }: { initialContact: ContactSettings; initialPayment: PaymentSettings }) {
  const [contact, setContact] = useState(initialContact);
  const [payment, setPayment] = useState(initialPayment);
  const { busy, run } = useAction();

  const save = (key: "contact" | "payment", value: ContactSettings | PaymentSettings, isPublic: boolean) => {
    const trimmed = Object.fromEntries(Object.entries(value).map(([field, text]) => [field, String(text).trim()]));
    return run(async (db) => check(await db.from("site_settings").upsert({ key, value: trimmed, is_public: isPublic }).select("key").single()), "Đã lưu cài đặt.");
  };

  return (
    <div className="grid gap-6">
      <form
        className="card grid gap-4 p-5 sm:p-6"
        onSubmit={(event) => {
          event.preventDefault();
          void save("contact", contact, true);
        }}
      >
        <div>
          <h2 className="text-lg font-bold">Thông tin tổ chức & liên hệ</h2>
          <p className="text-sm text-muted">Hiện công khai ở đầu trang, chân trang và trang Liên hệ. Ô nào để trống sẽ không hiển thị.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Tên tổ chức / thương hiệu" value={contact.org_name} onChange={(org_name) => setContact({ ...contact, org_name })} maxLength={80} hint="Thay cho tên mặc định ở góc trên bên trái." />
          <TextField label="Điện thoại" value={contact.phone} onChange={(phone) => setContact({ ...contact, phone })} maxLength={30} type="tel" />
          <TextField label="Email" value={contact.email} onChange={(email) => setContact({ ...contact, email })} maxLength={120} type="email" />
          <TextField label="Zalo (số điện thoại hoặc link)" value={contact.zalo} onChange={(zalo) => setContact({ ...contact, zalo })} maxLength={120} />
          <TextField label="Facebook (link)" value={contact.facebook} onChange={(facebook) => setContact({ ...contact, facebook })} maxLength={200} type="url" placeholder="https://facebook.com/…" />
          <TextField label="Giờ làm việc" value={contact.working_hours} onChange={(working_hours) => setContact({ ...contact, working_hours })} maxLength={120} placeholder="Thứ 2 – Thứ 7, 8:00 – 21:00" />
        </div>
        <TextField label="Địa chỉ" value={contact.address} onChange={(address) => setContact({ ...contact, address })} maxLength={300} />
        <TextField label="Giới thiệu ngắn" value={contact.about} onChange={(about) => setContact({ ...contact, about })} multiline maxLength={400} />
        <div>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            Lưu thông tin liên hệ
          </button>
        </div>
      </form>

      <form
        className="card grid gap-4 p-5 sm:p-6"
        onSubmit={(event) => {
          event.preventDefault();
          void save("payment", payment, false);
        }}
      >
        <div>
          <h2 className="text-lg font-bold">Tài khoản nhận học phí</h2>
          <p className="text-sm text-muted">Chỉ người đã đăng nhập và có đăng ký lớp Callan đang chờ mới thấy phần hướng dẫn chuyển khoản này.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Ngân hàng" value={payment.bank_name} onChange={(bank_name) => setPayment({ ...payment, bank_name })} maxLength={80} placeholder="Vietcombank" />
          <TextField
            label="Mã ngân hàng cho mã QR (BIN)"
            value={payment.bank_bin}
            onChange={(bank_bin) => setPayment({ ...payment, bank_bin })}
            maxLength={20}
            placeholder="970436"
            hint="Ví dụ Vietcombank: 970436. Tra mã ngân hàng khác tại vietqr.io. Để trống nếu không muốn hiện mã QR (ảnh QR do dịch vụ VietQR.io tạo)."
          />
          <TextField label="Số tài khoản" value={payment.account_number} onChange={(account_number) => setPayment({ ...payment, account_number })} maxLength={30} inputMode="numeric" />
          <TextField label="Tên chủ tài khoản" value={payment.account_name} onChange={(account_name) => setPayment({ ...payment, account_name })} maxLength={80} placeholder="NGUYEN VAN A" />
        </div>
        <TextField label="Ghi chú thêm cho học viên" value={payment.note} onChange={(note) => setPayment({ ...payment, note })} multiline maxLength={400} placeholder="Ví dụ: sau khi chuyển khoản, vui lòng chờ xác nhận trong vòng 24 giờ." />
        <div>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            Lưu thông tin thanh toán
          </button>
        </div>
      </form>
    </div>
  );
}
