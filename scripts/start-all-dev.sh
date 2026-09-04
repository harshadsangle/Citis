#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

pids=()
cleanup() {
  trap - EXIT INT TERM
  if ((${#pids[@]})); then
    kill "${pids[@]}" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

npm run dev:api &
pids+=("$!")
npm run dev --prefix apps/institution-admin &
pids+=("$!")
npm run dev --prefix apps/student-portal &
pids+=("$!")
npm run dev --prefix apps/teacher-portal &
pids+=("$!")

# Start the root frontend directly. Do not use the legacy citis-infotech
# package wrapper, which appends another citis-infotech/frontend path.
npm exec -- next dev --turbopack --hostname 0.0.0.0 --port 5000 &
pids+=("$!")

wait -n "${pids[@]}"