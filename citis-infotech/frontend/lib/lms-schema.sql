-- CITIS LMS persistence schema.
-- This schema is intentionally isolated from existing CITIS application data.

CREATE TABLE IF NOT EXISTS lms_users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  email VARCHAR(320) NOT NULL UNIQUE,
  role VARCHAR(20) NOT NULL DEFAULT 'student'
    CHECK (role IN ('student', 'instructor', 'admin')),
  password_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lms_courses (
  id BIGSERIAL PRIMARY KEY,
  slug VARCHAR(180) NOT NULL UNIQUE,
  title VARCHAR(240) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category VARCHAR(120) NOT NULL DEFAULT '',
  level VARCHAR(40) NOT NULL DEFAULT 'Foundation',
  duration VARCHAR(80) NOT NULL DEFAULT '',
  instructor_id BIGINT REFERENCES lms_users(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published')),
  outcomes JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lms_enrollments (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES lms_users(id) ON DELETE CASCADE,
  course_id BIGINT NOT NULL REFERENCES lms_courses(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'completed', 'withdrawn')),
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE (user_id, course_id)
);

CREATE TABLE IF NOT EXISTS lms_progress (
  id BIGSERIAL PRIMARY KEY,
  enrollment_id BIGINT NOT NULL UNIQUE REFERENCES lms_enrollments(id) ON DELETE CASCADE,
  completed_lesson_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  percent SMALLINT NOT NULL DEFAULT 0 CHECK (percent BETWEEN 0 AND 100),
  last_lesson_id VARCHAR(180),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lms_quizzes (
  id BIGSERIAL PRIMARY KEY,
  course_id BIGINT NOT NULL REFERENCES lms_courses(id) ON DELETE CASCADE,
  title VARCHAR(240) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  passing_score SMALLINT NOT NULL DEFAULT 70 CHECK (passing_score BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lms_assignments (
  id BIGSERIAL PRIMARY KEY,
  course_id BIGINT NOT NULL REFERENCES lms_courses(id) ON DELETE CASCADE,
  title VARCHAR(240) NOT NULL,
  instructions TEXT NOT NULL DEFAULT '',
  due_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lms_certificates (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES lms_users(id) ON DELETE CASCADE,
  course_id BIGINT NOT NULL REFERENCES lms_courses(id) ON DELETE CASCADE,
  enrollment_id BIGINT NOT NULL REFERENCES lms_enrollments(id) ON DELETE CASCADE,
  certificate_number VARCHAR(120) NOT NULL UNIQUE,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verification_url TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (user_id, course_id)
);

CREATE INDEX IF NOT EXISTS lms_courses_instructor_id_idx
  ON lms_courses(instructor_id);
CREATE INDEX IF NOT EXISTS lms_courses_status_idx
  ON lms_courses(status);
CREATE INDEX IF NOT EXISTS lms_enrollments_user_id_idx
  ON lms_enrollments(user_id);
CREATE INDEX IF NOT EXISTS lms_enrollments_course_id_idx
  ON lms_enrollments(course_id);
CREATE INDEX IF NOT EXISTS lms_quizzes_course_id_idx
  ON lms_quizzes(course_id);
CREATE INDEX IF NOT EXISTS lms_assignments_course_id_idx
  ON lms_assignments(course_id);
CREATE INDEX IF NOT EXISTS lms_certificates_user_id_idx
  ON lms_certificates(user_id);