ALTER TABLE auth_challenges
  ADD COLUMN IF NOT EXISTS contact text,
  ADD COLUMN IF NOT EXISTS channel text NOT NULL DEFAULT 'SMS',
  ADD COLUMN IF NOT EXISTS registration_first_name text,
  ADD COLUMN IF NOT EXISTS registration_last_name text,
  ADD COLUMN IF NOT EXISTS registration_password_hash text;

UPDATE auth_challenges
SET contact = mobile
WHERE contact IS NULL;

ALTER TABLE auth_challenges
  ALTER COLUMN mobile DROP NOT NULL,
  ALTER COLUMN contact SET NOT NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'auth_challenges_purpose_check'
  ) THEN
    ALTER TABLE auth_challenges DROP CONSTRAINT auth_challenges_purpose_check;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'auth_challenges_direct_purpose_check'
  ) THEN
    ALTER TABLE auth_challenges
      ADD CONSTRAINT auth_challenges_direct_purpose_check
      CHECK (purpose IN ('LOGIN', 'VERIFY', 'REGISTER'));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'auth_challenges_channel_check'
  ) THEN
    ALTER TABLE auth_challenges
      ADD CONSTRAINT auth_challenges_channel_check
      CHECK (channel IN ('EMAIL', 'SMS'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS auth_challenges_registration_contact_idx
  ON auth_challenges (tenant_id, contact, purpose, created_at DESC)
  WHERE purpose = 'REGISTER' AND consumed_at IS NULL;

INSERT INTO permissions (module, resource, action, code, description)
VALUES
  ('auth', 'direct_student_registration', 'CREATE', 'auth.direct_student_registration.create', 'Register a direct student account')
ON CONFLICT (code) DO NOTHING;

INSERT INTO schema_migrations (version)
VALUES ('022_direct_student_registration_otp')
ON CONFLICT (version) DO NOTHING;