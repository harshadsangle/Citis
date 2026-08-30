import { IsIn, IsInt, IsOptional, IsString, IsUUID, IsUrl, Length, Matches, Max, Min } from "class-validator";

export const LMS_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
export const LMS_RESOURCE_TYPES = ["VIDEO", "PDF", "DOCUMENT", "PRESENTATION", "LINK", "SCORM", "INTERACTIVE"] as const;

export class ContentListQueryDto {
  @IsOptional()
  @IsIn(LMS_STATUSES)
  status?: string;
}

export class CreateProgrammeDto {
  @IsUUID()
  institutionId!: string;

  @IsString()
  @Length(2, 180)
  name!: string;

  @IsString()
  @Length(2, 48)
  @Matches(/^[A-Za-z0-9][A-Za-z0-9_-]*$/)
  code!: string;

  @IsOptional()
  @IsString()
  @Max(2000)
  description?: string;
}

export class UpdateProgrammeDto {
  @IsOptional()
  @IsString()
  @Length(2, 180)
  name?: string;

  @IsOptional()
  @IsString()
  @Max(2000)
  description?: string;
}

export class CreateCourseDto {
  @IsUUID()
  programmeId!: string;

  @IsString()
  @Length(2, 180)
  title!: string;

  @IsString()
  @Length(2, 48)
  @Matches(/^[A-Za-z0-9][A-Za-z0-9_-]*$/)
  code!: string;

  @IsOptional()
  @IsString()
  @Max(2000)
  description?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  @Max(2048)
  thumbnail?: string;
}

export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  @Length(2, 180)
  title?: string;

  @IsOptional()
  @IsString()
  @Max(2000)
  description?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  @Max(2048)
  thumbnail?: string;
}

export class CreateCourseModuleDto {
  @IsUUID()
  courseId!: string;

  @IsString()
  @Length(2, 180)
  title!: string;

  @IsOptional()
  @IsString()
  @Max(2000)
  description?: string;

  @IsInt()
  @Min(1)
  sequence!: number;
}

export class UpdateCourseModuleDto {
  @IsOptional()
  @IsString()
  @Length(2, 180)
  title?: string;

  @IsOptional()
  @IsString()
  @Max(2000)
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  sequence?: number;
}

export class CreateLessonDto {
  @IsUUID()
  moduleId!: string;

  @IsString()
  @Length(2, 180)
  title!: string;

  @IsOptional()
  @IsString()
  @Max(2000)
  description?: string;

  @IsInt()
  @Min(1)
  sequence!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100000)
  estimatedDuration?: number;
}

export class UpdateLessonDto {
  @IsOptional()
  @IsString()
  @Length(2, 180)
  title?: string;

  @IsOptional()
  @IsString()
  @Max(2000)
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  sequence?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100000)
  estimatedDuration?: number;
}

export class CreateLearningResourceDto {
  @IsUUID()
  lessonId!: string;

  @IsIn(LMS_RESOURCE_TYPES)
  resourceType!: string;

  @IsString()
  @Length(2, 180)
  title!: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  @Max(2048)
  url?: string;

  @IsOptional()
  @IsString()
  @Max(2048)
  filePath?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100000)
  duration?: number;

  @IsInt()
  @Min(1)
  sequence!: number;
}

export class UpdateLearningResourceDto {
  @IsOptional()
  @IsIn(LMS_RESOURCE_TYPES)
  resourceType?: string;

  @IsOptional()
  @IsString()
  @Length(2, 180)
  title?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  @Max(2048)
  url?: string;

  @IsOptional()
  @IsString()
  @Max(2048)
  filePath?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100000)
  duration?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  sequence?: number;
}