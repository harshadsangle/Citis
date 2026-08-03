# REST API

The application API is served at `http://localhost:5000/api/v1`. Health is available at
`GET /health`. Strapi has a separate REST API at `http://localhost:1337/api`.

## Conventions

- JSON responses use `{ "success": true, "message": "...", "data": ... }`.
- Errors use `{ "success": false, "message": "...", "errors": ... }` when validation details
  exist.
- List endpoints accept `page` (default `1`), `limit` (default `10`, maximum `100`), `search`,
  `sort`, and resource-specific filters. Pagination is returned in `meta`.
- Protected endpoints accept `Authorization: Bearer <access-token>` or the HTTP-only
  `accessToken` cookie.
- API-wide rate limiting is 300 requests per 15 minutes. Authentication is limited to 10 failed
  requests per 15 minutes; public writes are limited to 20 requests per hour.

## Authentication

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/auth/register` | Public | Register a guest account |
| POST | `/auth/login` | Public | Sign in and issue tokens |
| POST | `/auth/logout` | Public | Revoke the supplied refresh token and clear cookies |
| POST | `/auth/refresh` | Public | Rotate the refresh token and issue an access token |
| POST | `/auth/forgot-password` | Public | Request a password reset |
| POST | `/auth/reset-password/:token` | Public | Complete password reset |
| GET | `/auth/verify-email/:token` | Public | Verify an email address |
| GET | `/auth/me` | Authenticated | Return the current user |
| PATCH | `/auth/password` | Authenticated | Change the current password |

Passwords must be 8–128 characters and include uppercase, lowercase, and numeric characters.
Refresh tokens can be sent in the scoped cookie or the request body.

## Content and catalog

Each resource supports public reads. Draft records remain visible only where the controller allows
an authenticated editor or manager.

| Resource | Read endpoints | Write endpoints | Write roles |
| --- | --- | --- | --- |
| Blogs | `GET /blogs`, `/blogs/slug/:slug`, `/blogs/:id` | `POST /blogs`, `PATCH/DELETE /blogs/:id` | super_admin, admin, content_editor |
| Products | `GET /products`, `/products/slug/:slug`, `/products/:id` | `POST /products`, `PATCH/DELETE /products/:id` | super_admin, admin, content_editor |
| Careers | `GET /careers`, `/careers/slug/:slug`, `/careers/:id` | `POST /careers`, `PATCH/DELETE /careers/:id` | super_admin, admin, hr |
| Case studies | `GET /case-studies`, `/case-studies/slug/:slug`, `/case-studies/:id` | `POST /case-studies`, `PATCH/DELETE /case-studies/:id` | super_admin, admin, content_editor |
| Testimonials | `GET /testimonials`, `/testimonials/:id` | `POST /testimonials`, `PATCH/DELETE /testimonials/:id` | super_admin, admin, content_editor |
| Clients | `GET /clients`, `/clients/:id` | `POST /clients`, `PATCH/DELETE /clients/:id` | super_admin, admin, content_editor |

`POST /careers/:id/apply` is public and expects `multipart/form-data`. The optional `resume` field
accepts PDF, DOC, or DOCX up to 10 MB. Files are stored on local disk under `/uploads/resumes`.

## Forms and operations

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/contacts` | Public, rate limited | Submit a contact message |
| GET | `/contacts` | super_admin, admin | List contact messages |
| PATCH | `/contacts/:id` | super_admin, admin | Set `new`, `read`, or `replied` |
| DELETE | `/contacts/:id` | super_admin, admin | Delete a message |
| POST | `/inquiries` | Public, rate limited | Submit a partnership inquiry |
| GET | `/inquiries` | super_admin, admin | List inquiries |
| PATCH | `/inquiries/:id` | super_admin, admin | Update inquiry status |
| POST | `/newsletter/subscribe` | Public, rate limited | Subscribe an email |
| POST | `/newsletter/unsubscribe` | Public, rate limited | Unsubscribe an email |
| GET | `/newsletter` | super_admin, admin | List subscribers |
| GET | `/analytics/dashboard` | super_admin, admin | Return dashboard totals |

## Administration and media

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/users`, `/users/:id` | super_admin, admin | List or retrieve users |
| PATCH | `/users/:id` | super_admin, admin | Update user fields or role |
| DELETE | `/users/:id` | super_admin | Delete a user |
| POST | `/media/upload` | super_admin, admin, content_editor, hr | Upload one media file |
| POST | `/media/upload-many` | Same roles | Upload up to ten files |

Media accepts JPEG, PNG, WebP, GIF, PDF, DOC, and DOCX up to 15 MB each. Files are stored on local
disk and served from `GET /uploads/...` (no paid CDN required).

## Strapi REST

Strapi generates endpoints such as `/api/blogs`, `/api/products`, and `/api/case-studies` from the
schemas under `strapi-cms/src/api`. Content types are private by default. In **Settings → Users &
Permissions → Roles**, grant the Public role only `find` and `findOne` for content intended to be
public, or create a read-only API token for server-side frontend requests. Never expose a
full-access Strapi token through a `NEXT_PUBLIC_*` variable.
