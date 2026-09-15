ALTER TABLE courses
  DROP CONSTRAINT IF EXISTS courses_status_check;

ALTER TABLE courses
  ADD CONSTRAINT courses_status_check
  CHECK (status IN ('DRAFT', 'INSTRUCTOR_PENDING', 'REJECTED', 'PUBLISHED', 'ARCHIVED'));

ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS rejection_reason text,
  ADD COLUMN IF NOT EXISTS rejected_by uuid REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS rejected_at timestamptz,
  ADD COLUMN IF NOT EXISTS published_by uuid REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS published_at timestamptz;

ALTER TABLE courses
  DROP CONSTRAINT IF EXISTS courses_rejection_state_check;

ALTER TABLE courses
  ADD CONSTRAINT courses_rejection_state_check CHECK (
    (status = 'REJECTED' AND rejection_reason IS NOT NULL AND length(trim(rejection_reason)) > 0 AND rejected_at IS NOT NULL)
    OR
    (status <> 'REJECTED')
  );

INSERT INTO permissions (module, resource, action, code, description)
VALUES ('lms', 'course', 'REJECT', 'lms.course.reject', 'Reject an LMS course during instructor review')
ON CONFLICT (code) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.tenant_id = '00000000-0000-0000-0000-000000000001'
  AND r.code IN ('TEACHER', 'INSTRUCTOR')
  AND p.code IN ('lms.course.update', 'lms.course.publish', 'lms.course.reject')
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO schema_migrations (version)
VALUES ('030_lms_course_approval_workflow')
ON CONFLICT (version) DO NOTHING;