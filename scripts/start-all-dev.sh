#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

pids=()
start_service() {
  setsid -- "$@" &
  pids+=("$!")
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
start_service npm exec -- ts-node --project services/api/tsconfig.json services/api/src/main.ts
start_service npm run dev --prefix apps/institution-admin
start_service npm run dev --prefix apps/student-portal
start_service npm run dev --prefix apps/teacher-portal

# Start the LMS frontend explicitly from the project root. Do not use the
# legacy citis-infotech package wrapper, which changes the child process cwd to
# a duplicated citis-infotech/frontend path.
start_service npm exec -- next dev citis-infotech/frontend --turbopack --hostname 0.0.0.0 --port 5000

wait -n "${pids[@]}"