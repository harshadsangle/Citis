ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS price_minor bigint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'INR',
  ADD COLUMN IF NOT EXISTS purchasable boolean NOT NULL DEFAULT false;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'courses_price_minor_ck') THEN
    ALTER TABLE courses ADD CONSTRAINT courses_price_minor_ck CHECK (price_minor >= 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'courses_currency_ck') THEN
    ALTER TABLE courses ADD CONSTRAINT courses_currency_ck CHECK (currency ~ '^[A-Z]{3}$');
  END IF;
END $$;

ALTER TABLE lms_enrollments
  ALTER COLUMN institution_id DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS lms_enrollments_direct_active_unique_idx
  ON lms_enrollments (tenant_id, course_id, learner_id)
  WHERE status = 'ACTIVE' AND assignment_source = 'DIRECT';

CREATE TABLE IF NOT EXISTS lms_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  student_id uuid NOT NULL,
  course_id uuid NOT NULL,
  provider text NOT NULL DEFAULT 'RAZORPAY' CHECK (provider = 'RAZORPAY'),
  idempotency_key text NOT NULL,
  razorpay_order_id text,
  razorpay_payment_id text,
  amount_minor bigint NOT NULL CHECK (amount_minor > 0),
  currency text NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
  status text NOT NULL CHECK (status IN ('PENDING', 'ORDER_CREATED', 'CAPTURED', 'FAILED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED')),
  failure_code text,
  failure_reason text,
  captured_at timestamptz,
  failed_at timestamptz,
  refunded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT lms_payments_tenant_student_fk
    FOREIGN KEY (tenant_id, student_id) REFERENCES users(tenant_id, id) ON DELETE RESTRICT,
  CONSTRAINT lms_payments_tenant_course_fk
    FOREIGN KEY (tenant_id, course_id) REFERENCES courses(tenant_id, id) ON DELETE RESTRICT
);

CREATE UNIQUE INDEX IF NOT EXISTS lms_payments_idempotency_key
  ON lms_payments (tenant_id, student_id, course_id, idempotency_key);
CREATE UNIQUE INDEX IF NOT EXISTS lms_payments_razorpay_order_key
  ON lms_payments (razorpay_order_id) WHERE razorpay_order_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS lms_payments_razorpay_payment_key
  ON lms_payments (razorpay_payment_id) WHERE razorpay_payment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS lms_payments_student_idx
  ON lms_payments (tenant_id, student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS lms_payments_course_idx
  ON lms_payments (tenant_id, course_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS lms_payment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE SET NULL,
  payment_id uuid REFERENCES lms_payments(id) ON DELETE SET NULL,
  provider text NOT NULL DEFAULT 'RAZORPAY' CHECK (provider = 'RAZORPAY'),
  provider_event_id text NOT NULL UNIQUE,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  processed_at timestamptz,
  processing_status text NOT NULL DEFAULT 'RECEIVED' CHECK (processing_status IN ('RECEIVED', 'PROCESSED', 'IGNORED', 'FAILED')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lms_refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  payment_id uuid NOT NULL REFERENCES lms_payments(id) ON DELETE RESTRICT,
  initiated_by uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  razorpay_refund_id text,
  amount_minor bigint NOT NULL CHECK (amount_minor > 0),
  reason text NOT NULL,
  status text NOT NULL CHECK (status IN ('PENDING', 'PROCESSED', 'FAILED')),
  failure_reason text,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS lms_refunds_razorpay_key
  ON lms_refunds (razorpay_refund_id) WHERE razorpay_refund_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS lms_refunds_payment_pending_key
  ON lms_refunds (payment_id) WHERE status IN ('PENDING', 'PROCESSED');

INSERT INTO permissions (module, resource, action, code, description)
VALUES
  ('payments', 'payment', 'VIEW', 'payments.payment.view', 'View payment records'),
  ('payments', 'payment', 'CREATE', 'payments.payment.create', 'Start a course payment'),
  ('payments', 'refund', 'VIEW', 'payments.refund.view', 'View refund records'),
  ('payments', 'refund', 'CREATE', 'payments.refund.create', 'Initiate a payment refund')
ON CONFLICT (code) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN ('payments.payment.view', 'payments.payment.create')
WHERE r.code = 'STUDENT'
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN ('payments.payment.view', 'payments.refund.view', 'payments.refund.create')
WHERE r.code = 'CITIS_ADMIN'
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO schema_migrations (version)
VALUES ('023_razorpay_course_payments')
ON CONFLICT (version) DO NOTHING;