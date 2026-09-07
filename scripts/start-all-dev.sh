#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
PUBLIC_FRONTEND_DIR="$ROOT_DIR/citis-infotech/frontend"

cd "$ROOT_DIR"

# The repository contains a legacy root-level App Router tree as well as the
# public app. Remove generated state before starting so a previous root-level
# build cannot be mistaken for the public app's development cache.
for app_dir in \
  "$ROOT_DIR" \
  "$ROOT_DIR/apps/institution-admin" \
  "$ROOT_DIR/apps/parent-portal" \
  "$ROOT_DIR/apps/student-portal" \
  "$ROOT_DIR/apps/super-admin" \
  "$ROOT_DIR/apps/teacher-portal" \
  "$PUBLIC_FRONTEND_DIR"; do
  rm -rf -- "$app_dir/.next"
done

pids=()
start_service() {
  setsid -- "$@" &
  pids+=("$!")
}

wait_for_http() {
  local url="$1"
  local timeout_seconds="${2:-30}"
  local deadline=$((SECONDS + timeout_seconds))

  while (( SECONDS < deadline )); do
    if curl --silent --max-time 1 --output /dev/null "$url"; then
      return 0
    fi
    sleep 0.25
  done

  echo "Timed out waiting for $url" >&2
  return 1
}

cleanup() {
  trap - EXIT INT TERM
  for pid in "${pids[@]}"; do
    kill -TERM -- "-${pid}" 2>/dev/null || kill -TERM "${pid}" 2>/dev/null || true
  done
  for pid in "${pids[@]}"; do
    wait "${pid}" 2>/dev/null || true
  done
}
trap cleanup EXIT INT TERM

# Invoke the API entrypoint directly so its process stays rooted at the
# repository directory instead of inheriting the workspace package directory.
start_service env PORT=4000 npm exec -- ts-node --project services/api/tsconfig.json services/api/src/main.ts

# Portals call /api/v1/auth/me from middleware during their first request. Wait
# for the API listener before launching them so startup is deterministic on
# Replit/Linux as well as on Windows.
wait_for_http "http://127.0.0.1:4000/" 30

start_service npm run dev --prefix apps/institution-admin
start_service npm run dev --prefix apps/student-portal
start_service npm run dev --prefix apps/teacher-portal

# Start the public frontend from its own package directory. Running its package
# script keeps Next's project root, dependency resolution, and port 5000
# configuration tied to citis-infotech/frontend rather than the legacy root app.
start_service bash -c "cd -- \"$PUBLIC_FRONTEND_DIR\" && exec npm run dev"

wait -n "${pids[@]}"