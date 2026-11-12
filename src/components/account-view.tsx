"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SKILL_LABEL } from "@/lib/ielts";
import { describeError, getSupabase } from "@/lib/supabase";
import type { IeltsSkill, Role } from "@/lib/types";
import { MyCallanSection } from "./callan-views";
import { useAuth, useToast } from "./providers";
import { Field, Notice, PageHeader, Spinner, formatDate } from "./ui";

export const ROLE_LABEL: Record<Role, string> = { student: "Học viên", teacher: "Giáo viên", admin: "Quản trị viên" };

export interface ExerciseAttemptRow {
  id: string;
  user_id: string;
  score: number;
  total: number;
  created_at: string;
  tenses: { name_vi: string; slug: string } | null;
}

export interface IeltsAttemptRow {
  id: string;
  user_id: string;
  correct: number;
  total: number;
  band: number;
  created_at: string;
  duration_seconds: number | null;
  ielts_tests: { title: string; slug: string; skill: IeltsSkill } | null;
}

export const EXERCISE_ATTEMPT_COLUMNS = "id, user_id, score, total, created_at, tenses(name_vi, slug)";
export const IELTS_ATTEMPT_COLUMNS = "id, user_id, correct, total, band, created_at, duration_seconds, ielts_tests(title, slug, skill)";

export function AccountView() {
  const { user, profile } = useAuth();
  if (!user) return null;
  return (
    <div className="container-page max-w-4xl py-10">
      <PageHeader title={`Xin chào${profile?.full_name ? `, ${profile.full_name}` : ""}!`} description="Hồ sơ, lớp học và tiến độ học tập của bạn.">
        <p className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="chip">{ROLE_LABEL[profile?.role ?? "student"]}</span>
          <span className="text-muted">{user.email}</span>
          {profile?.role === "admin" ? (
            <Link href="/quan-tri" className="font-semibold text-brand-700 hover:underline">
              Mở trang quản trị →
            </Link>
          ) : null}
          {profile?.role === "teacher" ? (
            <Link href="/giao-vien" className="font-semibold text-brand-700 hover:underline">
              Mở trang giáo viên →
            </Link>
          ) : null}
        </p>
      </PageHeader>

      <section aria-labelledby="lop-callan" className="mb-10">
        <h2 id="lop-callan" className="mb-3 text-xl font-bold">
          Lớp Callan của tôi
        </h2>
        <MyCallanSection />
      </section>

      <section aria-labelledby="tien-do" className="mb-10">
        <h2 id="tien-do" className="mb-3 text-xl font-bold">
          Tiến độ học
        </h2>
        <Progress userId={user.id} />
      </section>

      <section aria-labelledby="ho-so">
        <h2 id="ho-so" className="mb-3 text-xl font-bold">
          Hồ sơ
        </h2>
        <ProfileForm key={profile?.id ?? "none"} />
      </section>
    </div>
  );
}

function ProfileForm() {
  const { user, profile, refreshProfile } = useAuth();
  const toast = useToast();
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const db = getSupabase();
    if (!db || !user) return;
    setBusy(true);
    const { error } = await db.from("profiles").update({ full_name: fullName.trim(), phone: phone.trim() }).eq("id", user.id);
    setBusy(false);
    if (error) return toast(describeError(error), "error");
    await refreshProfile();
    toast("Đã lưu hồ sơ.");
  };

  return (
    <form onSubmit={submit} className="card grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
      <Field label="Họ và tên">
        {(props) => <input {...props} className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={120} autoComplete="name" />}
      </Field>
      <Field label="Số điện thoại">
        {(props) => <input {...props} className="input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={30} autoComplete="tel" />}
      </Field>
      <Field label="Email đăng nhập" hint="Email không đổi được tại đây." className="sm:col-span-2">
        {(props) => <input {...props} className="input" value={user?.email ?? ""} readOnly disabled />}
      </Field>
      <div className="sm:col-span-2">
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? "Đang lưu…" : "Lưu hồ sơ"}
        </button>
      </div>
    </form>
  );
}

