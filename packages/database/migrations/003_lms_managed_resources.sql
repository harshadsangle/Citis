ALTER TABLE learning_resources DROP CONSTRAINT IF EXISTS learning_resources_check;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'learning_resources'::regclass
      AND conname = 'learning_resources_location_check'
  ) THEN
    ALTER TABLE learning_resources
      ADD CONSTRAINT learning_resources_location_check CHECK (
        (resource_type IN ('VIDEO', 'LINK', 'INTERACTIVE') AND url IS NOT NULL AND length(trim(url)) > 0)
        OR
        resource_type IN ('PDF', 'DOCUMENT', 'PRESENTATION', 'SCORM')
      );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS managed_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE RESTRICT,
  resource_id uuid NOT NULL UNIQUE REFERENCES learning_resources(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('FILE', 'SCORM')),
  storage_key text NOT NULL UNIQUE,
  original_filename text NOT NULL,
  mime_type text NOT NULL,
  byte_size bigint NOT NULL CHECK (byte_size > 0),
  sha256 text NOT NULL CHECK (sha256 ~ '^[0-9a-f]{64}$'),
  entrypoint text,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((kind = 'SCORM' AND entrypoint IS NOT NULL) OR (kind = 'FILE' AND entrypoint IS NULL))
);

CREATE INDEX IF NOT EXISTS managed_files_tenant_institution_idx
  ON managed_files (tenant_id, institution_id, created_at DESC);

INSERT INTO schema_migrations (version)
VALUES ('003_lms_managed_resources')
ON CONFLICT (version) DO NOTHING;