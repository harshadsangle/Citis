import assert from "node:assert/strict";
import test, { afterEach } from "node:test";
import { NextRequest } from "next/server";
import { middleware as adminMiddleware, config as adminConfig } from "./institution-admin/middleware";
import { middleware as teacherMiddleware, config as teacherConfig } from "./teacher-portal/middleware";
import { middleware as studentMiddleware, config as studentConfig } from "./student-portal/middleware";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function request(path = "/") {
  return new NextRequest(`http://localhost${path}`, {
    headers: { cookie: "citis_session=test-session" },
  });
}

function authResponse(roles: unknown, status = 200) {
  return new Response(JSON.stringify({ data: { roles } }), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function setAuthResponse(roles: unknown, status = 200) {
  globalThis.fetch = (async () => authResponse(roles, status)) as typeof fetch;
}

function redirectPath(response: Response) {
  return new URL(response.headers.get("location") || "").pathname;
}

test("portal middleware protects nested routes while leaving auth routes outside the matcher", () => {
  for (const config of [adminConfig, teacherConfig, studentConfig]) {
    assert.ok(config.matcher[0].includes(".*"));
    assert.ok(config.matcher[0].includes("auth"));
  }
});

test("authorized admin, instructor, and student roles can enter their intended portals", async () => {
  setAuthResponse([{ code: "INSTITUTION_ADMINISTRATOR", name: "Administrator" }]);
  assert.equal((await adminMiddleware(request("/courses/course-1"))).status, 200);

  setAuthResponse([{ code: "TEACHER", name: "Teacher" }]);
  assert.equal((await teacherMiddleware(request("/assignments/assignment-1"))).status, 200);

  setAuthResponse([{ code: "STUDENT", name: "Student" }]);
  assert.equal((await studentMiddleware(request("/courses/course-1/assignments"))).status, 200);
});

test("wrong roles are redirected away from protected portal apps", async () => {
  setAuthResponse([{ code: "STUDENT", name: "Student" }]);
  assert.equal(redirectPath(await adminMiddleware(request("/admin"))), "/lms");

  setAuthResponse([{ code: "TEACHER", name: "Teacher" }]);
  assert.equal(redirectPath(await studentMiddleware(request("/student"))), "/lms");

  setAuthResponse([{ code: "UNKNOWN", name: "Unknown" }]);
  assert.equal(redirectPath(await teacherMiddleware(request("/instructor"))), "/auth/login");
});

test("auth service errors, timeouts, and malformed responses fail closed", async () => {
  globalThis.fetch = (async () => {
    throw new Error("auth service unavailable");
  }) as typeof fetch;
  assert.equal(redirectPath(await studentMiddleware(request("/dashboard"))), "/auth/login");

  setAuthResponse({ code: "STUDENT" });
  assert.equal(redirectPath(await adminMiddleware(request("/dashboard"))), "/auth/login");

  globalThis.fetch = (async (_input, init) => {
    assert.ok(init?.signal, "auth/me must receive an abort signal");
    return new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(new Error("auth/me timeout")));
    });
  }) as typeof fetch;
  const timeoutResult = await Promise.race([
    studentMiddleware(request("/dashboard")),
    new Promise<"timeout">((resolve) => setTimeout(() => resolve("timeout"), 3500)),
  ]);
  assert.notEqual(timeoutResult, "timeout", "auth/me middleware call must not hang indefinitely");
  assert.equal(redirectPath(timeoutResult as Response), "/auth/login");
});