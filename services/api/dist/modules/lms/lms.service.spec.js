"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const node_test_1 = __importDefault(require("node:test"));
const common_1 = require("@nestjs/common");
const lms_service_1 = require("./lms.service");
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
    return { service: new lms_service_1.LmsService(db, audit), audits };
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
//# sourceMappingURL=lms.service.spec.js.map