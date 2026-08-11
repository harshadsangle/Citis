# CITIS InfoTech on Replit

## Frontend

The runnable application is the Next.js frontend in `citis-infotech/frontend`.
This branch is intentionally frontend-only; it does not include or require a
backend or database.

Install dependencies and start the development server from the repository root:

```bash
npm ci --prefix citis-infotech/frontend
npm run dev
```

The root `npm run dev` script delegates to the frontend and serves it on port
5000, bound to all interfaces for the Replit preview.

Optional frontend environment values can be copied from
`citis-infotech/frontend/.env.example` to
`citis-infotech/frontend/.env.local`. Contact, newsletter, partner, and careers
forms open an email draft to the configured support inbox.