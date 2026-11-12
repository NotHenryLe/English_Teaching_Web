-- =====================================================================
-- English Teaching Web — cấu trúc dữ liệu, phân quyền (RLS) và hàm nghiệp vụ
--
-- Cách dùng: dán toàn bộ file này vào Supabase Dashboard → SQL Editor → Run.
-- Sau đó chạy tiếp supabase/seed.sql để nạp nội dung mẫu.
--
-- Mô hình bảo mật: trang web là ứng dụng tĩnh, trình duyệt gọi thẳng Supabase
-- bằng anon key (công khai). Mọi quyền hạn vì thế được ép ở đây bằng
-- Row Level Security — không dựa vào giao diện.
--   * student : người học (mặc định khi đăng ký)
--   * teacher : soạn nội dung, xem lớp Callan được phân công + kết quả học viên của lớp
--   * admin   : toàn quyền (duyệt đăng ký, lớp học, người dùng, cài đặt)
-- =====================================================================
begin;

-- ---------------------------------------------------------------------
-- Kiểu dữ liệu
-- ---------------------------------------------------------------------
create type public.user_role as enum ('student', 'teacher', 'admin');
create type public.registration_status as enum ('pending', 'approved', 'rejected', 'cancelled');
create type public.payment_status as enum ('unpaid', 'reported', 'confirmed');
create type public.ielts_skill as enum ('listening', 'reading');

create function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- ---------------------------------------------------------------------
-- Hồ sơ người dùng (1-1 với auth.users)
-- ---------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null default '',
  full_name text not null default '' check (char_length(full_name) <= 120),
  phone text not null default '' check (char_length(phone) <= 30),
  role public.user_role not null default 'student',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Các hàm kiểm tra vai trò chạy SECURITY DEFINER để dùng được trong policy
-- mà không gây đệ quy RLS trên chính bảng profiles.
create function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin')
$$;

create function public.is_staff() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role in ('teacher', 'admin'))
$$;

-- Tự tạo hồ sơ khi có tài khoản mới (email/mật khẩu hoặc Google).
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    left(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''), 120)
  )
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.handle_user_email_change() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update public.profiles set email = coalesce(new.email, '') where id = new.id;
  return new;
end $$;

create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row when (old.email is distinct from new.email)
  execute function public.handle_user_email_change();

-- Chặn tự nâng quyền: người dùng chỉ sửa được họ tên / số điện thoại của mình.
-- Chỉ admin đổi được vai trò của NGƯỜI KHÁC. Lệnh chạy từ SQL Editor (không có
-- JWT, auth.uid() là null) được phép — đó là cách chủ dự án tự cấp quyền admin lần đầu.
create function public.profiles_guard() returns trigger
language plpgsql set search_path = '' as $$
declare
  caller uuid := (select auth.uid());
begin
  new.id := old.id;
  new.created_at := old.created_at;
  new.updated_at := now();
  if caller is null then
    return new;
  end if;
  new.email := old.email;
  if new.role is distinct from old.role then
    if not public.is_admin() then
      raise exception 'Chỉ quản trị viên mới được đổi vai trò' using errcode = '42501';
    end if;
    if old.id = caller then
      raise exception 'Không thể tự đổi vai trò của chính mình' using errcode = '42501';
    end if;
  end if;
  return new;
end $$;

create trigger profiles_guard
  before update on public.profiles
  for each row execute function public.profiles_guard();

-- ---------------------------------------------------------------------
-- Từ vựng theo chủ đề
-- ---------------------------------------------------------------------
create table public.vocab_topics (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 80),
  title_en text not null,
  title_vi text not null,
  description_vi text not null default '',
  icon text not null default '📘',
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.vocab_words (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.vocab_topics (id) on delete cascade,
  word text not null,
  ipa text not null default '',
  part_of_speech text not null default '',
  meaning_vi text not null,
  example_en text not null default '',
  example_vi text not null default '',
  sort_order integer not null default 0
);
create index vocab_words_topic_idx on public.vocab_words (topic_id, sort_order);
create index vocab_words_word_idx on public.vocab_words (lower(word));

