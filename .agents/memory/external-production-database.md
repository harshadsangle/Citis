---
name: External production database access
description: The deployed API uses an external Neon database, while Replit’s managed production database is frozen and is not a substitute.
---

Production database diagnosis requires access to the existing Neon project or a securely supplied replacement connection configuration; the Replit-managed production SQL surface does not inspect the external database.

**Why:** The API deployment can start while its external Neon endpoint is disabled, and the managed production database may be unavailable or unrelated to the application’s data.

**How to apply:** Do not promote the local Replit development database or create a replacement database. Use the authorized Neon integration to identify the active existing endpoint before changing production configuration.