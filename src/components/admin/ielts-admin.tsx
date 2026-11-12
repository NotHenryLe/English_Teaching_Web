"use client";

import { ExternalLink, ListOrdered, Pencil, Plus, Trash2, Upload } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";
import { FIXED_OPTIONS, SKILL_LABEL, splitOption } from "@/lib/ielts";
import type { IeltsAnswerKey, IeltsContent, IeltsGroupKind, IeltsSkill, IeltsTest, IeltsTestSummary, TranscriptLine } from "@/lib/types";
import { EmptyState, Modal, Notice, Spinner, safeUrl } from "../ui";
import { ArrayEditor, TextField, Toggle, check, linesOf, slugify, useAction, useLoad } from "./common";

interface QuestionDraft {
  n: number;
  prompt: string;
  optionsText: string;
  acceptText: string;
  explain: string;
}

interface GroupDraft {
  kind: IeltsGroupKind;
  instructions: string;
  optionsText: string;
  questions: QuestionDraft[];
}

interface SectionDraft {
  title: string;
  instructions: string;
  passageTitle: string;
  passage: string;
  audioUrl: string;
  transcriptText: string;
  groups: GroupDraft[];
}

export interface IeltsDraft {
  id?: string;
  slug: string;
  title: string;
  skill: IeltsSkill;
  description_vi: string;
  duration_minutes: number;
  sort_order: number;
  published: boolean;
  sections: SectionDraft[];
}

const KIND_LABEL: Record<IeltsGroupKind, string> = {
  choice: "Trắc nghiệm (A, B, C…)",
  tfng: "True / False / Not Given",
  ynng: "Yes / No / Not Given",
  fill: "Điền từ",
  match: "Nối / chọn từ danh sách",
};

const parseTranscript = (value: string): TranscriptLine[] =>
  linesOf(value).map((line) => {
    const at = line.indexOf(":");
    return at > 0 && at <= 30 ? { speaker: line.slice(0, at).trim(), text: line.slice(at + 1).trim() } : { speaker: "Speaker", text: line };
  });

export function draftFromTest(test: IeltsTest, key: IeltsAnswerKey): IeltsDraft {
  return {
    id: test.id,
    slug: test.slug,
    title: test.title,
    skill: test.skill,
    description_vi: test.description_vi,
    duration_minutes: test.duration_minutes,
    sort_order: test.sort_order,
    published: test.published,
    sections: test.content.sections.map((section) => ({
      title: section.title,
      instructions: section.instructions ?? "",
      passageTitle: section.passageTitle ?? "",
      passage: section.passage ?? "",
      audioUrl: section.audioUrl ?? "",
      transcriptText: (section.transcript ?? []).map((line) => `${line.speaker}: ${line.text}`).join("\n"),
      groups: section.groups.map((group) => ({
        kind: group.kind,
        instructions: group.instructions,
        optionsText: (group.options ?? []).join("\n"),
        questions: group.questions.map((question) => ({
          n: question.n,
          prompt: question.prompt,
          optionsText: (question.options ?? []).join("\n"),
          acceptText: (key[question.n]?.accept ?? []).join("\n"),
          explain: key[question.n]?.explain ?? "",
        })),
      })),
    })),
  };
}

export function draftToPayload(draft: IeltsDraft): { content: IeltsContent; key: IeltsAnswerKey } {
  const key: IeltsAnswerKey = {};
  const content: IeltsContent = {
    sections: draft.sections.map((section) => ({
      title: section.title.trim(),
      ...(section.instructions.trim() ? { instructions: section.instructions.trim() } : {}),
      ...(draft.skill === "reading"
        ? { passageTitle: section.passageTitle.trim(), passage: section.passage.trim() }
        : {
            ...(section.audioUrl.trim() ? { audioUrl: section.audioUrl.trim() } : {}),
            transcript: parseTranscript(section.transcriptText),
          }),
      groups: section.groups.map((group) => ({
        kind: group.kind,
        instructions: group.instructions.trim(),
        ...(group.kind === "match" ? { options: linesOf(group.optionsText) } : {}),
        questions: group.questions.map((question) => {
          key[question.n] = { accept: linesOf(question.acceptText), explain: question.explain.trim() };
          return {
            n: question.n,
            prompt: question.prompt.trim(),
            ...(group.kind === "choice" ? { options: linesOf(question.optionsText) } : {}),
          };
        }),
      })),
    })),
  };
  return { content, key };
}

