import assert from "node:assert/strict";
import test from "node:test";
import type { NextFunction, Request, Response } from "express";
import { AuditService } from "./audit.service";
import { requestContextMiddleware, type ContextRequest } from "./request-context";
import { successResponse } from "./response";

const validRequestId = "123e4567-e89b-42d3-a456-426614174000";
const uuidV4Pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function runMiddleware(incomingId?: string) {
  const request = {
    header: (name: string) => name.toLowerCase() === "x-request-id" ? incomingId : name.toLowerCase() === "user-agent" ? "test-agent" : undefined,
    ip: "127.0.0.1",
  } as unknown as Request;
  const headers: Record<string, string> = {};
  let nextCalls = 0;
  const response = { setHeader: (name: string, value: string) => { headers[name] = value; } } as unknown as Response;
  requestContextMiddleware(request, response, (() => { nextCalls += 1; }) as NextFunction);
  return { request: request as ContextRequest, headers, nextCalls };
}

test("request middleware accepts and propagates a trimmed UUID-v4 for audit correlation", async () => {
  const { request, headers, nextCalls } = runMiddleware(` ${validRequestId} `);
  assert.equal(request.context.requestId, validRequestId);
  assert.equal(headers["X-Request-ID"], validRequestId);
  assert.equal(nextCalls, 1);
  assert.equal(successResponse({ ok: true }, request).meta.requestId, validRequestId);

  let insertedValues: unknown[] | undefined;
  const audit = new AuditService({
    query: async (_sql: string, values: unknown[]) => { insertedValues = values; },
  } as never);
  await audit.record({
    tenantId: "tenant-id",
    requestId: request.context.requestId,
    module: "test",
    resource: "test",
    action: "TEST",
  });
  assert.equal(insertedValues?.[4], headers["X-Request-ID"]);
});

test("request middleware replaces malformed, blank, and non-v4 request IDs", () => {
  const invalidIds = [
    "not-a-uuid",
    "",
    "123e4567-e89b-12d3-a456-426614174000",
    "123e4567-e89b-72d3-a456-426614174000",
    "123e4567-e89b-42d3-7456-426614174000",
  ];
  for (const incomingId of invalidIds) {
    const { request, headers, nextCalls } = runMiddleware(incomingId);
    assert.match(request.context.requestId, uuidV4Pattern);
    assert.equal(headers["X-Request-ID"], request.context.requestId);
    assert.equal(nextCalls, 1);
  }

  const missing = runMiddleware();
  assert.match(missing.request.context.requestId, uuidV4Pattern);
  assert.equal(missing.headers["X-Request-ID"], missing.request.context.requestId);
  assert.notEqual(missing.request.context.requestId, "not-a-uuid");
});