"use client";

import { BookOpenText, Clock, Headphones, ListChecks } from "lucide-react";
import Link from "next/link";
import { SKILL_LABEL } from "@/lib/ielts";
import { fetchIeltsTests } from "@/lib/queries";
import type { IeltsSkill, IeltsTestSummary } from "@/lib/types";
import { useLive } from "./providers";
import { EmptyState } from "./ui";

export function IeltsTestList({ initial }: { initial: IeltsTestSummary[] }) {
  const { data: tests } = useLive(initial, fetchIeltsTests, "ielts-tests");
  if (!tests.length) return <EmptyState title="Chưa có đề thi nào">Đề thi đang được biên soạn. Bạn quay lại sau nhé.</EmptyState>;

  const skills: IeltsSkill[] = ["listening", "reading"];
  return (
    <div className="grid gap-10">
      {skills.map((skill) => {
        const items = tests.filter((test) => test.skill === skill);
        if (!items.length) return null;
        const Icon = skill === "listening" ? Headphones : BookOpenText;
        return (
          <section key={skill} aria-labelledby={`ky-nang-${skill}`}>
            <h2 id={`ky-nang-${skill}`} className="mb-4 flex items-center gap-2 text-xl font-bold">
              <Icon size={22} className="text-brand-600" aria-hidden />
              {SKILL_LABEL[skill]}
            </h2>
            <ul className="grid gap-4 md:grid-cols-2">
              {items.map((test) => (
                <li key={test.id} className="card flex flex-col p-5">
                  <h3 lang="en" className="text-lg font-bold">
                    {test.title}
                  </h3>
                  <p className="mt-1 flex-1 text-sm text-muted">{test.description_vi}</p>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="flex gap-4 text-sm font-medium">
                      <span className="flex items-center gap-1.5">
                        <Clock size={16} aria-hidden /> {test.duration_minutes} phút
                      </span>
                      <span className="flex items-center gap-1.5">
                        <ListChecks size={16} aria-hidden /> {test.question_count} câu
                      </span>
                    </p>
                    <Link href={`/ielts/${test.slug}`} className="btn btn-primary btn-sm">
                      Làm bài
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
