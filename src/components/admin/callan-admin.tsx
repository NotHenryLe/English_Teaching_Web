"use client";

import { CalendarPlus, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { CallanClass, CallanPackage, CallanRegistration, CallanSession, Profile, RegistrationStatus } from "@/lib/types";
import { PAYMENT_STATUS, REGISTRATION_STATUS } from "../callan-views";
import { EmptyState, Modal, Notice, Spinner, cx, formatDate, formatDateTime, formatVnd, safeUrl } from "../ui";
import { TextField, Toggle, check, useAction, useLoad } from "./common";

// ---------------------------------------------------------------------------
// Tổng quan
// ---------------------------------------------------------------------------
export function AdminOverview() {
  const { data, error } = useLoad(async (db) => {
    const head = (table: string) => db.from(table).select("*", { count: "exact", head: true });
    const results = await Promise.all([
      head("callan_registrations").eq("status", "pending"),
      head("callan_registrations").eq("status", "pending").eq("payment_status", "reported"),
      head("profiles"),
      head("callan_classes").eq("active", true),
      head("callan_packages").eq("active", true),
      head("vocab_topics"),
      head("ielts_tests"),
    ]);
    const failed = results.find((result) => result.error);
    if (failed?.error) throw failed.error;
    const [pending, reported, users, classes, packages, topics, tests] = results.map((result) => result.count ?? 0);
    const settings = check<{ key: string; value: Record<string, string> }[]>(await db.from("site_settings").select("key, value"));
    const value = (key: string, field: string) => settings.find((row) => row.key === key)?.value?.[field] ?? "";
    return { pending, reported, users, classes, packages, topics, tests, hasContact: Boolean(value("contact", "phone") || value("contact", "email")), hasBank: Boolean(value("payment", "account_number")) };
  });

  if (error) return <Notice kind="bad">{error}</Notice>;
  if (!data) return <Spinner />;

  const todo = [
    !data.hasContact && { href: "/quan-tri/cai-dat", text: "Điền thông tin liên hệ của tổ chức (hiện ở chân trang và trang Liên hệ)." },
    !data.hasBank && { href: "/quan-tri/cai-dat", text: "Điền thông tin tài khoản ngân hàng để học viên chuyển khoản học phí." },
    data.packages === 0 && { href: "/quan-tri/goi-hoc", text: "Chưa có gói học Callan nào đang mở. Hãy sửa giá và bật gói học." },
    data.classes === 0 && { href: "/quan-tri/lop-hoc", text: "Tạo lớp Callan đầu tiên (giáo viên, lịch học, link Google Meet)." },
  ].filter((item): item is { href: string; text: string } => Boolean(item));

  const stats = [
    { label: "Đăng ký chờ duyệt", value: data.pending, href: "/quan-tri/dang-ky", highlight: data.pending > 0 },
    { label: "Báo đã chuyển khoản", value: data.reported, href: "/quan-tri/dang-ky", highlight: data.reported > 0 },
    { label: "Người dùng", value: data.users, href: "/quan-tri/nguoi-dung" },
    { label: "Lớp đang mở", value: data.classes, href: "/quan-tri/lop-hoc" },
    { label: "Chủ đề từ vựng", value: data.topics, href: "/quan-tri/tu-vung" },
    { label: "Đề IELTS", value: data.tests, href: "/quan-tri/ielts" },
  ];

  return (
    <div className="grid gap-6">
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {stats.map((stat) => (
          <li key={stat.label}>
            <Link href={stat.href} className={cx("card block p-4 transition-transform hover:-translate-y-0.5", stat.highlight && "!border-sun-400 bg-sun-50")}>
              <span className="block text-3xl font-extrabold tabular-nums">{stat.value}</span>
              <span className="block text-sm font-medium text-muted">{stat.label}</span>
            </Link>
          </li>
        ))}
      </ul>
      {todo.length ? (
        <section className="card p-5" aria-labelledby="viec-can-lam">
          <h2 id="viec-can-lam" className="font-bold">
            Việc nên làm trước khi mở web
          </h2>
          <ul className="mt-3 grid gap-2 text-sm">
            {todo.map((item) => (
              <li key={item.text} className="flex gap-2">
                <span aria-hidden>☐</span>
                <Link href={item.href} className="hover:text-brand-700 hover:underline">
                  {item.text}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Đăng ký Callan
// ---------------------------------------------------------------------------
type RegistrationFilter = RegistrationStatus | "all";

export function AdminRegistrations() {
  const { data, error, reload } = useLoad(async (db) => {
    const [registrations, classes] = await Promise.all([
      db.from("callan_registrations").select("*").order("created_at", { ascending: false }).limit(500),
      db.from("callan_classes").select("*").order("created_at", { ascending: false }),
    ]);
    return { registrations: check<CallanRegistration[]>(registrations), classes: check<CallanClass[]>(classes) };
  });
  const { busy, run } = useAction();
  const [filter, setFilter] = useState<RegistrationFilter>("pending");
  const [approving, setApproving] = useState<CallanRegistration | null>(null);
  const [rejecting, setRejecting] = useState<CallanRegistration | null>(null);

  if (error && !data) return <Notice kind="bad">{error}</Notice>;
  if (!data) return <Spinner />;

  const counts = data.registrations.reduce<Record<string, number>>((acc, item) => ({ ...acc, [item.status]: (acc[item.status] ?? 0) + 1 }), {});
  const filters: { id: RegistrationFilter; label: string }[] = [
    { id: "pending", label: `Chờ duyệt (${counts.pending ?? 0})` },
    { id: "approved", label: `Đã duyệt (${counts.approved ?? 0})` },
    { id: "rejected", label: `Từ chối (${counts.rejected ?? 0})` },
    { id: "cancelled", label: `Đã hủy (${counts.cancelled ?? 0})` },
    { id: "all", label: `Tất cả (${data.registrations.length})` },
  ];
  const rows = data.registrations.filter((item) => filter === "all" || item.status === filter);
  const className = (id: string | null) => data.classes.find((item) => item.id === id)?.name ?? "";

  const update = (id: string, patch: Partial<CallanRegistration>, message: string) =>
    run(async (db) => check(await db.from("callan_registrations").update(patch).eq("id", id).select("id").single()), message).then((ok) => {
      if (ok) reload();
      return ok;
    });

  return (
    <div>
      <div role="tablist" aria-label="Lọc theo trạng thái" className="mb-4 flex flex-wrap gap-1.5">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={filter === item.id}
            onClick={() => setFilter(item.id)}
            className={cx("rounded-lg px-3 py-1.5 text-sm font-semibold", filter === item.id ? "bg-ink text-white" : "bg-white hover:bg-brand-50")}
          >
            {item.label}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <EmptyState title="Không có đăng ký nào ở mục này" />
      ) : (
        <ul className="grid gap-3">
          {rows.map((item) => (
            <li key={item.id} className="card p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2">
                    <strong className="text-lg">{item.full_name}</strong>
                    <span className={REGISTRATION_STATUS[item.status].chip}>{REGISTRATION_STATUS[item.status].label}</span>
                    <span className={PAYMENT_STATUS[item.payment_status].chip}>{PAYMENT_STATUS[item.payment_status].label}</span>
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    <a href={`tel:${item.phone.replace(/[^\d+]/g, "")}`} className="font-medium text-ink hover:underline">
                      {item.phone}
                    </a>{" "}
                    ·{" "}
                    <a href={`mailto:${item.email}`} className="font-medium text-ink hover:underline">
                      {item.email}
                    </a>{" "}
                    · gửi ngày {formatDate(item.created_at)}
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-bold">{item.package_name}</p>
                  <p>
                    {item.sessions} buổi · {formatVnd(item.price_vnd)}
                  </p>
                  <p>
                    Mã CK: <code className="rounded bg-sun-100 px-1.5 py-0.5 font-bold">{item.payment_code}</code>
                  </p>
                </div>
              </div>
              <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                <div>
                  <dt className="inline text-muted">Trình độ: </dt>
                  <dd className="inline">{item.current_level || "—"}</dd>
                </div>
                <div>
                  <dt className="inline text-muted">Thời gian học được: </dt>
                  <dd className="inline">{item.preferred_schedule || "—"}</dd>
                </div>
                {item.goals ? (
                  <div className="sm:col-span-2">
                    <dt className="inline text-muted">Mục tiêu: </dt>
                    <dd className="inline">{item.goals}</dd>
                  </div>
                ) : null}
                {item.class_id ? (
                  <div>
                    <dt className="inline text-muted">Lớp: </dt>
                    <dd className="inline font-semibold">{className(item.class_id) || "(lớp đã xóa)"}</dd>
                  </div>
                ) : null}
                {item.admin_note ? (
                  <div className="sm:col-span-2">
                    <dt className="inline text-muted">Ghi chú gửi học viên: </dt>
                    <dd className="inline">{item.admin_note}</dd>
                  </div>
                ) : null}
              </dl>
              <div className="mt-4 flex flex-wrap gap-2">
                {item.status === "pending" && item.payment_status !== "confirmed" ? (
                  <button type="button" className="btn btn-outline btn-sm" disabled={busy} onClick={() => void update(item.id, { payment_status: "confirmed" }, "Đã xác nhận nhận học phí.")}>
                    Xác nhận đã nhận học phí
                  </button>
                ) : null}
                {item.status === "pending" || item.status === "approved" ? (
                  <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={() => setApproving(item)}>
                    {item.status === "approved" ? "Đổi lớp" : "Duyệt & xếp lớp"}
                  </button>
                ) : null}
                {item.status === "pending" ? (
                  <button type="button" className="btn btn-danger btn-sm" disabled={busy} onClick={() => setRejecting(item)}>
                    Từ chối
                  </button>
                ) : null}
                {item.status === "approved" ? (
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    disabled={busy}
                    onClick={() => {
                      if (window.confirm(`Hủy duyệt đăng ký của ${item.full_name}? Học viên sẽ không còn thấy lịch học và link Meet.`)) {
                        void update(item.id, { status: "cancelled", class_id: null }, "Đã hủy duyệt.");
                      }
                    }}
                  >
                    Hủy duyệt
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      {approving ? (
        <ApproveDialog
          key={approving.id}
          registration={approving}
          classes={data.classes.filter((item) => item.active || item.id === approving.class_id)}
          busy={busy}
          onClose={() => setApproving(null)}
          onSubmit={async (patch) => {
            if (await update(approving.id, patch, "Đã duyệt và xếp lớp. Học viên sẽ thấy lịch học trong trang Tài khoản.")) setApproving(null);
          }}
        />
      ) : null}
      {rejecting ? (
        <RejectDialog
          key={rejecting.id}
          registration={rejecting}
          busy={busy}
          onClose={() => setRejecting(null)}
          onSubmit={async (note) => {
            if (await update(rejecting.id, { status: "rejected", admin_note: note }, "Đã từ chối đăng ký.")) setRejecting(null);
          }}
        />
      ) : null}
    </div>
  );
}

function ApproveDialog({
  registration,
  classes,
  busy,
  onClose,
  onSubmit,
}: {
  registration: CallanRegistration;
  classes: CallanClass[];
  busy: boolean;
  onClose: () => void;
  onSubmit: (patch: Partial<CallanRegistration>) => void;
}) {
  const [classId, setClassId] = useState(registration.class_id ?? classes[0]?.id ?? "");
  const [paid, setPaid] = useState(true);
  const [note, setNote] = useState(registration.admin_note);
  return (
    <Modal open onClose={onClose} title={`Duyệt đăng ký — ${registration.full_name}`}>
      {classes.length === 0 ? (
        <>
          <Notice kind="warn">Chưa có lớp nào đang mở. Hãy tạo lớp trước khi duyệt.</Notice>
          <Link href="/quan-tri/lop-hoc" className="btn btn-primary mt-4">
            Tạo lớp
          </Link>
        </>
      ) : (
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit({ status: "approved", class_id: classId, admin_note: note.trim(), ...(paid ? { payment_status: "confirmed" as const } : {}) });
          }}
        >
          <p className="text-sm text-muted">
            {registration.package_name} · {formatVnd(registration.price_vnd)} · Mong muốn: {registration.preferred_schedule || "không ghi"}
          </p>
          <label className="block">
            <span className="field-label">Xếp vào lớp</span>
            <select className="input" value={classId} onChange={(event) => setClassId(event.target.value)} required>
              {classes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                  {item.schedule_note ? ` — ${item.schedule_note}` : ""}
                </option>
              ))}
            </select>
          </label>
          <Toggle checked={paid} onChange={setPaid} label="Đã nhận đủ học phí" />
          <TextField label="Ghi chú gửi học viên (không bắt buộc)" value={note} onChange={setNote} multiline maxLength={2000} />
          <div className="flex justify-end gap-2">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Đóng
            </button>
            <button type="submit" className="btn btn-primary" disabled={busy || !classId}>
              {busy ? "Đang lưu…" : "Duyệt"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

function RejectDialog({ registration, busy, onClose, onSubmit }: { registration: CallanRegistration; busy: boolean; onClose: () => void; onSubmit: (note: string) => void }) {
  const [note, setNote] = useState("");
  return (
    <Modal open onClose={onClose} title={`Từ chối đăng ký — ${registration.full_name}`}>
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(note.trim());
        }}
      >
        <TextField label="Lý do (học viên sẽ đọc được)" value={note} onChange={setNote} multiline maxLength={2000} placeholder="Ví dụ: lớp đã đủ học viên, trung tâm sẽ liên hệ khi có lớp mới." />
        <div className="flex justify-end gap-2">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Đóng
          </button>
          <button type="submit" className="btn btn-danger" disabled={busy}>
            {busy ? "Đang lưu…" : "Từ chối đăng ký"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Gói học
// ---------------------------------------------------------------------------
const NEW_PACKAGE: Omit<CallanPackage, "id"> = { name: "", description_vi: "", sessions: 8, price_vnd: 0, sort_order: 0, active: false };

export function AdminPackages() {
  const { data, error, reload } = useLoad(async (db) => check<CallanPackage[]>(await db.from("callan_packages").select("*").order("sort_order").order("price_vnd")));
  const { busy, run } = useAction();
  const [editing, setEditing] = useState<(Omit<CallanPackage, "id"> & { id?: string }) | null>(null);

  if (error && !data) return <Notice kind="bad">{error}</Notice>;
  if (!data) return <Spinner />;

  const save = async () => {
    if (!editing) return;
    const { id, ...fields } = editing;
    const payload = { ...fields, name: fields.name.trim(), description_vi: fields.description_vi.trim() };
    const ok = await run(
      async (db) => check(id ? await db.from("callan_packages").update(payload).eq("id", id).select("id").single() : await db.from("callan_packages").insert(payload).select("id").single()),
      "Đã lưu gói học.",
    );
    if (ok) {
      setEditing(null);
      reload();
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">Chỉ gói đang bật mới hiện trên trang Lớp Callan. Giá đã đăng ký của học viên không đổi khi bạn sửa gói.</p>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => setEditing({ ...NEW_PACKAGE, sort_order: data.length + 1 })}>
          <Plus size={16} aria-hidden /> Thêm gói
        </button>
      </div>
      {data.length === 0 ? (
        <EmptyState title="Chưa có gói học nào" />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {data.map((item) => (
            <li key={item.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold">{item.name}</p>
                  <p className="text-sm">
                    {item.sessions} buổi · <strong>{formatVnd(item.price_vnd)}</strong>
                  </p>
                </div>
                <span className={item.active ? "chip chip-good" : "chip chip-gray"}>{item.active ? "Đang mở" : "Đang tắt"}</span>
              </div>
              {item.description_vi ? <p className="mt-2 text-sm text-muted">{item.description_vi}</p> : null}
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditing(item)}>
                  <Pencil size={14} aria-hidden /> Sửa
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  disabled={busy}
                  onClick={() =>
                    void run(async (db) => check(await db.from("callan_packages").update({ active: !item.active }).eq("id", item.id).select("id").single()), item.active ? "Đã tắt gói." : "Đã mở gói.").then(
                      (ok) => ok && reload(),
                    )
                  }
                >
                  {item.active ? "Tắt" : "Mở gói"}
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  disabled={busy}
                  onClick={() => {
                    if (window.confirm(`Xóa gói “${item.name}”? Các đăng ký cũ vẫn giữ tên và giá đã chụp lại.`)) {
                      void run(async (db) => check(await db.from("callan_packages").delete().eq("id", item.id).select("id")), "Đã xóa gói.").then((ok) => ok && reload());
                    }
                  }}
                >
                  <Trash2 size={14} aria-hidden /> Xóa
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing ? (
        <Modal open onClose={() => setEditing(null)} title={editing.id ? "Sửa gói học" : "Thêm gói học"}>
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              void save();
            }}
          >
            <TextField label="Tên gói" value={editing.name} onChange={(name) => setEditing({ ...editing, name })} required maxLength={120} placeholder="Ví dụ: Gói 8 buổi" />
            <div className="grid grid-cols-2 gap-4">
              <TextField label="Số buổi" type="number" min={1} max={500} value={String(editing.sessions)} onChange={(value) => setEditing({ ...editing, sessions: Number(value) || 0 })} required />
              <TextField label="Học phí (VNĐ)" type="number" min={0} step={1000} value={String(editing.price_vnd)} onChange={(value) => setEditing({ ...editing, price_vnd: Number(value) || 0 })} required />
            </div>
            <TextField label="Mô tả" value={editing.description_vi} onChange={(description_vi) => setEditing({ ...editing, description_vi })} multiline maxLength={500} />
            <TextField label="Thứ tự hiển thị" type="number" value={String(editing.sort_order)} onChange={(value) => setEditing({ ...editing, sort_order: Number(value) || 0 })} />
            <Toggle checked={editing.active} onChange={(active) => setEditing({ ...editing, active })} label="Mở gói này cho học viên đăng ký" />
            <div className="flex justify-end gap-2">
              <button type="button" className="btn btn-outline" onClick={() => setEditing(null)}>
                Đóng
              </button>
              <button type="submit" className="btn btn-primary" disabled={busy}>
                {busy ? "Đang lưu…" : "Lưu"}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Lớp & lịch học
// ---------------------------------------------------------------------------
type ClassDraft = Pick<CallanClass, "name" | "level" | "description_vi" | "teacher_id" | "schedule_note" | "meet_link" | "active"> & { id?: string };
const NEW_CLASS: ClassDraft = { name: "", level: "", description_vi: "", teacher_id: null, schedule_note: "", meet_link: "", active: true };
type Staff = Pick<Profile, "id" | "full_name" | "email" | "role">;

export function AdminClasses() {
  const { data, error, reload } = useLoad(async (db) => {
    const [classes, staff, students] = await Promise.all([
      db.from("callan_classes").select("*, callan_sessions(*)").order("created_at", { ascending: false }).order("starts_at", { referencedTable: "callan_sessions" }),
      db.from("profiles").select("id, full_name, email, role").in("role", ["teacher", "admin"]).order("full_name"),
      db.from("callan_registrations").select("class_id, full_name, phone").eq("status", "approved"),
    ]);
    return {
      classes: check<CallanClass[]>(classes),
      staff: check<Staff[]>(staff),
      students: check<{ class_id: string; full_name: string; phone: string }[]>(students),
    };
  });
  const { busy, run } = useAction();
  const [editing, setEditing] = useState<ClassDraft | null>(null);
  const [scheduling, setScheduling] = useState<string | null>(null);

  if (error && !data) return <Notice kind="bad">{error}</Notice>;
  if (!data) return <Spinner />;

  const saveClass = async () => {
    if (!editing) return;
    const { id, ...fields } = editing;
    const payload = { ...fields, name: fields.name.trim(), meet_link: fields.meet_link.trim(), teacher_id: fields.teacher_id || null };
    const ok = await run(
      async (db) => check(id ? await db.from("callan_classes").update(payload).eq("id", id).select("id").single() : await db.from("callan_classes").insert(payload).select("id").single()),
      "Đã lưu lớp học.",
    );
    if (ok) {
      setEditing(null);
      reload();
    }
  };

  const schedulingClass = data.classes.find((item) => item.id === scheduling) ?? null;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-sm text-muted">Mỗi lớp có một giáo viên, một link Google Meet và danh sách buổi học. Học viên chỉ thấy lớp sau khi đăng ký của họ được duyệt vào lớp đó.</p>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => setEditing(NEW_CLASS)}>
          <Plus size={16} aria-hidden /> Tạo lớp
        </button>
      </div>

      {data.staff.filter((person) => person.role === "teacher").length === 0 ? (
        <div className="mb-4">
          <Notice>
            Chưa có tài khoản giáo viên nào. Vào{" "}
            <Link href="/quan-tri/nguoi-dung" className="font-semibold underline">
              Người dùng
            </Link>{" "}
            để cấp vai trò giáo viên cho tài khoản đã đăng ký.
          </Notice>
        </div>
      ) : null}

      {data.classes.length === 0 ? (
        <EmptyState title="Chưa có lớp nào">Tạo lớp đầu tiên để bắt đầu xếp học viên.</EmptyState>
      ) : (
        <ul className="grid gap-4">
          {data.classes.map((item) => {
            const students = data.students.filter((student) => student.class_id === item.id);
            const sessions = item.callan_sessions ?? [];
            const link = safeUrl(item.meet_link);
            return (
              <li key={item.id} className="card p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2">
                      <strong className="text-lg">{item.name}</strong>
                      {item.level ? <span className="chip">{item.level}</span> : null}
                      <span className={item.active ? "chip chip-good" : "chip chip-gray"}>{item.active ? "Đang mở" : "Đã đóng"}</span>
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      Giáo viên: <span className="font-medium text-ink">{item.teacher_name || "chưa phân công"}</span>
                      {item.schedule_note ? ` · ${item.schedule_note}` : ""}
                    </p>
                    <p className="mt-1 text-sm break-all">
                      {link ? (
                        <a href={link} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-700 hover:underline">
                          {link}
                        </a>
                      ) : (
                        <span className="text-bad-700">Chưa có link Google Meet</span>
                      )}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditing(item)}>
                      <Pencil size={14} aria-hidden /> Sửa lớp
                    </button>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => setScheduling(item.id)}>
                      <CalendarPlus size={14} aria-hidden /> Lịch học ({sessions.length})
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      disabled={busy}
                      onClick={() => {
                        if (window.confirm(`Xóa lớp “${item.name}” cùng toàn bộ lịch học? Lớp đang có học viên sẽ không xóa được — hãy đóng lớp thay vì xóa.`)) {
                          void run(async (db) => check(await db.from("callan_classes").delete().eq("id", item.id).select("id")), "Đã xóa lớp.").then((ok) => ok && reload());
                        }
                      }}
                    >
                      <Trash2 size={14} aria-hidden /> Xóa
                    </button>
                  </div>
                </div>
                <p className="mt-3 text-sm">
                  <span className="font-semibold">{students.length} học viên:</span>{" "}
                  {students.length ? students.map((student) => `${student.full_name} (${student.phone})`).join(", ") : <span className="text-muted">chưa có</span>}
                </p>
              </li>
            );
          })}
        </ul>
      )}

      {editing ? (
        <Modal open onClose={() => setEditing(null)} title={editing.id ? "Sửa lớp học" : "Tạo lớp học"}>
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              void saveClass();
            }}
          >
            <TextField label="Tên lớp" value={editing.name} onChange={(name) => setEditing({ ...editing, name })} required maxLength={120} placeholder="Ví dụ: Callan Stage 1 — tối 3-5" />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Cấp độ" value={editing.level} onChange={(level) => setEditing({ ...editing, level })} maxLength={60} placeholder="Stage 1" />
              <label className="block">
                <span className="field-label">Giáo viên</span>
                <select className="input" value={editing.teacher_id ?? ""} onChange={(event) => setEditing({ ...editing, teacher_id: event.target.value || null })}>
                  <option value="">— Chưa phân công —</option>
                  {data.staff.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.full_name || person.email}
                      {person.role === "admin" ? " (admin)" : ""}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <TextField label="Lịch học cố định (ghi chú)" value={editing.schedule_note} onChange={(schedule_note) => setEditing({ ...editing, schedule_note })} maxLength={200} placeholder="Thứ 3 & thứ 5, 19:30–20:20" />
            <TextField
              label="Link Google Meet"
              type="url"
              value={editing.meet_link}
              onChange={(meet_link) => setEditing({ ...editing, meet_link })}
              placeholder="https://meet.google.com/abc-defg-hij"
              hint="Tạo phòng họp trong Google Meet rồi dán link vào đây. Dùng chung cho mọi buổi của lớp."
            />
            <TextField label="Mô tả cho học viên" value={editing.description_vi} onChange={(description_vi) => setEditing({ ...editing, description_vi })} multiline maxLength={1000} />
            <Toggle checked={editing.active} onChange={(active) => setEditing({ ...editing, active })} label="Lớp đang mở (nhận xếp học viên)" />
            <div className="flex justify-end gap-2">
              <button type="button" className="btn btn-outline" onClick={() => setEditing(null)}>
                Đóng
              </button>
              <button type="submit" className="btn btn-primary" disabled={busy}>
                {busy ? "Đang lưu…" : "Lưu"}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {schedulingClass ? <SessionsDialog klass={schedulingClass} onClose={() => setScheduling(null)} onChanged={reload} /> : null}
    </div>
  );
}

const WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const pad = (value: number) => String(value).padStart(2, "0");
const toDateInput = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** Sinh N buổi học kể từ ngày bắt đầu, rơi vào các thứ đã chọn, theo giờ địa phương của người quản trị. */
export function buildSessions(startDate: string, time: string, weekdays: number[], count: number): Date[] {
  const [year, month, day] = startDate.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  if (!year || !month || !day || Number.isNaN(hour) || Number.isNaN(minute) || !weekdays.length || count < 1) return [];
  const dates: Date[] = [];
  const cursor = new Date(year, month - 1, day, hour, minute, 0, 0);
  for (let guard = 0; dates.length < count && guard < 370 * 2; guard++) {
    if (weekdays.includes(cursor.getDay())) dates.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

function SessionsDialog({ klass, onClose, onChanged }: { klass: CallanClass; onClose: () => void; onChanged: () => void }) {
  const { busy, run } = useAction();
  const sessions = klass.callan_sessions ?? [];
  // Giá trị mặc định tính một lần khi mở hộp thoại.
  const [plan, setPlan] = useState(() => ({ startDate: toDateInput(new Date()), time: "19:30", duration: 50, count: 8, weekdays: [2, 4], topic: "" }));
  const preview = buildSessions(plan.startDate, plan.time, plan.weekdays, plan.count);

  const add = async () => {
    if (!preview.length) return;
    const rows = preview.map((date) => ({ class_id: klass.id, starts_at: date.toISOString(), duration_minutes: plan.duration, topic: plan.topic.trim() }));
    if (await run(async (db) => check(await db.from("callan_sessions").insert(rows).select("id")), `Đã thêm ${rows.length} buổi học.`)) onChanged();
  };

  const remove = async (session: CallanSession) => {
    if (await run(async (db) => check(await db.from("callan_sessions").delete().eq("id", session.id).select("id")), "Đã xóa buổi học.")) onChanged();
  };

  return (
    <Modal open onClose={onClose} title={`Lịch học — ${klass.name}`} wide>
      <section aria-labelledby="them-buoi" className="rounded-xl border-[1.5px] border-line bg-paper/60 p-4">
        <h3 id="them-buoi" className="font-bold">
          Thêm buổi học
        </h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          <TextField label="Từ ngày" type="date" value={plan.startDate} onChange={(startDate) => setPlan({ ...plan, startDate })} />
          <TextField label="Giờ bắt đầu" type="time" value={plan.time} onChange={(time) => setPlan({ ...plan, time })} />
          <TextField label="Thời lượng (phút)" type="number" min={10} max={300} value={String(plan.duration)} onChange={(value) => setPlan({ ...plan, duration: Number(value) || 50 })} />
          <TextField label="Số buổi" type="number" min={1} max={60} value={String(plan.count)} onChange={(value) => setPlan({ ...plan, count: Math.min(60, Math.max(0, Number(value) || 0)) })} />
        </div>
        <fieldset className="mt-3">
          <legend className="field-label">Học vào các thứ</legend>
          <div className="flex flex-wrap gap-1.5">
            {WEEKDAYS.map((label, day) => {
              const on = plan.weekdays.includes(day);
              return (
                <label key={label} className={cx("cursor-pointer rounded-lg border-[1.5px] px-3 py-1.5 text-sm font-semibold", on ? "border-brand-600 bg-brand-600 text-white" : "border-line bg-white")}>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={on}
                    onChange={() => setPlan({ ...plan, weekdays: on ? plan.weekdays.filter((value) => value !== day) : [...plan.weekdays, day] })}
                  />
                  {label}
                </label>
              );
            })}
          </div>
        </fieldset>
        <TextField label="Nội dung buổi học (không bắt buộc)" value={plan.topic} onChange={(topic) => setPlan({ ...plan, topic })} maxLength={200} className="mt-3" />
        <p className="mt-3 text-sm text-muted" aria-live="polite">
          {preview.length
            ? `Sẽ thêm ${preview.length} buổi: từ ${formatDateTime(preview[0].toISOString())} đến ${formatDateTime(preview[preview.length - 1].toISOString())} (theo giờ trên máy của bạn).`
            : "Hãy chọn ngày, giờ, ít nhất một thứ trong tuần và số buổi."}
        </p>
        <button type="button" className="btn btn-primary btn-sm mt-3" disabled={busy || !preview.length} onClick={() => void add()}>
          <Plus size={15} aria-hidden /> Thêm {preview.length || ""} buổi
        </button>
      </section>

      <h3 className="mt-5 font-bold">Các buổi đã xếp ({sessions.length})</h3>
      {sessions.length ? (
        <ol className="mt-2 grid gap-1.5">
          {sessions.map((session) => (
            <li key={session.id} className="flex items-center justify-between gap-3 rounded-lg bg-paper px-3 py-2 text-sm">
              <span>
                <strong>{formatDateTime(session.starts_at)}</strong> · {session.duration_minutes} phút{session.topic ? ` · ${session.topic}` : ""}
              </span>
              <button type="button" className="btn btn-ghost btn-sm !min-h-8 text-bad-700" disabled={busy} onClick={() => void remove(session)} aria-label={`Xóa buổi ${formatDateTime(session.starts_at)}`}>
                <Trash2 size={15} aria-hidden />
              </button>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-2 text-sm text-muted">Chưa có buổi học nào.</p>
      )}
    </Modal>
  );
}
