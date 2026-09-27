#!/usr/bin/env bash
# Run in Replit Shell after pulling latest main. Leaves Replit DB untouched.
set -euo pipefail

SOURCE_URL="${REPLIT_DATABASE_URL:-${DATABASE_URL:-}}"
TARGET_URL="${SUPABASE_DATABASE_URL:-}"

if [[ -z "$SOURCE_URL" || -z "$TARGET_URL" ]]; then
  echo "Need Replit DATABASE_URL and SUPABASE_DATABASE_URL in Secrets." >&2
  exit 1
fi

DUMP="/tmp/citis-lms-data-only.dump"
echo "==> Dumping DATA ONLY from Replit dev..."
pg_dump "$SOURCE_URL" \
  --format=custom \
  --data-only \
  --no-owner \
  --no-acl \
  --schema=public \
  --file="$DUMP"

echo "==> Clearing Supabase public data (schema kept)..."
psql "$TARGET_URL" -v ON_ERROR_STOP=1 -c "
DO \$\$ DECLARE r RECORD;
BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
    EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE';
  END LOOP;
END \$\$;
"

echo "==> Loading into Supabase (session_replication_role=replica for FK order)..."
PGOPTIONS='-c session_replication_role=replica' pg_restore \
  --dbname="$TARGET_URL" \
  --no-owner \
  --no-acl \
  --data-only \
  --single-transaction \
  "$DUMP"

echo "==> Data clone complete."
