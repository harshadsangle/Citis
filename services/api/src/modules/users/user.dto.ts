import { IsEmail, IsOptional, IsString, IsUUID, Length, MinLength } from "class-validator";

export class CreateUserDto {
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Length(8, 20)
  mobile?: string;

  @IsString()
  @Length(1, 80)
  firstName!: string;

  @IsOptional()
  @IsString()
  @Length(0, 80)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(1, 80)
  firstName?: string;

  @IsOptional()
  @IsString()
  @Length(0, 80)
  lastName?: string;

  @IsOptional()
  @IsString()
  @Length(8, 20)
  mobile?: string;

  @IsOptional()
  @IsString()
  status?: string;
}

export class AssignRoleDto {
  @IsUUID()
  roleId!: string;

  @IsOptional()
  @IsUUID()
  institutionId?: string;

  @IsOptional()
  @IsUUID()
  campusId?: string;
}