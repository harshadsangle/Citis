ALTER TABLE learning_resources
  DROP CONSTRAINT IF EXISTS learning_resources_location_check;

ALTER TABLE learning_resources
  ADD CONSTRAINT learning_resources_location_check CHECK (
    resource_type = 'VIDEO'
    OR
    (resource_type IN ('LINK', 'INTERACTIVE') AND url IS NOT NULL AND length(trim(url)) > 0)
    OR
    resource_type IN ('PDF', 'DOCUMENT', 'PRESENTATION', 'SCORM')
  );

INSERT INTO schema_migrations (version)
VALUES ('028_lms_uploaded_video_resources')
ON CONFLICT (version) DO NOTHING;