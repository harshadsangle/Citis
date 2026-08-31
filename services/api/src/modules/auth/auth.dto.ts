import { IsEmail, IsIn, IsOptional, IsString, Length, MinLength } from "class-validator";

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