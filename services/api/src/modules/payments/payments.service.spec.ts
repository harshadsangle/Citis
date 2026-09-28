import assert from "node:assert/strict";
import test from "node:test";
import { BadRequestException, ForbiddenException, UnauthorizedException } from "@nestjs/common";
import type { AuthenticatedUser } from "../../common/request-context";
import { PaymentsService } from "./payments.service";

const directStudent: AuthenticatedUser = {
  id: "student-1",
  tenantId: "tenant-1",
  email: "student@example.com",
  firstName: "Direct",
  lastName: "Student",
  studentType: "DIRECT_STUDENT",
  roles: [{ code: "STUDENT", name: "Student" }],
  permissions: ["payments.payment.create", "payments.payment.view"],
  scopes: [],
};

function serviceWith(
  query: (text: string, values: unknown[]) => Promise<{ rows: Array<Record<string, any>> }>,
  transaction: (work: (client: any) => Promise<unknown>) => Promise<unknown>,
  razorpay: Record<string, any>,
) {
  return new PaymentsService({ query, transaction } as never, razorpay as never, { record: async () => undefined } as never);
}

function webhookBody(event: string, entityType: "payment" | "refund", entity: Record<string, unknown>) {
  return Buffer.from(JSON.stringify({ event, payload: { [entityType]: { entity } } }));
}

test("direct students can list only published paid courses in their tenant", async () => {
  let queryText = "";
  let queryValues: unknown[] = [];
  const service = serviceWith(async (text, values) => {
    queryText = text;
    queryValues = values;
    return {
      rows: [{
        id: "course-1",
        title: "Secure course",
        code: "SEC-101",
        description: "Course description",
        thumbnail: null,
        price_minor: "125000",
        currency: "INR",
        is_enrolled: false,
      }],
    };
  }, async (work) => work({ query: async () => ({ rows: [] }) }), {});

  const courses = await service.listPurchasableCourses(directStudent);
  assert.deepEqual(courses, [{
    id: "course-1",
    title: "Secure course",
    code: "SEC-101",
    description: "Course description",
    thumbnail: null,
    priceMinor: 125000,
    currency: "INR",
    isEnrolled: false,
  }]);
  assert.deepEqual(queryValues, ["tenant-1", "student-1"]);
  assert.match(queryText, /c\.purchasable = true/);
  assert.match(queryText, /c\.status = 'PUBLISHED'/);
  assert.match(queryText, /e\.learner_id = \$2/);
});

test("college students cannot list the direct-student purchase catalogue", async () => {
  let queryCalled = false;
  const collegeStudent = { ...directStudent, studentType: "COLLEGE_STUDENT" as const };
  const service = serviceWith(async () => {
    queryCalled = true;
    return { rows: [] };
  }, async (work) => work({ query: async () => ({ rows: [] }) }), {});

  await assert.rejects(service.listPurchasableCourses(collegeStudent), ForbiddenException);
  assert.equal(queryCalled, false);
});

test("direct purchase creates a provider order from the existing course price", async () => {
  const calls: Array<{ text: string; values: unknown[] }> = [];
  const razorpay = {
    createOrder: async (input: Record<string, unknown>) => {
      assert.deepEqual(input, { amount: 125000, currency: "INR", receipt: "payment-1" });
      return { id: "order-1", amount: 125000, currency: "INR", status: "created" };
    },
  };
  const service = serviceWith(async (text, values) => {
    calls.push({ text, values });
    if (text.includes("FROM courses c")) {
      return { rows: [{ id: "course-existing", tenant_id: "tenant-1", institution_id: "institution-1", campus_id: null, price_minor: "125000", currency: "INR", title: "Existing course" }] };
    }
    if (text.includes("UPDATE lms_payments")) {
      return { rows: [{ id: "payment-1", course_id: "course-existing", student_id: "student-1", amount_minor: "125000", currency: "INR", status: "ORDER_CREATED", razorpay_order_id: "order-1" }] };
    }
    return { rows: [] };
  }, async (work) => work({
    query: async (text: string) => {
      if (text.includes("SELECT * FROM lms_payments")) return { rows: [] };
      if (text.includes("SELECT id FROM lms_enrollments")) return { rows: [] };
      return { rows: [{ id: "payment-1", course_id: "course-existing", student_id: "student-1", amount_minor: "125000", currency: "INR", status: "PENDING" }] };
    },
  }), razorpay);

  const result = await service.createOrder("course-existing", { idempotencyKey: "direct-order-1" }, directStudent);
  assert.equal(result.razorpayOrderId, "order-1");
  assert.equal(result.amountMinor, 125000);
  assert.ok(calls.some((call) => call.values.includes("course-existing")));
});