/** Trả về lỗi đầu tiên tìm thấy trong đề (chuỗi rỗng nếu hợp lệ). */
export function validateIeltsDraft(draft: IeltsDraft): string {
  if (!draft.title.trim()) return "Hãy nhập tên đề.";
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(draft.slug.trim())) return "Slug chỉ gồm chữ thường không dấu, số và dấu gạch ngang.";
  if (!(draft.duration_minutes >= 1 && draft.duration_minutes <= 240)) return "Thời gian làm bài phải từ 1 đến 240 phút.";
  if (!draft.sections.length) return "Đề cần ít nhất một phần.";
  const seen = new Set<number>();
  for (const [sectionIndex, section] of draft.sections.entries()) {
    const where = section.title.trim() || `Phần ${sectionIndex + 1}`;
    if (!section.title.trim()) return `Phần ${sectionIndex + 1}: chưa có tên phần.`;
    if (draft.skill === "reading" && !section.passage.trim()) return `${where}: chưa có bài đọc.`;
    if (draft.skill === "listening" && !section.audioUrl.trim() && !section.transcriptText.trim()) return `${where}: cần file nghe hoặc lời thoại (transcript).`;
    if (section.audioUrl.trim() && !safeUrl(section.audioUrl)) return `${where}: link file nghe phải bắt đầu bằng https://`;
    if (!section.groups.length) return `${where}: chưa có nhóm câu hỏi nào.`;
    for (const group of section.groups) {
      if (!group.questions.length) return `${where}: có nhóm câu hỏi chưa có câu nào.`;
      const shared = linesOf(group.optionsText);
      if (group.kind === "match") {
        if (shared.length < 2) return `${where}: nhóm nối cần ít nhất 2 lựa chọn dùng chung.`;
        if (shared.some((option) => !splitOption(option).text)) return `${where}: mỗi lựa chọn phải có dạng “A. nội dung”.`;
      }
      for (const question of group.questions) {
        const label = `Câu ${question.n}`;
        if (!Number.isInteger(question.n) || question.n < 1) return `${where}: số thứ tự câu hỏi phải là số nguyên dương.`;
        if (seen.has(question.n)) return `${label}: số thứ tự bị trùng. Hãy bấm “Đánh số lại”.`;
        seen.add(question.n);
        if (!question.prompt.trim()) return `${label}: chưa có nội dung câu hỏi.`;
        const accept = linesOf(question.acceptText);
        if (!accept.length) return `${label}: chưa có đáp án.`;
        const fixed = FIXED_OPTIONS[group.kind];
        if (fixed && (accept.length !== 1 || !fixed.includes(accept[0].toUpperCase()))) return `${label}: đáp án phải là một trong: ${fixed.join(", ")}.`;
        if (group.kind === "choice" || group.kind === "match") {
          const options = group.kind === "choice" ? linesOf(question.optionsText) : shared;
          if (group.kind === "choice") {
            if (options.length < 2) return `${label}: cần ít nhất 2 lựa chọn.`;
            if (options.some((option) => !splitOption(option).text)) return `${label}: mỗi lựa chọn phải có dạng “A. nội dung”.`;
          }
          const labels = options.map((option) => splitOption(option).label);
          if (new Set(labels).size !== labels.length) return `${label}: nhãn lựa chọn bị trùng.`;
          if (accept.length !== 1 || !labels.includes(accept[0])) return `${label}: đáp án phải là nhãn của một lựa chọn (ví dụ: ${labels[0]}).`;
        }
      }
    }
  }
  return "";
}

function renumber(draft: IeltsDraft): IeltsDraft {
  let next = 1;
  return {
    ...draft,
    sections: draft.sections.map((section) => ({
      ...section,
      groups: section.groups.map((group) => ({ ...group, questions: group.questions.map((question) => ({ ...question, n: next++ })) })),
    })),
  };
}