create trigger vocab_topics_touch before update on public.vocab_topics
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
-- Ngữ pháp: các thì + bài tập
-- ---------------------------------------------------------------------
create table public.tenses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 80),
  name_en text not null,
  name_vi text not null,
  time_group text not null check (time_group in ('present', 'past', 'future')),
  summary_vi text not null default '',
  -- [{ "label": "Khẳng định", "pattern": "S + V(s/es)", "example_en": "...", "example_vi": "..." }]
  formulas jsonb not null default '[]' check (jsonb_typeof(formulas) = 'array'),
  -- [{ "text_vi": "Diễn tả thói quen", "example_en": "...", "example_vi": "..." }]
  usages jsonb not null default '[]' check (jsonb_typeof(usages) = 'array'),
  -- ["always", "usually", ...]
  signals jsonb not null default '[]' check (jsonb_typeof(signals) = 'array'),
  notes_vi text not null default '',
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tense_exercises (
  id uuid primary key default gen_random_uuid(),
  tense_id uuid not null references public.tenses (id) on delete cascade,
  kind text not null check (kind in ('choice', 'fill')),
  prompt text not null,
  options jsonb not null default '[]' check (jsonb_typeof(options) = 'array'),
  -- Danh sách đáp án được chấp nhận. Bài luyện tập, không tính điểm xếp hạng,
  -- nên đáp án được gửi kèm để phản hồi ngay cho người học.
  answers jsonb not null check (jsonb_typeof(answers) = 'array' and jsonb_array_length(answers) > 0),
  explanation_vi text not null default '',
  sort_order integer not null default 0
);
create index tense_exercises_tense_idx on public.tense_exercises (tense_id, sort_order);

create trigger tenses_touch before update on public.tenses
  for each row execute function public.touch_updated_at();

create table public.exercise_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  tense_id uuid not null references public.tenses (id) on delete cascade,
  score integer not null,
  total integer not null check (total between 1 and 200),
  created_at timestamptz not null default now(),
  check (score between 0 and total)
);
create index exercise_attempts_user_idx on public.exercise_attempts (user_id, created_at desc);

-- ---------------------------------------------------------------------
-- IELTS Listening & Reading
-- ---------------------------------------------------------------------
create table public.ielts_tests (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 80),
  title text not null,
  skill public.ielts_skill not null,
  description_vi text not null default '',
  duration_minutes integer not null check (duration_minutes between 1 and 240),
  -- { "sections": [{ title, instructions, passageTitle, passage, audioUrl, transcript: [{speaker,text}],
  --                  groups: [{ kind, instructions, options, questions: [{ n, prompt, options }] }] }] }
  content jsonb not null default '{"sections": []}' check (jsonb_typeof(content -> 'sections') = 'array'),
  question_count integer not null default 0,
  sort_order integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Đáp án tách riêng và KHÔNG mở cho người học: chấm điểm đi qua hàm submit_ielts_attempt.
create table public.ielts_answer_keys (
  test_id uuid primary key references public.ielts_tests (id) on delete cascade,
  -- { "1": { "accept": ["TRUE"], "explain": "..." }, "2": { ... } }
  answers jsonb not null default '{}' check (jsonb_typeof(answers) = 'object')
);

create table public.ielts_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  test_id uuid not null references public.ielts_tests (id) on delete cascade,
  answers jsonb not null default '{}',
  correct integer not null,
  total integer not null,
  band numeric(2, 1) not null,
  duration_seconds integer,
  created_at timestamptz not null default now()
);
create index ielts_attempts_user_idx on public.ielts_attempts (user_id, created_at desc);

create trigger ielts_tests_touch before update on public.ielts_tests
  for each row execute function public.touch_updated_at();

create function public.sync_ielts_question_count() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update public.ielts_tests
  set question_count = (select count(*) from jsonb_object_keys(new.answers))
  where id = new.test_id;
  return new;
end $$;

create trigger ielts_answer_keys_count
  after insert or update on public.ielts_answer_keys
  for each row execute function public.sync_ielts_question_count();

