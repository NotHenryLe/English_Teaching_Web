import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export const dynamic = "force-static";

// Manifest cho PWA: người dùng "Thêm vào màn hình chính" trên điện thoại hoặc "Cài đặt ứng dụng" trên máy tính.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    lang: "vi",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#fbf8f3",
    theme_color: "#2647c8",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Từ vựng", url: "/tu-vung" },
      { name: "Ngữ pháp", url: "/ngu-phap" },
      { name: "Thi thử IELTS", url: "/ielts" },
      { name: "Phát âm", url: "/phat-am" },
    ],
  };
}
