import { IsIn, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CollegeStudentStatusDto {
  @IsIn(["ACTIVE", "INACTIVE"])
  status!: "ACTIVE" | "INACTIVE";
}

export class CollegeStudentListQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  institutionId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  search?: string;

  @IsOptional()
  @IsIn(["ACTIVE", "INACTIVE"])
  status?: "ACTIVE" | "INACTIVE";
}

export class CollegeStudentLoginDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  collegeUserId!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  tenantSlug?: string;
}