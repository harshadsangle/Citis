# LMS security & reliability bug fix handbook

**Audience:** Ayush, Sneha, and other interns working on `harshadsangle/Citis`  
**Scope:** Nest API (`services/api`), SQL migrations (`packages/database/migrations/`), Next.js portals (`apps/*`), shared marketing UI (`components/marketing/`).  
**Goal:** Every item below must be **reproduced (or disproved)**, **fixed if still broken**, **covered by a test where practical**, and **verified after deploy**.

---

## Before you start

### Repos and runtime

| Piece | Location |
| --- | --- |
| API | `services/api` — prefix `api/v1` |
| Schema | `packages/database/migrations/*.sql` — never DDL at API startup |
| Admin portal | `apps/institution-admin` |
| Teacher portal | `apps/teacher-portal` |
| Student portal | `apps/student-portal` |
| Production API (today) | `https://api.citisinfotech.in/api/v1` |
| Database | Supabase Postgres via `DATABASE_URL` on the **API host** (not Vercel) |

### Local setup

```bash
cd /path/to/Citis
npm install
# API env (see docs/development/local-development.md)
cp .env.example services/api/.env.local   # then set DATABASE_URL

npm run test --workspace @citis/api
python3 scripts/run-migrations.py          # applies pending migrations including 032
```

### Definition of done (per bug)

1. **Repro steps** documented in your PR (or “not reproducible on `main` after commit X” with evidence).
2. **Code fix** on `main` (minimal diff, match existing style).
3. **Test** — add or extend `*.spec.ts` under `services/api/src` where the project already uses `node:test`.
4. **Manual check** on staging or production API after deploy.
5. **Migration** applied on Supabase if the fix includes SQL (coordinate with whoever owns `api.citisinfotech.in`).

### Status legend in this doc

- **IMPLEMENTED** — fix is already in the codebase on `main` (post-merge); your job is verify + deploy + tests.
- **PARTIAL** — mitigation in code; follow-up called out.
- **TODO** — confirm on latest `main`; implement if missing.

> **Note:** A large batch of fixes was merged toward `main` in one pass. Treat **IMPLEMENTED** as “read the cited files first”—do not re-implement blindly; **prove** with tests and manual checks.

---

## Bug index (quick reference)

| # | Title | Severity | Status |
| --- | --- | --- | --- |
| 1 | Tenant staff assign platform roles | Critical | IMPLEMENTED |
| 2 | OTP race (concurrent verify) | Critical | IMPLEMENTED |
| 3 | Certificate approval issues directly | High | IMPLEMENTED |
| 4 | Partial refunds blocked by DB index | Critical | IMPLEMENTED (+ migration 032) |
| 5 | Instructors access unassigned course resources | Critical | IMPLEMENTED |
| 6 | SCORM served as executable on API origin | Critical | PARTIAL |
| 7 | Razorpay duplicate/orphan orders | High | IMPLEMENTED |
| 8 | Failed webhooks permanently stuck | High | IMPLEMENTED |
| 9 | Successful refunds recorded as failed | High | IMPLEMENTED |
| 10 | Late `payment.failed` downgrades refunded | High | IMPLEMENTED |
| 11 | OTP failure tracking not tenant-isolated | High | IMPLEMENTED |
| 12 | CSV export formula injection | Medium | IMPLEMENTED |
| 13 | CSV parser unclosed quotes | Medium | IMPLEMENTED |
| 14 | Invalid video Range returns full file | Medium | IMPLEMENTED |
| 15 | CORS blocks intended origins | High | IMPLEMENTED |
| 16 | API health endpoint not working | Medium | IMPLEMENTED |
| 17 | OTP request throttling not tenant-isolated | High | IMPLEMENTED |
| 18 | Tenant role managers assign platform permissions | Critical | IMPLEMENTED |
| 19 | Duplicate role-scope records | Medium | IMPLEMENTED |
| 20 | Concurrent idempotency key payment failure | High | IMPLEMENTED |
| 21 | Razorpay requests no timeout | Medium | IMPLEMENTED |
| 22 | BigInt money as JavaScript Number | High | IMPLEMENTED |
| 23 | Refund amounts not validated | High | IMPLEMENTED |
| 24 | Portals treat API outage as logout | Medium | IMPLEMENTED |
| 25 | Webhook payment/refund audit gaps | Medium | IMPLEMENTED |
| 26 | Resource URL/file cannot be cleared | Medium | IMPLEMENTED |
| 27 | Form validation errors not accessible | Medium | IMPLEMENTED |
| 28 | Reset-password errors not announced (a11y) | Low | IMPLEMENTED |
| 29 | Client request IDs affect audit correlation | Medium | IMPLEMENTED |
| 30 | Production logs expose full stack traces | Medium | IMPLEMENTED |

