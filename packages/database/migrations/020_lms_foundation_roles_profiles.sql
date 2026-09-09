ALTER TABLE lms_enrollments
  ADD COLUMN IF NOT EXISTS assignment_source text NOT NULL DEFAULT 'ADMIN',
  ADD COLUMN IF NOT EXISTS assigned_by uuid REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS assigned_at timestamptz,
  ADD COLUMN IF NOT EXISTS progress_percent numeric(5, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz;

UPDATE lms_enrollments
SET assigned_by = enrolled_by,
    assigned_at = enrolled_at
WHERE assigned_at IS NULL;

ALTER TABLE lms_enrollments
  ALTER COLUMN assigned_at SET DEFAULT now();

CREATE TABLE IF NOT EXISTS lms_student_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  user_id uuid NOT NULL,
  student_type text NOT NULL CHECK (student_type IN ('COLLEGE_STUDENT', 'DIRECT_STUDENT')),
  institution_id uuid,
  college_user_id text,
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'ARCHIVED')),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT lms_student_profiles_tenant_user_fk
    FOREIGN KEY (tenant_id, user_id) REFERENCES users (tenant_id, id) ON DELETE CASCADE,
  CONSTRAINT lms_student_profiles_tenant_institution_fk
    FOREIGN KEY (tenant_id, institution_id) REFERENCES institutions (tenant_id, id) ON DELETE RESTRICT,
  CONSTRAINT lms_student_profiles_type_scope_ck CHECK (
    (student_type = 'COLLEGE_STUDENT' AND institution_id IS NOT NULL)
    OR (student_type = 'DIRECT_STUDENT' AND institution_id IS NULL)
  ),
  UNIQUE (tenant_id, user_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS lms_student_profiles_college_user_key
  ON lms_student_profiles (tenant_id, institution_id, college_user_id)
  WHERE college_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS lms_student_profiles_institution_idx
  ON lms_student_profiles (tenant_id, institution_id, student_type, status);

CREATE TABLE IF NOT EXISTS lms_instructor_colleges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  institution_id uuid NOT NULL,
  instructor_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'REMOVED')),
  assigned_by uuid REFERENCES users(id) ON DELETE SET NULL,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  removed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT lms_instructor_colleges_institution_fk
    FOREIGN KEY (tenant_id, institution_id) REFERENCES institutions (tenant_id, id) ON DELETE RESTRICT,
  CONSTRAINT lms_instructor_colleges_instructor_fk
    FOREIGN KEY (tenant_id, instructor_id) REFERENCES users (tenant_id, id) ON DELETE RESTRICT,
  CONSTRAINT lms_instructor_colleges_status_ck CHECK (
    (status = 'ACTIVE' AND removed_at IS NULL)
    OR (status = 'REMOVED' AND removed_at IS NOT NULL)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS lms_instructor_colleges_active_key
  ON lms_instructor_colleges (tenant_id, institution_id, instructor_id)
  WHERE status = 'ACTIVE';

CREATE INDEX IF NOT EXISTS lms_instructor_colleges_instructor_idx
  ON lms_instructor_colleges (tenant_id, instructor_id, status);

CREATE TABLE IF NOT EXISTS lms_activity_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  institution_id uuid,
  actor_user_id uuid,
  subject_user_id uuid,
  event_type text NOT NULL,
  resource_type text,
  resource_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT lms_activity_events_tenant_institution_fk
    FOREIGN KEY (tenant_id, institution_id) REFERENCES institutions (tenant_id, id) ON DELETE SET NULL,
  CONSTRAINT lms_activity_events_actor_fk
    FOREIGN KEY (tenant_id, actor_user_id) REFERENCES users (tenant_id, id) ON DELETE SET NULL,
  CONSTRAINT lms_activity_events_subject_fk
    FOREIGN KEY (tenant_id, subject_user_id) REFERENCES users (tenant_id, id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS lms_activity_events_scope_idx
  ON lms_activity_events (tenant_id, institution_id, created_at DESC);
CREATE INDEX IF NOT EXISTS lms_activity_events_subject_idx
  ON lms_activity_events (tenant_id, subject_user_id, created_at DESC);

WITH student_users AS (
  SELECT DISTINCT ON (u.tenant_id, u.id)
    u.tenant_id,
    u.id AS user_id,
    ur.institution_id
  FROM users u
  JOIN user_roles ur ON ur.user_id = u.id AND ur.tenant_id = u.tenant_id
  JOIN roles r ON r.id = ur.role_id AND r.tenant_id = ur.tenant_id
  WHERE r.code = 'STUDENT'
  ORDER BY u.tenant_id, u.id, (ur.institution_id IS NULL), ur.institution_id
)
INSERT INTO lms_student_profiles (tenant_id, user_id, student_type, institution_id)
SELECT tenant_id,
       user_id,
       CASE WHEN institution_id IS NULL THEN 'DIRECT_STUDENT' ELSE 'COLLEGE_STUDENT' END,
       institution_id
FROM student_users
ON CONFLICT (tenant_id, user_id) DO NOTHING;

INSERT INTO lms_instructor_colleges (tenant_id, institution_id, instructor_id, assigned_by)
SELECT DISTINCT ur.tenant_id, ur.institution_id, ur.user_id, NULL
FROM user_roles ur
JOIN roles r ON r.id = ur.role_id AND r.tenant_id = ur.tenant_id
WHERE ur.institution_id IS NOT NULL
  AND r.code IN ('TEACHER', 'INSTRUCTOR')
ON CONFLICT DO NOTHING;

WITH permission_seed(module, resource, action, description) AS (
  VALUES
    ('lms', 'student_profile', 'VIEW', 'View LMS student profiles'),
    ('lms', 'instructor_college', 'VIEW', 'View instructor college relationships'),
    ('lms', 'instructor_college', 'CREATE', 'Assign instructors to colleges'),
    ('lms', 'instructor_college', 'ARCHIVE', 'Remove instructor college relationships'),
    ('lms', 'activity', 'VIEW', 'View LMS activity events'),
    ('lms', 'activity', 'EXPORT', 'Export LMS activity events')
)
INSERT INTO permissions (module, resource, action, code, description)
SELECT module, resource, action, module || '.' || resource || '.' || lower(action), description
FROM permission_seed
ON CONFLICT (code) DO NOTHING;

INSERT INTO roles (tenant_id, name, code, description)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'CITIS Admin', 'CITIS_ADMIN', 'Central CITIS administration'),
  ('00000000-0000-0000-0000-000000000001', 'Instructor', 'INSTRUCTOR', 'Instructor access scoped to assigned colleges and courses')
ON CONFLICT (tenant_id, code) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.tenant_id = '00000000-0000-0000-0000-000000000001'
  AND r.code = 'CITIS_ADMIN'
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT instructor.id, permission.id
FROM roles instructor
JOIN roles teacher
  ON teacher.tenant_id = instructor.tenant_id
 AND teacher.code = 'TEACHER'
JOIN role_permissions teacher_permission ON teacher_permission.role_id = teacher.id
JOIN permissions permission ON permission.id = teacher_permission.permission_id
WHERE instructor.tenant_id = '00000000-0000-0000-0000-000000000001'
  AND instructor.code = 'INSTRUCTOR'
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.tenant_id = '00000000-0000-0000-0000-000000000001'
  AND r.code IN ('CITIS_ADMIN', 'CITIS_SUPER_ADMIN', 'INSTITUTION_ADMINISTRATOR', 'PRINCIPAL_DIRECTOR', 'ACADEMIC_ADMINISTRATOR')
  AND p.code IN (
    'lms.student_profile.view',
    'lms.instructor_college.view',
    'lms.instructor_college.create',
    'lms.instructor_college.archive',
    'lms.activity.view',
    'lms.activity.export'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code = 'lms.student_profile.view'
WHERE r.tenant_id = '00000000-0000-0000-0000-000000000001'
  AND r.code IN ('STUDENT', 'INSTRUCTOR', 'TEACHER')
ON CONFLICT (role_id, permission_id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'lms_enrollments_assignment_source_ck'
  ) THEN
    ALTER TABLE lms_enrollments
      ADD CONSTRAINT lms_enrollments_assignment_source_ck
      CHECK (assignment_source IN ('ADMIN', 'COLLEGE', 'DIRECT'));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'lms_enrollments_progress_percent_ck'
  ) THEN
    ALTER TABLE lms_enrollments
      ADD CONSTRAINT lms_enrollments_progress_percent_ck
      CHECK (progress_percent >= 0 AND progress_percent <= 100);
  END IF;
END $$;

INSERT INTO schema_migrations (version)
VALUES ('020_lms_foundation_roles_profiles')
ON CONFLICT (version) DO NOTHING;