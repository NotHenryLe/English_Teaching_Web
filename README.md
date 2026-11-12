# English Teaching Web

Website học tiếng Anh miễn phí cho người Việt, kèm khu đăng ký lớp giao tiếp theo phương pháp Callan (có phí).

| Mục | Người học làm được gì |
| --- | --- |
| **Từ vựng** | 16 chủ đề / 240 từ mẫu: phiên âm IPA, nghĩa, câu ví dụ, nút nghe; thẻ ghi nhớ và kiểm tra nhanh |
| **Ngữ pháp** | 12 thì: công thức, cách dùng, dấu hiệu, lưu ý + 96 câu bài tập chấm ngay, có lời giải |
| **IELTS** | Đề Reading và Listening đủ 40 câu, đếm giờ, chấm điểm, quy đổi band, giải thích từng câu |
| **Phát âm** | Khung nhập kiểu Google Dịch: nghe giọng Anh-Mỹ / Anh-Anh, nghe chậm, tra IPA + nghĩa + ví dụ |
| **Lớp Callan** | Giới thiệu phương pháp, đăng ký gói học, hướng dẫn chuyển khoản, lịch học + link Google Meet sau khi được duyệt |
| **Tài khoản** | Đăng nhập Google hoặc email; lưu điểm bài tập và kết quả thi thử |

Ba vai trò: **học viên** (mặc định), **giáo viên** (soạn nội dung, xem lớp mình dạy và kết quả học viên của lớp), **quản trị viên** (toàn quyền).

---

## 1. Kiến trúc trong một phút

```
Trình duyệt ──► Cloudflare (file tĩnh: HTML/CSS/JS trong thư mục out/)
     │
     └────────► Supabase (Postgres + đăng nhập + lưu file nghe)
```

- **Giao diện**: Next.js 16 + TypeScript, **xuất tĩnh** (`output: "export"`). Không có máy chủ riêng nào phải thuê hay trông coi.
- **Dữ liệu và đăng nhập**: trình duyệt gọi thẳng Supabase bằng *anon key* (khóa công khai). Mọi quyền hạn được ép trong database bằng **Row Level Security** — xem `supabase/migrations/`. Giao diện quản trị chỉ là lớp hiển thị; người không có quyền dù gọi API trực tiếp cũng bị database từ chối.
- **Nội dung**: nằm trong database, sửa trong trang quản trị và hiện ngay với người học. Lúc build, nội dung được in sẵn vào HTML để Google đọc được và trang mở lên là thấy ngay.
- **PWA**: cài được lên màn hình điện thoại / máy tính như một ứng dụng; trang đã mở xem lại được khi mất mạng.

Vì sao chọn cách này: chạy 24/7 với chi phí 0 đồng, không giới hạn lượt xem trang tĩnh, và thư mục `out/` chính là thứ **Tauri** (Rust) cần nếu sau này muốn đóng gói thành app Windows / macOS / Android / iOS — xem mục 8.

---

## 2. Đưa web lên mạng (khoảng 30–45 phút)

Bạn cần ba tài khoản miễn phí đứng tên mình: **GitHub** (đã có repo này), **Supabase**, **Cloudflare**. Giữ quyền sở hữu cả ba là cách đảm bảo bạn luôn là chủ của web.

### Bước 1 — Tạo database trên Supabase

