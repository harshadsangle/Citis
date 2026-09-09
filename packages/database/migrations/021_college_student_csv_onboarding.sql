DO $$
DECLARE
  constraint_name text;
BEGIN
  FOR constraint_name IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'users'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) = 'CHECK (((email IS NOT NULL) OR (mobile IS NOT NULL)))'
  LOOP
    EXECUTE format('ALTER TABLE users DROP CONSTRAINT %I', constraint_name);
  END LOOP;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS lms_student_profiles_college_user_ci_key
  ON lms_student_profiles (tenant_id, institution_id, lower(college_user_id))
  WHERE student_type = 'COLLEGE_STUDENT' AND college_user_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS lms_student_imports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  uploaded_by uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  original_filename text NOT NULL,
  status text NOT NULL DEFAULT 'COMPLETED'
    CHECK (status IN ('COMPLETED', 'PARTIAL', 'FAILED')),
  total_rows integer NOT NULL DEFAULT 0 CHECK (total_rows >= 0),
  imported_count integer NOT NULL DEFAULT 0 CHECK (imported_count >= 0),
  updated_count integer NOT NULL DEFAULT 0 CHECK (updated_count >= 0),
  duplicate_count integer NOT NULL DEFAULT 0 CHECK (duplicate_count >= 0),
  invalid_count integer NOT NULL DEFAULT 0 CHECK (invalid_count >= 0),
  failed_count integer NOT NULL DEFAULT 0 CHECK (failed_count >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS lms_student_imports_tenant_created_idx
  ON lms_student_imports (tenant_id, created_at DESC);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'lms_student_imports'::regclass
      AND conname = 'lms_student_imports_tenant_id_id_key'
  ) THEN
    ALTER TABLE lms_student_imports
      ADD CONSTRAINT lms_student_imports_tenant_id_id_key UNIQUE (tenant_id, id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS lms_student_import_rows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  import_id uuid NOT NULL,
  row_number integer NOT NULL CHECK (row_number > 1),
  college_name text NOT NULL,
  college_user_id text,
  institution_id uuid,
  user_id uuid,
  status text NOT NULL CHECK (status IN ('IMPORTED', 'UPDATED', 'DUPLICATE', 'INVALID', 'FAILED')),
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT lms_student_import_rows_import_fk
    FOREIGN KEY (tenant_id, import_id) REFERENCES lms_student_imports (tenant_id, id) ON DELETE CASCADE,
  CONSTRAINT lms_student_import_rows_institution_fk
    FOREIGN KEY (tenant_id, institution_id) REFERENCES institutions (tenant_id, id) ON DELETE SET NULL,
  CONSTRAINT lms_student_import_rows_user_fk
    FOREIGN KEY (tenant_id, user_id) REFERENCES users (tenant_id, id) ON DELETE SET NULL,
  UNIQUE (import_id, row_number)
);

CREATE INDEX IF NOT EXISTS lms_student_import_rows_import_idx
  ON lms_student_import_rows (tenant_id, import_id, row_number);

INSERT INTO permissions (module, resource, action, code, description)
VALUES
  ('lms', 'student_import', 'VIEW', 'lms.student_import.view', 'View college student import results'),
  ('lms', 'student_import', 'CREATE', 'lms.student_import.create', 'Import college students from CSV'),
  ('lms', 'student_import', 'UPDATE', 'lms.student_import.update', 'Manage imported college students')
ON CONFLICT (code) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN ('lms.student_import.view', 'lms.student_import.create', 'lms.student_import.update')
WHERE r.code IN ('CITIS_ADMIN', 'CITIS_SUPER_ADMIN')
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO schema_migrations (version)
VALUES ('021_college_student_csv_onboarding')
ON CONFLICT (version) DO NOTHING;