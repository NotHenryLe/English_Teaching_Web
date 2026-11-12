import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** false khi chưa khai báo biến môi trường: web vẫn chạy ở "chế độ xem thử" với nội dung mẫu. */
export const isSupabaseConfigured = /^https?:\/\//.test(url) && anonKey.length > 20 && !url.includes("YOUR-PROJECT");

let browserClient: SupabaseClient | null = null;

/**
 * Trình duyệt: một client duy nhất, giữ phiên đăng nhập trong localStorage.
 * Lúc build (không có window): client tạm chỉ để đọc nội dung công khai.
 * Chỉ dùng anon key — mọi quyền hạn do RLS trong database quyết định.
 */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (typeof window === "undefined") {
    return createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  }
  browserClient ??= createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return browserClient;
}

/** Đổi lỗi Supabase/Postgres sang câu tiếng Việt dễ hiểu cho người dùng. */
export function describeError(error: unknown): string {
  const raw = error as { message?: string; code?: string; status?: number } | null;
  const message = raw?.message ?? String(error ?? "");
  const code = raw?.code ?? "";
  if (/Failed to fetch|NetworkError|fetch failed|Load failed/i.test(message)) {
    return "Không kết nối được máy chủ. Hãy kiểm tra mạng rồi thử lại.";
  }
  if (code === "42501" || /row-level security|permission denied/i.test(message)) {
    return /[À-ỹ]/.test(message) ? message : "Bạn không có quyền thực hiện thao tác này.";
  }
  if (code === "23505") {
    if (/one_pending/.test(message)) return "Bạn đang có một đăng ký chờ duyệt. Hãy chờ kết quả hoặc hủy đăng ký cũ trước.";
    if (/slug/.test(message)) return "Đường dẫn (slug) này đã được dùng. Hãy chọn slug khác.";
    return "Dữ liệu bị trùng với một mục đã có.";
  }
  if (code === "23503") return "Mục này đang được dùng ở nơi khác nên chưa thể xóa.";
  if (code === "23514") {
    if (/approved_needs_class/.test(message)) return "Cần chọn lớp trước khi duyệt đăng ký.";
    if (/meet_link/.test(message)) return "Link Google Meet phải bắt đầu bằng https://";
    if (/slug/.test(message)) return "Slug chỉ gồm chữ thường không dấu, số và dấu gạch ngang (ví dụ: gia-dinh).";
    return /[À-ỹ]/.test(message) ? message : "Dữ liệu chưa hợp lệ. Hãy kiểm tra lại các ô đã nhập.";
  }
  if (/Invalid login credentials/i.test(message)) return "Email hoặc mật khẩu không đúng.";
  if (/Email not confirmed/i.test(message)) return "Email chưa được xác nhận. Hãy mở thư xác nhận trong hộp thư của bạn.";
  if (/User already registered/i.test(message)) return "Email này đã có tài khoản. Hãy đăng nhập.";
  if (/Password should be at least/i.test(message)) return "Mật khẩu quá ngắn (tối thiểu 8 ký tự).";
  const wait = message.match(/only request this after (\d+) seconds/i);
  if (wait) return `Bạn vừa yêu cầu gửi email. Vui lòng chờ ${wait[1]} giây rồi thử lại.`;
  if (/rate limit|too many requests/i.test(message) || raw?.status === 429) {
    return "Bạn thao tác quá nhanh. Hãy chờ một lát rồi thử lại.";
  }
  if (/same password|different from the old/i.test(message)) return "Mật khẩu mới phải khác mật khẩu cũ.";
  if (/[À-ỹ]/.test(message)) return message;
  return message ? `Có lỗi xảy ra: ${message}` : "Có lỗi xảy ra. Hãy thử lại.";
}
