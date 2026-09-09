INSERT INTO permissions (module, resource, action, code, description)
VALUES (
  'lms',
  'resource_progress',
  'UPDATE',
  'lms.resource_progress.update',
  'Update the signed-in learner''s resource progress'
)
ON CONFLICT (code) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.tenant_id = '00000000-0000-0000-0000-000000000001'
  AND r.code = 'STUDENT'
  AND p.code = 'lms.resource_progress.update'
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO schema_migrations (version)
VALUES ('019_lms_resource_progress_permission')
ON CONFLICT (version) DO NOTHING;