const maxNumber = (draft: IeltsDraft) => Math.max(0, ...draft.sections.flatMap((section) => section.groups.flatMap((group) => group.questions.map((question) => question.n))));

const questionCount = (draft: IeltsDraft) => draft.sections.reduce((sum, section) => sum + section.groups.reduce((inner, group) => inner + group.questions.length, 0), 0);

const newSection = (skill: IeltsSkill, index: number): SectionDraft => ({
  title: skill === "reading" ? `Reading Passage ${index + 1}` : `Part ${index + 1}`,
  instructions: "",
  passageTitle: "",
  passage: "",
  audioUrl: "",
  transcriptText: "",
  groups: [],
});

export function IeltsAdmin() {
  const tests = useLoad(async (db) =>
    check<IeltsTestSummary[]>(await db.from("ielts_tests").select("id, slug, title, skill, description_vi, duration_minutes, question_count, sort_order, published").order("sort_order").order("title")),
  );
  const { busy, run } = useAction();
  const [draft, setDraft] = useState<IeltsDraft | null>(null);
  const [problem, setProblem] = useState("");
  const formId = useId();

  if (tests.error && !tests.data) return <Notice kind="bad">{tests.error}</Notice>;
  if (!tests.data) return <Spinner />;

  const openNew = (skill: IeltsSkill) => {
    setProblem("");
    setDraft({
      slug: "",
      title: "",
      skill,
      description_vi: "",
      duration_minutes: skill === "reading" ? 60 : 30,
      sort_order: tests.data!.length + 1,
      published: false,
      sections: [newSection(skill, 0)],
    });
  };

  const openExisting = (id: string) =>
    run(async (db) => {
      const [test, key] = await Promise.all([db.from("ielts_tests").select("*").eq("id", id).single(), db.from("ielts_answer_keys").select("answers").eq("test_id", id).maybeSingle()]);
      setProblem("");
      setDraft(draftFromTest(check<IeltsTest>(test), check<{ answers: IeltsAnswerKey } | null>(key)?.answers ?? {}));
    });

  const save = async () => {
    if (!draft) return;
    const invalid = validateIeltsDraft(draft);
    setProblem(invalid);
    if (invalid) return;
    const { content, key } = draftToPayload(draft);
    const fields = {
      slug: draft.slug.trim(),
      title: draft.title.trim(),
      skill: draft.skill,
      description_vi: draft.description_vi.trim(),
      duration_minutes: draft.duration_minutes,
      sort_order: draft.sort_order,
      content,
    };
    const ok = await run(async (db) => {
      // Đề mới được lưu ở dạng nháp trước, có đáp án rồi mới xuất bản — tránh lúc đề hiện ra mà chưa chấm được.
      const row = check<{ id: string }>(
        draft.id
          ? await db.from("ielts_tests").update({ ...fields, published: draft.published }).eq("id", draft.id).select("id").single()
          : await db.from("ielts_tests").insert({ ...fields, published: false }).select("id").single(),
      );
      check(await db.from("ielts_answer_keys").upsert({ test_id: row.id, answers: key }).select("test_id").single());
      if (!draft.id && draft.published) check(await db.from("ielts_tests").update({ published: true }).eq("id", row.id).select("id").single());
    }, "Đã lưu đề thi.");
    if (ok) {
      setDraft(null);
      tests.reload();
    }
  };

  return (
    <div>
      <p className="mb-4 text-sm text-muted">
        Chỉ đăng nội dung do bạn tự biên soạn hoặc có quyền sử dụng — đề Cambridge IELTS và các đề thương mại khác có bản quyền. Đáp án được lưu riêng, người học chỉ
        thấy sau khi nộp bài.
      </p>
      <div className="mb-4 flex flex-wrap justify-end gap-2">
        <button type="button" className="btn btn-primary btn-sm" onClick={() => openNew("reading")}>
          <Plus size={16} aria-hidden /> Đề Reading
        </button>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => openNew("listening")}>
          <Plus size={16} aria-hidden /> Đề Listening
        </button>
      </div>

      {tests.data.length === 0 ? (
        <EmptyState title="Chưa có đề thi nào" />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Đề</th>
                <th scope="col">Kỹ năng</th>
                <th scope="col">Số câu</th>
                <th scope="col">Thời gian</th>
                <th scope="col">Trạng thái</th>
                <th scope="col">
                  <span className="sr-only">Thao tác</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {tests.data.map((test) => (
                <tr key={test.id}>
                  <td>
                    <strong lang="en">{test.title}</strong>
                    <span className="block text-xs text-muted">/ielts/{test.slug}</span>
                  </td>
                  <td>{SKILL_LABEL[test.skill]}</td>
                  <td className="tabular-nums">{test.question_count}</td>
                  <td className="whitespace-nowrap tabular-nums">{test.duration_minutes} phút</td>
                  <td>
                    <span className={test.published ? "chip chip-good" : "chip chip-gray"}>{test.published ? "Đã xuất bản" : "Nháp"}</span>
                  </td>
                  <td>
                    <span className="flex justify-end gap-1">
                      <Link href={`/ielts/${test.slug}`} target="_blank" className="btn btn-outline btn-sm" aria-label={`Xem đề ${test.title}`}>
                        <ExternalLink size={14} aria-hidden />
                      </Link>
                      <button type="button" className="btn btn-outline btn-sm" disabled={busy} onClick={() => void openExisting(test.id)}>
                        <Pencil size={14} aria-hidden /> Sửa
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        disabled={busy}
                        aria-label={`Xóa đề ${test.title}`}
                        onClick={() => {
                          if (window.confirm(`Xóa đề “${test.title}” cùng toàn bộ kết quả thi đã lưu của học viên cho đề này? Không thể hoàn tác.`)) {
                            void run(async (db) => check(await db.from("ielts_tests").delete().eq("id", test.id).select("id")), "Đã xóa đề thi.").then((ok) => ok && tests.reload());
                          }
                        }}
                      >
                        <Trash2 size={14} aria-hidden />
                      </button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {draft ? (
        <Modal
          open
          onClose={() => setDraft(null)}
          title={draft.id ? `Sửa đề: ${draft.title}` : `Đề ${SKILL_LABEL[draft.skill]} mới`}
          wide
          footer={
            <div className="grid gap-3">
              {problem ? <Notice kind="bad">{problem}</Notice> : null}
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-muted">{questionCount(draft)} câu hỏi</span>
                <span className="flex gap-2">
                  <button type="button" className="btn btn-outline" onClick={() => setDraft(null)}>
                    Đóng
                  </button>
                  <button type="submit" form={formId} className="btn btn-primary" disabled={busy}>
                    {busy ? "Đang lưu…" : "Lưu đề thi"}
                  </button>
                </span>
              </div>
            </div>
          }
        >
          <form
            id={formId}
            className="grid gap-6"
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              void save();
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Tên đề"
                lang="en"
                value={draft.title}
                onChange={(title) => setDraft({ ...draft, title, slug: draft.id ? draft.slug : slugify(title) })}
                maxLength={120}
                placeholder="Reading Practice Test 2"
              />
              <TextField label="Slug (đường dẫn)" value={draft.slug} onChange={(slug) => setDraft({ ...draft, slug: slug.toLowerCase() })} maxLength={80} />
              <TextField label="Thời gian làm bài (phút)" type="number" min={1} max={240} value={String(draft.duration_minutes)} onChange={(value) => setDraft({ ...draft, duration_minutes: Number(value) || 0 })} />
              <TextField label="Thứ tự hiển thị" type="number" value={String(draft.sort_order)} onChange={(value) => setDraft({ ...draft, sort_order: Number(value) || 0 })} />
            </div>
            <TextField label="Mô tả (tiếng Việt)" value={draft.description_vi} onChange={(description_vi) => setDraft({ ...draft, description_vi })} multiline rows={2} maxLength={500} />

            <fieldset>
              <legend className="mb-2 flex w-full items-center justify-between gap-3 font-bold">
                <span>{draft.skill === "reading" ? "Các bài đọc" : "Các phần nghe"}</span>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setDraft(renumber(draft))}>
                  <ListOrdered size={15} aria-hidden /> Đánh số lại từ 1
                </button>
              </legend>
              <ArrayEditor
                items={draft.sections}
                onChange={(sections) => setDraft({ ...draft, sections })}
                create={() => newSection(draft.skill, draft.sections.length)}
                addLabel={draft.skill === "reading" ? "Thêm bài đọc" : "Thêm phần nghe"}
                itemLabel={(index) => draft.sections[index]?.title || `Phần ${index + 1}`}
                render={(section, updateSection) => (
                  <div className="grid gap-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <TextField label="Tên phần" lang="en" value={section.title} onChange={(title) => updateSection({ title })} />
                      {draft.skill === "reading" ? (
                        <TextField label="Tiêu đề bài đọc" lang="en" value={section.passageTitle} onChange={(passageTitle) => updateSection({ passageTitle })} />
                      ) : null}
                    </div>
                    <TextField label="Hướng dẫn chung của phần" lang="en" value={section.instructions} onChange={(instructions) => updateSection({ instructions })} />
                    {draft.skill === "reading" ? (
                      <TextField
                        label="Bài đọc"
                        lang="en"
                        value={section.passage}
                        onChange={(passage) => updateSection({ passage })}
                        multiline
                        rows={10}
                        hint="Để một dòng trống giữa các đoạn. Muốn đánh nhãn đoạn (cho dạng nối tiêu đề), bắt đầu đoạn bằng [A], [B]…"
                      />
                    ) : (
                      <>
                        <AudioField value={section.audioUrl} onChange={(audioUrl) => updateSection({ audioUrl })} folder={draft.slug || "draft"} />
                        <TextField
                          label="Lời thoại (transcript)"
                          lang="en"
                          value={section.transcriptText}
                          onChange={(transcriptText) => updateSection({ transcriptText })}
                          multiline
                          rows={8}
                          hint="Mỗi dòng một lượt nói, dạng “Tên người nói: câu nói”. Nếu chưa có file nghe, trình duyệt sẽ đọc lời thoại này bằng giọng máy. Người học chỉ xem được sau khi nộp bài."
                        />
                      </>
                    )}

                    <p className="mt-1 text-sm font-bold">Nhóm câu hỏi</p>
                    <ArrayEditor
                      items={section.groups}
                      onChange={(groups) => updateSection({ groups })}
                      create={() => ({ kind: "choice" as const, instructions: "", optionsText: "", questions: [] })}
                      addLabel="Thêm nhóm câu hỏi"
                      itemLabel={(index) => `Nhóm ${index + 1}`}
                      render={(group, updateGroup) => (
                        <div className="grid gap-3">
                          <div className="grid gap-3 sm:grid-cols-[15rem_1fr]">
                            <label className="block">
                              <span className="field-label">Dạng câu hỏi</span>
                              <select className="input" value={group.kind} onChange={(event) => updateGroup({ kind: event.target.value as IeltsGroupKind })}>
                                {(Object.keys(KIND_LABEL) as IeltsGroupKind[]).map((kind) => (
                                  <option key={kind} value={kind}>
                                    {KIND_LABEL[kind]}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <TextField label="Yêu cầu của nhóm" lang="en" value={group.instructions} onChange={(instructions) => updateGroup({ instructions })} placeholder="Questions 1–5. Choose the correct letter, A, B or C." />
                          </div>
                          {group.kind === "match" ? (
                            <TextField
                              label="Danh sách lựa chọn dùng chung"
                              lang="en"
                              value={group.optionsText}
                              onChange={(optionsText) => updateGroup({ optionsText })}
                              multiline
                              rows={4}
                              hint="Mỗi dòng một lựa chọn, dạng “A. nội dung” hoặc “i. nội dung”."
                            />
                          ) : null}
                          <ArrayEditor
                            items={group.questions}
                            onChange={(questions) => updateGroup({ questions })}
                            create={() => ({ n: maxNumber(draft) + 1, prompt: "", optionsText: "", acceptText: "", explain: "" })}
                            addLabel="Thêm câu hỏi"
                            itemLabel={(index) => `Câu ${group.questions[index]?.n ?? index + 1}`}
                            render={(question, updateQuestion) => (
                              <div className="grid gap-3">
                                <div className="grid gap-3 sm:grid-cols-[6rem_1fr]">
                                  <TextField label="Số câu" type="number" min={1} value={String(question.n)} onChange={(value) => updateQuestion({ n: Number(value) || 0 })} />
                                  <TextField
                                    label="Nội dung câu hỏi"
                                    lang="en"
                                    value={question.prompt}
                                    onChange={(prompt) => updateQuestion({ prompt })}
                                    hint={group.kind === "fill" ? "Dùng ________ (8 dấu gạch dưới) cho chỗ trống." : undefined}
                                  />
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2">
                                  {group.kind === "choice" ? (
                                    <TextField label="Các lựa chọn" lang="en" value={question.optionsText} onChange={(optionsText) => updateQuestion({ optionsText })} multiline rows={4} hint="Mỗi dòng dạng “A. nội dung”." />
                                  ) : null}
                                  <TextField
                                    label="Đáp án"
                                    lang="en"
                                    value={question.acceptText}
                                    onChange={(acceptText) => updateQuestion({ acceptText })}
                                    multiline
                                    rows={group.kind === "fill" ? 3 : 1}
                                    hint={
                                      group.kind === "fill"
                                        ? "Mỗi dòng một cách viết được chấp nhận (ví dụ: 9 / 9th / ninth)."
                                        : group.kind === "tfng"
                                          ? "TRUE, FALSE hoặc NOT GIVEN"
                                          : group.kind === "ynng"
                                            ? "YES, NO hoặc NOT GIVEN"
                                            : "Chỉ ghi nhãn, ví dụ: B"
                                    }
                                  />
                                </div>
                                <TextField label="Giải thích (hiện sau khi nộp bài)" value={question.explain} onChange={(explain) => updateQuestion({ explain })} />
                              </div>
                            )}
                          />
                        </div>
                      )}
                    />
                  </div>
                )}
              />
            </fieldset>

            <Toggle checked={draft.published} onChange={(published) => setDraft({ ...draft, published })} label="Xuất bản (người học nhìn thấy)" />

          </form>
        </Modal>
      ) : null}
    </div>
  );
}

function AudioField({ value, onChange, folder }: { value: string; onChange: (value: string) => void; folder: string }) {
  const { busy, run } = useAction();
  const url = safeUrl(value);

  const upload = async (file: File) => {
    if (file.size > 50 * 1024 * 1024) {
      window.alert("File quá lớn. Dung lượng tối đa là 50 MB — hãy nén file sang MP3 chất lượng 96–128 kbps.");
      return;
    }
    const extension = (file.name.split(".").pop() ?? "mp3").toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = `${folder.replace(/[^a-z0-9-]/g, "") || "draft"}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension || "mp3"}`;
    await run(async (db) => {
      const { error } = await db.storage.from("ielts-audio").upload(path, file, { contentType: file.type || "audio/mpeg", cacheControl: "31536000" });
      if (error) throw error;
      onChange(db.storage.from("ielts-audio").getPublicUrl(path).data.publicUrl);
    }, "Đã tải file nghe lên. Nhớ bấm “Lưu đề thi”.");
  };

  return (
    <div>
      <span className="field-label">File nghe (không bắt buộc)</span>
      <div className="flex flex-wrap items-center gap-2">
        <label className={`btn btn-outline btn-sm ${busy ? "pointer-events-none opacity-60" : ""}`}>
          <Upload size={15} aria-hidden /> {busy ? "Đang tải lên…" : "Tải file âm thanh"}
          <input
            type="file"
            accept="audio/*"
            className="sr-only"
            disabled={busy}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) void upload(file);
            }}
          />
        </label>
        <input className="input !min-h-9 min-w-0 flex-1 !py-1 !text-sm" value={value} onChange={(event) => onChange(event.target.value)} placeholder="hoặc dán link file .mp3 (https://…)" aria-label="Link file nghe" />
        {value ? (
          <button type="button" className="btn btn-ghost btn-sm text-bad-700" onClick={() => onChange("")}>
            Gỡ
          </button>
        ) : null}
      </div>
      {url ? <audio controls preload="none" src={url} className="mt-2 h-10 w-full" /> : null}
      <p className="field-hint">MP3 hoặc M4A, tối đa 50 MB. Để trống thì phần này được đọc bằng giọng máy từ lời thoại bên dưới.</p>
    </div>
  );
}
