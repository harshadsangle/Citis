import assert from "node:assert/strict";
import test from "node:test";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
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

const admin: AuthenticatedUser = {
  ...learner,
  id: "admin-1",
  roles: [{ code: "CITIS_ADMIN", name: "CITIS Admin" }],
  permissions: ["lms.certificate.approve", "lms.certificate.reject", "lms.certificate.revoke"],
};

const adminRequest = {
  context: { ...request.context, user: admin },
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

test("eligible completion creates one review candidate without issuing a certificate", async () => {
  const audits: Array<Record<string, unknown>> = [];
  const row = certificateRow({ status: "ELIGIBLE_FOR_REVIEW", eligible_at: "2026-08-31T00:00:00.000Z" });
  const db = {
    query: async (text: string) => {
      if (text.includes("ORDER BY e.enrolled_at")) return { rows: [{ enrollment_id: "enrollment-1" }] };
      if (text.includes("CASE WHEN NOT EXISTS")) {
        return { rows: [{
          enrollment_id: "enrollment-1",
          tenant_id: "tenant-1",
          institution_id: "institution-1",
          campus_id: "campus-1",
          course_id: "course-1",
          learner_id: "learner-1",
          completed_at: "2026-08-31T00:00:00.000Z",
          eligible: true,
        }] };
      }
      if (text.startsWith("INSERT INTO lms_certificates")) return { rows: [{ id: "certificate-1" }] };
      if (text.includes("SELECT cert.id")) return { rows: [row] };
      return { rows: [] };
    },
  };
  const audit = { record: async (input: Record<string, unknown>) => audits.push(input) };
  const service = new CertificateService(db as never, audit as never);

  const first = await service.issueIfEligible("tenant-1", "course-1", "learner-1", request);

  assert.equal(first?.certificate_number, "CITIS-2026-ABC1234567");
  assert.equal(first?.status, "ELIGIBLE_FOR_REVIEW");
  assert.equal(audits.filter((audit) => audit.action === "ELIGIBILITY_CALCULATED").length, 1);
  assert.equal(audits.filter((audit) => audit.action === "ISSUE").length, 0);
  assert.equal(first && "tenant_id" in first, false);
});

test("incomplete eligibility does not attempt certificate insertion", async () => {
  let inserted = false;
  const db = {
    query: async (text: string) => {
      if (text.includes("ORDER BY e.enrolled_at")) return { rows: [] };
      if (text.startsWith("INSERT INTO lms_certificates")) inserted = true;
      return { rows: [] };
    },
  };
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

test("only CITIS Admin can approve an eligible certificate and issuance is audited", async () => {
  const row = certificateRow({ status: "ELIGIBLE_FOR_REVIEW", learner_id: "learner-1" });
  const actions: string[] = [];
  const db = {
    query: async (text: string) => {
      if (text.includes("CASE WHEN NOT EXISTS")) {
        return { rows: [{
          enrollment_id: "enrollment-1",
          tenant_id: "tenant-1",
          institution_id: "institution-1",
          campus_id: "campus-1",
          course_id: "course-1",
          learner_id: "learner-1",
          completed_at: "2026-08-31T00:00:00.000Z",
          eligible: true,
        }] };
      }
      if (text.startsWith("UPDATE lms_certificates")) return { rows: [{ id: "certificate-1" }] };
      return { rows: [row] };
    },
  };
  const audit = { record: async (input: Record<string, unknown>) => actions.push(String(input.action)) };
  const service = new CertificateService(db as never, audit as never);

  const result = await service.approve("certificate-1", { notes: "Reviewed completion evidence." }, adminRequest);

  assert.equal(result.status, "ISSUED");
  assert.deepEqual(actions, ["APPROVE", "ISSUE"]);
});

test("students and instructors cannot approve certificates", async () => {
  const db = { query: async () => ({ rows: [certificateRow({ status: "ELIGIBLE_FOR_REVIEW" })] }) };
  const service = new CertificateService(db as never, { record: async () => undefined } as never);
  const instructor = { ...learner, roles: [{ code: "INSTRUCTOR", name: "Instructor" }] };
  const instructorRequest = { context: { ...request.context, user: instructor } } as unknown as ContextRequest;

  await assert.rejects(service.approve("certificate-1", {}, request), ForbiddenException);
  await assert.rejects(service.approve("certificate-1", {}, instructorRequest), ForbiddenException);
});

test("public verification reports revoked certificates as invalid without private fields", async () => {
  const db = {
    query: async () => ({ rows: [certificateRow({
      status: "REVOKED",
      revocation_reason: "Administrative review",
      learner_email: "private@example.com",
      tenant_id: "private-tenant",
    })] }),
  };
  const service = new CertificateService(db as never, { record: async () => undefined } as never);

  const result = await service.verify("CITIS-2026-ABC1234567");

  assert.equal(result.valid, false);
  assert.equal(result.status, "REVOKED");
  assert.equal("tenant_id" in result, false);
  assert.equal("learner_email" in result, false);
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