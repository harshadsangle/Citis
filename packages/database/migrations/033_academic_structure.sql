CREATE TABLE IF NOT EXISTS academic_faculties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE RESTRICT, campus_id uuid REFERENCES campuses(id) ON DELETE RESTRICT,
  name text NOT NULL, code text NOT NULL, description text, status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','ARCHIVED')),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL, updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id,institution_id,code), UNIQUE (tenant_id,institution_id,id)
);
CREATE UNIQUE INDEX IF NOT EXISTS institutions_tenant_id_key ON institutions(tenant_id,id);
CREATE UNIQUE INDEX IF NOT EXISTS campuses_tenant_institution_id_key ON campuses(tenant_id,institution_id,id);
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='academic_faculties_tenant_institution_fk' AND connamespace=current_schema()::regnamespace) THEN
  ALTER TABLE academic_faculties ADD CONSTRAINT academic_faculties_tenant_institution_fk FOREIGN KEY (tenant_id,institution_id) REFERENCES institutions(tenant_id,id);
 END IF;
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='academic_faculties_tenant_campus_fk' AND connamespace=current_schema()::regnamespace) THEN
  ALTER TABLE academic_faculties ADD CONSTRAINT academic_faculties_tenant_campus_fk FOREIGN KEY (tenant_id,institution_id,campus_id) REFERENCES campuses(tenant_id,institution_id,id);
 END IF;
END $$;
CREATE TABLE IF NOT EXISTS academic_departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE RESTRICT, campus_id uuid REFERENCES campuses(id) ON DELETE RESTRICT,
  faculty_id uuid NOT NULL, name text NOT NULL, code text NOT NULL, description text,
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','ARCHIVED')),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL, updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id,faculty_id,code), UNIQUE (tenant_id,institution_id,id)
);
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='academic_departments_tenant_faculty_fk' AND connamespace=current_schema()::regnamespace) THEN
  ALTER TABLE academic_departments ADD CONSTRAINT academic_departments_tenant_faculty_fk
    FOREIGN KEY (tenant_id,institution_id,faculty_id) REFERENCES academic_faculties(tenant_id,institution_id,id);
 END IF;
END $$;
CREATE TABLE IF NOT EXISTS academic_semesters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE RESTRICT, campus_id uuid REFERENCES campuses(id) ON DELETE RESTRICT,
  code text NOT NULL, name text NOT NULL, start_date date NOT NULL, end_date date NOT NULL,
  status text NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','ACTIVE','CLOSED','ARCHIVED')), CHECK (end_date > start_date),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL, updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id,institution_id,code), UNIQUE (tenant_id,institution_id,id)
);
ALTER TABLE programmes ADD COLUMN IF NOT EXISTS department_id uuid;
CREATE INDEX IF NOT EXISTS academic_faculties_scope_idx ON academic_faculties(tenant_id,institution_id,status);
CREATE INDEX IF NOT EXISTS academic_departments_scope_idx ON academic_departments(tenant_id,institution_id,status);
CREATE INDEX IF NOT EXISTS academic_semesters_scope_idx ON academic_semesters(tenant_id,institution_id,status);
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='academic_departments_tenant_institution_fk' AND connamespace=current_schema()::regnamespace) THEN ALTER TABLE academic_departments ADD CONSTRAINT academic_departments_tenant_institution_fk FOREIGN KEY (tenant_id,institution_id) REFERENCES institutions(tenant_id,id); END IF;
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='academic_departments_tenant_campus_fk' AND connamespace=current_schema()::regnamespace) THEN ALTER TABLE academic_departments ADD CONSTRAINT academic_departments_tenant_campus_fk FOREIGN KEY (tenant_id,institution_id,campus_id) REFERENCES campuses(tenant_id,institution_id,id); END IF;
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='academic_semesters_tenant_institution_fk' AND connamespace=current_schema()::regnamespace) THEN ALTER TABLE academic_semesters ADD CONSTRAINT academic_semesters_tenant_institution_fk FOREIGN KEY (tenant_id,institution_id) REFERENCES institutions(tenant_id,id); END IF;
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='academic_semesters_tenant_campus_fk' AND connamespace=current_schema()::regnamespace) THEN ALTER TABLE academic_semesters ADD CONSTRAINT academic_semesters_tenant_campus_fk FOREIGN KEY (tenant_id,institution_id,campus_id) REFERENCES campuses(tenant_id,institution_id,id); END IF;
END $$;
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='programmes_tenant_department_fk' AND connamespace=current_schema()::regnamespace) THEN
  ALTER TABLE programmes ADD CONSTRAINT programmes_tenant_department_fk FOREIGN KEY (tenant_id,institution_id,department_id) REFERENCES academic_departments(tenant_id,institution_id,id);
 END IF;