---

## 1. Tenant staff can assign platform roles (privilege escalation)

**Severity:** Critical  
**Status:** IMPLEMENTED  

### What it means

An **institution administrator** (tenant-scoped user) could call the user role assignment API and attach **platform** roles such as `CITIS_ADMIN`, `CITIS_SUPER_ADMIN`, or `CITIS_PLATFORM_SUPPORT`. Those roles are meant for the platform tenant only.

### Impact

Full cross-tenant or platform-wide control: user management, payments, certificates, audit bypass.

### How to reproduce

1. Log in as `INSTITUTION_ADMINISTRATOR` (not platform admin).
2. `POST /api/v1/users/:userId/roles` with `roleId` of a platform role in the same tenant (if such a role row exists).
3. **Before fix:** 201/200 and assignment created.  
4. **After fix:** `403 Forbidden` with message that platform roles require platform administrators.

### Root cause

`UsersService.assignRole` validated institution/campus for platform roles but did **not** forbid non-platform actors from assigning platform role codes.

### Fix (implemented)

**File:** `services/api/src/modules/users/users.service.ts`

- After resolving the role, if `platformRole && scopedToActor` (actor is not platform user), throw `ForbiddenException`.
- Platform roles: `CITIS_ADMIN`, `CITIS_SUPER_ADMIN`, `CITIS_PLATFORM_SUPPORT`.

### Your tasks

- Add unit test in `users.service.spec.ts`: institution admin assigning `CITIS_ADMIN` → `ForbiddenException`.
- Confirm platform roles only exist on platform tenant in DB (migration seed); tenant DB copies should not expose those codes to tenant admins.

---

## 2. OTP race condition — same OTP usable concurrently

**Severity:** Critical  
**Status:** IMPLEMENTED  

### What it means

Two parallel `POST /auth/otp/verify` requests with the same valid code could both pass: first SELECT sees `consumed_at IS NULL`, both UPDATE before either commits.

### Impact

Session hijack / duplicate logins / rate-limit bypass.

### How to reproduce

Use two terminals or `curl` in parallel against the same mobile + code within the validity window. **Before fix:** both may return `success: true`. **After fix:** only one succeeds.

### Root cause

`AuthService.verifyOtp` used `SELECT … LIMIT 1` then separate `UPDATE consumed_at`.

### Fix (implemented)

**File:** `services/api/src/modules/auth/auth.service.ts`

- Single statement: `WITH candidate AS (SELECT … FOR UPDATE OF c SKIP LOCKED) UPDATE auth_challenges SET consumed_at = now() … RETURNING user_id`.

### Your tasks

- Add integration-style test with mocked DB or document manual parallel `curl` procedure in PR.
- Ensure `SKIP LOCKED` is acceptable on your Postgres version (Supabase: yes).

---

## 3. Certificate approval directly issues the certificate

**Severity:** High (workflow / compliance)  
**Status:** IMPLEMENTED  

### What it means

Product expectation: **Approve** → status `APPROVED`; **Issue** → status `ISSUED`. Code had `approve()` setting `ISSUED` and writing issue timestamps in one step.

### Impact

Audit/compliance gap; admin UI “issue” step meaningless; `issue()` endpoint only for `APPROVED` rows.

### How to reproduce