function Progress({ userId }: { userId: string }) {
  const [data, setData] = useState<{ exercises: ExerciseAttemptRow[]; ielts: IeltsAttemptRow[] } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const db = getSupabase();
    if (!db) return;
    let cancelled = false;
    void Promise.all([
      db.from("exercise_attempts").select(EXERCISE_ATTEMPT_COLUMNS).eq("user_id", userId).order("created_at", { ascending: false }).limit(300),
      db.from("ielts_attempts").select(IELTS_ATTEMPT_COLUMNS).eq("user_id", userId).order("created_at", { ascending: false }).limit(50),
    ]).then(([exercises, ielts]) => {
      if (cancelled) return;
      const failure = exercises.error ?? ielts.error;
      if (failure) return setError(describeError(failure));
      setData({ exercises: (exercises.data ?? []) as unknown as ExerciseAttemptRow[], ielts: (ielts.data ?? []) as unknown as IeltsAttemptRow[] });
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (error) return <Notice kind="bad">{error}</Notice>;
  if (!data) return <Spinner />;

  // Gom điểm bài tập theo từng thì: số lần làm, điểm cao nhất, lần gần nhất.
  const byTense = new Map<string, { name: string; slug: string; attempts: number; best: number; total: number; last: string }>();
  for (const attempt of data.exercises) {
    if (!attempt.tenses) continue;
    const entry = byTense.get(attempt.tenses.slug);
    if (!entry) {
      byTense.set(attempt.tenses.slug, { name: attempt.tenses.name_vi, slug: attempt.tenses.slug, attempts: 1, best: attempt.score, total: attempt.total, last: attempt.created_at });
    } else {
      entry.attempts++;
      if (attempt.score / attempt.total > entry.best / entry.total) {
        entry.best = attempt.score;
        entry.total = attempt.total;
      }
    }
  }
  const tenses = [...byTense.values()];

  return (
    <div className="grid gap-6">
      <div>
        <h3 className="mb-2 font-semibold">Bài tập ngữ pháp</h3>
        {tenses.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Thì</th>
                  <th scope="col">Điểm cao nhất</th>
                  <th scope="col">Số lần làm</th>
                  <th scope="col">Lần gần nhất</th>
                </tr>
              </thead>
              <tbody>
                {tenses.map((item) => (
                  <tr key={item.slug}>
                    <td>
                      <Link href={`/ngu-phap/${item.slug}`} className="font-semibold text-brand-700 hover:underline">
                        {item.name}
                      </Link>
                    </td>
                    <td className="font-semibold tabular-nums">
                      {item.best}/{item.total}
                    </td>
                    <td className="tabular-nums">{item.attempts}</td>
                    <td>{formatDate(item.last)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted">
            Bạn chưa làm bài tập nào.{" "}
            <Link href="/ngu-phap" className="font-semibold text-brand-700 hover:underline">
              Học 12 thì
            </Link>
          </p>
        )}
      </div>
      <div>
        <h3 className="mb-2 font-semibold">Thi thử IELTS</h3>
        {data.ielts.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Đề</th>
                  <th scope="col">Kỹ năng</th>
                  <th scope="col">Số câu đúng</th>
                  <th scope="col">Band</th>
                  <th scope="col">Ngày làm</th>
                </tr>
              </thead>
              <tbody>
                {data.ielts.map((attempt) => (
                  <tr key={attempt.id}>
                    <td lang="en">
                      {attempt.ielts_tests ? (
                        <Link href={`/ielts/${attempt.ielts_tests.slug}`} className="font-semibold text-brand-700 hover:underline">
                          {attempt.ielts_tests.title}
                        </Link>
                      ) : (
                        "(đề đã xóa)"
                      )}
                    </td>
                    <td>{attempt.ielts_tests ? SKILL_LABEL[attempt.ielts_tests.skill] : ""}</td>
                    <td className="tabular-nums">
                      {attempt.correct}/{attempt.total}
                    </td>
                    <td className="font-bold tabular-nums">{Number(attempt.band).toFixed(1)}</td>
                    <td>{formatDate(attempt.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted">
            Bạn chưa thi thử lần nào.{" "}
            <Link href="/ielts" className="font-semibold text-brand-700 hover:underline">
              Thi thử IELTS
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
