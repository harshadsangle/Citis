"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const node_test_1 = __importDefault(require("node:test"));
const common_1 = require("@nestjs/common");
const certificate_service_1 = require("./certificate.service");
const certificate_renderer_1 = require("./certificate-renderer");
const learner = {
    id: "learner-1",
    tenantId: "tenant-1",
    email: "learner@example.com",
    firstName: "Learner",
    lastName: "One",
    roles: [{ code: "STUDENT", name: "Student" }],
    permissions: ["lms.certificate.view", "lms.certificate.export"],
    scopes: [{ institutionId: "institution-1", campusId: "campus-1" }],
};
const request = {
    context: {
        requestId: "request-1",
        ipAddress: "127.0.0.1",
        userAgent: "test",
        user: learner,
    },
};
function certificateRow(overrides = {}) {
    return {
        id: "certificate-1",
        tenant_id: "tenant-1",
        institution_id: "institution-1",
        campus_id: "campus-1",
        course_id: "course-1",
        enrollment_id: "enrollment-1",
        learner_id: "learner-1",
        certificate_number: "CITIS-2026-ABC1234567",
        verification_id: "verify-token",
        issue_date: "2026-08-31T00:00:00.000Z",
        status: "ISSUED",
        document_format: "svg",
        renderer_version: "citis-certificate-v1",
        learner_first_name: "Learner",
        learner_last_name: "One",
        course_title: "Digital Skills",
        course_code: "DS-101",
        institution_name: "CITIS Academy",
        ...overrides,
    };
}
(0, node_test_1.default)("eligible completion issues one idempotent certificate with a unique number", async () => {
    let insertCalls = 0;
    const audits = [];
    const row = certificateRow();
    const client = {
        query: async (text) => {
            if (text.startsWith("SELECT e.id"))
                return { rows: [certificateRow({ enrollment_id: "enrollment-1" })] };
            if (text.startsWith("INSERT INTO lms_certificates")) {
                insertCalls += 1;
                return insertCalls === 1 ? { rows: [row] } : { rows: [] };
            }
            if (text.includes("SELECT cert.id"))
                return { rows: [row] };
            return { rows: [] };
        },
    };
    const db = {
        transaction: async (work) => work(client),
    };
    const audit = { record: async (input) => audits.push(input) };
    const service = new certificate_service_1.CertificateService(db, audit);
    const first = await service.issueIfEligible("tenant-1", "course-1", "learner-1", request);
    const second = await service.issueIfEligible("tenant-1", "course-1", "learner-1", request);
    strict_1.default.equal(first?.certificate_number, "CITIS-2026-ABC1234567");
    strict_1.default.equal(second?.certificate_number, first?.certificate_number);
    strict_1.default.equal(insertCalls, 2);
    strict_1.default.equal(audits.filter((audit) => audit.action === "ISSUE").length, 1);
    strict_1.default.equal(first && "tenant_id" in first, false);
});
(0, node_test_1.default)("incomplete eligibility does not attempt certificate insertion", async () => {
    let inserted = false;
    const client = {
        query: async (text) => {
            if (text.startsWith("SELECT e.id"))
                return { rows: [] };
            if (text.startsWith("INSERT INTO lms_certificates"))
                inserted = true;
            return { rows: [] };
        },
    };
    const db = { transaction: async (work) => work(client) };
    const service = new certificate_service_1.CertificateService(db, { record: async () => undefined });
    strict_1.default.equal(await service.issueIfEligible("tenant-1", "course-1", "learner-1"), null);
    strict_1.default.equal(inserted, false);
});
(0, node_test_1.default)("public verification returns limited details and hides tenant and learner identifiers", async () => {
    const db = {
        query: async (_text, values) => ({
            rows: values?.[0] === "unknown-number"
                ? []
                : [certificateRow({
                        learner_email: "private@example.com",
                        tenant_id: "private-tenant",
                        enrollment_id: "private-enrollment",
                    })],
        }),
    };
    const service = new certificate_service_1.CertificateService(db, { record: async () => undefined });
    const result = await service.verify("CITIS-2026-ABC1234567");
    strict_1.default.equal(result.valid, true);
    strict_1.default.equal(result.learner_name, "Learner One");
    strict_1.default.equal(result.institution_name, "CITIS Academy");
    strict_1.default.equal("tenant_id" in result, false);
    strict_1.default.equal("learner_email" in result, false);
    strict_1.default.deepEqual(await service.verify("unknown-number"), { valid: false });
});
(0, node_test_1.default)("certificate reads cannot cross learner scope", async () => {
    const db = { query: async () => ({ rows: [certificateRow({ learner_id: "another-learner" })] }) };
    const service = new certificate_service_1.CertificateService(db, { record: async () => undefined });
    await strict_1.default.rejects(service.get("certificate-1", learner), common_1.NotFoundException);
});
(0, node_test_1.default)("certificate renderer escapes dynamic values in the downloadable document", () => {
    const svg = (0, certificate_renderer_1.renderCertificateSvg)({
        learnerName: "<Learner>",
        courseTitle: "Course & Practice",
        courseCode: "DS-101",
        institutionName: "Academy",
        certificateNumber: "CITIS-2026-ABC",
        issueDate: "31 August 2026",
        verificationId: "verify-token",
    });
    strict_1.default.match(svg, /&lt;Learner&gt;/);
    strict_1.default.match(svg, /Course &amp; Practice/);
    strict_1.default.doesNotMatch(svg, /<Learner>/);
});
//# sourceMappingURL=certificate.service.spec.js.map