1. Create/eligible certificate in `ELIGIBLE_FOR_REVIEW`.
2. `POST` approve endpoint as CITIS admin.
3. **Before fix:** status `ISSUED` immediately. **After fix:** status `APPROVED`; call issue endpoint to reach `ISSUED`.

### Fix (implemented)

**File:** `services/api/src/modules/lms/certificate.service.ts` — `approve()` sets `APPROVED` only; removed immediate `issue_date` / `issued_at` / `ISSUE` audit from approve.

**Tests:** `certificate.service.spec.ts` updated to expect `APPROVED` and audit action `APPROVE` only.

### Your tasks

- Update any admin UI copy that assumed approve = issued (`apps/institution-admin`, `AdminInsights.tsx`).
- Run certificate regression tests.

---

## 4. Partial refunds blocked by database constraint

**Severity:** Critical (money)  
**Status:** IMPLEMENTED — **requires migration 032 on Supabase**

### What it means

Index `lms_refunds_payment_pending_key` was unique on `(payment_id) WHERE status IN ('PENDING', 'PROCESSED')`. That allows only **one** processed refund row per payment — **partial refunds impossible**.

### Impact

Second partial refund fails at INSERT; support must refund manually outside the app.

### How to reproduce

1. Capture a payment for amount 10000 paise.
2. Refund 3000 → success.
3. Refund 2000 again → **DB unique violation** before fix.

### Fix (implemented)

**Migration:** `packages/database/migrations/032_lms_refund_partial_index.sql`

- Drop old index.
- Create `UNIQUE (payment_id) WHERE status = 'PENDING'` only.

### Your tasks

```bash
python3 scripts/run-migrations.py
```

- Verify on Supabase: `\d lms_refunds` / index list in SQL editor.
- Test two partial refunds + final full refund updates payment to `REFUNDED`.

---

## 5. Instructors can access resources from unassigned courses

**Severity:** Critical  
**Status:** IMPLEMENTED  

### What it means

Instructors with `lms.learning_resource.view` could open files/SCORM/video for any course in their institution scope, not only courses where they have an active `lms_instructor_assignments` row.

### Impact

Leak of paid/proprietary content across courses.

### How to reproduce

1. Log in as instructor assigned to **Course A** only.
2. `GET /api/v1/learning-resources/:id/file` for resource in **Course B** (same institution).
3. **Before fix:** 200 + stream. **After fix:** `404` (read path uses `assertAssignedTeacherRead`).

### Fix (implemented)

**File:** `services/api/src/modules/lms/lms.service.ts` — `resourceFor()` calls `assertAssignedTeacherRead()` for instructor-only users (same pattern as list/read elsewhere).

### Your tasks

- Extend `lms.service.spec.ts` if mocks exist for instructor + wrong course.
- Manual test on teacher portal resource links.

---

## 6. SCORM files served as executable content from API origin

**Severity:** Critical (XSS / session risk)  
**Status:** IMPLEMENTED  

### What it means

SCORM packages contain HTML/JS. Serving them **inline** from the **same origin** as the API (`api.citisinfotech.in`) allows course content to access cookies on that host if sandboxing is weak.

### Impact

Malicious or compromised SCORM package → stolen session cookies, phishing UI.

### Fix (implemented — mitigation)

**Files:**

- `services/api/src/modules/lms/lms.controller.ts` — `serveScormAsset`: headers  
  `Content-Security-Policy: sandbox allow-scripts allow-downloads allow-forms allow-popups`  
  `Cross-Origin-Resource-Policy: same-site`  
  `X-Content-Type-Options: nosniff`

### Recommended follow-up (interns / Ayush)

1. **Dedicated content subdomain** (e.g. `content.citisinfotech.in`) with no auth cookies — serve SCORM only there.
2. Or **signed short-lived URLs** on object storage (S3/Supabase Storage).
3. Document threat model in `docs/architecture/`.

### Your tasks

- Pen-test: upload benign SCORM with script that tries `document.cookie` — confirm empty or sandbox blocks.
- Do **not** remove sandbox headers without architecture sign-off.

---

## 7. Razorpay orders duplicated / orphaned

