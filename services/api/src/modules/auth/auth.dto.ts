import { IsEmail, IsIn, IsOptional, IsString, Length, Matches, MaxLength, MinLength } from "class-validator";

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsString()
  tenantSlug?: string;
}

const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,128}$/;

export class RegisterDto {
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(strongPasswordPattern, {
    message: "Password must be 8–128 characters and include uppercase, lowercase, and a number.",
  })
  password!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(80)
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
  @Matches(strongPasswordPattern, {
    message: "Password must be 8–128 characters and include uppercase, lowercase, and a number.",
  })
  password!: string;
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