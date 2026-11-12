// Nội dung mẫu: 12 thì tiếng Anh, mỗi thì gồm công thức, cách dùng, dấu hiệu nhận biết,
// lưu ý và 8 câu bài tập (4 trắc nghiệm + 4 điền từ).
// Nguồn sinh supabase/seed.sql và là nội dung dự phòng khi chưa nối database.
import type { TenseFormula, TenseUsage, TimeGroup } from "../src/lib/types";

export interface SeedExercise {
  prompt: string;
  /** Có options → câu trắc nghiệm; không có → câu điền từ. */
  options?: string[];
  /** Các đáp án được chấp nhận (không phân biệt hoa thường). */
  answers: string[];
  explanation_vi: string;
}

export interface SeedTense {
  slug: string;
  name_en: string;
  name_vi: string;
  time_group: TimeGroup;
  summary_vi: string;
  formulas: TenseFormula[];
  usages: TenseUsage[];
  signals: string[];
  notes_vi: string;
  exercises: SeedExercise[];
}

const f = (label: string, pattern: string, example_en: string, example_vi: string): TenseFormula => ({
  label,
  pattern,
  example_en,
  example_vi,
});
const u = (text_vi: string, example_en: string, example_vi: string): TenseUsage => ({ text_vi, example_en, example_vi });

