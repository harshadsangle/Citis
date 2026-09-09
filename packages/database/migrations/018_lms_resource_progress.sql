CREATE TABLE IF NOT EXISTS lms_resource_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE RESTRICT,
  campus_id uuid REFERENCES campuses(id) ON DELETE RESTRICT,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
  module_id uuid NOT NULL REFERENCES course_modules(id) ON DELETE RESTRICT,
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE RESTRICT,
  resource_id uuid NOT NULL REFERENCES learning_resources(id) ON DELETE RESTRICT,
  learner_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  position_seconds numeric(12, 3) NOT NULL DEFAULT 0 CHECK (position_seconds >= 0),
  duration_seconds numeric(12, 3) NOT NULL DEFAULT 0 CHECK (duration_seconds >= 0),
  progress_percent numeric(5, 2) NOT NULL DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  completed boolean NOT NULL DEFAULT false,
  last_accessed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, resource_id, learner_id)
);

CREATE INDEX IF NOT EXISTS lms_resource_progress_learner_course_idx
  ON lms_resource_progress (tenant_id, institution_id, learner_id, course_id, updated_at DESC);

INSERT INTO schema_migrations (version)
VALUES ('018_lms_resource_progress')
ON CONFLICT (version) DO NOTHING;