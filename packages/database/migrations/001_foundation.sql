CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'ARCHIVED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS institutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  name text NOT NULL,
  slug text NOT NULL,
  institution_type text NOT NULL DEFAULT 'SCHOOL',
  logo_url text,
  email text,
  phone text,
  website text,
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'ARCHIVED')),
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, slug)
);

CREATE TABLE IF NOT EXISTS campuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE RESTRICT,
  name text NOT NULL,
  address text,
  city text,
  state text,
  country text NOT NULL DEFAULT 'IN',
  timezone text NOT NULL DEFAULT 'Asia/Kolkata',
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'ARCHIVED')),
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (institution_id, name)
);

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  email text,
  mobile text,
  password_hash text,
  first_name text NOT NULL,
  last_name text NOT NULL DEFAULT '',
  profile_image text,
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PENDING', 'DISABLED', 'ARCHIVED')),
  email_verified_at timestamptz,
  mobile_verified_at timestamptz,
  last_login_at timestamptz,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (email IS NOT NULL OR mobile IS NOT NULL)
);

CREATE UNIQUE INDEX IF NOT EXISTS users_tenant_email_key
  ON users (tenant_id, lower(email))
  WHERE email IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS users_tenant_mobile_key
  ON users (tenant_id, mobile)
  WHERE mobile IS NOT NULL;

CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  name text NOT NULL,
  code text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DISABLED', 'ARCHIVED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, code)
);

CREATE TABLE IF NOT EXISTS permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module text NOT NULL,
  resource text NOT NULL,
  action text NOT NULL CHECK (action IN ('VIEW', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'EXPORT', 'PUBLISH', 'ARCHIVE')),
  code text NOT NULL UNIQUE,
  description text
);

CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  institution_id uuid REFERENCES institutions(id) ON DELETE CASCADE,
  campus_id uuid REFERENCES campuses(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role_id, institution_id, campus_id)
);

CREATE TABLE IF NOT EXISTS role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DISABLED', 'ARCHIVED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tenant_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES modules(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'INACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'EXPIRED')),
  activated_at timestamptz,
  expires_at timestamptz,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, module_id)
);

CREATE TABLE IF NOT EXISTS auth_identities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('EMAIL', 'MOBILE_OTP', 'GOOGLE', 'MICROSOFT', 'SSO')),
  provider_subject text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_subject)
);

CREATE TABLE IF NOT EXISTS auth_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  ip_address inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS auth_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  mobile text NOT NULL,
  purpose text NOT NULL CHECK (purpose IN ('LOGIN', 'VERIFY')),
  code_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  attempts integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  institution_id uuid REFERENCES institutions(id) ON DELETE SET NULL,
  campus_id uuid REFERENCES campuses(id) ON DELETE SET NULL,
  actor_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  request_id text NOT NULL,
  module text NOT NULL,
  resource text NOT NULL,
  resource_id text,
  action text NOT NULL,
  previous_value jsonb,
  new_value jsonb,
  ip_address inet,
  device_context jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS institutions_tenant_idx ON institutions (tenant_id);
