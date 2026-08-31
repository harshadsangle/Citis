ALTER TABLE programmes
  ADD COLUMN IF NOT EXISTS campus_id uuid;

ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS institution_id uuid,
  ADD COLUMN IF NOT EXISTS campus_id uuid;

UPDATE courses c
SET institution_id = p.institution_id,
    campus_id = COALESCE(c.campus_id, p.campus_id)
FROM programmes p
WHERE p.id = c.programme_id
  AND p.tenant_id = c.tenant_id
  AND c.institution_id IS NULL;

ALTER TABLE courses
  ALTER COLUMN institution_id SET NOT NULL;

ALTER TABLE managed_files
  ADD COLUMN IF NOT EXISTS campus_id uuid;

ALTER TABLE lms_enrollments
  ADD COLUMN IF NOT EXISTS campus_id uuid;

ALTER TABLE lms_instructor_assignments
  ADD COLUMN IF NOT EXISTS campus_id uuid;

ALTER TABLE lms_assessments
  ADD COLUMN IF NOT EXISTS campus_id uuid;

ALTER TABLE lms_lesson_progress
  ADD COLUMN IF NOT EXISTS campus_id uuid;

ALTER TABLE lms_assessment_completions
  ADD COLUMN IF NOT EXISTS campus_id uuid;

ALTER TABLE lms_assignment_submissions
  ADD COLUMN IF NOT EXISTS campus_id uuid;

UPDATE lms_enrollments e
SET campus_id = c.campus_id
FROM courses c
WHERE c.id = e.course_id
  AND c.tenant_id = e.tenant_id;

UPDATE lms_instructor_assignments a
SET campus_id = c.campus_id
FROM courses c
WHERE c.id = a.course_id
  AND c.tenant_id = a.tenant_id;

UPDATE lms_assessments a
SET campus_id = c.campus_id
FROM courses c
WHERE c.id = a.course_id
  AND c.tenant_id = a.tenant_id;

UPDATE lms_lesson_progress p
SET campus_id = c.campus_id
FROM courses c
WHERE c.id = p.course_id
  AND c.tenant_id = p.tenant_id;

UPDATE lms_assessment_completions p
SET campus_id = c.campus_id
FROM courses c
WHERE c.id = p.course_id
  AND c.tenant_id = p.tenant_id;

UPDATE lms_assignment_submissions s
SET campus_id = c.campus_id
FROM courses c
WHERE c.id = s.course_id
  AND c.tenant_id = s.tenant_id;

UPDATE managed_files m
SET campus_id = c.campus_id
FROM learning_resources lr
JOIN lessons l ON l.id = lr.lesson_id AND l.tenant_id = lr.tenant_id
JOIN course_modules cm ON cm.id = l.module_id AND cm.tenant_id = lr.tenant_id
JOIN courses c ON c.id = cm.course_id AND c.tenant_id = lr.tenant_id
WHERE m.resource_id = lr.id
  AND m.tenant_id = lr.tenant_id;

CREATE UNIQUE INDEX IF NOT EXISTS institutions_tenant_id_key
  ON institutions (tenant_id, id);

CREATE UNIQUE INDEX IF NOT EXISTS users_tenant_id_key
  ON users (tenant_id, id);

CREATE UNIQUE INDEX IF NOT EXISTS roles_tenant_id_key
  ON roles (tenant_id, id);

CREATE UNIQUE INDEX IF NOT EXISTS campuses_tenant_institution_id_key
  ON campuses (tenant_id, institution_id, id);

CREATE UNIQUE INDEX IF NOT EXISTS courses_tenant_institution_id_key
  ON courses (tenant_id, institution_id, id);

CREATE UNIQUE INDEX IF NOT EXISTS courses_tenant_institution_id_campus_key
  ON courses (tenant_id, institution_id, id, campus_id);

CREATE UNIQUE INDEX IF NOT EXISTS course_modules_tenant_course_id_key
  ON course_modules (tenant_id, course_id, id);

