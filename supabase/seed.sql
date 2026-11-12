-- =====================================================================
-- Nội dung mẫu: từ vựng, 12 thì + bài tập, đề IELTS, gói học Callan ví dụ.
-- FILE NÀY ĐƯỢC SINH TỰ ĐỘNG bằng `npm run seed:build` — đừng sửa tay.
-- Chạy SAU file trong supabase/migrations/. Chạy lại nhiều lần vẫn an toàn.
-- =====================================================================
begin;

-- ---------- Từ vựng ----------
with topic as (
  insert into public.vocab_topics (slug, title_en, title_vi, description_vi, icon, sort_order)
  values ('family', 'Family', 'Gia đình', 'Cách gọi các thành viên trong gia đình và nói về mối quan hệ họ hàng.', '👨‍👩‍👧', 1)
  on conflict (slug) do nothing
  returning id
)
insert into public.vocab_words (topic_id, word, ipa, part_of_speech, meaning_vi, example_en, example_vi, sort_order)
select topic.id, w.word, w.ipa, w.part_of_speech, w.meaning_vi, w.example_en, w.example_vi, w.sort_order
from topic
cross join (values
    ('parents', '/ˈpeərənts/', 'n.', 'bố mẹ', 'My parents live in Da Nang.', 'Bố mẹ tôi sống ở Đà Nẵng.', 1),
    ('sibling', '/ˈsɪblɪŋ/', 'n.', 'anh chị em ruột', 'Do you have any siblings?', 'Bạn có anh chị em ruột không?', 2),
    ('grandmother', '/ˈɡrænmʌðə(r)/', 'n.', 'bà', 'My grandmother tells wonderful stories.', 'Bà tôi kể chuyện rất hay.', 3),
    ('grandfather', '/ˈɡrænfɑːðə(r)/', 'n.', 'ông', 'My grandfather is eighty years old.', 'Ông tôi tám mươi tuổi.', 4),
    ('uncle', '/ˈʌŋkl/', 'n.', 'chú, bác, cậu', 'My uncle works as a driver.', 'Chú tôi làm tài xế.', 5),
    ('aunt', '/ɑːnt/', 'n.', 'cô, dì, bác gái', 'My aunt lives next door.', 'Dì tôi sống ngay nhà bên.', 6),
    ('cousin', '/ˈkʌzn/', 'n.', 'anh chị em họ', 'I often play football with my cousins.', 'Tôi thường đá bóng với các anh em họ.', 7),
    ('nephew', '/ˈnefjuː/', 'n.', 'cháu trai (con của anh chị em)', 'Her nephew has just started school.', 'Cháu trai cô ấy vừa mới đi học.', 8),
    ('niece', '/niːs/', 'n.', 'cháu gái (con của anh chị em)', 'I bought a doll for my niece.', 'Tôi mua một con búp bê cho cháu gái.', 9),
    ('husband', '/ˈhʌzbənd/', 'n.', 'chồng', 'Her husband cooks very well.', 'Chồng cô ấy nấu ăn rất ngon.', 10),
    ('wife', '/waɪf/', 'n.', 'vợ', 'He met his wife at university.', 'Anh ấy gặp vợ mình ở trường đại học.', 11),
    ('relative', '/ˈrelətɪv/', 'n.', 'họ hàng, người thân', 'We visit our relatives at Tet.', 'Chúng tôi đi thăm họ hàng vào dịp Tết.', 12),
    ('only child', '/ˌəʊnli ˈtʃaɪld/', 'n.', 'con một', 'I am an only child.', 'Tôi là con một.', 13),
    ('take after', '/teɪk ˈɑːftə(r)/', 'phr. v.', 'giống (ai đó trong gia đình)', 'She takes after her mother.', 'Cô ấy giống mẹ.', 14),
    ('close-knit', '/ˌkləʊs ˈnɪt/', 'adj.', 'gắn bó khăng khít', 'We are a close-knit family.', 'Gia đình chúng tôi rất gắn bó.', 15)
) as w(word, ipa, part_of_speech, meaning_vi, example_en, example_vi, sort_order);

with topic as (
  insert into public.vocab_topics (slug, title_en, title_vi, description_vi, icon, sort_order)
  values ('food-and-drink', 'Food and Drink', 'Đồ ăn & thức uống', 'Từ vựng về món ăn, hương vị và cách gọi món khi đi ăn ngoài.', '🍜', 2)
  on conflict (slug) do nothing
  returning id
)
insert into public.vocab_words (topic_id, word, ipa, part_of_speech, meaning_vi, example_en, example_vi, sort_order)
select topic.id, w.word, w.ipa, w.part_of_speech, w.meaning_vi, w.example_en, w.example_vi, w.sort_order
from topic
cross join (values
    ('breakfast', '/ˈbrekfəst/', 'n.', 'bữa sáng', 'I usually have pho for breakfast.', 'Tôi thường ăn phở vào bữa sáng.', 1),
    ('vegetable', '/ˈvedʒtəbl/', 'n.', 'rau củ', 'You should eat more vegetables.', 'Bạn nên ăn nhiều rau củ hơn.', 2),
    ('fruit', '/fruːt/', 'n.', 'trái cây', 'Mango is my favourite fruit.', 'Xoài là loại trái cây tôi thích nhất.', 3),
    ('rice', '/raɪs/', 'n.', 'gạo, cơm', 'We eat rice every day.', 'Chúng tôi ăn cơm mỗi ngày.', 4),
    ('noodles', '/ˈnuːdlz/', 'n.', 'mì, bún, phở', 'These noodles are very tasty.', 'Món mì này rất ngon.', 5),
    ('seafood', '/ˈsiːfuːd/', 'n.', 'hải sản', 'Nha Trang is famous for fresh seafood.', 'Nha Trang nổi tiếng với hải sản tươi.', 6),
    ('dessert', '/dɪˈzɜːt/', 'n.', 'món tráng miệng', 'Would you like some dessert?', 'Bạn có muốn dùng món tráng miệng không?', 7),
    ('spicy', '/ˈspaɪsi/', 'adj.', 'cay', 'This soup is too spicy for me.', 'Món canh này quá cay đối với tôi.', 8),
    ('delicious', '/dɪˈlɪʃəs/', 'adj.', 'ngon', 'The spring rolls are delicious.', 'Món nem rán rất ngon.', 9),
    ('recipe', '/ˈresəpi/', 'n.', 'công thức nấu ăn', 'Can you give me the recipe for this cake?', 'Bạn cho tôi công thức làm bánh này được không?', 10),
    ('ingredient', '/ɪnˈɡriːdiənt/', 'n.', 'nguyên liệu', 'Fish sauce is an important ingredient.', 'Nước mắm là một nguyên liệu quan trọng.', 11),
    ('order', '/ˈɔːdə(r)/', 'v.', 'gọi món', 'Are you ready to order?', 'Anh chị đã sẵn sàng gọi món chưa?', 12),
    ('bill', '/bɪl/', 'n.', 'hóa đơn', 'Could we have the bill, please?', 'Cho chúng tôi xin hóa đơn.', 13),
    ('thirsty', '/ˈθɜːsti/', 'adj.', 'khát', 'I''m thirsty. Let''s get some water.', 'Tôi khát quá. Mình đi lấy nước đi.', 14),
    ('vegetarian', '/ˌvedʒəˈteəriən/', 'n., adj.', 'người ăn chay; (món) chay', 'Do you have any vegetarian dishes?', 'Nhà hàng có món chay không?', 15)
) as w(word, ipa, part_of_speech, meaning_vi, example_en, example_vi, sort_order);

with topic as (
  insert into public.vocab_topics (slug, title_en, title_vi, description_vi, icon, sort_order)
  values ('home', 'Home', 'Nhà cửa', 'Các phòng, đồ đạc trong nhà và việc nhà thường ngày.', '🏠', 3)
  on conflict (slug) do nothing
  returning id
)
insert into public.vocab_words (topic_id, word, ipa, part_of_speech, meaning_vi, example_en, example_vi, sort_order)
select topic.id, w.word, w.ipa, w.part_of_speech, w.meaning_vi, w.example_en, w.example_vi, w.sort_order
from topic
cross join (values
    ('living room', '/ˈlɪvɪŋ ruːm/', 'n.', 'phòng khách', 'We watch TV in the living room.', 'Chúng tôi xem tivi ở phòng khách.', 1),
    ('bedroom', '/ˈbedruːm/', 'n.', 'phòng ngủ', 'My bedroom is on the second floor.', 'Phòng ngủ của tôi ở tầng hai.', 2),
    ('kitchen', '/ˈkɪtʃɪn/', 'n.', 'nhà bếp', 'Mum is cooking in the kitchen.', 'Mẹ đang nấu ăn trong bếp.', 3),
    ('bathroom', '/ˈbɑːθruːm/', 'n.', 'phòng tắm', 'The bathroom is next to my room.', 'Phòng tắm ở cạnh phòng tôi.', 4),
    ('furniture', '/ˈfɜːnɪtʃə(r)/', 'n.', 'đồ nội thất (không đếm được)', 'We bought some new furniture.', 'Chúng tôi đã mua một ít đồ nội thất mới.', 5),
    ('wardrobe', '/ˈwɔːdrəʊb/', 'n.', 'tủ quần áo', 'Hang your coat in the wardrobe.', 'Hãy treo áo khoác vào tủ quần áo.', 6),
    ('fridge', '/frɪdʒ/', 'n.', 'tủ lạnh', 'There is some milk in the fridge.', 'Có ít sữa trong tủ lạnh.', 7),
    ('balcony', '/ˈbælkəni/', 'n.', 'ban công', 'She grows flowers on the balcony.', 'Cô ấy trồng hoa ngoài ban công.', 8),
    ('stairs', '/steəz/', 'n.', 'cầu thang', 'Be careful on the stairs.', 'Hãy cẩn thận khi đi cầu thang.', 9),
    ('rent', '/rent/', 'v., n.', 'thuê; tiền thuê nhà', 'They rent a small flat near the city centre.', 'Họ thuê một căn hộ nhỏ gần trung tâm thành phố.', 10),
    ('neighbour', '/ˈneɪbə(r)/', 'n.', 'hàng xóm', 'Our neighbours are very kind.', 'Hàng xóm của chúng tôi rất tốt bụng.', 11),
    ('tidy', '/ˈtaɪdi/', 'adj., v.', 'gọn gàng; dọn dẹp', 'Please tidy your room before dinner.', 'Con hãy dọn phòng trước bữa tối nhé.', 12),
    ('housework', '/ˈhaʊswɜːk/', 'n.', 'việc nhà', 'We share the housework at weekends.', 'Chúng tôi chia nhau làm việc nhà vào cuối tuần.', 13),
    ('comfortable', '/ˈkʌmftəbl/', 'adj.', 'thoải mái', 'This sofa is really comfortable.', 'Chiếc ghế sofa này thật sự thoải mái.', 14),
    ('move house', '/muːv haʊs/', 'phr.', 'chuyển nhà', 'We are moving house next month.', 'Tháng sau chúng tôi sẽ chuyển nhà.', 15)
) as w(word, ipa, part_of_speech, meaning_vi, example_en, example_vi, sort_order);

with topic as (
  insert into public.vocab_topics (slug, title_en, title_vi, description_vi, icon, sort_order)
  values ('school', 'School and Study', 'Trường học & học tập', 'Từ vựng về môn học, thi cử và đời sống học đường.', '🎒', 4)
  on conflict (slug) do nothing
  returning id
)
insert into public.vocab_words (topic_id, word, ipa, part_of_speech, meaning_vi, example_en, example_vi, sort_order)
select topic.id, w.word, w.ipa, w.part_of_speech, w.meaning_vi, w.example_en, w.example_vi, w.sort_order
from topic
cross join (values
    ('subject', '/ˈsʌbdʒɪkt/', 'n.', 'môn học', 'English is my favourite subject.', 'Tiếng Anh là môn học tôi thích nhất.', 1),
    ('homework', '/ˈhəʊmwɜːk/', 'n.', 'bài tập về nhà', 'I do my homework after dinner.', 'Tôi làm bài tập về nhà sau bữa tối.', 2),
    ('exam', '/ɪɡˈzæm/', 'n.', 'kỳ thi', 'We have an exam next week.', 'Tuần sau chúng tôi có một kỳ thi.', 3),
    ('timetable', '/ˈtaɪmteɪbl/', 'n.', 'thời khóa biểu', 'Check the timetable for tomorrow''s classes.', 'Hãy xem thời khóa biểu cho các tiết học ngày mai.', 4),
    ('classmate', '/ˈklɑːsmeɪt/', 'n.', 'bạn cùng lớp', 'My classmates are very friendly.', 'Các bạn cùng lớp tôi rất thân thiện.', 5),
    ('lecture', '/ˈlektʃə(r)/', 'n.', 'bài giảng', 'The lecture starts at nine o''clock.', 'Bài giảng bắt đầu lúc chín giờ.', 6),
    ('scholarship', '/ˈskɒləʃɪp/', 'n.', 'học bổng', 'She won a scholarship to study abroad.', 'Cô ấy giành được học bổng du học.', 7),
    ('degree', '/dɪˈɡriː/', 'n.', 'bằng cấp (đại học)', 'He has a degree in economics.', 'Anh ấy có bằng đại học ngành kinh tế.', 8),
    ('revise', '/rɪˈvaɪz/', 'v.', 'ôn tập', 'I need to revise for the test.', 'Tôi cần ôn tập cho bài kiểm tra.', 9),
    ('pass', '/pɑːs/', 'v.', 'thi đỗ', 'I hope I pass the driving test.', 'Tôi hy vọng mình thi đỗ bằng lái xe.', 10),
    ('fail', '/feɪl/', 'v.', 'thi trượt', 'He failed the exam because he didn''t study.', 'Cậu ấy thi trượt vì không học bài.', 11),
    ('grade', '/ɡreɪd/', 'n.', 'điểm số', 'She always gets good grades.', 'Cô ấy luôn đạt điểm cao.', 12),
    ('tuition fee', '/tjuˈɪʃn fiː/', 'n.', 'học phí', 'Tuition fees are getting higher.', 'Học phí ngày càng tăng.', 13),
    ('graduate', '/ˈɡrædʒueɪt/', 'v.', 'tốt nghiệp', 'She graduated from university last year.', 'Cô ấy tốt nghiệp đại học năm ngoái.', 14),
    ('knowledge', '/ˈnɒlɪdʒ/', 'n.', 'kiến thức', 'Reading improves your knowledge.', 'Đọc sách giúp nâng cao kiến thức của bạn.', 15)
) as w(word, ipa, part_of_speech, meaning_vi, example_en, example_vi, sort_order);

with topic as (
  insert into public.vocab_topics (slug, title_en, title_vi, description_vi, icon, sort_order)
  values ('jobs', 'Jobs and Work', 'Nghề nghiệp & công việc', 'Tên nghề nghiệp và từ vựng dùng nơi công sở, khi xin việc.', '💼', 5)
  on conflict (slug) do nothing
  returning id
)
insert into public.vocab_words (topic_id, word, ipa, part_of_speech, meaning_vi, example_en, example_vi, sort_order)
select topic.id, w.word, w.ipa, w.part_of_speech, w.meaning_vi, w.example_en, w.example_vi, w.sort_order
from topic
cross join (values
    ('engineer', '/ˌendʒɪˈnɪə(r)/', 'n.', 'kỹ sư', 'My brother is a software engineer.', 'Anh trai tôi là kỹ sư phần mềm.', 1),
    ('accountant', '/əˈkaʊntənt/', 'n.', 'kế toán', 'She works as an accountant in a bank.', 'Cô ấy làm kế toán ở một ngân hàng.', 2),
    ('nurse', '/nɜːs/', 'n.', 'y tá, điều dưỡng', 'The nurse took my temperature.', 'Cô y tá đã đo nhiệt độ cho tôi.', 3),
    ('chef', '/ʃef/', 'n.', 'đầu bếp', 'He is a chef at a famous restaurant.', 'Anh ấy là đầu bếp ở một nhà hàng nổi tiếng.', 4),
    ('salary', '/ˈsæləri/', 'n.', 'lương', 'The salary is paid at the end of the month.', 'Lương được trả vào cuối tháng.', 5),
    ('interview', '/ˈɪntəvjuː/', 'n.', 'buổi phỏng vấn', 'I have a job interview tomorrow.', 'Ngày mai tôi có buổi phỏng vấn xin việc.', 6),
    ('colleague', '/ˈkɒliːɡ/', 'n.', 'đồng nghiệp', 'I get on well with my colleagues.', 'Tôi hòa hợp với các đồng nghiệp.', 7),
    ('manager', '/ˈmænɪdʒə(r)/', 'n.', 'quản lý', 'Can I speak to the manager, please?', 'Tôi có thể nói chuyện với quản lý được không?', 8),
    ('full-time', '/ˌfʊl ˈtaɪm/', 'adj., adv.', 'toàn thời gian', 'She is looking for a full-time job.', 'Cô ấy đang tìm một công việc toàn thời gian.', 9),
    ('apply', '/əˈplaɪ/', 'v.', 'nộp đơn, ứng tuyển', 'He applied for a job at a hotel.', 'Anh ấy đã ứng tuyển vào một khách sạn.', 10),
    ('experience', '/ɪkˈspɪəriəns/', 'n.', 'kinh nghiệm', 'Do you have any experience in sales?', 'Bạn có kinh nghiệm bán hàng không?', 11),
    ('deadline', '/ˈdedlaɪn/', 'n.', 'hạn chót', 'The deadline for the report is Friday.', 'Hạn chót nộp báo cáo là thứ Sáu.', 12),
    ('meeting', '/ˈmiːtɪŋ/', 'n.', 'cuộc họp', 'We have a meeting at ten o''clock.', 'Chúng tôi có cuộc họp lúc mười giờ.', 13),
    ('promotion', '/prəˈməʊʃn/', 'n.', 'sự thăng chức', 'She got a promotion last month.', 'Tháng trước cô ấy được thăng chức.', 14),
    ('retire', '/rɪˈtaɪə(r)/', 'v.', 'nghỉ hưu', 'My father will retire next year.', 'Bố tôi sẽ nghỉ hưu vào năm sau.', 15)
) as w(word, ipa, part_of_speech, meaning_vi, example_en, example_vi, sort_order);

