CREATE TABLE IF NOT EXISTS programmes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE RESTRICT,
  name text NOT NULL,
  code text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, institution_id, code)
);

CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  programme_id uuid NOT NULL REFERENCES programmes(id) ON DELETE RESTRICT,
  title text NOT NULL,
  code text NOT NULL,
  description text,
  thumbnail text,
  status text NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, programme_id, code)
);

CREATE TABLE IF NOT EXISTS course_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
  title text NOT NULL,
  description text,
  sequence integer NOT NULL DEFAULT 1 CHECK (sequence >= 1),
  status text NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (course_id, sequence)
);

CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  module_id uuid NOT NULL REFERENCES course_modules(id) ON DELETE RESTRICT,
  title text NOT NULL,
  description text,
  sequence integer NOT NULL DEFAULT 1 CHECK (sequence >= 1),
  estimated_duration integer CHECK (estimated_duration IS NULL OR estimated_duration >= 0),
  status text NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (module_id, sequence)
);

CREATE TABLE IF NOT EXISTS learning_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE RESTRICT,
  resource_type text NOT NULL CHECK (resource_type IN ('VIDEO', 'PDF', 'DOCUMENT', 'PRESENTATION', 'LINK', 'SCORM', 'INTERACTIVE')),
  title text NOT NULL,
  url text,
  file_path text,
  duration integer CHECK (duration IS NULL OR duration >= 0),
  sequence integer NOT NULL DEFAULT 1 CHECK (sequence >= 1),
  status text NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (lesson_id, sequence),
  CHECK (
    (resource_type IN ('VIDEO', 'LINK', 'SCORM', 'INTERACTIVE') AND url IS NOT NULL AND length(trim(url)) > 0)
    OR
    (resource_type IN ('PDF', 'DOCUMENT', 'PRESENTATION') AND (url IS NOT NULL OR file_path IS NOT NULL))
  )
);

CREATE INDEX IF NOT EXISTS programmes_tenant_institution_status_idx ON programmes (tenant_id, institution_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS courses_tenant_programme_status_idx ON courses (tenant_id, programme_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS course_modules_tenant_course_sequence_idx ON course_modules (tenant_id, course_id, sequence);
CREATE INDEX IF NOT EXISTS lessons_tenant_module_sequence_idx ON lessons (tenant_id, module_id, sequence);
CREATE INDEX IF NOT EXISTS learning_resources_tenant_lesson_sequence_idx ON learning_resources (tenant_id, lesson_id, sequence);

WITH permission_seed(module, resource, action, description) AS (
  VALUES
    ('lms', 'programme', 'VIEW', 'View LMS programmes'),
    ('lms', 'programme', 'CREATE', 'Create LMS programmes'),
    ('lms', 'programme', 'UPDATE', 'Update LMS programmes'),
    ('lms', 'programme', 'ARCHIVE', 'Archive LMS programmes'),
    ('lms', 'programme', 'PUBLISH', 'Publish LMS programmes'),
    ('lms', 'course', 'VIEW', 'View LMS courses'),
    ('lms', 'course', 'CREATE', 'Create LMS courses'),
    ('lms', 'course', 'UPDATE', 'Update LMS courses'),
    ('lms', 'course', 'ARCHIVE', 'Archive LMS courses'),
    ('lms', 'course', 'PUBLISH', 'Publish LMS courses'),
    ('lms', 'course_module', 'VIEW', 'View LMS course modules'),
    ('lms', 'course_module', 'CREATE', 'Create LMS course modules'),
    ('lms', 'course_module', 'UPDATE', 'Update LMS course modules'),
    ('lms', 'course_module', 'ARCHIVE', 'Archive LMS course modules'),
    ('lms', 'course_module', 'PUBLISH', 'Publish LMS course modules'),
    ('lms', 'lesson', 'VIEW', 'View LMS lessons'),
    ('lms', 'lesson', 'CREATE', 'Create LMS lessons'),
    ('lms', 'lesson', 'UPDATE', 'Update LMS lessons'),
    ('lms', 'lesson', 'ARCHIVE', 'Archive LMS lessons'),
    ('lms', 'lesson', 'PUBLISH', 'Publish LMS lessons'),
    ('lms', 'learning_resource', 'VIEW', 'View LMS learning resources'),
    ('lms', 'learning_resource', 'CREATE', 'Create LMS learning resources'),
    ('lms', 'learning_resource', 'UPDATE', 'Update LMS learning resources'),
    ('lms', 'learning_resource', 'ARCHIVE', 'Archive LMS learning resources'),
    ('lms', 'learning_resource', 'PUBLISH', 'Publish LMS learning resources')
)
INSERT INTO permissions (module, resource, action, code, description)
SELECT module, resource, action, module || '.' || resource || '.' || lower(action), description
FROM permission_seed
ON CONFLICT (code) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.tenant_id = '00000000-0000-0000-0000-000000000001'
  AND r.code IN ('CITIS_SUPER_ADMIN', 'INSTITUTION_ADMINISTRATOR', 'PRINCIPAL_DIRECTOR', 'ACADEMIC_ADMINISTRATOR')
  AND p.module = 'lms'
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO schema_migrations (version)
VALUES ('002_lms_course_management')
ON CONFLICT (version) DO NOTHING;