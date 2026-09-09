import { createHash } from "node:crypto";
import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import type { ContextRequest, AuthenticatedUser } from "../../common/request-context";
import { isLmsAdministrator } from "../../common/access-scope";
import { DatabaseService } from "../../database/database.service";
import type { CreatePaymentOrderDto, CreateRefundDto, PaymentListQueryDto, VerifyPaymentDto } from "./payments.dto";
import { RazorpayClient } from "./razorpay.client";

type ProviderPayment = {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
  captured?: boolean;
};

@Injectable()
export class PaymentsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly razorpay: RazorpayClient,
  ) {}

  private assertDirectStudent(user: AuthenticatedUser) {
    if (user.studentType !== "DIRECT_STUDENT" || !user.roles.some((role) => role.code === "STUDENT")) {
      throw new ForbiddenException("Only direct students can purchase courses.");
    }
  }

  private assertCitisAdmin(user: AuthenticatedUser) {
    if (!user.roles.some((role) => role.code === "CITIS_ADMIN")) {
      throw new ForbiddenException("Only CITIS Admin can manage payment refunds.");
    }
  }

  private async purchaseCourse(courseId: string, user: AuthenticatedUser) {
    const result = await this.db.query<{
      id: string;
      tenant_id: string;
      institution_id: string;
      campus_id: string | null;
      price_minor: string | number;
      currency: string;
      title: string;
    }>(
      `SELECT c.id, c.tenant_id, c.institution_id, c.campus_id, c.price_minor, c.currency, c.title
       FROM courses c
       JOIN programmes p ON p.id = c.programme_id AND p.tenant_id = c.tenant_id
       JOIN institutions i ON i.id = p.institution_id AND i.tenant_id = c.tenant_id
       WHERE c.id = $1 AND c.tenant_id = $2
         AND c.status = 'PUBLISHED' AND p.status = 'PUBLISHED' AND i.status = 'ACTIVE'
         AND c.purchasable = true AND c.price_minor > 0`,
      [courseId, user.tenantId],
    );
    if (!result.rows[0]) throw new NotFoundException("The course is not available for purchase.");
    return { ...result.rows[0], amountMinor: Number(result.rows[0].price_minor) };
  }

  private paymentSummary(row: Record<string, unknown>) {
    return {
      id: row.id,
      courseId: row.course_id,
      studentId: row.student_id,
      razorpayOrderId: row.razorpay_order_id,
      razorpayPaymentId: row.razorpay_payment_id,
      amountMinor: Number(row.amount_minor),
      currency: row.currency,
      status: row.status,
      createdAt: row.created_at,
      capturedAt: row.captured_at,
      refundedAt: row.refunded_at,
    };
  }

  async createOrder(courseId: string, input: CreatePaymentOrderDto, user: AuthenticatedUser) {
    this.assertDirectStudent(user);
    const course = await this.purchaseCourse(courseId, user);
    const idempotencyKey = input.idempotencyKey.trim();
    const payment = await this.db.transaction(async (client) => {
      const existing = await client.query<Record<string, unknown>>(
        `SELECT * FROM lms_payments
         WHERE tenant_id = $1 AND student_id = $2 AND course_id = $3 AND idempotency_key = $4
         FOR UPDATE`,
        [user.tenantId, user.id, course.id, idempotencyKey],
      );
      if (existing.rows[0]) return existing.rows[0];

      const active = await client.query(
        `SELECT id FROM lms_enrollments
         WHERE tenant_id = $1 AND course_id = $2 AND learner_id = $3 AND status = 'ACTIVE'
         LIMIT 1`,
        [user.tenantId, course.id, user.id],
      );
      if (active.rows[0]) throw new ConflictException("You already have access to this course.");

      const inserted = await client.query<Record<string, unknown>>(
        `INSERT INTO lms_payments
          (tenant_id, student_id, course_id, idempotency_key, amount_minor, currency, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'PENDING')
         RETURNING *`,
        [user.tenantId, user.id, course.id, idempotencyKey, course.amountMinor, course.currency],
      );
      return inserted.rows[0];
    });

    if (payment.razorpay_order_id || payment.status === "CAPTURED") {
      return {
        ...this.paymentSummary(payment),
        keyId: process.env.RAZORPAY_KEY_ID || null,
      };
    }

    let order: { id: string; amount: number; currency: string; status: string };
    try {
      order = await this.razorpay.createOrder({
        amount: Number(payment.amount_minor),
        currency: String(payment.currency),
        receipt: String(payment.id),
      });
    } catch (error) {
      await this.db.query(
        `UPDATE lms_payments SET status = 'FAILED', failure_reason = $2, failed_at = now(), updated_at = now()
         WHERE id = $1 AND status = 'PENDING'`,
        [payment.id, "Razorpay order creation failed."],
      );
      throw error;
    }
    if (order.amount !== Number(payment.amount_minor) || order.currency !== payment.currency) {
      await this.db.query(
        "UPDATE lms_payments SET status = 'FAILED', failure_reason = $2, failed_at = now(), updated_at = now() WHERE id = $1",
        [payment.id, "Razorpay order amount mismatch."],
      );
      throw new BadRequestException("The payment order could not be created.");
    }
    const updated = await this.db.query<Record<string, unknown>>(
      `UPDATE lms_payments
       SET razorpay_order_id = $2, status = 'ORDER_CREATED', updated_at = now()
       WHERE id = $1 AND status = 'PENDING'
       RETURNING *`,
      [payment.id, order.id],
    );
    return {
      ...this.paymentSummary(updated.rows[0] || { ...payment, razorpay_order_id: order.id, status: "ORDER_CREATED" }),
      keyId: process.env.RAZORPAY_KEY_ID || null,
    };
  }

  async verifyPayment(input: VerifyPaymentDto, user: AuthenticatedUser) {
    this.assertDirectStudent(user);
    const found = await this.db.query<Record<string, unknown>>(
      `SELECT * FROM lms_payments
       WHERE tenant_id = $1 AND student_id = $2 AND razorpay_order_id = $3
       LIMIT 1`,
      [user.tenantId, user.id, input.razorpayOrderId],
    );
    const payment = found.rows[0];
    if (!payment) throw new NotFoundException("Payment order not found.");
    if (payment.status === "CAPTURED" && payment.razorpay_payment_id === input.razorpayPaymentId) {
      return this.paymentSummary(payment);
    }
    if (!this.razorpay.verifyPaymentSignature(input.razorpayOrderId, input.razorpayPaymentId, input.razorpaySignature)) {
      await this.db.query(
        `UPDATE lms_payments SET status = 'FAILED', failure_reason = 'Invalid payment signature', failed_at = now(), updated_at = now()
         WHERE id = $1 AND status NOT IN ('CAPTURED', 'REFUNDED', 'PARTIALLY_REFUNDED')`,
        [payment.id],
      );
      throw new UnauthorizedException("Payment verification failed.");
    }

    const providerPayment = await this.razorpay.fetchPayment(input.razorpayPaymentId);
    if (
      providerPayment.order_id !== input.razorpayOrderId
      || providerPayment.amount !== Number(payment.amount_minor)
      || providerPayment.currency !== payment.currency
      || (providerPayment.status !== "captured" && providerPayment.captured !== true)
    ) {
      await this.db.query(
        `UPDATE lms_payments SET status = 'FAILED', failure_reason = 'Provider payment was not captured', failed_at = now(), updated_at = now()
         WHERE id = $1 AND status NOT IN ('CAPTURED', 'REFUNDED', 'PARTIALLY_REFUNDED')`,
        [payment.id],
      );
      throw new BadRequestException("The payment has not been captured.");
    }
    return this.activatePayment(payment.id as string, user.id, providerPayment);
  }

  private async activatePayment(paymentId: string, actorUserId: string | null, providerPayment: ProviderPayment) {
    return this.db.transaction(async (client) => {
      const locked = await client.query<Record<string, unknown>>(
        "SELECT * FROM lms_payments WHERE id = $1 FOR UPDATE",
        [paymentId],
      );
      const payment = locked.rows[0];
      if (!payment) throw new NotFoundException("Payment not found.");
      if (payment.status === "CAPTURED" || payment.status === "REFUNDED" || payment.status === "PARTIALLY_REFUNDED") {
        return this.paymentSummary(payment);
      }
      if (
        providerPayment.order_id !== payment.razorpay_order_id
        || providerPayment.amount !== Number(payment.amount_minor)
        || providerPayment.currency !== payment.currency
      ) {
        throw new BadRequestException("Payment details do not match the course order.");
      }
      const existingEnrollment = await client.query<Record<string, unknown>>(
        `SELECT id FROM lms_enrollments
         WHERE tenant_id = $1 AND course_id = $2 AND learner_id = $3 AND status = 'ACTIVE'
         LIMIT 1`,
        [payment.tenant_id, payment.course_id, payment.student_id],
      );
      let enrollmentId = existingEnrollment.rows[0]?.id;
      if (!enrollmentId) {
        const enrollment = await client.query<Record<string, unknown>>(
          `INSERT INTO lms_enrollments
            (tenant_id, institution_id, campus_id, course_id, learner_id, enrolled_by, assignment_source, assigned_by, assigned_at)
           VALUES ($1, NULL, NULL, $2, $3, $4, 'DIRECT', $4, now())
           ON CONFLICT DO NOTHING
           RETURNING id`,
          [payment.tenant_id, payment.course_id, payment.student_id, actorUserId || payment.student_id],
        );
        enrollmentId = enrollment.rows[0]?.id;
      }
      if (!enrollmentId) {
        const retry = await client.query<{ id: string }>(
          `SELECT id FROM lms_enrollments
           WHERE tenant_id = $1 AND course_id = $2 AND learner_id = $3 AND status = 'ACTIVE'
           LIMIT 1`,
          [payment.tenant_id, payment.course_id, payment.student_id],
        );
        enrollmentId = retry.rows[0]?.id;
      }
      await client.query(
        `UPDATE lms_payments
         SET razorpay_payment_id = $2, status = 'CAPTURED', captured_at = COALESCE(captured_at, now()), updated_at = now()
         WHERE id = $1`,
        [payment.id, providerPayment.id],
      );
      return {
        ...this.paymentSummary({ ...payment, razorpay_payment_id: providerPayment.id, status: "CAPTURED", captured_at: new Date() }),
        enrollmentId,
      };
    });
  }

  async handleWebhook(rawBody: Buffer, signature: string, eventId: string | undefined) {
    if (!this.razorpay.verifyWebhookSignature(rawBody, signature)) {
      throw new UnauthorizedException("Webhook verification failed.");
    }
    let payload: Record<string, any>;
    try {
      payload = JSON.parse(rawBody.toString("utf8")) as Record<string, any>;
    } catch {
      throw new BadRequestException("Invalid webhook payload.");
    }
    const providerEventId = eventId?.trim() || createHash("sha256").update(rawBody).digest("hex");
    const eventType = String(payload.event || "unknown");
    const paymentEntity = payload.payload?.payment?.entity;
    const refundEntity = payload.payload?.refund?.entity;
    const paymentLookup = paymentEntity?.order_id || null;
    const owner = await this.db.query<{ tenant_id: string; id: string }>(
      `SELECT tenant_id, id FROM lms_payments
       WHERE razorpay_order_id = $1 OR razorpay_payment_id = $2
       LIMIT 1`,
      [paymentLookup, paymentEntity?.id || null],
    );
    const inserted = await this.db.query<{ id: string }>(
      `INSERT INTO lms_payment_events
        (tenant_id, payment_id, provider_event_id, event_type, payload)
       VALUES ($1, $2, $3, $4, $5::jsonb)
       ON CONFLICT (provider_event_id) DO NOTHING
       RETURNING id`,
      [owner.rows[0]?.tenant_id || null, owner.rows[0]?.id || null, providerEventId, eventType, rawBody.toString("utf8")],
    );
    if (!inserted.rows[0]) return { received: true, duplicate: true };

    try {
      if (eventType === "payment.captured" && paymentEntity?.order_id && paymentEntity?.id) {
        const payment = await this.db.query<{ id: string; student_id: string }>(
          "SELECT id, student_id FROM lms_payments WHERE razorpay_order_id = $1 LIMIT 1",
          [paymentEntity.order_id],
        );
        if (payment.rows[0]) {
          await this.activatePayment(payment.rows[0].id, payment.rows[0].student_id, {
            id: paymentEntity.id,
            order_id: paymentEntity.order_id,
            amount: Number(paymentEntity.amount),
            currency: paymentEntity.currency,
            status: "captured",
            captured: true,
          });
        }
      } else if (eventType === "payment.failed" && paymentEntity?.order_id) {
        await this.db.query(
          `UPDATE lms_payments
           SET status = CASE WHEN status = 'CAPTURED' THEN status ELSE 'FAILED' END,
               failure_code = $2, failure_reason = $3, failed_at = now(), updated_at = now()
           WHERE razorpay_order_id = $1`,
          [paymentEntity.order_id, paymentEntity.error_code || null, paymentEntity.error_description || "Payment failed."],
        );
      } else if (eventType === "refund.processed" && refundEntity?.id) {
        await this.markRefundProcessed(String(refundEntity.id), Number(refundEntity.amount));
      } else if (eventType === "refund.failed" && refundEntity?.id) {
        await this.db.query(
          "UPDATE lms_refunds SET status = 'FAILED', failure_reason = $2, updated_at = now() WHERE razorpay_refund_id = $1",
          [refundEntity.id, refundEntity.error_description || "Refund failed."],
        );
      }
      await this.db.query("UPDATE lms_payment_events SET processing_status = 'PROCESSED', processed_at = now() WHERE id = $1", [inserted.rows[0].id]);
      return { received: true };
    } catch (error) {
      await this.db.query(
        "UPDATE lms_payment_events SET processing_status = 'FAILED', processed_at = now() WHERE id = $1",
        [inserted.rows[0].id],
      );
      throw error;
    }
  }

  async listOwnPayments(user: AuthenticatedUser) {
    const result = await this.db.query(
      `SELECT id, course_id, student_id, razorpay_order_id, razorpay_payment_id, amount_minor, currency, status, created_at, captured_at, refunded_at
       FROM lms_payments WHERE tenant_id = $1 AND student_id = $2 ORDER BY created_at DESC`,
      [user.tenantId, user.id],
    );
    return result.rows.map((row) => this.paymentSummary(row));
  }

  async listPayments(query: PaymentListQueryDto, user: AuthenticatedUser) {
    this.assertCitisAdmin(user);
    const values: unknown[] = [user.tenantId];
    const clauses = ["tenant_id = $1"];
    if (query.studentId) {
      values.push(query.studentId);
      clauses.push(`student_id = $${values.length}`);
    }
    if (query.courseId) {
      values.push(query.courseId);
      clauses.push(`course_id = $${values.length}`);
    }
    if (query.status) {
      values.push(query.status);
      clauses.push(`status = $${values.length}`);
    }
    const result = await this.db.query(
      `SELECT id, course_id, student_id, razorpay_order_id, razorpay_payment_id, amount_minor, currency, status, created_at, captured_at, refunded_at
       FROM lms_payments WHERE ${clauses.join(" AND ")} ORDER BY created_at DESC LIMIT 100`,
      values,
    );
    return result.rows.map((row) => this.paymentSummary(row));
  }

  async getPayment(id: string, user: AuthenticatedUser) {
    const result = await this.db.query<Record<string, unknown>>(
      "SELECT * FROM lms_payments WHERE id = $1 AND tenant_id = $2",
      [id, user.tenantId],
    );
    const payment = result.rows[0];
    if (!payment) throw new NotFoundException("Payment not found.");
    if (!user.roles.some((role) => role.code === "CITIS_ADMIN") && payment.student_id !== user.id) {
      throw new NotFoundException("Payment not found.");
    }
    return this.paymentSummary(payment);
  }

  async initiateRefund(id: string, input: CreateRefundDto, user: AuthenticatedUser) {
    this.assertCitisAdmin(user);
    const paymentResult = await this.db.query<Record<string, unknown>>(
      "SELECT * FROM lms_payments WHERE id = $1 AND tenant_id = $2 FOR UPDATE",
      [id, user.tenantId],
    );
    const payment = paymentResult.rows[0];
    if (!payment || !["CAPTURED", "PARTIALLY_REFUNDED"].includes(String(payment.status)) || !payment.razorpay_payment_id) {
      throw new ConflictException("Only a captured payment can be refunded.");
    }
    const refundedResult = await this.db.query<{ total: string }>(
      "SELECT COALESCE(sum(amount_minor), 0)::text AS total FROM lms_refunds WHERE payment_id = $1 AND status IN ('PENDING', 'PROCESSED')",
      [id],
    );
    const remaining = Number(payment.amount_minor) - Number(refundedResult.rows[0]?.total || 0);
    const amount = input.amountMinor ?? remaining;
    if (amount <= 0 || amount > remaining) throw new BadRequestException("The refund amount is invalid.");
    const refund = await this.db.query<Record<string, unknown>>(
      `INSERT INTO lms_refunds (tenant_id, payment_id, initiated_by, amount_minor, reason, status)
       VALUES ($1, $2, $3, $4, $5, 'PENDING') RETURNING *`,
      [user.tenantId, id, user.id, amount, input.reason.trim()],
    );
    try {
      const providerRefund = await this.razorpay.refundPayment(String(payment.razorpay_payment_id), {
        amount,
        notes: { reason: input.reason.trim(), paymentReference: id },
      });
      return await this.markRefundProcessed(String(providerRefund.id), Number(providerRefund.amount), refund.rows[0].id);
    } catch (error) {
      await this.db.query(
        "UPDATE lms_refunds SET status = 'FAILED', failure_reason = $2, updated_at = now() WHERE id = $1",
        [refund.rows[0].id, "Razorpay refund request failed."],
      );
      throw error;
    }
  }

  private async markRefundProcessed(providerRefundId: string, amount: number, refundId?: string) {
    const refundResult = await this.db.query<Record<string, unknown>>(
      `SELECT r.*, p.student_id, p.course_id, p.amount_minor AS payment_amount
       FROM lms_refunds r JOIN lms_payments p ON p.id = r.payment_id
       WHERE ${refundId ? "r.id = $1" : "r.razorpay_refund_id = $1"}
       LIMIT 1`,
      [refundId || providerRefundId],
    );
    const refund = refundResult.rows[0];
    if (!refund) return { received: true, ignored: true };
    const updated = await this.db.query<Record<string, unknown>>(
      `UPDATE lms_refunds SET razorpay_refund_id = COALESCE(razorpay_refund_id, $2), status = 'PROCESSED',
         processed_at = COALESCE(processed_at, now()), updated_at = now()
       WHERE id = $1 AND status <> 'PROCESSED' RETURNING *`,
      [refund.id, providerRefundId],
    );
    if (!updated.rows[0]) return updated.rows[0] || refund;
    const total = await this.db.query<{ total: string }>(
      "SELECT COALESCE(sum(amount_minor), 0)::text AS total FROM lms_refunds WHERE payment_id = $1 AND status = 'PROCESSED'",
      [refund.payment_id],
    );
    const paymentStatus = Number(total.rows[0]?.total || 0) >= Number(refund.payment_amount) ? "REFUNDED" : "PARTIALLY_REFUNDED";
    await this.db.query(
      "UPDATE lms_payments SET status = $2, refunded_at = now(), updated_at = now() WHERE id = $1",
      [refund.payment_id, paymentStatus],
    );
    await this.db.query(
      `UPDATE lms_enrollments SET status = 'REMOVED', removed_by = $3, removed_at = now(), updated_at = now()
       WHERE tenant_id = $1 AND course_id = $2 AND learner_id = $4 AND assignment_source = 'DIRECT' AND status = 'ACTIVE'`,
      [refund.tenant_id, refund.course_id, refund.initiated_by, refund.student_id],
    );
    return updated.rows[0];
  }
}