with topic as (
  insert into public.vocab_topics (slug, title_en, title_vi, description_vi, icon, sort_order)
  values ('travel', 'Travel', 'Du lịch', 'Những từ cần biết khi đi máy bay, đặt phòng và khám phá điểm đến mới.', '✈️', 6)
  on conflict (slug) do nothing
  returning id
)
insert into public.vocab_words (topic_id, word, ipa, part_of_speech, meaning_vi, example_en, example_vi, sort_order)
select topic.id, w.word, w.ipa, w.part_of_speech, w.meaning_vi, w.example_en, w.example_vi, w.sort_order
from topic
cross join (values
    ('passport', '/ˈpɑːspɔːt/', 'n.', 'hộ chiếu', 'Don''t forget your passport.', 'Đừng quên hộ chiếu của bạn.', 1),
    ('luggage', '/ˈlʌɡɪdʒ/', 'n.', 'hành lý (không đếm được)', 'How much luggage do you have?', 'Bạn có bao nhiêu hành lý?', 2),
    ('flight', '/flaɪt/', 'n.', 'chuyến bay', 'Our flight leaves at 6 a.m.', 'Chuyến bay của chúng tôi cất cánh lúc 6 giờ sáng.', 3),
    ('book', '/bʊk/', 'v.', 'đặt trước (vé, phòng)', 'I booked a room for two nights.', 'Tôi đã đặt một phòng cho hai đêm.', 4),
    ('destination', '/ˌdestɪˈneɪʃn/', 'n.', 'điểm đến', 'Hoi An is a popular tourist destination.', 'Hội An là một điểm đến du lịch nổi tiếng.', 5),
    ('sightseeing', '/ˈsaɪtsiːɪŋ/', 'n.', 'việc tham quan', 'We went sightseeing in Hue.', 'Chúng tôi đã đi tham quan ở Huế.', 6),
    ('souvenir', '/ˌsuːvəˈnɪə(r)/', 'n.', 'quà lưu niệm', 'I bought some souvenirs for my friends.', 'Tôi đã mua vài món quà lưu niệm cho bạn bè.', 7),
    ('tour guide', '/ˈtʊə ɡaɪd/', 'n.', 'hướng dẫn viên du lịch', 'The tour guide spoke English very well.', 'Hướng dẫn viên nói tiếng Anh rất tốt.', 8),
    ('accommodation', '/əˌkɒməˈdeɪʃn/', 'n.', 'chỗ ở', 'Accommodation in the city is expensive.', 'Chỗ ở trong thành phố khá đắt.', 9),
    ('check in', '/tʃek ɪn/', 'phr. v.', 'làm thủ tục (nhận phòng, lên máy bay)', 'You can check in from 2 p.m.', 'Bạn có thể nhận phòng từ 2 giờ chiều.', 10),
    ('delay', '/dɪˈleɪ/', 'n., v.', 'sự chậm trễ; hoãn', 'The train was delayed by an hour.', 'Chuyến tàu bị chậm một tiếng.', 11),
    ('currency', '/ˈkʌrənsi/', 'n.', 'tiền tệ', 'What currency do they use in Japan?', 'Ở Nhật người ta dùng loại tiền nào?', 12),
    ('journey', '/ˈdʒɜːni/', 'n.', 'chuyến đi, hành trình', 'The journey takes about three hours.', 'Chuyến đi mất khoảng ba tiếng.', 13),
    ('abroad', '/əˈbrɔːd/', 'adv.', 'ở/ra nước ngoài', 'She wants to study abroad.', 'Cô ấy muốn đi du học.', 14),
    ('itinerary', '/aɪˈtɪnərəri/', 'n.', 'lịch trình chuyến đi', 'Let''s plan our itinerary together.', 'Chúng ta cùng lên lịch trình nhé.', 15)
) as w(word, ipa, part_of_speech, meaning_vi, example_en, example_vi, sort_order);

with topic as (
  insert into public.vocab_topics (slug, title_en, title_vi, description_vi, icon, sort_order)
  values ('health', 'Health', 'Sức khỏe', 'Mô tả triệu chứng, đi khám bệnh và giữ lối sống lành mạnh.', '🩺', 7)
  on conflict (slug) do nothing
  returning id
)
insert into public.vocab_words (topic_id, word, ipa, part_of_speech, meaning_vi, example_en, example_vi, sort_order)
select topic.id, w.word, w.ipa, w.part_of_speech, w.meaning_vi, w.example_en, w.example_vi, w.sort_order
from topic
cross join (values
    ('headache', '/ˈhedeɪk/', 'n.', 'chứng đau đầu', 'I have a terrible headache.', 'Tôi bị đau đầu kinh khủng.', 1),
    ('fever', '/ˈfiːvə(r)/', 'n.', 'cơn sốt', 'The baby has a high fever.', 'Em bé bị sốt cao.', 2),
    ('cough', '/kɒf/', 'n., v.', 'cơn ho; ho', 'He has had a cough for a week.', 'Anh ấy bị ho đã một tuần.', 3),
    ('sore throat', '/ˌsɔː ˈθrəʊt/', 'n.', 'đau họng', 'Drink warm water if you have a sore throat.', 'Hãy uống nước ấm nếu bạn bị đau họng.', 4),
    ('medicine', '/ˈmedsn/', 'n.', 'thuốc', 'Take this medicine twice a day.', 'Hãy uống thuốc này hai lần một ngày.', 5),
    ('prescription', '/prɪˈskrɪpʃn/', 'n.', 'đơn thuốc', 'The doctor gave me a prescription.', 'Bác sĩ đã kê cho tôi một đơn thuốc.', 6),
    ('appointment', '/əˈpɔɪntmənt/', 'n.', 'cuộc hẹn (khám bệnh)', 'I''d like to make an appointment with the dentist.', 'Tôi muốn đặt lịch hẹn với nha sĩ.', 7),
    ('pharmacy', '/ˈfɑːməsi/', 'n.', 'hiệu thuốc', 'Is there a pharmacy near here?', 'Gần đây có hiệu thuốc nào không?', 8),
    ('healthy', '/ˈhelθi/', 'adj.', 'khỏe mạnh, lành mạnh', 'Eating fruit keeps you healthy.', 'Ăn trái cây giúp bạn khỏe mạnh.', 9),
    ('exercise', '/ˈeksəsaɪz/', 'n., v.', 'bài tập thể dục; tập thể dục', 'I exercise three times a week.', 'Tôi tập thể dục ba lần một tuần.', 10),
    ('diet', '/ˈdaɪət/', 'n.', 'chế độ ăn', 'A balanced diet is important.', 'Một chế độ ăn cân bằng rất quan trọng.', 11),
    ('injury', '/ˈɪndʒəri/', 'n.', 'chấn thương', 'He can''t play because of a knee injury.', 'Anh ấy không thể thi đấu vì chấn thương đầu gối.', 12),
    ('recover', '/rɪˈkʌvə(r)/', 'v.', 'hồi phục', 'She is recovering from the flu.', 'Cô ấy đang hồi phục sau trận cúm.', 13),
    ('allergy', '/ˈælədʒi/', 'n.', 'dị ứng', 'I have an allergy to seafood.', 'Tôi bị dị ứng hải sản.', 14),
    ('stressed', '/strest/', 'adj.', 'căng thẳng', 'He feels stressed before exams.', 'Cậu ấy cảm thấy căng thẳng trước các kỳ thi.', 15)
) as w(word, ipa, part_of_speech, meaning_vi, example_en, example_vi, sort_order);

with topic as (
  insert into public.vocab_topics (slug, title_en, title_vi, description_vi, icon, sort_order)
  values ('weather', 'Weather', 'Thời tiết', 'Nói về nắng mưa, nhiệt độ và các mùa trong năm.', '⛅', 8)
  on conflict (slug) do nothing
  returning id
)
insert into public.vocab_words (topic_id, word, ipa, part_of_speech, meaning_vi, example_en, example_vi, sort_order)
select topic.id, w.word, w.ipa, w.part_of_speech, w.meaning_vi, w.example_en, w.example_vi, w.sort_order
from topic
cross join (values
    ('sunny', '/ˈsʌni/', 'adj.', 'nắng', 'It''s sunny today. Let''s go to the beach.', 'Hôm nay trời nắng. Mình ra biển đi.', 1),
    ('cloudy', '/ˈklaʊdi/', 'adj.', 'nhiều mây', 'It was cloudy all morning.', 'Trời nhiều mây suốt buổi sáng.', 2),
    ('rainy', '/ˈreɪni/', 'adj.', 'mưa nhiều', 'The rainy season starts in May.', 'Mùa mưa bắt đầu vào tháng Năm.', 3),
    ('windy', '/ˈwɪndi/', 'adj.', 'nhiều gió', 'It''s too windy to ride a bike.', 'Trời gió quá nên không đạp xe được.', 4),
    ('storm', '/stɔːm/', 'n.', 'cơn bão', 'A big storm is coming.', 'Một cơn bão lớn đang đến.', 5),
    ('flood', '/flʌd/', 'n., v.', 'lũ lụt; gây ngập', 'The heavy rain caused a flood.', 'Trận mưa lớn đã gây ra lũ lụt.', 6),
    ('temperature', '/ˈtemprətʃə(r)/', 'n.', 'nhiệt độ', 'The temperature is 35 degrees today.', 'Hôm nay nhiệt độ là 35 độ.', 7),
    ('humid', '/ˈhjuːmɪd/', 'adj.', 'ẩm ướt, oi ẩm', 'Summer in Hanoi is hot and humid.', 'Mùa hè ở Hà Nội nóng và oi ẩm.', 8),
    ('forecast', '/ˈfɔːkɑːst/', 'n.', 'dự báo (thời tiết)', 'What''s the weather forecast for tomorrow?', 'Dự báo thời tiết ngày mai thế nào?', 9),
    ('season', '/ˈsiːzn/', 'n.', 'mùa', 'Which season do you like best?', 'Bạn thích mùa nào nhất?', 10),
    ('thunder', '/ˈθʌndə(r)/', 'n.', 'sấm', 'The dog is afraid of thunder.', 'Con chó sợ tiếng sấm.', 11),
    ('lightning', '/ˈlaɪtnɪŋ/', 'n.', 'chớp, sét', 'We saw lightning in the sky.', 'Chúng tôi thấy tia chớp trên bầu trời.', 12),
    ('fog', '/fɒɡ/', 'n.', 'sương mù', 'Drive slowly in the fog.', 'Hãy lái xe chậm khi có sương mù.', 13),
    ('freezing', '/ˈfriːzɪŋ/', 'adj.', 'lạnh cóng', 'It''s freezing in Sa Pa in winter.', 'Mùa đông ở Sa Pa lạnh cóng.', 14),
    ('drought', '/draʊt/', 'n.', 'hạn hán', 'The drought damaged the rice fields.', 'Hạn hán đã làm hư hại những cánh đồng lúa.', 15)
) as w(word, ipa, part_of_speech, meaning_vi, example_en, example_vi, sort_order);

with topic as (
  insert into public.vocab_topics (slug, title_en, title_vi, description_vi, icon, sort_order)
  values ('animals', 'Animals', 'Động vật', 'Tên các con vật quen thuộc, từ thú cưng đến động vật hoang dã.', '🐾', 9)
  on conflict (slug) do nothing
  returning id
)
insert into public.vocab_words (topic_id, word, ipa, part_of_speech, meaning_vi, example_en, example_vi, sort_order)
select topic.id, w.word, w.ipa, w.part_of_speech, w.meaning_vi, w.example_en, w.example_vi, w.sort_order
from topic
cross join (values
    ('pet', '/pet/', 'n.', 'thú cưng', 'Do you have any pets?', 'Bạn có nuôi thú cưng không?', 1),
    ('puppy', '/ˈpʌpi/', 'n.', 'chó con', 'The puppy is sleeping on the sofa.', 'Chú chó con đang ngủ trên ghế sofa.', 2),
    ('kitten', '/ˈkɪtn/', 'n.', 'mèo con', 'She found a kitten in the garden.', 'Cô ấy tìm thấy một chú mèo con trong vườn.', 3),
    ('buffalo', '/ˈbʌfələʊ/', 'n.', 'con trâu', 'The buffalo helps farmers in the fields.', 'Con trâu giúp người nông dân trên đồng ruộng.', 4),
    ('rooster', '/ˈruːstə(r)/', 'n.', 'gà trống', 'The rooster wakes us up every morning.', 'Con gà trống đánh thức chúng tôi mỗi sáng.', 5),
    ('duck', '/dʌk/', 'n.', 'con vịt', 'There are some ducks on the lake.', 'Có vài con vịt trên hồ.', 6),
    ('monkey', '/ˈmʌŋki/', 'n.', 'con khỉ', 'Monkeys love eating bananas.', 'Khỉ rất thích ăn chuối.', 7),
    ('elephant', '/ˈelɪfənt/', 'n.', 'con voi', 'Elephants are the largest land animals.', 'Voi là loài động vật trên cạn lớn nhất.', 8),
    ('tiger', '/ˈtaɪɡə(r)/', 'n.', 'con hổ', 'Tigers are in danger of extinction.', 'Loài hổ đang có nguy cơ tuyệt chủng.', 9),
    ('snake', '/sneɪk/', 'n.', 'con rắn', 'Some snakes are very dangerous.', 'Một số loài rắn rất nguy hiểm.', 10),
    ('dolphin', '/ˈdɒlfɪn/', 'n.', 'cá heo', 'Dolphins are intelligent animals.', 'Cá heo là loài vật thông minh.', 11),
    ('butterfly', '/ˈbʌtəflaɪ/', 'n.', 'con bướm', 'A butterfly landed on the flower.', 'Một con bướm đậu trên bông hoa.', 12),
    ('mosquito', '/məˈskiːtəʊ/', 'n.', 'con muỗi', 'There are a lot of mosquitoes in summer.', 'Mùa hè có rất nhiều muỗi.', 13),
    ('wild', '/waɪld/', 'adj.', 'hoang dã', 'We should protect wild animals.', 'Chúng ta nên bảo vệ động vật hoang dã.', 14),
    ('feed', '/fiːd/', 'v.', 'cho ăn', 'I feed my cat twice a day.', 'Tôi cho mèo ăn hai lần một ngày.', 15)
) as w(word, ipa, part_of_speech, meaning_vi, example_en, example_vi, sort_order);

with topic as (
  insert into public.vocab_topics (slug, title_en, title_vi, description_vi, icon, sort_order)
  values ('shopping', 'Shopping', 'Mua sắm', 'Hỏi giá, thử đồ, thanh toán và mua hàng trực tuyến.', '🛍️', 10)
  on conflict (slug) do nothing
  returning id
)
insert into public.vocab_words (topic_id, word, ipa, part_of_speech, meaning_vi, example_en, example_vi, sort_order)
select topic.id, w.word, w.ipa, w.part_of_speech, w.meaning_vi, w.example_en, w.example_vi, w.sort_order
from topic
cross join (values
    ('price', '/praɪs/', 'n.', 'giá', 'What''s the price of this shirt?', 'Chiếc áo này giá bao nhiêu?', 1),
    ('discount', '/ˈdɪskaʊnt/', 'n.', 'khoản giảm giá', 'Students get a 10% discount.', 'Sinh viên được giảm giá 10%.', 2),
    ('cash', '/kæʃ/', 'n.', 'tiền mặt', 'Can I pay in cash?', 'Tôi trả bằng tiền mặt được không?', 3),
    ('receipt', '/rɪˈsiːt/', 'n.', 'biên lai', 'Keep the receipt in case you return it.', 'Hãy giữ biên lai phòng khi bạn trả hàng.', 4),
    ('size', '/saɪz/', 'n.', 'kích cỡ', 'Do you have this in a bigger size?', 'Bạn có cỡ lớn hơn của mẫu này không?', 5),
    ('try on', '/traɪ ɒn/', 'phr. v.', 'mặc thử', 'Can I try on these shoes?', 'Tôi đi thử đôi giày này được không?', 6),
    ('cheap', '/tʃiːp/', 'adj.', 'rẻ', 'Fruit is cheap at the local market.', 'Trái cây ở chợ rất rẻ.', 7),
    ('expensive', '/ɪkˈspensɪv/', 'adj.', 'đắt', 'That phone is too expensive for me.', 'Chiếc điện thoại đó quá đắt đối với tôi.', 8),
    ('bargain', '/ˈbɑːɡən/', 'n., v.', 'món hời; mặc cả', 'You can bargain at Ben Thanh Market.', 'Bạn có thể mặc cả ở chợ Bến Thành.', 9),
    ('refund', '/ˈriːfʌnd/', 'n.', 'tiền hoàn lại', 'I''d like a refund, please.', 'Tôi muốn được hoàn tiền.', 10),
    ('customer', '/ˈkʌstəmə(r)/', 'n.', 'khách hàng', 'The shop has many regular customers.', 'Cửa hàng có nhiều khách quen.', 11),
    ('cashier', '/kæˈʃɪə(r)/', 'n.', 'nhân viên thu ngân', 'Please pay the cashier over there.', 'Vui lòng thanh toán với thu ngân ở đằng kia.', 12),
    ('market', '/ˈmɑːkɪt/', 'n.', 'chợ', 'My mother goes to the market every morning.', 'Mẹ tôi đi chợ mỗi sáng.', 13),
    ('online shopping', '/ˌɒnlaɪn ˈʃɒpɪŋ/', 'n.', 'mua sắm trực tuyến', 'Online shopping saves a lot of time.', 'Mua sắm trực tuyến tiết kiệm rất nhiều thời gian.', 14),
    ('deliver', '/dɪˈlɪvə(r)/', 'v.', 'giao hàng', 'They will deliver the package tomorrow.', 'Họ sẽ giao gói hàng vào ngày mai.', 15)
) as w(word, ipa, part_of_speech, meaning_vi, example_en, example_vi, sort_order);

