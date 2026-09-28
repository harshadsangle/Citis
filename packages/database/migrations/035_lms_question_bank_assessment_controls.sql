ALTER TABLE lms_assessments
  ADD COLUMN IF NOT EXISTS randomize_questions boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS randomize_options boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS questions_to_select integer,
  ADD COLUMN IF NOT EXISTS results_published boolean NOT NULL DEFAULT true;

ALTER TABLE lms_assessments
  ALTER COLUMN results_published SET DEFAULT false;

ALTER TABLE lms_assessments
  ADD CONSTRAINT lms_assessments_questions_to_select_positive
    CHECK (questions_to_select IS NULL OR questions_to_select > 0);

ALTER TABLE lms_assessment_questions
  DROP CONSTRAINT IF EXISTS lms_assessment_questions_question_type_check;

ALTER TABLE lms_assessment_questions
  ADD CONSTRAINT lms_assessment_questions_question_type_check
    CHECK (question_type IN (
      'SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_TEXT',
      'NUMERIC', 'FILL_IN_BLANK', 'MATCHING', 'LONG_ANSWER'
    )),
  ADD COLUMN IF NOT EXISTS negative_marks numeric(10, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS subject text,
  ADD COLUMN IF NOT EXISTS topic text,
  ADD COLUMN IF NOT EXISTS difficulty text,
  ADD COLUMN IF NOT EXISTS matching_pairs jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS bank_question_id uuid;

ALTER TABLE lms_assessment_questions
  ADD CONSTRAINT lms_assessment_questions_negative_marks_check
    CHECK (negative_marks >= 0 AND negative_marks <= marks),
  ADD CONSTRAINT lms_assessment_questions_difficulty_check
    CHECK (difficulty IS NULL OR difficulty IN ('EASY', 'MEDIUM', 'HARD'));

ALTER TABLE lms_assessment_answers
  DROP CONSTRAINT IF EXISTS lms_assessment_answers_awarded_marks_check;

ALTER TABLE lms_assessment_answers
  ADD CONSTRAINT lms_assessment_answers_awarded_marks_check
    CHECK (awarded_marks >= -100000 AND awarded_marks <= 100000);

CREATE TABLE IF NOT EXISTS lms_question_bank_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE RESTRICT,
  campus_id uuid,
  subject text NOT NULL,
  topic text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
  question_type text NOT NULL CHECK (question_type IN (
    'SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_TEXT',
    'NUMERIC', 'FILL_IN_BLANK', 'MATCHING', 'LONG_ANSWER'
  )),
  prompt text NOT NULL,
  marks numeric(10, 2) NOT NULL CHECK (marks > 0),
  negative_marks numeric(10, 2) NOT NULL DEFAULT 0 CHECK (negative_marks >= 0 AND negative_marks <= marks),
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  matching_pairs jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ARCHIVED')),
  created_by uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, id)
);

CREATE INDEX IF NOT EXISTS lms_question_bank_taxonomy_idx
  ON lms_question_bank_questions (tenant_id, institution_id, campus_id, subject, topic, difficulty, question_type, status);

CREATE INDEX IF NOT EXISTS lms_assessment_questions_bank_question_idx
  ON lms_assessment_questions (tenant_id, bank_question_id)
  WHERE bank_question_id IS NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'lms_assessment_questions_bank_question_fk'
      AND conrelid = 'lms_assessment_questions'::regclass
  ) THEN
    ALTER TABLE lms_assessment_questions
      ADD CONSTRAINT lms_assessment_questions_bank_question_fk
      FOREIGN KEY (tenant_id, bank_question_id)
      REFERENCES lms_question_bank_questions (tenant_id, id)
      ON DELETE RESTRICT;
  END IF;
END $$;

INSERT INTO schema_migrations(version)
VALUES ('035_lms_question_bank_assessment_controls')
ON CONFLICT (version) DO NOTHING;