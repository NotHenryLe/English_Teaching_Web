// Kiểm thử phân quyền (RLS) trên Supabase cục bộ.
// Chạy: npm run local:up  →  npm run test:rls
//
// Mỗi test đăng nhập bằng một vai trò thật (khách, học viên, giáo viên, admin)
// rồi thử cả việc được phép lẫn việc bị cấm, vì toàn bộ bảo mật của web nằm ở RLS.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { after, before, describe, test } from "node:test";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(new URL("../supabase/local/.env", import.meta.url), "utf8")
    .split("\n")
    .filter((line) => line.includes("="))
    .map((line) => [line.slice(0, line.indexOf("=")), line.slice(line.indexOf("=") + 1)]),
);
const URL_ = process.env.SUPABASE_URL ?? "http://127.0.0.1:54321";
const options = { auth: { persistSession: false, autoRefreshToken: false } };
const service = createClient(URL_, env.SERVICE_ROLE_KEY, options);
const anon = createClient(URL_, env.ANON_KEY, options);

const run = Math.random().toString(36).slice(2, 8);
const password = "Test-password-123";
const users = {};
const fixtures = {};

async function makeUser(name, role) {
  const email = `${name}-${run}@example.test`;
  const { data, error } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: `${name} ${run}` },
  });
  assert.ifError(error);
  if (role !== "student") {
    const { error: roleError } = await service.from("profiles").update({ role }).eq("id", data.user.id);
    assert.ifError(roleError);
  }
  const client = createClient(URL_, env.ANON_KEY, options);
  const { error: signInError } = await client.auth.signInWithPassword({ email, password });
  assert.ifError(signInError);
  users[name] = { id: data.user.id, email, client };
}

const must = async (query) => {
  const { data, error } = await query;
  assert.ifError(error);
  return data;
};

before(async () => {
  await makeUser("alice", "student");
  await makeUser("bob", "student");
  await makeUser("tina", "teacher");
  await makeUser("tom", "teacher");
  await makeUser("root", "admin");

  const [topic, draftTopic] = await must(
    service
      .from("vocab_topics")
      .insert([
        { slug: `t-pub-${run}`, title_en: "Published", title_vi: "Công khai", published: true },
        { slug: `t-draft-${run}`, title_en: "Draft", title_vi: "Nháp", published: false },
      ])
      .select(),
  );
  await must(
    service.from("vocab_words").insert([
      { topic_id: topic.id, word: "cat", meaning_vi: "con mèo" },
      { topic_id: draftTopic.id, word: "secret", meaning_vi: "bí mật" },
    ]),
  );
  const [tense] = await must(
    service
      .from("tenses")
      .insert({ slug: `tense-${run}`, name_en: "Test tense", name_vi: "Thì thử", time_group: "present" })
      .select(),
  );
  const tests = await must(
    service
      .from("ielts_tests")
      .insert([
        { slug: `ielts-pub-${run}`, title: "Public test", skill: "reading", duration_minutes: 20, published: true },
        { slug: `ielts-draft-${run}`, title: "Draft test", skill: "listening", duration_minutes: 20, published: false },
      ])
      .select(),
  );
  const key = {
    1: { accept: ["TRUE"], explain: "Đoạn 1" },
    2: { accept: ["B"], explain: "" },
    3: { accept: ["solar power", "solar energy"], explain: "" },
    4: { accept: ["1990"], explain: "" },
  };
  await must(service.from("ielts_answer_keys").insert(tests.map((t) => ({ test_id: t.id, answers: key }))));
  const [pkg] = await must(
    service.from("callan_packages").insert({ name: `Gói ${run}`, sessions: 8, price_vnd: 1200000 }).select(),
  );
  const [klass] = await must(
    service
      .from("callan_classes")
      .insert({ name: `Lớp ${run}`, teacher_id: users.tina.id, meet_link: "https://meet.google.com/abc-defg-hij" })
      .select(),
  );
  await must(
    service.from("callan_sessions").insert({ class_id: klass.id, starts_at: new Date(Date.now() + 864e5).toISOString() }),
  );
  Object.assign(fixtures, { topic, draftTopic, tense, publicTest: tests[0], draftTest: tests[1], pkg, klass });
});

