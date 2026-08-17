# CITIS InfoTech

Next.js Progressive Web App for **CITIS InfoTech**.

Contact Us, newsletter, partner, and careers forms open an email draft to
**support@citis.in** (no Express/Mongo backend required).

## Run locally

```bash
cd citis-infotech
npm install --prefix frontend
cp frontend/.env.example frontend/.env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:5000).

## Forms → email

| Form | Destination |
| --- | --- |
| Contact Us | `support@citis.in` |
| Footer newsletter | `support@citis.in` |
| Partner inquiry | `support@citis.in` |
| Careers apply | `support@citis.in` (attach résumé in the email client) |

## Optional

- Strapi CMS under `strapi-cms/` (editorial content only)
- Docker Compose under `docker/` for frontend + Strapi