with topic as (
  insert into public.vocab_topics (slug, title_en, title_vi, description_vi, icon, sort_order)
  values ('transport', 'Transport', 'Giao thông', 'Phương tiện đi lại, chỉ đường và tham gia giao thông an toàn.', '🚌', 11)
  on conflict (slug) do nothing
  returning id
)
insert into public.vocab_words (topic_id, word, ipa, part_of_speech, meaning_vi, example_en, example_vi, sort_order)
select topic.id, w.word, w.ipa, w.part_of_speech, w.meaning_vi, w.example_en, w.example_vi, w.sort_order
from topic
cross join (values
    ('motorbike', '/ˈməʊtəbaɪk/', 'n.', 'xe máy', 'Most people in Vietnam ride motorbikes.', 'Hầu hết người Việt Nam đi xe máy.', 1),
    ('helmet', '/ˈhelmɪt/', 'n.', 'mũ bảo hiểm', 'Always wear a helmet when you ride.', 'Luôn đội mũ bảo hiểm khi đi xe.', 2),
    ('traffic jam', '/ˈtræfɪk dʒæm/', 'n.', 'tắc đường', 'I was late because of a traffic jam.', 'Tôi đến muộn vì tắc đường.', 3),
    ('traffic light', '/ˈtræfɪk laɪt/', 'n.', 'đèn giao thông', 'Stop when the traffic light is red.', 'Hãy dừng lại khi đèn giao thông chuyển đỏ.', 4),
    ('crossroads', '/ˈkrɒsrəʊdz/', 'n.', 'ngã tư', 'Turn right at the crossroads.', 'Hãy rẽ phải ở ngã tư.', 5),
    ('pavement', '/ˈpeɪvmənt/', 'n.', 'vỉa hè', 'Please walk on the pavement.', 'Xin hãy đi bộ trên vỉa hè.', 6),
    ('bus stop', '/ˈbʌs stɒp/', 'n.', 'trạm xe buýt', 'The bus stop is opposite the bank.', 'Trạm xe buýt ở đối diện ngân hàng.', 7),
    ('ticket', '/ˈtɪkɪt/', 'n.', 'vé', 'How much is a ticket to Da Lat?', 'Một vé đi Đà Lạt giá bao nhiêu?', 8),
    ('driving licence', '/ˈdraɪvɪŋ laɪsns/', 'n.', 'bằng lái xe', 'You need a driving licence to drive a car.', 'Bạn cần có bằng lái để lái ô tô.', 9),
    ('rush hour', '/ˈrʌʃ aʊə(r)/', 'n.', 'giờ cao điểm', 'The roads are crowded during rush hour.', 'Đường sá đông đúc vào giờ cao điểm.', 10),
    ('fare', '/feə(r)/', 'n.', 'tiền vé, cước phí', 'The bus fare is seven thousand dong.', 'Vé xe buýt giá bảy nghìn đồng.', 11),
    ('passenger', '/ˈpæsɪndʒə(r)/', 'n.', 'hành khách', 'The bus can carry forty passengers.', 'Xe buýt chở được bốn mươi hành khách.', 12),
    ('turn left', '/tɜːn left/', 'phr.', 'rẽ trái', 'Turn left at the post office.', 'Hãy rẽ trái ở bưu điện.', 13),
    ('petrol station', '/ˈpetrəl steɪʃn/', 'n.', 'trạm xăng', 'We need to stop at a petrol station.', 'Chúng ta cần dừng ở một trạm xăng.', 14),
    ('commute', '/kəˈmjuːt/', 'v.', 'đi lại hằng ngày (đi làm, đi học)', 'She commutes to work by bus.', 'Cô ấy đi làm hằng ngày bằng xe buýt.', 15)
) as w(word, ipa, part_of_speech, meaning_vi, example_en, example_vi, sort_order);

with topic as (
  insert into public.vocab_topics (slug, title_en, title_vi, description_vi, icon, sort_order)
  values ('sports', 'Sports and Hobbies', 'Thể thao & sở thích', 'Các môn thể thao phổ biến và cách nói về sở thích lúc rảnh.', '⚽', 12)
  on conflict (slug) do nothing
  returning id
)
insert into public.vocab_words (topic_id, word, ipa, part_of_speech, meaning_vi, example_en, example_vi, sort_order)
select topic.id, w.word, w.ipa, w.part_of_speech, w.meaning_vi, w.example_en, w.example_vi, w.sort_order
from topic
cross join (values
    ('football', '/ˈfʊtbɔːl/', 'n.', 'bóng đá', 'We play football every Sunday.', 'Chúng tôi đá bóng vào mỗi Chủ nhật.', 1),
    ('badminton', '/ˈbædmɪntən/', 'n.', 'cầu lông', 'Badminton is very popular in Vietnam.', 'Cầu lông rất phổ biến ở Việt Nam.', 2),
    ('swimming', '/ˈswɪmɪŋ/', 'n.', 'môn bơi lội', 'Swimming is good for your health.', 'Bơi lội tốt cho sức khỏe của bạn.', 3),
    ('jogging', '/ˈdʒɒɡɪŋ/', 'n.', 'chạy bộ', 'I go jogging in the park every morning.', 'Tôi chạy bộ trong công viên mỗi sáng.', 4),
    ('gym', '/dʒɪm/', 'n.', 'phòng tập thể hình', 'He goes to the gym after work.', 'Anh ấy đến phòng tập sau giờ làm.', 5),
    ('team', '/tiːm/', 'n.', 'đội', 'Which team do you support?', 'Bạn cổ vũ đội nào?', 6),
    ('match', '/mætʃ/', 'n.', 'trận đấu', 'Did you watch the match last night?', 'Tối qua bạn có xem trận đấu không?', 7),
    ('score', '/skɔː(r)/', 'n., v.', 'tỉ số; ghi bàn', 'He scored two goals in the final.', 'Anh ấy đã ghi hai bàn trong trận chung kết.', 8),
    ('win', '/wɪn/', 'v.', 'thắng', 'I hope our team will win the final.', 'Tôi hy vọng đội mình sẽ thắng trận chung kết.', 9),
    ('lose', '/luːz/', 'v.', 'thua', 'They lost the match yesterday.', 'Hôm qua họ đã thua trận.', 10),
    ('coach', '/kəʊtʃ/', 'n.', 'huấn luyện viên', 'The coach is very strict.', 'Huấn luyện viên rất nghiêm khắc.', 11),
    ('practise', '/ˈpræktɪs/', 'v.', 'luyện tập', 'You need to practise every day.', 'Bạn cần luyện tập mỗi ngày.', 12),
    ('hobby', '/ˈhɒbi/', 'n.', 'sở thích', 'My hobby is taking photos.', 'Sở thích của tôi là chụp ảnh.', 13),
    ('champion', '/ˈtʃæmpiən/', 'n.', 'nhà vô địch', 'She became the national champion.', 'Cô ấy đã trở thành nhà vô địch quốc gia.', 14),
    ('fan', '/fæn/', 'n.', 'người hâm mộ', 'I''m a big fan of this band.', 'Tôi là người hâm mộ cuồng nhiệt của ban nhạc này.', 15)
) as w(word, ipa, part_of_speech, meaning_vi, example_en, example_vi, sort_order);

with topic as (
  insert into public.vocab_topics (slug, title_en, title_vi, description_vi, icon, sort_order)
  values ('technology', 'Technology', 'Công nghệ', 'Thiết bị số, internet và những thao tác dùng hằng ngày.', '💻', 13)
  on conflict (slug) do nothing
  returning id
)
insert into public.vocab_words (topic_id, word, ipa, part_of_speech, meaning_vi, example_en, example_vi, sort_order)
select topic.id, w.word, w.ipa, w.part_of_speech, w.meaning_vi, w.example_en, w.example_vi, w.sort_order
from topic
cross join (values
    ('smartphone', '/ˈsmɑːtfəʊn/', 'n.', 'điện thoại thông minh', 'I use my smartphone to learn English.', 'Tôi dùng điện thoại thông minh để học tiếng Anh.', 1),
    ('laptop', '/ˈlæptɒp/', 'n.', 'máy tính xách tay', 'She takes her laptop to class.', 'Cô ấy mang máy tính xách tay đến lớp.', 2),
    ('password', '/ˈpɑːswɜːd/', 'n.', 'mật khẩu', 'Never share your password with anyone.', 'Đừng bao giờ chia sẻ mật khẩu với ai.', 3),
    ('download', '/ˌdaʊnˈləʊd/', 'v.', 'tải xuống', 'You can download the app for free.', 'Bạn có thể tải ứng dụng miễn phí.', 4),
    ('upload', '/ˌʌpˈləʊd/', 'v.', 'tải lên', 'He uploaded the photos to his blog.', 'Anh ấy đã tải ảnh lên blog của mình.', 5),
    ('website', '/ˈwebsaɪt/', 'n.', 'trang web', 'This website is easy to use.', 'Trang web này rất dễ dùng.', 6),
    ('app', '/æp/', 'n.', 'ứng dụng', 'This app helps you practise speaking.', 'Ứng dụng này giúp bạn luyện nói.', 7),
    ('social media', '/ˌsəʊʃl ˈmiːdiə/', 'n.', 'mạng xã hội', 'Teenagers spend a lot of time on social media.', 'Thanh thiếu niên dành nhiều thời gian trên mạng xã hội.', 8),
    ('charger', '/ˈtʃɑːdʒə(r)/', 'n.', 'bộ sạc', 'Can I borrow your charger?', 'Tôi mượn bộ sạc của bạn được không?', 9),
    ('battery', '/ˈbætri/', 'n.', 'pin', 'My phone battery is almost dead.', 'Điện thoại của tôi sắp hết pin.', 10),
    ('screen', '/skriːn/', 'n.', 'màn hình', 'The screen is cracked.', 'Màn hình bị nứt rồi.', 11),
    ('search', '/sɜːtʃ/', 'v.', 'tìm kiếm', 'I searched for the answer online.', 'Tôi đã tìm câu trả lời trên mạng.', 12),
    ('update', '/ˌʌpˈdeɪt/', 'v.', 'cập nhật', 'You should update the software regularly.', 'Bạn nên cập nhật phần mềm thường xuyên.', 13),
    ('device', '/dɪˈvaɪs/', 'n.', 'thiết bị', 'Turn off all electronic devices.', 'Hãy tắt tất cả các thiết bị điện tử.', 14),
    ('artificial intelligence', '/ˌɑːtɪfɪʃl ɪnˈtelɪdʒəns/', 'n.', 'trí tuệ nhân tạo', 'Artificial intelligence is changing the way we work.', 'Trí tuệ nhân tạo đang thay đổi cách chúng ta làm việc.', 15)
) as w(word, ipa, part_of_speech, meaning_vi, example_en, example_vi, sort_order);

with topic as (
  insert into public.vocab_topics (slug, title_en, title_vi, description_vi, icon, sort_order)
  values ('emotions', 'Feelings and Personality', 'Cảm xúc & tính cách', 'Diễn tả cảm xúc của bản thân và miêu tả tính cách con người.', '😊', 14)
  on conflict (slug) do nothing
  returning id
)
insert into public.vocab_words (topic_id, word, ipa, part_of_speech, meaning_vi, example_en, example_vi, sort_order)
select topic.id, w.word, w.ipa, w.part_of_speech, w.meaning_vi, w.example_en, w.example_vi, w.sort_order
from topic
cross join (values
    ('happy', '/ˈhæpi/', 'adj.', 'vui, hạnh phúc', 'I''m so happy to see you again.', 'Tôi rất vui được gặp lại bạn.', 1),
    ('sad', '/sæd/', 'adj.', 'buồn', 'She felt sad when her friend moved away.', 'Cô ấy thấy buồn khi bạn mình chuyển đi.', 2),
    ('angry', '/ˈæŋɡri/', 'adj.', 'tức giận', 'Don''t be angry with me.', 'Đừng giận tôi nhé.', 3),
    ('worried', '/ˈwʌrid/', 'adj.', 'lo lắng', 'I''m worried about the exam.', 'Tôi lo lắng về kỳ thi.', 4),
    ('excited', '/ɪkˈsaɪtɪd/', 'adj.', 'hào hứng', 'The children are excited about the trip.', 'Bọn trẻ rất hào hứng với chuyến đi.', 5),
    ('nervous', '/ˈnɜːvəs/', 'adj.', 'hồi hộp, lo âu', 'I always feel nervous before an interview.', 'Tôi luôn thấy hồi hộp trước buổi phỏng vấn.', 6),
    ('proud', '/praʊd/', 'adj.', 'tự hào', 'Her parents are very proud of her.', 'Bố mẹ rất tự hào về cô ấy.', 7),
    ('bored', '/bɔːd/', 'adj.', 'chán', 'I''m bored. Let''s do something fun.', 'Tôi chán quá. Mình làm gì đó vui đi.', 8),
    ('surprised', '/səˈpraɪzd/', 'adj.', 'ngạc nhiên', 'I was surprised by the news.', 'Tôi ngạc nhiên trước tin đó.', 9),
    ('lonely', '/ˈləʊnli/', 'adj.', 'cô đơn', 'He felt lonely in the new city.', 'Anh ấy cảm thấy cô đơn ở thành phố mới.', 10),
    ('confident', '/ˈkɒnfɪdənt/', 'adj.', 'tự tin', 'She is confident when speaking English.', 'Cô ấy tự tin khi nói tiếng Anh.', 11),
    ('shy', '/ʃaɪ/', 'adj.', 'nhút nhát', 'He is too shy to ask questions.', 'Cậu ấy quá nhút nhát nên không dám hỏi.', 12),
    ('friendly', '/ˈfrendli/', 'adj.', 'thân thiện', 'The people here are very friendly.', 'Người dân ở đây rất thân thiện.', 13),
    ('patient', '/ˈpeɪʃnt/', 'adj.', 'kiên nhẫn', 'A good teacher is always patient.', 'Một giáo viên giỏi luôn kiên nhẫn.', 14),
    ('embarrassed', '/ɪmˈbærəst/', 'adj.', 'ngượng, xấu hổ', 'I was embarrassed when I forgot his name.', 'Tôi thấy ngượng khi quên tên anh ấy.', 15)
) as w(word, ipa, part_of_speech, meaning_vi, example_en, example_vi, sort_order);

with topic as (
  insert into public.vocab_topics (slug, title_en, title_vi, description_vi, icon, sort_order)
  values ('nature-environment', 'Nature and Environment', 'Thiên nhiên & môi trường', 'Cảnh quan thiên nhiên và các vấn đề môi trường thường gặp trong bài thi.', '🌳', 15)
  on conflict (slug) do nothing
  returning id
)
insert into public.vocab_words (topic_id, word, ipa, part_of_speech, meaning_vi, example_en, example_vi, sort_order)
select topic.id, w.word, w.ipa, w.part_of_speech, w.meaning_vi, w.example_en, w.example_vi, w.sort_order
from topic
cross join (values
    ('forest', '/ˈfɒrɪst/', 'n.', 'rừng', 'Many animals live in the forest.', 'Nhiều loài động vật sống trong rừng.', 1),
    ('mountain', '/ˈmaʊntən/', 'n.', 'núi', 'Fansipan is the highest mountain in Vietnam.', 'Fansipan là ngọn núi cao nhất Việt Nam.', 2),
    ('river', '/ˈrɪvə(r)/', 'n.', 'sông', 'The Mekong is a very long river.', 'Mê Kông là một con sông rất dài.', 3),
    ('beach', '/biːtʃ/', 'n.', 'bãi biển', 'We spent the whole day at the beach.', 'Chúng tôi đã dành cả ngày ở bãi biển.', 4),
    ('island', '/ˈaɪlənd/', 'n.', 'hòn đảo', 'Phu Quoc is a beautiful island.', 'Phú Quốc là một hòn đảo đẹp.', 5),
    ('pollution', '/pəˈluːʃn/', 'n.', 'sự ô nhiễm', 'Air pollution is a serious problem in big cities.', 'Ô nhiễm không khí là vấn đề nghiêm trọng ở các thành phố lớn.', 6),
    ('recycle', '/ˌriːˈsaɪkl/', 'v.', 'tái chế', 'We should recycle paper and plastic.', 'Chúng ta nên tái chế giấy và nhựa.', 7),
    ('rubbish', '/ˈrʌbɪʃ/', 'n.', 'rác', 'Don''t throw rubbish in the street.', 'Đừng vứt rác ra đường.', 8),
    ('plastic', '/ˈplæstɪk/', 'n., adj.', 'nhựa; bằng nhựa', 'Try to use fewer plastic bags.', 'Hãy cố gắng dùng ít túi nhựa hơn.', 9),
    ('climate change', '/ˈklaɪmət tʃeɪndʒ/', 'n.', 'biến đổi khí hậu', 'Climate change affects everyone.', 'Biến đổi khí hậu ảnh hưởng đến tất cả mọi người.', 10),
    ('protect', '/prəˈtekt/', 'v.', 'bảo vệ', 'We must protect the environment.', 'Chúng ta phải bảo vệ môi trường.', 11),
    ('wildlife', '/ˈwaɪldlaɪf/', 'n.', 'động vật hoang dã', 'The national park is rich in wildlife.', 'Vườn quốc gia có hệ động vật hoang dã phong phú.', 12),
    ('energy', '/ˈenədʒi/', 'n.', 'năng lượng', 'Solar energy is clean and cheap.', 'Năng lượng mặt trời sạch và rẻ.', 13),
    ('fresh air', '/ˌfreʃ ˈeə(r)/', 'n.', 'không khí trong lành', 'Let''s go outside and get some fresh air.', 'Mình ra ngoài hít thở không khí trong lành đi.', 14),
    ('environment', '/ɪnˈvaɪrənmənt/', 'n.', 'môi trường', 'Cycling is good for the environment.', 'Đi xe đạp tốt cho môi trường.', 15)
) as w(word, ipa, part_of_speech, meaning_vi, example_en, example_vi, sort_order);

