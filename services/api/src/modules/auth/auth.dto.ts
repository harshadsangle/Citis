import { IsEmail, IsIn, IsOptional, IsString, Length, Matches, MaxLength, MinLength } from "class-validator";
import { STRONG_PASSWORD_PATTERN } from "./password-security";

export class LoginDto {
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  tenantSlug?: string;
}

export class RegisterDto {
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(STRONG_PASSWORD_PATTERN, {
    message: "Password must be 8–128 characters and include uppercase, lowercase, and a number.",
  })
  password!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(80)
  @Matches(/\S/, { message: "First name cannot be blank." })
  firstName!: string;

  @IsString()
  @MaxLength(80)
  lastName!: string;

  @IsIn(["learner", "instructor", "admin"])
  role!: "learner" | "instructor" | "admin";

  @IsOptional()
  @IsString()
  @MaxLength(80)
  tenantSlug?: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  tenantSlug?: string;
}

export class ResetPasswordDto {
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(STRONG_PASSWORD_PATTERN, {
    message: "Password must be 8–128 characters and include uppercase, lowercase, and a number.",
  })
  password!: string;
}

export class ChangePasswordDto {
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  currentPassword!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(STRONG_PASSWORD_PATTERN, {
    message: "New password must be 8–128 characters and include uppercase, lowercase, and a number.",
  })
  newPassword!: string;
}

export class MfaChannelDto {
  @IsIn(["EMAIL", "SMS"])
  channel!: "EMAIL" | "SMS";
}

export class MfaEnrollmentDto extends MfaChannelDto {
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  currentPassword!: string;
}

export class MfaChallengeDto {
  @IsString()
  @Length(43, 43)
  challengeToken!: string;

  @IsString()
  @Matches(/^\d{6}$/, { message: "Verification code must be exactly 6 digits." })
  code!: string;
}

export class OtpRequestDto {
  @IsString()
  @Length(8, 20)
  mobile!: string;

  @IsString()
  @Length(1, 80)
  tenantSlug!: string;
}

export class OtpVerifyDto extends OtpRequestDto {
  @IsString()
  @Length(4, 8)
  code!: string;
}

export class ProviderDto {
  @IsIn(["google", "microsoft", "sso"])
  provider!: "google" | "microsoft" | "sso";
}