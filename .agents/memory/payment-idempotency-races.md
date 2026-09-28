---
name: Payment idempotency race recovery
description: Recover concurrent payment-order requests without repeating Razorpay side effects.
---

When a payment insert loses the idempotency unique-index race, allow the failed transaction to roll back before reselecting the existing payment. If the winning request has not yet persisted its provider order, the losing request must wait for that order rather than calling Razorpay again.

**Why:** PostgreSQL marks a transaction aborted after a unique violation, and the payment row is committed before its external Razorpay order is necessarily stored. Repeating the provider call during that gap can create duplicate orders.

**How to apply:** Keep the regular completed-idempotency path unchanged; re-read the tenant/student/course-scoped payment outside the failed transaction and wait for its order only on the unique-conflict path. Handle stale pending-row monitoring separately from order creation.