# Development demo learner

The development environment includes one deterministic learner account for
testing the shared authentication flow and standalone learner portal:

| Field | Value |
| --- | --- |
| Email | `learner.demo@citis.in` |
| Password | `DEMO_LEARNER_PASSWORD` environment variable |
| Portal | Learner |

This account is development-only. Do not reuse this credential outside the
local development environment.

## Development demo staff

The LMS staff demo accounts use the same `citis-platform` tenant and
`citis-lms-demo` institution:

| Account | Role | Password environment variable | Seed command |
| --- | --- | --- | --- |
| `admin.demo@citis.in` | `INSTITUTION_ADMINISTRATOR` | `DEMO_ADMIN_PASSWORD` | `npm run db:seed-demo-admin` |
| `instructor.demo@citis.in` | `TEACHER` | `DEMO_INSTRUCTOR_PASSWORD` | `npm run db:seed-demo-instructor` |

Set the relevant environment variable in the local environment before
running its command. The seed stores a bcrypt password hash, activates the
user, and ensures one institution-scoped role assignment. Both commands are
safe to rerun.

## Reset the demo learner

After the database migrations have been applied, run:

```bash
npm run db:seed-demo-learner
```

The seed is idempotent. It updates only the demo learner's password and active
status when the account already exists, and ensures the account has an active
`STUDENT` role without changing authentication behavior.