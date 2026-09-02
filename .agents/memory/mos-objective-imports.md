---
name: MOS objective imports
description: Durable rules for Microsoft Office Specialist catalogue and objective-resource imports.
---

Versioned Microsoft Office Specialist exams are separate certification tracks when their official exam codes differ, even when the product and objective domains overlap. Deduplicate exact source/course entries by exam code and keep each supplied objective PDF as one idempotent learning resource.

**Why:** Office 2016, Office 2019, and Microsoft 365 Apps objective documents describe distinct exam codes and certification versions; collapsing them would hide legitimate learner paths, while importing duplicate files would create ambiguous catalogue records.

**How to apply:** When extending MOS, preserve the official exam code in the course identity and title, use one stable programme for the provider, and make rerunning the importer produce zero new programme/course/module/lesson/resource records.