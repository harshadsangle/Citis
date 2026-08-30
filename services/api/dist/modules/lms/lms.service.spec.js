"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const node_test_1 = __importDefault(require("node:test"));
const common_1 = require("@nestjs/common");
const lms_service_1 = require("./lms.service");
const resource_storage_service_1 = require("./resource-storage.service");
const user = {
    id: "user-1",
    tenantId: "tenant-1",
    email: "admin@example.com",
    firstName: "Admin",
    lastName: "User",
    roles: [{ code: "INSTITUTION_ADMINISTRATOR", name: "Institution Administrator" }],
    permissions: ["lms.course.create", "lms.learning_resource.create", "lms.course.publish"],
};
const request = {
    context: {
        requestId: "request-1",
        ipAddress: "127.0.0.1",
        userAgent: "test",
        user,
    },
};
function serviceWith(query) {
    const audits = [];
    const db = { query };
    const audit = { record: async (input) => audits.push(input) };
    return { service: new lms_service_1.LmsService(db, audit, new resource_storage_service_1.ResourceStorageService()), audits };
}
(0, node_test_1.default)("course creation rejects a parent outside the authenticated tenant", async () => {
    const { service } = serviceWith(async () => ({ rows: [] }));
    await strict_1.default.rejects(service.createCourse({
        programmeId: "programme-from-another-tenant",
        title: "Digital Skills",
        code: "DS-101",
    }, request), common_1.NotFoundException);
});
(0, node_test_1.default)("learning resources enforce URL and file requirements before insertion", async () => {
    let insertAttempted = false;
    const { service } = serviceWith(async (text) => {
        if (text.startsWith("SELECT id FROM lessons"))
            return { rows: [{ id: "lesson-1" }] };
        insertAttempted = true;
        return { rows: [] };
    });
    await strict_1.default.rejects(service.createLearningResource({
        lessonId: "lesson-1",
        resourceType: "VIDEO",
        title: "Intro video",
        sequence: 1,
    }, request), common_1.BadRequestException);
    strict_1.default.equal(insertAttempted, false);
});
(0, node_test_1.default)("publishing content writes an auditable status mutation", async () => {
    const { service, audits } = serviceWith(async (text) => {
        if (text.startsWith("SELECT * FROM courses")) {
            return { rows: [{ id: "course-1", tenant_id: user.tenantId, institution_id: "institution-1", status: "DRAFT" }] };
        }
        return { rows: [{ id: "course-1", tenant_id: user.tenantId, institution_id: "institution-1", status: "PUBLISHED" }] };
    });
    const result = await service.changeStatus("course-1", "course", "PUBLISHED", request);
    strict_1.default.equal(result.status, "PUBLISHED");
    strict_1.default.equal(audits.length, 1);
    strict_1.default.equal(audits[0].action, "PUBLISH");
    strict_1.default.equal(audits[0].tenantId, user.tenantId);
});
(0, node_test_1.default)("managed file delivery is tenant-scoped and auditable", async () => {
    const audits = [];
    const queries = [];
    const db = {
        query: async (text, values) => {
            queries.push({ text, values });
            if (text.startsWith("SELECT lr.*")) {
                return { rows: [{ id: "resource-1", tenant_id: user.tenantId, institution_id: "institution-1", resource_type: "PDF" }] };
            }
            return { rows: [{ id: "file-1", tenant_id: user.tenantId, resource_id: "resource-1", kind: "FILE", storage_key: "tenant-1/resource-1/file.pdf", original_filename: "file.pdf", mime_type: "application/pdf" }] };
        },
    };
    const storage = { read: async (storageKey) => Buffer.from(storageKey) };
    const audit = { record: async (input) => audits.push(input) };
    const service = new lms_service_1.LmsService(db, audit, storage);
    const result = await service.getManagedFile("resource-1", request);
    strict_1.default.deepEqual(result.content, Buffer.from("tenant-1/resource-1/file.pdf"));
    strict_1.default.equal(queries[0].values[1], user.tenantId);
    strict_1.default.equal(queries[1].values[1], user.tenantId);
    strict_1.default.equal(audits.at(-1)?.action, "DOWNLOAD");
    strict_1.default.equal(audits.at(-1)?.tenantId, user.tenantId);
});
(0, node_test_1.default)("enrollment accepts an active institution Student and audits the mutation", async () => {
    const audits = [];
    const queries = [];
    const db = {
        query: async (text) => {
            queries.push(text);
            if (text.startsWith("SELECT c.id"))
                return { rows: [{ id: "course-1", tenant_id: user.tenantId, institution_id: "institution-1", status: "PUBLISHED", programme_status: "PUBLISHED", institution_status: "ACTIVE" }] };
            if (text.startsWith("SELECT 1"))
                return { rows: [{ allowed: 1 }] };
            if (text.startsWith("SELECT u.id"))
                return { rows: [{ id: "student-1", first_name: "Learner", last_name: "One" }] };
            if (text.startsWith("INSERT INTO lms_enrollments"))
                return { rows: [{ id: "enrollment-1", tenant_id: user.tenantId, institution_id: "institution-1", course_id: "course-1", learner_id: "student-1", status: "ACTIVE" }] };
            return { rows: [] };
        },
    };
    const audit = { record: async (input) => audits.push(input) };
    const service = new lms_service_1.LmsService(db, audit, new resource_storage_service_1.ResourceStorageService());
    const result = await service.enrollLearner("course-1", { learnerId: "student-1" }, request);
    strict_1.default.equal(result.learner_id, "student-1");
    strict_1.default.equal(audits[0].resource, "enrollment");
    strict_1.default.equal(audits[0].action, "CREATE");
    strict_1.default.ok(queries.some((query) => query.includes("ur.institution_id = $3")));
});
(0, node_test_1.default)("enrollment rejects a user who is not an active Student in the course institution", async () => {
    let inserted = false;
    const { service } = serviceWith(async (text) => {
        if (text.startsWith("SELECT c.id"))
            return { rows: [{ id: "course-1", tenant_id: user.tenantId, institution_id: "institution-1", status: "PUBLISHED", programme_status: "PUBLISHED", institution_status: "ACTIVE" }] };
        if (text.startsWith("SELECT 1"))
            return { rows: [{ allowed: 1 }] };
        if (text.startsWith("INSERT INTO lms_enrollments"))
            inserted = true;
        return { rows: [] };
    });
    await strict_1.default.rejects(service.enrollLearner("course-1", { learnerId: "teacher-1" }, request), common_1.NotFoundException);
    strict_1.default.equal(inserted, false);
});
(0, node_test_1.default)("duplicate instructor assignment is returned as a conflict", async () => {
    const { service } = serviceWith(async (text) => {
        if (text.startsWith("SELECT c.id"))
            return { rows: [{ id: "course-1", tenant_id: user.tenantId, institution_id: "institution-1", status: "PUBLISHED", programme_status: "PUBLISHED", institution_status: "ACTIVE" }] };
        if (text.startsWith("SELECT 1"))
            return { rows: [{ allowed: 1 }] };
        if (text.startsWith("SELECT u.id"))
            return { rows: [{ id: "teacher-1", first_name: "Teacher", last_name: "One" }] };
        if (text.startsWith("INSERT INTO lms_instructor_assignments"))
            throw Object.assign(new Error("duplicate"), { code: "23505" });
        return { rows: [] };
    });
    await strict_1.default.rejects(service.assignInstructor("course-1", { instructorId: "teacher-1" }, request), common_1.ConflictException);
});
(0, node_test_1.default)("removing an enrollment preserves the row and audits the removal", async () => {
    const audits = [];
    const db = {
        query: async (text) => {
            if (text.startsWith("SELECT c.id"))
                return { rows: [{ id: "course-1", tenant_id: user.tenantId, institution_id: "institution-1", status: "PUBLISHED", programme_status: "PUBLISHED", institution_status: "ACTIVE" }] };
            if (text.startsWith("SELECT 1"))
                return { rows: [{ allowed: 1 }] };
            if (text.startsWith("SELECT * FROM lms_enrollments"))
                return { rows: [{ id: "enrollment-1", tenant_id: user.tenantId, institution_id: "institution-1", course_id: "course-1", status: "ACTIVE" }] };
            if (text.startsWith("UPDATE lms_enrollments"))
                return { rows: [{ id: "enrollment-1", tenant_id: user.tenantId, institution_id: "institution-1", course_id: "course-1", status: "REMOVED" }] };
            return { rows: [] };
        },
    };
    const audit = { record: async (input) => audits.push(input) };
    const service = new lms_service_1.LmsService(db, audit, new resource_storage_service_1.ResourceStorageService());
    const result = await service.removeEnrollment("course-1", "enrollment-1", request);
    strict_1.default.equal(result.status, "REMOVED");
    strict_1.default.equal(audits[0].action, "REMOVE");
    strict_1.default.equal(audits[0].institutionId, "institution-1");
});
(0, node_test_1.default)("course progress derives lesson and assessment totals by module", async () => {
    const { service } = serviceWith(async (text) => {
        if (text.startsWith("SELECT c.id")) {
            return { rows: [{ id: "course-1", tenant_id: user.tenantId, institution_id: "institution-1", title: "Digital Skills", code: "DS-101", description: "Foundations", status: "PUBLISHED", programme_status: "PUBLISHED", institution_status: "ACTIVE" }] };
        }
        if (text.startsWith("SELECT 1"))
            return { rows: [{ allowed: 1 }] };
        if (text.startsWith("SELECT cm.id")) {
            return {
                rows: [
                    { module_id: "module-1", module_title: "Foundations", sequence: 1, lesson_total: 2, lesson_completed: 1, assessment_total: 1, assessment_completed: 1 },
                    { module_id: "module-2", module_title: "Practice", sequence: 2, lesson_total: 1, lesson_completed: 0, assessment_total: 0, assessment_completed: 0 },
                ],
            };
        }
        return { rows: [] };
    });
    const result = await service.getCourseProgress("course-1", user);
    strict_1.default.equal(result.state, "IN_PROGRESS");
    strict_1.default.equal(result.percentage, 50);
    strict_1.default.deepEqual(result.lessons, { completed: 1, total: 3 });
    strict_1.default.deepEqual(result.assessments, { completed: 1, total: 1 });
    strict_1.default.equal(result.modules[0].percentage, 66.67);
    strict_1.default.equal(result.modules[1].state, "NOT_STARTED");
});
(0, node_test_1.default)("lesson completion requires an active enrollment and audits only the first transition", async () => {
    const { service, audits } = serviceWith(async (text) => {
        if (text.startsWith("SELECT l.id")) {
            return { rows: [{ id: "lesson-1", tenant_id: user.tenantId, institution_id: "institution-1", course_id: "course-1", module_id: "module-1", lesson_status: "PUBLISHED", module_status: "PUBLISHED", course_status: "PUBLISHED", programme_status: "PUBLISHED", institution_status: "ACTIVE" }] };
        }
        if (text.startsWith("SELECT id, tenant_id"))
            return { rows: [{ id: "enrollment-1" }] };
        if (text.startsWith("SELECT * FROM lms_lesson_progress"))
            return { rows: [] };
        if (text.startsWith("INSERT INTO lms_lesson_progress"))
            return { rows: [{ id: "progress-1", tenant_id: user.tenantId, institution_id: "institution-1", course_id: "course-1", module_id: "module-1", lesson_id: "lesson-1", learner_id: user.id, status: "COMPLETED" }] };
        return { rows: [] };
    });
    const result = await service.completeLesson("lesson-1", request);
    strict_1.default.equal(result.status, "COMPLETED");
    strict_1.default.equal(audits[0].resource, "lesson_progress");
    strict_1.default.equal(audits[0].action, "COMPLETE");
});
(0, node_test_1.default)("lesson completion rejects learners without an active course enrollment", async () => {
    const { service } = serviceWith(async (text) => {
        if (text.startsWith("SELECT l.id")) {
            return { rows: [{ id: "lesson-1", tenant_id: user.tenantId, institution_id: "institution-1", course_id: "course-1", module_id: "module-1", lesson_status: "PUBLISHED", module_status: "PUBLISHED", course_status: "PUBLISHED", programme_status: "PUBLISHED", institution_status: "ACTIVE" }] };
        }
        if (text.startsWith("SELECT id, tenant_id"))
            return { rows: [] };
        return { rows: [] };
    });
    await strict_1.default.rejects(service.completeLesson("lesson-1", request), common_1.ForbiddenException);
});
(0, node_test_1.default)("assessment completion records a result and derives pass status", async () => {
    const { service, audits } = serviceWith(async (text) => {
        if (text.startsWith("SELECT a.*")) {
            return { rows: [{ id: "assessment-1", tenant_id: user.tenantId, institution_id: "institution-1", course_id: "course-1", module_id: "module-1", status: "PUBLISHED", module_status: "PUBLISHED", course_status: "PUBLISHED", programme_status: "PUBLISHED", institution_status: "ACTIVE", total_marks: "100", passing_marks: "60", attempt_limit: null }] };
        }
        if (text.startsWith("SELECT id, tenant_id"))
            return { rows: [{ id: "enrollment-1" }] };
        if (text.startsWith("SELECT * FROM lms_assessment_completions"))
            return { rows: [] };
        if (text.startsWith("INSERT INTO lms_assessment_completions"))
            return { rows: [{ id: "completion-1", tenant_id: user.tenantId, institution_id: "institution-1", course_id: "course-1", module_id: "module-1", assessment_id: "assessment-1", learner_id: user.id, attempt_id: "attempt-1", score: 82, passed: true, status: "COMPLETED" }] };
        return { rows: [] };
    });
    const result = await service.completeAssessment({ assessmentId: "assessment-1", attemptId: "attempt-1", score: 82 }, request);
    strict_1.default.equal(result.passed, true);
    strict_1.default.equal(audits[0].resource, "assessment_completion");
    strict_1.default.equal(audits[0].action, "COMPLETE");
});
//# sourceMappingURL=lms.service.spec.js.map