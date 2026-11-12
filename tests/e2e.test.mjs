// Kiểm thử đầu-cuối trên trình duyệt thật (Chromium qua Playwright).
//
// Chuẩn bị:  npm run local:up  →  npm run build  →  npm run test:e2e
// Cần gói `playwright` (npm i -D playwright && npx playwright install chromium) nếu máy chưa có.
//
// Test chạy trên bản build tĩnh trong out/ (đúng thứ sẽ đưa lên Cloudflare) nối với Supabase cục bộ,
// đi qua các luồng chính bằng ba vai trò: học viên, giáo viên, quản trị viên.
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { after, before, describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { IELTS_SEED } from "../content/ielts.ts";
import { TENSES_SEED } from "../content/tenses.ts";
import { startStaticServer } from "./static-server.mjs";

const { chromium } = createRequire(import.meta.url)("playwright");
const here = path.dirname(fileURLToPath(import.meta.url));
const BASE = "http://localhost:3000";
const MAIL_DIR = path.join(here, "../supabase/local/.mail");

const env = Object.fromEntries(
  readFileSync(path.join(here, "../supabase/local/.env"), "utf8")
    .split("\n")
    .filter((line) => line.includes("="))
    .map((line) => [line.slice(0, line.indexOf("=")), line.slice(line.indexOf("=") + 1)]),
);
const service = createClient("http://127.0.0.1:54321", env.SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

const run = Math.random().toString(36).slice(2, 7);
const password = "Mat-khau-thu-123";
const people = {
  admin: { email: `admin-${run}@example.test`, name: `Quản Trị ${run}` },
  teacher: { email: `teacher-${run}@example.test`, name: `Cô Lan ${run}` },
  student: { email: `student-${run}@example.test`, name: `Minh Học Viên ${run}` },
};
const names = {
  pkg: `Gói thử ${run}`,
  klass: `Lớp Callan ${run}`,
  topicVi: `Chủ đề thử ${run}`,
  topicEn: `Test Topic ${run}`,
  topicSlug: `test-topic-${run}`,
  ieltsTitle: `Mini Reading ${run}`,
  ieltsSlug: `mini-reading-${run}`,
};
const MEET = "https://meet.google.com/abc-defg-hij";

let server;
let browser;
const originals = {};
const problems = [];

// Giọng đọc giả: ghi lại những gì web yêu cầu đọc, vì trình duyệt không giao diện không có loa.
function stubSpeech() {
  window.__spoken = [];
  window.SpeechSynthesisUtterance = class {
    constructor(text) {
      this.text = text;
      this.rate = 1;
      this.pitch = 1;
      this.lang = "";
      this.voice = null;
    }
  };
  const synth = {
    timer: 0,
    getVoices: () => [
      { name: "Google US English", lang: "en-US" },
      { name: "Google UK English Female", lang: "en-GB" },
    ],
    speak(utterance) {
      window.__spoken.push({ text: utterance.text, rate: utterance.rate, lang: utterance.lang, voice: utterance.voice?.name, pitch: utterance.pitch });
      this.timer = setTimeout(() => utterance.onend?.(), 25);
    },
    cancel() {
      clearTimeout(this.timer);
    },
    pause() {},
    resume() {},
    addEventListener() {},
    removeEventListener() {},
  };
  Object.defineProperty(window, "speechSynthesis", { value: synth, configurable: true });
}

async function newPage(options = {}) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: "vi-VN", timezoneId: "Asia/Ho_Chi_Minh", ...options });
  await context.addInitScript(stubSpeech);
  // Không gọi dịch vụ bên ngoài trong lúc test.
  await context.route(/img\.vietqr\.io/, (route) => route.abort());
  await context.route(/api\.dictionaryapi\.dev/, (route) => route.fulfill({ status: 404, contentType: "application/json", body: '{"title":"No Definitions Found"}' }));
  const page = await context.newPage();
  page.on("pageerror", (error) => problems.push(`${page.url()} → ${error.message}`));
  page.on("console", (message) => {
    const text = message.text();
    // 404 là chủ ý ở test trang dự phòng; lỗi tải ảnh QR là do test chặn mạng ngoài.
    if (message.type() === "error" && !/status of 40[04]|ERR_FAILED|ERR_INTERNET_DISCONNECTED|vietqr/i.test(text)) problems.push(`${page.url()} → console: ${text}`);
  });
  page.on("dialog", (dialog) => dialog.accept());
  return page;
}

async function login(page, who, next = "/tai-khoan") {
  await page.goto(`${BASE}/dang-nhap?next=${encodeURIComponent(next)}`);
  await page.getByLabel("Email").fill(people[who].email);
  await page.getByLabel("Mật khẩu", { exact: true }).fill(people[who].password ?? password);
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await page.waitForURL(`${BASE}${next}`);
}

const toast = (page, text) => page.getByRole("status").filter({ hasText: text }).first().waitFor();
const spoken = (page) => page.evaluate(() => window.__spoken.map((item) => item.text));