**Severity:** High  
**Status:** IMPLEMENTED (partial — monitor in prod)

### What it means

- **Duplicate:** double `createOrder` with same idempotency key under race → one fails with DB error instead of returning same order.
- **Orphan:** row in `PENDING` without `razorpay_order_id` after Razorpay API failure.

### Fix (implemented)

**File:** `services/api/src/modules/payments/payments.service.ts`

- `createOrder`: on unique violation `23505`, re-SELECT existing row by idempotency key.
- Failed Razorpay create still marks payment `FAILED` (existing).

### Your tasks

- SQL report: `SELECT * FROM lms_payments WHERE status = 'PENDING' AND razorpay_order_id IS NULL AND created_at < now() - interval '1 hour'`.
- Add cron or admin script to mark stale PENDING as failed (optional product decision).

---

## 8. Failed webhooks can become permanently stuck

**Severity:** High  
**Status:** IMPLEMENTED  

### What it means

`lms_payment_events` row inserted with `processing_status = FAILED` and unique `provider_event_id` → Razorpay retries never reprocessed.

### Fix (implemented)

**File:** `payments.service.ts` — `handleWebhook` catch block **deletes** the event row on processing failure so the next delivery can insert again.

### Your tasks

- Simulate handler throw after insert; confirm retry succeeds.
- Consider idempotent handler instead of delete (design note in PR).

---

## 9. Successful refunds recorded locally as failed

**Severity:** High  
**Status:** IMPLEMENTED  

### What it means

`refund.failed` webhook could mark a refund `FAILED` even after `PROCESSED`. Initiate path could mark failed if Razorpay succeeded but DB update lagged.

### Fix (implemented)

- `refund.failed` updates only `WHERE status = 'PENDING'`.
- `markRefundProcessed` idempotent for `PROCESSED`.

### Your tasks

- Order: initiate refund → webhook `refund.processed` → late `refund.failed`; confirm status stays `PROCESSED`.

---

## 10. Late `payment.failed` webhooks downgrade refunded payments

**Severity:** High  
**Status:** IMPLEMENTED  

### What it means

`payment.failed` set `FAILED` unless status was exactly `CAPTURED`, but **not** excluding `REFUNDED` / `PARTIALLY_REFUNDED`.

### Fix (implemented)

`CASE WHEN status IN ('CAPTURED', 'REFUNDED', 'PARTIALLY_REFUNDED') THEN status ELSE 'FAILED' END`.

### Your tasks

- Replay webhook fixture after full refund; payment status unchanged.

---

## 11. OTP failure tracking not tenant-isolated

**Severity:** High  
**Status:** IMPLEMENTED  

### What it means

On failed verify, `UPDATE auth_challenges SET attempts = attempts + 1 WHERE mobile = $1` affected **all tenants** sharing the same mobile number in challenges table.

### Fix (implemented)

Join `tenants` and filter `t.slug = $tenantSlug` and `c.tenant_id = t.id`.

### Your tasks

- Two tenants, same mobile format in test data; fail OTP on tenant A must not increment attempts on tenant B.

---

## 12. CSV exports vulnerable to spreadsheet formula injection

**Severity:** Medium  
**Status:** IMPLEMENTED  

### What it means

Cells starting with `=`, `+`, `-`, `@` execute as formulas when opened in Excel.

### Fix (implemented)

**Files:**

- `services/api/src/common/csv-cell.ts` — `escapeCsvCell()` prefixes dangerous cells with `'`.
- `services/api/src/modules/lms/report.service.ts` — uses `escapeCsvCell`.

### Your tasks

- Run `report.service.spec.ts` test “neutralize spreadsheet formula injection”.
- Export students report with `institution_name = =1+1`; open in Excel — should show literal text.

---

## 13. CSV parser accepts malformed / unclosed quoted fields

**Severity:** Medium  
**Status:** IMPLEMENTED  

### What it means

`parseCsv` in college import could treat unclosed `"` as valid input → wrong columns / silent data corruption.

### Fix (implemented)

