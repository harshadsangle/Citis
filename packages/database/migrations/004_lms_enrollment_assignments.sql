CREATE TABLE IF NOT EXISTS lms_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE RESTRICT,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
  learner_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'REMOVED')),
  enrolled_by uuid REFERENCES users(id) ON DELETE SET NULL,
  removed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  removed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((status = 'ACTIVE' AND removed_at IS NULL) OR (status = 'REMOVED' AND removed_at IS NOT NULL))
);

CREATE TABLE IF NOT EXISTS lms_instructor_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE RESTRICT,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
  instructor_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'REMOVED')),
  assigned_by uuid REFERENCES users(id) ON DELETE SET NULL,
  removed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  removed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((status = 'ACTIVE' AND removed_at IS NULL) OR (status = 'REMOVED' AND removed_at IS NOT NULL))
);

CREATE UNIQUE INDEX IF NOT EXISTS lms_enrollments_active_unique_idx
  ON lms_enrollments (tenant_id, institution_id, course_id, learner_id)
  WHERE status = 'ACTIVE';

CREATE UNIQUE INDEX IF NOT EXISTS lms_instructor_assignments_active_unique_idx
  ON lms_instructor_assignments (tenant_id, institution_id, course_id, instructor_id)
  WHERE status = 'ACTIVE';

CREATE INDEX IF NOT EXISTS lms_enrollments_course_status_idx
  ON lms_enrollments (tenant_id, institution_id, course_id, status, enrolled_at DESC);

CREATE INDEX IF NOT EXISTS lms_instructor_assignments_course_status_idx
  ON lms_instructor_assignments (tenant_id, institution_id, course_id, status, assigned_at DESC);

WITH permission_seed(module, resource, action, description) AS (
  VALUES
    ('lms', 'enrollment', 'VIEW', 'View LMS course enrollments'),
    ('lms', 'enrollment', 'CREATE', 'Enroll learners in LMS courses'),
    ('lms', 'enrollment', 'ARCHIVE', 'Remove LMS course enrollments'),
    ('lms', 'instructor_assignment', 'VIEW', 'View LMS instructor assignments'),
    ('lms', 'instructor_assignment', 'CREATE', 'Assign instructors to LMS courses'),
    ('lms', 'instructor_assignment', 'ARCHIVE', 'Remove LMS instructor assignments')
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
  AND p.code IN (
    'lms.enrollment.view', 'lms.enrollment.create', 'lms.enrollment.archive',
    'lms.instructor_assignment.view', 'lms.instructor_assignment.create', 'lms.instructor_assignment.archive'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO schema_migrations (version)
VALUES ('004_lms_enrollment_assignments')
ON CONFLICT (version) DO NOTHING;