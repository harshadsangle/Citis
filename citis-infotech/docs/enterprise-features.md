# Enterprise feature extensions (self-contained)

This branch extends the existing CITIS InfoTech PWA **without redesigning** the UI and
**without third-party SaaS** (no Strapi, Cloudinary, Google Analytics, paid email, etc.).

## Added modules

| Module | Backend | Frontend |
| --- | --- | --- |
| Global search | `GET /api/v1/search`, suggestions + history | `GlobalSearch`, `/search` |
| Custom CMS | `CmsSection` model + `/api/v1/cms` | `/admin/cms` |
| Blog comments | `Comment` model + `/api/v1/comments` | (API ready; wire on blog detail) |
| Resources | `Resource` + local Multer files | `/resources` |
| Events | `Event` + registrations | `/events` |
| Success stories | `SuccessStory` | `/success-stories` |
| Faculty | `Faculty` | `/faculty` |
| Timelines | `Timeline` | `InteractiveTimeline` component |
| Analytics | `AnalyticsEvent` + dashboard charts | `AnalyticsTracker`, SVG `Charts` |
| Notifications | `Notification` + `ActivityLog` | Admin APIs |
| CSRF | Double-submit cookie middleware | Sent via `X-CSRF-Token` when logged in |
| PWA | Offline form queue + background sync | `public/sw.js` v2 |
| A11y | High-contrast mode | `HighContrastToggle` |

## Run (localhost only)

```bash
# MongoDB required for API-backed features
cd citis-infotech
cp -n frontend/.env.example frontend/.env.local
cp -n backend/.env.example backend/.env
npm install --prefix frontend
npm install --prefix backend
npm run dev
```

Frontend-only still works for marketing pages; search/CMS/events need Mongo + backend.

## Note on `strapi-cms/`

The folder remains in the repo for reference but is **not required**. Editorial content is managed
through Express + MongoDB (`/admin/cms` and content APIs).
