CREATE TABLE IF NOT EXISTS lms_course_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
  title text NOT NULL,
  description text,
  sequence integer NOT NULL DEFAULT 1 CHECK (sequence >= 1),
  status text NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED')),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, course_id, sequence),
  UNIQUE (tenant_id, id)
);
CREATE TABLE IF NOT EXISTS lms_course_chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  unit_id uuid NOT NULL REFERENCES lms_course_units(id) ON DELETE RESTRICT,
  title text NOT NULL,
  description text,
  sequence integer NOT NULL DEFAULT 1 CHECK (sequence >= 1),
  status text NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED')),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, unit_id, sequence),
  UNIQUE (tenant_id, id)
);
ALTER TABLE course_modules ADD COLUMN IF NOT EXISTS chapter_id uuid;
INSERT INTO lms_course_units (tenant_id, course_id, title, description, sequence, status)
SELECT c.tenant_id, c.id, 'General unit', 'Legacy content grouping', 1, 'PUBLISHED'
FROM courses c
WHERE NOT EXISTS (
  SELECT 1 FROM lms_course_units u WHERE u.tenant_id = c.tenant_id AND u.course_id = c.id AND u.title = 'General unit'
);
INSERT INTO lms_course_chapters (tenant_id, unit_id, title, description, sequence, status)
SELECT u.tenant_id, u.id, 'Default chapter', 'Legacy content grouping', 1, 'PUBLISHED'
FROM lms_course_units u
WHERE u.title = 'General unit'
  AND NOT EXISTS (
    SELECT 1 FROM lms_course_chapters ch WHERE ch.tenant_id = u.tenant_id AND ch.unit_id = u.id AND ch.title = 'Default chapter'
  );
UPDATE course_modules m
SET chapter_id = ch.id
FROM lms_course_chapters ch
JOIN lms_course_units u ON u.tenant_id = ch.tenant_id AND u.id = ch.unit_id
WHERE m.tenant_id = u.tenant_id AND m.course_id = u.course_id
  AND m.chapter_id IS NULL AND u.title = 'General unit' AND ch.title = 'Default chapter';
CREATE INDEX IF NOT EXISTS lms_course_units_course_idx ON lms_course_units(tenant_id, course_id, sequence);
CREATE INDEX IF NOT EXISTS lms_course_chapters_unit_idx ON lms_course_chapters(tenant_id, unit_id, sequence);
CREATE INDEX IF NOT EXISTS course_modules_chapter_idx ON course_modules(tenant_id, chapter_id, sequence);
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lms_units_tenant_course_fk' AND connamespace = current_schema()::regnamespace) THEN
    ALTER TABLE lms_course_units ADD CONSTRAINT lms_units_tenant_course_fk FOREIGN KEY (tenant_id, course_id) REFERENCES courses(tenant_id, id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lms_chapters_tenant_unit_fk' AND connamespace = current_schema()::regnamespace) THEN
    ALTER TABLE lms_course_chapters ADD CONSTRAINT lms_chapters_tenant_unit_fk FOREIGN KEY (tenant_id, unit_id) REFERENCES lms_course_units(tenant_id, id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'course_modules_tenant_chapter_fk' AND connamespace = current_schema()::regnamespace) THEN
    ALTER TABLE course_modules ADD CONSTRAINT course_modules_tenant_chapter_fk FOREIGN KEY (tenant_id, chapter_id) REFERENCES lms_course_chapters(tenant_id, id);
  END IF;
END $$;
WITH permission_seed(resource, action, description) AS (VALUES
 ('unit','VIEW','View LMS course units'),('unit','CREATE','Create LMS course units'),('unit','UPDATE','Update LMS course units'),('unit','ARCHIVE','Archive LMS course units'),('unit','PUBLISH','Publish LMS course units'),
 ('chapter','VIEW','View LMS course chapters'),('chapter','CREATE','Create LMS course chapters'),('chapter','UPDATE','Update LMS course chapters'),('chapter','ARCHIVE','Archive LMS course chapters'),('chapter','PUBLISH','Publish LMS course chapters'))
INSERT INTO permissions(module, resource, action, code, description)
SELECT 'lms', resource, action, 'lms.' || resource || '.' || lower(action), description FROM permission_seed ON CONFLICT(code) DO NOTHING;
-- Permission codes are explicit in the seed above (for example lms.unit.create).
INSERT INTO role_permissions(role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.code IN ('CITIS_SUPER_ADMIN','CITIS_PLATFORM_SUPPORT','INSTITUTION_ADMINISTRATOR','PRINCIPAL_DIRECTOR','ACADEMIC_ADMINISTRATOR','TEACHER','INSTRUCTOR')
  AND p.code LIKE 'lms.%' AND p.resource IN ('unit','chapter') ON CONFLICT DO NOTHING;
INSERT INTO schema_migrations(version) VALUES ('034_lms_units_chapters') ON CONFLICT(version) DO NOTHING;