after(async () => {
  await service.from("callan_registrations").delete().in("user_id", Object.values(users).map((u) => u.id));
  await service.from("callan_classes").delete().eq("id", fixtures.klass.id);
  await service.from("callan_packages").delete().eq("id", fixtures.pkg.id);
  await service.from("ielts_tests").delete().in("id", [fixtures.publicTest.id, fixtures.draftTest.id]);
  await service.from("tenses").delete().eq("id", fixtures.tense.id);
  await service.from("vocab_topics").delete().in("id", [fixtures.topic.id, fixtures.draftTopic.id]);
  await service.storage.from("ielts-audio").remove([`rls-${run}.mp3`]);
  for (const user of Object.values(users)) await service.auth.admin.deleteUser(user.id);
});

describe("nội dung học", () => {
  test("khách đọc được bài đã xuất bản, không thấy bản nháp", async () => {
    const topics = await must(anon.from("vocab_topics").select("slug").like("slug", `%-${run}`));
    assert.deepEqual(topics.map((t) => t.slug), [`t-pub-${run}`]);
    const words = await must(
      anon.from("vocab_words").select("word").in("topic_id", [fixtures.topic.id, fixtures.draftTopic.id]),
    );
    assert.deepEqual(words.map((w) => w.word), ["cat"]);
  });

  test("khách và học viên không ghi được nội dung", async () => {
    for (const client of [anon, users.alice.client]) {
      const insert = await client.from("vocab_topics").insert({ slug: `hack-${run}`, title_en: "x", title_vi: "x" });
      assert.ok(insert.error, "insert phải bị từ chối");
      const update = await client.from("vocab_topics").update({ title_vi: "bị sửa" }).eq("id", fixtures.topic.id).select();
      assert.equal(update.data?.length ?? 0, 0);
      const remove = await client.from("vocab_words").delete().eq("topic_id", fixtures.topic.id).select();
      assert.equal(remove.data?.length ?? 0, 0);
    }
    const [row] = await must(service.from("vocab_topics").select("title_vi").eq("id", fixtures.topic.id));
    assert.equal(row.title_vi, "Công khai");
  });

  test("giáo viên thấy bản nháp và soạn được nội dung", async () => {
    const drafts = await must(users.tina.client.from("vocab_topics").select("slug").eq("id", fixtures.draftTopic.id));
    assert.equal(drafts.length, 1);
    const [word] = await must(
      users.tina.client
        .from("vocab_words")
        .insert({ topic_id: fixtures.topic.id, word: "dog", meaning_vi: "con chó" })
        .select(),
    );
    await must(users.tina.client.from("vocab_words").update({ ipa: "/dɒɡ/" }).eq("id", word.id));
    const deleted = await must(users.tina.client.from("vocab_words").delete().eq("id", word.id).select());
    assert.equal(deleted.length, 1);
  });
});

describe("hồ sơ và vai trò", () => {
  test("tài khoản mới có hồ sơ học viên, tên lấy từ lúc đăng ký", async () => {
    const [profile] = await must(users.alice.client.from("profiles").select("*"));
    assert.equal(profile.id, users.alice.id);
    assert.equal(profile.role, "student");
    assert.equal(profile.full_name, `alice ${run}`);
    assert.equal(profile.email, users.alice.email);
  });

  test("học viên không tự nâng quyền, không đổi được email trong hồ sơ", async () => {
    const escalate = await users.alice.client.from("profiles").update({ role: "admin" }).eq("id", users.alice.id);
    assert.ok(escalate.error);
    const email = await users.alice.client.from("profiles").update({ email: "x@evil.test" }).eq("id", users.alice.id);
    assert.ok(email.error, "cột email không được cấp quyền UPDATE");
    await must(users.alice.client.from("profiles").update({ full_name: "Alice Mới", phone: "0900000001" }).eq("id", users.alice.id));
    const [profile] = await must(service.from("profiles").select("role, email, full_name").eq("id", users.alice.id));
    assert.deepEqual(profile, { role: "student", email: users.alice.email, full_name: "Alice Mới" });
  });

  test("giáo viên không đổi được vai trò; không ai sửa hồ sơ người khác", async () => {
    const self = await users.tina.client.from("profiles").update({ role: "admin" }).eq("id", users.tina.id);
    assert.ok(self.error);
    const other = await users.tina.client.from("profiles").update({ full_name: "hack" }).eq("id", users.bob.id).select();
    assert.equal(other.data?.length ?? 0, 0);
    const [bob] = await must(service.from("profiles").select("full_name, role").eq("id", users.bob.id));
    assert.deepEqual(bob, { full_name: `bob ${run}`, role: "student" });
  });

  test("học viên chỉ thấy hồ sơ của mình; admin thấy tất cả", async () => {
    const mine = await must(users.alice.client.from("profiles").select("id"));
    assert.deepEqual(mine.map((p) => p.id), [users.alice.id]);
    const all = await must(users.root.client.from("profiles").select("id").in("id", Object.values(users).map((u) => u.id)));
    assert.equal(all.length, 5);
    assert.deepEqual(await must(anon.from("profiles").select("id")).catch(() => []), []);
  });

  test("admin đổi vai trò người khác nhưng không tự hạ quyền mình", async () => {
    await must(users.root.client.from("profiles").update({ role: "teacher" }).eq("id", users.bob.id));
    await must(users.root.client.from("profiles").update({ role: "student" }).eq("id", users.bob.id));
    const self = await users.root.client.from("profiles").update({ role: "student" }).eq("id", users.root.id);
    assert.ok(self.error);
    const [root] = await must(service.from("profiles").select("role").eq("id", users.root.id));
    assert.equal(root.role, "admin");
  });
});

