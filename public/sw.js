/* Service worker của web (PWA).
 *
 * Nguyên tắc: luôn ưu tiên bản mới nhất từ mạng, chỉ dùng bản lưu khi mất mạng.
 *  - Trang HTML và dữ liệu điều hướng: mạng trước, lưu lại; mất mạng thì dùng bản đã lưu
 *    hoặc trang /offline.html.
 *  - File tĩnh có mã băm trong tên (/_next/static/…), font, biểu tượng: lấy từ bộ nhớ đệm trước
 *    vì nội dung không bao giờ đổi.
 *  - Mọi yêu cầu khác (kể cả Supabase, từ điển) không bị can thiệp.
 * Đổi CACHE khi muốn xóa sạch bộ nhớ đệm cũ trên máy người dùng.
 */
const CACHE = "etw-v1";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll([OFFLINE_URL, "/"]))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

const isImmutable = (url) => url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/");

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (isImmutable(url)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          }),
      ),
    );
    return;
  }

  const isPage = request.mode === "navigate";
  const isRouteData = url.pathname.endsWith(".txt") || url.searchParams.has("_rsc");
  if (!isPage && !isRouteData) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request, { ignoreSearch: isRouteData });
        if (cached) return cached;
        if (isPage) return (await caches.match(OFFLINE_URL)) || Response.error();
        return Response.error();
      }),
  );
});
