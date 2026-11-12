import { BookOpenText, GraduationCap, Headphones, Mic, PenLine, Video } from "lucide-react";
import Link from "next/link";
import { HomeHeroCard, type HeroWord } from "@/components/home-hero-card";
import { getIeltsTests, getTenses, getVocabTopic, getVocabTopics } from "@/lib/content-source";

export default async function HomePage() {
  const [topics, tenses, tests] = await Promise.all([getVocabTopics(), getTenses(), getIeltsTests()]);
  const wordCount = topics.reduce((sum, topic) => sum + (topic.word_count ?? 0), 0);
  const sample = topics[0] ? await getVocabTopic(topics[0].slug) : null;
  const heroWords: HeroWord[] = (sample?.words ?? []).slice(0, 5).map((word) => ({
    word: word.word,
    ipa: word.ipa,
    meaning: word.meaning_vi,
    example: word.example_en,
  }));

  const features = [
    {
      href: "/tu-vung",
      icon: BookOpenText,
      title: "Từ vựng theo chủ đề",
      text: "Gia đình, ăn uống, du lịch, công việc… mỗi từ có phiên âm, nghĩa, câu ví dụ và nút nghe.",
      stat: `${topics.length} chủ đề · ${wordCount} từ`,
      tone: "bg-brand-50 text-brand-700",
    },
    {
      href: "/ngu-phap",
      icon: PenLine,
      title: "12 thì kèm bài tập",
      text: "Công thức, cách dùng, dấu hiệu nhận biết giải thích bằng tiếng Việt. Làm bài là có đáp án và lời giải.",
      stat: `${tenses.length} thì · chấm điểm ngay`,
      tone: "bg-sun-100 text-sun-700",
    },
    {
      href: "/ielts",
      icon: Headphones,
      title: "Thi thử IELTS",
      text: "Đề Listening và Reading đúng cấu trúc bài thi, có đồng hồ đếm giờ, chấm điểm và quy đổi band.",
      stat: `${tests.length} đề · Listening & Reading`,
      tone: "bg-good-50 text-good-700",
    },
    {
      href: "/phat-am",
      icon: Mic,
      title: "Luyện phát âm",
      text: "Gõ từ hoặc câu bất kỳ để nghe giọng Anh-Mỹ, Anh-Anh, tra phiên âm IPA và nghĩa của từ.",
      stat: "Nghe chậm · tra từ điển",
      tone: "bg-bad-50 text-bad-700",
    },
  ];

  return (
    <>
      <section className="relative overflow-hidden border-b-[1.5px] border-line">
        <div
          aria-hidden
          className="absolute inset-0 opacity-60 [background-image:linear-gradient(to_bottom,transparent_calc(100%-1px),var(--color-line)_calc(100%-1px))] [background-size:100%_2.25rem]"
        />
        <div className="container-page relative grid items-center gap-12 py-14 lg:grid-cols-[1.15fr_1fr] lg:py-20">
          <div>
            <p className="chip chip-sun mb-5 !text-sm">Miễn phí · Học trên điện thoại và máy tính</p>
            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Học tiếng Anh <span className="text-brand-600">miễn phí</span>, giải thích dễ hiểu cho người Việt
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted text-pretty">
              Từ vựng có phát âm, 12 thì kèm bài tập, đề thi thử IELTS Listening &amp; Reading. Mở trang là học được ngay, không cần cài đặt.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/tu-vung" className="btn btn-primary !min-h-12 !px-6 !text-base">
                Bắt đầu với từ vựng
              </Link>
              <Link href="/ielts" className="btn btn-outline !min-h-12 !px-6 !text-base">
                Thi thử IELTS
              </Link>
            </div>
          </div>
          <HomeHeroCard words={heroWords} />
        </div>
      </section>

      <section className="container-page py-14" aria-labelledby="hoc-gi">
        <h2 id="hoc-gi" className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          Bạn muốn học gì hôm nay?
        </h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {features.map((feature) => (
            <Link key={feature.href} href={feature.href} className="card group flex gap-4 p-5 transition-transform hover:-translate-y-0.5 sm:p-6">
              <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${feature.tone}`}>
                <feature.icon size={24} aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block text-lg font-bold group-hover:text-brand-700">{feature.title}</span>
                <span className="mt-1 block text-sm text-muted">{feature.text}</span>
                <span className="mt-3 block text-sm font-semibold text-ink">{feature.stat}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page" aria-labelledby="callan">
        <div className="relative overflow-hidden rounded-[1.75rem] bg-brand-800 px-6 py-10 text-white sm:px-10 sm:py-12">
          <div aria-hidden className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-brand-600" />
          <div aria-hidden className="absolute -bottom-16 right-24 h-40 w-40 rounded-full bg-sun-400/90" />
          <div className="relative max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-semibold">
              <Video size={16} aria-hidden /> Lớp trực tuyến qua Google Meet
            </p>
            <h2 id="callan" className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Muốn nói tiếng Anh nhiều hơn? Thử lớp giao tiếp theo phương pháp Callan
            </h2>
            <p className="mt-3 text-white/85">
              Giáo viên hỏi liên tục, bạn trả lời thành câu hoàn chỉnh — nghe và nói gần như suốt buổi học. Đăng ký theo gói buổi học phù hợp với
              nhu cầu của bạn.
            </p>
            <Link href="/callan" className="btn btn-sun mt-6 !min-h-12 !px-6 !text-base">
              Tìm hiểu lớp Callan
            </Link>
          </div>
        </div>
      </section>

      <section className="container-page py-14" aria-labelledby="cach-hoc">
        <h2 id="cach-hoc" className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          Học thế nào cho hiệu quả?
        </h2>
        <ol className="mt-6 grid gap-5 md:grid-cols-3">
          {[
            ["Nghe và nhắc lại", "Mỗi ngày chọn một chủ đề từ vựng, bấm loa nghe rồi đọc to theo. 15 phút đều đặn tốt hơn 2 tiếng dồn một lần."],
            ["Hiểu rồi làm bài", "Đọc phần công thức và cách dùng của một thì, sau đó làm bài tập ngay để nhớ lâu. Sai câu nào xem lời giải câu đó."],
            ["Đo tiến bộ", "Đăng ký tài khoản miễn phí để lưu điểm bài tập và kết quả thi thử IELTS, nhìn lại sau mỗi tuần."],
          ].map(([title, text], index) => (
            <li key={title} className="card p-6">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-sm font-bold text-white">{index + 1}</span>
              <p className="mt-4 text-lg font-bold">{title}</p>
              <p className="mt-1 text-sm text-muted">{text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-[1.25rem] border-[1.5px] border-sun-400 bg-sun-50 p-6">
          <div className="flex items-center gap-4">
            <GraduationCap size={36} className="shrink-0 text-sun-700" aria-hidden />
            <div>
              <p className="text-lg font-bold">Tạo tài khoản miễn phí để lưu tiến độ học</p>
              <p className="text-sm text-muted">Đăng nhập bằng Google hoặc email. Không cần tài khoản vẫn học được toàn bộ nội dung.</p>
            </div>
          </div>
          <Link href="/dang-ky" className="btn btn-primary">
            Đăng ký miễn phí
          </Link>
        </div>
      </section>
    </>
  );
}
