import { IsArray, IsOptional, IsString, IsUUID, Length } from "class-validator";

export class CreateRoleDto {
  @IsString()
  @Length(2, 100)
  name!: string;

  @IsString()
  @Length(2, 80)
  code!: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class AssignPermissionsDto {
  @IsArray()
  @IsUUID("4", { each: true })
  permissionIds!: string[];
}