test("repeated idempotent payment requests return the existing Razorpay order", async () => {
  const course = {
    id: "course-existing",
    tenant_id: "tenant-1",
    institution_id: "institution-1",
    campus_id: null,
    price_minor: "125000",
    currency: "INR",
    title: "Existing course",
  };
  const existingPayment = {
    id: "payment-existing",
    course_id: "course-existing",
    student_id: "student-1",
    amount_minor: "125000",
    currency: "INR",
    status: "ORDER_CREATED",
    razorpay_order_id: "order-existing",
  };
  let providerOrderCalls = 0;
  let paymentInsertCalls = 0;
  const service = serviceWith(
    async (text) => text.includes("FROM courses c") ? { rows: [course] } : { rows: [] },
    async (work) => work({
      query: async (text: string) => {
        if (text.includes("SELECT * FROM lms_payments")) return { rows: [existingPayment] };
        if (text.includes("INSERT INTO lms_payments")) paymentInsertCalls += 1;
        return { rows: [] };
      },
    }),
    {
      createOrder: async () => {
        providerOrderCalls += 1;
        return { id: "unexpected-order", amount: 125000, currency: "INR", status: "created" };
      },
    },
  );

  const result = await service.createOrder(
    "course-existing",
    { idempotencyKey: "direct-order-existing" },
    directStudent,
  );

  assert.equal(result.id, "payment-existing");
  assert.equal(result.razorpayOrderId, "order-existing");
  assert.equal(result.status, "ORDER_CREATED");
  assert.equal(paymentInsertCalls, 0);
  assert.equal(providerOrderCalls, 0);
});