describe("IELTS", () => {
  const answers = { 1: " true ", 2: "b", 3: "Solar  Energy", 4: "1991", 99: "rác" };

  test("đáp án không lộ cho khách và học viên", async () => {
    for (const client of [anon, users.alice.client]) {
      const { data } = await client.from("ielts_answer_keys").select("*");
      assert.equal(data?.length ?? 0, 0);
    }
    const staff = await must(users.tina.client.from("ielts_answer_keys").select("test_id").eq("test_id", fixtures.publicTest.id));
    assert.equal(staff.length, 1);
  });

  test("số câu hỏi tự đồng bộ theo đáp án", async () => {
    const [row] = await must(anon.from("ielts_tests").select("question_count").eq("id", fixtures.publicTest.id));
    assert.equal(row.question_count, 4);
  });

  test("khách được chấm điểm nhưng không lưu", async () => {
    const result = await must(anon.rpc("submit_ielts_attempt", { p_test_id: fixtures.publicTest.id, p_answers: answers }));
    assert.equal(result.correct, 3);
    assert.equal(result.total, 4);
    assert.equal(result.saved, false);
    assert.equal(result.detail[4].correct, false);
    assert.deepEqual(result.detail[3].accept, ["solar power", "solar energy"]);
    assert.equal(result.band, 7); // 3/4 → 30/40 ở Reading
  });

  test("học viên được lưu bài, chỉ thấy bài của mình, không tự ghi điểm", async () => {
    const result = await must(
      users.alice.client.rpc("submit_ielts_attempt", {
        p_test_id: fixtures.publicTest.id,
        p_answers: answers,
        p_duration_seconds: 321,
      }),
    );
    assert.equal(result.saved, true);
    const mine = await must(users.alice.client.from("ielts_attempts").select("*").eq("test_id", fixtures.publicTest.id));
    assert.equal(mine.length, 1);
    assert.equal(mine[0].correct, 3);
    assert.equal(mine[0].duration_seconds, 321);
    assert.equal(mine[0].answers[99], undefined, "chỉ lưu câu có trong đề");
    const bobs = await must(users.bob.client.from("ielts_attempts").select("id").eq("test_id", fixtures.publicTest.id));
    assert.equal(bobs.length, 0);
    const forged = await users.alice.client
      .from("ielts_attempts")
      .insert({ user_id: users.alice.id, test_id: fixtures.publicTest.id, correct: 40, total: 40, band: 9 });
    assert.ok(forged.error);
    const edited = await users.alice.client.from("ielts_attempts").update({ band: 9 }).eq("id", mine[0].id).select();
    assert.ok(edited.error || edited.data.length === 0);
  });

  test("đề nháp: người học không làm được, giáo viên xem thử được", async () => {
    const guest = await anon.rpc("submit_ielts_attempt", { p_test_id: fixtures.draftTest.id, p_answers: {} });
    assert.ok(guest.error);
    const hidden = await must(anon.from("ielts_tests").select("id").eq("id", fixtures.draftTest.id));
    assert.equal(hidden.length, 0);
    const staff = await must(users.tina.client.rpc("submit_ielts_attempt", { p_test_id: fixtures.draftTest.id, p_answers: { 1: "TRUE" } }));
    assert.equal(staff.correct, 1);
  });

  test("bài làm sai định dạng bị từ chối", async () => {
    const bad = await anon.rpc("submit_ielts_attempt", { p_test_id: fixtures.publicTest.id, p_answers: ["a"] });
    assert.ok(bad.error);
    const huge = await anon.rpc("submit_ielts_attempt", { p_test_id: fixtures.publicTest.id, p_answers: { 1: "x".repeat(30000) } });
    assert.ok(huge.error);
  });
});