with topic as (
  insert into public.vocab_topics (slug, title_en, title_vi, description_vi, icon, sort_order)
  values ('daily-routines', 'Daily Routines', 'Sinh hoạt hằng ngày', 'Kể về một ngày của bạn: từ lúc thức dậy đến khi đi ngủ.', '⏰', 16)
  on conflict (slug) do nothing
  returning id
)
insert into public.vocab_words (topic_id, word, ipa, part_of_speech, meaning_vi, example_en, example_vi, sort_order)
select topic.id, w.word, w.ipa, w.part_of_speech, w.meaning_vi, w.example_en, w.example_vi, w.sort_order
from topic
cross join (values
    ('wake up', '/weɪk ʌp/', 'phr. v.', 'thức dậy', 'I wake up at six every morning.', 'Tôi thức dậy lúc sáu giờ mỗi sáng.', 1),
    ('get dressed', '/ɡet drest/', 'phr.', 'mặc quần áo', 'He gets dressed quickly and leaves.', 'Anh ấy mặc quần áo thật nhanh rồi đi.', 2),
    ('brush your teeth', '/brʌʃ jɔː tiːθ/', 'phr.', 'đánh răng', 'Brush your teeth before going to bed.', 'Hãy đánh răng trước khi đi ngủ.', 3),
    ('have breakfast', '/hæv ˈbrekfəst/', 'phr.', 'ăn sáng', 'We have breakfast together at seven.', 'Chúng tôi ăn sáng cùng nhau lúc bảy giờ.', 4),
    ('go to work', '/ɡəʊ tə wɜːk/', 'phr.', 'đi làm', 'She goes to work by motorbike.', 'Cô ấy đi làm bằng xe máy.', 5),
    ('take a shower', '/teɪk ə ˈʃaʊə(r)/', 'phr.', 'tắm vòi sen', 'I take a shower after exercising.', 'Tôi tắm sau khi tập thể dục.', 6),
    ('cook dinner', '/kʊk ˈdɪnə(r)/', 'phr.', 'nấu bữa tối', 'My father cooks dinner on Sundays.', 'Bố tôi nấu bữa tối vào Chủ nhật.', 7),
    ('do the laundry', '/duː ðə ˈlɔːndri/', 'phr.', 'giặt quần áo', 'I do the laundry twice a week.', 'Tôi giặt quần áo hai lần một tuần.', 8),
    ('wash the dishes', '/wɒʃ ðə ˈdɪʃɪz/', 'phr.', 'rửa bát', 'Whose turn is it to wash the dishes?', 'Đến lượt ai rửa bát vậy?', 9),
    ('go to bed', '/ɡəʊ tə bed/', 'phr.', 'đi ngủ', 'I usually go to bed before eleven.', 'Tôi thường đi ngủ trước mười một giờ.', 10),
    ('usually', '/ˈjuːʒuəli/', 'adv.', 'thường thường', 'I usually walk to school.', 'Tôi thường đi bộ đến trường.', 11),
    ('sometimes', '/ˈsʌmtaɪmz/', 'adv.', 'thỉnh thoảng', 'We sometimes eat out at weekends.', 'Thỉnh thoảng chúng tôi đi ăn ngoài vào cuối tuần.', 12),
    ('early', '/ˈɜːli/', 'adj., adv.', 'sớm', 'Farmers get up very early.', 'Người nông dân dậy rất sớm.', 13),
    ('late', '/leɪt/', 'adj., adv.', 'muộn', 'Don''t stay up too late.', 'Đừng thức quá khuya.', 14),
    ('weekend', '/ˌwiːkˈend/', 'n.', 'cuối tuần', 'What do you do at the weekend?', 'Bạn làm gì vào cuối tuần?', 15)
) as w(word, ipa, part_of_speech, meaning_vi, example_en, example_vi, sort_order);

