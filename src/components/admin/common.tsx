"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { describeError, getSupabase } from "@/lib/supabase";
import { useToast } from "../providers";
import { cx } from "../ui";

/** Ném lỗi nếu truy vấn Supabase thất bại, ngược lại trả về dữ liệu đã ép kiểu. */
export function check<T>(result: { data: unknown; error: unknown }): T {
  if (result.error) throw result.error;
  return result.data as T;
}

/** Nạp dữ liệu cho một màn quản trị. Gọi reload() sau mỗi lần ghi để thấy dữ liệu mới. */
export function useLoad<T>(loader: (db: SupabaseClient) => Promise<T>, key = "") {
  const [state, setState] = useState<{ key: string; data: T | null; error: string }>({ key, data: null, error: "" });
  const [version, setVersion] = useState(0);
  const loaderRef = useRef(loader);
  useEffect(() => {
    loaderRef.current = loader;
  });

  useEffect(() => {
    const db = getSupabase();
    if (!db) return;
    let cancelled = false;
    loaderRef
      .current(db)
      .then((data) => {
        if (!cancelled) setState({ key, data, error: "" });
      })
      .catch((error: unknown) => {
        if (!cancelled) setState((current) => ({ key, data: current.key === key ? current.data : null, error: describeError(error) }));
      });
    return () => {
      cancelled = true;
    };
  }, [key, version]);

  const current = state.key === key ? state : { data: null, error: "" };
  return { data: current.data, error: current.error, reload: () => setVersion((value) => value + 1) };
}

/** Chạy một thao tác ghi, hiện thông báo thành công / lỗi, trả về true nếu thành công. */
export function useAction() {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const run = async (action: (db: SupabaseClient) => Promise<unknown>, success?: string): Promise<boolean> => {
    const db = getSupabase();
    if (!db) return false;
    setBusy(true);
    try {
      await action(db);
      if (success) toast(success);
      return true;
    } catch (error) {
      toast(describeError(error), "error");
      return false;
    } finally {
      setBusy(false);
    }
  };
  return { busy, run };
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm font-semibold">
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span
        aria-hidden
        className={cx(
          "relative h-6 w-11 rounded-full transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-sun-400",
          checked ? "bg-good-600" : "bg-line",
        )}
      >
        <span className={cx("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", checked ? "left-[1.375rem]" : "left-0.5")} />
      </span>
      {label}
    </label>
  );
}

/** Danh sách lặp (công thức, bài tập, câu hỏi…): thêm, xóa, đổi thứ tự. */
export function ArrayEditor<T>({
  items,
  onChange,
  render,
  create,
  addLabel,
  itemLabel,
  className,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  render: (item: T, update: (patch: Partial<T>) => void, index: number) => React.ReactNode;
  create: () => T;
  addLabel: string;
  itemLabel: (index: number) => string;
  className?: string;
}) {
  const move = (index: number, step: number) => {
    const target = index + step;
    if (target < 0 || target >= items.length) return;
    const copy = [...items];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    onChange(copy);
  };
  return (
    <div className={cx("grid gap-3", className)}>
      {items.map((item, index) => (
        <div key={index} className="rounded-xl border-[1.5px] border-line bg-paper/60 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">{itemLabel(index)}</span>
            <span className="flex gap-1">
              <button type="button" className="btn btn-ghost btn-sm !min-h-8 !px-2" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Đưa ${itemLabel(index)} lên`}>
                <ArrowUp size={15} aria-hidden />
              </button>
              <button type="button" className="btn btn-ghost btn-sm !min-h-8 !px-2" onClick={() => move(index, 1)} disabled={index === items.length - 1} aria-label={`Đưa ${itemLabel(index)} xuống`}>
                <ArrowDown size={15} aria-hidden />
              </button>
              <button type="button" className="btn btn-ghost btn-sm !min-h-8 !px-2 text-bad-700" onClick={() => onChange(items.filter((_, i) => i !== index))} aria-label={`Xóa ${itemLabel(index)}`}>
                <Trash2 size={15} aria-hidden />
              </button>
            </span>
          </div>
          {render(item, (patch) => onChange(items.map((current, i) => (i === index ? { ...current, ...patch } : current))), index)}
        </div>
      ))}
      <div>
        <button type="button" className="btn btn-outline btn-sm" onClick={() => onChange([...items, create()])}>
          <Plus size={15} aria-hidden /> {addLabel}
        </button>
      </div>
    </div>
  );
}

/** Ô nhập có nhãn gọn cho các biểu mẫu quản trị dày đặc. */
export function TextField({
  label,
  value,
  onChange,
  multiline,
  rows = 3,
  className,
  hint,
  ...rest
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  rows?: number;
  className?: string;
  hint?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "className" | "id">) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          className="input"
          rows={rows}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          lang={rest.lang}
          placeholder={rest.placeholder}
          maxLength={rest.maxLength}
          aria-describedby={hintId}
        />
      ) : (
        <input id={id} className="input" value={value} onChange={(event) => onChange(event.target.value)} aria-describedby={hintId} {...rest} />
      )}
      {hint ? (
        <p id={hintId} className="field-hint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export const linesOf = (value: string) =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