**File:** `college-students/college-students.csv.ts` — throw if `quoted` still true at EOF.  
**File:** `college-students.service.ts` — wrap parse in `BadRequestException`.

### Your tasks

- `college-students.csv.spec.ts` — unclosed quote test.
- Upload bad CSV in institution admin import UI → clear error.

---

## 14. Invalid video Range returns full file

**Severity:** Medium  
**Status:** IMPLEMENTED  

### What it means

Bad `Range` header ignored; server responded `200` with full body (bandwidth leak, wrong caching).

### Fix (implemented)

**File:** `lms.service.ts` — `openManagedFile`: invalid range → `400`; unsatisfiable → `416 Requested Range Not Satisfiable`.

### Your tasks

`curl -H "Range: bytes=999999-" -I .../learning-resources/:id/file` → 416 when file smaller.

---

## 15. CORS configuration blocks intended origins

**Severity:** High  
**Status:** IMPLEMENTED  

### What it means

`WEB_ORIGIN` entries with trailing slashes or slight mismatch caused browser CORS failures while curl worked.

### Fix (implemented)

**File:** `services/api/src/main.ts` — `normalizeOrigin()` (trim, strip trailing `/`); compare normalized Origin header.

### Your tasks

- Set `WEB_ORIGIN` on API host to exact browser origins (no trailing slash).
- From `lms.citisinfotech.in`, login and API calls must not show CORS errors in DevTools.

---

## 16. API health endpoint not working

**Severity:** Medium  
**Status:** IMPLEMENTED  

### What it means

No reliable health check for uptime monitors.

### Fix (implemented)

- `GET /health` on Express (simple JSON) in `main.ts`.
- `GET /api/v1/health` via `HealthController` + DB `SELECT 1`.

**Files:** `services/api/src/modules/health/*`, `app.module.ts`.

### Your tasks

```bash
curl -s https://api.citisinfotech.in/health
curl -s https://api.citisinfotech.in/api/v1/health
```

Wire GlobeHost / monitoring to these URLs.

---

## 17. OTP request throttling not tenant-isolated

**Severity:** High  
**Status:** IMPLEMENTED  

### What it means

Rate limit keys used `ip:mobile` without tenant → tenant A could exhaust limits for tenant B on shared IP (or vice versa).

### Fix (implemented)

**File:** `auth.service.ts` — `requestOtp` / `verifyOtp` use `${tenantSlug}:${mobile}` and `${tenantSlug}:${ip}` for limiter keys.

### Your tasks

- Load-test two tenant slugs from same IP; limits independent.

---

## 18. Tenant role managers can assign unrestricted permissions

**Severity:** Critical  
**Status:** IMPLEMENTED  

### What it means

`RbacService.assignPermissions` allowed any permission IDs, including `platform.*`, `identity.*`, `audit.*` prefixes for tenant admins.

### Fix (implemented)

**File:** `rbac.service.ts`

- Reject assigning platform role codes to tenant-managed roles.
- Load permission codes; if not `isPlatformUser(actor)` and `isPlatformPermission(code)` → `ForbiddenException`.

**Helpers:** `common/access-scope.ts` — `isPlatformPermission`, `isPlatformUser`.

### Your tasks

- Integration test: tenant admin `PUT` role permissions with `platform.*` → 403.

---

## 19. Duplicate role-scope records possible

**Severity:** Medium  
**Status:** IMPLEMENTED  

### What it means

`INSERT … ON CONFLICT DO NOTHING` with no returned row still returned a **fake** assignment object to clients.

### Fix (implemented)

**File:** `users.service.ts` — if no row from INSERT, SELECT existing assignment or throw `ConflictException`.

### Your tasks

- Double-submit same role assignment; API returns stable idempotent result, no duplicate audit noise.

---

## 20. Concurrent payment requests with same idempotency key can fail

**Severity:** High  
**Status:** IMPLEMENTED  

### What it means

Two parallel `createOrder` with same key: both miss SELECT, one INSERT wins, other gets `23505` → 500 to client.

### Fix (implemented)

Catch `23505`, re-SELECT by idempotency key inside transaction.

