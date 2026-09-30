import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { resolve } from "node:path";

const dto = readFileSync(resolve(process.cwd(), "src/modules/lms/lms.dto.ts"), "utf8");
const controller = readFileSync(resolve(process.cwd(), "src/modules/lms/lms.controller.ts"), "utf8");
const service = readFileSync(resolve(process.cwd(), "src/modules/lms/lms.service.ts"), "utf8");

test("live class DTOs restrict providers and validate the stored meeting fields", () => {
  assert.match(dto, /LMS_LIVE_CLASS_PROVIDERS = \["ZOOM", "GOOGLE_MEET", "MICROSOFT_TEAMS", "WEBEX"\]/);
  assert.match(dto, /LMS_LIVE_CLASS_STATUSES = \["SCHEDULED", "CANCELLED", "COMPLETED", "ARCHIVED"\]/);
  assert.match(dto, /@IsIn\(LMS_LIVE_CLASS_PROVIDERS\)/);
  assert.match(dto, /@IsUrl\(\{ require_tld: false \}\)/);
  // A class needs a title, a date, a start time, a duration and a link.
  assert.match(dto, /@Length\(2, 180\)\s*\n\s*title!: string;/);
  assert.match(dto, /@IsDateString\(\{ strict: true \}\)\s*\n\s*scheduledDate!: string;/);
  assert.match(dto, /LIVE_CLASS_TIME = \/\^\(\[01\]\\d\|2\[0-3\]\):\[0-5\]\\d\$\//);
  assert.match(dto, /@Max\(1440\)\s*\n\s*durationMinutes!: number;/);
});

test("live class routes are permission gated on the seeded live_class permissions", () => {
  assert.match(controller, /@Get\("live-classes"\)\s*\n\s*@RequirePermission\("lms\.live_class\.view"\)/);
  assert.match(controller, /@Post\("live-classes"\)\s*\n\s*@RequirePermission\("lms\.live_class\.create"\)/);
  assert.match(controller, /@Patch\("live-classes\/:id"\)\s*\n\s*@RequirePermission\("lms\.live_class\.update"\)/);
  assert.match(controller, /@Post\("live-classes\/:id\/status"\)\s*\n\s*@RequirePermission\("lms\.live_class\.update"\)/);
  assert.match(controller, /@Post\("live-classes\/:id\/archive"\)\s*\n\s*@RequirePermission\("lms\.live_class\.archive"\)/);
  // Every live class id parameter is a validated UUID. The pipe and the route
  // decorator sit on separate lines, so match across the whole controller.
  const idRoutes = controller.match(/@Param\("id", new ParseUUIDPipe\(\{ version: "4" \}\)\) id: string/g) || [];
  const liveClassIdRoutes = (controller.match(/"live-classes\/:id[^"]*"/g) || []).length;
  assert.equal(liveClassIdRoutes, 3, "the id-based live class routes are update, status, and archive");
  assert.ok(
    idRoutes.length >= liveClassIdRoutes,
    `all ${liveClassIdRoutes} live class :id routes must parse the id as a UUID`,
  );
});

test("live class listing is narrowed to the caller's own enrolments and assignments", () => {
  const listStart = service.indexOf("async listLiveClasses(");
  assert.ok(listStart > 0, "listLiveClasses must exist");
  const body = service.slice(listStart, listStart + 4200);

  // A learner only ever sees courses they hold an active enrolment for.
  assert.match(body, /isLearnerOnly\(user\)/);
  assert.match(body, /FROM lms_enrollments e/);
  assert.match(body, /e\.learner_id = \$\$\{values\.length\}/);
  assert.match(body, /e\.status = 'ACTIVE'/);
  // Cancelled or archived classes are never surfaced to learners.
  assert.match(body, /lc\.status IN \('SCHEDULED', 'COMPLETED'\)/);

  // An instructor only ever sees explicitly assigned or college-granted courses.
  assert.match(body, /isInstructorOnly\(user\)/);
  assert.match(body, /FROM lms_instructor_assignments ia/);
  assert.match(body, /ia\.instructor_id = \$\$\{values\.length\}/);
  assert.match(body, /ia\.status = 'ACTIVE'/);

  // Institution and campus scope is still filtered for every role.
  assert.match(body, /filterScopedRows\(user, rows\.rows/);
  // Tenant is always the first parameter.
  assert.match(body, /const values: unknown\[\] = \[user\.tenantId\]/);
});

test("scheduling a live class is administrator only and course scoped", () => {
  const start = service.indexOf("async createLiveClass(");
  assert.ok(start > 0, "createLiveClass must exist");
  const body = service.slice(start, start + 1800);
  assert.match(body, /this\.assertCourseAdministrator\(user\)/);
  assert.match(body, /liveClassCourseScope\(input\.courseId, user\)/);
  assert.match(body, /assertScope\(user, course\.institution_id, course\.campus_id\)/);
  // Every mutation is written with the caller's tenant.
  assert.match(body, /INSERT INTO lms_live_classes/);
});

test("an archived live class cannot change status again", () => {
  const start = service.indexOf("async setLiveClassStatus(");
  assert.ok(start > 0, "setLiveClassStatus must exist");
  const body = service.slice(start, start + 900);
  // liveClassRow is called with requireAdministrator, which is what enforces
  // the administrator role and institution scope for every status change.
  assert.match(body, /this\.liveClassRow\(id, user, true\)/);
  assert.match(body, /if \(before\.status === "ARCHIVED"\)/);
  assert.match(body, /An archived live class cannot change status\./);
});

test("reading a live class enforces enrolment, assignment, and institution scope", () => {
  const start = service.indexOf("private async liveClassRow(");
  assert.ok(start > 0, "liveClassRow must exist");
  const body = service.slice(start, start + 1600);
  assert.match(body, /if \(requireAdministrator\) \{/);
  assert.match(body, /this\.assertCourseAdministrator\(user\)/);
  assert.match(body, /assertScope\(user, String\(row\.institution_id\)/);
  assert.match(body, /if \(!this\.isDirectStudentLearner\(user\)\) \{/);
  assert.match(body, /assertScopeForRead\(user, String\(row\.institution_id\)/);
  assert.match(body, /this\.assertLearnerCourseAccess\(user, String\(row\.course_id\)/);
  assert.match(body, /this\.assertAssignedTeacherRead\(user, String\(row\.institution_id\)/);
});

test("unit and chapter reordering swaps sequences atomically inside one transaction", () => {
  const start = service.indexOf("async reorderHierarchyNode(");
  assert.ok(start > 0, "reorderHierarchyNode must exist");
  const body = service.slice(start, start + 2000);
  // A single transaction keeps the unique (tenant, parent, sequence) constraint
  // satisfied instead of failing halfway through a two-call swap.
  assert.match(body, /this\.db\.transaction\(async \(client\) =>/);
  assert.match(body, /FOR UPDATE/);
  assert.match(body, /sequence = sequence \+ 1000000/);
  assert.match(body, /CASE id WHEN \$4 THEN \$5 ELSE \$6 END/);
  // Siblings must share a parent or the swap is meaningless.
  assert.match(body, /must belong to the same/);
  assert.match(body, /this\.assertAssignedTeacherManage\(user/);

  assert.match(controller, /@Post\("course-units\/reorder"\)\s*\n\s*@RequirePermission\("lms\.unit\.update"\)/);
  assert.match(controller, /@Post\("course-chapters\/reorder"\)\s*\n\s*@RequirePermission\("lms\.chapter\.update"\)/);
});
