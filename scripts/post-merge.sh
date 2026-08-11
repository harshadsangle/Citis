#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../citis-infotech/frontend"

npm ci --no-audit --no-fund
npm run build