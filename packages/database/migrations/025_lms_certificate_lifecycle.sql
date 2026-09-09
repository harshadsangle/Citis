ALTER TABLE lms_certificates
  ALTER COLUMN institution_id DROP NOT NULL,
  ALTER COLUMN issue_date DROP NOT NULL;

ALTER TABLE lms_certificates
  DROP CONSTRAINT IF EXISTS lms_certificates_status_check,
  ADD COLUMN IF NOT EXISTS completion_date timestamptz,
  ADD COLUMN IF NOT EXISTS eligible_at timestamptz,
  ADD COLUMN IF NOT EXISTS approved_by uuid,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS review_notes text,
  ADD COLUMN IF NOT EXISTS rejected_by uuid,
  ADD COLUMN IF NOT EXISTS rejected_at timestamptz,
  ADD COLUMN IF NOT EXISTS rejection_notes text,
  ADD COLUMN IF NOT EXISTS revoked_by uuid,
  ADD COLUMN IF NOT EXISTS revoked_at timestamptz,
  ADD COLUMN IF NOT EXISTS revocation_reason text,
  ADD COLUMN IF NOT EXISTS issued_at timestamptz;

UPDATE lms_certificates
SET issued_at = COALESCE(issued_at, issue_date),
    completion_date = COALESCE(completion_date, issue_date)
WHERE status = 'ISSUED';

ALTER TABLE lms_certificates
  ADD CONSTRAINT lms_certificates_status_check
  CHECK (status IN ('NOT_ELIGIBLE', 'ELIGIBLE_FOR_REVIEW', 'APPROVED', 'REJECTED', 'ISSUED', 'REVOKED'));

ALTER TABLE lms_certificates
  DROP CONSTRAINT IF EXISTS lms_certificates_enrollment_scope_fk;

ALTER TABLE lms_certificates
  DROP CONSTRAINT IF EXISTS lms_certificates_enrollment_tenant_course_fk;

CREATE UNIQUE INDEX IF NOT EXISTS lms_enrollments_tenant_course_id_key
  ON lms_enrollments (tenant_id, course_id, id);

ALTER TABLE lms_certificates
  ADD CONSTRAINT lms_certificates_enrollment_tenant_course_fk
  FOREIGN KEY (tenant_id, course_id, enrollment_id)
  REFERENCES lms_enrollments (tenant_id, course_id, id);

ALTER TABLE lms_certificates
  DROP CONSTRAINT IF EXISTS lms_certificates_approved_by_fk,
  DROP CONSTRAINT IF EXISTS lms_certificates_rejected_by_fk,
  DROP CONSTRAINT IF EXISTS lms_certificates_revoked_by_fk;

ALTER TABLE lms_certificates
  ADD CONSTRAINT lms_certificates_approved_by_fk
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
  ADD CONSTRAINT lms_certificates_rejected_by_fk
    FOREIGN KEY (rejected_by) REFERENCES users(id) ON DELETE SET NULL,
  ADD CONSTRAINT lms_certificates_revoked_by_fk
    FOREIGN KEY (revoked_by) REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS lms_certificates_review_status_idx
  ON lms_certificates (tenant_id, status, eligible_at DESC);

CREATE INDEX IF NOT EXISTS lms_certificates_review_scope_idx
  ON lms_certificates (tenant_id, institution_id, course_id, status, updated_at DESC);

WITH permission_seed(module, resource, action, description) AS (
  VALUES
    ('lms', 'certificate', 'REVIEW', 'Review eligible LMS certificates'),
    ('lms', 'certificate', 'APPROVE', 'Approve LMS certificates'),
    ('lms', 'certificate', 'REJECT', 'Reject LMS certificates'),
    ('lms', 'certificate', 'ISSUE', 'Issue approved LMS certificates'),
    ('lms', 'certificate', 'REVOKE', 'Revoke issued LMS certificates'),
    ('lms', 'report', 'VIEW', 'View global LMS reports'),
    ('lms', 'report', 'EXPORT', 'Export global LMS reports')
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
  AND r.code = 'CITIS_ADMIN'
  AND p.code IN (
    'lms.certificate.review',
    'lms.certificate.approve',
    'lms.certificate.reject',
    'lms.certificate.issue',
    'lms.certificate.revoke',
    'lms.report.view',
    'lms.report.export'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO schema_migrations (version)
VALUES ('025_lms_certificate_lifecycle')
ON CONFLICT (version) DO NOTHING;