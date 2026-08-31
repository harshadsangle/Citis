# CITIS platform coding rules

- Preserve `citis-infotech/frontend` marketing routes and visual behavior.
- Keep controllers thin; put business logic in services and persistence logic
  behind repositories.
- Require DTO validation on every write and scope every tenant query.
- Resolve permissions from database role assignments. Do not hardcode role
  bypasses in portal components.
- Write an audit record for every state-changing action.
- Use UUIDs, UTC timestamps, `/api/v1`, request IDs, and the documented
  response envelopes.
- Do not add Phase 3 LMS or ERP features to the foundation task.