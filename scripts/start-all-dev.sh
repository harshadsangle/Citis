#!/usr/bin/env bash
set -euo pipefail

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
npm run dev --prefix citis-infotech &
pids+=("$!")

wait -n "${pids[@]}"