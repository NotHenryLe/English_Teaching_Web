import type { NextConfig } from "next";

// Xuất tĩnh: `next build` tạo thư mục out/ gồm HTML/CSS/JS thuần, chạy được trên
// Cloudflare (miễn phí, không cần máy chủ) và bọc được bằng Tauri thành app sau này.
// Mọi dữ liệu động (đăng nhập, điểm số, quản trị) do trình duyệt gọi thẳng Supabase.
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