END $$;
CREATE TABLE IF NOT EXISTS academic_course_offerings (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
 institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE RESTRICT, course_id uuid NOT NULL, semester_id uuid NOT NULL,
 campus_id uuid REFERENCES campuses(id) ON DELETE RESTRICT, section text NOT NULL DEFAULT '', status text NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE','CLOSED','ARCHIVED')),
 created_by uuid REFERENCES users(id) ON DELETE SET NULL, updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(tenant_id,course_id,semester_id,section), UNIQUE(tenant_id,id)
);
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='academic_offerings_course_fk' AND connamespace=current_schema()::regnamespace) THEN
  ALTER TABLE academic_course_offerings ADD CONSTRAINT academic_offerings_course_fk FOREIGN KEY (tenant_id,course_id) REFERENCES courses(tenant_id,id);
 END IF;
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='academic_offerings_semester_fk' AND connamespace=current_schema()::regnamespace) THEN
  ALTER TABLE academic_course_offerings ADD CONSTRAINT academic_offerings_semester_fk FOREIGN KEY (tenant_id,institution_id,semester_id) REFERENCES academic_semesters(tenant_id,institution_id,id);
 END IF;
END $$;
CREATE INDEX IF NOT EXISTS academic_offerings_scope_idx ON academic_course_offerings(tenant_id,institution_id,semester_id);
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='academic_offerings_tenant_institution_fk' AND connamespace=current_schema()::regnamespace) THEN ALTER TABLE academic_course_offerings ADD CONSTRAINT academic_offerings_tenant_institution_fk FOREIGN KEY (tenant_id,institution_id) REFERENCES institutions(tenant_id,id); END IF;
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='academic_offerings_tenant_campus_fk' AND connamespace=current_schema()::regnamespace) THEN ALTER TABLE academic_course_offerings ADD CONSTRAINT academic_offerings_tenant_campus_fk FOREIGN KEY (tenant_id,institution_id,campus_id) REFERENCES campuses(tenant_id,institution_id,id); END IF;
END $$;
WITH permission_seed(resource,action,description) AS (VALUES
 ('faculty','VIEW','View academic faculties'),('faculty','CREATE','Create academic faculties'),('faculty','UPDATE','Update academic faculties'),('faculty','ARCHIVE','Archive academic faculties'),
 ('department','VIEW','View academic departments'),('department','CREATE','Create academic departments'),('department','UPDATE','Update academic departments'),('department','ARCHIVE','Archive academic departments'),
 ('semester','VIEW','View academic semesters'),('semester','CREATE','Create academic semesters'),('semester','UPDATE','Update academic semesters'),('semester','ARCHIVE','Archive academic semesters'),
 ('course_offering','VIEW','View course offerings'),('course_offering','CREATE','Create course offerings'),('course_offering','UPDATE','Update course offerings'),('course_offering','ARCHIVE','Archive course offerings'))
INSERT INTO permissions(module,resource,action,code,description) SELECT 'lms',resource,action,'lms.'||resource||'.'||lower(action),description FROM permission_seed ON CONFLICT(code) DO NOTHING;
INSERT INTO role_permissions(role_id,permission_id) SELECT r.id,p.id FROM roles r CROSS JOIN permissions p WHERE r.code IN ('CITIS_SUPER_ADMIN','INSTITUTION_ADMINISTRATOR','PRINCIPAL_DIRECTOR','ACADEMIC_ADMINISTRATOR') AND p.module='lms' AND p.resource IN ('faculty','department','semester','course_offering') ON CONFLICT DO NOTHING;
INSERT INTO schema_migrations(version) VALUES ('033_academic_structure') ON CONFLICT(version) DO NOTHING;