1. Vào [supabase.com](https://supabase.com) → **New project**. Chọn vùng **Southeast Asia (Singapore)** để gần người dùng Việt Nam. Lưu lại mật khẩu database.
2. Mở **SQL Editor** → dán toàn bộ nội dung file `supabase/migrations/20261111000000_init.sql` → **Run**.
3. Dán tiếp toàn bộ file `supabase/seed.sql` → **Run** (nạp từ vựng, 12 thì, 2 đề IELTS mẫu).
4. Vào **Project Settings → API**, chép hai giá trị: **Project URL** và **anon public key**.

> Không bao giờ đưa `service_role` key vào web hay vào repo. Web chỉ dùng anon key.

### Bước 2 — Cấu hình đăng nhập

Trong Supabase → **Authentication**:

- **URL Configuration**: `Site URL` = địa chỉ web của bạn (ví dụ `https://hoctienganh.example`), và thêm `https://hoctienganh.example/**` vào **Redirect URLs**. (Chưa có tên miền thì quay lại điền sau Bước 3.)
- **Đăng nhập Google**: tạo *OAuth client ID* loại **Web application** trong [Google Cloud Console](https://console.cloud.google.com/apis/credentials), điền *Authorized redirect URI* là `https://<mã-project>.supabase.co/auth/v1/callback`, rồi dán Client ID + Client Secret vào **Authentication → Providers → Google**.
- **Email xác nhận / quên mật khẩu**: máy chủ gửi thư mặc định của Supabase chỉ dành cho thử nghiệm (giới hạn rất ít thư mỗi giờ và chỉ gửi cho thành viên của project). Để người dùng thật đăng ký bằng email, hãy khai báo **SMTP riêng** tại **Authentication → Emails → SMTP Settings** (ví dụ Resend, Brevo đều có gói miễn phí). Nếu chưa làm bước này, người dùng vẫn đăng nhập được bằng Google.

### Bước 3 — Đưa giao diện lên Cloudflare

Cách dùng giao diện web (tự động build lại mỗi khi repo có thay đổi):

1. Vào [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → nhập (import) repo GitHub này.
2. **Build command**: `npm run build` · **Deploy command**: `npx wrangler deploy`.
3. Thêm ba **biến môi trường lúc build** (Build variables):

   | Tên | Giá trị |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL ở Bước 1 |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public key ở Bước 1 |
   | `NEXT_PUBLIC_SITE_URL` | địa chỉ chính thức của web, ví dụ `https://hoctienganh.example` |

4. Deploy. Sau đó gắn tên miền riêng tại **Settings → Domains & Routes** (hoặc dùng tạm địa chỉ `*.workers.dev`).

Cách dùng dòng lệnh (từ máy của bạn):

```bash
cp .env.example .env.local
```

Điền ba biến trên vào `.env.local`, rồi:

```bash
npm install
```

```bash
npx wrangler login
```

```bash
npm run deploy
```

Cấu hình triển khai nằm trong `wrangler.jsonc` (chỉ phục vụ file tĩnh trong `out/`, trang không tồn tại trả về `404.html`).

### Bước 4 — Tự cấp quyền quản trị cho mình

1. Mở web, **đăng ký / đăng nhập** bằng tài khoản bạn muốn dùng làm admin.
2. Trong Supabase → **SQL Editor**, chạy (thay email của bạn):

   ```sql
   update public.profiles set role = 'admin' where email = 'email-cua-ban@gmail.com';
   ```

3. Tải lại web: góc trên bên phải có nút **Quản trị**.

Từ đây, bạn cấp vai trò giáo viên (hoặc admin) cho người khác ngay trong **Quản trị → Người dùng**. Người dùng không thể tự nâng quyền; admin không thể tự hạ quyền chính mình (tránh khóa nhầm).

### Bước 5 — Việc nên làm trước khi công bố

Trang **Quản trị → Tổng quan** liệt kê sẵn:

- **Cài đặt**: tên tổ chức, điện thoại, email, địa chỉ, Zalo, Facebook (hiện ở đầu trang, chân trang, trang Liên hệ) và tài khoản ngân hàng nhận học phí.
- **Gói học**: hai gói mẫu đang **tắt** và giá chỉ là số minh họa — sửa tên, giá rồi bật.
- **Lớp & lịch học**: tạo lớp, chọn giáo viên, dán link Google Meet, thêm các buổi học.

---

## 3. Vận hành hằng ngày

**Duyệt đăng ký Callan** — *Quản trị → Đăng ký Callan*

1. Học viên gửi phiếu → thấy số tài khoản, số tiền, **mã nội dung chuyển khoản** (dạng `CL3F9A2B`) và mã QR.
2. Học viên bấm “Tôi đã chuyển khoản” → đơn chuyển sang “Học viên báo đã chuyển khoản”.
3. Bạn đối chiếu sao kê theo mã, bấm **Duyệt & xếp lớp**, chọn lớp.
4. Ngay lúc đó học viên thấy lớp, giáo viên, lịch từng buổi và nút **Vào lớp (Google Meet)** trong trang Tài khoản. Trước khi được duyệt, database không trả link Meet cho họ.

**Soạn nội dung** — *Quản trị → Từ vựng / Ngữ pháp / Đề IELTS* (giáo viên cũng dùng được)

- Sửa xong là người học thấy ngay. Bài để ở trạng thái **Nháp** chỉ giáo viên / admin xem trước được.
- Chủ đề, bài học hay đề thi **mới thêm** mở được ngay qua đường dẫn của nó; để bài đó có trang HTML in sẵn (tốt cho Google), hãy deploy lại web một lần (Cloudflare → *Deployments* → *Retry deployment*, hoặc push bất kỳ thay đổi nào lên repo).
- **Đề IELTS**: chỉ đăng nội dung tự biên soạn hoặc có quyền sử dụng — đề Cambridge IELTS có bản quyền. Phần nghe chưa có file ghi âm sẽ được trình duyệt đọc bằng giọng máy từ transcript; tải file MP3 thật lên trong trình soạn đề để thay thế (tối đa 50 MB mỗi file).

**Kết quả học viên** — *Quản trị → Kết quả học viên*: admin xem tất cả; giáo viên chỉ xem học viên trong lớp mình dạy.

---

## 4. Các lựa chọn hosting và chi phí

Repo đang cấu hình cho phương án đầu tiên. Số liệu gói miễn phí là tại thời điểm viết — hãy xem trang giá của từng dịch vụ.

| Phương án | Chi phí | Ưu điểm | Lưu ý |
| --- | --- | --- | --- |
| **Cloudflare + Supabase (đang dùng)** | 0 đ | Không có máy chủ phải quản trị; trang tĩnh không giới hạn lượt xem; Cloudflare có máy chủ tại Việt Nam và cho phép dùng thương mại | Supabase miễn phí: database 500 MB, lưu file 1 GB, và **project bị tạm dừng nếu khoảng một tuần không có truy cập nào** |
| Vercel + Supabase | 0 đ → ~20 USD/tháng | Tiện nhất cho Next.js | Gói Hobby của Vercel không cho dùng thương mại; web có khóa học thu phí nên cần gói Pro |
| Supabase Pro | ~25 USD/tháng | Không bị tạm dừng, sao lưu hằng ngày, 8 GB database | Nên nâng khi đã có học viên trả phí |
| PaaS (Railway, Render, Fly.io) | ~5–10 USD/tháng | Cần khi sau này có mã chạy phía máy chủ (ví dụ cổng thanh toán tự động) | Hiện chưa cần |
| VPS tự quản | ~5 USD/tháng | Toàn quyền, dữ liệu nằm trên máy của bạn | Tự lo cập nhật, sao lưu, bảo mật |

**Về việc Supabase tạm dừng**: khi web có người dùng thật thì mỗi lượt mở trang đã là một truy cập. Nếu bị tạm dừng, các trang nội dung vẫn hiển thị (đã in sẵn trong HTML) nhưng đăng nhập và lưu điểm ngừng hoạt động cho tới khi bạn bấm *Restore* trong Supabase. Muốn chắc chắn, hãy nâng gói Pro, hoặc đặt một tác vụ định kỳ (cron) gọi API của project vài ngày một lần.

**Sao lưu**: gói miễn phí không có sao lưu tự động. Thỉnh thoảng hãy xuất dữ liệu (Supabase → *Database → Backups*, hoặc `pg_dump`), nhất là bảng đăng ký học.

---

## 5. Bảo mật

- Toàn bộ phân quyền nằm ở RLS trong `supabase/migrations/20261111000000_init.sql`; file có chú thích tiếng Việt cho từng nhóm quy tắc.
- Đáp án đề IELTS lưu ở bảng riêng mà người học không đọc được. Bài làm được chấm bởi hàm `submit_ielts_attempt` trong database, nên điểm trong lịch sử không thể tự ghi.
- Link Google Meet và lịch học chỉ trả về cho admin, giáo viên của lớp và học viên đã được duyệt vào lớp.
- Số tài khoản ngân hàng chỉ người đã đăng nhập mới đọc được.
- Link do admin nhập (Meet, Facebook, file nghe) phải là `https://`.

Có 33 test tự động cho các quy tắc này (`tests/rls.test.mjs`): mỗi test đăng nhập bằng một vai trò thật rồi thử cả việc được phép lẫn việc bị cấm. Hãy chạy lại mỗi khi sửa file migration.

---

## 6. Chạy ở máy để phát triển

Cần Node.js 22.18 trở lên. Muốn có database cục bộ thì cần thêm Docker.

```bash
npm install
```

```bash
npm run local:up
```

Lệnh trên dựng Supabase cục bộ tại `http://127.0.0.1:54321`, nạp schema + nội dung mẫu và in ra `ANON_KEY`. Tạo `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY vừa in ra>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

```bash
npm run dev
```

Email xác nhận / đặt lại mật khẩu ở môi trường cục bộ không được gửi đi mà lưu thành file trong `supabase/local/.mail/`.

Không có Docker? Bỏ qua `local:up` và không tạo `.env.local`: web chạy ở **chế độ xem thử** với nội dung mẫu trong thư mục `content/` (không có đăng nhập, quản trị).

| Lệnh | Tác dụng |
| --- | --- |
| `npm run dev` | Chạy web ở `http://localhost:3000` |
| `npm run build` | Xuất web tĩnh ra `out/` |
| `npm run preview` | Chạy `out/` bằng môi trường Cloudflare cục bộ |
| `npm run deploy` | Build rồi đưa lên Cloudflare |
| `npm run lint` · `npm run typecheck` | Kiểm tra mã |
| `npm test` | Kiểm tra tính nhất quán của nội dung mẫu (đáp án, đánh số…) |
| `npm run test:rls` | 33 test phân quyền (cần `local:up`) |
| `npm run test:e2e` | 22 test đầu-cuối trên trình duyệt thật (cần `local:up`, `npm run build` và gói `playwright`) |
| `npm run seed:build` | Sinh lại `supabase/seed.sql` từ thư mục `content/` |
| `npm run local:down` | Tắt và xóa Supabase cục bộ |

---

## 7. Cấu trúc thư mục

```
content/               Nội dung mẫu (từ vựng, 12 thì, đề IELTS) — nguồn sinh seed.sql
scripts/build-seed.ts  Sinh supabase/seed.sql
supabase/
  migrations/          Bảng, RLS, hàm chấm điểm, hàm đăng ký Callan
  seed.sql             Nội dung mẫu (sinh tự động, chạy lại nhiều lần vẫn an toàn)
  local/               Supabase cục bộ bằng Docker để phát triển và test
src/
  app/                 Các trang (đường dẫn tiếng Việt: /tu-vung, /ngu-phap, /ielts, /phat-am, /callan…)
  components/          Giao diện; components/admin/ là khu quản trị
  lib/                 Kết nối Supabase, truy vấn, phát âm, chấm điểm
public/                Biểu tượng, service worker (sw.js), header cho Cloudflare (_headers)
tests/                 Test nội dung, test phân quyền, test đầu-cuối
wrangler.jsonc         Cấu hình Cloudflare
```

Đổi tên web mặc định, khẩu hiệu, menu: `src/lib/site.ts`. Đổi màu sắc: phần `@theme` trong `src/app/globals.css`.

---

## 8. Về Rust và ứng dụng PC / di động

Các bài viết kiểu “viết lại bằng Rust, khởi động nhanh hơn hẳn” nói về việc thay **vỏ Electron** (một trình duyệt Chromium đóng kèm trong app) bằng vỏ native nhẹ. Với một website, tốc độ tải phụ thuộc vào giao diện gửi xuống trình duyệt chứ không phải ngôn ngữ phía máy chủ — và web này không có máy chủ riêng, chỉ có file tĩnh trên CDN.

Rust sẽ có ích ở đúng chỗ đó khi bạn cần app cài đặt: **Tauri 2** (lõi Rust) đóng gói thư mục `out/` thành app Windows / macOS / Linux / Android / iOS, dùng webview có sẵn của hệ điều hành nên gọn và khởi động nhanh. Không phải viết lại giao diện. Hai việc cần làm khi tới bước đó: xử lý đăng nhập Google qua *deep link* (app không có địa chỉ `https://` để Google chuyển về), và đăng ký tài khoản nhà phát triển của Apple / Google để phát hành.

Trước mắt, PWA đã cho trải nghiệm “như app”: trên điện thoại chọn **Thêm vào màn hình chính**, trên Chrome / Edge máy tính chọn **Cài đặt ứng dụng**.

---

## 9. Giới hạn hiện tại

- **Phát âm** dùng giọng đọc có sẵn của trình duyệt (Web Speech API): miễn phí, không cần khóa API, nhưng chất lượng giọng tùy thiết bị; một số trình duyệt cũ hoặc trình duyệt trong ứng dụng (Zalo, Facebook) có thể không hỗ trợ.
- **Tra từ**: phiên âm, định nghĩa tiếng Anh lấy từ Free Dictionary API (dịch vụ miễn phí của bên thứ ba, có thể gián đoạn); nghĩa tiếng Việt lấy từ kho từ vựng của chính web. Chưa có dịch Anh ↔ Việt tự do.
- **IELTS**: band là ước tính theo bảng quy đổi phổ biến; đề mẫu phần nghe đang đọc bằng giọng máy.
- **Thanh toán** là chuyển khoản thủ công, admin tự đối soát. Ảnh mã QR do dịch vụ VietQR.io tạo từ số tài khoản bạn nhập (để trống mã BIN nếu không muốn dùng).
- **Ngoại tuyến**: chỉ những trang đã mở mới xem lại được khi mất mạng; làm bài và lưu điểm cần có mạng.
- **Phương pháp Callan**: “Callan Method” là tên phương pháp và giáo trình của Callan Method Organisation. Trước khi quảng bá lớp học, hãy kiểm tra điều kiện sử dụng tên gọi và giáo trình chính thức của họ, và chỉnh phần giới thiệu ở `src/app/callan/page.tsx` cho đúng với cách tổ chức của bạn.