create function public.normalize_answer(p_value text) returns text
language sql immutable set search_path = '' as $$
  select lower(btrim(regexp_replace(coalesce(p_value, ''), '\s+', ' ', 'g')))
$$;

-- Quy đổi số câu đúng sang band (ước tính theo bảng quy đổi phổ biến của
-- IELTS Listening và Academic Reading; đề không đủ 40 câu được quy về thang 40).
create function public.ielts_band(p_skill public.ielts_skill, p_correct integer, p_total integer) returns numeric
language sql immutable set search_path = '' as $$
  with s as (
    select case when p_total > 0 then round(p_correct * 40.0 / p_total)::integer else 0 end as raw
  )
  select case p_skill
    when 'listening' then case
      when raw >= 39 then 9.0 when raw >= 37 then 8.5 when raw >= 35 then 8.0 when raw >= 32 then 7.5
      when raw >= 30 then 7.0 when raw >= 26 then 6.5 when raw >= 23 then 6.0 when raw >= 18 then 5.5
      when raw >= 16 then 5.0 when raw >= 13 then 4.5 when raw >= 10 then 4.0 when raw >= 8 then 3.5
      when raw >= 6 then 3.0 when raw >= 4 then 2.5 when raw >= 2 then 2.0 when raw >= 1 then 1.0
      else 0.0 end
    else case
      when raw >= 39 then 9.0 when raw >= 37 then 8.5 when raw >= 35 then 8.0 when raw >= 33 then 7.5
      when raw >= 30 then 7.0 when raw >= 27 then 6.5 when raw >= 23 then 6.0 when raw >= 19 then 5.5
      when raw >= 15 then 5.0 when raw >= 13 then 4.5 when raw >= 10 then 4.0 when raw >= 8 then 3.5
      when raw >= 6 then 3.0 when raw >= 4 then 2.5 when raw >= 2 then 2.0 when raw >= 1 then 1.0
      else 0.0 end
  end
  from s
$$;

-- Chấm bài phía máy chủ. Khách chưa đăng nhập vẫn được chấm (không lưu);
-- người đã đăng nhập được lưu lịch sử để theo dõi tiến bộ.
create function public.submit_ielts_attempt(
  p_test_id uuid,
  p_answers jsonb,
  p_duration_seconds integer default null
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_user uuid := (select auth.uid());
  v_skill public.ielts_skill;
  v_key jsonb;
  v_number text;
  v_entry jsonb;
  v_given text;
  v_ok boolean;
  v_total integer := 0;
  v_correct integer := 0;
  v_detail jsonb := '{}';
  v_clean jsonb := '{}';
  v_band numeric;
begin
  if p_answers is null or jsonb_typeof(p_answers) <> 'object' or length(p_answers::text) > 20000 then
    raise exception 'Bài làm không hợp lệ' using errcode = '22023';
  end if;

  select t.skill, k.answers into v_skill, v_key
  from public.ielts_tests t
  join public.ielts_answer_keys k on k.test_id = t.id
  where t.id = p_test_id and (t.published or public.is_staff());
  if not found then
    raise exception 'Không tìm thấy đề thi' using errcode = 'P0002';
  end if;

  for v_number, v_entry in select key, value from jsonb_each(v_key) loop
    v_total := v_total + 1;
    v_given := public.normalize_answer(p_answers ->> v_number);
    v_ok := v_given <> '' and exists (
      select 1 from jsonb_array_elements_text(v_entry -> 'accept') as a(value)
      where public.normalize_answer(a.value) = v_given
    );
    if v_ok then
      v_correct := v_correct + 1;
    end if;
    if v_given <> '' then
      v_clean := v_clean || jsonb_build_object(v_number, left(p_answers ->> v_number, 200));
    end if;
    v_detail := v_detail || jsonb_build_object(v_number, jsonb_build_object(
      'correct', v_ok,
      'accept', coalesce(v_entry -> 'accept', '[]'::jsonb),
      'explain', coalesce(v_entry ->> 'explain', '')
    ));
  end loop;

  v_band := public.ielts_band(v_skill, v_correct, v_total);

  if v_user is not null then
    insert into public.ielts_attempts (user_id, test_id, answers, correct, total, band, duration_seconds)
    values (v_user, p_test_id, v_clean, v_correct, v_total, v_band,
            case when p_duration_seconds between 0 and 86400 then p_duration_seconds end);
  end if;

  return jsonb_build_object(
    'correct', v_correct,
    'total', v_total,
    'band', v_band,
    'saved', v_user is not null,
    'detail', v_detail
  );
end $$;

-- ---------------------------------------------------------------------
-- Khóa học Callan (trả phí): gói học, lớp, lịch học, đăng ký
-- ---------------------------------------------------------------------
create table public.callan_packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description_vi text not null default '',
  sessions integer not null check (sessions between 1 and 500),
  price_vnd integer not null check (price_vnd >= 0),
  sort_order integer not null default 0,
  active boolean not null default true
);

