import assert from "node:assert/strict";
import test from "node:test";
import { NotFoundException } from "@nestjs/common";
import { validate } from "class-validator";
import type { AuthenticatedUser, ContextRequest } from "../../common/request-context";
import { CreateInstitutionDto } from "./institution.dto";
import { InstitutionsService } from "./institutions.service";

const platformAdmin: AuthenticatedUser = {
  id: "admin-1",
  tenantId: "tenant-1",
  email: "admin@example.com",
  firstName: "CITIS",
  lastName: "Admin",
  roles: [{ code: "CITIS_ADMIN", name: "CITIS Admin" }],
  permissions: ["platform.institution.create"],
  scopes: [],
};

function requestFor(user: AuthenticatedUser): ContextRequest {
  return {
    context: {
      requestId: "request-1",
      ipAddress: "127.0.0.1",
      userAgent: "test",
      user,
    },
  } as unknown as ContextRequest;
}

function serviceWithInstitution(status = "ACTIVE") {
  const calls: Array<{ text: string; values: unknown[] }> = [];
  const audits: Array<Record<string, unknown>> = [];
  const institution = {
    id: "institution-1",
    tenant_id: "tenant-1",
    name: "North College",
    slug: "north-college",
    institution_type: "SCHOOL",
    email: "contact@example.edu",
    phone: "+91 12345 67890",
    website: "https://example.edu",
    status,
  };
  const db = {
    query: async (text: string, values: unknown[] = []) => {
      calls.push({ text, values });
      return { rows: [institution] };
    },
  };
  const audit = { record: async (event: Record<string, unknown>) => audits.push(event) };
  return {
    service: new InstitutionsService(db as never, audit as never),
    calls,
    audits,
    institution,
  };
}

test("CITIS Admin can create institutions in each supported status", async () => {
  for (const status of ["ACTIVE", "SUSPENDED", "ARCHIVED"] as const) {
    const { service, calls, audits, institution } = serviceWithInstitution(status);
    const created = await service.create({
      name: "North College",
      email: "contact@example.edu",
      phone: "+91 12345 67890",
      website: "https://example.edu",
      status,
      tenantId: "tenant-1",
    }, requestFor(platformAdmin));

    assert.equal(created.status, status);
    assert.equal(calls.length, 1);
    assert.match(calls[0].text, /website, status, created_by, updated_by/);
    assert.equal(calls[0].values[7], status);
    assert.equal(calls[0].values[8], platformAdmin.id);
    assert.equal(audits[0].action, "CREATE");
    assert.equal((audits[0].newValue as Record<string, unknown>).status, status);
    assert.equal(created.id, institution.id);
  }
});

test("institution creation defaults omitted status to Active", async () => {
  const { service, calls, institution } = serviceWithInstitution();
  const created = await service.create({
    name: "North College",
    tenantId: "tenant-1",
  }, requestFor(platformAdmin));

  assert.equal(calls[0].values[7], "ACTIVE");
  assert.equal(created.status, "ACTIVE");
  assert.equal(institution.status, "ACTIVE");
});

test("institution creation remains unavailable to institution-scoped administrators", async () => {
  const institutionAdmin: AuthenticatedUser = {
    ...platformAdmin,
    roles: [{ code: "INSTITUTION_ADMINISTRATOR", name: "Institution Administrator" }],
    scopes: [{ institutionId: "institution-1", campusId: null }],
  };
  const { service, calls } = serviceWithInstitution();

  await assert.rejects(
    service.create({ name: "North College", tenantId: "tenant-1" }, requestFor(institutionAdmin)),
    NotFoundException,
  );
  assert.equal(calls.length, 0);
});

test("create institution DTO accepts only Active, Suspended, or Archived status", async () => {
  for (const status of ["ACTIVE", "SUSPENDED", "ARCHIVED"]) {
    const dto = Object.assign(new CreateInstitutionDto(), { name: "North College", status });
    assert.deepEqual(await validate(dto), []);
  }

  const invalid = Object.assign(new CreateInstitutionDto(), { name: "North College", status: "DISABLED" });
  const errors = await validate(invalid);
  assert.ok(errors.some((error) => error.property === "status"));
});