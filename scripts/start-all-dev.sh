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

# Invoke the API entrypoint directly so its process stays rooted at the
# repository directory instead of inheriting the workspace package directory.
npm exec -- ts-node --project services/api/tsconfig.json services/api/src/main.ts &
pids+=("$!")
npm run dev --prefix apps/institution-admin &
pids+=("$!")
npm run dev --prefix apps/student-portal &
pids+=("$!")
npm run dev --prefix apps/teacher-portal &
pids+=("$!")

# Start the LMS frontend explicitly from the project root. Do not use the
# legacy citis-infotech package wrapper, which changes the child process cwd to
# a duplicated citis-infotech/frontend path.
npm exec -- next dev citis-infotech/frontend --turbopack --hostname 0.0.0.0 --port 5000 &
pids+=("$!")

wait -n "${pids[@]}"