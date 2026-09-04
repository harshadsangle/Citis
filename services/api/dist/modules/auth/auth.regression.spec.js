"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const node_test_1 = __importDefault(require("node:test"));
const API_ORIGIN = (process.env.LMS_AUTH_REGRESSION_API_ORIGIN || "http://127.0.0.1:4000/api/v1").replace(/\/$/, "");
const STUDENT_PORTAL_ORIGIN = (process.env.LMS_AUTH_REGRESSION_PORTAL_ORIGIN || "http://127.0.0.1:4103").replace(/\/$/, "");
const DEMO_LEARNER_EMAIL = "learner.demo@citis.in";
const DEMO_LEARNER_PASSWORD = process.env.DEMO_LEARNER_PASSWORD;
const DEMO_TENANT_ID = "00000000-0000-0000-0000-000000000001";
if (!DEMO_LEARNER_PASSWORD) {
    throw new Error("DEMO_LEARNER_PASSWORD is required to run the learner auth regression test.");
}
function sessionCookie(response) {
    const setCookie = response.headers.get("set-cookie") || "";
    const match = setCookie.match(/(?:^|,\s*)citis_session=([^;]+)/);
    return match ? `citis_session=${match[1]}` : "";
}
async function apiRequest(path, init = {}, cookie = "") {
    return fetch(`${API_ORIGIN}/${path.replace(/^\//, "")}`, {
        ...init,
        headers: {
            Accept: "application/json",
            ...(cookie ? { Cookie: cookie } : {}),
            ...init.headers,
        },
    });
}
async function json(response) {
    return response.json();
}
(0, node_test_1.default)("demo learner can sign in and use the authenticated portal bootstrap flow", async (t) => {
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
    strict_1.default.equal(login.status, 200, "the documented demo learner credentials must remain valid");
    cookie = sessionCookie(login);
    strict_1.default.match(cookie, /^citis_session=.+$/, "a successful login must issue the session cookie used by the portals");
    const loginBody = await json(login);
    strict_1.default.equal(loginBody.success, true);
    strict_1.default.ok(loginBody.data?.expiresAt, "the session response must include an expiry");
    const me = await apiRequest("/auth/me", {}, cookie);
    strict_1.default.equal(me.status, 200);
    const principal = await json(me);
    strict_1.default.equal(principal.success, true);
    strict_1.default.equal(principal.data?.email, DEMO_LEARNER_EMAIL);
    strict_1.default.equal(principal.data?.tenantId, DEMO_TENANT_ID);
    strict_1.default.ok(principal.data?.roles.some((role) => role.code === "STUDENT"), "the session must resolve to an active learner role");
    const invalidLogin = await apiRequest("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: DEMO_LEARNER_EMAIL, password: "WrongPassword123!" }),
    });
    strict_1.default.equal(invalidLogin.status, 401);
    const portalEntry = await fetch(`${STUDENT_PORTAL_ORIGIN}/`, {
        redirect: "manual",
        headers: { Accept: "text/html", Cookie: cookie },
    });
    strict_1.default.equal(portalEntry.status, 200, "the learner portal must accept the authenticated session");
    strict_1.default.match(await portalEntry.text(), /CITIS Student Portal/, "the learner portal entry page must render");
    for (const path of ["progress", "assignments", "assessments", "assessment-history", "certificates"]) {
        const response = await apiRequest(`/${path}`, {}, cookie);
        strict_1.default.equal(response.status, 200, `the learner bootstrap request /${path} must remain authenticated`);
        const body = await json(response);
        strict_1.default.equal(body.success, true, `the learner bootstrap request /${path} must return a success response`);
    }
});
//# sourceMappingURL=auth.regression.spec.js.map