import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, IsUUID, Length, Max, Min } from "class-validator";

export class CreatePaymentOrderDto {
  @IsString()
  @Length(8, 128)
  idempotencyKey!: string;
}

export class VerifyPaymentDto {
  @IsString()
  @Length(4, 64)
  razorpayOrderId!: string;

  @IsString()
  @Length(4, 64)
  razorpayPaymentId!: string;

  @IsString()
  @Length(32, 128)
  razorpaySignature!: string;
}

export class CreateRefundDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000000000)
  amountMinor?: number;

  @IsString()
  @Length(3, 500)
  reason!: string;
}

export class PaymentListQueryDto {
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @IsOptional()
  @IsUUID()
  courseId?: string;

  @IsOptional()
  @IsString()
  status?: string;
}