test("concurrent same-key payment requests recover 23505 and reuse one Razorpay order", { timeout: 10_000 }, async () => {
  const idempotencyKey = "direct-order-race";
  const course = {
    id: "course-existing",
    tenant_id: "tenant-1",
    institution_id: "institution-1",
    campus_id: null,
    price_minor: "125000",
    currency: "INR",
    title: "Existing course",
  };
  let payment: Record<string, unknown> | null = null;
  let initialLookupCount = 0;
  let insertAttempts = 0;
  let uniqueConflicts = 0;
  let conflictReselects = 0;
  let providerOrderCalls = 0;
  let resolveInitialLookups!: () => void;
  const bothInitialLookups = new Promise<void>((resolve) => {
    resolveInitialLookups = resolve;
  });
  let resolveConflictReselect!: () => void;
  const conflictReselect = new Promise<void>((resolve) => {
    resolveConflictReselect = resolve;
  });
  let resolveProviderStarted!: () => void;
  const providerStarted = new Promise<void>((resolve) => {
    resolveProviderStarted = resolve;
  });
  let releaseProviderOrder!: (order: { id: string; amount: number; currency: string; status: string }) => void;
  const providerOrder = new Promise<{ id: string; amount: number; currency: string; status: string }>((resolve) => {
    releaseProviderOrder = resolve;
  });

  const db = {
    query: async (text: string, values: unknown[] = []) => {
      if (text.includes("FROM courses c")) return { rows: [course] };
      if (text.startsWith("SELECT * FROM lms_payments")) {
        if (values[3] === idempotencyKey) {
          conflictReselects += 1;
          resolveConflictReselect();
        }
        return { rows: payment ? [{ ...payment }] : [] };
      }
      if (text.startsWith("UPDATE lms_payments")) {
        assert.ok(payment);
        payment = {
          ...payment,
          razorpay_order_id: values[1],
          status: "ORDER_CREATED",
        };
        return { rows: [{ ...payment }] };
      }
      return { rows: [] };
    },
    transaction: async (work: (client: { query: (text: string, values?: unknown[]) => Promise<{ rows: unknown[] }> }) => Promise<unknown>) =>
      work({
        query: async (text: string, values: unknown[] = []) => {
          if (text.includes("SELECT * FROM lms_payments")) {
            const snapshot = payment ? { ...payment } : null;
            initialLookupCount += 1;
            if (initialLookupCount === 2) resolveInitialLookups();
            await bothInitialLookups;
            return { rows: snapshot ? [snapshot] : [] };
          }
          if (text.includes("SELECT id FROM lms_enrollments")) return { rows: [] };
          if (text.includes("INSERT INTO lms_payments")) {
            insertAttempts += 1;
            if (payment) {
              uniqueConflicts += 1;
              throw Object.assign(new Error("duplicate idempotency key"), {
                code: "23505",
                constraint: "lms_payments_idempotency_key",
              });
            }
            payment = {
              id: "payment-race",
              tenant_id: "tenant-1",
              student_id: "student-1",
              course_id: "course-existing",
              amount_minor: "125000",
              currency: "INR",
              status: "PENDING",
              razorpay_order_id: null,
              razorpay_payment_id: null,
              captured_at: null,
              refunded_at: null,
            };
            return { rows: [{ ...payment }] };
          }
          return { rows: [] };
        },
      }),
  };
  const service = serviceWith(db.query, db.transaction, {
    createOrder: async () => {
      providerOrderCalls += 1;
      resolveProviderStarted();
      return providerOrder;
    },
  });

  const requests = [
    service.createOrder("course-existing", { idempotencyKey }, directStudent),
    service.createOrder("course-existing", { idempotencyKey }, directStudent),
  ];
  const resultsPromise = Promise.allSettled(requests);
  await providerStarted;

  let reselectTimeout: ReturnType<typeof setTimeout> | undefined;
  const reselectedBeforeProviderCompletion = await Promise.race([
    conflictReselect.then(() => true),
    new Promise<boolean>((resolve) => {
      reselectTimeout = setTimeout(() => resolve(false), 1_000);
    }),
  ]);
  if (reselectTimeout) clearTimeout(reselectTimeout);
  const racedPaymentSnapshot = payment ? { ...payment } : null;
  releaseProviderOrder({ id: "order-shared", amount: 125000, currency: "INR", status: "created" });
  const results = await resultsPromise;
  const successes = results.filter((result) => result.status === "fulfilled");

  assert.equal(reselectedBeforeProviderCompletion, true);
  assert.equal(racedPaymentSnapshot?.status, "PENDING");
  assert.equal(racedPaymentSnapshot?.razorpay_order_id, null);
  assert.equal(successes.length, 2);
  const orders = successes.map((result) => (result as PromiseFulfilledResult<Record<string, unknown>>).value);
  assert.deepEqual(
    orders.map((order) => [order.id, order.razorpayOrderId, order.status]),
    [
      ["payment-race", "order-shared", "ORDER_CREATED"],
      ["payment-race", "order-shared", "ORDER_CREATED"],
    ],
  );
  assert.equal(initialLookupCount, 2);
  assert.equal(insertAttempts, 2);
  assert.equal(uniqueConflicts, 1);
  assert.equal(conflictReselects, 1);
  assert.equal(providerOrderCalls, 1);
});

test("college students cannot use the direct purchase endpoint", async () => {
  const collegeStudent = { ...directStudent, studentType: "COLLEGE_STUDENT" as const };
  const service = serviceWith(async () => ({ rows: [] }), async (work) => work({ query: async () => ({ rows: [] }) }), {});
  await assert.rejects(
    service.createOrder("course-existing", { idempotencyKey: "direct-order-2" }, collegeStudent),
    ForbiddenException,
  );
});

