INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.code = 'STUDENT'
  AND p.code = 'lms.learning_resource.view'
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO schema_migrations (version)
VALUES ('029_lms_student_resource_view')
ON CONFLICT (version) DO NOTHING;