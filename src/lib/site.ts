// Tên và mô tả mặc định của trang. Tên tổ chức hiển thị ở chân trang / trang Liên hệ
// lấy từ Cài đặt trong trang quản trị; đây là giá trị dự phòng khi chưa điền.
export const SITE_NAME = "English Việt";
export const SITE_TAGLINE = "Học tiếng Anh miễn phí cho người Việt";
export const SITE_DESCRIPTION =
  "Học tiếng Anh miễn phí: từ vựng theo chủ đề có phát âm, 12 thì kèm bài tập, thi thử IELTS Listening & Reading và lớp giao tiếp theo phương pháp Callan.";
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");

export const NAV_LINKS = [
  { href: "/tu-vung", label: "Từ vựng" },
  { href: "/ngu-phap", label: "Ngữ pháp" },
  { href: "/ielts", label: "IELTS" },
  { href: "/phat-am", label: "Phát âm" },
  { href: "/callan", label: "Lớp Callan" },
  { href: "/lien-he", label: "Liên hệ" },
] as const;
