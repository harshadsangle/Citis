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
  let unlockTransaction = () => undefined;
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