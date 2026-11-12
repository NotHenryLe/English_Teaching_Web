#!/usr/bin/env bash
# Khởi động Supabase cục bộ, nạp schema + dữ liệu mẫu. Cần Docker.
set -euo pipefail
cd "$(dirname "$0")"
node make-env.mjs
docker compose up -d db
until docker compose exec -T db pg_isready -U postgres -h localhost >/dev/null 2>&1; do sleep 1; done
sleep 2
docker compose exec -T db psql -U supabase_admin -d postgres -v ON_ERROR_STOP=1 -q <<'SQL'
alter user authenticator with password 'postgres';
alter user supabase_auth_admin with password 'postgres';
alter user supabase_storage_admin with password 'postgres';
SQL
docker compose up -d
echo "waiting for auth + storage migrations…"
for _ in $(seq 1 60); do
  if docker compose exec -T db psql -U postgres -d postgres -tAc "select to_regclass('auth.users') is not null and to_regclass('storage.buckets') is not null" 2>/dev/null | grep -q t; then break; fi
  sleep 2
done
for file in ../migrations/*.sql ../seed.sql; do
  [ -f "$file" ] || continue
  echo "applying $file"
  docker compose exec -T db psql -U postgres -d postgres -v ON_ERROR_STOP=1 -q < "$file"
done
docker compose kill -s SIGUSR1 rest >/dev/null 2>&1 || true   # PostgREST nạp lại schema cache
echo "Supabase local sẵn sàng: http://127.0.0.1:54321"
grep -E '^(ANON_KEY|SERVICE_ROLE_KEY)=' .env