CREATE INDEX IF NOT EXISTS campuses_tenant_institution_idx ON campuses (tenant_id, institution_id);
CREATE INDEX IF NOT EXISTS users_tenant_status_idx ON users (tenant_id, status);
CREATE INDEX IF NOT EXISTS user_roles_scope_idx ON user_roles (tenant_id, user_id, institution_id, campus_id);
CREATE INDEX IF NOT EXISTS role_permissions_role_idx ON role_permissions (role_id);
CREATE INDEX IF NOT EXISTS tenant_modules_tenant_idx ON tenant_modules (tenant_id, status);
CREATE INDEX IF NOT EXISTS auth_sessions_user_idx ON auth_sessions (user_id, expires_at);
CREATE INDEX IF NOT EXISTS audit_logs_scope_idx ON audit_logs (tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_request_idx ON audit_logs (request_id);

INSERT INTO tenants (id, name, slug, status)
VALUES ('00000000-0000-0000-0000-000000000001', 'CITIS Platform', 'citis-platform', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

INSERT INTO modules (code, name, description)
VALUES
  ('PLATFORM', 'Platform Management', 'Tenant and platform administration'),
  ('IDENTITY', 'Identity and Access', 'Users, roles, permissions, and authentication'),
  ('AUDIT', 'Audit Logs', 'Mutation history and compliance records'),
  ('LMS', 'Learning Management', 'Future course delivery and learning workflows')
ON CONFLICT (code) DO NOTHING;

WITH permission_seed(module, resource, action) AS (
  VALUES
    ('platform', 'tenant', 'VIEW'), ('platform', 'tenant', 'CREATE'), ('platform', 'tenant', 'UPDATE'), ('platform', 'tenant', 'ARCHIVE'),
    ('platform', 'institution', 'VIEW'), ('platform', 'institution', 'CREATE'), ('platform', 'institution', 'UPDATE'), ('platform', 'institution', 'ARCHIVE'),
    ('platform', 'module', 'VIEW'), ('platform', 'module', 'UPDATE'), ('platform', 'module', 'PUBLISH'),
    ('identity', 'user', 'VIEW'), ('identity', 'user', 'CREATE'), ('identity', 'user', 'UPDATE'), ('identity', 'user', 'DISABLE'),
    ('identity', 'role', 'VIEW'), ('identity', 'role', 'CREATE'), ('identity', 'role', 'UPDATE'), ('identity', 'role', 'DELETE'),
    ('identity', 'permission', 'VIEW'), ('identity', 'permission', 'UPDATE'),
    ('audit', 'audit_log', 'VIEW'), ('audit', 'audit_log', 'EXPORT'),
    ('lms', 'course', 'VIEW'), ('lms', 'course', 'CREATE'), ('lms', 'course', 'UPDATE'), ('lms', 'course', 'PUBLISH')
)
INSERT INTO permissions (module, resource, action, code)
SELECT module, resource, action, module || '.' || resource || '.' || lower(action)
FROM permission_seed
ON CONFLICT (code) DO NOTHING;

INSERT INTO roles (tenant_id, name, code, description)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'CITIS Super Admin', 'CITIS_SUPER_ADMIN', 'Full platform administration'),
  ('00000000-0000-0000-0000-000000000001', 'CITIS Platform Support', 'CITIS_PLATFORM_SUPPORT', 'Platform support and audit access'),
  ('00000000-0000-0000-0000-000000000001', 'Institution Administrator', 'INSTITUTION_ADMINISTRATOR', 'Institution-level administration'),
  ('00000000-0000-0000-0000-000000000001', 'Principal / Director', 'PRINCIPAL_DIRECTOR', 'Institution leadership'),
  ('00000000-0000-0000-0000-000000000001', 'Admission Manager', 'ADMISSION_MANAGER', 'Admission operations'),
  ('00000000-0000-0000-0000-000000000001', 'Academic Administrator', 'ACADEMIC_ADMINISTRATOR', 'Academic operations'),
  ('00000000-0000-0000-0000-000000000001', 'Finance Manager', 'FINANCE_MANAGER', 'Finance operations'),
  ('00000000-0000-0000-0000-000000000001', 'HR Manager', 'HR_MANAGER', 'HR operations'),
  ('00000000-0000-0000-0000-000000000001', 'Teacher', 'TEACHER', 'Teaching access'),
  ('00000000-0000-0000-0000-000000000001', 'Student', 'STUDENT', 'Learner access'),
  ('00000000-0000-0000-0000-000000000001', 'Parent', 'PARENT', 'Parent access')
ON CONFLICT (tenant_id, code) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.tenant_id = '00000000-0000-0000-0000-000000000001'
  AND r.code = 'CITIS_SUPER_ADMIN'
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN ('audit.audit_log.view', 'audit.audit_log.export', 'identity.user.view')
WHERE r.tenant_id = '00000000-0000-0000-0000-000000000001'
  AND r.code = 'CITIS_PLATFORM_SUPPORT'
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO schema_migrations (version)
VALUES ('001_foundation')
ON CONFLICT (version) DO NOTHING;