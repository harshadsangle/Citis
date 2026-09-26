CREATE TABLE IF NOT EXISTS lms_course_institution_allocations (
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  course_id uuid NOT NULL,
  institution_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'REMOVED')),
  allocated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  allocated_at timestamptz NOT NULL DEFAULT now(),
  removed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, course_id, institution_id),
  CONSTRAINT lms_course_allocations_course_fk
    FOREIGN KEY (tenant_id, course_id) REFERENCES courses(tenant_id, id) ON DELETE CASCADE,
  CONSTRAINT lms_course_allocations_institution_fk
    FOREIGN KEY (tenant_id, institution_id) REFERENCES institutions(tenant_id, id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS lms_course_allocations_active_idx
  ON lms_course_institution_allocations (tenant_id, institution_id, course_id)
  WHERE status = 'ACTIVE';

INSERT INTO lms_course_institution_allocations (tenant_id, course_id, institution_id)
SELECT tenant_id, id, institution_id FROM courses
ON CONFLICT (tenant_id, course_id, institution_id) DO NOTHING;

INSERT INTO schema_migrations (version)
VALUES ('031_lms_course_institution_allocations')
ON CONFLICT (version) DO NOTHING;