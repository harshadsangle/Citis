import assert from "node:assert/strict";
import test from "node:test";
import { BadRequestException } from "@nestjs/common";
import type { ArgumentsHost } from "@nestjs/common";
import { ApiExceptionFilter } from "./errors.filter";

function createHost(requestId: string) {
  const response = {
    statusCode: 0,
    payload: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.payload = payload;
      return this;
    },
  };
  const request = { context: { requestId } };
  const host = {
    switchToHttp: () => ({
      getResponse: () => response,
      getRequest: () => request,
    }),
  } as unknown as ArgumentsHost;
  return { host, response };
}

test("production exception logging is structured and excludes messages, stacks, and paths", () => {
  const originalEnvironment = process.env.NODE_ENV;
  const originalConsoleError = console.error;
  const logs: string[] = [];
  process.env.NODE_ENV = "production";
  console.error = (...values: unknown[]) => { logs.push(values.join(" ")); };
  try {
    const { host, response } = createHost("123e4567-e89b-42d3-a456-426614174000");
    const exception = new Error("failed in /srv/app/private/data.ts");
    exception.stack = "Error: failed in /srv/app/private/data.ts\n    at /srv/app/private/data.ts:12:4";
    new ApiExceptionFilter().catch(exception, host);

    assert.equal(response.statusCode, 500);
    assert.deepEqual((response.payload as { meta: { requestId: string } }).meta, {
      requestId: "123e4567-e89b-42d3-a456-426614174000",
    });
    assert.equal(logs.length, 1);
    const record = JSON.parse(logs[0]) as Record<string, unknown>;
    assert.equal(record.event, "api_exception");
    assert.equal(record.requestId, "123e4567-e89b-42d3-a456-426614174000");
    assert.equal(record.statusCode, 500);
    assert.equal(record.exceptionName, "Error");
    assert.equal("exceptionMessage" in record, false);
    assert.equal("stack" in record, false);
    assert.equal(logs[0].includes("/srv/app/private"), false);
  } finally {
    console.error = originalConsoleError;
    if (originalEnvironment === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalEnvironment;
  }
});

test("development exception logging retains the original stack diagnostics", () => {
  const originalEnvironment = process.env.NODE_ENV;
  const originalConsoleError = console.error;
  const logs: string[] = [];
  process.env.NODE_ENV = "development";
  console.error = (...values: unknown[]) => { logs.push(values.join(" ")); };
  try {
    const { host } = createHost("request-dev");
    const exception = new Error("development failure");
    exception.stack = "Error: development failure\n    at /workspace/api/test.ts:5:2";
    new ApiExceptionFilter().catch(exception, host);

    const record = JSON.parse(logs[0]) as Record<string, unknown>;
    assert.equal(record.exceptionMessage, "development failure");
    assert.equal(record.stack, exception.stack);
  } finally {
    console.error = originalConsoleError;
    if (originalEnvironment === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalEnvironment;
  }
});

test("client errors are not logged as server exceptions", () => {
  const originalConsoleError = console.error;
  const logs: string[] = [];
  console.error = (...values: unknown[]) => { logs.push(values.join(" ")); };
  try {
    const { host, response } = createHost("request-client-error");
    new ApiExceptionFilter().catch(new BadRequestException("Invalid input"), host);
    assert.equal(response.statusCode, 400);
    assert.equal(logs.length, 0);
  } finally {
    console.error = originalConsoleError;
  }
});