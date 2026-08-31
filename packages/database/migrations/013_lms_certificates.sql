CREATE TABLE IF NOT EXISTS lms_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE RESTRICT,
  campus_id uuid,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
  enrollment_id uuid NOT NULL REFERENCES lms_enrollments(id) ON DELETE RESTRICT,
  learner_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  certificate_number text NOT NULL,
  verification_id text NOT NULL,
  issue_date timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'ISSUED' CHECK (status IN ('ISSUED')),
  document_format text NOT NULL DEFAULT 'svg' CHECK (document_format IN ('svg')),
  renderer_version text NOT NULL DEFAULT 'citis-certificate-v1',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, enrollment_id),
  UNIQUE (certificate_number),
  UNIQUE (verification_id)
);

CREATE INDEX IF NOT EXISTS lms_certificates_learner_idx
  ON lms_certificates (tenant_id, learner_id, issue_date DESC);

CREATE INDEX IF NOT EXISTS lms_certificates_course_scope_idx
  ON lms_certificates (tenant_id, institution_id, campus_id, course_id, issue_date DESC);

CREATE UNIQUE INDEX IF NOT EXISTS lms_enrollments_tenant_institution_course_id_key
  ON lms_enrollments (tenant_id, institution_id, course_id, id);

CREATE UNIQUE INDEX IF NOT EXISTS lms_certificates_scope_id_key
  ON lms_certificates (tenant_id, institution_id, campus_id, course_id, id);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lms_certificates_scope_campus_fk') THEN
    ALTER TABLE lms_certificates
      ADD CONSTRAINT lms_certificates_scope_campus_fk
      FOREIGN KEY (tenant_id, institution_id, campus_id)
      REFERENCES campuses (tenant_id, institution_id, id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lms_certificates_enrollment_scope_fk') THEN
    ALTER TABLE lms_certificates
      ADD CONSTRAINT lms_certificates_enrollment_scope_fk
      FOREIGN KEY (tenant_id, institution_id, course_id, enrollment_id)
      REFERENCES lms_enrollments (tenant_id, institution_id, course_id, id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lms_certificates_learner_scope_fk') THEN
    ALTER TABLE lms_certificates
      ADD CONSTRAINT lms_certificates_learner_scope_fk
      FOREIGN KEY (tenant_id, learner_id)
      REFERENCES users (tenant_id, id);
  END IF;
END $$;

WITH permission_seed(module, resource, action, description) AS (
  VALUES
    ('lms', 'certificate', 'VIEW', 'View issued LMS certificates'),
    ('lms', 'certificate', 'EXPORT', 'Download issued LMS certificates')
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
  AND r.code IN (
    'CITIS_SUPER_ADMIN', 'INSTITUTION_ADMINISTRATOR', 'PRINCIPAL_DIRECTOR',
    'ACADEMIC_ADMINISTRATOR', 'TEACHER', 'STUDENT'
  )
  AND p.code IN ('lms.certificate.view', 'lms.certificate.export')
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO schema_migrations (version)
VALUES ('013_lms_certificates')
ON CONFLICT (version) DO NOTHING;