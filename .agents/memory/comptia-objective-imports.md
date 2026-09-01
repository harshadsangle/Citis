---
name: CompTIA objective imports
description: Official CompTIA objective PDFs repeat table-of-contents markers and wrap first-level statements across pages.
---

Use the official domain headings and first-level numbered objective statements as the LMS module and lesson structure. Ignore repeated table-of-contents/domain markers and nested content-example bullets; attach the original PDF as the source resource.

**Why:** CompTIA objective PDFs vary in layout and often emit numbering before the statement or repeat it in the domain summary, so naive line-order parsing can create duplicates or misordered lessons.

**How to apply:** When importing another CompTIA exam, verify the extracted domain/objective counts against the source PDF, preserve the source file unchanged, and use a tenant-scoped exam code for idempotency.