CREATE UNIQUE INDEX IF NOT EXISTS lms_assessments_tenant_institution_course_id_key
  ON lms_assessments (tenant_id, institution_id, course_id, id);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'programmes_tenant_institution_fk') THEN
    ALTER TABLE programmes
      ADD CONSTRAINT programmes_tenant_institution_fk
      FOREIGN KEY (tenant_id, institution_id)
      REFERENCES institutions (tenant_id, id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'programmes_scope_campus_fk') THEN
    ALTER TABLE programmes
      ADD CONSTRAINT programmes_scope_campus_fk
      FOREIGN KEY (tenant_id, institution_id, campus_id)
      REFERENCES campuses (tenant_id, institution_id, id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'courses_tenant_institution_fk') THEN
    ALTER TABLE courses
      ADD CONSTRAINT courses_tenant_institution_fk
      FOREIGN KEY (tenant_id, institution_id)
      REFERENCES institutions (tenant_id, id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'courses_scope_campus_fk') THEN
    ALTER TABLE courses
      ADD CONSTRAINT courses_scope_campus_fk
      FOREIGN KEY (tenant_id, institution_id, campus_id)
      REFERENCES campuses (tenant_id, institution_id, id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_roles_tenant_user_fk') THEN
    ALTER TABLE user_roles
      ADD CONSTRAINT user_roles_tenant_user_fk
      FOREIGN KEY (tenant_id, user_id)
      REFERENCES users (tenant_id, id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_roles_tenant_role_fk') THEN
    ALTER TABLE user_roles
      ADD CONSTRAINT user_roles_tenant_role_fk
      FOREIGN KEY (tenant_id, role_id)
      REFERENCES roles (tenant_id, id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_roles_scope_institution_fk') THEN
    ALTER TABLE user_roles
      ADD CONSTRAINT user_roles_scope_institution_fk
      FOREIGN KEY (tenant_id, institution_id)
      REFERENCES institutions (tenant_id, id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_roles_scope_campus_fk') THEN
    ALTER TABLE user_roles
      ADD CONSTRAINT user_roles_scope_campus_fk
      FOREIGN KEY (tenant_id, institution_id, campus_id)
      REFERENCES campuses (tenant_id, institution_id, id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_roles_campus_requires_institution_ck') THEN
    ALTER TABLE user_roles
      ADD CONSTRAINT user_roles_campus_requires_institution_ck
      CHECK (campus_id IS NULL OR institution_id IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'courses_campus_requires_institution_ck') THEN
    ALTER TABLE courses
      ADD CONSTRAINT courses_campus_requires_institution_ck
      CHECK (campus_id IS NULL OR institution_id IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'programmes_campus_requires_institution_ck') THEN
    ALTER TABLE programmes
      ADD CONSTRAINT programmes_campus_requires_institution_ck
      CHECK (campus_id IS NULL OR institution_id IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'managed_files_scope_campus_fk') THEN
    ALTER TABLE managed_files
      ADD CONSTRAINT managed_files_scope_campus_fk
      FOREIGN KEY (tenant_id, institution_id, campus_id)
      REFERENCES campuses (tenant_id, institution_id, id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lms_enrollments_course_scope_fk') THEN
    ALTER TABLE lms_enrollments
      ADD CONSTRAINT lms_enrollments_course_scope_fk
      FOREIGN KEY (tenant_id, institution_id, course_id)
      REFERENCES courses (tenant_id, institution_id, id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lms_enrollments_scope_campus_fk') THEN
    ALTER TABLE lms_enrollments
      ADD CONSTRAINT lms_enrollments_scope_campus_fk
      FOREIGN KEY (tenant_id, institution_id, campus_id)
      REFERENCES campuses (tenant_id, institution_id, id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lms_enrollments_exact_course_campus_fk') THEN
    ALTER TABLE lms_enrollments
      ADD CONSTRAINT lms_enrollments_exact_course_campus_fk
      FOREIGN KEY (tenant_id, institution_id, course_id, campus_id)
      REFERENCES courses (tenant_id, institution_id, id, campus_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lms_instructor_assignments_course_scope_fk') THEN
    ALTER TABLE lms_instructor_assignments
      ADD CONSTRAINT lms_instructor_assignments_course_scope_fk
      FOREIGN KEY (tenant_id, institution_id, course_id)
      REFERENCES courses (tenant_id, institution_id, id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lms_instructor_assignments_scope_campus_fk') THEN
    ALTER TABLE lms_instructor_assignments
      ADD CONSTRAINT lms_instructor_assignments_scope_campus_fk
      FOREIGN KEY (tenant_id, institution_id, campus_id)
      REFERENCES campuses (tenant_id, institution_id, id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lms_instructor_assignments_exact_course_campus_fk') THEN
    ALTER TABLE lms_instructor_assignments
      ADD CONSTRAINT lms_instructor_assignments_exact_course_campus_fk
      FOREIGN KEY (tenant_id, institution_id, course_id, campus_id)
      REFERENCES courses (tenant_id, institution_id, id, campus_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lms_assessments_course_scope_fk') THEN
    ALTER TABLE lms_assessments
      ADD CONSTRAINT lms_assessments_course_scope_fk
      FOREIGN KEY (tenant_id, institution_id, course_id)
      REFERENCES courses (tenant_id, institution_id, id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lms_assessments_module_scope_fk') THEN
    ALTER TABLE lms_assessments
      ADD CONSTRAINT lms_assessments_module_scope_fk
      FOREIGN KEY (tenant_id, course_id, module_id)
      REFERENCES course_modules (tenant_id, course_id, id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lms_assessments_scope_campus_fk') THEN
    ALTER TABLE lms_assessments
      ADD CONSTRAINT lms_assessments_scope_campus_fk
      FOREIGN KEY (tenant_id, institution_id, campus_id)
      REFERENCES campuses (tenant_id, institution_id, id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lms_assessments_exact_course_campus_fk') THEN
    ALTER TABLE lms_assessments
      ADD CONSTRAINT lms_assessments_exact_course_campus_fk
      FOREIGN KEY (tenant_id, institution_id, course_id, campus_id)
      REFERENCES courses (tenant_id, institution_id, id, campus_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lms_lesson_progress_course_scope_fk') THEN
    ALTER TABLE lms_lesson_progress
      ADD CONSTRAINT lms_lesson_progress_course_scope_fk
      FOREIGN KEY (tenant_id, institution_id, course_id)
      REFERENCES courses (tenant_id, institution_id, id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lms_lesson_progress_scope_campus_fk') THEN
    ALTER TABLE lms_lesson_progress
      ADD CONSTRAINT lms_lesson_progress_scope_campus_fk
      FOREIGN KEY (tenant_id, institution_id, campus_id)
      REFERENCES campuses (tenant_id, institution_id, id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lms_lesson_progress_exact_course_campus_fk') THEN
    ALTER TABLE lms_lesson_progress
      ADD CONSTRAINT lms_lesson_progress_exact_course_campus_fk
      FOREIGN KEY (tenant_id, institution_id, course_id, campus_id)
      REFERENCES courses (tenant_id, institution_id, id, campus_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lms_assessment_completions_course_scope_fk') THEN
    ALTER TABLE lms_assessment_completions
      ADD CONSTRAINT lms_assessment_completions_course_scope_fk
      FOREIGN KEY (tenant_id, institution_id, course_id)
      REFERENCES courses (tenant_id, institution_id, id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lms_assessment_completions_scope_campus_fk') THEN
    ALTER TABLE lms_assessment_completions
      ADD CONSTRAINT lms_assessment_completions_scope_campus_fk
      FOREIGN KEY (tenant_id, institution_id, campus_id)
      REFERENCES campuses (tenant_id, institution_id, id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lms_assessment_completions_exact_course_campus_fk') THEN
    ALTER TABLE lms_assessment_completions
      ADD CONSTRAINT lms_assessment_completions_exact_course_campus_fk
      FOREIGN KEY (tenant_id, institution_id, course_id, campus_id)
      REFERENCES courses (tenant_id, institution_id, id, campus_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lms_assignment_submissions_course_scope_fk') THEN
    ALTER TABLE lms_assignment_submissions
      ADD CONSTRAINT lms_assignment_submissions_course_scope_fk
      FOREIGN KEY (tenant_id, institution_id, course_id)
      REFERENCES courses (tenant_id, institution_id, id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lms_assignment_submissions_assignment_scope_fk') THEN
    ALTER TABLE lms_assignment_submissions
      ADD CONSTRAINT lms_assignment_submissions_assignment_scope_fk
      FOREIGN KEY (tenant_id, institution_id, course_id, assignment_id)
      REFERENCES lms_assessments (tenant_id, institution_id, course_id, id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lms_assignment_submissions_scope_campus_fk') THEN
    ALTER TABLE lms_assignment_submissions
      ADD CONSTRAINT lms_assignment_submissions_scope_campus_fk
      FOREIGN KEY (tenant_id, institution_id, campus_id)
      REFERENCES campuses (tenant_id, institution_id, id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lms_assignment_submissions_exact_course_campus_fk') THEN
    ALTER TABLE lms_assignment_submissions
      ADD CONSTRAINT lms_assignment_submissions_exact_course_campus_fk
      FOREIGN KEY (tenant_id, institution_id, course_id, campus_id)
      REFERENCES courses (tenant_id, institution_id, id, campus_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS programmes_scope_idx
  ON programmes (tenant_id, institution_id, campus_id, status);

CREATE INDEX IF NOT EXISTS courses_scope_idx
  ON courses (tenant_id, institution_id, campus_id, status);

CREATE INDEX IF NOT EXISTS user_roles_scope_authorization_idx
  ON user_roles (tenant_id, user_id, institution_id, campus_id, role_id);

INSERT INTO schema_migrations (version)
VALUES ('007_lms_scope_isolation')
ON CONFLICT (version) DO NOTHING;