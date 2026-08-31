import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsDateString, IsDefined, IsIn, IsInt, IsNumber, IsObject, IsOptional, IsString, IsUUID, IsUrl, Length, Matches, Max, Min, ValidateNested } from "class-validator";

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

export const ASSIGNMENT_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

export class AssignmentListQueryDto {
  @IsOptional()
  @IsUUID()
  courseId?: string;

  @IsOptional()
  @IsIn(ASSIGNMENT_STATUSES)
  status?: string;
}

export class AssessmentAttemptListQueryDto {
  @IsOptional()
  @IsIn(["SUBMITTED"])
  status?: string;

  @IsOptional()
  @IsIn(["PENDING", "GRADED", "NOT_REQUIRED"])
  gradingStatus?: string;
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

export const LMS_ASSESSMENT_TYPES = ["PRACTICE_QUIZ", "FORMATIVE", "SUMMATIVE", "ASSIGNMENT", "PROJECT", "VIVA", "PRACTICAL"] as const;
export const LMS_QUESTION_TYPES = ["SINGLE_CHOICE", "MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_TEXT", "NUMERIC"] as const;

export class CreateAssessmentDto {
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

  @IsIn(LMS_ASSESSMENT_TYPES)
  assessmentType!: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  totalMarks?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  passingMarks?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1440)
  durationMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  attemptLimit?: number;
}

export class UpdateAssessmentDto {
  @IsOptional()
  @IsString()
  @Length(2, 180)
  title?: string;

  @IsOptional()
  @IsString()
  @Max(4000)
  description?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  totalMarks?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  passingMarks?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1440)
  durationMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  attemptLimit?: number;
}

export class CreateAssessmentOptionDto {
  @IsString()
  @Length(1, 300)
  value!: string;

  @IsString()
  @Length(1, 300)
  label!: string;

  @IsBoolean()
  isCorrect!: boolean;
}

export class UpdateAssessmentOptionDto {
  @IsOptional()
  @IsString()
  @Length(1, 300)
  value?: string;

  @IsOptional()
  @IsString()
  @Length(1, 300)
  label?: string;

  @IsOptional()
  @IsBoolean()
  isCorrect?: boolean;
}

export class CreateAssessmentQuestionDto {
  @IsString()
  @Length(2, 2000)
  prompt!: string;

  @IsIn(LMS_QUESTION_TYPES)
  questionType!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(100000)
  marks!: number;

  @IsInt()
  @Min(1)
  sequence!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAssessmentOptionDto)
  options!: CreateAssessmentOptionDto[];
}

export class UpdateAssessmentQuestionDto {
  @IsOptional()
  @IsString()
  @Length(2, 2000)
  prompt?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(100000)
  marks?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  sequence?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAssessmentOptionDto)
  options?: CreateAssessmentOptionDto[];
}

export class AssessmentAnswerDto {
  @IsUUID()
  questionId!: string;

  @IsDefined()
  @IsObject()
  answer!: Record<string, unknown>;
}

export class SubmitAssessmentAttemptDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssessmentAnswerDto)
  answers!: AssessmentAnswerDto[];
}

export class GradeAssessmentAttemptDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GradeAssessmentQuestionDto)
  grades!: GradeAssessmentQuestionDto[];

  @IsOptional()
  @IsString()
  @Max(10000)
  feedback?: string;
}

export class GradeAssessmentQuestionDto {
  @IsUUID()
  questionId!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100000)
  awardedMarks!: number;
}