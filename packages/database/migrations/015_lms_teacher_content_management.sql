INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.tenant_id = '00000000-0000-0000-0000-000000000001'
  AND r.code = 'TEACHER'
  AND p.code IN (
    'lms.course_module.create',
    'lms.course_module.update',
    'lms.course_module.publish',
    'lms.course_module.archive',
    'lms.lesson.create',
    'lms.lesson.update',
    'lms.lesson.publish',
    'lms.lesson.archive',
    'lms.learning_resource.create',
    'lms.learning_resource.update',
    'lms.learning_resource.publish',
    'lms.learning_resource.archive'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO schema_migrations (version)
VALUES ('015_lms_teacher_content_management')
ON CONFLICT (version) DO NOTHING;