import { Body, Controller, Get, Headers, Param, ParseUUIDPipe, Post, Query, Req, UnauthorizedException, UseGuards } from "@nestjs/common";
import type { ContextRequest } from "../../common/request-context";
import { successResponse } from "../../common/response";
import { AuthGuard } from "../auth/auth.guard";
import { PermissionGuard } from "../../guards/permission.guard";
import { RequirePermission } from "../../guards/permission.decorator";
import { CreatePaymentOrderDto, CreateRefundDto, PaymentListQueryDto, VerifyPaymentDto } from "./payments.dto";
import { PaymentsService } from "./payments.service";

@Controller("payments")
@UseGuards(AuthGuard, PermissionGuard)
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Post("courses/:courseId/order")
  @RequirePermission("payments.payment.create")
  async createOrder(@Param("courseId", ParseUUIDPipe) courseId: string, @Body() input: CreatePaymentOrderDto, @Req() request: ContextRequest) {
    return successResponse(await this.payments.createOrder(courseId, input, request.context.user!, request.context.requestId), request);
  }

  @Post("verify")
  @RequirePermission("payments.payment.create")
  async verify(@Body() input: VerifyPaymentDto, @Req() request: ContextRequest) {
    return successResponse(await this.payments.verifyPayment(input, request.context.user!, request.context.requestId), request);
  }

  @Get("me")
  @RequirePermission("payments.payment.view")
  async mine(@Req() request: ContextRequest) {
    return successResponse(await this.payments.listOwnPayments(request.context.user!), request);
  }

  @Get()
  @RequirePermission("payments.payment.view")
  async list(@Query() query: PaymentListQueryDto, @Req() request: ContextRequest) {
    return successResponse(await this.payments.listPayments(query, request.context.user!), request);
  }

  @Get(":id")
  @RequirePermission("payments.payment.view")
  async get(@Param("id", ParseUUIDPipe) id: string, @Req() request: ContextRequest) {
    return successResponse(await this.payments.getPayment(id, request.context.user!), request);
  }

  @Post(":id/refund")
  @RequirePermission("payments.refund.create")
  async refund(@Param("id", ParseUUIDPipe) id: string, @Body() input: CreateRefundDto, @Req() request: ContextRequest) {
    return successResponse(await this.payments.initiateRefund(id, input, request.context.user!, request.context.requestId), request);
  }
}

@Controller("payments")
export class RazorpayWebhookController {
  constructor(private readonly payments: PaymentsService) {}

  @Post("webhooks/razorpay")
  async webhook(@Headers("x-razorpay-signature") signature: string | undefined, @Headers("x-razorpay-event-id") eventId: string | undefined, @Req() request: ContextRequest & { rawBody?: Buffer }) {
    if (!request.rawBody || !signature) {
      throw new UnauthorizedException("Webhook verification failed.");
    }
    return successResponse(await this.payments.handleWebhook(request.rawBody, signature, eventId), request);
  }
}