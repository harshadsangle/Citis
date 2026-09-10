-- Validate the existing hierarchy before adding the composite constraints.
-- The migration runner executes this file transactionally, so a violation
-- aborts the migration without changing existing course data.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM courses c
    WHERE NOT EXISTS (
      SELECT 1
      FROM programmes p
      WHERE p.id = c.programme_id
        AND p.tenant_id = c.tenant_id
        AND p.institution_id = c.institution_id
    )
  ) THEN
    RAISE EXCEPTION 'Existing course hierarchy violations prevent tenant-parent integrity migration';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM course_modules cm
    WHERE NOT EXISTS (
      SELECT 1
      FROM courses c
      WHERE c.id = cm.course_id
        AND c.tenant_id = cm.tenant_id
    )
  ) THEN
    RAISE EXCEPTION 'Existing course module hierarchy violations prevent tenant-parent integrity migration';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM lessons l
    WHERE NOT EXISTS (
      SELECT 1
      FROM course_modules cm
      WHERE cm.id = l.module_id
        AND cm.tenant_id = l.tenant_id
    )
  ) THEN
    RAISE EXCEPTION 'Existing lesson hierarchy violations prevent tenant-parent integrity migration';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM learning_resources lr
    WHERE NOT EXISTS (
      SELECT 1
      FROM lessons l
      WHERE l.id = lr.lesson_id
        AND l.tenant_id = lr.tenant_id
    )
  ) THEN
    RAISE EXCEPTION 'Existing learning resource hierarchy violations prevent tenant-parent integrity migration';
  END IF;
END $$;

-- Composite foreign keys require matching unique keys on the referenced
-- tenant-scoped parent identities.
CREATE UNIQUE INDEX IF NOT EXISTS programmes_tenant_institution_id_key
  ON programmes (tenant_id, institution_id, id);

CREATE UNIQUE INDEX IF NOT EXISTS courses_tenant_id_key
  ON courses (tenant_id, id);

CREATE UNIQUE INDEX IF NOT EXISTS course_modules_tenant_id_key
  ON course_modules (tenant_id, id);

CREATE UNIQUE INDEX IF NOT EXISTS lessons_tenant_id_key
  ON lessons (tenant_id, id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'courses_tenant_institution_programme_fk'
  ) THEN
    ALTER TABLE courses
      ADD CONSTRAINT courses_tenant_institution_programme_fk
      FOREIGN KEY (tenant_id, institution_id, programme_id)
      REFERENCES programmes (tenant_id, institution_id, id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'course_modules_tenant_course_fk'
  ) THEN
    ALTER TABLE course_modules
      ADD CONSTRAINT course_modules_tenant_course_fk
      FOREIGN KEY (tenant_id, course_id)
      REFERENCES courses (tenant_id, id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'lessons_tenant_module_fk'
  ) THEN
    ALTER TABLE lessons
      ADD CONSTRAINT lessons_tenant_module_fk
      FOREIGN KEY (tenant_id, module_id)
      REFERENCES course_modules (tenant_id, id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'learning_resources_tenant_lesson_fk'
  ) THEN
    ALTER TABLE learning_resources
      ADD CONSTRAINT learning_resources_tenant_lesson_fk
      FOREIGN KEY (tenant_id, lesson_id)
      REFERENCES lessons (tenant_id, id);
  END IF;
END $$;

INSERT INTO schema_migrations (version)
VALUES ('026_lms_tenant_parent_integrity')
ON CONFLICT (version) DO NOTHING;