### Your tasks

- Parallel curl with same `idempotencyKey`; both return same `id` / order.

---

## 21. Razorpay requests have no timeout

**Severity:** Medium  
**Status:** IMPLEMENTED  

### What it means

Hung `fetch` to Razorpay blocked Node workers indefinitely.

### Fix (implemented)

**File:** `razorpay.client.ts` — `signal: AbortSignal.timeout(RAZORPAY_TIMEOUT_MS || 30000)`.

### Your tasks

- Optional: set `RAZORPAY_TIMEOUT_MS` in API env.
- Simulate slow Razorpay (mock) → `ServiceUnavailableException` within timeout.

---

## 22. BigInt monetary values converted to JavaScript Number

**Severity:** High  
**Status:** IMPLEMENTED  

### What it means

Postgres `bigint` for `amount_minor` passed through `Number()` → precision loss above `2^53-1`.

### Fix (implemented)

**File:** `payments.service.ts` — `amountMinorBigInt` / `amountMinorNumber`; reject if above `MAX_SAFE_INTEGER`.

### Your tasks

- Unit test with large minor amount string (if product allows) → `BadRequestException`.
- Course prices in practice are small; document max safe amount in `docs/api/README.md`.

---

## 23. Refund amounts not properly validated

**Severity:** High  
**Status:** IMPLEMENTED  

### What it means

Non-integer, zero, or over-remaining refunds could be attempted.

### Fix (implemented)

`initiateRefund`: `Number.isInteger(amount)`, `amount > 0`, `amount <= remaining` (using safe minor helpers).

### Your tasks

- API tests: refund 0, refund > remaining, refund negative → 400.

---

## 24. Portals treat API outages as user logout

**Severity:** Medium  
**Status:** IMPLEMENTED  

### What it means

Middleware called `/auth/me`; any non-OK or network error → redirect to `/auth/login`. Users thought they were logged out during API blips.

### Fix (implemented)

**Files:** `apps/institution-admin/middleware.ts`, `apps/teacher-portal/middleware.ts`, `apps/student-portal/middleware.ts`

- `401` → unauthenticated → login redirect.
- `5xx` / network → **503** plain message, no redirect.

### Your tasks

- Stop API locally; reload portal → 503 page, not login.
- Redeploy all three Vercel projects after merge.

---

## 25. Webhook payment/refund changes lack consistent audit records

**Severity:** Medium  
**Status:** IMPLEMENTED  

### What it means

User-initiated payments had audit rows; webhook-driven state changes did not.

### Fix (implemented)

**File:** `payments.service.ts` — `audit.record` on `payment.failed` (when actually failed) and `refund.processed`.

### Your tasks

- After webhook test, query `audit_logs` (or your audit table) for `module = payments`.

---

## 26. Resource URL / file fields cannot be properly cleared

**Severity:** Medium  
**Status:** IMPLEMENTED  

### What it means

`UPDATE … url = COALESCE($5, url)` could not set URL to empty/null when admin removes link.

### Fix (implemented)

**Files:**

- `lms.service.ts` — `updateLearningResource`: if `input.url !== undefined`, set `trim() || null` (same for `filePath`).
- `lms.dto.ts` — `ValidateIf` so `""` is allowed for clear URL on update.

### Your tasks

- PATCH resource with `"url": ""` → DB `NULL`; learner no longer sees external link.

---

## 27. Form validation errors not consistently accessible

**Severity:** Medium  
**Status:** PARTIAL  

### What it means

Screen readers may not hear inline validation errors if elements lack `role="alert"`.

### Fix (implemented — shared forms and portals)

**Files:** `citis-infotech/frontend/components/marketing/InteractiveForms.tsx`, `apps/institution-admin/app/CourseBuilder.tsx`, `apps/institution-admin/app/InstitutionOnboarding.tsx`, `apps/teacher-portal/app/page.tsx`, and `apps/student-portal/app/page.tsx`.

