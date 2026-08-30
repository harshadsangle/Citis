import { IsIn, IsOptional, IsString, Length, Matches } from "class-validator";

export class CreateTenantDto {
  @IsString()
  @Length(2, 160)
  name!: string;

  @IsOptional()
  @IsString()
  @Length(2, 80)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug?: string;
}

export class UpdateTenantDto {
  @IsOptional()
  @IsString()
  @Length(2, 160)
  name?: string;

  @IsOptional()
  @IsIn(["ACTIVE", "SUSPENDED", "ARCHIVED"])
  status?: string;
}