export const TENSES_SEED: SeedTense[] = [
  {
    slug: "present-simple",
    name_en: "Present Simple",
    name_vi: "Hiện tại đơn",
    time_group: "present",
    summary_vi: "Diễn tả thói quen, sự thật hiển nhiên và lịch trình cố định.",
    formulas: [
      f("Khẳng định", "S + V(s/es) + O", "She works in a bank.", "Cô ấy làm việc ở ngân hàng."),
      f("Phủ định", "S + do/does + not + V", "He doesn't eat meat.", "Anh ấy không ăn thịt."),
      f("Nghi vấn", "Do/Does + S + V?", "Do you live near here?", "Bạn sống gần đây à?"),
      f("Với động từ to be", "S + am/is/are (+ not) + …", "They are students.", "Họ là học sinh."),
    ],
    usages: [
      u("Thói quen, hành động lặp đi lặp lại", "I get up at six every day.", "Tôi thức dậy lúc sáu giờ mỗi ngày."),
      u("Sự thật hiển nhiên, chân lý", "The sun rises in the east.", "Mặt trời mọc ở hướng đông."),
      u("Lịch trình, thời gian biểu cố định", "The train leaves at 7 p.m.", "Tàu khởi hành lúc 7 giờ tối."),
      u("Trạng thái, cảm xúc, sở thích", "She likes coffee.", "Cô ấy thích cà phê."),
    ],
    signals: ["always", "usually", "often", "sometimes", "rarely", "never", "every day", "on Mondays", "once a week"],
    notes_vi:
      "Với he / she / it, động từ thêm -s. Thêm -es sau o, s, x, z, ch, sh (goes, watches); phụ âm + y đổi thành -ies (study → studies); have → has.\n\nSau does / doesn't, động từ trở về dạng nguyên mẫu: “Does she work?” (không phải “Does she works?”).",
    exercises: [
      {
        prompt: "My sister ___ to school by bus every day.",
        options: ["go", "goes", "going", "is go"],
        answers: ["goes"],
        explanation_vi: "“My sister” là ngôi thứ ba số ít nên động từ go thêm -es.",
      },
      {
        prompt: "___ your parents live in Hanoi?",
        options: ["Do", "Does", "Are", "Is"],
        answers: ["Do"],
        explanation_vi: "Chủ ngữ số nhiều “your parents” đi với trợ động từ Do.",
      },
      {
        prompt: "Water ___ at 100 degrees Celsius.",
        options: ["boil", "boils", "is boiling", "boiled"],
        answers: ["boils"],
        explanation_vi: "Sự thật hiển nhiên dùng hiện tại đơn; “water” là danh từ không đếm được nên động từ thêm -s.",
      },
      {
        prompt: "He ___ coffee. He prefers tea.",
        options: ["don't like", "doesn't like", "isn't like", "not likes"],
        answers: ["doesn't like"],
        explanation_vi: "Phủ định với he: does + not + động từ nguyên mẫu.",
      },
      {
        prompt: "She ___ (study) English on Mondays and Fridays.",
        answers: ["studies"],
        explanation_vi: "Phụ âm + y → bỏ y thêm -ies: study → studies.",
      },
      {
        prompt: "We ___ (not / work) at weekends.",
        answers: ["do not work", "don't work"],
        explanation_vi: "Phủ định với we: do not (don't) + động từ nguyên mẫu.",
      },
      {
        prompt: "The film ___ (start) at 8 p.m. tonight.",
        answers: ["starts"],
        explanation_vi: "Lịch chiếu phim là lịch trình cố định nên dùng hiện tại đơn.",
      },
      {
        prompt: "___ (he / play) football every Sunday?",
        answers: ["Does he play"],
        explanation_vi: "Câu hỏi với he: Does + he + động từ nguyên mẫu.",
      },
    ],
  },
  {
    slug: "present-continuous",
    name_en: "Present Continuous",
    name_vi: "Hiện tại tiếp diễn",
    time_group: "present",
    summary_vi: "Diễn tả hành động đang xảy ra lúc nói hoặc kế hoạch đã sắp xếp trong tương lai gần.",
    formulas: [
      f("Khẳng định", "S + am/is/are + V-ing", "I am cooking dinner.", "Tôi đang nấu bữa tối."),
      f("Phủ định", "S + am/is/are + not + V-ing", "She isn't working today.", "Hôm nay cô ấy không làm việc."),
      f("Nghi vấn", "Am/Is/Are + S + V-ing?", "Are you listening?", "Bạn có đang nghe không?"),
    ],
    usages: [
      u("Hành động đang xảy ra ngay lúc nói", "Look! It is raining.", "Nhìn kìa! Trời đang mưa."),
      u("Việc tạm thời quanh thời điểm hiện tại", "She is staying with her aunt this week.", "Tuần này cô ấy đang ở nhờ nhà dì."),
      u("Kế hoạch đã sắp xếp trong tương lai gần", "We are meeting Lan tomorrow.", "Ngày mai chúng tôi sẽ gặp Lan."),
      u("Phàn nàn về thói quen gây khó chịu (với always)", "He is always losing his keys.", "Anh ấy lúc nào cũng làm mất chìa khóa."),
    ],
    signals: ["now", "right now", "at the moment", "at present", "today", "this week", "Look!", "Listen!"],
    notes_vi:
      "Không dùng thì tiếp diễn với động từ chỉ trạng thái như know, like, love, want, need, believe, understand: nói “I know”, không nói “I am knowing”.\n\nQuy tắc thêm -ing: bỏ e cuối (make → making); gấp đôi phụ âm cuối với từ một âm tiết kết thúc bằng nguyên âm + phụ âm (run → running, sit → sitting); ie → ying (lie → lying).",
    exercises: [
      {
        prompt: "Be quiet! The baby ___.",
        options: ["sleeps", "is sleeping", "sleep", "slept"],
        answers: ["is sleeping"],
        explanation_vi: "“Be quiet!” cho thấy hành động đang diễn ra ngay lúc nói.",
      },
      {
        prompt: "I ___ this word. What does it mean?",
        options: ["am not understanding", "don't understand", "not understand", "doesn't understand"],
        answers: ["don't understand"],
        explanation_vi: "understand là động từ trạng thái nên không chia tiếp diễn, dù đang nói về hiện tại.",
      },
      {
        prompt: "We ___ dinner with Minh tomorrow evening.",
        options: ["have", "are having", "has", "having"],
        answers: ["are having"],
        explanation_vi: "Kế hoạch đã hẹn trước trong tương lai gần dùng hiện tại tiếp diễn.",
      },
      {
        prompt: "Look! It ___.",
        options: ["rains", "is raining", "rain", "rained"],
        answers: ["is raining"],
        explanation_vi: "“Look!” là dấu hiệu của hành động đang xảy ra.",
      },
      {
        prompt: "They ___ (watch) TV at the moment.",
        answers: ["are watching", "'re watching"],
        explanation_vi: "at the moment → hiện tại tiếp diễn: are + watching.",
      },
      {
        prompt: "She ___ (not / work) today. She's on holiday.",
        answers: ["is not working", "isn't working", "'s not working"],
        explanation_vi: "Việc tạm thời trong hôm nay: is not + working.",
      },
      {
        prompt: "What ___ (you / do) right now?",
        answers: ["are you doing"],
        explanation_vi: "Câu hỏi: are + you + doing.",
      },
      {
        prompt: "He ___ (run) in the park now.",
        answers: ["is running", "'s running"],
        explanation_vi: "run gấp đôi phụ âm cuối trước khi thêm -ing: running.",
      },
    ],
  },
  {
    slug: "present-perfect",
    name_en: "Present Perfect",
    name_vi: "Hiện tại hoàn thành",
    time_group: "present",
    summary_vi: "Nối quá khứ với hiện tại: việc đã xảy ra nhưng còn liên quan hoặc còn kéo dài đến bây giờ.",
    formulas: [
      f("Khẳng định", "S + have/has + V3/ed", "I have lived here for ten years.", "Tôi đã sống ở đây mười năm rồi."),
      f("Phủ định", "S + have/has + not + V3/ed", "They haven't arrived yet.", "Họ vẫn chưa đến."),
      f("Nghi vấn", "Have/Has + S + V3/ed?", "Have you ever been to Hue?", "Bạn đã bao giờ đến Huế chưa?"),
    ],
    usages: [
      u("Hành động bắt đầu trong quá khứ và kéo dài đến hiện tại", "She has worked here since 2020.", "Cô ấy làm việc ở đây từ năm 2020."),
      u("Trải nghiệm tính đến hiện tại", "I have never eaten sushi.", "Tôi chưa bao giờ ăn sushi."),
      u("Việc vừa mới xảy ra, kết quả còn thấy ở hiện tại", "He has just finished his homework.", "Cậu ấy vừa làm xong bài tập."),
      u("Việc đã xảy ra nhưng không nói rõ thời điểm", "I have lost my keys.", "Tôi làm mất chìa khóa rồi."),
    ],
    signals: ["for", "since", "just", "already", "yet", "ever", "never", "recently", "so far", "up to now"],
    notes_vi:
      "Không dùng hiện tại hoàn thành với thời điểm quá khứ xác định (yesterday, last year, in 2020) — khi đó dùng quá khứ đơn.\n\nfor + khoảng thời gian (for two years); since + mốc thời gian (since 2020).\n\nhave been to: đã đến và đã về; have gone to: đã đi và chưa về.",
    exercises: [
      {
        prompt: "I ___ in this city since 2015.",
        options: ["live", "lived", "have lived", "am living"],
        answers: ["have lived"],
        explanation_vi: "since 2015 → việc bắt đầu trong quá khứ và còn tiếp tục: hiện tại hoàn thành.",
      },
      {
        prompt: "She has worked here ___ five years.",
        options: ["since", "for", "from", "in"],
        answers: ["for"],
        explanation_vi: "“five years” là một khoảng thời gian nên dùng for.",
      },
      {
        prompt: "___ you ever eaten sushi?",
        options: ["Did", "Have", "Do", "Are"],
        answers: ["Have"],
        explanation_vi: "Hỏi về trải nghiệm với ever: Have + S + V3.",
      },
      {
        prompt: "We ___ that film last night.",
        options: ["have seen", "saw", "see", "has seen"],
        answers: ["saw"],
        explanation_vi: "“last night” là thời điểm xác định trong quá khứ nên phải dùng quá khứ đơn.",
      },
      {
        prompt: "He ___ (just / finish) his homework.",
        answers: ["has just finished", "'s just finished"],
        explanation_vi: "just đứng giữa has và phân từ hai.",
      },
      {
        prompt: "I ___ (never / be) to Japan.",
        answers: ["have never been", "'ve never been"],
        explanation_vi: "Trải nghiệm chưa từng có: have never + been.",
      },
      {
        prompt: "They ___ (not / arrive) yet.",
        answers: ["have not arrived", "haven't arrived"],
        explanation_vi: "yet dùng trong câu phủ định của hiện tại hoàn thành.",
      },
      {
        prompt: "___ (you / do) the washing-up yet?",
        answers: ["Have you done"],
        explanation_vi: "Câu hỏi: Have + you + V3 (do → done).",
      },
    ],
  },
  {
    slug: "present-perfect-continuous",
    name_en: "Present Perfect Continuous",
    name_vi: "Hiện tại hoàn thành tiếp diễn",
    time_group: "present",
    summary_vi: "Nhấn mạnh quá trình liên tục của một hành động bắt đầu trong quá khứ và kéo dài đến hiện tại.",
    formulas: [
      f("Khẳng định", "S + have/has + been + V-ing", "I have been learning English for three years.", "Tôi đã học tiếng Anh được ba năm rồi."),
      f("Phủ định", "S + have/has + not + been + V-ing", "He hasn't been sleeping well.", "Dạo này anh ấy ngủ không ngon."),
      f("Nghi vấn", "Have/Has + S + been + V-ing?", "How long have you been waiting?", "Bạn đợi được bao lâu rồi?"),
    ],
    usages: [
      u("Nhấn mạnh thời lượng của hành động kéo dài đến hiện tại", "It has been raining since this morning.", "Trời mưa suốt từ sáng đến giờ."),
      u("Hành động vừa kết thúc và để lại dấu hiệu ở hiện tại", "She is tired because she has been running.", "Cô ấy mệt vì vừa chạy bộ."),
    ],
    signals: ["for", "since", "all day", "all morning", "how long", "lately", "recently"],
    notes_vi:
      "Hiện tại hoàn thành nhấn mạnh kết quả hoặc số lượng (“I have read three books”); hiện tại hoàn thành tiếp diễn nhấn mạnh quá trình hoặc thời lượng (“I have been reading all day”).\n\nKhông dùng với động từ trạng thái: “I have known her for years” (không phải “have been knowing”).",
    exercises: [
      {
        prompt: "It ___ since this morning.",
        options: ["rains", "is raining", "has been raining", "rained"],
        answers: ["has been raining"],
        explanation_vi: "since this morning + nhấn mạnh sự liên tục → hiện tại hoàn thành tiếp diễn.",
      },
      {
        prompt: "How long ___ you been waiting?",
        options: ["are", "have", "do", "did"],
        answers: ["have"],
        explanation_vi: "How long + have + S + been + V-ing.",
      },
      {
        prompt: "I ___ her for ten years.",
        options: ["have been knowing", "have known", "am knowing", "know"],
        answers: ["have known"],
        explanation_vi: "know là động từ trạng thái nên dùng hiện tại hoàn thành, không dùng dạng tiếp diễn.",
      },
      {
        prompt: "Your eyes are red. ___ you been crying?",
        options: ["Are", "Have", "Do", "Were"],
        answers: ["Have"],
        explanation_vi: "Dấu hiệu ở hiện tại (mắt đỏ) của một hành động vừa kết thúc.",
      },
      {
        prompt: "She ___ (work) here for two years.",
        answers: ["has been working", "'s been working"],
        explanation_vi: "for two years, vẫn đang làm → has been working.",
      },
      {
        prompt: "We ___ (learn) English since January.",
        answers: ["have been learning", "'ve been learning"],
        explanation_vi: "since January → have been learning.",
      },
      {
        prompt: "He ___ (not / sleep) well lately.",
        answers: ["has not been sleeping", "hasn't been sleeping"],
        explanation_vi: "lately (dạo gần đây) thường đi với hiện tại hoàn thành tiếp diễn.",
      },
      {
        prompt: "How long ___ (they / play) football?",
        answers: ["have they been playing"],
        explanation_vi: "Câu hỏi: have + they + been + playing.",
      },
    ],
  },
  {
    slug: "past-simple",
    name_en: "Past Simple",
    name_vi: "Quá khứ đơn",
    time_group: "past",
    summary_vi: "Diễn tả hành động đã xảy ra và kết thúc hẳn tại một thời điểm xác định trong quá khứ.",
    formulas: [
      f("Khẳng định", "S + V2/ed + O", "I visited Hue last year.", "Năm ngoái tôi đã đi thăm Huế."),
      f("Phủ định", "S + did + not + V", "She didn't send the email.", "Cô ấy đã không gửi email."),
      f("Nghi vấn", "Did + S + V?", "Did you see Nam?", "Bạn có thấy Nam không?"),
      f("Với động từ to be", "S + was/were (+ not) + …", "They were at home last night.", "Tối qua họ ở nhà."),
    ],
    usages: [
      u("Hành động đã kết thúc tại thời điểm xác định trong quá khứ", "We went to Da Lat last summer.", "Mùa hè năm ngoái chúng tôi đi Đà Lạt."),
      u("Chuỗi hành động nối tiếp nhau trong quá khứ", "He got up, had breakfast and went to work.", "Anh ấy thức dậy, ăn sáng rồi đi làm."),
      u("Thói quen trong quá khứ (nay không còn)", "When I was a child, I played outside every day.", "Hồi nhỏ, ngày nào tôi cũng chơi ngoài trời."),
    ],
    signals: ["yesterday", "last night", "last week", "last year", "two days ago", "in 2010", "when I was a child"],
    notes_vi:
      "Động từ có quy tắc thêm -ed: work → worked, live → lived, study → studied, stop → stopped. Động từ bất quy tắc phải học thuộc: go → went, see → saw, buy → bought, have → had.\n\nSau did / didn't, động từ trở về nguyên mẫu: “Did you go?” (không phải “Did you went?”).",
    exercises: [
      {
        prompt: "We ___ to Da Lat last summer.",
        options: ["go", "went", "have gone", "are going"],
        answers: ["went"],
        explanation_vi: "last summer là thời điểm xác định trong quá khứ; go → went.",
      },
      {
        prompt: "She ___ the email yesterday.",
        options: ["doesn't send", "didn't send", "hasn't sent", "wasn't send"],
        answers: ["didn't send"],
        explanation_vi: "Phủ định quá khứ đơn: did + not + động từ nguyên mẫu.",
      },
      {
        prompt: "___ you see Nam at the party?",
        options: ["Do", "Did", "Were", "Have"],
        answers: ["Did"],
        explanation_vi: "Câu hỏi quá khứ đơn với động từ thường: Did + S + V.",
      },
      {
        prompt: "They ___ at home last night.",
        options: ["was", "were", "did", "are"],
        answers: ["were"],
        explanation_vi: "Chủ ngữ số nhiều “they” đi với were.",
      },
      {
        prompt: "I ___ (buy) a new phone two days ago.",
        answers: ["bought"],
        explanation_vi: "buy là động từ bất quy tắc: buy → bought.",
      },
      {
        prompt: "He ___ (not / come) to class yesterday.",
        answers: ["did not come", "didn't come"],
        explanation_vi: "did not + come (nguyên mẫu).",
      },
      {
        prompt: "Where ___ (you / go) last weekend?",
        answers: ["did you go"],
        explanation_vi: "Từ để hỏi + did + S + động từ nguyên mẫu.",
      },
      {
        prompt: "She ___ (study) French when she was at school.",
        answers: ["studied"],
        explanation_vi: "Phụ âm + y → bỏ y thêm -ied: study → studied.",
      },
    ],
  },
  {
    slug: "past-continuous",
    name_en: "Past Continuous",
    name_vi: "Quá khứ tiếp diễn",
    time_group: "past",
    summary_vi: "Diễn tả hành động đang diễn ra tại một thời điểm trong quá khứ, thường làm nền cho một hành động khác xen vào.",
    formulas: [
      f("Khẳng định", "S + was/were + V-ing", "I was watching TV at 8 p.m.", "Lúc 8 giờ tối tôi đang xem tivi."),
      f("Phủ định", "S + was/were + not + V-ing", "They weren't listening.", "Lúc đó họ không lắng nghe."),
      f("Nghi vấn", "Was/Were + S + V-ing?", "Were you sleeping when I called?", "Lúc tôi gọi bạn đang ngủ à?"),
    ],
    usages: [
      u("Hành động đang diễn ra tại một thời điểm xác định trong quá khứ", "At 9 p.m. yesterday, she was doing her homework.", "Lúc 9 giờ tối qua, cô ấy đang làm bài tập."),
      u("Hành động đang diễn ra thì hành động khác xen vào", "I was cooking when the phone rang.", "Tôi đang nấu ăn thì điện thoại reo."),
      u("Hai hành động diễn ra song song", "While she was reading, he was cooking.", "Trong khi cô ấy đọc sách thì anh ấy nấu ăn."),
    ],
    signals: ["at 8 p.m. yesterday", "at that time", "while", "when", "all evening"],
    notes_vi:
      "Hành động dài, đang diễn ra dùng quá khứ tiếp diễn; hành động ngắn xen vào dùng quá khứ đơn.\n\nwhile thường đi với quá khứ tiếp diễn; when thường đi với quá khứ đơn.",
    exercises: [
      {
        prompt: "I ___ a shower when the phone rang.",
        options: ["had", "was having", "am having", "have had"],
        answers: ["was having"],
        explanation_vi: "Hành động đang diễn ra (tắm) bị hành động khác xen vào (điện thoại reo).",
      },
      {
        prompt: "While we ___ dinner, the lights went out.",
        options: ["had", "were having", "have", "are having"],
        answers: ["were having"],
        explanation_vi: "while + quá khứ tiếp diễn cho hành động làm nền.",
      },
      {
        prompt: "What ___ you doing at 9 p.m. last night?",
        options: ["was", "were", "did", "are"],
        answers: ["were"],
        explanation_vi: "you đi với were; có thời điểm xác định trong quá khứ.",
      },
      {
        prompt: "When I arrived, they ___ football, so I sat down and watched.",
        options: ["played", "were playing", "play", "are playing"],
        answers: ["were playing"],
        explanation_vi: "Lúc tôi đến, trận bóng đang diễn ra dở → quá khứ tiếp diễn.",
      },
      {
        prompt: "She ___ (read) a book at ten o'clock last night.",
        answers: ["was reading"],
        explanation_vi: "Thời điểm xác định trong quá khứ → was + reading.",
      },
      {
        prompt: "They ___ (not / listen) when the teacher explained the rule.",
        answers: ["were not listening", "weren't listening"],
        explanation_vi: "Phủ định: were not + listening.",
      },
      {
        prompt: "He ___ (drive) home when it started to rain.",
        answers: ["was driving"],
        explanation_vi: "drive bỏ e trước khi thêm -ing: driving.",
      },
      {
        prompt: "___ (you / sleep) when I called?",
        answers: ["Were you sleeping"],
        explanation_vi: "Câu hỏi: Were + you + sleeping.",
      },
    ],
  },
  {
    slug: "past-perfect",
    name_en: "Past Perfect",
    name_vi: "Quá khứ hoàn thành",
    time_group: "past",
    summary_vi: "Diễn tả hành động đã hoàn tất trước một hành động hoặc thời điểm khác trong quá khứ.",
    formulas: [
      f("Khẳng định", "S + had + V3/ed", "The film had started when we arrived.", "Khi chúng tôi đến thì phim đã bắt đầu rồi."),
      f("Phủ định", "S + had + not + V3/ed", "He hadn't studied English before.", "Trước đó anh ấy chưa từng học tiếng Anh."),
      f("Nghi vấn", "Had + S + V3/ed?", "Had you met him before the party?", "Trước bữa tiệc bạn đã gặp anh ấy chưa?"),
    ],
    usages: [
      u("Hành động xảy ra trước một hành động khác trong quá khứ", "When I got to the station, the train had left.", "Khi tôi đến ga thì tàu đã chạy mất rồi."),
      u("Giải thích nguyên nhân của một việc trong quá khứ", "He was tired because he had worked all day.", "Anh ấy mệt vì đã làm việc cả ngày."),
      u("Câu điều kiện loại 3 (giả định trái với quá khứ)", "If I had studied harder, I would have passed.", "Nếu tôi học chăm hơn thì tôi đã thi đỗ rồi."),
    ],
    signals: ["before", "after", "by the time", "already", "just", "never … before", "when"],
    notes_vi:
      "Hành động xảy ra trước dùng quá khứ hoàn thành, hành động xảy ra sau dùng quá khứ đơn.\n\nNếu các hành động được kể theo đúng trình tự thời gian thì chỉ cần dùng quá khứ đơn.",
    exercises: [
      {
        prompt: "When I got to the station, the train ___.",
        options: ["left", "had left", "has left", "leaves"],
        answers: ["had left"],
        explanation_vi: "Tàu chạy trước khi tôi đến → hành động xảy ra trước dùng quá khứ hoàn thành.",
      },
      {
        prompt: "She ___ never seen snow before she went to Sa Pa.",
        options: ["has", "had", "was", "did"],
        answers: ["had"],
        explanation_vi: "Trải nghiệm tính đến một thời điểm trong quá khứ: had never + V3.",
      },
      {
        prompt: "After he ___ dinner, he went out.",
        options: ["had eaten", "has eaten", "eats", "was eating"],
        answers: ["had eaten"],
        explanation_vi: "After + quá khứ hoàn thành, rồi đến quá khứ đơn.",
      },
      {
        prompt: "I didn't recognise her because she ___ her hair.",
        options: ["cut", "had cut", "has cut", "cuts"],
        answers: ["had cut"],
        explanation_vi: "Việc cắt tóc xảy ra trước và là nguyên nhân của việc không nhận ra.",
      },
      {
        prompt: "By the time we arrived, they ___ (finish) lunch.",
        answers: ["had finished", "'d finished"],
        explanation_vi: "By the time + quá khứ đơn, mệnh đề còn lại dùng quá khứ hoàn thành.",
      },
      {
        prompt: "He ___ (not / study) English before he moved to London.",
        answers: ["had not studied", "hadn't studied"],
        explanation_vi: "Phủ định: had not + studied.",
      },
      {
        prompt: "___ (you / meet) him before the party?",
        answers: ["Had you met"],
        explanation_vi: "Câu hỏi: Had + you + V3 (meet → met).",
      },
      {
        prompt: "The room was dirty because nobody ___ (clean) it.",
        answers: ["had cleaned"],
        explanation_vi: "Việc không ai dọn xảy ra trước thời điểm căn phòng bẩn.",
      },
    ],
  },
  {
    slug: "past-perfect-continuous",
    name_en: "Past Perfect Continuous",
    name_vi: "Quá khứ hoàn thành tiếp diễn",
    time_group: "past",
    summary_vi: "Nhấn mạnh hành động đã diễn ra liên tục trong một khoảng thời gian, cho đến trước một thời điểm khác trong quá khứ.",
    formulas: [
      f("Khẳng định", "S + had + been + V-ing", "I had been waiting for an hour when the bus came.", "Tôi đã đợi một tiếng thì xe buýt mới đến."),
      f("Phủ định", "S + had + not + been + V-ing", "She hadn't been sleeping well.", "Trước đó cô ấy đã ngủ không ngon."),
      f("Nghi vấn", "Had + S + been + V-ing?", "Had she been waiting long?", "Cô ấy đã đợi lâu chưa?"),
    ],
    usages: [
      u("Hành động kéo dài liên tục đến trước một thời điểm trong quá khứ", "They had been playing for an hour when it started to rain.", "Họ đã chơi được một tiếng thì trời bắt đầu mưa."),
      u("Giải thích nguyên nhân của một tình trạng trong quá khứ", "The ground was wet because it had been raining.", "Mặt đất ướt vì trước đó trời đã mưa."),
    ],
    signals: ["for", "since", "before", "until then", "by the time", "how long"],
    notes_vi:
      "Thường đi kèm for / since để nói về thời lượng.\n\nKhông dùng với động từ trạng thái — khi đó dùng quá khứ hoàn thành: “had known”, không phải “had been knowing”.",
    exercises: [
      {
        prompt: "She was tired because she ___ all day.",
        options: ["worked", "had been working", "has been working", "is working"],
        answers: ["had been working"],
        explanation_vi: "Hành động kéo dài trước đó giải thích cho tình trạng mệt trong quá khứ.",
      },
      {
        prompt: "We ___ for two hours when the bus arrived.",
        options: ["waited", "were waiting", "had been waiting", "have been waiting"],
        answers: ["had been waiting"],
        explanation_vi: "Có thời lượng (for two hours) tính đến một mốc quá khứ (the bus arrived).",
      },
      {
        prompt: "How long ___ he been studying before he took the test?",
        options: ["has", "had", "was", "did"],
        answers: ["had"],
        explanation_vi: "Mốc so sánh nằm trong quá khứ (took the test) nên dùng had been.",
      },
      {
        prompt: "The road was wet. It ___.",
        options: ["had been raining", "has been raining", "rains", "is raining"],
        answers: ["had been raining"],
        explanation_vi: "Dấu hiệu trong quá khứ (đường ướt) của hành động kéo dài trước đó.",
      },
      {
        prompt: "They ___ (play) for an hour when it started to rain.",
        answers: ["had been playing", "'d been playing"],
        explanation_vi: "had been + playing.",
      },
      {
        prompt: "I ___ (not / sleep) well before the exam, so I felt tired.",
        answers: ["had not been sleeping", "hadn't been sleeping"],
        explanation_vi: "Phủ định: had not been + sleeping.",
      },
      {
        prompt: "He ___ (teach) for ten years before he became a headmaster.",
        answers: ["had been teaching", "'d been teaching"],
        explanation_vi: "Nhấn mạnh thời lượng (for ten years) trước một mốc quá khứ.",
      },
      {
        prompt: "___ (she / wait) long when you arrived?",
        answers: ["Had she been waiting"],
        explanation_vi: "Câu hỏi: Had + she + been + waiting.",
      },
    ],
  },
  {
    slug: "future-simple",
    name_en: "Future Simple",
    name_vi: "Tương lai đơn",
    time_group: "future",
    summary_vi: "Diễn tả quyết định tức thời, dự đoán, lời hứa hoặc đề nghị về tương lai.",
    formulas: [
      f("Khẳng định", "S + will + V", "I will call you tonight.", "Tối nay tôi sẽ gọi cho bạn."),
      f("Phủ định", "S + will not (won't) + V", "They won't come tomorrow.", "Ngày mai họ sẽ không đến."),
      f("Nghi vấn", "Will + S + V?", "Will you help me?", "Bạn sẽ giúp tôi chứ?"),
    ],
    usages: [
      u("Quyết định đưa ra ngay lúc nói", "I'm thirsty. I'll get some water.", "Tôi khát quá. Tôi sẽ đi lấy ít nước."),
      u("Dự đoán theo ý kiến cá nhân (I think, probably)", "I think it will rain tomorrow.", "Tôi nghĩ ngày mai trời sẽ mưa."),
      u("Lời hứa, lời đề nghị, lời yêu cầu", "I will help you with your homework.", "Tôi sẽ giúp bạn làm bài tập."),
      u("Sự việc chắc chắn xảy ra trong tương lai", "She will be twenty next month.", "Tháng sau cô ấy sẽ tròn hai mươi tuổi."),
    ],
    signals: ["tomorrow", "next week", "next year", "soon", "in the future", "I think", "probably", "perhaps"],
    notes_vi:
      "Dùng be going to (không dùng will) cho dự định đã có từ trước hoặc dự đoán có căn cứ rõ ràng: “Look at those clouds! It's going to rain.”\n\nTrong mệnh đề thời gian (when, as soon as, before, after) và mệnh đề if loại 1, không dùng will: “When he comes, I will tell him.”",
    exercises: [
      {
        prompt: "The phone is ringing. — I ___ it.",
        options: ["answer", "will answer", "am answering", "answered"],
        answers: ["will answer"],
        explanation_vi: "Quyết định đưa ra ngay lúc nói → will + V.",
      },
      {
        prompt: "I think our team ___ the match tomorrow.",
        options: ["wins", "will win", "won", "is winning"],
        answers: ["will win"],
        explanation_vi: "Dự đoán theo ý kiến cá nhân với I think → will.",
      },
      {
        prompt: "Don't worry. I ___ late.",
        options: ["won't be", "am not", "don't be", "wasn't"],
        answers: ["won't be"],
        explanation_vi: "Lời hứa về tương lai, dạng phủ định: won't + V.",
      },
      {
        prompt: "When she ___, I will call you.",
        options: ["will arrive", "arrives", "arrived", "is arriving"],
        answers: ["arrives"],
        explanation_vi: "Sau when trong mệnh đề thời gian dùng hiện tại đơn, không dùng will.",
      },
      {
        prompt: "She ___ (be) 18 next month.",
        answers: ["will be", "'ll be"],
        explanation_vi: "Sự việc chắc chắn xảy ra trong tương lai: will + be.",
      },
      {
        prompt: "They ___ (not / come) to the party tomorrow.",
        answers: ["will not come", "won't come"],
        explanation_vi: "Phủ định: will not (won't) + come.",
      },
      {
        prompt: "___ (you / help) me with this bag, please?",
        answers: ["Will you help"],
        explanation_vi: "Lời yêu cầu lịch sự: Will + you + V?",
      },
      {
        prompt: "I promise I ___ (call) you tonight.",
        answers: ["will call", "'ll call"],
        explanation_vi: "Lời hứa → will + V.",
      },
    ],
  },
  {
    slug: "future-continuous",
    name_en: "Future Continuous",
    name_vi: "Tương lai tiếp diễn",
    time_group: "future",
    summary_vi: "Diễn tả hành động sẽ đang diễn ra tại một thời điểm xác định trong tương lai.",
    formulas: [
      f("Khẳng định", "S + will + be + V-ing", "At 9 a.m. tomorrow, I will be taking an exam.", "Lúc 9 giờ sáng mai, tôi sẽ đang làm bài thi."),
      f("Phủ định", "S + will not + be + V-ing", "They won't be working next Sunday.", "Chủ nhật tới họ sẽ không làm việc."),
      f("Nghi vấn", "Will + S + be + V-ing?", "Will you be using the car tonight?", "Tối nay bạn có dùng xe không?"),
    ],
    usages: [
      u("Hành động sẽ đang diễn ra tại một thời điểm xác định trong tương lai", "This time next week, she will be lying on the beach.", "Giờ này tuần sau, cô ấy sẽ đang nằm trên bãi biển."),
      u("Hành động sẽ đang diễn ra thì có hành động khác xảy đến", "When you arrive, I will be waiting at the gate.", "Khi bạn đến, tôi sẽ đang đợi ở cổng."),
      u("Hỏi một cách lịch sự về kế hoạch của người khác", "Will you be joining us for dinner?", "Bạn sẽ ăn tối cùng chúng tôi chứ?"),
    ],
    signals: ["at this time tomorrow", "at 8 p.m. next Sunday", "this time next week", "when + hiện tại đơn"],
    notes_vi:
      "Cần có một mốc thời gian tương lai cụ thể (at 8 p.m. tomorrow, this time next week).\n\nKhông dùng với động từ trạng thái (know, like, want…): nói “I will know”, không nói “I will be knowing”.",
    exercises: [
      {
        prompt: "At this time tomorrow, we ___ to Phu Quoc.",
        options: ["fly", "will be flying", "flew", "have flown"],
        answers: ["will be flying"],
        explanation_vi: "“At this time tomorrow” → hành động sẽ đang diễn ra tại một thời điểm tương lai.",
      },
      {
        prompt: "Don't call at 7 p.m. I ___ dinner then.",
        options: ["will have", "will be having", "had", "have"],
        answers: ["will be having"],
        explanation_vi: "Lúc 7 giờ tối, việc ăn tối sẽ đang diễn ra.",
      },
      {
        prompt: "This time next week, she ___ on the beach.",
        options: ["lies", "will be lying", "lay", "has lain"],
        answers: ["will be lying"],
        explanation_vi: "This time next week → will be + V-ing (lie → lying).",
      },
      {
        prompt: "___ you be using your laptop this evening?",
        options: ["Do", "Will", "Are", "Have"],
        answers: ["Will"],
        explanation_vi: "Hỏi lịch sự về kế hoạch: Will + S + be + V-ing?",
      },
      {
        prompt: "At 10 a.m. tomorrow, I ___ (take) my English test.",
        answers: ["will be taking", "'ll be taking"],
        explanation_vi: "will be + taking (take bỏ e).",
      },
      {
        prompt: "They ___ (not / work) at this time next Sunday.",
        answers: ["will not be working", "won't be working"],
        explanation_vi: "Phủ định: will not be + working.",
      },
      {
        prompt: "When you arrive, he ___ (wait) for you at the airport.",
        answers: ["will be waiting", "'ll be waiting"],
        explanation_vi: "Hành động đang diễn ra (đợi) khi hành động khác xảy đến (bạn tới nơi).",
      },
      {
        prompt: "What ___ (you / do) at 8 p.m. tonight?",
        answers: ["will you be doing"],
        explanation_vi: "Câu hỏi: will + you + be + doing.",
      },
    ],
  },
  {
    slug: "future-perfect",
    name_en: "Future Perfect",
    name_vi: "Tương lai hoàn thành",
    time_group: "future",
    summary_vi: "Diễn tả hành động sẽ hoàn tất trước một thời điểm hoặc một hành động khác trong tương lai.",
    formulas: [
      f("Khẳng định", "S + will + have + V3/ed", "By next June, I will have graduated.", "Đến tháng Sáu năm sau, tôi sẽ tốt nghiệp xong."),
      f("Phủ định", "S + will not + have + V3/ed", "She won't have finished by Friday.", "Đến thứ Sáu cô ấy sẽ vẫn chưa làm xong."),
      f("Nghi vấn", "Will + S + have + V3/ed?", "Will you have read the book by tomorrow?", "Đến ngày mai bạn sẽ đọc xong cuốn sách chứ?"),
    ],
    usages: [
      u("Hành động sẽ hoàn tất trước một thời điểm trong tương lai", "By 10 p.m., I will have finished my homework.", "Đến 10 giờ tối, tôi sẽ làm xong bài tập."),
      u("Hành động sẽ hoàn tất trước một hành động khác trong tương lai", "By the time you arrive, we will have finished dinner.", "Lúc bạn đến thì chúng tôi đã ăn tối xong rồi."),
    ],
    signals: ["by + mốc thời gian", "by tomorrow", "by 2030", "by the time", "by then", "before"],
    notes_vi: "Sau “by the time” dùng hiện tại đơn, không dùng will: “By the time he arrives, we will have left.”",
    exercises: [
      {
        prompt: "By next year, she ___ from university.",
        options: ["graduates", "will have graduated", "graduated", "is graduating"],
        answers: ["will have graduated"],
        explanation_vi: "By next year → hoàn tất trước một mốc tương lai: will have + V3.",
      },
      {
        prompt: "By the time you get home, I ___ dinner.",
        options: ["cook", "will have cooked", "cooked", "am cooking"],
        answers: ["will have cooked"],
        explanation_vi: "Việc nấu sẽ xong trước khi bạn về đến nhà.",
      },
      {
        prompt: "They will have finished the bridge ___ 2030.",
        options: ["in", "by", "since", "for"],
        answers: ["by"],
        explanation_vi: "by + mốc thời gian = “trước / chậm nhất là”.",
      },
      {
        prompt: "By the time he ___, we will have left.",
        options: ["will arrive", "arrives", "arrived", "has arriving"],
        answers: ["arrives"],
        explanation_vi: "Sau by the time dùng hiện tại đơn.",
      },
      {
        prompt: "By 10 p.m., I ___ (finish) my homework.",
        answers: ["will have finished", "'ll have finished"],
        explanation_vi: "will have + finished.",
      },
      {
        prompt: "She ___ (not / complete) the report by Friday.",
        answers: ["will not have completed", "won't have completed"],
        explanation_vi: "Phủ định: will not have + completed.",
      },
      {
        prompt: "By next month, we ___ (live) here for five years.",
        answers: ["will have lived", "'ll have lived"],
        explanation_vi: "Tính đến tháng sau là tròn năm năm: will have + lived.",
      },
      {
        prompt: "___ (you / read) the book by tomorrow?",
        answers: ["Will you have read"],
        explanation_vi: "Câu hỏi: Will + you + have + V3 (read → read).",
      },
    ],
  },
  {
    slug: "future-perfect-continuous",
    name_en: "Future Perfect Continuous",
    name_vi: "Tương lai hoàn thành tiếp diễn",
    time_group: "future",
    summary_vi: "Nhấn mạnh thời lượng của một hành động kéo dài liên tục cho đến một thời điểm trong tương lai.",
    formulas: [
      f("Khẳng định", "S + will + have + been + V-ing", "By next June, I will have been working here for ten years.", "Đến tháng Sáu năm sau, tôi sẽ làm việc ở đây được mười năm."),
      f("Phủ định", "S + will not + have + been + V-ing", "They won't have been living here for long.", "Tính đến lúc đó họ sẽ chưa sống ở đây được lâu."),
      f("Nghi vấn", "Will + S + have + been + V-ing?", "How long will you have been studying by then?", "Tính đến lúc đó bạn sẽ học được bao lâu?"),
    ],
    usages: [
      u("Nhấn mạnh hành động sẽ kéo dài được bao lâu tính đến một mốc tương lai", "By 5 p.m., they will have been working for eight hours.", "Đến 5 giờ chiều, họ sẽ làm việc được tám tiếng."),
    ],
    signals: ["by … for + khoảng thời gian", "by the end of this year", "by then", "by next month"],
    notes_vi:
      "Câu thường có đủ hai thành phần: mốc tương lai (by …) và thời lượng (for …).\n\nKhông dùng với động từ trạng thái — khi đó dùng tương lai hoàn thành: “will have known”.",
    exercises: [
      {
        prompt: "By December, I ___ English for three years.",
        options: ["will study", "will have been studying", "studied", "am studying"],
        answers: ["will have been studying"],
        explanation_vi: "Có mốc tương lai (by December) và thời lượng (for three years).",
      },
      {
        prompt: "By 5 p.m., they ___ for eight hours.",
        options: ["will have been working", "will work", "work", "are working"],
        answers: ["will have been working"],
        explanation_vi: "Nhấn mạnh thời lượng tính đến 5 giờ chiều.",
      },
      {
        prompt: "How long ___ you have been living here by the end of this year?",
        options: ["do", "will", "are", "did"],
        answers: ["will"],
        explanation_vi: "Câu hỏi: How long + will + S + have been + V-ing?",
      },
      {
        prompt: "By next month, we ___ each other for ten years.",
        options: ["will have been knowing", "will have known", "know", "will be knowing"],
        answers: ["will have known"],
        explanation_vi: "know là động từ trạng thái nên dùng tương lai hoàn thành, không dùng dạng tiếp diễn.",
      },
      {
        prompt: "By next week, she ___ (teach) at this school for twenty years.",
        answers: ["will have been teaching", "'ll have been teaching"],
        explanation_vi: "will have been + teaching.",
      },
      {
        prompt: "By midnight, he ___ (drive) for ten hours.",
        answers: ["will have been driving", "'ll have been driving"],
        explanation_vi: "will have been + driving (drive bỏ e).",
      },
      {
        prompt: "By the time the film ends, we ___ (sit) here for three hours.",
        answers: ["will have been sitting", "'ll have been sitting"],
        explanation_vi: "sit gấp đôi phụ âm cuối: sitting.",
      },
      {
        prompt: "By June, they ___ (not / live) here for very long.",
        answers: ["will not have been living", "won't have been living"],
        explanation_vi: "Phủ định: will not have been + living.",
      },
    ],
  },
];
