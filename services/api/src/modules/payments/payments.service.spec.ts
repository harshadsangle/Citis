import assert from "node:assert/strict";
import test from "node:test";
import { ForbiddenException, UnauthorizedException } from "@nestjs/common";
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
  return new PaymentsService({ query, transaction } as never, razorpay as never);
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