-- ---------- Ngữ pháp: 12 thì ----------
with tense as (
  insert into public.tenses (slug, name_en, name_vi, time_group, summary_vi, formulas, usages, signals, notes_vi, sort_order)
  values ('present-simple', 'Present Simple', 'Hiện tại đơn', 'present', 'Diễn tả thói quen, sự thật hiển nhiên và lịch trình cố định.',
    '[{"label":"Khẳng định","pattern":"S + V(s/es) + O","example_en":"She works in a bank.","example_vi":"Cô ấy làm việc ở ngân hàng."},{"label":"Phủ định","pattern":"S + do/does + not + V","example_en":"He doesn''t eat meat.","example_vi":"Anh ấy không ăn thịt."},{"label":"Nghi vấn","pattern":"Do/Does + S + V?","example_en":"Do you live near here?","example_vi":"Bạn sống gần đây à?"},{"label":"Với động từ to be","pattern":"S + am/is/are (+ not) + …","example_en":"They are students.","example_vi":"Họ là học sinh."}]'::jsonb,
    '[{"text_vi":"Thói quen, hành động lặp đi lặp lại","example_en":"I get up at six every day.","example_vi":"Tôi thức dậy lúc sáu giờ mỗi ngày."},{"text_vi":"Sự thật hiển nhiên, chân lý","example_en":"The sun rises in the east.","example_vi":"Mặt trời mọc ở hướng đông."},{"text_vi":"Lịch trình, thời gian biểu cố định","example_en":"The train leaves at 7 p.m.","example_vi":"Tàu khởi hành lúc 7 giờ tối."},{"text_vi":"Trạng thái, cảm xúc, sở thích","example_en":"She likes coffee.","example_vi":"Cô ấy thích cà phê."}]'::jsonb,
    '["always","usually","often","sometimes","rarely","never","every day","on Mondays","once a week"]'::jsonb,
    'Với he / she / it, động từ thêm -s. Thêm -es sau o, s, x, z, ch, sh (goes, watches); phụ âm + y đổi thành -ies (study → studies); have → has.

Sau does / doesn''t, động từ trở về dạng nguyên mẫu: “Does she work?” (không phải “Does she works?”).', 1)
  on conflict (slug) do nothing
  returning id
)
insert into public.tense_exercises (tense_id, kind, prompt, options, answers, explanation_vi, sort_order)
select tense.id, e.kind, e.prompt, e.options, e.answers, e.explanation_vi, e.sort_order
from tense
cross join (values
    ('choice', 'My sister ___ to school by bus every day.', '["go","goes","going","is go"]'::jsonb, '["goes"]'::jsonb, '“My sister” là ngôi thứ ba số ít nên động từ go thêm -es.', 1),
    ('choice', '___ your parents live in Hanoi?', '["Do","Does","Are","Is"]'::jsonb, '["Do"]'::jsonb, 'Chủ ngữ số nhiều “your parents” đi với trợ động từ Do.', 2),
    ('choice', 'Water ___ at 100 degrees Celsius.', '["boil","boils","is boiling","boiled"]'::jsonb, '["boils"]'::jsonb, 'Sự thật hiển nhiên dùng hiện tại đơn; “water” là danh từ không đếm được nên động từ thêm -s.', 3),
    ('choice', 'He ___ coffee. He prefers tea.', '["don''t like","doesn''t like","isn''t like","not likes"]'::jsonb, '["doesn''t like"]'::jsonb, 'Phủ định với he: does + not + động từ nguyên mẫu.', 4),
    ('fill', 'She ___ (study) English on Mondays and Fridays.', '[]'::jsonb, '["studies"]'::jsonb, 'Phụ âm + y → bỏ y thêm -ies: study → studies.', 5),
    ('fill', 'We ___ (not / work) at weekends.', '[]'::jsonb, '["do not work","don''t work"]'::jsonb, 'Phủ định với we: do not (don''t) + động từ nguyên mẫu.', 6),
    ('fill', 'The film ___ (start) at 8 p.m. tonight.', '[]'::jsonb, '["starts"]'::jsonb, 'Lịch chiếu phim là lịch trình cố định nên dùng hiện tại đơn.', 7),
    ('fill', '___ (he / play) football every Sunday?', '[]'::jsonb, '["Does he play"]'::jsonb, 'Câu hỏi với he: Does + he + động từ nguyên mẫu.', 8)
) as e(kind, prompt, options, answers, explanation_vi, sort_order);

with tense as (
  insert into public.tenses (slug, name_en, name_vi, time_group, summary_vi, formulas, usages, signals, notes_vi, sort_order)
  values ('present-continuous', 'Present Continuous', 'Hiện tại tiếp diễn', 'present', 'Diễn tả hành động đang xảy ra lúc nói hoặc kế hoạch đã sắp xếp trong tương lai gần.',
    '[{"label":"Khẳng định","pattern":"S + am/is/are + V-ing","example_en":"I am cooking dinner.","example_vi":"Tôi đang nấu bữa tối."},{"label":"Phủ định","pattern":"S + am/is/are + not + V-ing","example_en":"She isn''t working today.","example_vi":"Hôm nay cô ấy không làm việc."},{"label":"Nghi vấn","pattern":"Am/Is/Are + S + V-ing?","example_en":"Are you listening?","example_vi":"Bạn có đang nghe không?"}]'::jsonb,
    '[{"text_vi":"Hành động đang xảy ra ngay lúc nói","example_en":"Look! It is raining.","example_vi":"Nhìn kìa! Trời đang mưa."},{"text_vi":"Việc tạm thời quanh thời điểm hiện tại","example_en":"She is staying with her aunt this week.","example_vi":"Tuần này cô ấy đang ở nhờ nhà dì."},{"text_vi":"Kế hoạch đã sắp xếp trong tương lai gần","example_en":"We are meeting Lan tomorrow.","example_vi":"Ngày mai chúng tôi sẽ gặp Lan."},{"text_vi":"Phàn nàn về thói quen gây khó chịu (với always)","example_en":"He is always losing his keys.","example_vi":"Anh ấy lúc nào cũng làm mất chìa khóa."}]'::jsonb,
    '["now","right now","at the moment","at present","today","this week","Look!","Listen!"]'::jsonb,
    'Không dùng thì tiếp diễn với động từ chỉ trạng thái như know, like, love, want, need, believe, understand: nói “I know”, không nói “I am knowing”.

Quy tắc thêm -ing: bỏ e cuối (make → making); gấp đôi phụ âm cuối với từ một âm tiết kết thúc bằng nguyên âm + phụ âm (run → running, sit → sitting); ie → ying (lie → lying).', 2)
  on conflict (slug) do nothing
  returning id
)
insert into public.tense_exercises (tense_id, kind, prompt, options, answers, explanation_vi, sort_order)
select tense.id, e.kind, e.prompt, e.options, e.answers, e.explanation_vi, e.sort_order
from tense
cross join (values
    ('choice', 'Be quiet! The baby ___.', '["sleeps","is sleeping","sleep","slept"]'::jsonb, '["is sleeping"]'::jsonb, '“Be quiet!” cho thấy hành động đang diễn ra ngay lúc nói.', 1),
    ('choice', 'I ___ this word. What does it mean?', '["am not understanding","don''t understand","not understand","doesn''t understand"]'::jsonb, '["don''t understand"]'::jsonb, 'understand là động từ trạng thái nên không chia tiếp diễn, dù đang nói về hiện tại.', 2),
    ('choice', 'We ___ dinner with Minh tomorrow evening.', '["have","are having","has","having"]'::jsonb, '["are having"]'::jsonb, 'Kế hoạch đã hẹn trước trong tương lai gần dùng hiện tại tiếp diễn.', 3),
    ('choice', 'Look! It ___.', '["rains","is raining","rain","rained"]'::jsonb, '["is raining"]'::jsonb, '“Look!” là dấu hiệu của hành động đang xảy ra.', 4),
    ('fill', 'They ___ (watch) TV at the moment.', '[]'::jsonb, '["are watching","''re watching"]'::jsonb, 'at the moment → hiện tại tiếp diễn: are + watching.', 5),
    ('fill', 'She ___ (not / work) today. She''s on holiday.', '[]'::jsonb, '["is not working","isn''t working","''s not working"]'::jsonb, 'Việc tạm thời trong hôm nay: is not + working.', 6),
    ('fill', 'What ___ (you / do) right now?', '[]'::jsonb, '["are you doing"]'::jsonb, 'Câu hỏi: are + you + doing.', 7),
    ('fill', 'He ___ (run) in the park now.', '[]'::jsonb, '["is running","''s running"]'::jsonb, 'run gấp đôi phụ âm cuối trước khi thêm -ing: running.', 8)
) as e(kind, prompt, options, answers, explanation_vi, sort_order);

with tense as (
  insert into public.tenses (slug, name_en, name_vi, time_group, summary_vi, formulas, usages, signals, notes_vi, sort_order)
  values ('present-perfect', 'Present Perfect', 'Hiện tại hoàn thành', 'present', 'Nối quá khứ với hiện tại: việc đã xảy ra nhưng còn liên quan hoặc còn kéo dài đến bây giờ.',
    '[{"label":"Khẳng định","pattern":"S + have/has + V3/ed","example_en":"I have lived here for ten years.","example_vi":"Tôi đã sống ở đây mười năm rồi."},{"label":"Phủ định","pattern":"S + have/has + not + V3/ed","example_en":"They haven''t arrived yet.","example_vi":"Họ vẫn chưa đến."},{"label":"Nghi vấn","pattern":"Have/Has + S + V3/ed?","example_en":"Have you ever been to Hue?","example_vi":"Bạn đã bao giờ đến Huế chưa?"}]'::jsonb,
    '[{"text_vi":"Hành động bắt đầu trong quá khứ và kéo dài đến hiện tại","example_en":"She has worked here since 2020.","example_vi":"Cô ấy làm việc ở đây từ năm 2020."},{"text_vi":"Trải nghiệm tính đến hiện tại","example_en":"I have never eaten sushi.","example_vi":"Tôi chưa bao giờ ăn sushi."},{"text_vi":"Việc vừa mới xảy ra, kết quả còn thấy ở hiện tại","example_en":"He has just finished his homework.","example_vi":"Cậu ấy vừa làm xong bài tập."},{"text_vi":"Việc đã xảy ra nhưng không nói rõ thời điểm","example_en":"I have lost my keys.","example_vi":"Tôi làm mất chìa khóa rồi."}]'::jsonb,
    '["for","since","just","already","yet","ever","never","recently","so far","up to now"]'::jsonb,
    'Không dùng hiện tại hoàn thành với thời điểm quá khứ xác định (yesterday, last year, in 2020) — khi đó dùng quá khứ đơn.

for + khoảng thời gian (for two years); since + mốc thời gian (since 2020).

have been to: đã đến và đã về; have gone to: đã đi và chưa về.', 3)
  on conflict (slug) do nothing
  returning id
)
insert into public.tense_exercises (tense_id, kind, prompt, options, answers, explanation_vi, sort_order)
select tense.id, e.kind, e.prompt, e.options, e.answers, e.explanation_vi, e.sort_order
from tense
cross join (values
    ('choice', 'I ___ in this city since 2015.', '["live","lived","have lived","am living"]'::jsonb, '["have lived"]'::jsonb, 'since 2015 → việc bắt đầu trong quá khứ và còn tiếp tục: hiện tại hoàn thành.', 1),
    ('choice', 'She has worked here ___ five years.', '["since","for","from","in"]'::jsonb, '["for"]'::jsonb, '“five years” là một khoảng thời gian nên dùng for.', 2),
    ('choice', '___ you ever eaten sushi?', '["Did","Have","Do","Are"]'::jsonb, '["Have"]'::jsonb, 'Hỏi về trải nghiệm với ever: Have + S + V3.', 3),
    ('choice', 'We ___ that film last night.', '["have seen","saw","see","has seen"]'::jsonb, '["saw"]'::jsonb, '“last night” là thời điểm xác định trong quá khứ nên phải dùng quá khứ đơn.', 4),
    ('fill', 'He ___ (just / finish) his homework.', '[]'::jsonb, '["has just finished","''s just finished"]'::jsonb, 'just đứng giữa has và phân từ hai.', 5),
    ('fill', 'I ___ (never / be) to Japan.', '[]'::jsonb, '["have never been","''ve never been"]'::jsonb, 'Trải nghiệm chưa từng có: have never + been.', 6),
    ('fill', 'They ___ (not / arrive) yet.', '[]'::jsonb, '["have not arrived","haven''t arrived"]'::jsonb, 'yet dùng trong câu phủ định của hiện tại hoàn thành.', 7),
    ('fill', '___ (you / do) the washing-up yet?', '[]'::jsonb, '["Have you done"]'::jsonb, 'Câu hỏi: Have + you + V3 (do → done).', 8)
) as e(kind, prompt, options, answers, explanation_vi, sort_order);

with tense as (
  insert into public.tenses (slug, name_en, name_vi, time_group, summary_vi, formulas, usages, signals, notes_vi, sort_order)
  values ('present-perfect-continuous', 'Present Perfect Continuous', 'Hiện tại hoàn thành tiếp diễn', 'present', 'Nhấn mạnh quá trình liên tục của một hành động bắt đầu trong quá khứ và kéo dài đến hiện tại.',
    '[{"label":"Khẳng định","pattern":"S + have/has + been + V-ing","example_en":"I have been learning English for three years.","example_vi":"Tôi đã học tiếng Anh được ba năm rồi."},{"label":"Phủ định","pattern":"S + have/has + not + been + V-ing","example_en":"He hasn''t been sleeping well.","example_vi":"Dạo này anh ấy ngủ không ngon."},{"label":"Nghi vấn","pattern":"Have/Has + S + been + V-ing?","example_en":"How long have you been waiting?","example_vi":"Bạn đợi được bao lâu rồi?"}]'::jsonb,
    '[{"text_vi":"Nhấn mạnh thời lượng của hành động kéo dài đến hiện tại","example_en":"It has been raining since this morning.","example_vi":"Trời mưa suốt từ sáng đến giờ."},{"text_vi":"Hành động vừa kết thúc và để lại dấu hiệu ở hiện tại","example_en":"She is tired because she has been running.","example_vi":"Cô ấy mệt vì vừa chạy bộ."}]'::jsonb,
    '["for","since","all day","all morning","how long","lately","recently"]'::jsonb,
    'Hiện tại hoàn thành nhấn mạnh kết quả hoặc số lượng (“I have read three books”); hiện tại hoàn thành tiếp diễn nhấn mạnh quá trình hoặc thời lượng (“I have been reading all day”).

Không dùng với động từ trạng thái: “I have known her for years” (không phải “have been knowing”).', 4)
  on conflict (slug) do nothing
  returning id
)
insert into public.tense_exercises (tense_id, kind, prompt, options, answers, explanation_vi, sort_order)
select tense.id, e.kind, e.prompt, e.options, e.answers, e.explanation_vi, e.sort_order
from tense
cross join (values
    ('choice', 'It ___ since this morning.', '["rains","is raining","has been raining","rained"]'::jsonb, '["has been raining"]'::jsonb, 'since this morning + nhấn mạnh sự liên tục → hiện tại hoàn thành tiếp diễn.', 1),
    ('choice', 'How long ___ you been waiting?', '["are","have","do","did"]'::jsonb, '["have"]'::jsonb, 'How long + have + S + been + V-ing.', 2),
    ('choice', 'I ___ her for ten years.', '["have been knowing","have known","am knowing","know"]'::jsonb, '["have known"]'::jsonb, 'know là động từ trạng thái nên dùng hiện tại hoàn thành, không dùng dạng tiếp diễn.', 3),
    ('choice', 'Your eyes are red. ___ you been crying?', '["Are","Have","Do","Were"]'::jsonb, '["Have"]'::jsonb, 'Dấu hiệu ở hiện tại (mắt đỏ) của một hành động vừa kết thúc.', 4),
    ('fill', 'She ___ (work) here for two years.', '[]'::jsonb, '["has been working","''s been working"]'::jsonb, 'for two years, vẫn đang làm → has been working.', 5),
    ('fill', 'We ___ (learn) English since January.', '[]'::jsonb, '["have been learning","''ve been learning"]'::jsonb, 'since January → have been learning.', 6),
    ('fill', 'He ___ (not / sleep) well lately.', '[]'::jsonb, '["has not been sleeping","hasn''t been sleeping"]'::jsonb, 'lately (dạo gần đây) thường đi với hiện tại hoàn thành tiếp diễn.', 7),
    ('fill', 'How long ___ (they / play) football?', '[]'::jsonb, '["have they been playing"]'::jsonb, 'Câu hỏi: have + they + been + playing.', 8)
) as e(kind, prompt, options, answers, explanation_vi, sort_order);

with tense as (
  insert into public.tenses (slug, name_en, name_vi, time_group, summary_vi, formulas, usages, signals, notes_vi, sort_order)
  values ('past-simple', 'Past Simple', 'Quá khứ đơn', 'past', 'Diễn tả hành động đã xảy ra và kết thúc hẳn tại một thời điểm xác định trong quá khứ.',
    '[{"label":"Khẳng định","pattern":"S + V2/ed + O","example_en":"I visited Hue last year.","example_vi":"Năm ngoái tôi đã đi thăm Huế."},{"label":"Phủ định","pattern":"S + did + not + V","example_en":"She didn''t send the email.","example_vi":"Cô ấy đã không gửi email."},{"label":"Nghi vấn","pattern":"Did + S + V?","example_en":"Did you see Nam?","example_vi":"Bạn có thấy Nam không?"},{"label":"Với động từ to be","pattern":"S + was/were (+ not) + …","example_en":"They were at home last night.","example_vi":"Tối qua họ ở nhà."}]'::jsonb,
    '[{"text_vi":"Hành động đã kết thúc tại thời điểm xác định trong quá khứ","example_en":"We went to Da Lat last summer.","example_vi":"Mùa hè năm ngoái chúng tôi đi Đà Lạt."},{"text_vi":"Chuỗi hành động nối tiếp nhau trong quá khứ","example_en":"He got up, had breakfast and went to work.","example_vi":"Anh ấy thức dậy, ăn sáng rồi đi làm."},{"text_vi":"Thói quen trong quá khứ (nay không còn)","example_en":"When I was a child, I played outside every day.","example_vi":"Hồi nhỏ, ngày nào tôi cũng chơi ngoài trời."}]'::jsonb,
    '["yesterday","last night","last week","last year","two days ago","in 2010","when I was a child"]'::jsonb,
    'Động từ có quy tắc thêm -ed: work → worked, live → lived, study → studied, stop → stopped. Động từ bất quy tắc phải học thuộc: go → went, see → saw, buy → bought, have → had.

Sau did / didn''t, động từ trở về nguyên mẫu: “Did you go?” (không phải “Did you went?”).', 5)
  on conflict (slug) do nothing
  returning id
)
insert into public.tense_exercises (tense_id, kind, prompt, options, answers, explanation_vi, sort_order)
select tense.id, e.kind, e.prompt, e.options, e.answers, e.explanation_vi, e.sort_order
from tense
cross join (values
    ('choice', 'We ___ to Da Lat last summer.', '["go","went","have gone","are going"]'::jsonb, '["went"]'::jsonb, 'last summer là thời điểm xác định trong quá khứ; go → went.', 1),
    ('choice', 'She ___ the email yesterday.', '["doesn''t send","didn''t send","hasn''t sent","wasn''t send"]'::jsonb, '["didn''t send"]'::jsonb, 'Phủ định quá khứ đơn: did + not + động từ nguyên mẫu.', 2),
    ('choice', '___ you see Nam at the party?', '["Do","Did","Were","Have"]'::jsonb, '["Did"]'::jsonb, 'Câu hỏi quá khứ đơn với động từ thường: Did + S + V.', 3),
    ('choice', 'They ___ at home last night.', '["was","were","did","are"]'::jsonb, '["were"]'::jsonb, 'Chủ ngữ số nhiều “they” đi với were.', 4),
    ('fill', 'I ___ (buy) a new phone two days ago.', '[]'::jsonb, '["bought"]'::jsonb, 'buy là động từ bất quy tắc: buy → bought.', 5),
    ('fill', 'He ___ (not / come) to class yesterday.', '[]'::jsonb, '["did not come","didn''t come"]'::jsonb, 'did not + come (nguyên mẫu).', 6),
    ('fill', 'Where ___ (you / go) last weekend?', '[]'::jsonb, '["did you go"]'::jsonb, 'Từ để hỏi + did + S + động từ nguyên mẫu.', 7),
    ('fill', 'She ___ (study) French when she was at school.', '[]'::jsonb, '["studied"]'::jsonb, 'Phụ âm + y → bỏ y thêm -ied: study → studied.', 8)
) as e(kind, prompt, options, answers, explanation_vi, sort_order);

with tense as (
  insert into public.tenses (slug, name_en, name_vi, time_group, summary_vi, formulas, usages, signals, notes_vi, sort_order)
  values ('past-continuous', 'Past Continuous', 'Quá khứ tiếp diễn', 'past', 'Diễn tả hành động đang diễn ra tại một thời điểm trong quá khứ, thường làm nền cho một hành động khác xen vào.',
    '[{"label":"Khẳng định","pattern":"S + was/were + V-ing","example_en":"I was watching TV at 8 p.m.","example_vi":"Lúc 8 giờ tối tôi đang xem tivi."},{"label":"Phủ định","pattern":"S + was/were + not + V-ing","example_en":"They weren''t listening.","example_vi":"Lúc đó họ không lắng nghe."},{"label":"Nghi vấn","pattern":"Was/Were + S + V-ing?","example_en":"Were you sleeping when I called?","example_vi":"Lúc tôi gọi bạn đang ngủ à?"}]'::jsonb,
    '[{"text_vi":"Hành động đang diễn ra tại một thời điểm xác định trong quá khứ","example_en":"At 9 p.m. yesterday, she was doing her homework.","example_vi":"Lúc 9 giờ tối qua, cô ấy đang làm bài tập."},{"text_vi":"Hành động đang diễn ra thì hành động khác xen vào","example_en":"I was cooking when the phone rang.","example_vi":"Tôi đang nấu ăn thì điện thoại reo."},{"text_vi":"Hai hành động diễn ra song song","example_en":"While she was reading, he was cooking.","example_vi":"Trong khi cô ấy đọc sách thì anh ấy nấu ăn."}]'::jsonb,
    '["at 8 p.m. yesterday","at that time","while","when","all evening"]'::jsonb,
    'Hành động dài, đang diễn ra dùng quá khứ tiếp diễn; hành động ngắn xen vào dùng quá khứ đơn.

while thường đi với quá khứ tiếp diễn; when thường đi với quá khứ đơn.', 6)
  on conflict (slug) do nothing
  returning id
)
insert into public.tense_exercises (tense_id, kind, prompt, options, answers, explanation_vi, sort_order)
select tense.id, e.kind, e.prompt, e.options, e.answers, e.explanation_vi, e.sort_order
from tense
cross join (values
    ('choice', 'I ___ a shower when the phone rang.', '["had","was having","am having","have had"]'::jsonb, '["was having"]'::jsonb, 'Hành động đang diễn ra (tắm) bị hành động khác xen vào (điện thoại reo).', 1),
    ('choice', 'While we ___ dinner, the lights went out.', '["had","were having","have","are having"]'::jsonb, '["were having"]'::jsonb, 'while + quá khứ tiếp diễn cho hành động làm nền.', 2),
    ('choice', 'What ___ you doing at 9 p.m. last night?', '["was","were","did","are"]'::jsonb, '["were"]'::jsonb, 'you đi với were; có thời điểm xác định trong quá khứ.', 3),
    ('choice', 'When I arrived, they ___ football, so I sat down and watched.', '["played","were playing","play","are playing"]'::jsonb, '["were playing"]'::jsonb, 'Lúc tôi đến, trận bóng đang diễn ra dở → quá khứ tiếp diễn.', 4),
    ('fill', 'She ___ (read) a book at ten o''clock last night.', '[]'::jsonb, '["was reading"]'::jsonb, 'Thời điểm xác định trong quá khứ → was + reading.', 5),
    ('fill', 'They ___ (not / listen) when the teacher explained the rule.', '[]'::jsonb, '["were not listening","weren''t listening"]'::jsonb, 'Phủ định: were not + listening.', 6),
    ('fill', 'He ___ (drive) home when it started to rain.', '[]'::jsonb, '["was driving"]'::jsonb, 'drive bỏ e trước khi thêm -ing: driving.', 7),
    ('fill', '___ (you / sleep) when I called?', '[]'::jsonb, '["Were you sleeping"]'::jsonb, 'Câu hỏi: Were + you + sleeping.', 8)
) as e(kind, prompt, options, answers, explanation_vi, sort_order);

with tense as (
  insert into public.tenses (slug, name_en, name_vi, time_group, summary_vi, formulas, usages, signals, notes_vi, sort_order)
  values ('past-perfect', 'Past Perfect', 'Quá khứ hoàn thành', 'past', 'Diễn tả hành động đã hoàn tất trước một hành động hoặc thời điểm khác trong quá khứ.',
    '[{"label":"Khẳng định","pattern":"S + had + V3/ed","example_en":"The film had started when we arrived.","example_vi":"Khi chúng tôi đến thì phim đã bắt đầu rồi."},{"label":"Phủ định","pattern":"S + had + not + V3/ed","example_en":"He hadn''t studied English before.","example_vi":"Trước đó anh ấy chưa từng học tiếng Anh."},{"label":"Nghi vấn","pattern":"Had + S + V3/ed?","example_en":"Had you met him before the party?","example_vi":"Trước bữa tiệc bạn đã gặp anh ấy chưa?"}]'::jsonb,
    '[{"text_vi":"Hành động xảy ra trước một hành động khác trong quá khứ","example_en":"When I got to the station, the train had left.","example_vi":"Khi tôi đến ga thì tàu đã chạy mất rồi."},{"text_vi":"Giải thích nguyên nhân của một việc trong quá khứ","example_en":"He was tired because he had worked all day.","example_vi":"Anh ấy mệt vì đã làm việc cả ngày."},{"text_vi":"Câu điều kiện loại 3 (giả định trái với quá khứ)","example_en":"If I had studied harder, I would have passed.","example_vi":"Nếu tôi học chăm hơn thì tôi đã thi đỗ rồi."}]'::jsonb,
    '["before","after","by the time","already","just","never … before","when"]'::jsonb,
    'Hành động xảy ra trước dùng quá khứ hoàn thành, hành động xảy ra sau dùng quá khứ đơn.

Nếu các hành động được kể theo đúng trình tự thời gian thì chỉ cần dùng quá khứ đơn.', 7)
  on conflict (slug) do nothing
  returning id
)
insert into public.tense_exercises (tense_id, kind, prompt, options, answers, explanation_vi, sort_order)
select tense.id, e.kind, e.prompt, e.options, e.answers, e.explanation_vi, e.sort_order
from tense
cross join (values
    ('choice', 'When I got to the station, the train ___.', '["left","had left","has left","leaves"]'::jsonb, '["had left"]'::jsonb, 'Tàu chạy trước khi tôi đến → hành động xảy ra trước dùng quá khứ hoàn thành.', 1),
    ('choice', 'She ___ never seen snow before she went to Sa Pa.', '["has","had","was","did"]'::jsonb, '["had"]'::jsonb, 'Trải nghiệm tính đến một thời điểm trong quá khứ: had never + V3.', 2),
    ('choice', 'After he ___ dinner, he went out.', '["had eaten","has eaten","eats","was eating"]'::jsonb, '["had eaten"]'::jsonb, 'After + quá khứ hoàn thành, rồi đến quá khứ đơn.', 3),
    ('choice', 'I didn''t recognise her because she ___ her hair.', '["cut","had cut","has cut","cuts"]'::jsonb, '["had cut"]'::jsonb, 'Việc cắt tóc xảy ra trước và là nguyên nhân của việc không nhận ra.', 4),
    ('fill', 'By the time we arrived, they ___ (finish) lunch.', '[]'::jsonb, '["had finished","''d finished"]'::jsonb, 'By the time + quá khứ đơn, mệnh đề còn lại dùng quá khứ hoàn thành.', 5),
    ('fill', 'He ___ (not / study) English before he moved to London.', '[]'::jsonb, '["had not studied","hadn''t studied"]'::jsonb, 'Phủ định: had not + studied.', 6),
    ('fill', '___ (you / meet) him before the party?', '[]'::jsonb, '["Had you met"]'::jsonb, 'Câu hỏi: Had + you + V3 (meet → met).', 7),
    ('fill', 'The room was dirty because nobody ___ (clean) it.', '[]'::jsonb, '["had cleaned"]'::jsonb, 'Việc không ai dọn xảy ra trước thời điểm căn phòng bẩn.', 8)
) as e(kind, prompt, options, answers, explanation_vi, sort_order);

with tense as (
  insert into public.tenses (slug, name_en, name_vi, time_group, summary_vi, formulas, usages, signals, notes_vi, sort_order)
  values ('past-perfect-continuous', 'Past Perfect Continuous', 'Quá khứ hoàn thành tiếp diễn', 'past', 'Nhấn mạnh hành động đã diễn ra liên tục trong một khoảng thời gian, cho đến trước một thời điểm khác trong quá khứ.',
    '[{"label":"Khẳng định","pattern":"S + had + been + V-ing","example_en":"I had been waiting for an hour when the bus came.","example_vi":"Tôi đã đợi một tiếng thì xe buýt mới đến."},{"label":"Phủ định","pattern":"S + had + not + been + V-ing","example_en":"She hadn''t been sleeping well.","example_vi":"Trước đó cô ấy đã ngủ không ngon."},{"label":"Nghi vấn","pattern":"Had + S + been + V-ing?","example_en":"Had she been waiting long?","example_vi":"Cô ấy đã đợi lâu chưa?"}]'::jsonb,
    '[{"text_vi":"Hành động kéo dài liên tục đến trước một thời điểm trong quá khứ","example_en":"They had been playing for an hour when it started to rain.","example_vi":"Họ đã chơi được một tiếng thì trời bắt đầu mưa."},{"text_vi":"Giải thích nguyên nhân của một tình trạng trong quá khứ","example_en":"The ground was wet because it had been raining.","example_vi":"Mặt đất ướt vì trước đó trời đã mưa."}]'::jsonb,
    '["for","since","before","until then","by the time","how long"]'::jsonb,
    'Thường đi kèm for / since để nói về thời lượng.

Không dùng với động từ trạng thái — khi đó dùng quá khứ hoàn thành: “had known”, không phải “had been knowing”.', 8)
  on conflict (slug) do nothing
  returning id
)
insert into public.tense_exercises (tense_id, kind, prompt, options, answers, explanation_vi, sort_order)
select tense.id, e.kind, e.prompt, e.options, e.answers, e.explanation_vi, e.sort_order
from tense
cross join (values
    ('choice', 'She was tired because she ___ all day.', '["worked","had been working","has been working","is working"]'::jsonb, '["had been working"]'::jsonb, 'Hành động kéo dài trước đó giải thích cho tình trạng mệt trong quá khứ.', 1),
    ('choice', 'We ___ for two hours when the bus arrived.', '["waited","were waiting","had been waiting","have been waiting"]'::jsonb, '["had been waiting"]'::jsonb, 'Có thời lượng (for two hours) tính đến một mốc quá khứ (the bus arrived).', 2),
    ('choice', 'How long ___ he been studying before he took the test?', '["has","had","was","did"]'::jsonb, '["had"]'::jsonb, 'Mốc so sánh nằm trong quá khứ (took the test) nên dùng had been.', 3),
    ('choice', 'The road was wet. It ___.', '["had been raining","has been raining","rains","is raining"]'::jsonb, '["had been raining"]'::jsonb, 'Dấu hiệu trong quá khứ (đường ướt) của hành động kéo dài trước đó.', 4),
    ('fill', 'They ___ (play) for an hour when it started to rain.', '[]'::jsonb, '["had been playing","''d been playing"]'::jsonb, 'had been + playing.', 5),
    ('fill', 'I ___ (not / sleep) well before the exam, so I felt tired.', '[]'::jsonb, '["had not been sleeping","hadn''t been sleeping"]'::jsonb, 'Phủ định: had not been + sleeping.', 6),
    ('fill', 'He ___ (teach) for ten years before he became a headmaster.', '[]'::jsonb, '["had been teaching","''d been teaching"]'::jsonb, 'Nhấn mạnh thời lượng (for ten years) trước một mốc quá khứ.', 7),
    ('fill', '___ (she / wait) long when you arrived?', '[]'::jsonb, '["Had she been waiting"]'::jsonb, 'Câu hỏi: Had + she + been + waiting.', 8)
) as e(kind, prompt, options, answers, explanation_vi, sort_order);

with tense as (
  insert into public.tenses (slug, name_en, name_vi, time_group, summary_vi, formulas, usages, signals, notes_vi, sort_order)
  values ('future-simple', 'Future Simple', 'Tương lai đơn', 'future', 'Diễn tả quyết định tức thời, dự đoán, lời hứa hoặc đề nghị về tương lai.',
    '[{"label":"Khẳng định","pattern":"S + will + V","example_en":"I will call you tonight.","example_vi":"Tối nay tôi sẽ gọi cho bạn."},{"label":"Phủ định","pattern":"S + will not (won''t) + V","example_en":"They won''t come tomorrow.","example_vi":"Ngày mai họ sẽ không đến."},{"label":"Nghi vấn","pattern":"Will + S + V?","example_en":"Will you help me?","example_vi":"Bạn sẽ giúp tôi chứ?"}]'::jsonb,
    '[{"text_vi":"Quyết định đưa ra ngay lúc nói","example_en":"I''m thirsty. I''ll get some water.","example_vi":"Tôi khát quá. Tôi sẽ đi lấy ít nước."},{"text_vi":"Dự đoán theo ý kiến cá nhân (I think, probably)","example_en":"I think it will rain tomorrow.","example_vi":"Tôi nghĩ ngày mai trời sẽ mưa."},{"text_vi":"Lời hứa, lời đề nghị, lời yêu cầu","example_en":"I will help you with your homework.","example_vi":"Tôi sẽ giúp bạn làm bài tập."},{"text_vi":"Sự việc chắc chắn xảy ra trong tương lai","example_en":"She will be twenty next month.","example_vi":"Tháng sau cô ấy sẽ tròn hai mươi tuổi."}]'::jsonb,
    '["tomorrow","next week","next year","soon","in the future","I think","probably","perhaps"]'::jsonb,
    'Dùng be going to (không dùng will) cho dự định đã có từ trước hoặc dự đoán có căn cứ rõ ràng: “Look at those clouds! It''s going to rain.”

Trong mệnh đề thời gian (when, as soon as, before, after) và mệnh đề if loại 1, không dùng will: “When he comes, I will tell him.”', 9)
  on conflict (slug) do nothing
  returning id
)
insert into public.tense_exercises (tense_id, kind, prompt, options, answers, explanation_vi, sort_order)
select tense.id, e.kind, e.prompt, e.options, e.answers, e.explanation_vi, e.sort_order
from tense
cross join (values
    ('choice', 'The phone is ringing. — I ___ it.', '["answer","will answer","am answering","answered"]'::jsonb, '["will answer"]'::jsonb, 'Quyết định đưa ra ngay lúc nói → will + V.', 1),
    ('choice', 'I think our team ___ the match tomorrow.', '["wins","will win","won","is winning"]'::jsonb, '["will win"]'::jsonb, 'Dự đoán theo ý kiến cá nhân với I think → will.', 2),
    ('choice', 'Don''t worry. I ___ late.', '["won''t be","am not","don''t be","wasn''t"]'::jsonb, '["won''t be"]'::jsonb, 'Lời hứa về tương lai, dạng phủ định: won''t + V.', 3),
    ('choice', 'When she ___, I will call you.', '["will arrive","arrives","arrived","is arriving"]'::jsonb, '["arrives"]'::jsonb, 'Sau when trong mệnh đề thời gian dùng hiện tại đơn, không dùng will.', 4),
    ('fill', 'She ___ (be) 18 next month.', '[]'::jsonb, '["will be","''ll be"]'::jsonb, 'Sự việc chắc chắn xảy ra trong tương lai: will + be.', 5),
    ('fill', 'They ___ (not / come) to the party tomorrow.', '[]'::jsonb, '["will not come","won''t come"]'::jsonb, 'Phủ định: will not (won''t) + come.', 6),
    ('fill', '___ (you / help) me with this bag, please?', '[]'::jsonb, '["Will you help"]'::jsonb, 'Lời yêu cầu lịch sự: Will + you + V?', 7),
    ('fill', 'I promise I ___ (call) you tonight.', '[]'::jsonb, '["will call","''ll call"]'::jsonb, 'Lời hứa → will + V.', 8)
) as e(kind, prompt, options, answers, explanation_vi, sort_order);

with tense as (
  insert into public.tenses (slug, name_en, name_vi, time_group, summary_vi, formulas, usages, signals, notes_vi, sort_order)
  values ('future-continuous', 'Future Continuous', 'Tương lai tiếp diễn', 'future', 'Diễn tả hành động sẽ đang diễn ra tại một thời điểm xác định trong tương lai.',
    '[{"label":"Khẳng định","pattern":"S + will + be + V-ing","example_en":"At 9 a.m. tomorrow, I will be taking an exam.","example_vi":"Lúc 9 giờ sáng mai, tôi sẽ đang làm bài thi."},{"label":"Phủ định","pattern":"S + will not + be + V-ing","example_en":"They won''t be working next Sunday.","example_vi":"Chủ nhật tới họ sẽ không làm việc."},{"label":"Nghi vấn","pattern":"Will + S + be + V-ing?","example_en":"Will you be using the car tonight?","example_vi":"Tối nay bạn có dùng xe không?"}]'::jsonb,
    '[{"text_vi":"Hành động sẽ đang diễn ra tại một thời điểm xác định trong tương lai","example_en":"This time next week, she will be lying on the beach.","example_vi":"Giờ này tuần sau, cô ấy sẽ đang nằm trên bãi biển."},{"text_vi":"Hành động sẽ đang diễn ra thì có hành động khác xảy đến","example_en":"When you arrive, I will be waiting at the gate.","example_vi":"Khi bạn đến, tôi sẽ đang đợi ở cổng."},{"text_vi":"Hỏi một cách lịch sự về kế hoạch của người khác","example_en":"Will you be joining us for dinner?","example_vi":"Bạn sẽ ăn tối cùng chúng tôi chứ?"}]'::jsonb,
    '["at this time tomorrow","at 8 p.m. next Sunday","this time next week","when + hiện tại đơn"]'::jsonb,
    'Cần có một mốc thời gian tương lai cụ thể (at 8 p.m. tomorrow, this time next week).

Không dùng với động từ trạng thái (know, like, want…): nói “I will know”, không nói “I will be knowing”.', 10)
  on conflict (slug) do nothing
  returning id
)
insert into public.tense_exercises (tense_id, kind, prompt, options, answers, explanation_vi, sort_order)
select tense.id, e.kind, e.prompt, e.options, e.answers, e.explanation_vi, e.sort_order
from tense
cross join (values
    ('choice', 'At this time tomorrow, we ___ to Phu Quoc.', '["fly","will be flying","flew","have flown"]'::jsonb, '["will be flying"]'::jsonb, '“At this time tomorrow” → hành động sẽ đang diễn ra tại một thời điểm tương lai.', 1),
    ('choice', 'Don''t call at 7 p.m. I ___ dinner then.', '["will have","will be having","had","have"]'::jsonb, '["will be having"]'::jsonb, 'Lúc 7 giờ tối, việc ăn tối sẽ đang diễn ra.', 2),
    ('choice', 'This time next week, she ___ on the beach.', '["lies","will be lying","lay","has lain"]'::jsonb, '["will be lying"]'::jsonb, 'This time next week → will be + V-ing (lie → lying).', 3),
    ('choice', '___ you be using your laptop this evening?', '["Do","Will","Are","Have"]'::jsonb, '["Will"]'::jsonb, 'Hỏi lịch sự về kế hoạch: Will + S + be + V-ing?', 4),
    ('fill', 'At 10 a.m. tomorrow, I ___ (take) my English test.', '[]'::jsonb, '["will be taking","''ll be taking"]'::jsonb, 'will be + taking (take bỏ e).', 5),
    ('fill', 'They ___ (not / work) at this time next Sunday.', '[]'::jsonb, '["will not be working","won''t be working"]'::jsonb, 'Phủ định: will not be + working.', 6),
    ('fill', 'When you arrive, he ___ (wait) for you at the airport.', '[]'::jsonb, '["will be waiting","''ll be waiting"]'::jsonb, 'Hành động đang diễn ra (đợi) khi hành động khác xảy đến (bạn tới nơi).', 7),
    ('fill', 'What ___ (you / do) at 8 p.m. tonight?', '[]'::jsonb, '["will you be doing"]'::jsonb, 'Câu hỏi: will + you + be + doing.', 8)
) as e(kind, prompt, options, answers, explanation_vi, sort_order);

with tense as (
  insert into public.tenses (slug, name_en, name_vi, time_group, summary_vi, formulas, usages, signals, notes_vi, sort_order)
  values ('future-perfect', 'Future Perfect', 'Tương lai hoàn thành', 'future', 'Diễn tả hành động sẽ hoàn tất trước một thời điểm hoặc một hành động khác trong tương lai.',
    '[{"label":"Khẳng định","pattern":"S + will + have + V3/ed","example_en":"By next June, I will have graduated.","example_vi":"Đến tháng Sáu năm sau, tôi sẽ tốt nghiệp xong."},{"label":"Phủ định","pattern":"S + will not + have + V3/ed","example_en":"She won''t have finished by Friday.","example_vi":"Đến thứ Sáu cô ấy sẽ vẫn chưa làm xong."},{"label":"Nghi vấn","pattern":"Will + S + have + V3/ed?","example_en":"Will you have read the book by tomorrow?","example_vi":"Đến ngày mai bạn sẽ đọc xong cuốn sách chứ?"}]'::jsonb,
    '[{"text_vi":"Hành động sẽ hoàn tất trước một thời điểm trong tương lai","example_en":"By 10 p.m., I will have finished my homework.","example_vi":"Đến 10 giờ tối, tôi sẽ làm xong bài tập."},{"text_vi":"Hành động sẽ hoàn tất trước một hành động khác trong tương lai","example_en":"By the time you arrive, we will have finished dinner.","example_vi":"Lúc bạn đến thì chúng tôi đã ăn tối xong rồi."}]'::jsonb,
    '["by + mốc thời gian","by tomorrow","by 2030","by the time","by then","before"]'::jsonb,
    'Sau “by the time” dùng hiện tại đơn, không dùng will: “By the time he arrives, we will have left.”', 11)
  on conflict (slug) do nothing
  returning id
)
insert into public.tense_exercises (tense_id, kind, prompt, options, answers, explanation_vi, sort_order)
select tense.id, e.kind, e.prompt, e.options, e.answers, e.explanation_vi, e.sort_order
from tense
cross join (values
    ('choice', 'By next year, she ___ from university.', '["graduates","will have graduated","graduated","is graduating"]'::jsonb, '["will have graduated"]'::jsonb, 'By next year → hoàn tất trước một mốc tương lai: will have + V3.', 1),
    ('choice', 'By the time you get home, I ___ dinner.', '["cook","will have cooked","cooked","am cooking"]'::jsonb, '["will have cooked"]'::jsonb, 'Việc nấu sẽ xong trước khi bạn về đến nhà.', 2),
    ('choice', 'They will have finished the bridge ___ 2030.', '["in","by","since","for"]'::jsonb, '["by"]'::jsonb, 'by + mốc thời gian = “trước / chậm nhất là”.', 3),
    ('choice', 'By the time he ___, we will have left.', '["will arrive","arrives","arrived","has arriving"]'::jsonb, '["arrives"]'::jsonb, 'Sau by the time dùng hiện tại đơn.', 4),
    ('fill', 'By 10 p.m., I ___ (finish) my homework.', '[]'::jsonb, '["will have finished","''ll have finished"]'::jsonb, 'will have + finished.', 5),
    ('fill', 'She ___ (not / complete) the report by Friday.', '[]'::jsonb, '["will not have completed","won''t have completed"]'::jsonb, 'Phủ định: will not have + completed.', 6),
    ('fill', 'By next month, we ___ (live) here for five years.', '[]'::jsonb, '["will have lived","''ll have lived"]'::jsonb, 'Tính đến tháng sau là tròn năm năm: will have + lived.', 7),
    ('fill', '___ (you / read) the book by tomorrow?', '[]'::jsonb, '["Will you have read"]'::jsonb, 'Câu hỏi: Will + you + have + V3 (read → read).', 8)
) as e(kind, prompt, options, answers, explanation_vi, sort_order);

with tense as (
  insert into public.tenses (slug, name_en, name_vi, time_group, summary_vi, formulas, usages, signals, notes_vi, sort_order)
  values ('future-perfect-continuous', 'Future Perfect Continuous', 'Tương lai hoàn thành tiếp diễn', 'future', 'Nhấn mạnh thời lượng của một hành động kéo dài liên tục cho đến một thời điểm trong tương lai.',
    '[{"label":"Khẳng định","pattern":"S + will + have + been + V-ing","example_en":"By next June, I will have been working here for ten years.","example_vi":"Đến tháng Sáu năm sau, tôi sẽ làm việc ở đây được mười năm."},{"label":"Phủ định","pattern":"S + will not + have + been + V-ing","example_en":"They won''t have been living here for long.","example_vi":"Tính đến lúc đó họ sẽ chưa sống ở đây được lâu."},{"label":"Nghi vấn","pattern":"Will + S + have + been + V-ing?","example_en":"How long will you have been studying by then?","example_vi":"Tính đến lúc đó bạn sẽ học được bao lâu?"}]'::jsonb,
    '[{"text_vi":"Nhấn mạnh hành động sẽ kéo dài được bao lâu tính đến một mốc tương lai","example_en":"By 5 p.m., they will have been working for eight hours.","example_vi":"Đến 5 giờ chiều, họ sẽ làm việc được tám tiếng."}]'::jsonb,
    '["by … for + khoảng thời gian","by the end of this year","by then","by next month"]'::jsonb,
    'Câu thường có đủ hai thành phần: mốc tương lai (by …) và thời lượng (for …).

Không dùng với động từ trạng thái — khi đó dùng tương lai hoàn thành: “will have known”.', 12)
  on conflict (slug) do nothing
  returning id
)
insert into public.tense_exercises (tense_id, kind, prompt, options, answers, explanation_vi, sort_order)
select tense.id, e.kind, e.prompt, e.options, e.answers, e.explanation_vi, e.sort_order
from tense
cross join (values
    ('choice', 'By December, I ___ English for three years.', '["will study","will have been studying","studied","am studying"]'::jsonb, '["will have been studying"]'::jsonb, 'Có mốc tương lai (by December) và thời lượng (for three years).', 1),
    ('choice', 'By 5 p.m., they ___ for eight hours.', '["will have been working","will work","work","are working"]'::jsonb, '["will have been working"]'::jsonb, 'Nhấn mạnh thời lượng tính đến 5 giờ chiều.', 2),
    ('choice', 'How long ___ you have been living here by the end of this year?', '["do","will","are","did"]'::jsonb, '["will"]'::jsonb, 'Câu hỏi: How long + will + S + have been + V-ing?', 3),
    ('choice', 'By next month, we ___ each other for ten years.', '["will have been knowing","will have known","know","will be knowing"]'::jsonb, '["will have known"]'::jsonb, 'know là động từ trạng thái nên dùng tương lai hoàn thành, không dùng dạng tiếp diễn.', 4),
    ('fill', 'By next week, she ___ (teach) at this school for twenty years.', '[]'::jsonb, '["will have been teaching","''ll have been teaching"]'::jsonb, 'will have been + teaching.', 5),
    ('fill', 'By midnight, he ___ (drive) for ten hours.', '[]'::jsonb, '["will have been driving","''ll have been driving"]'::jsonb, 'will have been + driving (drive bỏ e).', 6),
    ('fill', 'By the time the film ends, we ___ (sit) here for three hours.', '[]'::jsonb, '["will have been sitting","''ll have been sitting"]'::jsonb, 'sit gấp đôi phụ âm cuối: sitting.', 7),
    ('fill', 'By June, they ___ (not / live) here for very long.', '[]'::jsonb, '["will not have been living","won''t have been living"]'::jsonb, 'Phủ định: will not have been + living.', 8)
) as e(kind, prompt, options, answers, explanation_vi, sort_order);

-- ---------- IELTS ----------
with test as (
  insert into public.ielts_tests (slug, title, skill, description_vi, duration_minutes, content, sort_order, published)
  values ('reading-practice-test-1', 'Reading Practice Test 1', 'reading', 'Đề đọc đầy đủ 3 bài – 40 câu: ngôn ngữ của loài ong, làm việc từ xa và nghịch lý của sự lựa chọn. Gồm các dạng True/False/Not Given, nối tiêu đề, trắc nghiệm và điền từ.', 60,
    '{"sections":[{"title":"Reading Passage 1","instructions":"You should spend about 20 minutes on Questions 1–13, which are based on Reading Passage 1.","passageTitle":"The Dance Language of Honeybees","passage":"A honeybee colony may contain tens of thousands of insects, yet in many ways it behaves like a single organism. Nowhere is this clearer than in the way bees find food. A colony cannot afford to send every forager out to search at random: flowers bloom for only a short time, and a rich patch discovered by one bee is of little use unless her sisters can find it too. Honeybees solve the problem by passing on information inside the dark hive through movement, a system now known as the dance language.\n\nThe system was decoded by the Austrian scientist Karl von Frisch, who spent decades watching bees through the glass walls of a specially built observation hive. He marked individual foragers with small dots of paint so that he could follow them, and placed dishes of sugar water at measured distances from the hive. For this work he shared a Nobel Prize in 1973. At first, however, many of his colleagues doubted that an insect could communicate in such an abstract way, and the idea was debated for years before it was widely accepted.\n\nVon Frisch found that a returning forager performs one of two dances on the vertical surface of the honeycomb. If the food is close to the hive, she performs a \"round dance\", running in small circles, first one way and then the other. This tells other workers that food is nearby but gives no information about its direction; the recruits simply fly out and search the area around the hive, guided by the scent of the flowers that clings to the dancer''s body.\n\nWhen the food is further away, the forager switches to the \"waggle dance\". She runs forward in a straight line while shaking her body rapidly from side to side, then circles back to her starting point and repeats the run. The straight run carries two messages. Its direction shows where to fly: a run pointing straight up the comb means \"fly towards the sun\", while a run angled 40 degrees to the right of vertical means \"fly 40 degrees to the right of the sun\". Its duration shows how far to go: the longer the bee waggles, the more distant the food.\n\nThe dance is not only watched but also felt. In the darkness of the hive, the followers crowd closely around the dancer, touching her with their antennae, and they detect the vibrations produced by her wings. From time to time a follower makes a short sound that causes the dancer to stop and hand over a small sample of the nectar she has collected, so that the recruits learn the taste of the food as well as its location.\n\nBecause the sun moves across the sky, a bee that dances for a long time must correct for the change, and she does so, gradually altering the angle of her run even though she cannot see the sky from inside the hive. Bees can also find their way when the sun is hidden behind cloud, since their eyes are sensitive to the pattern of polarised light in any patch of blue sky, and this pattern reveals where the sun must be.\n\nThe dance language is used for more than finding food. When a colony grows too large, part of it leaves with the old queen and gathers on a branch in a swarm. Scout bees then search for a new home, such as a hollow tree, and report what they find by dancing on the surface of the swarm. Better sites are advertised with longer and more energetic dances, and over a few days support builds for a single location. Only when the scouts have reached agreement does the swarm take off and fly to its new home.","groups":[{"kind":"tfng","instructions":"Questions 1–7. Do the following statements agree with the information given in the passage? Choose TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, or NOT GIVEN if there is no information on this.","questions":[{"n":1,"prompt":"In some respects, a honeybee colony acts like one single creature."},{"n":2,"prompt":"Von Frisch marked bees with paint so that he could recognise individual insects."},{"n":3,"prompt":"Other scientists accepted von Frisch''s conclusions as soon as they were published."},{"n":4,"prompt":"Von Frisch built his first observation hive while he was still a student."},{"n":5,"prompt":"The round dance shows other bees exactly which direction to fly in."},{"n":6,"prompt":"Bees that follow a round dance usually find the food more quickly than bees that follow a waggle dance."},{"n":7,"prompt":"Bees following a dancer are able to learn what the food tastes like."}]},{"kind":"fill","instructions":"Questions 8–13. Complete the sentences below. Choose ONE WORD ONLY from the passage for each answer.","questions":[{"n":8,"prompt":"A waggle run that points straight up the comb tells bees to fly in the direction of the ________."},{"n":9,"prompt":"The ________ of the straight run tells the other bees how far away the food is."},{"n":10,"prompt":"Bees that follow a dance touch the dancer with their ________."},{"n":11,"prompt":"Followers can sense the ________ made by the dancer''s wings."},{"n":12,"prompt":"Light that is ________ allows bees to work out where the sun is on a cloudy day."},{"n":13,"prompt":"When a colony divides, ________ bees look for a suitable place for the swarm to live."}]}]},{"title":"Reading Passage 2","instructions":"You should spend about 20 minutes on Questions 14–26, which are based on Reading Passage 2.","passageTitle":"Working from Anywhere","passage":"[A] For most of history, people worked where they lived: farmers in their fields, craftspeople in workshops attached to their homes. The idea that work must take place in a separate building, at fixed hours and under the eye of a supervisor, became normal only with the factories and counting houses of the industrial age. Seen in this light, the recent spread of remote work is less a revolution than a partial return to an older pattern, made possible this time by laptops and fast internet connections rather than by looms and workbenches.\n\n[B] Ask remote workers what they value most, and the answer is rarely the work itself. It is time. The daily commute, which for many city dwellers consumes one or two hours, simply disappears, and the hours recovered can be given to family, exercise or sleep. Many also report that they can concentrate better at home, away from the interruptions of an open-plan office. Parents of young children, and people who care for elderly relatives, often say that flexibility of this kind makes the difference between keeping a job and giving it up.\n\n[C] The picture is not entirely positive. Without the walk to the station or the chat by the coffee machine, the working day can lose its natural boundaries, and some remote workers find themselves answering messages late into the evening. Loneliness is a common complaint, particularly among those who live alone. Younger employees face a further difficulty: much of what a newcomer learns is picked up informally, by watching and overhearing experienced colleagues, and this kind of learning is hard to reproduce through a screen.\n\n[D] For employers the calculation is equally mixed. A company with fewer people in the building can rent less space, and it can recruit from a far wider area, since a talented applicant no longer needs to live within travelling distance. On the other hand, managers who were used to judging staff by the hours they spent at their desks have had to find new ways of measuring performance. Those who respond by monitoring every keystroke tend to damage trust, whereas those who set clear goals and judge results generally find that productivity holds up well.\n\n[E] The consequences reach well beyond individual firms. When thousands of commuters stay at home, the cafés, dry cleaners and sandwich shops that depend on them lose their customers, and city-centre transport systems lose the ticket income they were designed around. At the same time, smaller towns and villages may gain new residents who bring their salaries with them. Whether this is welcome depends on whom you ask: local shopkeepers may be delighted, but rising house prices can push out families who have lived there for generations.\n\n[F] It now seems likely that neither the fully remote company nor the traditional office will dominate. Many organisations have settled on a hybrid arrangement, asking staff to come in on two or three agreed days a week. The office, in this model, changes its purpose: it becomes a place for meetings, training and the kind of unplanned conversation that produces new ideas, while tasks that require quiet concentration are done at home. The arrangement satisfies nobody completely, which may be the best evidence that it is a reasonable compromise.","groups":[{"kind":"match","instructions":"Questions 14–19. Reading Passage 2 has six paragraphs, A–F. Choose the correct heading for each paragraph from the list of headings below.","options":["i. The effect on local economies","ii. A middle way that looks set to continue","iii. Why remote work is not really new","iv. Technology that failed to deliver","v. Advantages reported by staff","vi. Mixed results for companies","vii. Government attempts to control home working","viii. Problems faced by those who work at home"],"questions":[{"n":14,"prompt":"Paragraph A"},{"n":15,"prompt":"Paragraph B"},{"n":16,"prompt":"Paragraph C"},{"n":17,"prompt":"Paragraph D"},{"n":18,"prompt":"Paragraph E"},{"n":19,"prompt":"Paragraph F"}]},{"kind":"choice","instructions":"Questions 20–23. Choose the correct letter, A, B, C or D.","questions":[{"n":20,"prompt":"According to the writer, what do remote workers appreciate most?","options":["A. being able to choose more interesting tasks","B. having more time for other parts of their lives","C. earning more money than office workers","D. working with fewer colleagues"]},{"n":21,"prompt":"Why are new employees at a disadvantage when they work remotely?","options":["A. Their managers do not trust them.","B. They receive less formal training than before.","C. They cannot easily learn by observing experienced staff.","D. They have to work later than other employees."]},{"n":22,"prompt":"What does the writer say about managers who track their employees'' activity very closely?","options":["A. They usually achieve higher productivity.","B. They are likely to weaken trust.","C. They save the company money on office space.","D. They find it easier to recruit talented people."]},{"n":23,"prompt":"What is the writer''s view of the hybrid model?","options":["A. It is certain to be replaced by fully remote working.","B. It pleases employers more than employees.","C. It is imperfect but sensible.","D. It makes the office unnecessary."]}]},{"kind":"fill","instructions":"Questions 24–26. Complete the sentences below. Choose ONE WORD ONLY from the passage for each answer.","questions":[{"n":24,"prompt":"Before the industrial age, craftspeople usually worked in ________ that were connected to their homes."},{"n":25,"prompt":"Businesses in city centres suffer when ________ no longer travel in each day."},{"n":26,"prompt":"In smaller towns, an increase in house ________ may force long-established families to leave."}]}]},{"title":"Reading Passage 3","instructions":"You should spend about 20 minutes on Questions 27–40, which are based on Reading Passage 3.","passageTitle":"Too Much Choice?","passage":"Walk into any large supermarket and you may find forty kinds of breakfast cereal, a wall of shampoos and more varieties of olive oil than anyone could taste in a year. Modern economies treat this abundance as an obvious good. More options, the argument runs, mean that each shopper is more likely to find exactly what suits them, and nobody is forced to accept something they do not want. For decades, few people questioned this assumption.\n\nThen, in 2000, the psychologists Sheena Iyengar and Mark Lepper published the results of a now famous experiment carried out in a Californian food store. On some days they set up a tasting table displaying 24 varieties of jam; on other days the table offered only six. The larger display attracted more passers-by, but the smaller one sold far more: about 30 per cent of the people who stopped at the table of six went on to buy a jar, compared with only 3 per cent of those who stopped at the table of 24. An excess of choice, it seemed, could discourage people from choosing at all.\n\nThe psychologist Barry Schwartz later brought the idea to a wide audience in his book The Paradox of Choice. He suggested several reasons why a large range of options can leave us worse off. Comparing many alternatives demands time and mental effort. The more options we reject, the easier it is to imagine that one of them would have been better, so we feel regret even when our choice was a good one. And when we choose from a huge range, our expectations rise: we assume that something perfect must be available, and are disappointed by anything less.\n\nSchwartz also drew a distinction between two kinds of decision-maker. \"Maximisers\" feel they must find the best possible option and will examine every alternative before deciding. \"Satisficers\" look only until they find something that meets their standards, and then stop. Maximisers, he argued, often make objectively better choices, yet they tend to be less satisfied with them, precisely because they remain aware of everything they turned down.\n\nThe story did not end there, however. When other researchers repeated experiments of this kind, the results were inconsistent. A review published in 2010, which combined the findings of fifty earlier studies, concluded that on average the number of options had almost no effect on whether people made a choice or how satisfied they were afterwards. In some studies more choice reduced satisfaction; in others it increased it.\n\nThis does not mean that the original finding was wrong, only that it holds under particular conditions. Choice appears most likely to overwhelm when people are unfamiliar with the products, when the options are difficult to compare, and when there is no obvious way of narrowing them down. An expert who knows exactly what she wants is rarely troubled by a long menu. In my view, the practical lesson is therefore not that choice should be reduced but that it should be organised. A wine list divided into regions, or a website that lets shoppers filter by price and size, offers variety without confusion.\n\nThere is a wider lesson, too. It is tempting to believe that every dissatisfaction can be cured by adding options: another school, another pension plan, another streaming service. Sometimes what people need is not a longer list but better guidance on how to use the one they have.","groups":[{"kind":"ynng","instructions":"Questions 27–32. Do the following statements agree with the claims of the writer? Choose YES if the statement agrees with the claims of the writer, NO if the statement contradicts the claims of the writer, or NOT GIVEN if it is impossible to say what the writer thinks about this.","questions":[{"n":27,"prompt":"For a long time, the belief that more choice benefits consumers was rarely challenged."},{"n":28,"prompt":"In the jam experiment, the table with fewer varieties attracted more shoppers."},{"n":29,"prompt":"Iyengar and Lepper expected the larger display to sell more jam."},{"n":30,"prompt":"Maximisers are generally happier with their decisions than satisficers."},{"n":31,"prompt":"People who know a product area well are less likely to be confused by a large range."},{"n":32,"prompt":"Online shops organise choice more effectively than traditional shops do."}]},{"kind":"fill","instructions":"Questions 33–37. Complete the summary of Barry Schwartz''s ideas below. Choose ONE WORD ONLY from the passage for each answer.","questions":[{"n":33,"prompt":"Examining a large number of alternatives takes time and mental ________."},{"n":34,"prompt":"After deciding, people may feel ________ because they imagine that an option they rejected was better."},{"n":35,"prompt":"A wide range also raises people''s ________, so that anything less than perfect is disappointing."},{"n":36,"prompt":"Schwartz describes people who insist on finding the best possible option as ________."},{"n":37,"prompt":"Satisficers stop searching as soon as their ________ have been met."}]},{"kind":"choice","instructions":"Questions 38–40. Choose the correct letter, A, B, C or D.","questions":[{"n":38,"prompt":"What did the review published in 2010 conclude?","options":["A. More choice always makes people less satisfied.","B. Overall, the number of options made very little difference.","C. The jam experiment had been carried out incorrectly.","D. Shoppers prefer to be offered exactly six options."]},{"n":39,"prompt":"According to the passage, choice is most likely to overwhelm people when","options":["A. they are experts in the product.","B. the options are cheap.","C. the options are hard to compare.","D. they are shopping online."]},{"n":40,"prompt":"What is the writer''s main conclusion?","options":["A. Consumers should be given fewer options.","B. Choice is helpful when it is well organised.","C. Experiments on choice cannot be trusted.","D. Supermarkets should stop selling jam."]}]}]}]}'::jsonb,
    1, true)
  on conflict (slug) do nothing
  returning id
)
insert into public.ielts_answer_keys (test_id, answers)
select test.id, '{"1":{"accept":["TRUE"],"explain":"Đoạn 1: “in many ways it behaves like a single organism”."},"2":{"accept":["TRUE"],"explain":"Đoạn 2: ông đánh dấu từng con ong bằng chấm sơn “so that he could follow them”."},"3":{"accept":["FALSE"],"explain":"Đoạn 2: nhiều đồng nghiệp nghi ngờ và ý tưởng “was debated for years” trước khi được chấp nhận."},"4":{"accept":["NOT GIVEN"],"explain":"Bài không nói ông dựng tổ quan sát đầu tiên vào lúc nào."},"5":{"accept":["FALSE"],"explain":"Đoạn 3: điệu múa vòng tròn “gives no information about its direction”."},"6":{"accept":["NOT GIVEN"],"explain":"Bài không so sánh tốc độ tìm thấy thức ăn giữa hai điệu múa."},"7":{"accept":["TRUE"],"explain":"Đoạn 5: ong múa trao một ít mật “so that the recruits learn the taste of the food”."},"8":{"accept":["sun"],"explain":"Đoạn 4: đường chạy hướng thẳng lên nghĩa là “fly towards the sun”."},"9":{"accept":["duration"],"explain":"Đoạn 4: “Its duration shows how far to go”."},"10":{"accept":["antennae"],"explain":"Đoạn 5: “touching her with their antennae”."},"11":{"accept":["vibrations"],"explain":"Đoạn 5: “they detect the vibrations produced by her wings”."},"12":{"accept":["polarised","polarized"],"explain":"Đoạn 6: mắt ong nhạy với “the pattern of polarised light”."},"13":{"accept":["scout"],"explain":"Đoạn 7: “Scout bees then search for a new home”."},"14":{"accept":["iii"],"explain":"Đoạn A: làm việc từ xa là “a partial return to an older pattern”."},"15":{"accept":["v"],"explain":"Đoạn B liệt kê những điều người lao động được lợi: thời gian, sự tập trung, sự linh hoạt."},"16":{"accept":["viii"],"explain":"Đoạn C nói về mặt trái: ranh giới công việc mờ đi, cô đơn, người mới khó học hỏi."},"17":{"accept":["vi"],"explain":"Đoạn D: “For employers the calculation is equally mixed”."},"18":{"accept":["i"],"explain":"Đoạn E: ảnh hưởng tới hàng quán trung tâm, giao thông và các thị trấn nhỏ."},"19":{"accept":["ii"],"explain":"Đoạn F: mô hình kết hợp (hybrid) là “a reasonable compromise”."},"20":{"accept":["B"],"explain":"Đoạn B: “the answer is rarely the work itself. It is time.”"},"21":{"accept":["C"],"explain":"Đoạn C: người mới học được nhiều nhờ “watching and overhearing experienced colleagues”."},"22":{"accept":["B"],"explain":"Đoạn D: “Those who respond by monitoring every keystroke tend to damage trust”."},"23":{"accept":["C"],"explain":"Đoạn F: không làm ai hài lòng hoàn toàn, nhưng là “a reasonable compromise”."},"24":{"accept":["workshops"],"explain":"Đoạn A: “craftspeople in workshops attached to their homes”."},"25":{"accept":["commuters"],"explain":"Đoạn E: “When thousands of commuters stay at home…”."},"26":{"accept":["prices"],"explain":"Đoạn E: “rising house prices can push out families”."},"27":{"accept":["YES"],"explain":"Đoạn 1: “For decades, few people questioned this assumption.”"},"28":{"accept":["NO"],"explain":"Đoạn 2: “The larger display attracted more passers-by”."},"29":{"accept":["NOT GIVEN"],"explain":"Bài không nói hai nhà nghiên cứu kỳ vọng kết quả nào."},"30":{"accept":["NO"],"explain":"Đoạn 4: maximisers “tend to be less satisfied” với lựa chọn của mình."},"31":{"accept":["YES"],"explain":"Đoạn 6: “An expert who knows exactly what she wants is rarely troubled by a long menu.”"},"32":{"accept":["NOT GIVEN"],"explain":"Tác giả lấy ví dụ cả thực đơn rượu lẫn trang web, không so sánh bên nào tốt hơn."},"33":{"accept":["effort"],"explain":"Đoạn 3: “demands time and mental effort”."},"34":{"accept":["regret"],"explain":"Đoạn 3: “so we feel regret even when our choice was a good one”."},"35":{"accept":["expectations"],"explain":"Đoạn 3: “our expectations rise”."},"36":{"accept":["maximisers","maximizers"],"explain":"Đoạn 4: “Maximisers feel they must find the best possible option”."},"37":{"accept":["standards"],"explain":"Đoạn 4: satisficers dừng khi tìm được thứ “that meets their standards”."},"38":{"accept":["B"],"explain":"Đoạn 5: số lượng lựa chọn “had almost no effect” tính trung bình."},"39":{"accept":["C"],"explain":"Đoạn 6: “when the options are difficult to compare”."},"40":{"accept":["B"],"explain":"Đoạn 6: bài học là lựa chọn “should be organised”, không phải bị cắt giảm."}}'::jsonb
from test;

with test as (
  insert into public.ielts_tests (slug, title, skill, description_vi, duration_minutes, content, sort_order, published)
  values ('listening-practice-test-1', 'Listening Practice Test 1', 'listening', 'Đề nghe đầy đủ 4 phần – 40 câu: đăng ký lớp học, giới thiệu công viên, thảo luận bài thuyết trình và bài giảng về cây xanh đô thị. Âm thanh được đọc bằng giọng máy của trình duyệt.', 30,
    '{"sections":[{"title":"Part 1","instructions":"You will hear a telephone conversation between a receptionist at a community centre and a woman who wants to join an evening class.","transcript":[{"speaker":"Receptionist","text":"Good morning, Riverside Community Centre. How can I help you?"},{"speaker":"Caller","text":"Hello. I''d like to ask about your evening cooking classes, please."},{"speaker":"Receptionist","text":"Of course. We have two courses starting next month. There''s Vietnamese Home Cooking on Tuesdays, and Baking for Beginners on Thursdays."},{"speaker":"Caller","text":"The baking one sounds perfect. What time does it start?"},{"speaker":"Receptionist","text":"Thursday classes run from half past six until half past eight in the evening."},{"speaker":"Caller","text":"Half past six. Good. I finish work at half past five, so that''s fine. And when is the first class?"},{"speaker":"Receptionist","text":"The course begins on the ninth of October and runs for eight weeks."},{"speaker":"Caller","text":"Eight weeks. And how much does it cost?"},{"speaker":"Receptionist","text":"The full course is ninety-five pounds. That includes all the ingredients, but you will need to bring your own apron."},{"speaker":"Caller","text":"An apron. OK, I can do that. Is there a discount for students?"},{"speaker":"Receptionist","text":"I''m afraid the student discount ended last year. But if you pay before the end of September, you get ten per cent off."},{"speaker":"Caller","text":"Great, I''ll do that. Can I book a place now?"},{"speaker":"Receptionist","text":"Certainly. Can I take your name, please?"},{"speaker":"Caller","text":"Yes, it''s Hannah Marlow. That''s M, A, R, L, O, W."},{"speaker":"Receptionist","text":"M, A, R, L, O, W. Thank you. And do you have any food allergies we should know about?"},{"speaker":"Caller","text":"Yes, actually. I''m allergic to nuts."},{"speaker":"Receptionist","text":"Nuts. I''ll make a note for the teacher. Now, the class is held in the Garden Room. That''s on the first floor, next to the library."},{"speaker":"Caller","text":"The Garden Room, first floor. Is there parking at the centre?"},{"speaker":"Receptionist","text":"There''s a small car park behind the building, but it''s usually full by six. Most people leave their cars in Mill Street. It''s free after six o''clock."},{"speaker":"Caller","text":"Mill Street. Is that M, I, double L?"},{"speaker":"Receptionist","text":"That''s right."},{"speaker":"Caller","text":"One last question. Who is teaching the course?"},{"speaker":"Receptionist","text":"That''s Mr Okafor. He used to be the head baker at a large hotel."},{"speaker":"Caller","text":"Wonderful. Thank you so much for your help."},{"speaker":"Receptionist","text":"You''re welcome, Ms Marlow. We''ll send you a confirmation by email this afternoon."}],"groups":[{"kind":"fill","instructions":"Questions 1–10. Complete the booking form below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.","questions":[{"n":1,"prompt":"Course: Baking for ________"},{"n":2,"prompt":"Day of the class: ________"},{"n":3,"prompt":"Start time: ________ p.m."},{"n":4,"prompt":"Date of first class: ________ October"},{"n":5,"prompt":"Cost of the course: £________"},{"n":6,"prompt":"Students must bring: an ________"},{"n":7,"prompt":"Customer''s name: Hannah ________"},{"n":8,"prompt":"Allergy: ________"},{"n":9,"prompt":"Location: the ________ Room (first floor)"},{"n":10,"prompt":"Free parking after 6 p.m. in ________ Street"}]}]},{"title":"Part 2","instructions":"You will hear a volunteer coordinator talking to a group of new volunteers at a city park.","transcript":[{"speaker":"Guide","text":"Good morning, everyone, and welcome to Greenfield Park. My name is Daniel, and I coordinate the volunteer programme here. Before we walk round, let me tell you a little about the park and how you will be helping."},{"speaker":"Guide","text":"The park opened in 1924 on land that used to be a brick factory. You can still see one of the old chimneys near the east gate. For many years it was looked after by the city council, but since 2015 it has been managed by a local charity, the Friends of Greenfield, and that is who I work for."},{"speaker":"Guide","text":"Now, people often ask what volunteers actually do. Some of you may be expecting to plant flowers, and there is a little of that. But the job we need most help with is clearing litter from the lake. It isn''t glamorous, but it makes the biggest difference to the wildlife."},{"speaker":"Guide","text":"Volunteer sessions take place every Saturday morning. We used to meet on Sundays as well, but there weren''t enough people, so for now it is Saturdays only. We start at nine and finish at twelve."},{"speaker":"Guide","text":"You don''t need to bring any tools. We provide gloves, rakes and everything else. The one thing we do ask you to bring is strong boots, because the ground near the water is always muddy."},{"speaker":"Guide","text":"Right. Let me explain what happens in each part of the park, because you will be working in all of them at some point. We are standing by the main entrance. Just behind me is the rose garden. That is where our volunteers do most of their planting, in spring and autumn."},{"speaker":"Guide","text":"If you follow the path to the left, you come to the old boathouse. We don''t keep boats there any more. It is used for storing our equipment, so that is where you will collect your gloves and tools each week."},{"speaker":"Guide","text":"Beyond the boathouse is the meadow. In summer we leave the grass long for insects, and that is where local schools come for nature lessons. You may be asked to help with those."},{"speaker":"Guide","text":"On the far side of the lake is the orchard, which has about sixty apple and pear trees. Every October we hold a fruit-picking day there, and it is our most popular event of the year."},{"speaker":"Guide","text":"Finally, next to the café, there is the walled garden. It is quieter than the rest of the park, and it is where we hold our monthly meetings for volunteers, on the first Wednesday evening of every month. OK. If there are no questions, let''s start the tour."}],"groups":[{"kind":"choice","instructions":"Questions 11–15. Choose the correct letter, A, B or C.","questions":[{"n":11,"prompt":"What was on the site before the park opened?","options":["A. a brick factory","B. a farm","C. a railway station"]},{"n":12,"prompt":"Who manages the park now?","options":["A. the city council","B. a local charity","C. a private company"]},{"n":13,"prompt":"Which task do the volunteers most need to help with?","options":["A. planting flowers","B. removing rubbish from the lake","C. repairing paths"]},{"n":14,"prompt":"When do volunteer sessions take place?","options":["A. on Saturday mornings","B. on Sunday mornings","C. on both Saturday and Sunday mornings"]},{"n":15,"prompt":"What should volunteers bring with them?","options":["A. gloves","B. a rake","C. strong boots"]}]},{"kind":"match","instructions":"Questions 16–20. What is each part of the park used for? Choose the correct answer from the list, A–G.","options":["A. storing equipment","B. volunteer meetings","C. planting by volunteers","D. school nature lessons","E. summer concerts","F. an annual fruit-picking event","G. feeding the ducks"],"questions":[{"n":16,"prompt":"the rose garden"},{"n":17,"prompt":"the old boathouse"},{"n":18,"prompt":"the meadow"},{"n":19,"prompt":"the orchard"},{"n":20,"prompt":"the walled garden"}]}]},{"title":"Part 3","instructions":"You will hear two students, Mai and Tom, talking to their tutor about a presentation on plastic waste at their university.","transcript":[{"speaker":"Tutor","text":"Come in, both of you. So, you wanted to talk about your presentation on reducing plastic waste on campus. How is it going?"},{"speaker":"Mai","text":"Quite well, I think. We''ve finished the survey. We got replies from just over two hundred students."},{"speaker":"Tom","text":"Two hundred and twelve, to be exact. We were hoping for three hundred, but that was probably too ambitious."},{"speaker":"Tutor","text":"Two hundred is plenty for a project of this size. What did you find?"},{"speaker":"Mai","text":"The most surprising thing was about water bottles. We expected students to say they buy bottled water because it''s convenient. But actually, the main reason was that they didn''t know where the drinking fountains were."},{"speaker":"Tutor","text":"Interesting. So it''s a problem of information, not attitude."},{"speaker":"Tom","text":"Exactly. Most people said they would happily refill a bottle if they knew where to do it."},{"speaker":"Tutor","text":"And what about the campus cafés?"},{"speaker":"Tom","text":"That was less encouraging. Only a few students bring their own cups, even though there''s a discount."},{"speaker":"Mai","text":"The discount is only ten pence, though. I think it''s too small for anyone to notice."},{"speaker":"Tom","text":"I''m not sure about that. I think the real problem is that people forget their cups. A bigger discount wouldn''t change that."},{"speaker":"Tutor","text":"Well, you could present both explanations and say that more research is needed. Now, how are you planning to organise the presentation itself?"},{"speaker":"Mai","text":"We thought we would begin with the survey results and then move on to our recommendations."},{"speaker":"Tutor","text":"Hmm. I''d suggest you start with a short story or a striking image, something to get the audience''s attention, and then give the numbers. Otherwise people switch off."},{"speaker":"Tom","text":"We could show a photo of the bins outside the library after lunch. They''re always overflowing."},{"speaker":"Tutor","text":"That would work well. And how long is the presentation at the moment?"},{"speaker":"Mai","text":"When we practised, it took eighteen minutes."},{"speaker":"Tutor","text":"You only have fifteen, so you''ll need to cut something. I would shorten the section on methods. Nobody needs to hear every survey question."},{"speaker":"Tom","text":"OK. We''ll reduce that part."},{"speaker":"Tutor","text":"Good. Now, let''s decide who is doing what before next week."},{"speaker":"Mai","text":"I''ll make the slides. I''ve already started on the design."},{"speaker":"Tom","text":"And I''ll draw the charts from the survey data, since I''ve got the spreadsheet."},{"speaker":"Tutor","text":"Who is going to contact the facilities office about the map of drinking fountains?"},{"speaker":"Tom","text":"Mai, could you do that? You''ve spoken to them before."},{"speaker":"Mai","text":"Sure. I''ll email them tomorrow."},{"speaker":"Tutor","text":"You''ll also need someone to write the one-page handout for the audience."},{"speaker":"Tom","text":"I can write the handout."},{"speaker":"Tutor","text":"And finally, the reference list."},{"speaker":"Mai","text":"I think we should do that together, because we''ve each read different articles."},{"speaker":"Tom","text":"Agreed. We''ll both work on the references."},{"speaker":"Tutor","text":"Excellent. Send me the slides by Friday and I''ll give you some feedback."}],"groups":[{"kind":"choice","instructions":"Questions 21–25. Choose the correct letter, A, B or C.","questions":[{"n":21,"prompt":"How many students completed the survey?","options":["A. 200","B. 212","C. 300"]},{"n":22,"prompt":"Why do most students buy bottled water?","options":["A. It is more convenient.","B. They prefer the taste.","C. They do not know where the drinking fountains are."]},{"n":23,"prompt":"What does Mai think about the discount in the cafés?","options":["A. It is too small to be noticed.","B. It is unfair to staff.","C. It should be removed."]},{"n":24,"prompt":"How does the tutor suggest they begin the presentation?","options":["A. with the survey results","B. with a story or a striking image","C. with their recommendations"]},{"n":25,"prompt":"Which part of the presentation will they shorten?","options":["A. the recommendations","B. the introduction","C. the section on methods"]}]},{"kind":"match","instructions":"Questions 26–30. Who will do each of the following tasks? Choose the correct answer, A, B or C.","options":["A. Mai","B. Tom","C. both Mai and Tom"],"questions":[{"n":26,"prompt":"make the slides"},{"n":27,"prompt":"draw the charts"},{"n":28,"prompt":"contact the facilities office"},{"n":29,"prompt":"write the handout"},{"n":30,"prompt":"prepare the reference list"}]}]},{"title":"Part 4","instructions":"You will hear part of a lecture about trees in cities.","transcript":[{"speaker":"Lecturer","text":"Good afternoon. Today I want to look at something most of us walk past every day without noticing: the trees in our cities. I''ll talk about why they matter, why they are so difficult to grow, and what planners are doing differently today."},{"speaker":"Lecturer","text":"Let''s begin with the benefits. The first, and the most obvious, is temperature. Cities are warmer than the countryside around them, because roads and buildings absorb heat during the day and release it at night. Trees reduce this effect in two ways. They provide shade, of course, but they also cool the air directly, because water evaporates from their leaves."},{"speaker":"Lecturer","text":"The second benefit concerns water. During heavy rain, the leaves and branches hold back some of the water, and the soil around the roots absorbs more. This slows the flow into the drains and lowers the risk of flooding."},{"speaker":"Lecturer","text":"Third, trees improve air quality. Their leaves trap dust and other tiny particles, which are later washed to the ground by rain."},{"speaker":"Lecturer","text":"And finally, there is human health. A number of studies suggest that people who live near green spaces report lower levels of stress, and patients in hospital have been found to recover faster when they can see trees from their window."},{"speaker":"Lecturer","text":"So if trees are so useful, why don''t we simply plant more? The answer is that a city is a very hard place for a tree to live. The main problem is underground. A tree in a forest can spread its roots widely, but a street tree is usually planted in a small pit, surrounded by soil that has been pressed hard by traffic and building work. Roots cannot grow easily through this compacted soil, and they receive little water or oxygen. As a result, street trees often grow slowly and die young, long before they are large enough to provide real benefits."},{"speaker":"Lecturer","text":"A second problem is damage. Trees are hit by vehicles, their roots are cut when pipes and cables are repaired, and in winter the salt used on icy roads harms them."},{"speaker":"Lecturer","text":"There is also a lesson from history. In the twentieth century, many cities planted long avenues of a single species, the elm. When Dutch elm disease arrived, it spread from tree to tree, and millions of elms were lost. Whole streets became bare within a few years. The lesson planners took from this is the importance of variety. Today, many cities follow a simple rule: no single species should make up more than ten per cent of the trees."},{"speaker":"Lecturer","text":"So what else has changed? Engineers now design larger planting pits, sometimes linked together beneath the pavement so that roots can share space. Some cities publish an online map showing every public tree, and invite residents to water young trees during dry weather. And planners increasingly choose species according to the climate expected in fifty years'' time, rather than the climate we have today."},{"speaker":"Lecturer","text":"To sum up, a city tree is not decoration. It is a piece of infrastructure, as useful as a drain or a street light, and it needs the same careful planning."}],"groups":[{"kind":"fill","instructions":"Questions 31–40. Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.","questions":[{"n":31,"prompt":"Temperature: trees give shade, and water ________ from their leaves, which cools the air"},{"n":32,"prompt":"Water: trees slow the flow of rain into drains and reduce the risk of ________"},{"n":33,"prompt":"Air: leaves trap ________ and other small particles"},{"n":34,"prompt":"Health: people living near green spaces report less ________"},{"n":35,"prompt":"Difficulties: the main problem for street trees lies ________"},{"n":36,"prompt":"Roots cannot grow easily through ________ soil"},{"n":37,"prompt":"Damage is caused by vehicles, repairs to pipes, and ________ used on roads in winter"},{"n":38,"prompt":"Dutch elm disease showed planners the importance of ________"},{"n":39,"prompt":"Rule: no single species should be more than ________ per cent of a city''s trees"},{"n":40,"prompt":"Residents are invited to ________ young trees in dry weather"}]}]}]}'::jsonb,
    2, true)
  on conflict (slug) do nothing
  returning id
)
insert into public.ielts_answer_keys (test_id, answers)
select test.id, '{"1":{"accept":["Beginners"],"explain":"“Baking for Beginners on Thursdays.”"},"2":{"accept":["Thursday","Thursdays"],"explain":"Lớp làm bánh học vào thứ Năm (lớp nấu món Việt mới là thứ Ba)."},"3":{"accept":["6.30","6:30","half past six","six thirty","630"],"explain":"“from half past six until half past eight” — 5.30 là giờ tan làm của người gọi."},"4":{"accept":["9","9th","ninth"],"explain":"“The course begins on the ninth of October.”"},"5":{"accept":["95","ninety-five","ninety five"],"explain":"“The full course is ninety-five pounds.”"},"6":{"accept":["apron"],"explain":"“you will need to bring your own apron”."},"7":{"accept":["Marlow"],"explain":"Tên được đánh vần: M-A-R-L-O-W."},"8":{"accept":["nuts","nut"],"explain":"“I''m allergic to nuts.”"},"9":{"accept":["Garden"],"explain":"“the class is held in the Garden Room”."},"10":{"accept":["Mill"],"explain":"“Most people leave their cars in Mill Street. It''s free after six o''clock.”"},"11":{"accept":["A"],"explain":"“on land that used to be a brick factory”."},"12":{"accept":["B"],"explain":"Từ năm 2015 công viên do một tổ chức từ thiện địa phương quản lý."},"13":{"accept":["B"],"explain":"“the job we need most help with is clearing litter from the lake”."},"14":{"accept":["A"],"explain":"“for now it is Saturdays only” — trước đây mới có cả Chủ nhật."},"15":{"accept":["C"],"explain":"Găng tay và cào đã được phát; chỉ cần mang “strong boots”."},"16":{"accept":["C"],"explain":"Vườn hồng là nơi tình nguyện viên trồng cây nhiều nhất."},"17":{"accept":["A"],"explain":"Nhà thuyền cũ “is used for storing our equipment”."},"18":{"accept":["D"],"explain":"Đồng cỏ là nơi các trường đến học về thiên nhiên."},"19":{"accept":["F"],"explain":"Vườn cây ăn quả tổ chức ngày hái quả vào mỗi tháng Mười."},"20":{"accept":["B"],"explain":"Khu vườn có tường bao là nơi họp tình nguyện viên hằng tháng."},"21":{"accept":["B"],"explain":"“Two hundred and twelve, to be exact.”"},"22":{"accept":["C"],"explain":"Lý do chính: sinh viên không biết vòi nước uống ở đâu."},"23":{"accept":["A"],"explain":"Mai: “it''s too small for anyone to notice”."},"24":{"accept":["B"],"explain":"Giảng viên gợi ý mở đầu bằng “a short story or a striking image”."},"25":{"accept":["C"],"explain":"“I would shorten the section on methods.”"},"26":{"accept":["A"],"explain":"Mai: “I''ll make the slides.”"},"27":{"accept":["B"],"explain":"Tom: “I''ll draw the charts from the survey data.”"},"28":{"accept":["A"],"explain":"Tom nhờ Mai và Mai đồng ý: “I''ll email them tomorrow.”"},"29":{"accept":["B"],"explain":"Tom: “I can write the handout.”"},"30":{"accept":["C"],"explain":"“We''ll both work on the references.”"},"31":{"accept":["evaporates"],"explain":"“water evaporates from their leaves”."},"32":{"accept":["flooding","floods","flood"],"explain":"“lowers the risk of flooding”."},"33":{"accept":["dust"],"explain":"“Their leaves trap dust and other tiny particles.”"},"34":{"accept":["stress"],"explain":"“report lower levels of stress”."},"35":{"accept":["underground"],"explain":"“The main problem is underground.”"},"36":{"accept":["compacted"],"explain":"“Roots cannot grow easily through this compacted soil.”"},"37":{"accept":["salt"],"explain":"“the salt used on icy roads harms them”."},"38":{"accept":["variety"],"explain":"“the importance of variety”."},"39":{"accept":["10","ten"],"explain":"“no more than ten per cent of the trees”."},"40":{"accept":["water"],"explain":"“invite residents to water young trees during dry weather”."}}'::jsonb
from test;

-- ---------- Gói học Callan (ví dụ, đang TẮT) ----------
-- Giá dưới đây chỉ là số minh họa. Hãy sửa tên/giá rồi bật gói trong Quản trị → Gói học.
insert into public.callan_packages (name, description_vi, sessions, price_vnd, sort_order, active)
select * from (values
  ('Gói 8 buổi', 'Ví dụ: 2 buổi/tuần trong 1 tháng, lớp nhỏ qua Google Meet.', 8, 1200000, 1, false),
  ('Gói 24 buổi', 'Ví dụ: 2 buổi/tuần trong 3 tháng, lớp nhỏ qua Google Meet.', 24, 3200000, 2, false)
) as p(name, description_vi, sessions, price_vnd, sort_order, active)
where not exists (select 1 from public.callan_packages);

commit;
