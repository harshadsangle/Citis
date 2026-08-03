# CITIS InfoTech

Enterprise EdTech Progressive Web App for **CITIS InfoTech** — technology-enabled education
solutions for universities, schools, industries, and learners.

The monorepo combines a Next.js 15 PWA, an Express/MongoDB application API, and a Strapi editorial
CMS. **Designed for localhost.** No paid third-party services are required.

## Technology

| Area | Stack |
| --- | --- |
| Web | Next.js 15, React 19, TypeScript, Tailwind CSS, Framer Motion, TanStack Query |
| PWA | Web app manifest, service worker, offline fallback, installable shell |
| Application API | Express, TypeScript, Mongoose, JWT/cookie auth, Multer (local disk), Nodemailer |
| Application data | MongoDB |
| Editorial CMS | Strapi 5 with local SQLite + local media uploads |
| Maps | OpenStreetMap embed (free, no API key) |
| Email | Console/json transport by default, or free Mailpit in Docker |
| Infrastructure | Optional Docker Compose, Node.js 20 |

## Zero paid services

| Feature | Local implementation |
| --- | --- |
| Image / resume / media uploads | Multer → `backend/uploads/` served at `/uploads` |
| CMS media | Strapi `public/uploads` |
| Contact / career / auth email | Logged to API console, or Mailpit (`localhost:8025`) |
| Office map | OpenStreetMap iframe |
| Databases | MongoDB + SQLite |

Do **not** configure Cloudinary, Google Maps Platform, SendGrid, or other billed SaaS for this
project.

## Prerequisites

- Node.js 20 or newer and npm
- MongoDB 7+ on `127.0.0.1:27017` (or use Docker Compose)
- Docker with Compose v2 (optional)

## Repository layout

```text
citis-infotech/
├── frontend/       Next.js 15 PWA
├── backend/        Express/MongoDB TypeScript API
├── strapi-cms/     Strapi 5 configuration and content schemas
├── docker/         Compose stack and service Dockerfiles
├── docs/           Architecture, API, CMS, and local runbook
├── package.json    Root orchestration scripts
└── README.md
```

## First-time setup

```bash
cd citis-infotech
npm install
npm install --prefix frontend
npm install --prefix backend
npm install --prefix strapi-cms

cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
cp strapi-cms/.env.example strapi-cms/.env
```

### Frontend (`frontend/.env.local`)

```dotenv
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
NEXT_PUBLIC_STRAPI_TOKEN=
NEXT_PUBLIC_MAP_LAT=12.9716
NEXT_PUBLIC_MAP_LNG=77.5946
```

### Backend (`backend/.env`)

```dotenv
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/citis_infotech
CLIENT_URL=http://localhost:3000
API_PUBLIC_URL=http://localhost:5000
UPLOADS_DIR=./uploads
JWT_ACCESS_SECRET=replace-with-at-least-32-random-characters
JWT_REFRESH_SECRET=replace-with-another-at-least-32-random-characters
# Leave SMTP_HOST empty to print emails in the API console
SMTP_HOST=
ADMIN_EMAIL=admin@localhost
```

### Strapi

Copy `strapi-cms/.env.example` and replace every placeholder key/salt. SQLite is used locally:

```dotenv
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db
```

## Run on localhost

Start MongoDB, then:

```bash
npm run dev
```

Optional Strapi in another terminal:

```bash
npm run develop --prefix strapi-cms
```

| Service | URL |
| --- | --- |
| Frontend | http://localhost:3000 |
| API | http://localhost:5000/api/v1 |
| API health | http://localhost:5000/health |
| Uploads | http://localhost:5000/uploads/... |
| Strapi | http://localhost:1337 |
| Strapi admin | http://localhost:1337/admin |

## Docker Compose (optional)

```bash
cp docker/.env.example docker/.env
# Set JWT / Strapi secrets (≥32 characters)
docker compose --env-file docker/.env -f docker/docker-compose.yml up --build
```

Includes MongoDB, Mailpit, Express, Strapi, and Next.js. Mailpit UI: http://localhost:8025

```bash
docker compose --env-file docker/.env -f docker/docker-compose.yml down
```

## Seed sample data

```dotenv
SEED_ADMIN_NAME=Super Admin
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=ChooseAStrongPass1
```

```bash
npm run seed --prefix backend
```

## Pages included

- Home, About, Engagements (University / School / Vocational / CoE / Placements)
- Products (AI Future Academy, AppWizz, MoxieMind)
- Partner With Us, Future Academy, Highlights (Blogs, Case Studies)
- Careers (+ apply), Contact, Auth (login / forgot / reset / verify)
- Admin dashboard (blogs, products, careers, clients, testimonials, media, messages, analytics)
- Offline fallback page + PWA install shell

## Roles

| Role | Capability |
| --- | --- |
| `super_admin` | Full administration |
| `admin` | Users, content, operations |
| `content_editor` | Editorial content and media |
| `hr` | Careers and media |
| `guest` | Registered self-service access |

## API overview

Base path `/api/v1`:

- `/auth` — register, login, refresh, verify, password reset
- `/users`, `/blogs`, `/products`, `/careers`, `/case-studies`
- `/testimonials`, `/clients`
- `/contacts`, `/inquiries`, `/newsletter`
- `/media` — local disk uploads
- `/analytics/dashboard`

See [`docs/api.md`](docs/api.md). Local run details: [`docs/deployment.md`](docs/deployment.md).

## PWA

`public/manifest.json`, install icons, `/offline`, and `/sw.js`. Service worker registers in
production builds:

```bash
npm run build --prefix frontend
npm run start --prefix frontend
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Frontend + backend |
| `npm run dev:frontend` | Next.js only |
| `npm run dev:backend` | API only |
| `npm run build` | Build all packages |
| `npm run lint` | Frontend ESLint + backend `tsc` |

## Contributing

1. Do not commit `.env`, uploads, databases, or build output.
2. Keep API behavior and docs in sync.
3. Run lint/build for touched packages before review.
4. Prefer free, self-hosted tooling — avoid introducing paid SaaS dependencies.