create table public.callan_classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  level text not null default '',
  description_vi text not null default '',
  teacher_id uuid references public.profiles (id) on delete set null,
  teacher_name text not null default '',
  schedule_note text not null default '',
  meet_link text not null default '' check (meet_link = '' or meet_link ~ '^https://[^\s]+$'),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index callan_classes_teacher_idx on public.callan_classes (teacher_id);

create table public.callan_sessions (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.callan_classes (id) on delete cascade,
  starts_at timestamptz not null,
  duration_minutes integer not null default 50 check (duration_minutes between 10 and 300),
  topic text not null default '',
  -- Để trống thì dùng link Meet của lớp.
  meet_link text not null default '' check (meet_link = '' or meet_link ~ '^https://[^\s]+$')
);
create index callan_sessions_class_idx on public.callan_sessions (class_id, starts_at);

create table public.callan_registrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  full_name text not null check (char_length(full_name) between 1 and 120),
  phone text not null check (char_length(phone) between 6 and 30),
  email text not null check (char_length(email) between 3 and 200),
  current_level text not null default '' check (char_length(current_level) <= 200),
  goals text not null default '' check (char_length(goals) <= 2000),
  preferred_schedule text not null default '' check (char_length(preferred_schedule) <= 500),
  package_id uuid references public.callan_packages (id) on delete set null,
  -- Chụp lại thông tin gói tại thời điểm đăng ký để giá không đổi khi admin sửa gói.
  package_name text not null default '',
  sessions integer not null default 0,
  price_vnd integer not null default 0,
  payment_code text not null unique,
  payment_status public.payment_status not null default 'unpaid',
  status public.registration_status not null default 'pending',
  class_id uuid references public.callan_classes (id) on delete restrict,
  admin_note text not null default '' check (char_length(admin_note) <= 2000),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles (id) on delete set null,
  constraint approved_needs_class check (status <> 'approved' or class_id is not null)
);
create index callan_registrations_user_idx on public.callan_registrations (user_id, created_at desc);
create index callan_registrations_class_idx on public.callan_registrations (class_id);
-- Mỗi người chỉ có một đăng ký đang chờ duyệt, tránh gửi trùng.
create unique index callan_registrations_one_pending on public.callan_registrations (user_id) where status = 'pending';

-- Các hàm quan hệ lớp học (SECURITY DEFINER để policy của bảng này tham chiếu
-- bảng kia mà không bị đệ quy RLS).
create function public.is_class_teacher(p_class uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.callan_classes c
    where c.id = p_class and c.teacher_id = (select auth.uid())
  )
$$;

create function public.is_class_student(p_class uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.callan_registrations r
    where r.class_id = p_class and r.user_id = (select auth.uid()) and r.status = 'approved'
  )
$$;

create function public.teaches_student(p_student uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from public.callan_registrations r
    join public.callan_classes c on c.id = r.class_id
    where r.user_id = p_student and r.status = 'approved' and c.teacher_id = (select auth.uid())
  )
$$;