test("invalid signatures cannot activate an enrollment", async () => {
  let fetchCalled = false;
  const service = serviceWith(async (text) => {
    if (text.includes("FROM lms_payments")) {
      return { rows: [{ id: "payment-1", course_id: "course-existing", student_id: "student-1", amount_minor: "125000", currency: "INR", status: "ORDER_CREATED", razorpay_order_id: "order-1" }] };
    }
    return { rows: [] };
  }, async (work) => work({ query: async () => ({ rows: [] }) }), {
    verifyPaymentSignature: () => false,
    fetchPayment: async () => { fetchCalled = true; return {}; },
  });
  await assert.rejects(
    service.verifyPayment({ razorpayOrderId: "order-1", razorpayPaymentId: "pay-1", razorpaySignature: "bad-signature" }, directStudent),
    UnauthorizedException,
  );
  assert.equal(fetchCalled, false);
});

test("a failed webhook handler can retry the same provider event successfully", async () => {
  const event = { id: "event-row-1", processing_status: "RECEIVED", processed_at: null as string | null };
  let eventExists = false;
  let handlerAttempts = 0;
  let insertSql = "";
  const service = serviceWith(async (text, values) => {
    if (text.startsWith("SELECT tenant_id, id FROM lms_payments")) {
      return { rows: [{ tenant_id: "tenant-1", id: "payment-1" }] };
    }
    if (text.startsWith("INSERT INTO lms_payment_events")) {
      insertSql = text;
      if (!eventExists) {
        eventExists = true;
        return { rows: [{ id: event.id }] };
      }
      if (
        event.processing_status === "FAILED"
        && text.includes("WHERE lms_payment_events.processing_status = 'FAILED'")
      ) {
        event.processing_status = "RECEIVED";
        event.processed_at = null;
        return { rows: [{ id: event.id }] };
      }
      return { rows: [] };
    }
    if (text.startsWith("UPDATE lms_payments")) {
      handlerAttempts += 1;
      if (handlerAttempts === 1) throw new Error("temporary payment handler failure");
      return { rows: [] };
    }
    if (text.includes("UPDATE lms_payment_events SET processing_status = 'FAILED'")) {
      event.processing_status = "FAILED";
      event.processed_at = "failed";
      return { rows: [] };
    }
    if (text.includes("UPDATE lms_payment_events SET processing_status = 'PROCESSED'")) {
      event.processing_status = "PROCESSED";
      event.processed_at = "processed";
      return { rows: [] };
    }
    return { rows: [] };
  }, async (work) => work({ query: async () => ({ rows: [] }) }), {
    verifyWebhookSignature: () => true,
  });
  const body = webhookBody("payment.failed", "payment", {
    order_id: "order-1",
    error_code: "TEMPORARY_ERROR",
    error_description: "Temporary handler failure.",
  });

  await assert.rejects(service.handleWebhook(body, "valid-signature", "provider-event-1"), /temporary payment handler failure/);
  assert.equal(event.processing_status, "FAILED");

  const retried = await service.handleWebhook(body, "valid-signature", "provider-event-1");
  assert.deepEqual(retried, { received: true });
  assert.equal(event.processing_status, "PROCESSED");
  assert.equal(handlerAttempts, 2);
  assert.match(insertSql, /WHERE lms_payment_events\.processing_status = 'FAILED'/);

  const duplicate = await service.handleWebhook(body, "valid-signature", "provider-event-1");
  assert.deepEqual(duplicate, { received: true, duplicate: true });
  assert.equal(handlerAttempts, 2);
});