function latestMailLink(recipient, after) {
  const decode = (raw) => raw.replace(/=\r?\n/g, "").replace(/=([0-9A-F]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  const files = readdirSync(MAIL_DIR)
    .filter((file) => file.endsWith(".eml") && Number(file.split("-")[0]) >= after)
    .sort()
    .reverse();
  for (const file of files) {
    const body = decode(readFileSync(path.join(MAIL_DIR, file), "utf8"));
    if (!body.includes(recipient)) continue;
    const match = body.match(/href="(http:\/\/127\.0\.0\.1:54321\/auth\/v1\/verify[^"]+)"/);
    if (match) return match[1].replace(/&amp;/g, "&");
  }
  return null;
}

async function waitForMail(recipient, since) {
  for (let i = 0; i < 40; i++) {
    const link = latestMailLink(recipient, since);
    if (link) return link;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Không thấy email gửi tới ${recipient}`);
}

before(async () => {
  server = await startStaticServer(path.join(here, "../out"), 3000);
  browser = await chromium.launch();
  for (const who of ["admin", "teacher"]) {
    const { data, error } = await service.auth.admin.createUser({ email: people[who].email, password, email_confirm: true, user_metadata: { full_name: people[who].name } });
    assert.ifError(error);
    people[who].id = data.user.id;
  }
  // Quyền admin đầu tiên được cấp ngoài giao diện (giống bước chạy SQL trong hướng dẫn cài đặt).
  assert.ifError((await service.from("profiles").update({ role: "admin" }).eq("id", people.admin.id)).error);
  const { data: settings } = await service.from("site_settings").select("key, value");
  for (const row of settings) originals[row.key] = row.value;
  originals.summary = (await service.from("tenses").select("summary_vi").eq("slug", "present-simple").single()).data.summary_vi;
});

after(async () => {
  await browser?.close();
  server?.close();
  const ids = Object.values(people).map((person) => person.id).filter(Boolean);
  await service.from("callan_registrations").delete().in("user_id", ids);
  await service.from("callan_classes").delete().eq("name", names.klass);
  await service.from("callan_packages").delete().eq("name", names.pkg);
  await service.from("vocab_topics").delete().eq("slug", names.topicSlug);
  await service.from("ielts_tests").delete().eq("slug", names.ieltsSlug);
  await service.from("tenses").update({ summary_vi: originals.summary }).eq("slug", "present-simple");
  for (const key of ["contact", "payment"]) await service.from("site_settings").update({ value: originals[key] }).eq("key", key);
  for (const id of ids) await service.auth.admin.deleteUser(id);
});

describe("khách (chưa đăng nhập)", () => {
  test("trang chủ và từ vựng: nội dung in sẵn, nghe phát âm, thẻ ghi nhớ, kiểm tra nhanh", async () => {
    const page = await newPage();
    const response = await page.goto(BASE);
    assert.equal(response.status(), 200);
    assert.match(await response.text(), /Học tiếng Anh/, "HTML in sẵn phải có nội dung (SEO)");
    await page.getByRole("link", { name: "Bắt đầu với từ vựng" }).click();
    await page.waitForURL(`${BASE}/tu-vung`);
    assert.equal(await page.getByRole("main").getByRole("listitem").count(), 16);

    await page.getByRole("link", { name: /Gia đình/ }).click();
    await page.waitForURL(`${BASE}/tu-vung/family`);
    await page.getByRole("button", { name: "Nghe phát âm: parents" }).click();
    await page.getByText("🇬🇧 Anh-Anh").click();
    await page.getByRole("button", { name: "Nghe phát âm: sibling" }).click();
    const said = await page.evaluate(() => window.__spoken);
    assert.deepEqual(said.map((item) => [item.text, item.lang]), [["parents", "en-US"], ["sibling", "en-GB"]]);

    await page.getByRole("tab", { name: "Thẻ ghi nhớ" }).click();
    await page.getByRole("button", { name: "Xem nghĩa" }).click();
    await page.getByText("bố mẹ", { exact: true }).waitFor();
    await page.getByRole("button", { name: "Tiếp →" }).click();
    await page.getByText("Thẻ 2 / 15").waitFor();

    await page.getByRole("tab", { name: "Kiểm tra nhanh" }).click();
    await page.getByRole("button", { name: "Bắt đầu" }).click();
    for (let i = 0; i < 10; i++) {
      await page.getByRole("group", { name: "Chọn nghĩa đúng" }).getByRole("button").first().click();
      await page.getByRole("button", { name: i === 9 ? "Xem kết quả" : "Câu tiếp" }).click();
    }
    await page.getByText(/^\d+\/10$/).waitFor();
    await page.context().close();
  });

  test("ngữ pháp: làm đúng hết bài tập, khách được nhắc đăng nhập để lưu điểm", async () => {
    const page = await newPage();
    await page.goto(`${BASE}/ngu-phap`);
    await page.getByRole("link", { name: /Hiện tại đơn/ }).click();
    await page.waitForURL(`${BASE}/ngu-phap/present-simple`);
    await page.getByRole("heading", { name: "Thì Hiện tại đơn" }).waitFor();
    const exercises = TENSES_SEED[0].exercises;
    const items = page.locator("form ol > li");
    assert.equal(await items.count(), exercises.length);
    for (const [index, exercise] of exercises.entries()) {
      if (exercise.options) await items.nth(index).getByLabel(exercise.answers[0], { exact: true }).check();
      // Gõ khác kiểu chữ + thừa khoảng trắng để kiểm tra việc chuẩn hóa đáp án.
      else await items.nth(index).getByRole("textbox").fill(`  ${exercise.answers.at(-1).toUpperCase().replace("'", "’")} `);
    }
    await page.getByRole("button", { name: "Nộp bài" }).click();
    await page.getByText(`${exercises.length}/${exercises.length} câu đúng`).waitFor();
    await page.getByText("để lưu điểm và theo dõi tiến bộ").waitFor();
    await page.getByRole("button", { name: "Làm lại" }).click();
    await page.getByRole("button", { name: "Nộp bài" }).click();
    await page.getByText(`0/${exercises.length} câu đúng`).waitFor();
    await page.context().close();
  });

  test("IELTS Reading: đáp án không lộ trước khi nộp; chấm 40/40, band 9.0", async () => {
    const page = await newPage();
    const exam = IELTS_SEED.find((item) => item.skill === "reading");
    const secret = exam.key[3].explain;
    const payloads = [];
    page.on("response", async (response) => {
      if (/\/rest\/v1\/|ielts\/reading/.test(response.url()) && !/rpc\/submit_ielts_attempt/.test(response.url())) payloads.push(await response.text().catch(() => ""));
    });
    const response = await page.goto(`${BASE}/ielts/${exam.slug}`);
    assert.ok(!(await response.text()).includes(secret), "HTML in sẵn không được chứa giải thích đáp án");
    await page.getByRole("button", { name: "Bắt đầu làm bài" }).click();
    await page.getByRole("timer").waitFor();
    assert.match(await page.getByRole("timer").innerText(), /^(60:00|59:5\d)$/);

    for (const [sectionIndex, section] of exam.content.sections.entries()) {
      await page.getByRole("tab", { name: section.title }).click();
      await page.getByRole("heading", { name: section.passageTitle }).waitFor();
      for (const group of section.groups) {
        for (const question of group.questions) {
          const answer = exam.key[question.n].accept[0];
          const item = page.locator(`#cau-${question.n}`);
          if (group.kind === "fill") await item.getByRole("textbox").fill(answer);
          else if (group.kind === "match") await item.getByRole("combobox").selectOption(answer);
          else await item.locator(`input[type=radio][value="${answer}"]`).check();
        }
      }
      assert.equal(sectionIndex < 3, true);
    }
    await page.getByText("Đã trả lời 40/40 câu").waitFor();
    assert.ok(!payloads.some((body) => body.includes(secret)), "không phản hồi nào trước khi nộp bài được chứa đáp án");

    await page.getByRole("button", { name: "Nộp bài" }).first().click();
    await page.getByRole("dialog").getByRole("button", { name: "Nộp bài" }).click();
    await page.getByRole("heading", { name: "Kết quả bài làm" }).waitFor();
    await page.getByText("40/40").waitFor();
    await page.getByText("9.0", { exact: true }).waitFor();
    await page.getByText(secret).waitFor();
    await page.getByText("để lưu kết quả cho những lần thi sau").waitFor();
    await page.context().close();
  });

  test("IELTS Listening: đọc lời thoại theo thứ tự bằng hai giọng; sai thì hiện đáp án đúng; transcript chỉ hiện sau khi nộp", async () => {
    const page = await newPage();
    const exam = IELTS_SEED.find((item) => item.skill === "listening");
    const lines = exam.content.sections[0].transcript;
    await page.goto(`${BASE}/ielts/${exam.slug}`);
    await page.getByRole("button", { name: "Bắt đầu làm bài" }).click();
    assert.equal(await page.getByText(lines[1].text).count(), 0, "không hiện lời thoại khi đang làm bài");
    await page.getByRole("button", { name: "Nghe", exact: true }).click();
    await page.getByText("Đã đọc hết phần này").waitFor({ timeout: 60_000 });
    const said = await page.evaluate(() => window.__spoken);
    assert.equal(said.map((item) => item.text).join(" "), lines.map((line) => line.text).join(" "));
    assert.equal(new Set(said.map((item) => item.voice)).size, 2, "hai người nói dùng hai giọng khác nhau");

    await page.locator("#cau-1").getByRole("textbox").fill("beginners");
    await page.locator("#cau-3").getByRole("textbox").fill("5.30");
    await page.locator("#cau-4").getByRole("textbox").fill("9th");
    await page.getByRole("button", { name: "Nộp bài" }).first().click();
    await page.getByRole("dialog").getByText("Các câu bỏ trống sẽ tính là sai").waitFor();
    await page.getByRole("dialog").getByRole("button", { name: "Nộp bài" }).click();
    await page.getByText("2/40").waitFor();
    await page.getByText("2.0", { exact: true }).waitFor();
    const third = page.locator("li", { hasText: "Start time:" });
    await third.getByText("Đáp án đúng:").waitFor();
    await third.getByText("6.30 / 6:30 / half past six").waitFor();
    await page.getByText("Xem lời thoại (transcript)").first().click();
    await page.getByText(lines[1].text).waitFor();
    await page.context().close();
  });

  test("phát âm: nghe câu, nghe chậm, bấm từng từ, tra nghĩa tiếng Việt từ kho từ vựng", async () => {
    const page = await newPage();
    await page.context().route(/api\.dictionaryapi\.dev\/api\/v2\/entries\/en\/comfortable/, (route) =>
      route.fulfill({
        contentType: "application/json",
        body: JSON.stringify([
          {
            word: "comfortable",
            phonetics: [{ text: "/ˈkʌmftəbl/", audio: "" }],
            meanings: [{ partOfSpeech: "adjective", definitions: [{ definition: "Providing physical ease and relaxation.", example: "a comfortable chair" }] }],
          },
        ]),
      }),
    );
    await page.goto(`${BASE}/phat-am`);
    const box = page.getByLabel("Tiếng Anh");
    await box.fill("This sofa is really comfortable");
    await page.getByRole("button", { name: "Nghe", exact: true }).click();
    await page.getByRole("button", { name: "🐢 Nghe chậm" }).click();
    const said = await page.evaluate(() => window.__spoken);
    assert.equal(said[0].text, "This sofa is really comfortable");
    assert.ok(said[1].rate <= 0.6 && said[0].rate > 0.9, "nghe chậm dùng tốc độ thấp hơn");

    await page.getByRole("region", { name: "Kết quả" }).getByRole("button", { name: "comfortable", exact: true }).click();
    await page.getByText("/ˈkʌmftəbl/").first().waitFor();
    await page.getByText("thoải mái").first().waitFor();
    await page.getByText("Providing physical ease and relaxation.").waitFor();
    await page.getByRole("link", { name: /Thuộc chủ đề Nhà cửa/ }).waitFor();

    await box.fill("zzzqqq");
    await page.getByRole("button", { name: "Tra từ" }).click();
    await page.getByText("Không tìm thấy “zzzqqq” trong từ điển").waitFor();
    await page.context().close();
  });

  test("trang cần đăng nhập chuyển về trang đăng nhập; tham số next không cho chuyển ra trang ngoài", async () => {
    const page = await newPage();
    await page.goto(`${BASE}/tai-khoan`);
    await page.waitForURL(`${BASE}/dang-nhap?next=%2Ftai-khoan`);
    await page.goto(`${BASE}/quan-tri`);
    await page.waitForURL(`${BASE}/dang-nhap?next=%2Fquan-tri`);
    await page.goto(`${BASE}/callan`);
    await page.getByText("Bạn cần đăng nhập để gửi đăng ký").waitFor();
    assert.equal(await page.getByText(MEET).count(), 0);
    await page.context().close();
  });

  test("điện thoại: menu mở được, không trang nào bị tràn ngang", async () => {
    const page = await newPage({ viewport: { width: 375, height: 740 }, hasTouch: true, isMobile: true });
    for (const url of ["/", "/tu-vung/family", "/ngu-phap/present-perfect", "/ielts", "/phat-am", "/callan", "/dang-ky", "/lien-he"]) {
      await page.goto(`${BASE}${url}`);
      await page.waitForLoadState("networkidle");
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      assert.ok(overflow <= 1, `${url} tràn ngang ${overflow}px`);
    }
    await page.goto(BASE);
    await page.getByRole("button", { name: "Menu" }).click();
    await page.getByRole("navigation", { name: "Điều hướng chính (di động)" }).getByRole("link", { name: "IELTS" }).click();
    await page.waitForURL(`${BASE}/ielts`);
    await page.goto(`${BASE}/ielts/reading-practice-test-1`);
    await page.getByRole("button", { name: "Bắt đầu làm bài" }).click();
    await page.getByRole("tab", { name: "Câu hỏi" }).click();
    await page.locator("#cau-1").getByText("TRUE", { exact: true }).click();
    await page.getByText("Đã trả lời 1/40 câu").waitFor();
    assert.ok((await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)) <= 1, "màn làm bài tràn ngang");
    await page.context().close();
  });
});

