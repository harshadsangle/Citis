import { IsBoolean, IsDateString, IsIn, IsInt, IsNumber, IsOptional, IsString, IsUUID, IsUrl, Length, Matches, Max, Min } from "class-validator";

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

  @IsOptional()
  @IsUUID()
  campusId?: string;

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

  @IsOptional()
  @IsUUID()
  campusId?: string;

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

export const LMS_RELATIONSHIP_STATUSES = ["ACTIVE", "REMOVED"] as const;

export class RelationshipListQueryDto {
  @IsOptional()
  @IsIn(LMS_RELATIONSHIP_STATUSES)
  status?: string;
}

export class CandidateListQueryDto {
  @IsOptional()
  @IsString()
  @Length(0, 120)
  search?: string;
}

export class EnrollLearnerDto {
  @IsUUID()
  learnerId!: string;
}

export class AssignInstructorDto {
  @IsUUID()
  instructorId!: string;
}

export class ProgressViewerQueryDto {
  @IsOptional()
  @IsUUID()
  learnerId?: string;
}

export class CompleteAssessmentDto {
  @IsUUID()
  assessmentId!: string;

  @IsString()
  @Length(1, 180)
  attemptId!: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  score?: number;

  @IsOptional()
  @IsBoolean()
  passed?: boolean;

  @IsOptional()
  @IsDateString()
  completedAt?: string;
}

export const ASSIGNMENT_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

export class AssignmentListQueryDto {
  @IsOptional()
  @IsUUID()
  courseId?: string;

  @IsOptional()
  @IsIn(ASSIGNMENT_STATUSES)
  status?: string;
}

export class CreateAssignmentDto {
  @IsUUID()
  courseId!: string;

  @IsUUID()
  moduleId!: string;

  @IsString()
  @Length(2, 180)
  title!: string;

  @IsOptional()
  @IsString()
  @Max(4000)
  description?: string;

  @IsString()
  @Length(2, 12000)
  instructions!: string;

  @IsOptional()
  @IsDateString()
  dueAt?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(100000)
  maxMarks!: number;
}

export class UpdateAssignmentDto {
  @IsOptional()
  @IsString()
  @Length(2, 180)
  title?: string;

  @IsOptional()
  @IsString()
  @Max(4000)
  description?: string;

  @IsOptional()
  @IsString()
  @Length(2, 12000)
  instructions?: string;

  @IsOptional()
  @IsDateString()
  dueAt?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(100000)
  maxMarks?: number;
}

export class SubmitAssignmentDto {
  @IsString()
  @Length(1, 20000)
  submissionText!: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  @Max(2048)
  attachmentUrl?: string;
}

export class GradeAssignmentSubmissionDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  grade!: number;

  @IsOptional()
  @IsString()
  @Max(10000)
  feedback?: string;
}