test("a late refund.failed event preserves a processed refund and processed events remain idempotent", async () => {
  const refund: Record<string, any> = {
    id: "refund-1",
    tenant_id: "tenant-1",
    payment_id: "payment-1",
    initiated_by: "admin-1",
    razorpay_refund_id: "provider-refund-1",
    amount_minor: 500,
    payment_amount: "1000",
    course_id: "course-1",
    student_id: "student-1",
    status: "PROCESSED",
  };
  const events = new Map<string, { id: string; status: string }>();
  let nextEventId = 1;
  let processedUpdateAttempts = 0;
  let failedUpdateSql = "";
  const service = serviceWith(async (text, values) => {
    if (text.startsWith("SELECT tenant_id, id FROM lms_payments")) return { rows: [] };
    if (text.startsWith("INSERT INTO lms_payment_events")) {
      const providerEventId = String(values[2]);
      if (events.has(providerEventId)) return { rows: [] };
      const inserted = { id: `event-row-${nextEventId++}`, status: "RECEIVED" };
      events.set(providerEventId, inserted);
      return { rows: [{ id: inserted.id }] };
    }
    if (text.includes("UPDATE lms_payment_events SET processing_status = 'PROCESSED'")) {
      const event = [...events.values()].find((entry) => entry.id === values[0]);
      if (event) event.status = "PROCESSED";
      return { rows: [] };
    }
    if (text.startsWith("UPDATE lms_refunds SET status = 'FAILED'")) {
      failedUpdateSql = text;
      if (!text.includes("AND status <> 'PROCESSED'") || refund.status !== "PROCESSED") {
        refund.status = "FAILED";
      }
      return { rows: [] };
    }
    return { rows: [] };
  }, async (work) => work({
    query: async (text: string) => {
      if (text.startsWith("SELECT r.*")) return { rows: [{ ...refund }] };
      if (text.startsWith("UPDATE lms_refunds SET razorpay_refund_id")) {
        processedUpdateAttempts += 1;
        return { rows: [] };
      }
      throw new Error(`Unexpected transaction query: ${text}`);
    },
  }), {
    verifyWebhookSignature: () => true,
  });
  const processedBody = webhookBody("refund.processed", "refund", {
    id: "provider-refund-1",
    amount: 500,
    payment_id: "provider-payment-1",
  });

  await service.handleWebhook(processedBody, "valid-signature", "provider-event-processed-1");
  await service.handleWebhook(processedBody, "valid-signature", "provider-event-processed-2");
  assert.equal(refund.status, "PROCESSED");
  assert.equal(processedUpdateAttempts, 2);

  await service.handleWebhook(webhookBody("refund.failed", "refund", {
    id: "provider-refund-1",
    error_description: "Late failure notification.",
  }), "valid-signature", "provider-event-failed");

  assert.equal(refund.status, "PROCESSED");
  assert.match(failedUpdateSql, /AND status <> 'PROCESSED'/);
});

for (const initialStatus of ["REFUNDED", "PARTIALLY_REFUNDED"] as const) {
  test(`a late payment.failed event preserves ${initialStatus} payment state`, async () => {
    let paymentStatus: string = initialStatus;
    let failureUpdateSql = "";
    const service = serviceWith(async (text) => {
      if (text.startsWith("SELECT tenant_id, id FROM lms_payments")) {
        return { rows: [{ tenant_id: "tenant-1", id: "payment-1" }] };
      }
      if (text.startsWith("INSERT INTO lms_payment_events")) return { rows: [{ id: "event-row-1" }] };
      if (text.startsWith("UPDATE lms_payments")) {
        failureUpdateSql = text;
        const protectedStates = text
          .match(/CASE WHEN status IN \(([^)]+)\) THEN status ELSE 'FAILED' END/)
          ?.[1]
          .match(/'[^']+'/g)
          ?.map((status) => status.slice(1, -1)) ?? [];
        if (!protectedStates.includes(paymentStatus)) paymentStatus = "FAILED";
        return { rows: [] };
      }
      return { rows: [] };
    }, async (work) => work({ query: async () => ({ rows: [] }) }), {
      verifyWebhookSignature: () => true,
    });

    await service.handleWebhook(webhookBody("payment.failed", "payment", {
      order_id: "order-1",
      error_code: "PAYMENT_FAILED",
      error_description: "Late failure notification.",
    }), "valid-signature", `provider-event-${initialStatus}`);

    assert.equal(paymentStatus, initialStatus);
    assert.match(
      failureUpdateSql,
      /CASE WHEN status IN \('CAPTURED', 'REFUNDED', 'PARTIALLY_REFUNDED'\) THEN status ELSE 'FAILED' END/,
    );
  });
}

