import { IsDateString, IsIn, IsOptional, IsString, IsUUID, Length, MaxLength } from "class-validator";
export class AcademicBaseDto {
 @IsUUID() institutionId!: string; @IsOptional() @IsUUID() campusId?: string;
 @IsString() @Length(1,160) name!: string; @IsString() @Length(1,48) code!: string;
 @IsOptional() @IsString() @MaxLength(2000) description?: string;
}
export class CreateFacultyDto extends AcademicBaseDto {}
export class CreateDepartmentDto extends AcademicBaseDto { @IsUUID() facultyId!: string; }
export class CreateSemesterDto {
 @IsUUID() institutionId!: string; @IsOptional() @IsUUID() campusId?: string;
 @IsString() @Length(1,48) code!: string; @IsString() @Length(1,160) name!: string;
 @IsDateString() startDate!: string; @IsDateString() endDate!: string;
}
export class UpdateAcademicDto { @IsOptional() @IsString() @Length(1,160) name?: string; @IsOptional() @IsString() @MaxLength(2000) description?: string; @IsOptional() @IsIn(["ACTIVE","ARCHIVED","DRAFT","CLOSED"]) status?: string; }
export class CreateOfferingDto { @IsUUID() institutionId!: string; @IsUUID() courseId!: string; @IsUUID() semesterId!: string; @IsOptional() @IsUUID() campusId?: string; @IsOptional() @IsString() @MaxLength(80) section?: string; }