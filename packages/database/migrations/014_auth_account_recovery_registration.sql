CREATE TABLE IF NOT EXISTS auth_password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  requested_ip inet,
  requested_user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS auth_password_reset_tokens_user_idx
  ON auth_password_reset_tokens (user_id, expires_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS auth_password_reset_tokens_active_user_key
  ON auth_password_reset_tokens (user_id)
  WHERE consumed_at IS NULL;

CREATE TABLE IF NOT EXISTS auth_email_verification_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS auth_email_verification_tokens_user_idx
  ON auth_email_verification_tokens (user_id, expires_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS auth_email_verification_tokens_active_user_key
  ON auth_email_verification_tokens (user_id)
  WHERE consumed_at IS NULL;

INSERT INTO schema_migrations (version)
VALUES ('014_auth_account_recovery_registration')
ON CONFLICT (version) DO NOTHING;