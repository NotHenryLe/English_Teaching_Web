// Nội dung mẫu: đề luyện IELTS tự biên soạn theo đúng cấu trúc bài thi thật
// (Reading: 3 bài đọc – 40 câu – 60 phút; Listening: 4 phần – 40 câu).
// Bài đọc và lời thoại do dự án tự viết, KHÔNG sao chép từ đề Cambridge hay nguồn có bản quyền.
// Phần nghe chưa có file ghi âm: trình duyệt sẽ đọc transcript bằng giọng máy;
// admin có thể tải file âm thanh thật lên cho từng phần trong trang quản trị.
import type { IeltsAnswerKey, IeltsContent, IeltsSkill } from "../src/lib/types";

export interface SeedIeltsTest {
  slug: string;
  title: string;
  skill: IeltsSkill;
  description_vi: string;
  duration_minutes: number;
  content: IeltsContent;
  key: IeltsAnswerKey;
}

const TFNG = "Do the following statements agree with the information given in the passage? Choose TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, or NOT GIVEN if there is no information on this.";
const YNNG = "Do the following statements agree with the claims of the writer? Choose YES if the statement agrees with the claims of the writer, NO if the statement contradicts the claims of the writer, or NOT GIVEN if it is impossible to say what the writer thinks about this.";