test("concurrent refunds reserve the refundable amount under the payment lock", async () => {
  const admin: AuthenticatedUser = {
    ...directStudent,
    id: "admin-1",
    studentType: undefined,
    roles: [{ code: "CITIS_ADMIN", name: "CITIS Admin" }],
  };
  const payment = {
    id: "payment-1",
    tenant_id: admin.tenantId,
    student_id: "student-1",
    course_id: "course-1",
    amount_minor: "1000",
    status: "CAPTURED",
    razorpay_payment_id: "pay-1",
  };
  const refunds: Array<Record<string, any>> = [];
  let nextRefundId = 1;
  let releaseTransaction: Promise<void> = Promise.resolve();
  let unlockTransaction: () => void = () => undefined;
  const transactionLock = new Promise<void>((resolve) => { unlockTransaction = resolve; });
  let firstTransaction = true;
  const transaction = async (work: (client: any) => Promise<unknown>) => {
    if (firstTransaction) {
      firstTransaction = false;
      releaseTransaction = transactionLock;
    } else {
      await releaseTransaction;
    }
    const client = {
      query: async (text: string, values: unknown[] = []) => {
        if (text.includes("SELECT * FROM lms_payments")) return { rows: [payment] };
        if (text.includes("SELECT COALESCE(sum(amount_minor), 0)::text AS total") && text.includes("PENDING")) {
          return { rows: [{ total: String(refunds.filter((refund) => ["PENDING", "PROCESSED"].includes(refund.status)).reduce((sum, refund) => sum + refund.amount_minor, 0)) }] };
        }
        if (text.startsWith("INSERT INTO lms_refunds")) {
          const refund = { id: `refund-${nextRefundId++}`, tenant_id: admin.tenantId, payment_id: payment.id, initiated_by: admin.id, amount_minor: Number(values[3]), status: "PENDING" };
          refunds.push(refund);
          return { rows: [refund] };
        }
        if (text.startsWith("SELECT r.*")) return { rows: [refunds.find((refund) => refund.id === values[0])] };
        if (text.startsWith("UPDATE lms_refunds")) {
          const refund = refunds.find((item) => item.id === values[0]);
          if (!refund || refund.status === "PROCESSED") return { rows: [] };
          refund.status = "PROCESSED";
          refund.razorpay_refund_id = values[1];
          return { rows: [refund] };
        }
        if (text.includes("SELECT COALESCE(sum(amount_minor), 0)::text AS total") && text.includes("PROCESSED")) {
          return { rows: [{ total: String(refunds.filter((refund) => refund.status === "PROCESSED").reduce((sum, refund) => sum + refund.amount_minor, 0)) }] };
        }
        return { rows: [] };
      },
    };
    const result = await work(client);
    if (firstTransaction === false && refunds.some((refund) => refund.status === "PENDING")) unlockTransaction();
    return result;
  };
  const service = serviceWith(async (text, values) => {
    if (text.startsWith("UPDATE lms_refunds SET status = 'FAILED'")) return { rows: [] };
    return { rows: [] };
  }, transaction, {
    refundPayment: async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return { id: "provider-refund-1", amount: 1000 };
    },
  });

  const first = service.initiateRefund("payment-1", { amountMinor: 1000, reason: "Duplicate payment" }, admin);
  const second = service.initiateRefund("payment-1", { amountMinor: 1000, reason: "Duplicate payment" }, admin);
  const [firstResult, secondResult] = await Promise.allSettled([first, second]);

  assert.equal(firstResult.status, "fulfilled");
  assert.equal(secondResult.status, "rejected");
  if (secondResult.status === "rejected") assert.ok(secondResult.reason instanceof BadRequestException);
  assert.equal(refunds.filter((refund) => refund.status === "PROCESSED").length, 1);
});

