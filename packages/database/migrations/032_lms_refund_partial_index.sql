DROP INDEX IF EXISTS lms_refunds_payment_pending_key;

CREATE UNIQUE INDEX IF NOT EXISTS lms_refunds_payment_pending_key
  ON lms_refunds (payment_id) WHERE status = 'PENDING';

INSERT INTO schema_migrations (version)
VALUES ('032_lms_refund_partial_index')
ON CONFLICT (version) DO NOTHING;