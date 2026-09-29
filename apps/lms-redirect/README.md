# lms-redirect

Static Vercel project that 307-redirects all of `lms.citisinfotech.in` to
`https://admin.citisinfotech.in` (session cookie on `.citisinfotech.in` survives
the hop). Stopgap until the VPS marketing build stops sending admins to `lms`.

Vercel setup: import repo, set **Root Directory** to `apps/lms-redirect`,
framework **Other**, no build command. Attach domain `lms.citisinfotech.in`.

Once verified working, flip `"permanent"` to `true`.
