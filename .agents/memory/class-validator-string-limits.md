---
name: Class-validator string limits
description: Use string-specific validators for LMS text and URL length constraints.
---

For string fields, use `@MaxLength` rather than numeric `@Max`; the latter can produce misleading validation failures for otherwise valid text and URLs.

**Why:** A valid course description and thumbnail were rejected at runtime when their string limits used numeric decorators.

**How to apply:** When adding or reviewing DTO limits for text, URLs, descriptions, or paths, pair `@IsString`/`@IsUrl` with `@MaxLength`.