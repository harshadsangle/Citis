import { IsIn, IsOptional, IsString, IsUUID } from "class-validator";

export class ActivateModuleDto {
  @IsUUID()
  moduleId!: string;

  @IsIn(["ACTIVE", "INACTIVE", "SUSPENDED", "EXPIRED"])
  status!: string;

  @IsOptional()
  @IsString()
  expiresAt?: string;
}