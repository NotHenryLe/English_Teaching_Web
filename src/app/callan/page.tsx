import { MessageCircleQuestion, Repeat, SpellCheck, Zap } from "lucide-react";
import type { Metadata } from "next";
import { CallanEnroll } from "@/components/callan-views";
import { PageHeader } from "@/components/ui";
import { getCallanPackages } from "@/lib/content-source";

export const metadata: Metadata = {
  title: "Lớp tiếng Anh giao tiếp theo phương pháp Callan",
  description: "Giới thiệu phương pháp Callan: học qua hỏi – đáp tốc độ nhanh, nói thành câu hoàn chỉnh, ôn tập có hệ thống. Đăng ký lớp trực tuyến qua Google Meet.",
};

const PRINCIPLES = [
  {
    icon: MessageCircleQuestion,
    title: "Học qua hỏi – đáp",
    text: "Giáo viên đặt câu hỏi liên tục, học viên trả lời ngay bằng tiếng Anh. Phần lớn thời gian trong lớp là nghe và nói.",
  },
  {
    icon: Zap,
    title: "Tốc độ nhanh",
    text: "Giáo viên nói ở tốc độ tự nhiên và hỏi dồn dập để bạn quen phản xạ, không kịp dịch thầm sang tiếng Việt.",
  },
  {
    icon: SpellCheck,
    title: "Trả lời đủ câu, sửa lỗi ngay",
    text: "Bạn trả lời bằng câu hoàn chỉnh; lỗi phát âm và ngữ pháp được giáo viên sửa ngay tại chỗ để không thành thói quen.",
  },
  {
    icon: Repeat,
    title: "Lặp lại và ôn tập có hệ thống",
    text: "Từ và cấu trúc mới được nhắc lại nhiều lần qua các buổi, nên bạn nhớ nhờ dùng thường xuyên thay vì học thuộc lòng.",
  },
];

const STEPS = [
  ["Gửi đăng ký", "Đăng nhập, chọn gói học phù hợp và điền phiếu đăng ký ở cuối trang này."],
  ["Chuyển khoản học phí", "Làm theo hướng dẫn thanh toán hiện ra sau khi gửi đăng ký, ghi đúng mã nội dung chuyển khoản."],
  ["Chờ duyệt và xếp lớp", "Trung tâm xác nhận học phí, xếp bạn vào lớp phù hợp với trình độ và thời gian bạn chọn."],
  ["Nhận lịch học và link Google Meet", "Lịch từng buổi cùng link vào lớp hiện trong trang Tài khoản của bạn."],
];

export default async function CallanPage() {
  const packages = await getCallanPackages();
  return (
    <div className="container-page py-10">
      <PageHeader
        eyebrow="Khóa học có phí · Trực tuyến qua Google Meet"
        title="Lớp giao tiếp theo phương pháp Callan"
        description="Dành cho người muốn nói tiếng Anh nhiều hơn và phản xạ nhanh hơn. Lớp nhỏ, học trực tuyến cùng giáo viên theo lịch cố định."
      >
        <a href="#dang-ky-hoc" className="btn btn-primary mt-5">
          Đăng ký học
        </a>
      </PageHeader>

      <section aria-labelledby="callan-la-gi" className="mb-12 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <h2 id="callan-la-gi" className="text-2xl font-extrabold tracking-tight">
            Phương pháp Callan là gì?
          </h2>
          <div className="prose-lesson mt-3 max-w-prose leading-relaxed">
            <p>
              Phương pháp Callan (Callan Method) do thầy Robin Callan xây dựng tại Anh từ những năm 1960. Đây là phương pháp dạy trực tiếp: lớp học dùng hoàn
              toàn tiếng Anh và xoay quanh các câu hỏi – câu trả lời giữa giáo viên với học viên.
            </p>
            <p>
              Thay vì nghe giảng rồi làm bài tập viết, bạn nghe câu hỏi và phải trả lời ngay thành câu đầy đủ. Từ vựng và ngữ pháp được đưa vào từng chút một
              theo các cấp độ (Stage) từ dễ đến khó, và được lặp lại liên tục ở những buổi sau.
            </p>
            <p>
              Một buổi học thường gồm ba phần: ôn lại bài cũ, học từ và cấu trúc mới qua hỏi – đáp, sau đó luyện đọc và viết chính tả để củng cố.
            </p>
          </div>
        </div>
        <div className="rounded-[1.25rem] border-[1.5px] border-sun-400 bg-sun-50 p-6">
          <h3 className="text-lg font-bold">Lớp này hợp với bạn nếu…</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed">
            <li>Bạn hiểu ngữ pháp, đọc được nhưng ngại nói hoặc nói chậm.</li>
            <li>Bạn cần giao tiếp cho công việc, phỏng vấn hay du lịch.</li>
            <li>Bạn muốn học có giáo viên sửa lỗi phát âm trực tiếp.</li>
            <li>Bạn theo được lịch học đều đặn mỗi tuần.</li>
          </ul>
          <p className="mt-4 text-sm text-muted">
            Phương pháp này tập trung vào nghe – nói. Nếu mục tiêu chính của bạn là luyện đọc, viết học thuật, hãy kết hợp với các bài học miễn phí trên web.
          </p>
        </div>
      </section>

      <section aria-labelledby="nguyen-tac" className="mb-12">
        <h2 id="nguyen-tac" className="text-2xl font-extrabold tracking-tight">
          Bốn điểm khác biệt trong lớp học
        </h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {PRINCIPLES.map((item) => (
            <li key={item.title} className="card flex gap-4 p-5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                <item.icon size={22} aria-hidden />
              </span>
              <div>
                <p className="font-bold">{item.title}</p>
                <p className="mt-1 text-sm text-muted">{item.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="quy-trinh" className="mb-12">
        <h2 id="quy-trinh" className="text-2xl font-extrabold tracking-tight">
          Quy trình đăng ký
        </h2>
        <ol className="mt-4 grid gap-4 md:grid-cols-4">
          {STEPS.map(([title, text], index) => (
            <li key={title} className="card p-5">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-sm font-bold text-white">{index + 1}</span>
              <p className="mt-3 font-bold">{title}</p>
              <p className="mt-1 text-sm text-muted">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <CallanEnroll initialPackages={packages} />
    </div>
  );
}
