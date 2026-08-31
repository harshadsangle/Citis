INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.tenant_id = '00000000-0000-0000-0000-000000000001'
  AND r.code = 'TEACHER'
  AND p.code IN (
    'lms.course.view',
    'lms.course_module.view',
    'lms.lesson.view',
    'lms.learning_resource.view',
    'lms.enrollment.view'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO schema_migrations (version)
VALUES ('012_lms_instructor_dashboard_access')
ON CONFLICT (version) DO NOTHING;