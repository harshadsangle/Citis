# Local runbook (no paid services)

This project is intended to run on **localhost**. Do not deploy to a paid cloud platform unless
you choose to later. The stack uses only free, self-hosted components:

| Concern | Implementation | Cost |
| --- | --- | --- |
| Media / resumes | Local disk via Multer (`backend/uploads`) | Free |
| Maps | OpenStreetMap embed | Free |
| Email | Console/json transport, or Mailpit in Docker | Free |
| CMS media | Strapi local `public/uploads` | Free |
| Database | MongoDB + SQLite | Free |

## Prerequisites

- Node.js 20+
- MongoDB 7+ running locally **or** Docker Compose
- npm

## Windows local backend (recommended for current frontend workflow)

1. Install **MongoDB Community** and start the service (default port `27017`), or run:

```bat
docker run -d --name citis-mongo -p 27017:27017 mongo:8
```

2. Configure and start the API:

```bat
cd C:\Users\Ayush\Citis\citis-infotech
copy backend\.env.example backend\.env
```

Edit `backend\.env`:
- Set `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` to long random strings (≥32 chars)
- Set `SEED_ADMIN_PASSWORD` (example in `.env.example`)

```bat
cd backend
npm install
npm run seed
npm run dev
```

API health check: http://localhost:5000/health  
Admin login (after seed): `admin@example.com` / your `SEED_ADMIN_PASSWORD`

Keep the frontend running separately:

```bat
cd C:\Users\Ayush\Citis\citis-infotech\frontend
npm run dev
```

Frontend talks to the API via `NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1` in `frontend/.env.local`.

## Recommended: npm scripts (no Docker for the app)

```bash
cd citis-infotech
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
cp strapi-cms/.env.example strapi-cms/.env

# Edit backend/.env — set JWT secrets (≥32 chars) and seed password
npm install
npm install --prefix frontend
npm install --prefix backend
npm install --prefix strapi-cms

# Terminal A — MongoDB must be running on 27017
npm run dev --prefix backend

# Terminal B
npm run dev --prefix frontend

# Terminal C (optional CMS)
npm run develop --prefix strapi-cms
```

Open:

- Site: http://localhost:5000
- API health: http://localhost:5000/health
- Strapi admin: http://localhost:1337/admin
- Mailpit (if using Compose): http://localhost:8025

## Optional: full stack with Docker Compose

```bash
cd citis-infotech/docker
cp .env.example .env
# Set JWT / Strapi secrets in .env
docker compose up --build
```

Compose includes MongoDB, Mailpit, Express, Strapi, and Next.js. Uploads persist in the
`backend-uploads` volume.

## Email without paid SMTP

Leave `SMTP_HOST` empty in `backend/.env`. Nodemailer uses a JSON transport and prints messages to
the API console. With Compose, Mailpit captures mail at http://localhost:8025.

## Media without Cloudinary

Upload endpoints write to `UPLOADS_DIR` (default `./uploads`) and serve files at
`http://localhost:5000/uploads/...`. No CDN account is required.
