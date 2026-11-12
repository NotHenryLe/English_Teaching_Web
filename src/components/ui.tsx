"use client";

import { Loader2, Volume2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef } from "react";
import { useSpeech } from "./providers";

export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

/** Nút loa: đọc `text` bằng giọng đã chọn trong phần cài đặt phát âm. */
export function SpeakButton({
  text,
  label,
  size = "md",
  slow = false,
  className,
}: {
  text: string;
  label?: string;
  size?: "sm" | "md" | "lg";
  slow?: boolean;
  className?: string;
}) {
  const { supported, speaking, say, stop, prefs } = useSpeech();
  const active = speaking === text;
  const dimension = size === "lg" ? "h-12 w-12" : size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const icon = size === "lg" ? 22 : size === "sm" ? 15 : 18;
  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (active) stop();
        else say(text, slow ? { rate: Math.min(prefs.rate, 0.6) } : undefined);
      }}
      disabled={!supported}
      aria-label={label ?? `Nghe phát âm: ${text}`}
      title={supported ? (slow ? "Nghe chậm" : "Nghe phát âm") : "Trình duyệt này không hỗ trợ đọc phát âm"}
      className={cx(
        "inline-flex shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        dimension,
        active
          ? "border-sun-500 bg-sun-300 text-ink"
          : "border-brand-200 bg-brand-50 text-brand-700 hover:border-brand-500 hover:bg-brand-100",
        className,
      )}
    >
      <Volume2 size={icon} aria-hidden className={active ? "animate-pulse" : undefined} />
      {slow ? <span className="sr-only">(chậm)</span> : null}
    </button>
  );
}

export function Spinner({ label = "Đang tải…", className }: { label?: string; className?: string }) {
  return (
    <div role="status" className={cx("flex items-center justify-center gap-2 py-10 text-sm text-muted", className)}>
      <Loader2 size={18} className="animate-spin" aria-hidden />
      {label}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="mb-8">
      {eyebrow ? <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-brand-600">{eyebrow}</p> : null}
      <h1 className="text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">{title}</h1>
      {description ? <p className="mt-3 max-w-2xl text-lg text-muted text-pretty">{description}</p> : null}
      {children}
    </header>
  );
}

export function Breadcrumb({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav aria-label="Đường dẫn" className="mb-4 text-sm text-muted">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-1.5">
            {index > 0 ? <span aria-hidden>/</span> : null}
            {item.href ? (
              <Link href={item.href} className="hover:text-brand-700 hover:underline">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-medium text-ink">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function EmptyState({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="card px-6 py-10 text-center">
      <p className="text-lg font-semibold">{title}</p>
      {children ? <div className="mt-2 text-muted">{children}</div> : null}
    </div>
  );
}

export function Notice({ kind = "info", children }: { kind?: "info" | "good" | "bad" | "warn"; children: React.ReactNode }) {
  const styles = {
    info: "border-brand-200 bg-brand-50 text-brand-900",
    good: "border-good-600/30 bg-good-50 text-good-700",
    bad: "border-bad-600/30 bg-bad-50 text-bad-700",
    warn: "border-sun-400 bg-sun-50 text-sun-700",
  } as const;
  return (
    <div role={kind === "bad" ? "alert" : undefined} className={cx("rounded-xl border-[1.5px] px-4 py-3 text-sm", styles[kind])}>
      {children}
    </div>
  );
}

/** Hiện với giáo viên / admin khi họ xem trước một bài chưa xuất bản. */
export function DraftBanner() {
  return (
    <div className="mb-4">
      <Notice kind="warn">
        <strong>Bản nháp.</strong> Chỉ giáo viên và quản trị viên thấy trang này. Hãy bật “Xuất bản” trong trang quản trị để người học nhìn thấy.
      </Notice>
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: (props: { id: string; "aria-describedby"?: string }) => React.ReactNode;
  className?: string;
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      {children({ id, "aria-describedby": hint ? hintId : undefined })}
      {hint ? (
        <p id={hintId} className="field-hint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Hộp thoại dùng thẻ <dialog> gốc: có sẵn bẫy focus, phím Esc và lớp nền. */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** Thanh nút cố định ở đáy hộp thoại (không cuộn theo nội dung) — dùng cho biểu mẫu dài. */
  footer?: React.ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      className={cx(
        "m-auto w-[calc(100%-2rem)] rounded-2xl border-[1.5px] border-line bg-white p-0 text-ink shadow-2xl backdrop:bg-ink/50",
        wide ? "max-w-3xl" : "max-w-lg",
      )}
    >
      {open ? (
        <div className="flex max-h-[85vh] flex-col">
          <div className="flex items-start justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6">
            <h2 className="text-xl font-bold">{title}</h2>
            <button type="button" onClick={onClose} className="btn btn-ghost btn-sm -mr-2 -mt-1" aria-label="Đóng">
              ✕
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-4 pb-5 sm:px-6 sm:pb-6">{children}</div>
          {footer ? <div className="border-t border-line px-5 py-3 sm:px-6">{footer}</div> : null}
        </div>
      ) : null}
    </dialog>
  );
}

export const formatVnd = (amount: number) => `${new Intl.NumberFormat("vi-VN").format(amount)} ₫`;

export const formatDateTime = (iso: string) =>
  new Intl.DateTimeFormat("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(
    new Date(iso),
  );

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(iso));

/** Chỉ cho phép link http(s) do admin nhập hiển thị thành thẻ <a>. */
export function safeUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return /^https?:\/\/[^\s]+$/i.test(trimmed) ? trimmed : null;
}