-- Tên giáo viên hiển thị cho học viên được chép sẵn vào lớp, để học viên
-- không cần quyền đọc hồ sơ (email, số điện thoại) của giáo viên.
create function public.callan_class_sync_teacher() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.teacher_id is null then
    new.teacher_name := '';
  else
    select coalesce(nullif(p.full_name, ''), split_part(p.email, '@', 1)) into new.teacher_name
    from public.profiles p where p.id = new.teacher_id;
  end if;
  return new;
end $$;

create trigger callan_class_sync_teacher
  before insert or update of teacher_id on public.callan_classes
  for each row execute function public.callan_class_sync_teacher();

create function public.callan_registration_before_insert() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_package public.callan_packages;
begin
  -- Yêu cầu đến từ trình duyệt: khóa mọi trường mà người học không được tự đặt.
  if (select auth.uid()) is not null then
    new.user_id := (select auth.uid());
    new.status := 'pending';
    new.payment_status := 'unpaid';
    new.class_id := null;
    new.admin_note := '';
    new.reviewed_at := null;
    new.reviewed_by := null;
    new.created_at := now();
  end if;

  select * into v_package from public.callan_packages where id = new.package_id and active;
  if not found then
    raise exception 'Gói học không hợp lệ hoặc đã ngừng mở' using errcode = '23514';
  end if;
  new.package_name := v_package.name;
  new.sessions := v_package.sessions;
  new.price_vnd := v_package.price_vnd;

  -- Mã ghi trong nội dung chuyển khoản để admin đối soát.
  loop
    new.payment_code := 'CL' || upper(substr(md5(gen_random_uuid()::text), 1, 6));
    exit when not exists (select 1 from public.callan_registrations where payment_code = new.payment_code);
  end loop;
  return new;
end $$;

create trigger callan_registration_before_insert
  before insert on public.callan_registrations
  for each row execute function public.callan_registration_before_insert();

create function public.callan_registration_before_update() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.id := old.id;
  new.user_id := old.user_id;
  new.payment_code := old.payment_code;
  new.created_at := old.created_at;
  if new.status is distinct from old.status and public.is_admin() then
    new.reviewed_at := now();
    new.reviewed_by := (select auth.uid());
  end if;
  return new;
end $$;

create trigger callan_registration_before_update
  before update on public.callan_registrations
  for each row execute function public.callan_registration_before_update();

-- Người học không có quyền UPDATE trực tiếp bảng đăng ký; hai thao tác được phép
-- đi qua hàm riêng, mỗi hàm chỉ đổi đúng một trường ở đúng trạng thái.
create function public.report_callan_payment(p_registration_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  update public.callan_registrations
  set payment_status = 'reported'
  where id = p_registration_id
    and user_id = (select auth.uid())
    and status = 'pending'
    and payment_status = 'unpaid';
  if not found then
    raise exception 'Không tìm thấy đăng ký đang chờ thanh toán' using errcode = 'P0002';
  end if;
end $$;

create function public.cancel_callan_registration(p_registration_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  update public.callan_registrations
  set status = 'cancelled'
  where id = p_registration_id
    and user_id = (select auth.uid())
    and status = 'pending';
  if not found then
    raise exception 'Chỉ hủy được đăng ký đang chờ duyệt' using errcode = 'P0002';
  end if;
end $$;

-- ---------------------------------------------------------------------
-- Cài đặt trang (thông tin liên hệ, thông tin chuyển khoản)
-- ---------------------------------------------------------------------
create table public.site_settings (
  key text primary key check (key ~ '^[a-z_]+$'),
  value jsonb not null default '{}' check (jsonb_typeof(value) = 'object'),
  -- false: chỉ người đã đăng nhập mới đọc được (ví dụ số tài khoản nhận học phí).
  is_public boolean not null default true,
  updated_at timestamptz not null default now()
);

create trigger site_settings_touch before update on public.site_settings
  for each row execute function public.touch_updated_at();

insert into public.site_settings (key, value, is_public) values
  ('contact', '{"org_name": "", "address": "", "phone": "", "email": "", "zalo": "", "facebook": "", "working_hours": "", "about": ""}', true),
  ('payment', '{"bank_name": "", "bank_bin": "", "account_number": "", "account_name": "", "note": ""}', false);

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.vocab_topics enable row level security;
alter table public.vocab_words enable row level security;
alter table public.tenses enable row level security;
alter table public.tense_exercises enable row level security;
alter table public.exercise_attempts enable row level security;
alter table public.ielts_tests enable row level security;
alter table public.ielts_answer_keys enable row level security;
alter table public.ielts_attempts enable row level security;
alter table public.callan_packages enable row level security;
alter table public.callan_classes enable row level security;
alter table public.callan_sessions enable row level security;
alter table public.callan_registrations enable row level security;
alter table public.site_settings enable row level security;

-- profiles ------------------------------------------------------------
create policy profiles_select on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()) or public.teaches_student(id));
create policy profiles_update on public.profiles for update to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()))
  with check (id = (select auth.uid()) or (select public.is_admin()));

