ALTER TABLE users
  ADD COLUMN IF NOT EXISTS mfa_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS mfa_channel text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'users_mfa_channel_check'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_mfa_channel_check
      CHECK (mfa_channel IS NULL OR mfa_channel IN ('EMAIL', 'SMS'));
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS auth_mfa_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_token_hash text NOT NULL UNIQUE,
  channel text NOT NULL CHECK (channel IN ('EMAIL', 'SMS')),
  purpose text NOT NULL CHECK (purpose IN ('LOGIN', 'ENROLL', 'DISABLE', 'RESET')),
  code_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  requested_ip inet,
  requested_user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS auth_mfa_challenges_user_purpose_idx
  ON auth_mfa_challenges (user_id, purpose, created_at DESC);

CREATE INDEX IF NOT EXISTS auth_mfa_challenges_expiry_idx
  ON auth_mfa_challenges (expires_at)
  WHERE consumed_at IS NULL;

INSERT INTO schema_migrations (version)
VALUES ('017_auth_email_sms_mfa')
ON CONFLICT (version) DO NOTHING;