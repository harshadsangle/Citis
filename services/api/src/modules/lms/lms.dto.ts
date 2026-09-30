import { Type } from "class-transformer";
import { ArrayMinSize, ArrayUnique, IsArray, IsBoolean, IsDateString, IsDefined, IsIn, IsInt, IsNumber, IsObject, IsOptional, IsString, IsUUID, IsUrl, Length, Matches, Max, MaxLength, Min, ValidateIf, ValidateNested } from "class-validator";

export const LMS_STATUSES = ["DRAFT", "INSTRUCTOR_PENDING", "REJECTED", "PUBLISHED", "ARCHIVED"] as const;
export const LMS_RESOURCE_TYPES = ["VIDEO", "PDF", "DOCUMENT", "PRESENTATION", "LINK", "SCORM", "INTERACTIVE"] as const;

export class ContentListQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;

  @IsOptional()
  @IsIn(LMS_STATUSES)
  status?: string;

  // These filters are read as separate controller query parameters for the
  // programme → course → module → lesson → resource hierarchy. They must
  // still be declared here because ValidationPipe validates the full query.
  @IsOptional()
  @IsUUID()
  programmeId?: string;

  @IsOptional()
  @IsUUID()
  institutionId?: string;

  @IsOptional()
  @IsUUID()
  courseId?: string;

  @IsOptional()
  @IsUUID()
  moduleId?: string;

  @IsOptional()
  @IsUUID()
  lessonId?: string;

  @IsOptional()
  @IsUUID()
  unitId?: string;

  @IsOptional()
  @IsUUID()
  chapterId?: string;
}

export class UpdateLearningResourceProgressDto {
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  @Max(86400)
  positionSeconds!: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  @Max(86400)
  durationSeconds!: number;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}

export class CreateCourseUnitDto {
  @IsUUID() courseId!: string;
  @IsString() @Length(2, 180) title!: string;
  @IsOptional() @IsString() @MaxLength(2000) description?: string;
  @IsInt() @Min(1) sequence!: number;
}

export class UpdateCourseUnitDto {
  @IsOptional() @IsString() @Length(2, 180) title?: string;
  @IsOptional() @IsString() @MaxLength(2000) description?: string;
  @IsOptional() @IsInt() @Min(1) sequence?: number;
}

export class CreateCourseChapterDto {
  @IsUUID() unitId!: string;
  @IsString() @Length(2, 180) title!: string;
  @IsOptional() @IsString() @MaxLength(2000) description?: string;
  @IsInt() @Min(1) sequence!: number;
}

export class UpdateCourseChapterDto {
  @IsOptional() @IsString() @Length(2, 180) title?: string;
  @IsOptional() @IsString() @MaxLength(2000) description?: string;
  @IsOptional() @IsInt() @Min(1) sequence?: number;
}

export const LMS_LIVE_CLASS_PROVIDERS = ["ZOOM", "GOOGLE_MEET", "MICROSOFT_TEAMS", "WEBEX"] as const;
export const LMS_LIVE_CLASS_STATUSES = ["SCHEDULED", "CANCELLED", "COMPLETED", "ARCHIVED"] as const;
const LIVE_CLASS_TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

export class LiveClassListQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;

  @IsOptional()
  @IsUUID()
  courseId?: string;

  @IsOptional()
  @IsIn(LMS_LIVE_CLASS_STATUSES)
  status?: string;

  // "mine" narrows the list to the caller's own enrolments or instructor
  // assignments. "upcoming" hides classes that already started.
  @IsOptional()
  @IsIn(["mine", "upcoming", "past"])
  scope?: string;
}

export class CreateLiveClassDto {
  @IsUUID()
  courseId!: string;

  @IsOptional()
  @IsUUID()
  moduleId?: string | null;

  @IsOptional()
  @IsUUID()
  unitId?: string | null;

  @IsOptional()
  @IsUUID()
  chapterId?: string | null;

  @IsString()
  @Length(2, 180)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsDateString({ strict: true })
  scheduledDate!: string;

  @Matches(LIVE_CLASS_TIME, { message: "startTime must use 24-hour HH:MM format." })
  startTime!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1440)
  durationMinutes!: number;

  @IsIn(LMS_LIVE_CLASS_PROVIDERS)
  provider!: string;

  @IsUrl({ require_tld: false })
  @MaxLength(2048)
  meetingUrl!: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(2048)
  recordingUrl?: string;
}

export class UpdateLiveClassDto {
  @IsOptional()
  @IsUUID()
  moduleId?: string | null;

  @IsOptional()
  @IsUUID()
  unitId?: string | null;

  @IsOptional()
  @IsUUID()
  chapterId?: string | null;

  @IsOptional()
  @IsString()
  @Length(2, 180)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsDateString({ strict: true })
  scheduledDate?: string;

  @IsOptional()
  @Matches(LIVE_CLASS_TIME, { message: "startTime must use 24-hour HH:MM format." })
  startTime?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1440)
  durationMinutes?: number;

  @IsOptional()
  @IsIn(LMS_LIVE_CLASS_PROVIDERS)
  provider?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(2048)
  meetingUrl?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(2048)
  recordingUrl?: string | null;
}

export class LiveClassStatusDto {
  @IsIn(["SCHEDULED", "CANCELLED", "COMPLETED", "ARCHIVED"])
  status!: string;
}

export class ReorderHierarchyDto {
  @IsUUID()
  id!: string;

  @IsUUID()
  swapWithId!: string;
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
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsUUID()
  departmentId?: string;
}

export class UpdateProgrammeDto {
  @IsOptional()
  @IsString()
  @Length(2, 180)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsUUID()
  departmentId?: string | null;
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
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(2048)
  thumbnail?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1000000000)
  priceMinor?: number;

  @IsOptional()
  @IsIn(["INR"])
  currency?: string;

  @IsOptional()
  @IsBoolean()
  purchasable?: boolean;
}