-- Nội dung học: ai cũng đọc được bản đã xuất bản; giáo viên + admin đọc cả bản nháp và được ghi.
create policy vocab_topics_read on public.vocab_topics for select to anon, authenticated
  using (published or (select public.is_staff()));
create policy vocab_topics_insert on public.vocab_topics for insert to authenticated
  with check ((select public.is_staff()));
create policy vocab_topics_update on public.vocab_topics for update to authenticated
  using ((select public.is_staff())) with check ((select public.is_staff()));
create policy vocab_topics_delete on public.vocab_topics for delete to authenticated
  using ((select public.is_staff()));

create policy vocab_words_read on public.vocab_words for select to anon, authenticated
  using (exists (select 1 from public.vocab_topics t where t.id = vocab_words.topic_id));
create policy vocab_words_insert on public.vocab_words for insert to authenticated
  with check ((select public.is_staff()));
create policy vocab_words_update on public.vocab_words for update to authenticated
  using ((select public.is_staff())) with check ((select public.is_staff()));
create policy vocab_words_delete on public.vocab_words for delete to authenticated
  using ((select public.is_staff()));

create policy tenses_read on public.tenses for select to anon, authenticated
  using (published or (select public.is_staff()));
create policy tenses_insert on public.tenses for insert to authenticated
  with check ((select public.is_staff()));
create policy tenses_update on public.tenses for update to authenticated
  using ((select public.is_staff())) with check ((select public.is_staff()));
create policy tenses_delete on public.tenses for delete to authenticated
  using ((select public.is_staff()));

create policy tense_exercises_read on public.tense_exercises for select to anon, authenticated
  using (exists (select 1 from public.tenses t where t.id = tense_exercises.tense_id));
create policy tense_exercises_insert on public.tense_exercises for insert to authenticated
  with check ((select public.is_staff()));
create policy tense_exercises_update on public.tense_exercises for update to authenticated
  using ((select public.is_staff())) with check ((select public.is_staff()));
create policy tense_exercises_delete on public.tense_exercises for delete to authenticated
  using ((select public.is_staff()));

-- Kết quả bài tập: của mình; admin xem tất cả; giáo viên xem học viên lớp mình.
create policy exercise_attempts_select on public.exercise_attempts for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()) or public.teaches_student(user_id));
create policy exercise_attempts_insert on public.exercise_attempts for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy ielts_tests_read on public.ielts_tests for select to anon, authenticated
  using (published or (select public.is_staff()));
create policy ielts_tests_insert on public.ielts_tests for insert to authenticated
  with check ((select public.is_staff()));
create policy ielts_tests_update on public.ielts_tests for update to authenticated
  using ((select public.is_staff())) with check ((select public.is_staff()));
create policy ielts_tests_delete on public.ielts_tests for delete to authenticated
  using ((select public.is_staff()));

create policy ielts_answer_keys_staff on public.ielts_answer_keys for all to authenticated
  using ((select public.is_staff())) with check ((select public.is_staff()));

-- Không có policy INSERT: bài làm chỉ được ghi qua submit_ielts_attempt.
create policy ielts_attempts_select on public.ielts_attempts for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()) or public.teaches_student(user_id));

-- Callan --------------------------------------------------------------
create policy callan_packages_read on public.callan_packages for select to anon, authenticated
  using (active or (select public.is_admin()));
