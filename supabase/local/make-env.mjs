// Sinh file .env cho Supabase cục bộ: JWT secret demo + anon key + service_role key.
import { createHmac } from "node:crypto";
import { existsSync, writeFileSync } from "node:fs";

const file = new URL("./.env", import.meta.url);
if (existsSync(file) && !process.argv.includes("--force")) process.exit(0);

const secret = "local-dev-jwt-secret-not-for-production-0123456789";
const b64 = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
const sign = (role) => {
  const body = `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ role, iss: "supabase-local", iat: 1700000000, exp: 4100000000 })}`;
  return `${body}.${createHmac("sha256", secret).update(body).digest("base64url")}`;
};

writeFileSync(
  file,
  [
    `JWT_SECRET=${secret}`,
    `ANON_KEY=${sign("anon")}`,
    `SERVICE_ROLE_KEY=${sign("service_role")}`,
    `SITE_URL=${process.env.SITE_URL ?? "http://localhost:3000"}`,
    `MAILER_AUTOCONFIRM=${process.env.MAILER_AUTOCONFIRM ?? "false"}`,
    `SMTP_HOST=host.docker.internal`,
    `SMTP_PORT=54325`,
    "",
  ].join("\n"),
);
console.log("wrote supabase/local/.env");
