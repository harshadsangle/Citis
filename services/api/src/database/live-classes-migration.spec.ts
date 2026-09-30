import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { resolve } from "node:path";
import { MIGRATION_VERSIONS } from "./migrate";

const liveClassesMigration = readFileSync(resolve(process.cwd(), "../../packages/database/migrations/036_lms_live_classes.sql"), "utf8");

test("live classes migration is registered as the newest schema version", () => {
  assert.equal(MIGRATION_VERSIONS.at(-1), "036_lms_live_classes");
  assert.match(liveClassesMigration, /036_lms_live_classes/);
});

test("live classes migration stores a course-scoped session with a provider and link", () => {
  assert.match(liveClassesMigration, /CREATE TABLE IF NOT EXISTS lms_live_classes/);
  assert.match(liveClassesMigration, /course_id uuid NOT NULL/);
  assert.match(liveClassesMigration, /module_id uuid,/);
  assert.match(liveClassesMigration, /unit_id uuid,/);
  assert.match(liveClassesMigration, /chapter_id uuid,/);
  assert.match(liveClassesMigration, /scheduled_date date NOT NULL/);
  assert.match(liveClassesMigration, /start_time time NOT NULL/);
  assert.match(liveClassesMigration, /duration_minutes integer NOT NULL CHECK \(duration_minutes > 0/);
  assert.match(liveClassesMigration, /provider text NOT NULL CHECK \(provider IN \('ZOOM', 'GOOGLE_MEET', 'MICROSOFT_TEAMS', 'WEBEX'\)\)/);
  assert.match(liveClassesMigration, /meeting_url text NOT NULL/);
  // Attendance capture and recording processing are out of scope, so a
  // recording is only ever a stored link.
  assert.match(liveClassesMigration, /recording_url text,/);
});

test("live classes migration keeps parents inside the same tenant and course", () => {
  assert.match(liveClassesMigration, /lms_live_classes_tenant_course_fk[\s\S]*?FOREIGN KEY \(tenant_id, course_id\) REFERENCES courses\(tenant_id, id\)/);
  assert.match(liveClassesMigration, /lms_live_classes_tenant_module_fk[\s\S]*?FOREIGN KEY \(tenant_id, course_id, module_id\) REFERENCES course_modules\(tenant_id, course_id, id\)/);
  assert.match(liveClassesMigration, /lms_live_classes_tenant_unit_fk[\s\S]*?FOREIGN KEY \(tenant_id, course_id, unit_id\) REFERENCES lms_course_units\(tenant_id, course_id, id\)/);
  assert.match(liveClassesMigration, /lms_live_classes_tenant_chapter_fk[\s\S]*?FOREIGN KEY \(tenant_id, course_id, chapter_id\) REFERENCES lms_course_chapters\(tenant_id, course_id, id\)/);
  assert.match(liveClassesMigration, /UNIQUE \(tenant_id, id\)/);
});

/** Returns the single `r.code IN ( ... )` role list that precedes `marker`. */
function roleListBefore(marker: string) {
  const markerAt = liveClassesMigration.indexOf(marker);
  assert.ok(markerAt > 0, `migration must contain ${marker}`);
  const roleListAt = liveClassesMigration.lastIndexOf("r.code IN (", markerAt);
  assert.ok(roleListAt > 0, `migration must contain a role list before ${marker}`);
  const closeAt = liveClassesMigration.indexOf(")", roleListAt);
  return liveClassesMigration.slice(roleListAt, closeAt);
}

test("live classes migration seeds view, create, update and archive permissions", () => {
  assert.match(liveClassesMigration, /'lms\.' \|\| resource \|\| '\.' \|\| lower\(action\)/);
  assert.match(liveClassesMigration, /'live_class', 'VIEW'/);
  assert.match(liveClassesMigration, /'live_class', 'CREATE'/);
  assert.match(liveClassesMigration, /'live_class', 'UPDATE'/);
  assert.match(liveClassesMigration, /'live_class', 'ARCHIVE'/);
});

test("live classes migration lets learners and instructors view, but only administrators schedule", () => {
  const viewRoles = roleListBefore("AND p.code = 'lms.live_class.view'");
  assert.match(viewRoles, /'STUDENT'/);
  assert.match(viewRoles, /'TEACHER'/);
  assert.match(viewRoles, /'INSTRUCTOR'/);
  assert.match(viewRoles, /'INSTITUTION_ADMINISTRATOR'/);

  const manageRoles = roleListBefore("AND p.code IN ('lms.live_class.create'");
  assert.match(manageRoles, /'INSTITUTION_ADMINISTRATOR'/);
  assert.match(manageRoles, /'CITIS_SUPER_ADMIN'/);
  // Learners and instructors must never gain scheduling rights.
  assert.doesNotMatch(manageRoles, /'STUDENT'/);
  assert.doesNotMatch(manageRoles, /'TEACHER'/);
  assert.doesNotMatch(manageRoles, /'INSTRUCTOR'/);
});
