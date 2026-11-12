// Proxy nhỏ thay cho Kong: gom Auth / REST / Storage về một cổng giống Supabase thật.
import http from "node:http";

const routes = [
  ["/auth/v1", { host: "auth", port: 9999 }],
  ["/rest/v1", { host: "rest", port: 3000 }],
  ["/storage/v1", { host: "storage", port: 5000 }],
];
const cors = (req) => ({
  "access-control-allow-origin": req.headers.origin ?? "*",
  "access-control-allow-credentials": "true",
  "access-control-allow-methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS,HEAD",
  "access-control-allow-headers": req.headers["access-control-request-headers"] ?? "*",
  "access-control-expose-headers": "content-range,content-profile,x-total-count,location",
  "access-control-max-age": "3600",
});

http
  .createServer((req, res) => {
    if (req.method === "OPTIONS") {
      res.writeHead(204, cors(req));
      return res.end();
    }
    const match = routes.find(([prefix]) => req.url.startsWith(prefix));
    if (!match) {
      res.writeHead(404, { "content-type": "application/json", ...cors(req) });
      return res.end(JSON.stringify({ message: "no route" }));
    }
    const [prefix, target] = match;
    const headers = { ...req.headers, host: `${target.host}:${target.port}` };
    const upstream = http.request(
      { ...target, method: req.method, path: req.url.slice(prefix.length) || "/", headers },
      (up) => {
        const out = { ...up.headers };
        for (const key of Object.keys(out)) if (key.startsWith("access-control-")) delete out[key];
        res.writeHead(up.statusCode ?? 502, { ...out, ...cors(req) });
        up.pipe(res);
      },
    );
    upstream.on("error", (err) => {
      res.writeHead(502, { "content-type": "application/json", ...cors(req) });
      res.end(JSON.stringify({ message: `upstream ${target.host} error: ${err.message}` }));
    });
    req.pipe(upstream);
  })
  .listen(8000, () => console.log("gateway listening on :8000"));