const reading: SeedIeltsTest = {
  slug: "reading-practice-test-1",
  title: "Reading Practice Test 1",
  skill: "reading",
  description_vi:
    "Đề đọc đầy đủ 3 bài – 40 câu: ngôn ngữ của loài ong, làm việc từ xa và nghịch lý của sự lựa chọn. Gồm các dạng True/False/Not Given, nối tiêu đề, trắc nghiệm và điền từ.",
  duration_minutes: 60,
  content: {
    sections: [
      {
        title: "Reading Passage 1",
        instructions: "You should spend about 20 minutes on Questions 1–13, which are based on Reading Passage 1.",
        passageTitle: "The Dance Language of Honeybees",
        passage: `A honeybee colony may contain tens of thousands of insects, yet in many ways it behaves like a single organism. Nowhere is this clearer than in the way bees find food. A colony cannot afford to send every forager out to search at random: flowers bloom for only a short time, and a rich patch discovered by one bee is of little use unless her sisters can find it too. Honeybees solve the problem by passing on information inside the dark hive through movement, a system now known as the dance language.

The system was decoded by the Austrian scientist Karl von Frisch, who spent decades watching bees through the glass walls of a specially built observation hive. He marked individual foragers with small dots of paint so that he could follow them, and placed dishes of sugar water at measured distances from the hive. For this work he shared a Nobel Prize in 1973. At first, however, many of his colleagues doubted that an insect could communicate in such an abstract way, and the idea was debated for years before it was widely accepted.

Von Frisch found that a returning forager performs one of two dances on the vertical surface of the honeycomb. If the food is close to the hive, she performs a "round dance", running in small circles, first one way and then the other. This tells other workers that food is nearby but gives no information about its direction; the recruits simply fly out and search the area around the hive, guided by the scent of the flowers that clings to the dancer's body.

When the food is further away, the forager switches to the "waggle dance". She runs forward in a straight line while shaking her body rapidly from side to side, then circles back to her starting point and repeats the run. The straight run carries two messages. Its direction shows where to fly: a run pointing straight up the comb means "fly towards the sun", while a run angled 40 degrees to the right of vertical means "fly 40 degrees to the right of the sun". Its duration shows how far to go: the longer the bee waggles, the more distant the food.

The dance is not only watched but also felt. In the darkness of the hive, the followers crowd closely around the dancer, touching her with their antennae, and they detect the vibrations produced by her wings. From time to time a follower makes a short sound that causes the dancer to stop and hand over a small sample of the nectar she has collected, so that the recruits learn the taste of the food as well as its location.

Because the sun moves across the sky, a bee that dances for a long time must correct for the change, and she does so, gradually altering the angle of her run even though she cannot see the sky from inside the hive. Bees can also find their way when the sun is hidden behind cloud, since their eyes are sensitive to the pattern of polarised light in any patch of blue sky, and this pattern reveals where the sun must be.

The dance language is used for more than finding food. When a colony grows too large, part of it leaves with the old queen and gathers on a branch in a swarm. Scout bees then search for a new home, such as a hollow tree, and report what they find by dancing on the surface of the swarm. Better sites are advertised with longer and more energetic dances, and over a few days support builds for a single location. Only when the scouts have reached agreement does the swarm take off and fly to its new home.`,
        groups: [
          {
            kind: "tfng",
            instructions: `Questions 1–7. ${TFNG}`,
            questions: [
              { n: 1, prompt: "In some respects, a honeybee colony acts like one single creature." },
              { n: 2, prompt: "Von Frisch marked bees with paint so that he could recognise individual insects." },
              { n: 3, prompt: "Other scientists accepted von Frisch's conclusions as soon as they were published." },
              { n: 4, prompt: "Von Frisch built his first observation hive while he was still a student." },
              { n: 5, prompt: "The round dance shows other bees exactly which direction to fly in." },
              { n: 6, prompt: "Bees that follow a round dance usually find the food more quickly than bees that follow a waggle dance." },
              { n: 7, prompt: "Bees following a dancer are able to learn what the food tastes like." },
            ],
          },
          {
            kind: "fill",
            instructions: "Questions 8–13. Complete the sentences below. Choose ONE WORD ONLY from the passage for each answer.",
            questions: [
              { n: 8, prompt: "A waggle run that points straight up the comb tells bees to fly in the direction of the ________." },
              { n: 9, prompt: "The ________ of the straight run tells the other bees how far away the food is." },
              { n: 10, prompt: "Bees that follow a dance touch the dancer with their ________." },
              { n: 11, prompt: "Followers can sense the ________ made by the dancer's wings." },
              { n: 12, prompt: "Light that is ________ allows bees to work out where the sun is on a cloudy day." },
              { n: 13, prompt: "When a colony divides, ________ bees look for a suitable place for the swarm to live." },
            ],
          },
        ],
      },
      {
        title: "Reading Passage 2",
        instructions: "You should spend about 20 minutes on Questions 14–26, which are based on Reading Passage 2.",
        passageTitle: "Working from Anywhere",
        passage: `[A] For most of history, people worked where they lived: farmers in their fields, craftspeople in workshops attached to their homes. The idea that work must take place in a separate building, at fixed hours and under the eye of a supervisor, became normal only with the factories and counting houses of the industrial age. Seen in this light, the recent spread of remote work is less a revolution than a partial return to an older pattern, made possible this time by laptops and fast internet connections rather than by looms and workbenches.

[B] Ask remote workers what they value most, and the answer is rarely the work itself. It is time. The daily commute, which for many city dwellers consumes one or two hours, simply disappears, and the hours recovered can be given to family, exercise or sleep. Many also report that they can concentrate better at home, away from the interruptions of an open-plan office. Parents of young children, and people who care for elderly relatives, often say that flexibility of this kind makes the difference between keeping a job and giving it up.

[C] The picture is not entirely positive. Without the walk to the station or the chat by the coffee machine, the working day can lose its natural boundaries, and some remote workers find themselves answering messages late into the evening. Loneliness is a common complaint, particularly among those who live alone. Younger employees face a further difficulty: much of what a newcomer learns is picked up informally, by watching and overhearing experienced colleagues, and this kind of learning is hard to reproduce through a screen.

[D] For employers the calculation is equally mixed. A company with fewer people in the building can rent less space, and it can recruit from a far wider area, since a talented applicant no longer needs to live within travelling distance. On the other hand, managers who were used to judging staff by the hours they spent at their desks have had to find new ways of measuring performance. Those who respond by monitoring every keystroke tend to damage trust, whereas those who set clear goals and judge results generally find that productivity holds up well.

[E] The consequences reach well beyond individual firms. When thousands of commuters stay at home, the cafés, dry cleaners and sandwich shops that depend on them lose their customers, and city-centre transport systems lose the ticket income they were designed around. At the same time, smaller towns and villages may gain new residents who bring their salaries with them. Whether this is welcome depends on whom you ask: local shopkeepers may be delighted, but rising house prices can push out families who have lived there for generations.

[F] It now seems likely that neither the fully remote company nor the traditional office will dominate. Many organisations have settled on a hybrid arrangement, asking staff to come in on two or three agreed days a week. The office, in this model, changes its purpose: it becomes a place for meetings, training and the kind of unplanned conversation that produces new ideas, while tasks that require quiet concentration are done at home. The arrangement satisfies nobody completely, which may be the best evidence that it is a reasonable compromise.`,
        groups: [
          {
            kind: "match",
            instructions:
              "Questions 14–19. Reading Passage 2 has six paragraphs, A–F. Choose the correct heading for each paragraph from the list of headings below.",
            options: [
              "i. The effect on local economies",
              "ii. A middle way that looks set to continue",
              "iii. Why remote work is not really new",
              "iv. Technology that failed to deliver",
              "v. Advantages reported by staff",
              "vi. Mixed results for companies",
              "vii. Government attempts to control home working",
              "viii. Problems faced by those who work at home",
            ],
            questions: [
              { n: 14, prompt: "Paragraph A" },
              { n: 15, prompt: "Paragraph B" },
              { n: 16, prompt: "Paragraph C" },
              { n: 17, prompt: "Paragraph D" },
              { n: 18, prompt: "Paragraph E" },
              { n: 19, prompt: "Paragraph F" },
            ],
          },
          {
            kind: "choice",
            instructions: "Questions 20–23. Choose the correct letter, A, B, C or D.",
            questions: [
              {
                n: 20,
                prompt: "According to the writer, what do remote workers appreciate most?",
                options: [
                  "A. being able to choose more interesting tasks",
                  "B. having more time for other parts of their lives",
                  "C. earning more money than office workers",
                  "D. working with fewer colleagues",
                ],
              },
              {
                n: 21,
                prompt: "Why are new employees at a disadvantage when they work remotely?",
                options: [
                  "A. Their managers do not trust them.",
                  "B. They receive less formal training than before.",
                  "C. They cannot easily learn by observing experienced staff.",
                  "D. They have to work later than other employees.",
                ],
              },
              {
                n: 22,
                prompt: "What does the writer say about managers who track their employees' activity very closely?",
                options: [
                  "A. They usually achieve higher productivity.",
                  "B. They are likely to weaken trust.",
                  "C. They save the company money on office space.",
                  "D. They find it easier to recruit talented people.",
                ],
              },
              {
                n: 23,
                prompt: "What is the writer's view of the hybrid model?",
                options: [
                  "A. It is certain to be replaced by fully remote working.",
                  "B. It pleases employers more than employees.",
                  "C. It is imperfect but sensible.",
                  "D. It makes the office unnecessary.",
                ],
              },
            ],
          },
          {
            kind: "fill",
            instructions: "Questions 24–26. Complete the sentences below. Choose ONE WORD ONLY from the passage for each answer.",
            questions: [
              { n: 24, prompt: "Before the industrial age, craftspeople usually worked in ________ that were connected to their homes." },
              { n: 25, prompt: "Businesses in city centres suffer when ________ no longer travel in each day." },
              { n: 26, prompt: "In smaller towns, an increase in house ________ may force long-established families to leave." },
            ],
          },
        ],
      },
      {
        title: "Reading Passage 3",
        instructions: "You should spend about 20 minutes on Questions 27–40, which are based on Reading Passage 3.",
        passageTitle: "Too Much Choice?",
        passage: `Walk into any large supermarket and you may find forty kinds of breakfast cereal, a wall of shampoos and more varieties of olive oil than anyone could taste in a year. Modern economies treat this abundance as an obvious good. More options, the argument runs, mean that each shopper is more likely to find exactly what suits them, and nobody is forced to accept something they do not want. For decades, few people questioned this assumption.

Then, in 2000, the psychologists Sheena Iyengar and Mark Lepper published the results of a now famous experiment carried out in a Californian food store. On some days they set up a tasting table displaying 24 varieties of jam; on other days the table offered only six. The larger display attracted more passers-by, but the smaller one sold far more: about 30 per cent of the people who stopped at the table of six went on to buy a jar, compared with only 3 per cent of those who stopped at the table of 24. An excess of choice, it seemed, could discourage people from choosing at all.

The psychologist Barry Schwartz later brought the idea to a wide audience in his book The Paradox of Choice. He suggested several reasons why a large range of options can leave us worse off. Comparing many alternatives demands time and mental effort. The more options we reject, the easier it is to imagine that one of them would have been better, so we feel regret even when our choice was a good one. And when we choose from a huge range, our expectations rise: we assume that something perfect must be available, and are disappointed by anything less.

Schwartz also drew a distinction between two kinds of decision-maker. "Maximisers" feel they must find the best possible option and will examine every alternative before deciding. "Satisficers" look only until they find something that meets their standards, and then stop. Maximisers, he argued, often make objectively better choices, yet they tend to be less satisfied with them, precisely because they remain aware of everything they turned down.

The story did not end there, however. When other researchers repeated experiments of this kind, the results were inconsistent. A review published in 2010, which combined the findings of fifty earlier studies, concluded that on average the number of options had almost no effect on whether people made a choice or how satisfied they were afterwards. In some studies more choice reduced satisfaction; in others it increased it.

This does not mean that the original finding was wrong, only that it holds under particular conditions. Choice appears most likely to overwhelm when people are unfamiliar with the products, when the options are difficult to compare, and when there is no obvious way of narrowing them down. An expert who knows exactly what she wants is rarely troubled by a long menu. In my view, the practical lesson is therefore not that choice should be reduced but that it should be organised. A wine list divided into regions, or a website that lets shoppers filter by price and size, offers variety without confusion.

There is a wider lesson, too. It is tempting to believe that every dissatisfaction can be cured by adding options: another school, another pension plan, another streaming service. Sometimes what people need is not a longer list but better guidance on how to use the one they have.`,
        groups: [
          {
            kind: "ynng",
            instructions: `Questions 27–32. ${YNNG}`,
            questions: [
              { n: 27, prompt: "For a long time, the belief that more choice benefits consumers was rarely challenged." },
              { n: 28, prompt: "In the jam experiment, the table with fewer varieties attracted more shoppers." },
              { n: 29, prompt: "Iyengar and Lepper expected the larger display to sell more jam." },
              { n: 30, prompt: "Maximisers are generally happier with their decisions than satisficers." },
              { n: 31, prompt: "People who know a product area well are less likely to be confused by a large range." },
              { n: 32, prompt: "Online shops organise choice more effectively than traditional shops do." },
            ],
          },
          {
            kind: "fill",
            instructions:
              "Questions 33–37. Complete the summary of Barry Schwartz's ideas below. Choose ONE WORD ONLY from the passage for each answer.",
            questions: [
              { n: 33, prompt: "Examining a large number of alternatives takes time and mental ________." },
              { n: 34, prompt: "After deciding, people may feel ________ because they imagine that an option they rejected was better." },
              { n: 35, prompt: "A wide range also raises people's ________, so that anything less than perfect is disappointing." },
              { n: 36, prompt: "Schwartz describes people who insist on finding the best possible option as ________." },
              { n: 37, prompt: "Satisficers stop searching as soon as their ________ have been met." },
            ],
          },
          {
            kind: "choice",
            instructions: "Questions 38–40. Choose the correct letter, A, B, C or D.",
            questions: [
              {
                n: 38,
                prompt: "What did the review published in 2010 conclude?",
                options: [
                  "A. More choice always makes people less satisfied.",
                  "B. Overall, the number of options made very little difference.",
                  "C. The jam experiment had been carried out incorrectly.",
                  "D. Shoppers prefer to be offered exactly six options.",
                ],
              },
              {
                n: 39,
                prompt: "According to the passage, choice is most likely to overwhelm people when",
                options: [
                  "A. they are experts in the product.",
                  "B. the options are cheap.",
                  "C. the options are hard to compare.",
                  "D. they are shopping online.",
                ],
              },
              {
                n: 40,
                prompt: "What is the writer's main conclusion?",
                options: [
                  "A. Consumers should be given fewer options.",
                  "B. Choice is helpful when it is well organised.",
                  "C. Experiments on choice cannot be trusted.",
                  "D. Supermarkets should stop selling jam.",
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  key: {
    1: { accept: ["TRUE"], explain: "Đoạn 1: “in many ways it behaves like a single organism”." },
    2: { accept: ["TRUE"], explain: "Đoạn 2: ông đánh dấu từng con ong bằng chấm sơn “so that he could follow them”." },
    3: { accept: ["FALSE"], explain: "Đoạn 2: nhiều đồng nghiệp nghi ngờ và ý tưởng “was debated for years” trước khi được chấp nhận." },
    4: { accept: ["NOT GIVEN"], explain: "Bài không nói ông dựng tổ quan sát đầu tiên vào lúc nào." },
    5: { accept: ["FALSE"], explain: "Đoạn 3: điệu múa vòng tròn “gives no information about its direction”." },
    6: { accept: ["NOT GIVEN"], explain: "Bài không so sánh tốc độ tìm thấy thức ăn giữa hai điệu múa." },
    7: { accept: ["TRUE"], explain: "Đoạn 5: ong múa trao một ít mật “so that the recruits learn the taste of the food”." },
    8: { accept: ["sun"], explain: "Đoạn 4: đường chạy hướng thẳng lên nghĩa là “fly towards the sun”." },
    9: { accept: ["duration"], explain: "Đoạn 4: “Its duration shows how far to go”." },
    10: { accept: ["antennae"], explain: "Đoạn 5: “touching her with their antennae”." },
    11: { accept: ["vibrations"], explain: "Đoạn 5: “they detect the vibrations produced by her wings”." },
    12: { accept: ["polarised", "polarized"], explain: "Đoạn 6: mắt ong nhạy với “the pattern of polarised light”." },
    13: { accept: ["scout"], explain: "Đoạn 7: “Scout bees then search for a new home”." },
    14: { accept: ["iii"], explain: "Đoạn A: làm việc từ xa là “a partial return to an older pattern”." },
    15: { accept: ["v"], explain: "Đoạn B liệt kê những điều người lao động được lợi: thời gian, sự tập trung, sự linh hoạt." },
    16: { accept: ["viii"], explain: "Đoạn C nói về mặt trái: ranh giới công việc mờ đi, cô đơn, người mới khó học hỏi." },
    17: { accept: ["vi"], explain: "Đoạn D: “For employers the calculation is equally mixed”." },
    18: { accept: ["i"], explain: "Đoạn E: ảnh hưởng tới hàng quán trung tâm, giao thông và các thị trấn nhỏ." },
    19: { accept: ["ii"], explain: "Đoạn F: mô hình kết hợp (hybrid) là “a reasonable compromise”." },
    20: { accept: ["B"], explain: "Đoạn B: “the answer is rarely the work itself. It is time.”" },
    21: { accept: ["C"], explain: "Đoạn C: người mới học được nhiều nhờ “watching and overhearing experienced colleagues”." },
    22: { accept: ["B"], explain: "Đoạn D: “Those who respond by monitoring every keystroke tend to damage trust”." },
    23: { accept: ["C"], explain: "Đoạn F: không làm ai hài lòng hoàn toàn, nhưng là “a reasonable compromise”." },
    24: { accept: ["workshops"], explain: "Đoạn A: “craftspeople in workshops attached to their homes”." },
    25: { accept: ["commuters"], explain: "Đoạn E: “When thousands of commuters stay at home…”." },
    26: { accept: ["prices"], explain: "Đoạn E: “rising house prices can push out families”." },
    27: { accept: ["YES"], explain: "Đoạn 1: “For decades, few people questioned this assumption.”" },
    28: { accept: ["NO"], explain: "Đoạn 2: “The larger display attracted more passers-by”." },
    29: { accept: ["NOT GIVEN"], explain: "Bài không nói hai nhà nghiên cứu kỳ vọng kết quả nào." },
    30: { accept: ["NO"], explain: "Đoạn 4: maximisers “tend to be less satisfied” với lựa chọn của mình." },
    31: { accept: ["YES"], explain: "Đoạn 6: “An expert who knows exactly what she wants is rarely troubled by a long menu.”" },
    32: { accept: ["NOT GIVEN"], explain: "Tác giả lấy ví dụ cả thực đơn rượu lẫn trang web, không so sánh bên nào tốt hơn." },
    33: { accept: ["effort"], explain: "Đoạn 3: “demands time and mental effort”." },
    34: { accept: ["regret"], explain: "Đoạn 3: “so we feel regret even when our choice was a good one”." },
    35: { accept: ["expectations"], explain: "Đoạn 3: “our expectations rise”." },
    36: { accept: ["maximisers", "maximizers"], explain: "Đoạn 4: “Maximisers feel they must find the best possible option”." },
    37: { accept: ["standards"], explain: "Đoạn 4: satisficers dừng khi tìm được thứ “that meets their standards”." },
    38: { accept: ["B"], explain: "Đoạn 5: số lượng lựa chọn “had almost no effect” tính trung bình." },
    39: { accept: ["C"], explain: "Đoạn 6: “when the options are difficult to compare”." },
    40: { accept: ["B"], explain: "Đoạn 6: bài học là lựa chọn “should be organised”, không phải bị cắt giảm." },
  },
};

const listening: SeedIeltsTest = {
  slug: "listening-practice-test-1",
  title: "Listening Practice Test 1",
  skill: "listening",
  description_vi:
    "Đề nghe đầy đủ 4 phần – 40 câu: đăng ký lớp học, giới thiệu công viên, thảo luận bài thuyết trình và bài giảng về cây xanh đô thị. Âm thanh được đọc bằng giọng máy của trình duyệt.",
  duration_minutes: 30,
  content: {
    sections: [
      {
        title: "Part 1",
        instructions: "You will hear a telephone conversation between a receptionist at a community centre and a woman who wants to join an evening class.",
        transcript: [
          { speaker: "Receptionist", text: "Good morning, Riverside Community Centre. How can I help you?" },
          { speaker: "Caller", text: "Hello. I'd like to ask about your evening cooking classes, please." },
          { speaker: "Receptionist", text: "Of course. We have two courses starting next month. There's Vietnamese Home Cooking on Tuesdays, and Baking for Beginners on Thursdays." },
          { speaker: "Caller", text: "The baking one sounds perfect. What time does it start?" },
          { speaker: "Receptionist", text: "Thursday classes run from half past six until half past eight in the evening." },
          { speaker: "Caller", text: "Half past six. Good. I finish work at half past five, so that's fine. And when is the first class?" },
          { speaker: "Receptionist", text: "The course begins on the ninth of October and runs for eight weeks." },
          { speaker: "Caller", text: "Eight weeks. And how much does it cost?" },
          { speaker: "Receptionist", text: "The full course is ninety-five pounds. That includes all the ingredients, but you will need to bring your own apron." },
          { speaker: "Caller", text: "An apron. OK, I can do that. Is there a discount for students?" },
          { speaker: "Receptionist", text: "I'm afraid the student discount ended last year. But if you pay before the end of September, you get ten per cent off." },
          { speaker: "Caller", text: "Great, I'll do that. Can I book a place now?" },
          { speaker: "Receptionist", text: "Certainly. Can I take your name, please?" },
          { speaker: "Caller", text: "Yes, it's Hannah Marlow. That's M, A, R, L, O, W." },
          { speaker: "Receptionist", text: "M, A, R, L, O, W. Thank you. And do you have any food allergies we should know about?" },
          { speaker: "Caller", text: "Yes, actually. I'm allergic to nuts." },
          { speaker: "Receptionist", text: "Nuts. I'll make a note for the teacher. Now, the class is held in the Garden Room. That's on the first floor, next to the library." },
          { speaker: "Caller", text: "The Garden Room, first floor. Is there parking at the centre?" },
          { speaker: "Receptionist", text: "There's a small car park behind the building, but it's usually full by six. Most people leave their cars in Mill Street. It's free after six o'clock." },
          { speaker: "Caller", text: "Mill Street. Is that M, I, double L?" },
          { speaker: "Receptionist", text: "That's right." },
          { speaker: "Caller", text: "One last question. Who is teaching the course?" },
          { speaker: "Receptionist", text: "That's Mr Okafor. He used to be the head baker at a large hotel." },
          { speaker: "Caller", text: "Wonderful. Thank you so much for your help." },
          { speaker: "Receptionist", text: "You're welcome, Ms Marlow. We'll send you a confirmation by email this afternoon." },
        ],
        groups: [
          {
            kind: "fill",
            instructions: "Questions 1–10. Complete the booking form below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
            questions: [
              { n: 1, prompt: "Course: Baking for ________" },
              { n: 2, prompt: "Day of the class: ________" },
              { n: 3, prompt: "Start time: ________ p.m." },
              { n: 4, prompt: "Date of first class: ________ October" },
              { n: 5, prompt: "Cost of the course: £________" },
              { n: 6, prompt: "Students must bring: an ________" },
              { n: 7, prompt: "Customer's name: Hannah ________" },
              { n: 8, prompt: "Allergy: ________" },
              { n: 9, prompt: "Location: the ________ Room (first floor)" },
              { n: 10, prompt: "Free parking after 6 p.m. in ________ Street" },
            ],
          },
        ],
      },
      {
        title: "Part 2",
        instructions: "You will hear a volunteer coordinator talking to a group of new volunteers at a city park.",
        transcript: [
          { speaker: "Guide", text: "Good morning, everyone, and welcome to Greenfield Park. My name is Daniel, and I coordinate the volunteer programme here. Before we walk round, let me tell you a little about the park and how you will be helping." },
          { speaker: "Guide", text: "The park opened in 1924 on land that used to be a brick factory. You can still see one of the old chimneys near the east gate. For many years it was looked after by the city council, but since 2015 it has been managed by a local charity, the Friends of Greenfield, and that is who I work for." },
          { speaker: "Guide", text: "Now, people often ask what volunteers actually do. Some of you may be expecting to plant flowers, and there is a little of that. But the job we need most help with is clearing litter from the lake. It isn't glamorous, but it makes the biggest difference to the wildlife." },
          { speaker: "Guide", text: "Volunteer sessions take place every Saturday morning. We used to meet on Sundays as well, but there weren't enough people, so for now it is Saturdays only. We start at nine and finish at twelve." },
          { speaker: "Guide", text: "You don't need to bring any tools. We provide gloves, rakes and everything else. The one thing we do ask you to bring is strong boots, because the ground near the water is always muddy." },
          { speaker: "Guide", text: "Right. Let me explain what happens in each part of the park, because you will be working in all of them at some point. We are standing by the main entrance. Just behind me is the rose garden. That is where our volunteers do most of their planting, in spring and autumn." },
          { speaker: "Guide", text: "If you follow the path to the left, you come to the old boathouse. We don't keep boats there any more. It is used for storing our equipment, so that is where you will collect your gloves and tools each week." },
          { speaker: "Guide", text: "Beyond the boathouse is the meadow. In summer we leave the grass long for insects, and that is where local schools come for nature lessons. You may be asked to help with those." },
          { speaker: "Guide", text: "On the far side of the lake is the orchard, which has about sixty apple and pear trees. Every October we hold a fruit-picking day there, and it is our most popular event of the year." },
          { speaker: "Guide", text: "Finally, next to the café, there is the walled garden. It is quieter than the rest of the park, and it is where we hold our monthly meetings for volunteers, on the first Wednesday evening of every month. OK. If there are no questions, let's start the tour." },
        ],
        groups: [
          {
            kind: "choice",
            instructions: "Questions 11–15. Choose the correct letter, A, B or C.",
            questions: [
              { n: 11, prompt: "What was on the site before the park opened?", options: ["A. a brick factory", "B. a farm", "C. a railway station"] },
              { n: 12, prompt: "Who manages the park now?", options: ["A. the city council", "B. a local charity", "C. a private company"] },
              { n: 13, prompt: "Which task do the volunteers most need to help with?", options: ["A. planting flowers", "B. removing rubbish from the lake", "C. repairing paths"] },
              { n: 14, prompt: "When do volunteer sessions take place?", options: ["A. on Saturday mornings", "B. on Sunday mornings", "C. on both Saturday and Sunday mornings"] },
              { n: 15, prompt: "What should volunteers bring with them?", options: ["A. gloves", "B. a rake", "C. strong boots"] },
            ],
          },
          {
            kind: "match",
            instructions: "Questions 16–20. What is each part of the park used for? Choose the correct answer from the list, A–G.",
            options: [
              "A. storing equipment",
              "B. volunteer meetings",
              "C. planting by volunteers",
              "D. school nature lessons",
              "E. summer concerts",
              "F. an annual fruit-picking event",
              "G. feeding the ducks",
            ],
            questions: [
              { n: 16, prompt: "the rose garden" },
              { n: 17, prompt: "the old boathouse" },
              { n: 18, prompt: "the meadow" },
              { n: 19, prompt: "the orchard" },
              { n: 20, prompt: "the walled garden" },
            ],
          },
        ],
      },
      {
        title: "Part 3",
        instructions: "You will hear two students, Mai and Tom, talking to their tutor about a presentation on plastic waste at their university.",
        transcript: [
          { speaker: "Tutor", text: "Come in, both of you. So, you wanted to talk about your presentation on reducing plastic waste on campus. How is it going?" },
          { speaker: "Mai", text: "Quite well, I think. We've finished the survey. We got replies from just over two hundred students." },
          { speaker: "Tom", text: "Two hundred and twelve, to be exact. We were hoping for three hundred, but that was probably too ambitious." },
          { speaker: "Tutor", text: "Two hundred is plenty for a project of this size. What did you find?" },
          { speaker: "Mai", text: "The most surprising thing was about water bottles. We expected students to say they buy bottled water because it's convenient. But actually, the main reason was that they didn't know where the drinking fountains were." },
          { speaker: "Tutor", text: "Interesting. So it's a problem of information, not attitude." },
          { speaker: "Tom", text: "Exactly. Most people said they would happily refill a bottle if they knew where to do it." },
          { speaker: "Tutor", text: "And what about the campus cafés?" },
          { speaker: "Tom", text: "That was less encouraging. Only a few students bring their own cups, even though there's a discount." },
          { speaker: "Mai", text: "The discount is only ten pence, though. I think it's too small for anyone to notice." },
          { speaker: "Tom", text: "I'm not sure about that. I think the real problem is that people forget their cups. A bigger discount wouldn't change that." },
          { speaker: "Tutor", text: "Well, you could present both explanations and say that more research is needed. Now, how are you planning to organise the presentation itself?" },
          { speaker: "Mai", text: "We thought we would begin with the survey results and then move on to our recommendations." },
          { speaker: "Tutor", text: "Hmm. I'd suggest you start with a short story or a striking image, something to get the audience's attention, and then give the numbers. Otherwise people switch off." },
          { speaker: "Tom", text: "We could show a photo of the bins outside the library after lunch. They're always overflowing." },
          { speaker: "Tutor", text: "That would work well. And how long is the presentation at the moment?" },
          { speaker: "Mai", text: "When we practised, it took eighteen minutes." },
          { speaker: "Tutor", text: "You only have fifteen, so you'll need to cut something. I would shorten the section on methods. Nobody needs to hear every survey question." },
          { speaker: "Tom", text: "OK. We'll reduce that part." },
          { speaker: "Tutor", text: "Good. Now, let's decide who is doing what before next week." },
          { speaker: "Mai", text: "I'll make the slides. I've already started on the design." },
          { speaker: "Tom", text: "And I'll draw the charts from the survey data, since I've got the spreadsheet." },
          { speaker: "Tutor", text: "Who is going to contact the facilities office about the map of drinking fountains?" },
          { speaker: "Tom", text: "Mai, could you do that? You've spoken to them before." },
          { speaker: "Mai", text: "Sure. I'll email them tomorrow." },
          { speaker: "Tutor", text: "You'll also need someone to write the one-page handout for the audience." },
          { speaker: "Tom", text: "I can write the handout." },
          { speaker: "Tutor", text: "And finally, the reference list." },
          { speaker: "Mai", text: "I think we should do that together, because we've each read different articles." },
          { speaker: "Tom", text: "Agreed. We'll both work on the references." },
          { speaker: "Tutor", text: "Excellent. Send me the slides by Friday and I'll give you some feedback." },
        ],
        groups: [
          {
            kind: "choice",
            instructions: "Questions 21–25. Choose the correct letter, A, B or C.",
            questions: [
              { n: 21, prompt: "How many students completed the survey?", options: ["A. 200", "B. 212", "C. 300"] },
              { n: 22, prompt: "Why do most students buy bottled water?", options: ["A. It is more convenient.", "B. They prefer the taste.", "C. They do not know where the drinking fountains are."] },
              { n: 23, prompt: "What does Mai think about the discount in the cafés?", options: ["A. It is too small to be noticed.", "B. It is unfair to staff.", "C. It should be removed."] },
              { n: 24, prompt: "How does the tutor suggest they begin the presentation?", options: ["A. with the survey results", "B. with a story or a striking image", "C. with their recommendations"] },
              { n: 25, prompt: "Which part of the presentation will they shorten?", options: ["A. the recommendations", "B. the introduction", "C. the section on methods"] },
            ],
          },
          {
            kind: "match",
            instructions: "Questions 26–30. Who will do each of the following tasks? Choose the correct answer, A, B or C.",
            options: ["A. Mai", "B. Tom", "C. both Mai and Tom"],
            questions: [
              { n: 26, prompt: "make the slides" },
              { n: 27, prompt: "draw the charts" },
              { n: 28, prompt: "contact the facilities office" },
              { n: 29, prompt: "write the handout" },
              { n: 30, prompt: "prepare the reference list" },
            ],
          },
        ],
      },
      {
        title: "Part 4",
        instructions: "You will hear part of a lecture about trees in cities.",
        transcript: [
          { speaker: "Lecturer", text: "Good afternoon. Today I want to look at something most of us walk past every day without noticing: the trees in our cities. I'll talk about why they matter, why they are so difficult to grow, and what planners are doing differently today." },
          { speaker: "Lecturer", text: "Let's begin with the benefits. The first, and the most obvious, is temperature. Cities are warmer than the countryside around them, because roads and buildings absorb heat during the day and release it at night. Trees reduce this effect in two ways. They provide shade, of course, but they also cool the air directly, because water evaporates from their leaves." },
          { speaker: "Lecturer", text: "The second benefit concerns water. During heavy rain, the leaves and branches hold back some of the water, and the soil around the roots absorbs more. This slows the flow into the drains and lowers the risk of flooding." },
          { speaker: "Lecturer", text: "Third, trees improve air quality. Their leaves trap dust and other tiny particles, which are later washed to the ground by rain." },
          { speaker: "Lecturer", text: "And finally, there is human health. A number of studies suggest that people who live near green spaces report lower levels of stress, and patients in hospital have been found to recover faster when they can see trees from their window." },
          { speaker: "Lecturer", text: "So if trees are so useful, why don't we simply plant more? The answer is that a city is a very hard place for a tree to live. The main problem is underground. A tree in a forest can spread its roots widely, but a street tree is usually planted in a small pit, surrounded by soil that has been pressed hard by traffic and building work. Roots cannot grow easily through this compacted soil, and they receive little water or oxygen. As a result, street trees often grow slowly and die young, long before they are large enough to provide real benefits." },
          { speaker: "Lecturer", text: "A second problem is damage. Trees are hit by vehicles, their roots are cut when pipes and cables are repaired, and in winter the salt used on icy roads harms them." },
          { speaker: "Lecturer", text: "There is also a lesson from history. In the twentieth century, many cities planted long avenues of a single species, the elm. When Dutch elm disease arrived, it spread from tree to tree, and millions of elms were lost. Whole streets became bare within a few years. The lesson planners took from this is the importance of variety. Today, many cities follow a simple rule: no single species should make up more than ten per cent of the trees." },
          { speaker: "Lecturer", text: "So what else has changed? Engineers now design larger planting pits, sometimes linked together beneath the pavement so that roots can share space. Some cities publish an online map showing every public tree, and invite residents to water young trees during dry weather. And planners increasingly choose species according to the climate expected in fifty years' time, rather than the climate we have today." },
          { speaker: "Lecturer", text: "To sum up, a city tree is not decoration. It is a piece of infrastructure, as useful as a drain or a street light, and it needs the same careful planning." },
        ],
        groups: [
          {
            kind: "fill",
            instructions: "Questions 31–40. Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
            questions: [
              { n: 31, prompt: "Temperature: trees give shade, and water ________ from their leaves, which cools the air" },
              { n: 32, prompt: "Water: trees slow the flow of rain into drains and reduce the risk of ________" },
              { n: 33, prompt: "Air: leaves trap ________ and other small particles" },
              { n: 34, prompt: "Health: people living near green spaces report less ________" },
              { n: 35, prompt: "Difficulties: the main problem for street trees lies ________" },
              { n: 36, prompt: "Roots cannot grow easily through ________ soil" },
              { n: 37, prompt: "Damage is caused by vehicles, repairs to pipes, and ________ used on roads in winter" },
              { n: 38, prompt: "Dutch elm disease showed planners the importance of ________" },
              { n: 39, prompt: "Rule: no single species should be more than ________ per cent of a city's trees" },
              { n: 40, prompt: "Residents are invited to ________ young trees in dry weather" },
            ],
          },
        ],
      },
    ],
  },
  key: {
    1: { accept: ["Beginners"], explain: "“Baking for Beginners on Thursdays.”" },
    2: { accept: ["Thursday", "Thursdays"], explain: "Lớp làm bánh học vào thứ Năm (lớp nấu món Việt mới là thứ Ba)." },
    3: { accept: ["6.30", "6:30", "half past six", "six thirty", "630"], explain: "“from half past six until half past eight” — 5.30 là giờ tan làm của người gọi." },
    4: { accept: ["9", "9th", "ninth"], explain: "“The course begins on the ninth of October.”" },
    5: { accept: ["95", "ninety-five", "ninety five"], explain: "“The full course is ninety-five pounds.”" },
    6: { accept: ["apron"], explain: "“you will need to bring your own apron”." },
    7: { accept: ["Marlow"], explain: "Tên được đánh vần: M-A-R-L-O-W." },
    8: { accept: ["nuts", "nut"], explain: "“I'm allergic to nuts.”" },
    9: { accept: ["Garden"], explain: "“the class is held in the Garden Room”." },
    10: { accept: ["Mill"], explain: "“Most people leave their cars in Mill Street. It's free after six o'clock.”" },
    11: { accept: ["A"], explain: "“on land that used to be a brick factory”." },
    12: { accept: ["B"], explain: "Từ năm 2015 công viên do một tổ chức từ thiện địa phương quản lý." },
    13: { accept: ["B"], explain: "“the job we need most help with is clearing litter from the lake”." },
    14: { accept: ["A"], explain: "“for now it is Saturdays only” — trước đây mới có cả Chủ nhật." },
    15: { accept: ["C"], explain: "Găng tay và cào đã được phát; chỉ cần mang “strong boots”." },
    16: { accept: ["C"], explain: "Vườn hồng là nơi tình nguyện viên trồng cây nhiều nhất." },
    17: { accept: ["A"], explain: "Nhà thuyền cũ “is used for storing our equipment”." },
    18: { accept: ["D"], explain: "Đồng cỏ là nơi các trường đến học về thiên nhiên." },
    19: { accept: ["F"], explain: "Vườn cây ăn quả tổ chức ngày hái quả vào mỗi tháng Mười." },
    20: { accept: ["B"], explain: "Khu vườn có tường bao là nơi họp tình nguyện viên hằng tháng." },
    21: { accept: ["B"], explain: "“Two hundred and twelve, to be exact.”" },
    22: { accept: ["C"], explain: "Lý do chính: sinh viên không biết vòi nước uống ở đâu." },
    23: { accept: ["A"], explain: "Mai: “it's too small for anyone to notice”." },
    24: { accept: ["B"], explain: "Giảng viên gợi ý mở đầu bằng “a short story or a striking image”." },
    25: { accept: ["C"], explain: "“I would shorten the section on methods.”" },
    26: { accept: ["A"], explain: "Mai: “I'll make the slides.”" },
    27: { accept: ["B"], explain: "Tom: “I'll draw the charts from the survey data.”" },
    28: { accept: ["A"], explain: "Tom nhờ Mai và Mai đồng ý: “I'll email them tomorrow.”" },
    29: { accept: ["B"], explain: "Tom: “I can write the handout.”" },
    30: { accept: ["C"], explain: "“We'll both work on the references.”" },
    31: { accept: ["evaporates"], explain: "“water evaporates from their leaves”." },
    32: { accept: ["flooding", "floods", "flood"], explain: "“lowers the risk of flooding”." },
    33: { accept: ["dust"], explain: "“Their leaves trap dust and other tiny particles.”" },
    34: { accept: ["stress"], explain: "“report lower levels of stress”." },
    35: { accept: ["underground"], explain: "“The main problem is underground.”" },
    36: { accept: ["compacted"], explain: "“Roots cannot grow easily through this compacted soil.”" },
    37: { accept: ["salt"], explain: "“the salt used on icy roads harms them”." },
    38: { accept: ["variety"], explain: "“the importance of variety”." },
    39: { accept: ["10", "ten"], explain: "“no more than ten per cent of the trees”." },
    40: { accept: ["water"], explain: "“invite residents to water young trees during dry weather”." },
  },
};

export const IELTS_SEED: SeedIeltsTest[] = [reading, listening];