create policy callan_packages_admin on public.callan_packages for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- Lớp + lịch + link Meet: chỉ admin, giáo viên của lớp, và học viên ĐÃ ĐƯỢC DUYỆT vào lớp.
create policy callan_classes_select on public.callan_classes for select to authenticated
  using ((select public.is_admin()) or teacher_id = (select auth.uid()) or public.is_class_student(id));
create policy callan_classes_admin on public.callan_classes for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy callan_sessions_select on public.callan_sessions for select to authenticated
  using ((select public.is_admin()) or public.is_class_teacher(class_id) or public.is_class_student(class_id));
create policy callan_sessions_admin on public.callan_sessions for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy callan_registrations_select on public.callan_registrations for select to authenticated
  using (
    user_id = (select auth.uid())
    or (select public.is_admin())
    or (status = 'approved' and public.is_class_teacher(class_id))
  );
create policy callan_registrations_insert on public.callan_registrations for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy callan_registrations_admin_update on public.callan_registrations for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy callan_registrations_admin_delete on public.callan_registrations for delete to authenticated
  using ((select public.is_admin()));

-- Cài đặt -------------------------------------------------------------
create policy site_settings_read on public.site_settings for select to anon, authenticated
  using (is_public or (select auth.uid()) is not null);
create policy site_settings_admin on public.site_settings for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- =====================================================================
-- Quyền bảng / cột / hàm (tối thiểu cần thiết; RLS ở trên lọc theo dòng)
-- =====================================================================
revoke all on all tables in schema public from anon, authenticated;
revoke execute on all functions in schema public from public, anon, authenticated;

grant select on
  public.vocab_topics, public.vocab_words, public.tenses, public.tense_exercises,
  public.ielts_tests, public.callan_packages, public.site_settings
to anon, authenticated;

grant select on public.profiles to authenticated;
grant update (full_name, phone, role) on public.profiles to authenticated;

grant insert, update, delete on
  public.vocab_topics, public.vocab_words, public.tenses, public.tense_exercises,
  public.ielts_tests, public.callan_packages, public.callan_classes, public.callan_sessions,
  public.site_settings
to authenticated;
grant select, insert, update, delete on public.ielts_answer_keys to authenticated;

grant select on public.exercise_attempts, public.ielts_attempts to authenticated;
grant insert (tense_id, score, total) on public.exercise_attempts to authenticated;

grant select on public.callan_classes, public.callan_sessions, public.callan_registrations to authenticated;
grant insert (full_name, phone, email, current_level, goals, preferred_schedule, package_id)
  on public.callan_registrations to authenticated;
grant update (status, payment_status, class_id, admin_note) on public.callan_registrations to authenticated;
grant delete on public.callan_registrations to authenticated;

grant execute on function public.is_admin(), public.is_staff() to anon, authenticated;
grant execute on function
  public.is_class_teacher(uuid), public.is_class_student(uuid), public.teaches_student(uuid),
  public.report_callan_payment(uuid), public.cancel_callan_registration(uuid)
to authenticated;
grant execute on function public.submit_ielts_attempt(uuid, jsonb, integer) to anon, authenticated;

-- =====================================================================
-- Storage: file nghe IELTS do giáo viên / admin tải lên
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'ielts-audio', 'ielts-audio', true, 52428800,
  array['audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/aac', 'audio/ogg', 'audio/wav', 'audio/x-wav', 'audio/webm']
)
on conflict (id) do nothing;

create policy ielts_audio_staff_select on storage.objects for select to authenticated
  using (bucket_id = 'ielts-audio' and (select public.is_staff()));
create policy ielts_audio_staff_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'ielts-audio' and (select public.is_staff()));
create policy ielts_audio_staff_update on storage.objects for update to authenticated
  using (bucket_id = 'ielts-audio' and (select public.is_staff()))
  with check (bucket_id = 'ielts-audio' and (select public.is_staff()));
create policy ielts_audio_staff_delete on storage.objects for delete to authenticated
  using (bucket_id = 'ielts-audio' and (select public.is_staff()));

commit;