describe("bài tập ngữ pháp", () => {
  test("học viên lưu điểm của mình, không ghi hộ người khác", async () => {
    await must(users.alice.client.from("exercise_attempts").insert({ tense_id: fixtures.tense.id, score: 7, total: 10 }));
    const forged = await users.alice.client
      .from("exercise_attempts")
      .insert({ tense_id: fixtures.tense.id, score: 10, total: 10, user_id: users.bob.id });
    assert.ok(forged.error);
    const impossible = await users.alice.client.from("exercise_attempts").insert({ tense_id: fixtures.tense.id, score: 11, total: 10 });
    assert.ok(impossible.error);
    const guest = await anon.from("exercise_attempts").insert({ tense_id: fixtures.tense.id, score: 1, total: 10 });
    assert.ok(guest.error);
    const bobs = await must(users.bob.client.from("exercise_attempts").select("id").eq("tense_id", fixtures.tense.id));
    assert.equal(bobs.length, 0);
  });
});

describe("khóa Callan", () => {
  const form = () => ({
    full_name: "Alice Nguyễn",
    phone: "0901234567",
    email: users.alice.email,
    current_level: "A2",
    goals: "Giao tiếp công việc",
    preferred_schedule: "Tối thứ 3, thứ 5",
    package_id: fixtures.pkg.id,
  });
  let registration;

  test("khách không đăng ký được; học viên không tự đặt trạng thái", async () => {
    const guest = await anon.from("callan_registrations").insert(form());
    assert.ok(guest.error);
    const cheat = await users.alice.client
      .from("callan_registrations")
      .insert({ ...form(), status: "approved", class_id: fixtures.klass.id, payment_status: "confirmed" });
    assert.ok(cheat.error, "các cột trạng thái không được cấp quyền INSERT");
    const forBob = await users.alice.client.from("callan_registrations").insert({ ...form(), user_id: users.bob.id });
    assert.ok(forBob.error);
  });

  test("đăng ký hợp lệ: chờ duyệt, chưa thanh toán, có mã chuyển khoản và giá chụp từ gói", async () => {
    [registration] = await must(users.alice.client.from("callan_registrations").insert(form()).select());
    assert.equal(registration.user_id, users.alice.id);
    assert.equal(registration.status, "pending");
    assert.equal(registration.payment_status, "unpaid");
    assert.equal(registration.class_id, null);
    assert.match(registration.payment_code, /^CL[0-9A-F]{6}$/);
    assert.equal(registration.price_vnd, 1200000);
    assert.equal(registration.sessions, 8);
    const again = await users.alice.client.from("callan_registrations").insert(form());
    assert.ok(again.error, "không gửi được đăng ký thứ hai khi còn đơn chờ duyệt");
  });

  test("trước khi duyệt: học viên không thấy lớp, lịch hay link Meet", async () => {
    assert.equal((await must(users.alice.client.from("callan_classes").select("id"))).length, 0);
    assert.equal((await must(users.alice.client.from("callan_sessions").select("id"))).length, 0);
    assert.equal((await users.alice.client.rpc("is_class_student", { p_class: fixtures.klass.id })).data, false);
  });

  test("học viên không tự duyệt; chỉ báo đã chuyển khoản cho đơn của mình", async () => {
    const selfApprove = await users.alice.client
      .from("callan_registrations")
      .update({ status: "approved", class_id: fixtures.klass.id })
      .eq("id", registration.id)
      .select();
    assert.equal(selfApprove.data?.length ?? 0, 0);
    const bob = await users.bob.client.rpc("report_callan_payment", { p_registration_id: registration.id });
    assert.ok(bob.error);
    assert.equal((await must(users.bob.client.from("callan_registrations").select("id"))).length, 0);
    await must(users.alice.client.rpc("report_callan_payment", { p_registration_id: registration.id }));
    const [row] = await must(users.alice.client.from("callan_registrations").select("status, payment_status"));
    assert.deepEqual(row, { status: "pending", payment_status: "reported" });
  });

  test("giáo viên không duyệt được và chưa thấy đơn chờ duyệt", async () => {
    const update = await users.tina.client.from("callan_registrations").update({ status: "approved", class_id: fixtures.klass.id }).eq("id", registration.id).select();
    assert.equal(update.data?.length ?? 0, 0);
    assert.equal((await must(users.tina.client.from("callan_registrations").select("id"))).length, 0);
    assert.equal((await must(users.tina.client.from("profiles").select("id").eq("id", users.alice.id))).length, 0);
  });

  test("admin phải xếp lớp khi duyệt", async () => {
    const noClass = await users.root.client.from("callan_registrations").update({ status: "approved" }).eq("id", registration.id);
    assert.ok(noClass.error);
    const [row] = await must(
      users.root.client
        .from("callan_registrations")
        .update({ status: "approved", payment_status: "confirmed", class_id: fixtures.klass.id })
        .eq("id", registration.id)
        .select(),
    );
    assert.equal(row.reviewed_by, users.root.id);
    assert.ok(row.reviewed_at);
  });

  test("sau khi duyệt: học viên thấy lớp, lịch, link Meet và tên giáo viên", async () => {
    const [klass] = await must(users.alice.client.from("callan_classes").select("*, callan_sessions(*)"));
    assert.equal(klass.meet_link, "https://meet.google.com/abc-defg-hij");
    assert.equal(klass.teacher_name, `tina ${run}`);
    assert.equal(klass.callan_sessions.length, 1);
    assert.equal((await must(users.bob.client.from("callan_classes").select("id"))).length, 0);
    assert.equal((await must(users.bob.client.from("callan_sessions").select("id"))).length, 0);
    assert.equal((await must(anon.from("callan_classes").select("id")).catch(() => [])).length, 0);
  });

  test("giáo viên của lớp thấy lớp, học viên và kết quả; giáo viên khác thì không", async () => {
    assert.equal((await must(users.tina.client.from("callan_classes").select("id"))).length, 1);
    assert.equal((await must(users.tina.client.from("callan_sessions").select("id"))).length, 1);
    const students = await must(users.tina.client.from("callan_registrations").select("full_name, phone"));
    assert.deepEqual(students, [{ full_name: "Alice Nguyễn", phone: "0901234567" }]);
    assert.equal((await must(users.tina.client.from("profiles").select("id").eq("id", users.alice.id))).length, 1);
    assert.equal((await must(users.tina.client.from("ielts_attempts").select("id").eq("user_id", users.alice.id))).length, 1);
    assert.equal((await must(users.tina.client.from("exercise_attempts").select("id").eq("user_id", users.alice.id))).length, 1);

    assert.equal((await must(users.tom.client.from("callan_classes").select("id"))).length, 0);
    assert.equal((await must(users.tom.client.from("callan_registrations").select("id"))).length, 0);
    assert.equal((await must(users.tom.client.from("ielts_attempts").select("id").eq("user_id", users.alice.id))).length, 0);
    assert.equal((await must(users.tom.client.from("profiles").select("id").eq("id", users.alice.id))).length, 0);
  });

  test("giáo viên không sửa được lớp, lịch hay link Meet", async () => {
    const klass = await users.tina.client.from("callan_classes").update({ meet_link: "https://evil.test/x" }).eq("id", fixtures.klass.id).select();
    assert.equal(klass.data?.length ?? 0, 0);
    const session = await users.tina.client.from("callan_sessions").insert({ class_id: fixtures.klass.id, starts_at: new Date().toISOString() });
    assert.ok(session.error);
  });

  test("link Meet phải là https", async () => {
    const bad = await users.root.client.from("callan_classes").update({ meet_link: "javascript:alert(1)" }).eq("id", fixtures.klass.id);
    assert.ok(bad.error);
  });

  test("không xóa được lớp đang có học viên", async () => {
    const remove = await users.root.client.from("callan_classes").delete().eq("id", fixtures.klass.id);
    assert.ok(remove.error);
  });

  test("thu hồi duyệt thì học viên mất quyền xem lớp", async () => {
    await must(users.root.client.from("callan_registrations").update({ status: "cancelled", class_id: null }).eq("id", registration.id));
    assert.equal((await must(users.alice.client.from("callan_classes").select("id"))).length, 0);
    assert.equal((await must(users.alice.client.from("callan_sessions").select("id"))).length, 0);
    assert.equal((await must(users.tina.client.from("ielts_attempts").select("id").eq("user_id", users.alice.id))).length, 0);
  });

  test("học viên tự hủy được đơn đang chờ, không hủy đơn đã xử lý", async () => {
    const done = await users.alice.client.rpc("cancel_callan_registration", { p_registration_id: registration.id });
    assert.ok(done.error);
    const [fresh] = await must(users.alice.client.from("callan_registrations").insert(form()).select());
    await must(users.alice.client.rpc("cancel_callan_registration", { p_registration_id: fresh.id }));
    const [row] = await must(service.from("callan_registrations").select("status").eq("id", fresh.id));
    assert.equal(row.status, "cancelled");
  });

  test("gói học: ai cũng xem được gói đang mở, chỉ admin sửa", async () => {
    assert.equal((await must(anon.from("callan_packages").select("id").eq("id", fixtures.pkg.id))).length, 1);
    const hack = await users.tina.client.from("callan_packages").update({ price_vnd: 1 }).eq("id", fixtures.pkg.id).select();
    assert.equal(hack.data?.length ?? 0, 0);
    await must(users.root.client.from("callan_packages").update({ active: false }).eq("id", fixtures.pkg.id));
    assert.equal((await must(anon.from("callan_packages").select("id").eq("id", fixtures.pkg.id))).length, 0);
    const closed = await users.bob.client.from("callan_registrations").insert({ ...form(), email: users.bob.email });
    assert.ok(closed.error, "không đăng ký được gói đã ngừng mở");
    await must(users.root.client.from("callan_packages").update({ active: true }).eq("id", fixtures.pkg.id));
  });
});

