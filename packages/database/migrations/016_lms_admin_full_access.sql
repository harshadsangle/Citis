INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.code IN (
  'CITIS_SUPER_ADMIN',
  'CITIS_PLATFORM_SUPPORT',
  'INSTITUTION_ADMINISTRATOR',
  'PRINCIPAL_DIRECTOR',
  'ACADEMIC_ADMINISTRATOR'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO schema_migrations (version)
VALUES ('016_lms_admin_full_access')
ON CONFLICT (version) DO NOTHING;