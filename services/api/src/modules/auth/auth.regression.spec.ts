import assert from "node:assert/strict";
import test from "node:test";

const API_ORIGIN = (process.env.LMS_AUTH_REGRESSION_API_ORIGIN || "http://127.0.0.1:4000/api/v1").replace(/\/$/, "");
const STUDENT_PORTAL_ORIGIN = (process.env.LMS_AUTH_REGRESSION_PORTAL_ORIGIN || "http://127.0.0.1:4103").replace(/\/$/, "");
const DEMO_LEARNER_EMAIL = "learner.demo@citis.in";
const DEMO_LEARNER_PASSWORD = process.env.DEMO_LEARNER_PASSWORD;
const DEMO_TENANT_ID = "00000000-0000-0000-0000-000000000001";

if (!DEMO_LEARNER_PASSWORD) {
  throw new Error("DEMO_LEARNER_PASSWORD is required to run the learner auth regression test.");
}

type ApiBody<T = unknown> = {
  success?: boolean;
  data?: T;
  error?: { message?: string };
};

function sessionCookie(response: Response) {
  const setCookie = response.headers.get("set-cookie") || "";
  const match = setCookie.match(/(?:^|,\s*)citis_session=([^;]+)/);
  return match ? `citis_session=${match[1]}` : "";
}

async function apiRequest(path: string, init: RequestInit = {}, cookie = "") {
  return fetch(`${API_ORIGIN}/${path.replace(/^\//, "")}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
      ...init.headers,
    },
  });
}

async function json<T>(response: Response) {
  return response.json() as Promise<ApiBody<T>>;
}

test("demo learner can sign in and use the authenticated portal bootstrap flow", async (t) => {
  let cookie = "";
  t.after(async () => {
    if (cookie) {
      await apiRequest("/auth/logout", { method: "POST" }, cookie).catch(() => undefined);
    }
  });

  const login = await apiRequest("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: DEMO_LEARNER_EMAIL, password: DEMO_LEARNER_PASSWORD }),
  });
  assert.equal(login.status, 200, "the documented demo learner credentials must remain valid");
  cookie = sessionCookie(login);
  assert.match(cookie, /^citis_session=.+$/, "a successful login must issue the session cookie used by the portals");
  const loginBody = await json<{ expiresAt: string }>(login);
  assert.equal(loginBody.success, true);
  assert.ok(loginBody.data?.expiresAt, "the session response must include an expiry");

  const me = await apiRequest("/auth/me", {}, cookie);
  assert.equal(me.status, 200);
  const principal = await json<{
    id: string;
    tenantId: string;
    email: string;
    roles: Array<{ code: string; name: string }>;
  }>(me);
  assert.equal(principal.success, true);
  assert.equal(principal.data?.email, DEMO_LEARNER_EMAIL);
  assert.equal(principal.data?.tenantId, DEMO_TENANT_ID);
  assert.ok(principal.data?.roles.some((role) => role.code === "STUDENT"), "the session must resolve to an active learner role");

  const invalidLogin = await apiRequest("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: DEMO_LEARNER_EMAIL, password: "WrongPassword123!" }),
  });
  assert.equal(invalidLogin.status, 401);

  const portalEntry = await fetch(`${STUDENT_PORTAL_ORIGIN}/`, {
    redirect: "manual",
    headers: { Accept: "text/html", Cookie: cookie },
  });
  assert.equal(portalEntry.status, 200, "the learner portal must accept the authenticated session");
  assert.match(await portalEntry.text(), /CITIS Student Portal/, "the learner portal entry page must render");

  for (const path of ["progress", "assignments", "assessments", "assessment-history", "certificates"]) {
    const response = await apiRequest(`/${path}`, {}, cookie);
    assert.equal(response.status, 200, `the learner bootstrap request /${path} must remain authenticated`);
    const body = await json(response);
    assert.equal(body.success, true, `the learner bootstrap request /${path} must return a success response`);
  }
});