describe("cài đặt trang", () => {
  test("liên hệ công khai; thông tin chuyển khoản chỉ cho người đã đăng nhập", async () => {
    const guest = await must(anon.from("site_settings").select("key"));
    assert.deepEqual(guest.map((r) => r.key), ["contact"]);
    const member = await must(users.alice.client.from("site_settings").select("key").order("key"));
    assert.deepEqual(member.map((r) => r.key), ["contact", "payment"]);
  });

  test("chỉ admin sửa được cài đặt", async () => {
    for (const client of [anon, users.alice.client, users.tina.client]) {
      const hack = await client.from("site_settings").update({ value: { account_number: "999" } }).eq("key", "payment").select();
      assert.equal(hack.data?.length ?? 0, 0);
    }
    const [before_] = await must(service.from("site_settings").select("value").eq("key", "contact"));
    await must(users.root.client.from("site_settings").update({ value: { ...before_.value, phone: "0123" } }).eq("key", "contact"));
    const [row] = await must(anon.from("site_settings").select("value").eq("key", "contact"));
    assert.equal(row.value.phone, "0123");
    await must(service.from("site_settings").update({ value: before_.value }).eq("key", "contact"));
  });
});

describe("file nghe IELTS", () => {
  const file = new Blob([new Uint8Array([0x49, 0x44, 0x33, 3, 0, 0, 0, 0, 0, 0])], { type: "audio/mpeg" });

  test("học viên không tải lên được; giáo viên tải được và file đọc công khai", async () => {
    const denied = await users.alice.client.storage.from("ielts-audio").upload(`rls-${run}.mp3`, file);
    assert.ok(denied.error);
    const ok = await users.tina.client.storage.from("ielts-audio").upload(`rls-${run}.mp3`, file);
    assert.ifError(ok.error);
    const { data } = anon.storage.from("ielts-audio").getPublicUrl(`rls-${run}.mp3`);
    const response = await fetch(data.publicUrl);
    assert.equal(response.status, 200);
  });

  test("chỉ nhận file âm thanh", async () => {
    const text = new Blob(["<script>alert(1)</script>"], { type: "text/html" });
    const denied = await users.tina.client.storage.from("ielts-audio").upload(`rls-${run}.html`, text);
    assert.ok(denied.error);
  });
});
