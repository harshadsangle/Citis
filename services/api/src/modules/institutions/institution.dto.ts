import { IsEmail, IsIn, IsOptional, IsString, IsUrl, Length, Matches } from "class-validator";

export type InstitutionStatus = "ACTIVE" | "SUSPENDED" | "ARCHIVED";

export class CreateInstitutionDto {
  @IsString()
  @Length(2, 180)
  name!: string;

  @IsOptional()
  @IsString()
  @Length(2, 80)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug?: string;

  @IsOptional()
  @IsString()
  @Length(2, 60)
  institutionType?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Length(7, 30)
  phone?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsIn(["ACTIVE", "SUSPENDED", "ARCHIVED"])
  status?: InstitutionStatus;

  @IsOptional()
  @IsString()
  tenantId?: string;
}

export class UpdateInstitutionDto {
  @IsOptional()
  @IsString()
  @Length(2, 180)
  name?: string;

  @IsOptional()
  @IsIn(["ACTIVE", "SUSPENDED", "ARCHIVED"])
  status?: InstitutionStatus;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Length(7, 30)
  phone?: string;

  @IsOptional()
  @IsUrl()
  website?: string;
}