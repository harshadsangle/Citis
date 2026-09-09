import { Module } from "@nestjs/common";
import { PaymentsController } from "./payments.controller";
import { PaymentsService } from "./payments.service";
import { RazorpayClient } from "./razorpay.client";

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, RazorpayClient],
})
export class PaymentsModule {}