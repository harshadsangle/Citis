import { createHmac, timingSafeEqual } from "node:crypto";
import { Injectable, ServiceUnavailableException, UnauthorizedException } from "@nestjs/common";

type RazorpayOrder = {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
  receipt?: string;
};

type RazorpayPayment = {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
  captured?: boolean;
};

type RazorpayRefund = {
  id: string;
  amount: number;
  status: string;
};

@Injectable()
export class RazorpayClient {
  private configuration() {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      throw new ServiceUnavailableException("Razorpay payments are not configured.");
    }
    return { keyId, keySecret, baseUrl: process.env.RAZORPAY_BASE_URL || "https://api.razorpay.com/v1" };
  }

  async createOrder(input: { amount: number; currency: string; receipt: string }) {
    const config = this.configuration();
    return this.request<RazorpayOrder>("/orders", {
      method: "POST",
      body: JSON.stringify(input),
      headers: { "Content-Type": "application/json" },
      config,
    });
  }

  async fetchPayment(paymentId: string) {
    const config = this.configuration();
    return this.request<RazorpayPayment>(`/payments/${encodeURIComponent(paymentId)}`, {
      method: "GET",
      config,
    });
  }

  async refundPayment(paymentId: string, input: { amount: number; notes: { reason: string; paymentReference: string } }) {
    const config = this.configuration();
    return this.request<RazorpayRefund>(`/payments/${encodeURIComponent(paymentId)}/refund`, {
      method: "POST",
      body: JSON.stringify(input),
      headers: { "Content-Type": "application/json" },
      config,
    });
  }

  verifyPaymentSignature(orderId: string, paymentId: string, signature: string) {
    const { keySecret } = this.configuration();
    return this.safeCompare(
      createHmac("sha256", keySecret).update(`${orderId}|${paymentId}`).digest("hex"),
      signature,
    );
  }

  verifyWebhookSignature(payload: Buffer, signature: string) {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) throw new ServiceUnavailableException("Razorpay webhook verification is not configured.");
    return this.safeCompare(createHmac("sha256", webhookSecret).update(payload).digest("hex"), signature);
  }

  private safeCompare(expected: string, actual: string) {
    const expectedBuffer = Buffer.from(expected, "utf8");
    const actualBuffer = Buffer.from(actual, "utf8");
    return expectedBuffer.length === actualBuffer.length && timingSafeEqual(expectedBuffer, actualBuffer);
  }

  private async request<T extends object>(
    path: string,
    input: {
      method: "GET" | "POST";
      body?: string;
      headers?: Record<string, string>;
      config: { keyId: string; keySecret: string; baseUrl: string };
    },
  ) {
    const response = await fetch(`${input.config.baseUrl}${path}`, {
      method: input.method,
      headers: {
        Authorization: `Basic ${Buffer.from(`${input.config.keyId}:${input.config.keySecret}`).toString("base64")}`,
        ...input.headers,
      },
      body: input.body,
    });
    const body = await response.text();
    let parsed: T | { error?: { code?: string; description?: string } } = {};
    try {
      parsed = JSON.parse(body) as T;
    } catch {
      // The provider returned a non-JSON error; keep the outward error generic.
    }
    if (!response.ok) {
      const providerError = "error" in parsed ? parsed.error?.description : undefined;
      throw new ServiceUnavailableException(providerError ? "Razorpay rejected the payment request." : "Razorpay is temporarily unavailable.");
    }
    return parsed as T;
  }
}