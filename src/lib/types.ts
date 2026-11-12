// Kiểu dữ liệu dùng chung giữa nội dung mẫu (content/), truy vấn Supabase và giao diện.

export type Role = "student" | "teacher" | "admin";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: Role;
  created_at: string;
}

export interface VocabWord {
  id: string;
  topic_id: string;
  word: string;
  ipa: string;
  part_of_speech: string;
  meaning_vi: string;
  example_en: string;
  example_vi: string;
  sort_order: number;
}

export interface VocabTopic {
  id: string;
  slug: string;
  title_en: string;
  title_vi: string;
  description_vi: string;
  icon: string;
  sort_order: number;
  published: boolean;
  word_count?: number;
}

export interface VocabTopicWithWords extends VocabTopic {
  words: VocabWord[];
}

export type TimeGroup = "present" | "past" | "future";

export interface TenseFormula {
  label: string;
  pattern: string;
  example_en: string;
  example_vi: string;
}

export interface TenseUsage {
  text_vi: string;
  example_en: string;
  example_vi: string;
}

export interface Tense {
  id: string;
  slug: string;
  name_en: string;
  name_vi: string;
  time_group: TimeGroup;
  summary_vi: string;
  formulas: TenseFormula[];
  usages: TenseUsage[];
  signals: string[];
  notes_vi: string;
  sort_order: number;
  published: boolean;
}

export interface TenseExercise {
  id: string;
  tense_id: string;
  kind: "choice" | "fill";
  prompt: string;
  options: string[];
  answers: string[];
  explanation_vi: string;
  sort_order: number;
}

export interface TenseWithExercises extends Tense {
  exercises: TenseExercise[];
}

export type IeltsSkill = "listening" | "reading";
export type IeltsGroupKind = "choice" | "tfng" | "ynng" | "fill" | "match";

export interface IeltsQuestion {
  n: number;
  prompt: string;
  /** Lựa chọn riêng của câu (dạng trắc nghiệm). */
  options?: string[];
}

export interface IeltsGroup {
  kind: IeltsGroupKind;
  instructions: string;
  /** Danh sách lựa chọn dùng chung cho cả nhóm (dạng nối / chọn tiêu đề). */
  options?: string[];
  questions: IeltsQuestion[];
}

export interface TranscriptLine {
  speaker: string;
  text: string;
}

export interface IeltsSection {
  title: string;
  instructions?: string;
  passageTitle?: string;
  /** Bài đọc: các đoạn cách nhau bằng một dòng trống. */
  passage?: string;
  /** Link file nghe thật (nếu có). Không có thì trình duyệt đọc transcript bằng giọng máy. */
  audioUrl?: string;
  transcript?: TranscriptLine[];
  groups: IeltsGroup[];
}

export interface IeltsContent {
  sections: IeltsSection[];
}

export interface IeltsTestSummary {
  id: string;
  slug: string;
  title: string;
  skill: IeltsSkill;
  description_vi: string;
  duration_minutes: number;
  question_count: number;
  sort_order: number;
  published: boolean;
}

export interface IeltsTest extends IeltsTestSummary {
  content: IeltsContent;
}

export interface IeltsKeyEntry {
  accept: string[];
  explain?: string;
}
export type IeltsAnswerKey = Record<string, IeltsKeyEntry>;

export interface IeltsResult {
  correct: number;
  total: number;
  band: number;
  saved: boolean;
  detail: Record<string, { correct: boolean; accept: string[]; explain: string }>;
}

export interface CallanPackage {
  id: string;
  name: string;
  description_vi: string;
  sessions: number;
  price_vnd: number;
  sort_order: number;
  active: boolean;
}

export interface CallanSession {
  id: string;
  class_id: string;
  starts_at: string;
  duration_minutes: number;
  topic: string;
  meet_link: string;
}

export interface CallanClass {
  id: string;
  name: string;
  level: string;
  description_vi: string;
  teacher_id: string | null;
  teacher_name: string;
  schedule_note: string;
  meet_link: string;
  active: boolean;
  created_at: string;
  callan_sessions?: CallanSession[];
}

export type RegistrationStatus = "pending" | "approved" | "rejected" | "cancelled";
export type PaymentStatus = "unpaid" | "reported" | "confirmed";

export interface CallanRegistration {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  email: string;
  current_level: string;
  goals: string;
  preferred_schedule: string;
  package_id: string | null;
  package_name: string;
  sessions: number;
  price_vnd: number;
  payment_code: string;
  payment_status: PaymentStatus;
  status: RegistrationStatus;
  class_id: string | null;
  admin_note: string;
  created_at: string;
  reviewed_at: string | null;
}

export interface ContactSettings {
  org_name: string;
  address: string;
  phone: string;
  email: string;
  zalo: string;
  facebook: string;
  working_hours: string;
  about: string;
}

export interface PaymentSettings {
  bank_name: string;
  bank_bin: string;
  account_number: string;
  account_name: string;
  note: string;
}

export const EMPTY_CONTACT: ContactSettings = {
  org_name: "",
  address: "",
  phone: "",
  email: "",
  zalo: "",
  facebook: "",
  working_hours: "",
  about: "",
};

export const EMPTY_PAYMENT: PaymentSettings = {
  bank_name: "",
  bank_bin: "",
  account_number: "",
  account_name: "",
  note: "",
};