describe("tài khoản", () => {
  test("đăng ký bằng email → xác nhận qua link trong thư → vào trang tài khoản", async () => {
    const page = await newPage();
    const since = Date.now();
    await page.goto(`${BASE}/dang-ky`);
    await page.getByLabel("Họ và tên").fill(people.student.name);
    await page.getByLabel("Email").fill(people.student.email);
    await page.getByLabel("Mật khẩu", { exact: true }).fill("ngắn");
    await page.getByRole("button", { name: "Đăng ký", exact: true }).click();
    await page.getByText("Mật khẩu cần ít nhất 8 ký tự.").waitFor();
    await page.getByLabel("Mật khẩu", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Đăng ký", exact: true }).click();
    await page.getByRole("heading", { name: "Kiểm tra hộp thư của bạn" }).waitFor();

    // Chưa xác nhận thì chưa đăng nhập được.
    const other = await newPage();
    await other.goto(`${BASE}/dang-nhap`);
    await other.getByLabel("Email").fill(people.student.email);
    await other.getByLabel("Mật khẩu", { exact: true }).fill(password);
    await other.getByRole("button", { name: "Đăng nhập", exact: true }).click();
    await other.getByText("Email chưa được xác nhận").waitFor();
    await other.context().close();

    await page.goto(await waitForMail(people.student.email, since));
    await page.waitForURL(`${BASE}/tai-khoan`);
    await page.getByRole("heading", { name: `Xin chào, ${people.student.name}!` }).waitFor();
    await page.getByText("Học viên", { exact: true }).waitFor();
    people.student.id = (await service.from("profiles").select("id").eq("email", people.student.email).single()).data.id;

    // Đăng ký lại bằng email đã có: báo rõ thay vì im lặng.
    await page.getByRole("button", { name: "Đăng xuất" }).click();
    await page.getByRole("banner").getByRole("link", { name: "Đăng nhập" }).waitFor();
    await page.goto(`${BASE}/dang-ky`);
    await page.getByLabel("Họ và tên").fill("Người Khác");
    await page.getByLabel("Email").fill(people.student.email);
    await page.getByLabel("Mật khẩu", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Đăng ký", exact: true }).click();
    await page.getByText("Email này đã có tài khoản").waitFor();
    await page.context().close();
  });

  test("sai mật khẩu báo lỗi; quên mật khẩu → đặt lại qua link → đăng nhập bằng mật khẩu mới; sửa hồ sơ", async () => {
    const page = await newPage();
    await page.goto(`${BASE}/dang-nhap`);
    await page.getByLabel("Email").fill(people.student.email);
    await page.getByLabel("Mật khẩu", { exact: true }).fill("sai-mat-khau-999");
    await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
    await page.getByText("Email hoặc mật khẩu không đúng.").waitFor();

    const since = Date.now();
    await page.getByRole("link", { name: "Quên mật khẩu?" }).click();
    await page.getByRole("heading", { name: "Quên mật khẩu" }).waitFor();
    await page.getByLabel("Email").fill(people.student.email);
    await page.getByRole("button", { name: "Gửi link đặt lại mật khẩu" }).click();
    await page.getByText("một email chứa link đặt lại mật khẩu vừa được gửi đi").waitFor();
    await page.goto(await waitForMail(people.student.email, since));
    await page.waitForURL(/\/dat-lai-mat-khau/);
    people.student.password = "Mat-khau-moi-456";
    await page.getByLabel("Mật khẩu mới").fill(people.student.password);
    await page.getByRole("button", { name: "Lưu mật khẩu mới" }).click();
    await page.waitForURL(`${BASE}/tai-khoan`);
    await page.getByRole("button", { name: "Đăng xuất" }).click();
    await page.getByRole("banner").getByRole("link", { name: "Đăng nhập" }).waitFor();
    await page.context().close();

    const fresh = await newPage();
    await login(fresh, "student");
    await fresh.getByLabel("Số điện thoại").fill("0901 234 567");
    await fresh.getByRole("button", { name: "Lưu hồ sơ" }).click();
    await toast(fresh, "Đã lưu hồ sơ.");
    await fresh.reload();
    assert.equal(await fresh.getByLabel("Số điện thoại").inputValue(), "0901 234 567");
    // Link đặt lại mật khẩu đã dùng / không hợp lệ.
    await fresh.getByRole("button", { name: "Đăng xuất" }).click();
    await fresh.getByRole("banner").getByRole("link", { name: "Đăng nhập" }).waitFor();
    await fresh.goto(`${BASE}/dat-lai-mat-khau#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired`);
    await fresh.getByText("Đường link đã hết hạn hoặc đã được dùng rồi.").waitFor();
    await fresh.context().close();
  });

  test("học viên đã đăng nhập: điểm bài tập và bài thi được lưu vào tiến độ", async () => {
    const page = await newPage();
    await login(page, "student", "/ngu-phap/past-simple");
    const exercises = TENSES_SEED.find((tense) => tense.slug === "past-simple").exercises;
    const items = page.locator("form ol > li");
    for (const [index, exercise] of exercises.slice(0, 5).entries()) {
      if (exercise.options) await items.nth(index).getByLabel(exercise.answers[0], { exact: true }).check();
      else await items.nth(index).getByRole("textbox").fill(exercise.answers[0]);
    }
    await page.getByRole("button", { name: "Nộp bài" }).click();
    await page.getByText("5/8 câu đúng").waitFor();
    await page.getByText("Đã lưu vào tiến độ học của bạn.").waitFor();

    await page.goto(`${BASE}/ielts/listening-practice-test-1`);
    await page.getByRole("button", { name: "Bắt đầu làm bài" }).click();
    await page.locator("#cau-7").getByRole("textbox").fill("Marlow");
    await page.reload(); // tải lại giữa chừng: bài làm dở vẫn còn
    await page.getByRole("button", { name: "Tiếp tục bài đang làm" }).click();
    assert.equal(await page.locator("#cau-7").getByRole("textbox").inputValue(), "Marlow");
    await page.getByRole("button", { name: "Nộp bài" }).first().click();
    await page.getByRole("dialog").getByRole("button", { name: "Nộp bài" }).click();
    await page.getByText("Kết quả đã được lưu.").waitFor();

    await page.goto(`${BASE}/tai-khoan`);
    const grammar = page.getByRole("row", { name: /Quá khứ đơn/ });
    await grammar.getByText("5/8").waitFor();
    const ielts = page.getByRole("row", { name: /Listening Practice Test 1/ });
    await ielts.getByText("1/40").waitFor();
    await ielts.getByText("1.0", { exact: true }).waitFor();
    await page.context().close();
  });
});

describe("lớp Callan: đăng ký → chuyển khoản → admin duyệt → lịch học + link Meet", () => {
  test("admin điền thông tin tổ chức, tài khoản ngân hàng, mở gói học, cấp quyền giáo viên, tạo lớp và lịch", async () => {
    const page = await newPage();
    await login(page, "admin", "/quan-tri");
    await page.getByRole("heading", { name: "Việc nên làm trước khi mở web" }).waitFor();

    await page.getByRole("link", { name: "Cài đặt" }).click();
    await page.getByLabel("Tên tổ chức / thương hiệu").fill(`Trung tâm ${run}`);
    await page.getByLabel("Điện thoại", { exact: true }).fill("028 1234 5678");
    await page.getByLabel("Địa chỉ").fill("12 Đường Thử Nghiệm, Quận 1");
    await page.getByRole("button", { name: "Lưu thông tin liên hệ" }).click();
    await toast(page, "Đã lưu cài đặt.");
    await page.getByLabel("Ngân hàng", { exact: true }).fill("Ngân hàng Thử");
    await page.getByLabel("Mã ngân hàng cho mã QR (BIN)").fill("970436");
    await page.getByLabel("Số tài khoản").fill("0123456789");
    await page.getByLabel("Tên chủ tài khoản").fill("TRUNG TAM THU");
    await page.getByRole("button", { name: "Lưu thông tin thanh toán" }).click();
    await toast(page, "Đã lưu cài đặt.");

    await page.getByRole("link", { name: "Gói học", exact: true }).click();
    await page.getByRole("button", { name: "Thêm gói" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Tên gói").fill(names.pkg);
    await dialog.getByLabel("Số buổi").fill("8");
    await dialog.getByLabel("Học phí (VNĐ)").fill("1600000");
    await dialog.getByText("Mở gói này cho học viên đăng ký").click();
    await dialog.getByRole("button", { name: "Lưu" }).click();
    await toast(page, "Đã lưu gói học.");
    await page.locator("li", { hasText: names.pkg }).getByText("Đang mở").waitFor();

    await page.getByRole("link", { name: "Người dùng" }).click();
    await page.getByPlaceholder("Tìm theo tên hoặc email…").fill(people.teacher.email);
    await page.getByRole("button", { name: "Tìm" }).click();
    await page.getByLabel(`Vai trò của ${people.teacher.name}`).selectOption("teacher");
    await toast(page, "Đã đổi vai trò.");
    await page.getByPlaceholder("Tìm theo tên hoặc email…").fill(people.admin.email);
    await page.getByRole("button", { name: "Tìm" }).click();
    await page.getByText("Quản trị viên (bạn)").waitFor();

    await page.getByRole("link", { name: "Lớp & lịch học" }).click();
    await page.getByRole("button", { name: "Tạo lớp" }).click();
    await dialog.getByLabel("Tên lớp").fill(names.klass);
    await dialog.getByLabel("Giáo viên").selectOption({ label: people.teacher.name });
    await dialog.getByLabel("Link Google Meet").fill("javascript:alert(1)");
    await dialog.getByRole("button", { name: "Lưu" }).click();
    // Trình duyệt chặn URL sai định dạng ngay ở ô nhập; database cũng có ràng buộc https.
    assert.equal(await dialog.getByLabel("Tên lớp").isVisible(), true);
    await dialog.getByLabel("Link Google Meet").fill(MEET);
    await dialog.getByLabel("Lịch học cố định (ghi chú)").fill("Thứ 3 & thứ 5, 19:30");
    await dialog.getByRole("button", { name: "Lưu" }).click();
    await toast(page, "Đã lưu lớp học.");

    const card = page.locator("li", { hasText: names.klass });
    await card.getByText(`Giáo viên: ${people.teacher.name}`).waitFor();
    await card.getByRole("button", { name: /Lịch học \(0\)/ }).click();
    await dialog.getByLabel("Số buổi").fill("3");
    await dialog.getByText("Sẽ thêm 3 buổi").waitFor();
    await dialog.getByRole("button", { name: "Thêm 3 buổi" }).click();
    await toast(page, "Đã thêm 3 buổi học.");
    await dialog.getByRole("heading", { name: "Các buổi đã xếp (3)" }).waitFor();
    await page.context().close();
  });

  test("tên tổ chức và liên hệ hiện công khai ngay, không cần build lại", async () => {
    const page = await newPage();
    await page.goto(`${BASE}/lien-he`);
    await page.getByRole("main").getByText("12 Đường Thử Nghiệm, Quận 1").waitFor();
    await page.getByRole("banner").getByText(`Trung tâm ${run}`).waitFor();
    await page.getByRole("contentinfo").getByText("028 1234 5678").waitFor();
    assert.equal(await page.getByText("0123456789").count(), 0, "khách không thấy số tài khoản");
    await page.context().close();
  });

  test("học viên đăng ký, thấy hướng dẫn chuyển khoản, báo đã chuyển; chưa duyệt thì chưa có link Meet", async () => {
    const page = await newPage();
    await login(page, "student", "/callan");
    await page.getByRole("heading", { name: "Phiếu đăng ký" }).waitFor();
    await page.getByText(names.pkg).last().click();
    assert.equal(await page.getByLabel("Họ và tên").inputValue(), people.student.name);
    await page.getByLabel("Số điện thoại (Zalo)").fill("123");
    await page.getByRole("button", { name: "Gửi đăng ký" }).click();
    await page.getByText("Số điện thoại chưa đúng").waitFor();
    await page.getByLabel("Số điện thoại (Zalo)").fill("0901234567");
    await page.getByLabel("Thời gian bạn có thể học").fill("Tối thứ 3 và thứ 5");
    await page.getByRole("button", { name: "Gửi đăng ký" }).click();

    const card = page.locator("article", { hasText: `Đăng ký ${names.pkg}` });
    await card.getByText("Chờ duyệt").waitFor();
    await card.getByText("0123456789").waitFor();
    await card.getByText("1.600.000 ₫").first().waitFor();
    people.student.code = (await card.locator("code").innerText()).trim();
    assert.match(people.student.code, /^CL[0-9A-F]{6}$/);
    assert.equal(await page.getByRole("heading", { name: "Phiếu đăng ký" }).count(), 0, "không cho gửi thêm đơn khi đang có đơn chờ");
    await card.getByRole("button", { name: "Tôi đã chuyển khoản" }).click();
    await card.getByText("Học viên báo đã chuyển khoản").waitFor();

    await page.goto(`${BASE}/tai-khoan`);
    await page.getByText("Học viên báo đã chuyển khoản").waitFor();
    assert.equal(await page.getByRole("link", { name: /Google Meet/ }).count(), 0);
    assert.equal(await page.getByText(names.klass).count(), 0);
    await page.context().close();
  });

  test("admin thấy đơn kèm mã chuyển khoản, duyệt và xếp lớp", async () => {
    const page = await newPage();
    await login(page, "admin", "/quan-tri");
    await page.getByRole("link", { name: /Báo đã chuyển khoản/ }).getByText("1", { exact: true }).waitFor();
    await page.getByRole("link", { name: "Đăng ký Callan" }).click();
    const row = page.locator("li", { hasText: people.student.name });
    await row.getByText(people.student.code).waitFor();
    await row.getByText("Tối thứ 3 và thứ 5").waitFor();
    await row.getByRole("button", { name: "Duyệt & xếp lớp" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Xếp vào lớp").selectOption({ label: `${names.klass} — Thứ 3 & thứ 5, 19:30` });
    await dialog.getByRole("button", { name: "Duyệt", exact: true }).click();
    await toast(page, "Đã duyệt và xếp lớp.");
    await page.getByRole("tab", { name: /Đã duyệt \(/ }).click();
    const approved = page.locator("li", { hasText: people.student.name });
    await approved.getByText("Đã nhận học phí").waitFor();
    await approved.getByText(names.klass).waitFor();
    await page.context().close();
  });

  test("sau khi duyệt, học viên thấy lớp, giáo viên, 3 buổi học và link Google Meet", async () => {
    const page = await newPage();
    await login(page, "student");
    const card = page.locator("article", { hasText: names.klass });
    await card.getByText(`Giáo viên: ${people.teacher.name}`).waitFor();
    assert.equal(await card.getByRole("link", { name: "Vào lớp (Google Meet)" }).getAttribute("href"), MEET);
    assert.equal(await card.locator("ol > li").count(), 3);
    await card.locator("ol > li").first().getByText("19:30").waitFor();
    await page.goto(`${BASE}/callan`);
    await page.locator("article", { hasText: names.klass }).waitFor();
    await page.getByRole("heading", { name: "Đăng ký thêm gói học" }).waitFor();
    await page.context().close();
  });

  test("giáo viên thấy lớp mình dạy, học viên và kết quả của họ; không vào được trang quản trị", async () => {
    const page = await newPage();
    await login(page, "teacher", "/giao-vien");
    const card = page.locator("article", { hasText: names.klass });
    await card.getByText("Lớp bạn dạy").waitFor();
    await card.getByRole("row", { name: new RegExp(people.student.name) }).getByText("0901234567").waitFor();
    assert.equal(await card.getByRole("link", { name: "Vào lớp (Google Meet)" }).getAttribute("href"), MEET);

    const nav = page.getByRole("navigation", { name: "Khu vực quản trị" });
    await nav.getByRole("link", { name: "Kết quả học viên" }).click();
    await page.getByRole("row", { name: new RegExp(people.student.name) }).getByText("1/40").waitFor();
    await page.getByRole("tab", { name: /Bài tập ngữ pháp/ }).click();
    await page.getByRole("row", { name: new RegExp(people.student.name) }).getByText("5/8").waitFor();

    assert.equal(await nav.getByRole("link", { name: "Người dùng" }).count(), 0);
    assert.equal(await nav.getByRole("link", { name: "Từ vựng" }).count(), 1);
    for (const url of ["/quan-tri", "/quan-tri/nguoi-dung", "/quan-tri/dang-ky", "/quan-tri/cai-dat"]) {
      await page.goto(`${BASE}${url}`);
      await page.getByText("Bạn không có quyền truy cập trang này.").waitFor();
    }
    await page.context().close();

    const student = await newPage();
    await login(student, "student");
    for (const url of ["/quan-tri", "/giao-vien", "/quan-tri/tu-vung"]) {
      await student.goto(`${BASE}${url}`);
      await student.getByText("Bạn không có quyền truy cập trang này.").waitFor();
    }
    await student.context().close();
  });
});

describe("soạn nội dung", () => {
  test("giáo viên thêm chủ đề + từ mới: người học xem được ngay ở đường dẫn mới (trang dự phòng)", async () => {
    const page = await newPage();
    await login(page, "teacher", "/quan-tri/tu-vung");
    await page.getByRole("button", { name: "Thêm chủ đề" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Tên tiếng Việt").fill(names.topicVi);
    await dialog.getByLabel("Tên tiếng Anh").fill(names.topicEn);
    assert.equal(await dialog.getByLabel("Slug (đường dẫn)").inputValue(), names.topicSlug);
    await dialog.getByText("Xuất bản (người học nhìn thấy)").click(); // lưu ở dạng nháp trước
    await dialog.getByRole("button", { name: "Lưu" }).click();
    await toast(page, "Đã lưu chủ đề.");
    await page.getByText("Bản nháp (người học chưa thấy)").waitFor();
    await page.getByRole("button", { name: "Thêm từ" }).click();
    await dialog.getByLabel("Từ / cụm từ").fill("lighthouse");
    await dialog.getByLabel("Phiên âm IPA").fill("/ˈlaɪthaʊs/");
    await dialog.getByLabel("Nghĩa tiếng Việt").fill("ngọn hải đăng");
    await dialog.getByLabel("Câu ví dụ (tiếng Anh)").fill("The lighthouse guides ships at night.");
    await dialog.getByRole("button", { name: "Lưu", exact: true }).click();
    await toast(page, "Đã lưu từ.");
    await page.getByRole("row", { name: /lighthouse/ }).getByText("ngọn hải đăng").waitFor();

    // Bản nháp: khách không thấy, giáo viên xem trước được.
    const guest = await newPage();
    const draftResponse = await guest.goto(`${BASE}/tu-vung/${names.topicSlug}`);
    assert.equal(draftResponse.status(), 404);
    await guest.getByText("Không tìm thấy chủ đề này").waitFor();
    await page.goto(`${BASE}/tu-vung/${names.topicSlug}`);
    await page.getByText("Bản nháp.").waitFor();
    await page.getByText("ngọn hải đăng").waitFor();

    await page.goto(`${BASE}/quan-tri/tu-vung`);
    await page.getByRole("button", { name: new RegExp(names.topicVi) }).click();
    await page.getByRole("button", { name: "Sửa chủ đề" }).click();
    await dialog.getByText("Xuất bản (người học nhìn thấy)").click();
    await dialog.getByRole("button", { name: "Lưu" }).click();
    await toast(page, "Đã lưu chủ đề.");

    await guest.reload();
    await guest.getByRole("heading", { name: new RegExp(names.topicVi) }).waitFor();
    await guest.getByText("ngọn hải đăng").waitFor();
    await guest.getByRole("button", { name: "Nghe phát âm: lighthouse" }).click();
    assert.deepEqual(await spoken(guest), ["lighthouse"]);
    await guest.goto(`${BASE}/tu-vung`);
    await guest.getByRole("link", { name: new RegExp(names.topicVi) }).waitFor();
    await guest.context().close();
    await page.context().close();
  });

  test("sửa bài ngữ pháp trong trang quản trị: người học thấy nội dung mới, bài tập không bị mất", async () => {
    const page = await newPage();
    await login(page, "admin", "/quan-tri/ngu-phap");
    await page.getByRole("row", { name: /Hiện tại đơn/ }).getByRole("button", { name: "Sửa" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Tóm tắt một câu").fill(`Tóm tắt đã sửa ${run}.`);
    await dialog.getByRole("group", { name: /Bài tập \(8 câu\)/ }).waitFor();
    // Xóa trắng đáp án của câu 1 → không cho lưu.
    await dialog.getByLabel("Đáp án đúng").first().fill("");
    await dialog.getByRole("button", { name: "Lưu bài học" }).click();
    await dialog.getByText("Câu 1: chưa có đáp án.").waitFor();
    await dialog.getByLabel("Đáp án đúng").first().fill("goes");
    await dialog.getByRole("button", { name: "Lưu bài học" }).click();
    await toast(page, "Đã lưu bài học.");

    const guest = await newPage();
    await guest.goto(`${BASE}/ngu-phap/present-simple`);
    await guest.getByText(`Tóm tắt đã sửa ${run}.`).waitFor();
    assert.equal(await guest.locator("form ol > li").count(), 8);
    await guest.context().close();
    await page.context().close();
  });

  test("soạn đề IELTS mới: kiểm tra hợp lệ, lưu, người học làm bài và được chấm bằng đáp án vừa nhập", async () => {
    const page = await newPage();
    await login(page, "teacher", "/quan-tri/ielts");
    await page.getByRole("button", { name: "Đề Reading", exact: true }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Tên đề").fill(names.ieltsTitle);
    assert.equal(await dialog.getByLabel("Slug (đường dẫn)").inputValue(), names.ieltsSlug);
    await dialog.getByLabel("Thời gian làm bài (phút)").fill("5");
    await dialog.getByLabel("Tiêu đề bài đọc").fill("The Old Lighthouse");
    await dialog.getByLabel("Bài đọc", { exact: true }).fill("The lighthouse was built in 1890.\n\nIt was painted white and red.");
    await dialog.getByRole("button", { name: "Thêm nhóm câu hỏi" }).click();
    await dialog.getByLabel("Dạng câu hỏi").selectOption("tfng");
    await dialog.getByLabel("Yêu cầu của nhóm").fill("Questions 1–2. TRUE, FALSE or NOT GIVEN?");
    await dialog.getByRole("button", { name: "Thêm câu hỏi" }).click();
    await dialog.getByRole("button", { name: "Thêm câu hỏi" }).click();
    await dialog.getByLabel("Nội dung câu hỏi").nth(0).fill("The lighthouse was built in the nineteenth century.");
    await dialog.getByLabel("Nội dung câu hỏi").nth(1).fill("The lighthouse was painted blue.");
    await dialog.getByLabel("Đáp án").nth(0).fill("TRUE");
    await dialog.getByLabel("Đáp án").nth(1).fill("MAYBE");
    await dialog.getByLabel("Giải thích (hiện sau khi nộp bài)").nth(1).fill(`Giải thích bí mật ${run}`);
    await dialog.getByText("Xuất bản (người học nhìn thấy)").click();
    await dialog.getByRole("button", { name: "Lưu đề thi" }).click();
    await dialog.getByText("Câu 2: đáp án phải là một trong: TRUE, FALSE, NOT GIVEN.").waitFor();
    await dialog.getByLabel("Đáp án").nth(1).fill("FALSE");
    await dialog.getByRole("button", { name: "Lưu đề thi" }).click();
    await toast(page, "Đã lưu đề thi.");
    await page.getByRole("row", { name: new RegExp(names.ieltsTitle) }).getByText("Đã xuất bản").waitFor();
    assert.equal(await page.getByRole("row", { name: new RegExp(names.ieltsTitle) }).getByRole("cell").nth(2).innerText(), "2");

    const guest = await newPage();
    const bodies = [];
    guest.on("response", async (response) => {
      if (response.url().includes("/rest/v1/") && !response.url().includes("/rpc/")) bodies.push(await response.text().catch(() => ""));
    });
    await guest.goto(`${BASE}/ielts`);
    await guest.locator("li", { hasText: names.ieltsTitle }).getByRole("link", { name: "Làm bài" }).click();
    await guest.getByRole("button", { name: "Bắt đầu làm bài" }).click();
    await guest.getByRole("heading", { name: "The Old Lighthouse" }).waitFor();
    await guest.locator("#cau-1").getByText("TRUE", { exact: true }).click();
    await guest.locator("#cau-2").getByText("TRUE", { exact: true }).click();
    assert.ok(!bodies.some((body) => body.includes("Giải thích bí mật")), "đáp án của đề mới không lộ trước khi nộp");
    await guest.getByRole("button", { name: "Nộp bài" }).first().click();
    await guest.getByRole("dialog").getByRole("button", { name: "Nộp bài" }).click();
    await guest.getByText("1/2").waitFor();
    await guest.getByText(`Giải thích bí mật ${run}`).waitFor();
    await guest.context().close();
    await page.context().close();
  });
});

describe("PWA", () => {
  test("có manifest + biểu tượng; trang đã mở xem lại được khi mất mạng", async () => {
    const page = await newPage();
    await page.goto(BASE);
    const manifestUrl = await page.locator('link[rel="manifest"]').getAttribute("href");
    const manifest = await (await page.request.get(new URL(manifestUrl, BASE).href)).json();
    assert.equal(manifest.display, "standalone");
    for (const icon of manifest.icons) assert.equal((await page.request.get(`${BASE}${icon.src}`)).status(), 200, icon.src);

    await page.waitForFunction(() => navigator.serviceWorker.controller !== null, null, { timeout: 15_000 });
    await page.goto(`${BASE}/ngu-phap/present-simple`);
    await page.getByRole("heading", { name: "Thì Hiện tại đơn" }).waitFor();
    await page.waitForLoadState("networkidle");
    await page.context().setOffline(true);
    await page.reload();
    await page.getByRole("heading", { name: "Thì Hiện tại đơn" }).waitFor();
    await page.getByRole("heading", { name: "Công thức" }).waitFor();
    await page.goto(`${BASE}/trang-chua-tung-mo`).catch(() => {});
    await page.getByRole("heading", { name: "Bạn đang ngoại tuyến" }).waitFor();
    await page.context().close();
  });
});

test("không có lỗi JavaScript hay lỗi console nào trong suốt các luồng trên", () => {
  assert.deepEqual(problems, []);
});
