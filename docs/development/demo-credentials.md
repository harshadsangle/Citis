# Development demo learner

The development environment includes one deterministic learner account for
testing the shared authentication flow and standalone learner portal:

| Field | Value |
| --- | --- |
| Email | `learner.demo@citis.in` |
| Password | `Password123!` |
| Portal | Learner |

This account is development-only. Do not reuse this credential outside the
local development environment.

## Reset the demo learner

After the database migrations have been applied, run:

```bash
npm run db:seed-demo-learner
```

The seed is idempotent. It updates only the demo learner's password and active
status when the account already exists, and ensures the account has an active
`STUDENT` role without changing authentication behavior.