test("two successive partial refunds can be followed by a final refund", async () => {
  const admin: AuthenticatedUser = {
    ...directStudent,
    id: "admin-1",
    studentType: undefined,
    roles: [{ code: "CITIS_ADMIN", name: "CITIS Admin" }],
  };
  const payment: Record<string, any> = {
    id: "payment-1",
    tenant_id: admin.tenantId,
    student_id: "student-1",
    course_id: "course-1",
    amount_minor: "1000",
    status: "CAPTURED",
    razorpay_payment_id: "pay-1",
  };
  const refunds: Array<Record<string, any>> = [];
  const providerAmounts: number[] = [];
  let nextRefundId = 1;
  const transaction = async (work: (client: any) => Promise<unknown>) => work({
    query: async (text: string, values: unknown[] = []) => {
      if (text.includes("SELECT * FROM lms_payments")) return { rows: [payment] };
      if (text.includes("SELECT COALESCE(sum(amount_minor), 0)::text AS total") && text.includes("'PENDING'")) {
        return {
          rows: [{
            total: String(refunds
              .filter((refund) => ["PENDING", "PROCESSED"].includes(refund.status))
              .reduce((sum, refund) => sum + refund.amount_minor, 0)),
          }],
        };
      }
      if (text.startsWith("INSERT INTO lms_refunds")) {
        const refund = {
          id: `refund-${nextRefundId++}`,
          tenant_id: admin.tenantId,
          payment_id: payment.id,
          initiated_by: admin.id,
          amount_minor: Number(values[3]),
          status: "PENDING",
        };
        refunds.push(refund);
        return { rows: [refund] };
      }
      if (text.startsWith("SELECT r.*")) {
        const refund = refunds.find((item) => item.id === values[0]);
        return { rows: [{ ...refund, payment_amount: payment.amount_minor }] };
      }
      if (text.startsWith("UPDATE lms_refunds SET razorpay_refund_id")) {
        const refund = refunds.find((item) => item.id === values[0]);
        if (!refund || refund.status === "PROCESSED") return { rows: [] };
        refund.status = "PROCESSED";
        refund.razorpay_refund_id = values[1];
        return { rows: [refund] };
      }
      if (text.includes("SELECT COALESCE(sum(amount_minor), 0)::text AS total") && text.includes("status = 'PROCESSED'")) {
        return {
          rows: [{
            total: String(refunds
              .filter((refund) => refund.status === "PROCESSED")
              .reduce((sum, refund) => sum + refund.amount_minor, 0)),
          }],
        };
      }
      if (text.startsWith("UPDATE lms_payments")) {
        payment.status = values[1];
        return { rows: [] };
      }
      if (text.startsWith("UPDATE lms_enrollments")) return { rows: [] };
      throw new Error(`Unexpected transaction query: ${text}`);
    },
  });
  let nextProviderRefundId = 1;
  const service = serviceWith(async (text) => {
    if (text.startsWith("UPDATE lms_refunds SET status = 'FAILED'")) return { rows: [] };
    throw new Error(`Unexpected database query: ${text}`);
  }, transaction, {
    refundPayment: async (_paymentId: string, input: { amount: number }) => {
      providerAmounts.push(input.amount);
      return { id: `provider-refund-${nextProviderRefundId++}`, amount: input.amount };
    },
  });

  const first = await service.initiateRefund("payment-1", { amountMinor: 300, reason: "First partial refund" }, admin);
  assert.equal(payment.status, "PARTIALLY_REFUNDED");
  const second = await service.initiateRefund("payment-1", { amountMinor: 300, reason: "Second partial refund" }, admin);
  assert.equal(payment.status, "PARTIALLY_REFUNDED");
  const final = await service.initiateRefund("payment-1", { reason: "Final refund" }, admin);

  assert.deepEqual(providerAmounts, [300, 300, 400]);
  assert.deepEqual(refunds.map((refund) => refund.amount_minor), [300, 300, 400]);
  assert.deepEqual(refunds.map((refund) => refund.status), ["PROCESSED", "PROCESSED", "PROCESSED"]);
  assert.equal(first.status, "PROCESSED");
  assert.equal(second.status, "PROCESSED");
  assert.equal(final.status, "PROCESSED");
  assert.equal(payment.status, "REFUNDED");
});