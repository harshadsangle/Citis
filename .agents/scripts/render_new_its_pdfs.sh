#!/usr/bin/env bash
set -euo pipefail
out=.agents/outputs/its-objectives
for f in attached_assets/ITS_OD_*.pdf; do
  base=$(basename "$f" .pdf)
  pdftoppm -f 1 -singlefile -png -r 120 "$f" "$out/$base" >/dev/null 2>&1
  echo "$f -> $out/$base.png"
done
