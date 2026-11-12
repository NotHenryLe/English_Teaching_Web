"use client";

import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";
import type { Tense, TenseExercise, TenseFormula, TenseUsage, TimeGroup, VocabTopic, VocabWord } from "@/lib/types";
import { EmptyState, Modal, Notice, SpeakButton, Spinner, cx } from "../ui";
import { ArrayEditor, TextField, Toggle, check, linesOf, slugify, useAction, useLoad } from "./common";

const PublishNote = () => (
  <p className="mb-4 text-sm text-muted">
    Thay đổi hiện ngay với người học khi họ mở trang. Bài mới thêm sẽ có đường dẫn riêng (tốt cho Google) sau lần triển khai web kế tiếp.
  </p>
);

// ---------------------------------------------------------------------------
// Từ vựng
// ---------------------------------------------------------------------------
type TopicDraft = Omit<VocabTopic, "id" | "word_count"> & { id?: string };
type WordDraft = Omit<VocabWord, "id"> & { id?: string };
const NEW_TOPIC: TopicDraft = { slug: "", title_en: "", title_vi: "", description_vi: "", icon: "📘", sort_order: 0, published: true };

export function VocabAdmin() {
  const topics = useLoad(async (db) => check<VocabTopic[]>(await db.from("vocab_topics").select("*").order("sort_order").order("title_en")));
  const [selected, setSelected] = useState<string | null>(null);
  const [editingTopic, setEditingTopic] = useState<TopicDraft | null>(null);
  const { busy, run } = useAction();

  if (topics.error && !topics.data) return <Notice kind="bad">{topics.error}</Notice>;
  if (!topics.data) return <Spinner />;

  const current = topics.data.find((topic) => topic.id === selected) ?? null;

  const saveTopic = async () => {
    if (!editingTopic) return;
    const { id, ...fields } = editingTopic;
    const payload = { ...fields, slug: fields.slug.trim() || slugify(fields.title_en), title_en: fields.title_en.trim(), title_vi: fields.title_vi.trim() };
    let savedId = id ?? null;
    const ok = await run(async (db) => {
      const row = check<{ id: string }>(id ? await db.from("vocab_topics").update(payload).eq("id", id).select("id").single() : await db.from("vocab_topics").insert(payload).select("id").single());
      savedId = row.id;
    }, "Đã lưu chủ đề.");
    if (ok) {
      setEditingTopic(null);
      setSelected(savedId);
      topics.reload();
    }
  };

  return (
    <div>
      <PublishNote />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[17rem_minmax(0,1fr)]">
        <aside>
          <button type="button" className="btn btn-primary btn-sm mb-3 w-full" onClick={() => setEditingTopic({ ...NEW_TOPIC, sort_order: topics.data!.length + 1 })}>
            <Plus size={16} aria-hidden /> Thêm chủ đề
          </button>
          <ul className="grid max-h-[70vh] gap-1.5 overflow-y-auto pr-1">
            {topics.data.map((topic) => (
              <li key={topic.id}>
                <button
                  type="button"
                  onClick={() => setSelected(topic.id)}
                  aria-current={selected === topic.id}
                  className={cx(
                    "flex w-full items-center gap-2.5 rounded-xl border-[1.5px] px-3 py-2 text-left text-sm font-semibold",
                    selected === topic.id ? "border-brand-500 bg-brand-50" : "border-line bg-white hover:border-brand-200",
                  )}
                >
                  <span aria-hidden className="text-xl">
                    {topic.icon}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{topic.title_vi}</span>
                  {!topic.published ? <span className="chip chip-gray">Nháp</span> : null}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="min-w-0">
          {current ? (
            <>
              <div className="card mb-4 flex flex-wrap items-start justify-between gap-3 p-4">
                <div>
                  <p className="text-lg font-bold">
                    {current.icon} {current.title_vi} <span className="font-normal text-muted">· {current.title_en}</span>
                  </p>
                  <p className="text-sm text-muted">
                    /tu-vung/{current.slug} · {current.published ? "Đã xuất bản" : "Bản nháp (người học chưa thấy)"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/tu-vung/${current.slug}`} className="btn btn-outline btn-sm" target="_blank">
                    <ExternalLink size={14} aria-hidden /> Xem
                  </Link>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditingTopic(current)}>
                    <Pencil size={14} aria-hidden /> Sửa chủ đề
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    disabled={busy}
                    onClick={() => {
                      if (window.confirm(`Xóa chủ đề “${current.title_vi}” cùng TẤT CẢ từ vựng trong đó? Không thể hoàn tác.`)) {
                        void run(async (db) => check(await db.from("vocab_topics").delete().eq("id", current.id).select("id")), "Đã xóa chủ đề.").then((ok) => {
                          if (ok) {
                            setSelected(null);
                            topics.reload();
                          }
                        });
                      }
                    }}
                  >
                    <Trash2 size={14} aria-hidden /> Xóa
                  </button>
                </div>
              </div>
              <WordsEditor key={current.id} topic={current} />
            </>
          ) : (
            <EmptyState title="Chọn một chủ đề ở bên trái">Hoặc bấm “Thêm chủ đề” để tạo chủ đề mới.</EmptyState>
          )}
        </section>
      </div>

      {editingTopic ? (
        <Modal open onClose={() => setEditingTopic(null)} title={editingTopic.id ? "Sửa chủ đề" : "Thêm chủ đề"}>
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              void saveTopic();
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Tên tiếng Việt" value={editingTopic.title_vi} onChange={(title_vi) => setEditingTopic({ ...editingTopic, title_vi })} required maxLength={80} />
              <TextField
                label="Tên tiếng Anh"
                lang="en"
                value={editingTopic.title_en}
                onChange={(title_en) => setEditingTopic({ ...editingTopic, title_en, slug: editingTopic.id ? editingTopic.slug : slugify(title_en) })}
                required
                maxLength={80}
              />
              <TextField
                label="Slug (đường dẫn)"
                value={editingTopic.slug}
                onChange={(slug) => setEditingTopic({ ...editingTopic, slug: slug.toLowerCase() })}
                required
                maxLength={80}
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                hint="Chữ thường không dấu, số, gạch ngang. Ví dụ: gia-dinh"
              />
              <TextField label="Biểu tượng (emoji)" value={editingTopic.icon} onChange={(icon) => setEditingTopic({ ...editingTopic, icon })} maxLength={8} />
            </div>
            <TextField label="Mô tả ngắn" value={editingTopic.description_vi} onChange={(description_vi) => setEditingTopic({ ...editingTopic, description_vi })} multiline maxLength={300} />
            <TextField label="Thứ tự hiển thị" type="number" value={String(editingTopic.sort_order)} onChange={(value) => setEditingTopic({ ...editingTopic, sort_order: Number(value) || 0 })} />
            <Toggle checked={editingTopic.published} onChange={(published) => setEditingTopic({ ...editingTopic, published })} label="Xuất bản (người học nhìn thấy)" />
            <div className="flex justify-end gap-2">
              <button type="button" className="btn btn-outline" onClick={() => setEditingTopic(null)}>
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

function WordsEditor({ topic }: { topic: VocabTopic }) {
  const words = useLoad(async (db) => check<VocabWord[]>(await db.from("vocab_words").select("*").eq("topic_id", topic.id).order("sort_order").order("word")), `words:${topic.id}`);
  const { busy, run } = useAction();
  const [editing, setEditing] = useState<WordDraft | null>(null);

  if (words.error && !words.data) return <Notice kind="bad">{words.error}</Notice>;
  if (!words.data) return <Spinner />;

  const blank = (): WordDraft => ({ topic_id: topic.id, word: "", ipa: "", part_of_speech: "n.", meaning_vi: "", example_en: "", example_vi: "", sort_order: (words.data?.length ?? 0) + 1 });

  const save = async (addAnother: boolean) => {
    if (!editing) return;
    const { id, ...fields } = editing;
    const payload = Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, typeof value === "string" ? value.trim() : value]));
    const ok = await run(
      async (db) => check(id ? await db.from("vocab_words").update(payload).eq("id", id).select("id").single() : await db.from("vocab_words").insert(payload).select("id").single()),
      "Đã lưu từ.",
    );
    if (ok) {
      words.reload();
      setEditing(addAnother ? { ...blank(), sort_order: fields.sort_order + 1, part_of_speech: fields.part_of_speech } : null);
    }
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-bold">{words.data.length} từ</h2>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => setEditing(blank())}>
          <Plus size={16} aria-hidden /> Thêm từ
        </button>
      </div>
      {words.data.length ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Từ</th>
                <th scope="col">Phiên âm</th>
                <th scope="col">Nghĩa</th>
                <th scope="col">Ví dụ</th>
                <th scope="col">
                  <span className="sr-only">Thao tác</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {words.data.map((word) => (
                <tr key={word.id}>
                  <td>
                    <span className="flex items-center gap-2">
                      <SpeakButton text={word.word} size="sm" />
                      <span>
                        <strong lang="en">{word.word}</strong> <span className="text-xs text-muted">{word.part_of_speech}</span>
                      </span>
                    </span>
                  </td>
                  <td className="ipa whitespace-nowrap">{word.ipa}</td>
                  <td>{word.meaning_vi}</td>
                  <td className="max-w-64 text-xs">
                    <span lang="en">{word.example_en}</span>
                    <span className="block text-muted">{word.example_vi}</span>
                  </td>
                  <td>
                    <span className="flex gap-1">
                      <button type="button" className="btn btn-ghost btn-sm !min-h-8 !px-2" onClick={() => setEditing(word)} aria-label={`Sửa từ ${word.word}`}>
                        <Pencil size={15} aria-hidden />
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm !min-h-8 !px-2 text-bad-700"
                        disabled={busy}
                        aria-label={`Xóa từ ${word.word}`}
                        onClick={() => {
                          if (window.confirm(`Xóa từ “${word.word}”?`)) {
                            void run(async (db) => check(await db.from("vocab_words").delete().eq("id", word.id).select("id")), "Đã xóa từ.").then((ok) => ok && words.reload());
                          }
                        }}
                      >
                        <Trash2 size={15} aria-hidden />
                      </button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="Chủ đề này chưa có từ nào" />
      )}

      {editing ? (
        <Modal open onClose={() => setEditing(null)} title={editing.id ? `Sửa từ “${editing.word}”` : "Thêm từ"}>
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
              void save(submitter?.value === "more");
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Từ / cụm từ" lang="en" value={editing.word} onChange={(word) => setEditing({ ...editing, word })} required maxLength={80} autoCapitalize="none" />
              <TextField label="Phiên âm IPA" value={editing.ipa} onChange={(ipa) => setEditing({ ...editing, ipa })} maxLength={80} placeholder="/ˈfæməli/" />
              <TextField label="Từ loại" value={editing.part_of_speech} onChange={(part_of_speech) => setEditing({ ...editing, part_of_speech })} maxLength={20} placeholder="n. / v. / adj." />
              <TextField label="Nghĩa tiếng Việt" value={editing.meaning_vi} onChange={(meaning_vi) => setEditing({ ...editing, meaning_vi })} required maxLength={200} />
            </div>
            <TextField label="Câu ví dụ (tiếng Anh)" lang="en" value={editing.example_en} onChange={(example_en) => setEditing({ ...editing, example_en })} maxLength={300} />
            <TextField label="Dịch câu ví dụ" value={editing.example_vi} onChange={(example_vi) => setEditing({ ...editing, example_vi })} maxLength={300} />
            <TextField label="Thứ tự" type="number" value={String(editing.sort_order)} onChange={(value) => setEditing({ ...editing, sort_order: Number(value) || 0 })} />
            <div className="flex flex-wrap justify-end gap-2">
              <button type="button" className="btn btn-outline" onClick={() => setEditing(null)}>
                Đóng
              </button>
              {!editing.id ? (
                <button type="submit" value="more" className="btn btn-outline" disabled={busy}>
                  Lưu & thêm từ khác
                </button>
              ) : null}
              <button type="submit" value="save" className="btn btn-primary" disabled={busy}>
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
// Ngữ pháp: thì + bài tập
// ---------------------------------------------------------------------------
interface ExerciseDraft {
  id: string;
  kind: "choice" | "fill";
  prompt: string;
  optionsText: string;
  answersText: string;
  explanation_vi: string;
}

interface TenseDraft {
  id?: string;
  slug: string;
  name_en: string;
  name_vi: string;
  time_group: TimeGroup;
  summary_vi: string;
  formulas: TenseFormula[];
  usages: TenseUsage[];
  signalsText: string;
  notes_vi: string;
  sort_order: number;
  published: boolean;
  exercises: ExerciseDraft[];
}

const GROUP_LABEL: Record<TimeGroup, string> = { present: "Hiện tại", past: "Quá khứ", future: "Tương lai" };

const toExerciseDraft = (exercise: TenseExercise): ExerciseDraft => ({
  id: exercise.id,
  kind: exercise.kind,
  prompt: exercise.prompt,
  optionsText: exercise.options.join("\n"),
  answersText: exercise.answers.join("\n"),
  explanation_vi: exercise.explanation_vi,
});

/** Kiểm tra bài tập trước khi lưu; trả về thông báo lỗi đầu tiên hoặc chuỗi rỗng. */
export function validateExercises(exercises: ExerciseDraft[]): string {
  for (const [index, exercise] of exercises.entries()) {
    const label = `Câu ${index + 1}`;
    const answers = linesOf(exercise.answersText);
    if (!exercise.prompt.trim()) return `${label}: chưa có đề bài.`;
    if (!answers.length) return `${label}: chưa có đáp án.`;
    if (exercise.kind === "choice") {
      const options = linesOf(exercise.optionsText);
      if (options.length < 2) return `${label}: câu trắc nghiệm cần ít nhất 2 lựa chọn.`;
      if (new Set(options).size !== options.length) return `${label}: có lựa chọn bị trùng.`;
      if (answers.length !== 1 || !options.includes(answers[0])) return `${label}: đáp án phải là đúng một trong các lựa chọn.`;
    }
  }
  return "";
}

export function TensesAdmin() {
  const tenses = useLoad(async (db) => check<Tense[]>(await db.from("tenses").select("*").order("sort_order")));
  const { busy, run } = useAction();
  const [draft, setDraft] = useState<TenseDraft | null>(null);
  const [problem, setProblem] = useState("");
  const formId = useId();

  if (tenses.error && !tenses.data) return <Notice kind="bad">{tenses.error}</Notice>;
  if (!tenses.data) return <Spinner />;

  const open = async (tense: Tense | null) => {
    setProblem("");
    if (!tense) {
      setDraft({
        slug: "",
        name_en: "",
        name_vi: "",
        time_group: "present",
        summary_vi: "",
        formulas: [
          { label: "Khẳng định", pattern: "", example_en: "", example_vi: "" },
          { label: "Phủ định", pattern: "", example_en: "", example_vi: "" },
          { label: "Nghi vấn", pattern: "", example_en: "", example_vi: "" },
        ],
        usages: [],
        signalsText: "",
        notes_vi: "",
        sort_order: (tenses.data?.length ?? 0) + 1,
        published: false,
        exercises: [],
      });
      return;
    }
    await run(async (db) => {
      const exercises = check<TenseExercise[]>(await db.from("tense_exercises").select("*").eq("tense_id", tense.id).order("sort_order"));
      setDraft({
        id: tense.id,
        slug: tense.slug,
        name_en: tense.name_en,
        name_vi: tense.name_vi,
        time_group: tense.time_group,
        summary_vi: tense.summary_vi,
        formulas: tense.formulas,
        usages: tense.usages,
        signalsText: tense.signals.join("\n"),
        notes_vi: tense.notes_vi,
        sort_order: tense.sort_order,
        published: tense.published,
        exercises: exercises.map(toExerciseDraft),
      });
    });
  };

  const save = async () => {
    if (!draft) return;
    const invalid = !draft.name_vi.trim() || !draft.name_en.trim() ? "Hãy nhập tên thì bằng tiếng Việt và tiếng Anh." : validateExercises(draft.exercises);
    setProblem(invalid);
    if (invalid) return;

    const fields = {
      slug: draft.slug.trim() || slugify(draft.name_en),
      name_en: draft.name_en.trim(),
      name_vi: draft.name_vi.trim(),
      time_group: draft.time_group,
      summary_vi: draft.summary_vi.trim(),
      formulas: draft.formulas.filter((formula) => formula.pattern.trim()),
      usages: draft.usages.filter((usage) => usage.text_vi.trim()),
      signals: linesOf(draft.signalsText),
      notes_vi: draft.notes_vi.trim(),
      sort_order: draft.sort_order,
      published: draft.published,
    };
    const ok = await run(async (db) => {
      const row = check<{ id: string }>(
        draft.id ? await db.from("tenses").update(fields).eq("id", draft.id).select("id").single() : await db.from("tenses").insert(fields).select("id").single(),
      );
      const rows = draft.exercises.map((exercise, index) => ({
        id: exercise.id,
        tense_id: row.id,
        kind: exercise.kind,
        prompt: exercise.prompt.trim(),
        options: exercise.kind === "choice" ? linesOf(exercise.optionsText) : [],
        answers: linesOf(exercise.answersText),
        explanation_vi: exercise.explanation_vi.trim(),
        sort_order: index + 1,
      }));
      // Ghi bài tập còn lại trước, sau đó mới xóa những câu đã bị gỡ khỏi danh sách.
      if (rows.length) check(await db.from("tense_exercises").upsert(rows).select("id"));
      const stale = db.from("tense_exercises").delete().eq("tense_id", row.id);
      check(await (rows.length ? stale.not("id", "in", `(${rows.map((item) => item.id).join(",")})`) : stale).select("id"));
    }, "Đã lưu bài học.");
    if (ok) {
      setDraft(null);
      tenses.reload();
    }
  };

  return (
    <div>
      <PublishNote />
      <div className="mb-4 flex justify-end">
        <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={() => void open(null)}>
          <Plus size={16} aria-hidden /> Thêm bài học
        </button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Thì</th>
              <th scope="col">Nhóm</th>
              <th scope="col">Trạng thái</th>
              <th scope="col">
                <span className="sr-only">Thao tác</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {tenses.data.map((tense) => (
              <tr key={tense.id}>
                <td className="tabular-nums">{tense.sort_order}</td>
                <td>
                  <strong>{tense.name_vi}</strong>
                  <span lang="en" className="block text-xs text-muted">
                    {tense.name_en} · /ngu-phap/{tense.slug}
                  </span>
                </td>
                <td>{GROUP_LABEL[tense.time_group]}</td>
                <td>
                  <span className={tense.published ? "chip chip-good" : "chip chip-gray"}>{tense.published ? "Đã xuất bản" : "Nháp"}</span>
                </td>
                <td>
                  <span className="flex justify-end gap-1">
                    <button type="button" className="btn btn-outline btn-sm" disabled={busy} onClick={() => void open(tense)}>
                      <Pencil size={14} aria-hidden /> Sửa
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      disabled={busy}
                      aria-label={`Xóa bài ${tense.name_vi}`}
                      onClick={() => {
                        if (window.confirm(`Xóa bài “${tense.name_vi}” cùng bài tập và điểm đã lưu của học viên cho bài này? Không thể hoàn tác.`)) {
                          void run(async (db) => check(await db.from("tenses").delete().eq("id", tense.id).select("id")), "Đã xóa bài học.").then((ok) => ok && tenses.reload());
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

      {draft ? (
        <Modal
          open
          onClose={() => setDraft(null)}
          title={draft.id ? `Sửa bài: ${draft.name_vi}` : "Thêm bài học"}
          wide
          footer={
            <div className="grid gap-3">
              {problem ? <Notice kind="bad">{problem}</Notice> : null}
              <div className="flex justify-end gap-2">
                <button type="button" className="btn btn-outline" onClick={() => setDraft(null)}>
                  Đóng
                </button>
                <button type="submit" form={formId} className="btn btn-primary" disabled={busy}>
                  {busy ? "Đang lưu…" : "Lưu bài học"}
                </button>
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
              <TextField label="Tên tiếng Việt" value={draft.name_vi} onChange={(name_vi) => setDraft({ ...draft, name_vi })} maxLength={80} />
              <TextField
                label="Tên tiếng Anh"
                lang="en"
                value={draft.name_en}
                onChange={(name_en) => setDraft({ ...draft, name_en, slug: draft.id ? draft.slug : slugify(name_en) })}
                maxLength={80}
              />
              <TextField label="Slug (đường dẫn)" value={draft.slug} onChange={(slug) => setDraft({ ...draft, slug: slug.toLowerCase() })} maxLength={80} hint="Ví dụ: present-simple" />
              <label className="block">
                <span className="field-label">Nhóm thời gian</span>
                <select className="input" value={draft.time_group} onChange={(event) => setDraft({ ...draft, time_group: event.target.value as TimeGroup })}>
                  {(Object.keys(GROUP_LABEL) as TimeGroup[]).map((group) => (
                    <option key={group} value={group}>
                      {GROUP_LABEL[group]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <TextField label="Tóm tắt một câu" value={draft.summary_vi} onChange={(summary_vi) => setDraft({ ...draft, summary_vi })} multiline rows={2} maxLength={400} />

            <fieldset>
              <legend className="mb-2 font-bold">Công thức</legend>
              <ArrayEditor
                items={draft.formulas}
                onChange={(formulas) => setDraft({ ...draft, formulas })}
                create={() => ({ label: "", pattern: "", example_en: "", example_vi: "" })}
                addLabel="Thêm công thức"
                itemLabel={(index) => `Công thức ${index + 1}`}
                render={(item, update) => (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <TextField label="Loại câu" value={item.label} onChange={(label) => update({ label })} placeholder="Khẳng định" />
                    <TextField label="Công thức" lang="en" value={item.pattern} onChange={(pattern) => update({ pattern })} placeholder="S + V(s/es) + O" />
                    <TextField label="Ví dụ (tiếng Anh)" lang="en" value={item.example_en} onChange={(example_en) => update({ example_en })} />
                    <TextField label="Dịch ví dụ" value={item.example_vi} onChange={(example_vi) => update({ example_vi })} />
                  </div>
                )}
              />
            </fieldset>

            <fieldset>
              <legend className="mb-2 font-bold">Cách dùng</legend>
              <ArrayEditor
                items={draft.usages}
                onChange={(usages) => setDraft({ ...draft, usages })}
                create={() => ({ text_vi: "", example_en: "", example_vi: "" })}
                addLabel="Thêm cách dùng"
                itemLabel={(index) => `Cách dùng ${index + 1}`}
                render={(item, update) => (
                  <div className="grid gap-3">
                    <TextField label="Diễn giải" value={item.text_vi} onChange={(text_vi) => update({ text_vi })} />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <TextField label="Ví dụ (tiếng Anh)" lang="en" value={item.example_en} onChange={(example_en) => update({ example_en })} />
                      <TextField label="Dịch ví dụ" value={item.example_vi} onChange={(example_vi) => update({ example_vi })} />
                    </div>
                  </div>
                )}
              />
            </fieldset>

            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Dấu hiệu nhận biết" lang="en" value={draft.signalsText} onChange={(signalsText) => setDraft({ ...draft, signalsText })} multiline rows={5} hint="Mỗi dòng một dấu hiệu." />
              <TextField label="Lưu ý" value={draft.notes_vi} onChange={(notes_vi) => setDraft({ ...draft, notes_vi })} multiline rows={5} hint="Để một dòng trống giữa các đoạn." />
            </div>

            <fieldset>
              <legend className="mb-2 font-bold">Bài tập ({draft.exercises.length} câu)</legend>
              <ArrayEditor
                items={draft.exercises}
                onChange={(exercises) => setDraft({ ...draft, exercises })}
                create={() => ({ id: crypto.randomUUID(), kind: "choice" as const, prompt: "", optionsText: "", answersText: "", explanation_vi: "" })}
                addLabel="Thêm câu hỏi"
                itemLabel={(index) => `Câu ${index + 1}`}
                render={(item, update) => (
                  <div className="grid gap-3">
                    <div className="grid gap-3 sm:grid-cols-[10rem_1fr]">
                      <label className="block">
                        <span className="field-label">Dạng</span>
                        <select className="input" value={item.kind} onChange={(event) => update({ kind: event.target.value as ExerciseDraft["kind"] })}>
                          <option value="choice">Trắc nghiệm</option>
                          <option value="fill">Điền từ</option>
                        </select>
                      </label>
                      <TextField label="Đề bài" lang="en" value={item.prompt} onChange={(prompt) => update({ prompt })} placeholder="She ___ (go) to school every day." hint="Dùng ___ cho chỗ trống." />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {item.kind === "choice" ? (
                        <TextField label="Các lựa chọn" lang="en" value={item.optionsText} onChange={(optionsText) => update({ optionsText })} multiline rows={4} hint="Mỗi dòng một lựa chọn." />
                      ) : null}
                      <TextField
                        label={item.kind === "choice" ? "Đáp án đúng" : "Các đáp án được chấp nhận"}
                        lang="en"
                        value={item.answersText}
                        onChange={(answersText) => update({ answersText })}
                        multiline
                        rows={item.kind === "choice" ? 1 : 3}
                        hint={item.kind === "choice" ? "Chép nguyên văn một lựa chọn." : "Mỗi dòng một đáp án, ví dụ: do not work / don't work."}
                      />
                    </div>
                    <TextField label="Giải thích" value={item.explanation_vi} onChange={(explanation_vi) => update({ explanation_vi })} />
                  </div>
                )}
              />
            </fieldset>

            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Thứ tự hiển thị" type="number" value={String(draft.sort_order)} onChange={(value) => setDraft({ ...draft, sort_order: Number(value) || 0 })} />
              <div className="self-end pb-2">
                <Toggle checked={draft.published} onChange={(published) => setDraft({ ...draft, published })} label="Xuất bản (người học nhìn thấy)" />
              </div>
            </div>

          </form>
        </Modal>
      ) : null}
    </div>
  );
}
