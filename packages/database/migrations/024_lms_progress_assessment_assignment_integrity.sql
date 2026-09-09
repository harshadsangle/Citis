ALTER TABLE lms_enrollments
  ADD COLUMN IF NOT EXISTS last_accessed_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_accessed_module_id uuid,
  ADD COLUMN IF NOT EXISTS last_accessed_lesson_id uuid;

CREATE INDEX IF NOT EXISTS lms_enrollments_last_accessed_idx
  ON lms_enrollments (tenant_id, learner_id, last_accessed_at DESC);

CREATE TABLE IF NOT EXISTS lms_assignment_submission_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  submission_id uuid NOT NULL REFERENCES lms_assignment_submissions(id) ON DELETE CASCADE,
  assignment_id uuid NOT NULL REFERENCES lms_assessments(id) ON DELETE RESTRICT,
  learner_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  actor_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  event_type text NOT NULL CHECK (event_type IN ('SUBMITTED', 'RESUBMITTED', 'GRADED')),
  status text NOT NULL CHECK (status IN ('SUBMITTED', 'GRADED')),
  submission_text text NOT NULL,
  attachment_url text,
  grade numeric(10, 2),
  feedback text,
  is_late boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS lms_assignment_submission_history_lookup_idx
  ON lms_assignment_submission_history (tenant_id, submission_id, created_at DESC);

-- Assignment review is a central-admin operation. Instructors retain read-only
-- submission access and students retain create-only submission access.
DELETE FROM role_permissions rp
USING roles r, permissions p
WHERE rp.role_id = r.id
  AND rp.permission_id = p.id
  AND p.code = 'lms.assignment_submission.update'
  AND r.code <> 'CITIS_ADMIN';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code = 'lms.assignment_submission.update'
WHERE r.code = 'CITIS_ADMIN'
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO schema_migrations (version)
VALUES ('024_lms_progress_assessment_assignment_integrity')
ON CONFLICT (version) DO NOTHING;