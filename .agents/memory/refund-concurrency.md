---
name: Refund concurrency safety
description: Durable rule for reserving refundable payment balance before calling Razorpay.
---

Refund eligibility and the pending-refund reservation must run in one database transaction while holding a row lock on the payment. The provider call can happen after that reservation commits; concurrent requests then see the pending amount and cannot over-refund.

**Why:** A row lock issued through separate pool queries is released before validation and insertion finish, so concurrent refund requests can both pass the same refundable-balance check.

**How to apply:** Keep pending and processed refunds in the reserved-balance sum, finalize refund/payment/enrollment state transactionally, and retain the existing Razorpay request shape and database idempotency behavior.