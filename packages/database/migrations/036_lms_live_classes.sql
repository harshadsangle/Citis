-- 036_lms_live_classes
-- Blueprint section 13: an administrator schedules a live class against a
-- course, optionally scoped to a module, unit, or chapter, and stores the
-- meeting provider plus link. Attendance capture, recording processing and
-- external meeting API integrations are intentionally out of scope: only the
-- meeting link and an optional recording link are persisted as metadata.

CREATE TABLE IF NOT EXISTS lms_live_classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  course_id uuid NOT NULL,
  module_id uuid,
  unit_id uuid,
  chapter_id uuid,
  title text NOT NULL,
  description text,
  scheduled_date date NOT NULL,
  start_time time NOT NULL,
  duration_minutes integer NOT NULL CHECK (duration_minutes > 0 AND duration_minutes <= 1440),
  provider text NOT NULL CHECK (provider IN ('ZOOM', 'GOOGLE_MEET', 'MICROSOFT_TEAMS', 'WEBEX')),
  meeting_url text NOT NULL,
  recording_url text,
  status text NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'CANCELLED', 'COMPLETED', 'ARCHIVED')),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, id),
  UNIQUE (tenant_id, course_id, id)
);

CREATE INDEX IF NOT EXISTS lms_live_classes_course_idx
  ON lms_live_classes (tenant_id, course_id, scheduled_date, start_time);

CREATE INDEX IF NOT EXISTS lms_live_classes_upcoming_idx
  ON lms_live_classes (tenant_id, scheduled_date, start_time);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lms_live_classes_tenant_course_fk' AND connamespace = current_schema()::regnamespace) THEN
    ALTER TABLE lms_live_classes ADD CONSTRAINT lms_live_classes_tenant_course_fk
      FOREIGN KEY (tenant_id, course_id) REFERENCES courses(tenant_id, id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lms_live_classes_tenant_module_fk' AND connamespace = current_schema()::regnamespace) THEN
    ALTER TABLE lms_live_classes ADD CONSTRAINT lms_live_classes_tenant_module_fk
      FOREIGN KEY (tenant_id, course_id, module_id) REFERENCES course_modules(tenant_id, course_id, id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lms_live_classes_tenant_unit_fk' AND connamespace = current_schema()::regnamespace) THEN
    ALTER TABLE lms_live_classes ADD CONSTRAINT lms_live_classes_tenant_unit_fk
      FOREIGN KEY (tenant_id, course_id, unit_id) REFERENCES lms_course_units(tenant_id, course_id, id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lms_live_classes_tenant_chapter_fk' AND connamespace = current_schema()::regnamespace) THEN
    ALTER TABLE lms_live_classes ADD CONSTRAINT lms_live_classes_tenant_chapter_fk
      FOREIGN KEY (tenant_id, course_id, chapter_id) REFERENCES lms_course_chapters(tenant_id, course_id, id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lms_live_classes_tenant_creator_fk' AND connamespace = current_schema()::regnamespace) THEN
    ALTER TABLE lms_live_classes ADD CONSTRAINT lms_live_classes_tenant_creator_fk
      FOREIGN KEY (tenant_id, created_by) REFERENCES users(tenant_id, id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lms_live_classes_tenant_updater_fk' AND connamespace = current_schema()::regnamespace) THEN
    ALTER TABLE lms_live_classes ADD CONSTRAINT lms_live_classes_tenant_updater_fk
      FOREIGN KEY (tenant_id, updated_by) REFERENCES users(tenant_id, id);
  END IF;
END $$;

-- Permission codes are explicit in the seed above (for example lms.live_class.create).
WITH permission_seed(resource, action, description) AS (VALUES
  ('live_class', 'VIEW', 'View LMS live classes'),
  ('live_class', 'CREATE', 'Schedule LMS live classes'),
  ('live_class', 'UPDATE', 'Update LMS live classes'),
  ('live_class', 'ARCHIVE', 'Cancel or archive LMS live classes'))
INSERT INTO permissions (module, resource, action, code, description)
SELECT 'lms', resource, action, 'lms.' || resource || '.' || lower(action), description
FROM permission_seed ON CONFLICT (code) DO NOTHING;

-- Learners and assigned instructors may read live classes. Row-level course
-- scope is still enforced by the API, so this grant only unlocks the endpoint.
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.tenant_id = '00000000-0000-0000-0000-000000000001'
  AND r.code IN (
    'CITIS_ADMIN', 'CITIS_SUPER_ADMIN', 'CITIS_PLATFORM_SUPPORT',
    'INSTITUTION_ADMINISTRATOR', 'PRINCIPAL_DIRECTOR', 'ACADEMIC_ADMINISTRATOR',
    'TEACHER', 'INSTRUCTOR', 'STUDENT'
  )
  AND p.code = 'lms.live_class.view'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Only LMS administrators schedule, edit, cancel, or archive live classes.
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.tenant_id = '00000000-0000-0000-0000-000000000001'
  AND r.code IN (
    'CITIS_ADMIN', 'CITIS_SUPER_ADMIN', 'CITIS_PLATFORM_SUPPORT',
    'INSTITUTION_ADMINISTRATOR', 'PRINCIPAL_DIRECTOR', 'ACADEMIC_ADMINISTRATOR'
  )
  AND p.code IN ('lms.live_class.create', 'lms.live_class.update', 'lms.live_class.archive')
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO schema_migrations (version) VALUES ('036_lms_live_classes') ON CONFLICT (version) DO NOTHING;