export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  @Length(2, 180)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(2048)
  thumbnail?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1000000000)
  priceMinor?: number;

  @IsOptional()
  @IsBoolean()
  purchasable?: boolean;
}

export class RejectCourseDto {
  @IsString()
  @Length(2, 2000)
  reason!: string;
}

export class PublishCourseDto {
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID("4", { each: true })
  institutionIds?: string[];
}

export class ReplaceCourseInstitutionAllocationsDto {
  @IsDefined()
  @IsArray()
  @ArrayUnique()
  @IsUUID("4", { each: true })
  institutionIds!: string[];
}

export class CreateCourseModuleDto {
  @IsUUID()
  courseId!: string;

  @IsString()
  @Length(2, 180)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsInt()
  @Min(1)
  sequence!: number;

  @IsOptional()
  @IsUUID()
  chapterId?: string;
}

export class UpdateCourseModuleDto {
  @IsOptional()
  @IsString()
  @Length(2, 180)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  sequence?: number;

  @IsOptional()
  @IsUUID()
  chapterId?: string;
}

export class CreateLessonDto {
  @IsUUID()
  moduleId!: string;

  @IsString()
  @Length(2, 180)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
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
  @MaxLength(2000)
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

  @ValidateIf((_object, value) => value !== undefined && value !== "")
  @IsString()
  @IsUrl({ require_tld: false })
  @MaxLength(2048)
  url?: string;

  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @MaxLength(2048)
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
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;

  @IsOptional()
  @IsIn(LMS_RELATIONSHIP_STATUSES)
  status?: string;
}

export class CandidateListQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;

  @IsOptional()
  @IsString()
  @Length(0, 120)
  search?: string;
}

export class EnrollLearnerDto {
  @IsUUID()
  learnerId!: string;
}

export class AssignInstructorCollegeDto {
  @IsUUID()
  instructorId!: string;

  @IsUUID()
  institutionId!: string;
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

export class CertificateListQueryDto {
  @IsOptional()
  @IsUUID()
  courseId?: string;

  @IsOptional()
  @IsUUID()
  learnerId?: string;
}

export const ASSIGNMENT_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

export class AssignmentListQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;

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
export const LMS_QUESTION_TYPES = [
  "SINGLE_CHOICE",
  "MULTIPLE_CHOICE",
  "TRUE_FALSE",
  "SHORT_TEXT",
  "NUMERIC",
  "FILL_IN_BLANK",
  "MATCHING",
  "LONG_ANSWER",
] as const;

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

  @IsOptional()
  @IsBoolean()
  randomizeQuestions?: boolean;

  @IsOptional()
  @IsBoolean()
  randomizeOptions?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(500)
  questionsToSelect?: number | null;
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

  @IsOptional()
  @IsBoolean()
  randomizeQuestions?: boolean;

  @IsOptional()
  @IsBoolean()
  randomizeOptions?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(500)
  questionsToSelect?: number | null;
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

export class CreateAssessmentMatchingPairDto {
  @IsString()
  @Length(1, 300)
  prompt!: string;

  @IsString()
  @Length(1, 300)
  answer!: string;
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

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100000)
  negativeMarks?: number;

  @IsOptional()
  @IsString()
  @Length(1, 120)
  subject?: string;

  @IsOptional()
  @IsString()
  @Length(1, 120)
  topic?: string;

  @IsOptional()
  @IsIn(["EASY", "MEDIUM", "HARD"])
  difficulty?: string;

  @IsOptional()
  @IsBoolean()
  saveToBank?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAssessmentOptionDto)
  options!: CreateAssessmentOptionDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAssessmentMatchingPairDto)
  matchingPairs?: CreateAssessmentMatchingPairDto[];
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
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100000)
  negativeMarks?: number;

  @IsOptional()
  @IsString()
  @Length(1, 120)
  subject?: string;

  @IsOptional()
  @IsString()
  @Length(1, 120)
  topic?: string;

  @IsOptional()
  @IsIn(["EASY", "MEDIUM", "HARD"])
  difficulty?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAssessmentOptionDto)
  options?: CreateAssessmentOptionDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAssessmentMatchingPairDto)
  matchingPairs?: CreateAssessmentMatchingPairDto[];
}

export class ImportQuestionBankQuestionDto {
  @IsUUID()
  bankQuestionId!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  sequence?: number;
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

export class SaveAssessmentDraftDto {
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

export const CERTIFICATE_STATUSES = [
  "NOT_ELIGIBLE",
  "ELIGIBLE_FOR_REVIEW",
  "APPROVED",
  "REJECTED",
  "ISSUED",
  "REVOKED",
] as const;

export class CertificateReviewDecisionDto {
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  notes?: string;
}

export class CertificateReportQueryDto {
  @IsOptional()
  @IsIn(CERTIFICATE_STATUSES)
  status?: string;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  @IsUUID()
  institutionId?: string;

  @IsOptional()
  @IsUUID()
  studentId?: string;

  @IsOptional()
  @IsUUID()
  courseId?: string;

  @IsOptional()
  @IsUUID()
  instructorId?: string;

  @IsOptional()
  @IsIn(["COLLEGE_STUDENT", "DIRECT_STUDENT"])
  studentType?: string;

  @IsOptional()
  @IsString()
  @Length(1, 80)
  completionStatus?: string;

  @IsOptional()
  @IsString()
  @Length(1, 80)
  assignmentStatus?: string;

  @IsOptional()
  @IsString()
  @Length(1, 80)
  assessmentStatus?: string;

  @IsOptional()
  @IsString()
  @Length(1, 80)
  paymentStatus?: string;
}