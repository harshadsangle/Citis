import assert from "node:assert/strict";
import test from "node:test";
import type { Application, Request, RequestHandler, Response } from "express";
import { registerRootHealthEndpoint } from "./health-route";

test("root health endpoint returns a lightweight successful response", () => {
  let registeredPath = "";
  let handler: RequestHandler | undefined;
  const app = {
    get(path: string, route: RequestHandler) {
      registeredPath = path;
      handler = route;
    },
  } as unknown as Pick<Application, "get">;

  registerRootHealthEndpoint(app);

  let statusCode = 0;
  let body: unknown;
  const response = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(value: unknown) {
      body = value;
      return this;
    },
  } as unknown as Response;
  handler?.({} as Request, response, (() => undefined) as never);

  assert.equal(registeredPath, "/health");
  assert.equal(statusCode, 200);
  assert.deepEqual(body, { status: "ok" });
});