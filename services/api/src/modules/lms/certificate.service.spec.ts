import assert from "node:assert/strict";
import test from "node:test";
import { NotFoundException } from "@nestjs/common";
import type { AuthenticatedUser, ContextRequest } from "../../common/request-context";
import { CertificateService } from "./certificate.service";
import { renderCertificateSvg } from "./certificate-renderer";

const learner: AuthenticatedUser = {
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
} as unknown as ContextRequest;

function certificateRow(overrides: Record<string, unknown> = {}) {
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

test("eligible completion issues one idempotent certificate with a unique number", async () => {
  let insertCalls = 0;
  const audits: Array<Record<string, unknown>> = [];
  const row = certificateRow();
  const client = {
    query: async (text: string) => {
      if (text.startsWith("SELECT e.id")) return { rows: [certificateRow({ enrollment_id: "enrollment-1" })] };
      if (text.startsWith("INSERT INTO lms_certificates")) {
        insertCalls += 1;
        return insertCalls === 1 ? { rows: [row] } : { rows: [] };
      }
      if (text.includes("SELECT cert.id")) return { rows: [row] };
      return { rows: [] };
    },
  };
  const db = {
    transaction: async (work: (executor: typeof client) => Promise<unknown>) => work(client),
  };
  const audit = { record: async (input: Record<string, unknown>) => audits.push(input) };
  const service = new CertificateService(db as never, audit as never);

  const first = await service.issueIfEligible("tenant-1", "course-1", "learner-1", request);
  const second = await service.issueIfEligible("tenant-1", "course-1", "learner-1", request);

  assert.equal(first?.certificate_number, "CITIS-2026-ABC1234567");
  assert.equal(second?.certificate_number, first?.certificate_number);
  assert.equal(insertCalls, 2);
  assert.equal(audits.filter((audit) => audit.action === "ISSUE").length, 1);
  assert.equal(first && "tenant_id" in first, false);
});

test("incomplete eligibility does not attempt certificate insertion", async () => {
  let inserted = false;
  const client = {
    query: async (text: string) => {
      if (text.startsWith("SELECT e.id")) return { rows: [] };
      if (text.startsWith("INSERT INTO lms_certificates")) inserted = true;
      return { rows: [] };
    },
  };
  const db = { transaction: async (work: (executor: typeof client) => Promise<unknown>) => work(client) };
  const service = new CertificateService(db as never, { record: async () => undefined } as never);

  assert.equal(await service.issueIfEligible("tenant-1", "course-1", "learner-1"), null);
  assert.equal(inserted, false);
});

test("public verification returns limited details and hides tenant and learner identifiers", async () => {
  const db = {
    query: async (_text: string, values?: unknown[]) => ({
      rows: values?.[0] === "unknown-number"
        ? []
        : [certificateRow({
          learner_email: "private@example.com",
          tenant_id: "private-tenant",
          enrollment_id: "private-enrollment",
        })],
    }),
  };
  const service = new CertificateService(db as never, { record: async () => undefined } as never);

  const result = await service.verify("CITIS-2026-ABC1234567");

  assert.equal(result.valid, true);
  assert.equal(result.learner_name, "Learner One");
  assert.equal(result.institution_name, "CITIS Academy");
  assert.equal("tenant_id" in result, false);
  assert.equal("learner_email" in result, false);
  assert.deepEqual(await service.verify("unknown-number"), { valid: false });
});

test("certificate reads cannot cross learner scope", async () => {
  const db = { query: async () => ({ rows: [certificateRow({ learner_id: "another-learner" })] }) };
  const service = new CertificateService(db as never, { record: async () => undefined } as never);

  await assert.rejects(service.get("certificate-1", learner), NotFoundException);
});

test("certificate renderer escapes dynamic values in the downloadable document", () => {
  const svg = renderCertificateSvg({
    learnerName: "<Learner>",
    courseTitle: "Course & Practice",
    courseCode: "DS-101",
    institutionName: "Academy",
    certificateNumber: "CITIS-2026-ABC",
    issueDate: "31 August 2026",
    verificationId: "verify-token",
  });

  assert.match(svg, /&lt;Learner&gt;/);
  assert.match(svg, /Course &amp; Practice/);
  assert.doesNotMatch(svg, /<Learner>/);
});