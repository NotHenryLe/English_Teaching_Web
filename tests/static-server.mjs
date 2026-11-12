// Máy chủ file tĩnh tối giản cho test: phục vụ thư mục out/ giống cách Cloudflare làm
// (/duong-dan → duong-dan.html, không thấy thì trả 404.html kèm mã 404).
import { createReadStream, existsSync, statSync } from "node:fs";
import http from "node:http";
import path from "node:path";

const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".webmanifest": "application/manifest+json", ".png": "image/png", ".svg": "image/svg+xml", ".ico": "image/x-icon",
  ".woff2": "font/woff2", ".woff": "font/woff", ".txt": "text/plain; charset=utf-8", ".xml": "application/xml",
};

export function startStaticServer(root, port) {
  const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, "http://x").pathname);
    const base = path.join(root, path.normalize(pathname).replace(/^(\.\.[/\\])+/, ""));
    const candidates = [base, `${base}.html`, path.join(base, "index.html")];
    const file = candidates.find((candidate) => existsSync(candidate) && statSync(candidate).isFile());
    const target = file ?? path.join(root, "404.html");
    res.writeHead(file ? 200 : 404, { "content-type": TYPES[path.extname(target)] ?? "application/octet-stream", "cache-control": "no-store" });
    createReadStream(target).pipe(res);
  });
  return new Promise((resolve) => server.listen(port, "127.0.0.1", () => resolve(server)));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.PORT ?? 3000);
  await startStaticServer(path.resolve("out"), port);
  console.log(`serving out/ at http://localhost:${port}`);
}