- Login, registration, forgot-password, and reset-password errors are associated with their fields; server errors and success messages use live regions.
- Course Builder validation errors identify and focus the relevant field; CSV import errors are associated with the file input.
- Teacher and student portal errors/statuses are announced, with teacher validation linked to and focused on the affected field.

### Verification

- API tests and production builds/type checks pass for the public frontend and all three portals.
- Manual VoiceOver/NVDA verification remains recommended.

---

## 28. Reset-password errors may not be announced to screen readers

**Severity:** Low  
**Status:** IMPLEMENTED  

### What it means

Server error on reset password was plain text without live region.

### Fix (implemented)

**File:** `citis-infotech/frontend/components/marketing/InteractiveForms.tsx` — `ResetPasswordForm` server error: `role="alert"` + `aria-live="assertive"`, with field errors linked through `aria-describedby`.

### Your tasks

- VoiceOver / NVDA manual test on `citisinfotech.in/auth/reset-password`.
- The nested `citis-infotech/frontend` app is the active public frontend; keep its shared form component as the source of truth.

---

## 29. Client-supplied request IDs affect audit correlation

**Severity:** Medium  
**Status:** IMPLEMENTED  

### What it means

Any `X-Request-ID` header was trusted → clients could collide with or spoof audit `requestId`.

### Fix (implemented)

**File:** `common/request-context.ts` — only accept header if it matches UUID v4 pattern; else generate `randomUUID()`.

**Tests:** `services/api/src/common/request-context.spec.ts` verifies normalized valid UUID-v4 propagation, invalid ID replacement, response metadata, and audit correlation.

### Your tasks

- Send `X-Request-ID: not-a-uuid` → response `X-Request-ID` is new UUID.
- Send valid UUID → echoed in response and audit.

---

## 30. Production logs expose full exception stack traces

**Severity:** Medium  
**Status:** IMPLEMENTED  

### What it means

`ApiExceptionFilter` logged full `exception.stack` to stdout (log aggregators, Replit logs) — information disclosure.

### Fix (implemented)

**File:** `common/errors.filter.ts` — production logs retain request ID, status, and exception name while omitting raw messages and stacks; development logs retain message and stack diagnostics.

**Tests:** `services/api/src/common/errors.filter.spec.ts` covers production redaction, development diagnostics, and client-error exclusion.

### Your tasks

- Trigger 500 in staging; confirm logs have no file paths / stack.
- API JSON responses must still **not** include stack (already generic message).

---

## Deployment checklist (after all fixes on `main`)

1. **Merge** PR to `main`; tag release if your team uses tags.
2. **Supabase:** `python3 scripts/run-migrations.py` (must include **032**).
3. **API host** (`api.citisinfotech.in`):
   - Pull/build Nest API.
   - Env: `DATABASE_URL`, `WEB_ORIGIN`, `NODE_ENV=production`, Razorpay secrets.
   - Restart process (PM2/systemd/Docker).
4. **Vercel:** redeploy institution-admin, teacher-portal, student-portal (middleware).
5. **Smoke tests:**
   - Health endpoints
   - Admin login
   - Instructor file access on wrong course → 404
   - Certificate approve → `APPROVED`, then issue → `ISSUED`
   - Partial refund twice on same payment
6. **Security:** rotate any credentials that ever appeared in chat/logs; restrict Supabase `DATABASE_URL` to API hosts only.

---

## Who owns what

| Area | Suggested owner |
| --- | --- |
| API + migrations + Razorpay | Ayush |
| Portals + a11y + admin UI workflow | Sneha |
| Supabase migration run + DNS/API deploy | Whoever has VPS / `api.citisinfotech.in` SSH |
| Vercel env (no `DATABASE_URL` on frontend) | Sneha / Amogh |

---

## Questions / escalation

- **DB migration failed:** paste `schema_migrations` row and error; do not run destructive SQL without review.
- **SCORM still flagged by security audit:** escalate separate content domain — not a one-line fix.
- **Replit API** (`citis.replit.app`): separate deploy path; same code, Replit Secrets + Republish when credits available.

*Last updated: handbook aligned to post-merge `main` security batch. Update this file when you close each bug with PR link and test evidence.*
