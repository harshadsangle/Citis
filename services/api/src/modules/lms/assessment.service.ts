import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { assertScope, assertScopeForRead, filterScopedRows, isPlatformUser } from "../../common/access-scope";
import type { AuthenticatedUser, ContextRequest } from "../../common/request-context";
import { AuditService } from "../../common/audit.service";
import { DatabaseService } from "../../database/database.service";
import type {
  AssessmentAnswerDto,
  AssignmentListQueryDto,
  CreateAssessmentDto,
  CreateAssessmentQuestionDto,
  CreateAssessmentOptionDto,
  SubmitAssessmentAttemptDto,
  UpdateAssessmentDto,
  UpdateAssessmentQuestionDto,
  UpdateAssessmentOptionDto,
} from "./lms.dto";

type Queryable = { query: (text: string, values?: unknown[]) => Promise<{ rows: Array<Record<string, unknown>> }> };
type AssessmentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
type QuestionType = "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_TEXT" | "NUMERIC";

const assessmentTypes = ["PRACTICE_QUIZ", "FORMATIVE", "SUMMATIVE", "ASSIGNMENT", "PROJECT", "VIVA", "PRACTICAL"];
const questionTypes: QuestionType[] = ["SINGLE_CHOICE", "MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_TEXT", "NUMERIC"];

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function normalizeAnswer(value: unknown): string | string[] {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return String(value ?? "").trim();
}

function sameValues(left: string[], right: string[]) {
  return left.length === right.length && left.every((value) => right.includes(value));
}

@Injectable()
export class AssessmentService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  private async courseFor(courseId: string, user: AuthenticatedUser) {
    const result = await this.db.query<Record<string, unknown>>(
      `SELECT c.id, c.id AS course_id, c.tenant_id, c.institution_id, c.campus_id, c.title, c.code, c.status,
              p.status AS programme_status, i.status AS institution_status
       FROM courses c
       JOIN programmes p ON p.id = c.programme_id AND p.tenant_id = c.tenant_id
       JOIN institutions i ON i.id = p.institution_id AND i.tenant_id = c.tenant_id
       WHERE c.id = $1 AND c.tenant_id = $2`,
      [courseId, user.tenantId],
    );
    const course = result.rows[0];
    if (!course) throw new NotFoundException("Course not found in the current tenant.");
    assertScopeForRead(user, String(course.institution_id), course.campus_id as string | null | undefined);
    if (course.status === "ARCHIVED" || course.programme_status === "ARCHIVED" || course.institution_status !== "ACTIVE") {
      throw new BadRequestException("The course institution, programme, or course is not active.");
    }
    return course;
  }

  private async moduleFor(moduleId: string, courseId: string, user: AuthenticatedUser) {
    const result = await this.db.query<Record<string, unknown>>(
      `SELECT id, tenant_id, course_id, title, status
       FROM course_modules
       WHERE id = $1 AND course_id = $2 AND tenant_id = $3`,
      [moduleId, courseId, user.tenantId],
    );
    const module = result.rows[0];
    if (!module || module.status === "ARCHIVED") throw new NotFoundException("Course module not found in the current tenant.");
    return module;
  }

  private async hasStaffAccess(user: AuthenticatedUser, institutionId: string, courseId: string, campusId?: string | null) {
    if (isPlatformUser(user)) return true;
    const result = await this.db.query(
      `SELECT 1
       FROM user_roles ur
       JOIN roles r ON r.id = ur.role_id AND r.tenant_id = ur.tenant_id
       WHERE ur.user_id = $1 AND ur.tenant_id = $2 AND ur.institution_id = $3
         AND (ur.campus_id IS NULL OR $5::uuid IS NULL OR ur.campus_id = $5)
         AND r.status = 'ACTIVE'
         AND (
           r.code IN ('INSTITUTION_ADMINISTRATOR', 'PRINCIPAL_DIRECTOR', 'ACADEMIC_ADMINISTRATOR')
           OR (
             r.code = 'TEACHER'
             AND EXISTS (
               SELECT 1 FROM lms_instructor_assignments ia
               WHERE ia.tenant_id = $2 AND ia.institution_id = $3 AND ia.course_id = $4
                 AND ia.campus_id IS NOT DISTINCT FROM $5
                 AND ia.instructor_id = ur.user_id AND ia.status = 'ACTIVE'
             )
           )
         )
       LIMIT 1`,
      [user.id, user.tenantId, institutionId, courseId, campusId ?? null],
    );
    return Boolean(result.rows[0]);
  }

  private async assertStaff(assessment: Record<string, unknown>, user: AuthenticatedUser) {
    if (!await this.hasStaffAccess(user, String(assessment.institution_id), String(assessment.course_id), assessment.campus_id as string | null)) {
      throw new ForbiddenException("You are not authorized to manage this assessment.");
    }
  }

  private async assessmentFor(id: string, user: AuthenticatedUser): Promise<Record<string, unknown>> {
    const result = await this.db.query<Record<string, unknown>>(
      `SELECT a.*, c.institution_id AS course_institution_id, c.campus_id AS course_campus_id,
              c.title AS course_title, c.status AS course_status, cm.title AS module_title,
              cm.status AS module_status, p.status AS programme_status, i.status AS institution_status
       FROM lms_assessments a
       JOIN courses c ON c.id = a.course_id AND c.tenant_id = a.tenant_id
       JOIN course_modules cm ON cm.id = a.module_id AND cm.course_id = a.course_id AND cm.tenant_id = a.tenant_id
       JOIN programmes p ON p.id = c.programme_id AND p.tenant_id = a.tenant_id
       JOIN institutions i ON i.id = p.institution_id AND i.tenant_id = a.tenant_id
       WHERE a.id = $1 AND a.tenant_id = $2`,
      [id, user.tenantId],
    );
    const assessment = result.rows[0];
    if (!assessment) throw new NotFoundException("Assessment not found in the current tenant.");
    const institutionId = String(assessment.course_institution_id ?? assessment.institution_id);
    const campusId = (assessment.course_campus_id ?? assessment.campus_id) as string | null | undefined;
    assertScopeForRead(user, institutionId, campusId);
    return { ...assessment, institution_id: institutionId, campus_id: campusId ?? null };
  }

  private async assertLearnerAccess(assessment: Record<string, unknown>, user: AuthenticatedUser) {
    const staff = await this.hasStaffAccess(user, String(assessment.institution_id), String(assessment.course_id), assessment.campus_id as string | null);
    if (staff) return true;
    if (assessment.status !== "PUBLISHED" || assessment.course_status !== "PUBLISHED" || assessment.module_status !== "PUBLISHED") {
      throw new NotFoundException("Assessment not found.");
    }
    const enrollment = await this.db.query(
      `SELECT 1 FROM lms_enrollments
       WHERE tenant_id = $1 AND institution_id = $2 AND course_id = $3 AND learner_id = $4
         AND campus_id IS NOT DISTINCT FROM $5 AND status = 'ACTIVE'
       LIMIT 1`,
      [user.tenantId, assessment.institution_id, assessment.course_id, user.id, assessment.campus_id ?? null],
    );
    if (!enrollment.rows[0]) throw new ForbiddenException("An active course enrollment is required.");
    return false;
  }

  private async auditMutation(request: ContextRequest, resource: string, action: string, row: Record<string, unknown>, before?: unknown) {
    await this.audit.record({
      tenantId: request.context.user!.tenantId,
      institutionId: (row.institution_id as string | null) ?? null,
      campusId: (row.campus_id as string | null) ?? null,
      actorUserId: request.context.user!.id,
      requestId: request.context.requestId,
      module: "lms",
      resource,
      resourceId: row.id as string,
      action,
      previousValue: before,
      newValue: row,
      ipAddress: request.context.ipAddress,
      deviceContext: { userAgent: request.context.userAgent },
    });
  }

  private async run<T>(work: () => Promise<T>) {
    try {
      return await work();
    } catch (error) {
      if ((error as { code?: string }).code === "23505") throw new ConflictException("The assessment sequence or option value is already in use.");
      if ((error as { code?: string }).code === "23514") throw new BadRequestException("The assessment data does not satisfy its validation rules.");
      throw error;
    }
  }

  private validateAssessmentInput(input: CreateAssessmentDto | UpdateAssessmentDto, currentTotal?: number | null) {
    if ("assessmentType" in input && input.assessmentType && !assessmentTypes.includes(input.assessmentType)) {
      throw new BadRequestException("Unsupported assessment type.");
    }
    const total = input.totalMarks ?? currentTotal;
    if (input.passingMarks !== undefined && total !== null && total !== undefined && input.passingMarks > total) {
      throw new BadRequestException("Passing marks cannot exceed total marks.");
    }
  }

  async listAssessments(user: AuthenticatedUser, page: number, pageSize: number, offset: number, query: AssignmentListQueryDto) {
    let courseIds: string[] | undefined;
    if (query.courseId) {
      const course = await this.courseFor(query.courseId, user);
      const staff = await this.hasStaffAccess(user, String(course.institution_id), String(course.id), course.campus_id as string | null);
      if (!staff) {
        const enrollment = await this.db.query<{ course_id: string }>(
          `SELECT course_id FROM lms_enrollments
           WHERE tenant_id = $1 AND institution_id = $2 AND course_id = $3 AND learner_id = $4
             AND campus_id IS NOT DISTINCT FROM $5 AND status = 'ACTIVE'`,
          [user.tenantId, course.institution_id, course.id, user.id, course.campus_id ?? null],
        );
        if (!enrollment.rows.length) throw new ForbiddenException("An active course enrollment is required.");
      }
      courseIds = [String(course.id)];
    } else if (user.roles.some((role) => role.code === "STUDENT") && !isPlatformUser(user)) {
      const enrollment = await this.db.query<{ course_id: string }>(
        "SELECT course_id FROM lms_enrollments WHERE tenant_id = $1 AND learner_id = $2 AND status = 'ACTIVE'",
        [user.tenantId, user.id],
      );
      courseIds = enrollment.rows.map((row) => row.course_id);
    }

    const values: unknown[] = [user.tenantId];
    const clauses = ["a.tenant_id = $1"];
    if (courseIds) {
      if (!courseIds.length) return { data: [], meta: { page, pageSize, total: 0, totalPages: 0 } };
      values.push(courseIds);
      clauses.push(`a.course_id = ANY($${values.length}::uuid[])`);
      clauses.push("a.status = 'PUBLISHED'");
    }
    const result = await this.db.query<Record<string, unknown>>(
      `SELECT a.id, a.tenant_id, a.institution_id, a.campus_id, a.course_id, a.module_id, a.title,
              a.description, a.assessment_type, a.total_marks, a.passing_marks, a.duration_minutes,
              a.attempt_limit, a.status, a.created_at, a.updated_at, c.title AS course_title,
              cm.title AS module_title
       FROM lms_assessments a
       JOIN courses c ON c.id = a.course_id AND c.tenant_id = a.tenant_id
       JOIN course_modules cm ON cm.id = a.module_id AND cm.course_id = a.course_id AND cm.tenant_id = a.tenant_id
       WHERE ${clauses.join(" AND ")}
       ORDER BY a.created_at DESC, a.id ASC`,
      values,
    );
    const visible = filterScopedRows(user, result.rows);
    const data = visible.slice(offset, offset + pageSize);
    return { data, meta: { page, pageSize, total: visible.length, totalPages: Math.ceil(visible.length / pageSize) } };
  }

  async getAssessment(id: string, user: AuthenticatedUser) {
    const assessment = await this.assessmentFor(id, user);
    await this.assertLearnerAccess(assessment, user);
    return assessment;
  }

  async createAssessment(input: CreateAssessmentDto, request: ContextRequest) {
    const user = request.context.user!;
    this.validateAssessmentInput(input);
    const course = await this.courseFor(input.courseId, user);
    await this.moduleFor(input.moduleId, input.courseId, user);
    await this.assertStaff(course, user);
    return this.run(async () => {
      const result = await this.db.query<Record<string, unknown>>(
        `INSERT INTO lms_assessments
           (tenant_id, institution_id, campus_id, course_id, module_id, title, description,
            assessment_type, total_marks, passing_marks, duration_minutes, attempt_limit)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING *`,
        [
          user.tenantId, course.institution_id, course.campus_id ?? null, course.id, input.moduleId,
          input.title.trim(), input.description?.trim() || null, input.assessmentType,
          input.totalMarks ?? null, input.passingMarks ?? null, input.durationMinutes ?? null,
          input.attemptLimit ?? null,
        ],
      );
      const row = result.rows[0];
      await this.auditMutation(request, "assessment", "CREATE", row);
      return row;
    });
  }

  async updateAssessment(id: string, input: UpdateAssessmentDto, request: ContextRequest) {
    const user = request.context.user!;
    const before = await this.assessmentFor(id, user);
    await this.assertStaff(before, user);
    if (before.status === "ARCHIVED") throw new ConflictException("Archived assessments cannot be edited.");
    this.validateAssessmentInput(input, before.total_marks as number | null);
    return this.run(async () => {
      const result = await this.db.query<Record<string, unknown>>(
        `UPDATE lms_assessments
         SET title = COALESCE($3, title), description = COALESCE($4, description),
             total_marks = COALESCE($5, total_marks), passing_marks = COALESCE($6, passing_marks),
             duration_minutes = COALESCE($7, duration_minutes), attempt_limit = COALESCE($8, attempt_limit),
             updated_at = now()
         WHERE id = $1 AND tenant_id = $2
         RETURNING *`,
        [id, user.tenantId, input.title?.trim() || null, input.description?.trim() || null,
          input.totalMarks ?? null, input.passingMarks ?? null, input.durationMinutes ?? null, input.attemptLimit ?? null],
      );
      const row = result.rows[0];
      await this.auditMutation(request, "assessment", "UPDATE", row, before);
      return row;
    });
  }

  async changeAssessmentStatus(id: string, status: AssessmentStatus, request: ContextRequest) {
    const user = request.context.user!;
    const before = await this.assessmentFor(id, user);
    await this.assertStaff(before, user);
    if (status === "PUBLISHED" && (before.course_status !== "PUBLISHED" || before.module_status !== "PUBLISHED")) {
      throw new BadRequestException("Assessments can be published only inside published courses and modules.");
    }
    return this.run(async () => {
      const result = await this.db.query<Record<string, unknown>>(
        `UPDATE lms_assessments SET status = $3, updated_at = now()
         WHERE id = $1 AND tenant_id = $2 RETURNING *`,
        [id, user.tenantId, status],
      );
      const row = result.rows[0];
      await this.auditMutation(request, "assessment", status === "PUBLISHED" ? "PUBLISH" : "ARCHIVE", row, before);
      return row;
    });
  }

  private validateOptions(questionType: string, options: CreateAssessmentOptionDto[]) {
    if (!questionTypes.includes(questionType as QuestionType)) throw new BadRequestException("Unsupported question type.");
    if (!options.length) throw new BadRequestException("Each question needs at least one answer option.");
    const values = options.map((option) => option.value.trim());
    if (new Set(values).size !== values.length) throw new BadRequestException("Question option values must be unique.");
    const correct = options.filter((option) => option.isCorrect);
    if (["SINGLE_CHOICE", "TRUE_FALSE"].includes(questionType) && correct.length !== 1) {
      throw new BadRequestException("This question type needs exactly one correct option.");
    }
    if (questionType === "MULTIPLE_CHOICE" && correct.length < 1) {
      throw new BadRequestException("Multiple-choice questions need at least one correct option.");
    }
    if (questionType === "TRUE_FALSE" || questionType === "SINGLE_CHOICE" || questionType === "MULTIPLE_CHOICE") {
      if (options.length < 2) throw new BadRequestException("Choice questions need at least two options.");
    }
    if (["SHORT_TEXT", "NUMERIC"].includes(questionType) && correct.length !== 1) {
      throw new BadRequestException("Text and numeric questions need exactly one correct answer.");
    }
    if (questionType === "TRUE_FALSE" && new Set(values.map((value) => value.toLowerCase())).size !== 2) {
      throw new BadRequestException("True/false questions need true and false options.");
    }
  }

  private async questionFor(id: string, user: AuthenticatedUser): Promise<Record<string, unknown>> {
    const result = await this.db.query<Record<string, unknown>>(
      `SELECT q.*, a.title AS assessment_title, a.status AS assessment_status, a.assessment_type,
              a.course_id, a.institution_id AS assessment_institution_id, a.campus_id AS assessment_campus_id,
              c.status AS course_status, cm.status AS module_status
       FROM lms_assessment_questions q
       JOIN lms_assessments a ON a.id = q.assessment_id AND a.tenant_id = q.tenant_id
       JOIN courses c ON c.id = a.course_id AND c.tenant_id = a.tenant_id
       JOIN course_modules cm ON cm.id = a.module_id AND cm.course_id = a.course_id AND cm.tenant_id = a.tenant_id
       WHERE q.id = $1 AND q.tenant_id = $2`,
      [id, user.tenantId],
    );
    const question = result.rows[0];
    if (!question) throw new NotFoundException("Assessment question not found.");
    assertScopeForRead(user, String(question.assessment_institution_id ?? question.institution_id), question.assessment_campus_id as string | null | undefined);
    return { ...question, institution_id: question.assessment_institution_id ?? question.institution_id, campus_id: question.assessment_campus_id ?? question.campus_id };
  }

  private async questionRows(executor: Queryable, assessmentId: string, user: AuthenticatedUser, includeCorrect: boolean) {
    const correctColumn = includeCorrect ? ", o.is_correct" : "";
    const result = await executor.query(
      `SELECT q.id, q.tenant_id, q.institution_id, q.campus_id, q.course_id, q.module_id,
              q.assessment_id, q.prompt, q.question_type, q.marks, q.sequence, q.status,
              o.id AS option_id, o.option_value, o.option_label, o.sequence AS option_sequence${correctColumn}
       FROM lms_assessment_questions q
       LEFT JOIN lms_assessment_options o ON o.question_id = q.id AND o.tenant_id = q.tenant_id
       WHERE q.tenant_id = $1 AND q.assessment_id = $2 AND q.status = 'ACTIVE'
       ORDER BY q.sequence ASC, q.id ASC, o.sequence ASC, o.id ASC`,
      [user.tenantId, assessmentId],
    );
    const questions = new Map<string, Record<string, unknown>>();
    for (const row of result.rows) {
      let question = questions.get(String(row.id));
      if (!question) {
        question = { id: row.id, tenant_id: row.tenant_id, institution_id: row.institution_id, campus_id: row.campus_id, course_id: row.course_id, module_id: row.module_id, assessment_id: row.assessment_id, prompt: row.prompt, question_type: row.question_type, marks: row.marks, sequence: row.sequence, status: row.status, options: [] };
        questions.set(String(row.id), question);
      }
      if (row.option_id) {
        const option: Record<string, unknown> = { id: row.option_id, value: row.option_value, label: row.option_label, sequence: row.option_sequence };
        if (includeCorrect) option.is_correct = row.is_correct;
        (question.options as Array<Record<string, unknown>>).push(option);
      }
    }
    return [...questions.values()];
  }

  async listQuestions(assessmentId: string, user: AuthenticatedUser) {
    const assessment = await this.assessmentFor(assessmentId, user);
    const staff = await this.assertLearnerAccess(assessment, user);
    const questions = await this.questionRows(this.db, assessmentId, user, staff);
    return questions;
  }

  async createQuestion(assessmentId: string, input: CreateAssessmentQuestionDto, request: ContextRequest) {
    const user = request.context.user!;
    const assessment = await this.assessmentFor(assessmentId, user);
    await this.assertStaff(assessment, user);
    this.validateOptions(input.questionType, input.options);
    return this.run(async () => this.db.transaction(async (client) => {
      const questionResult = await client.query<Record<string, unknown>>(
        `INSERT INTO lms_assessment_questions
           (tenant_id, institution_id, campus_id, course_id, module_id, assessment_id, prompt, question_type, marks, sequence)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [user.tenantId, assessment.institution_id, assessment.campus_id ?? null, assessment.course_id, assessment.module_id, assessment.id, input.prompt.trim(), input.questionType, input.marks, input.sequence],
      );
      const question = questionResult.rows[0];
      for (const [index, option] of input.options.entries()) {
        await client.query(
          `INSERT INTO lms_assessment_options
             (tenant_id, institution_id, campus_id, course_id, module_id, assessment_id, question_id, option_value, option_label, is_correct, sequence)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [user.tenantId, assessment.institution_id, assessment.campus_id ?? null, assessment.course_id, assessment.module_id, assessment.id, question.id, option.value.trim(), option.label.trim(), option.isCorrect, index + 1],
        );
      }
      const row = { ...question, options: input.options };
      await this.auditMutation(request, "assessment_question", "CREATE", row);
      return row;
    }));
  }

  async updateQuestion(id: string, input: UpdateAssessmentQuestionDto, request: ContextRequest) {
    const user = request.context.user!;
    const before = await this.questionFor(id, user);
    const assessment = await this.assessmentFor(String(before.assessment_id), user);
    await this.assertStaff(assessment, user);
    const attempts = await this.db.query("SELECT 1 FROM lms_assessment_attempts WHERE assessment_id = $1 AND status = 'SUBMITTED' LIMIT 1", [assessment.id]);
    if (attempts.rows[0]) throw new ConflictException("Questions cannot be edited after an attempt has been submitted.");
    if (input.options) this.validateOptions(String(before.question_type), input.options);
    return this.run(async () => this.db.transaction(async (client) => {
      const result = await client.query<Record<string, unknown>>(
        `UPDATE lms_assessment_questions
         SET prompt = COALESCE($3, prompt), marks = COALESCE($4, marks), sequence = COALESCE($5, sequence), updated_at = now()
         WHERE id = $1 AND tenant_id = $2 RETURNING *`,
        [id, user.tenantId, input.prompt?.trim() || null, input.marks ?? null, input.sequence ?? null],
      );
      const row = result.rows[0];
      if (input.options) {
        await client.query("DELETE FROM lms_assessment_options WHERE tenant_id = $1 AND question_id = $2", [user.tenantId, id]);
        for (const [index, option] of input.options.entries()) {
          await client.query(
            `INSERT INTO lms_assessment_options
             (tenant_id, institution_id, campus_id, course_id, module_id, assessment_id, question_id, option_value, option_label, is_correct, sequence)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [user.tenantId, assessment.institution_id, assessment.campus_id ?? null, assessment.course_id, assessment.module_id, assessment.id, id, option.value.trim(), option.label.trim(), option.isCorrect, index + 1],
          );
        }
      }
      await this.auditMutation(request, "assessment_question", "UPDATE", row, before);
      return row;
    }));
  }

  async archiveQuestion(id: string, request: ContextRequest) {
    const user = request.context.user!;
    const before = await this.questionFor(id, user);
    const assessment = await this.assessmentFor(String(before.assessment_id), user);
    await this.assertStaff(assessment, user);
    const result = await this.db.query<Record<string, unknown>>(
      `UPDATE lms_assessment_questions SET status = 'ARCHIVED', updated_at = now()
       WHERE id = $1 AND tenant_id = $2 RETURNING *`,
      [id, user.tenantId],
    );
    const row = result.rows[0];
    await this.auditMutation(request, "assessment_question", "ARCHIVE", row, before);
    return row;
  }

  private async optionFor(id: string, user: AuthenticatedUser): Promise<Record<string, unknown>> {
    const result = await this.db.query<Record<string, unknown>>(
      `SELECT o.*, q.question_type, q.assessment_id, q.prompt, a.title AS assessment_title,
              a.institution_id AS assessment_institution_id, a.campus_id AS assessment_campus_id
       FROM lms_assessment_options o
       JOIN lms_assessment_questions q ON q.id = o.question_id AND q.tenant_id = o.tenant_id
       JOIN lms_assessments a ON a.id = q.assessment_id AND a.tenant_id = q.tenant_id
       WHERE o.id = $1 AND o.tenant_id = $2`,
      [id, user.tenantId],
    );
    const option = result.rows[0];
    if (!option) throw new NotFoundException("Assessment option not found.");
    assertScopeForRead(user, String(option.assessment_institution_id ?? option.institution_id), option.assessment_campus_id as string | null | undefined);
    return { ...option, institution_id: option.assessment_institution_id ?? option.institution_id, campus_id: option.assessment_campus_id ?? option.campus_id };
  }

  private async allOptions(questionId: string, user: AuthenticatedUser) {
    const result = await this.db.query<Record<string, unknown>>(
      `SELECT id, option_value AS value, option_label AS label, is_correct AS "isCorrect"
       FROM lms_assessment_options WHERE tenant_id = $1 AND question_id = $2 ORDER BY sequence`,
      [user.tenantId, questionId],
    );
    return result.rows.map((row) => ({ value: String(row.value), label: String(row.label), isCorrect: Boolean(row.isCorrect) }));
  }

  async createOption(questionId: string, input: CreateAssessmentOptionDto, request: ContextRequest) {
    const user = request.context.user!;
    const question = await this.questionFor(questionId, user);
    const assessment = await this.assessmentFor(String(question.assessment_id), user);
    await this.assertStaff(assessment, user);
    const options = await this.allOptions(questionId, user);
    this.validateOptions(String(question.question_type), [...options, input]);
    const result = await this.run(() => this.db.query<Record<string, unknown>>(
      `INSERT INTO lms_assessment_options
         (tenant_id, institution_id, campus_id, course_id, module_id, assessment_id, question_id, option_value, option_label, is_correct, sequence)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
         (SELECT COALESCE(MAX(sequence), 0) + 1 FROM lms_assessment_options WHERE tenant_id = $1 AND question_id = $7))
       RETURNING *`,
      [user.tenantId, assessment.institution_id, assessment.campus_id ?? null, assessment.course_id, assessment.module_id, assessment.id, questionId, input.value.trim(), input.label.trim(), input.isCorrect],
    ));
    await this.auditMutation(request, "assessment_option", "CREATE", result.rows[0]);
    return result.rows[0];
  }

  async updateOption(id: string, input: UpdateAssessmentOptionDto, request: ContextRequest) {
    const user = request.context.user!;
    const before = await this.optionFor(id, user);
    const question = await this.questionFor(String(before.question_id), user);
    const assessment = await this.assessmentFor(String(question.assessment_id), user);
    await this.assertStaff(assessment, user);
    const existing = await this.allOptions(String(before.question_id), user);
    const options = existing.map((option) => String(option.value) === String(before.option_value)
      ? { value: input.value?.trim() ?? option.value, label: input.label?.trim() ?? option.label, isCorrect: input.isCorrect ?? option.isCorrect }
      : option);
    this.validateOptions(String(question.question_type), options);
    const result = await this.run(() => this.db.query<Record<string, unknown>>(
      `UPDATE lms_assessment_options
       SET option_value = COALESCE($3, option_value), option_label = COALESCE($4, option_label),
           is_correct = COALESCE($5, is_correct)
       WHERE id = $1 AND tenant_id = $2 RETURNING *`,
      [id, user.tenantId, input.value?.trim() || null, input.label?.trim() || null, input.isCorrect ?? null],
    ));
    await this.auditMutation(request, "assessment_option", "UPDATE", result.rows[0], before);
    return result.rows[0];
  }

  async archiveOption(id: string, request: ContextRequest) {
    const user = request.context.user!;
    const before = await this.optionFor(id, user);
    const question = await this.questionFor(String(before.question_id), user);
    const assessment = await this.assessmentFor(String(question.assessment_id), user);
    await this.assertStaff(assessment, user);
    const options = await this.allOptions(String(before.question_id), user);
    const remaining = options.filter((option) => option.value !== String(before.option_value));
    this.validateOptions(String(question.question_type), remaining);
    await this.db.query("DELETE FROM lms_assessment_options WHERE id = $1 AND tenant_id = $2", [id, user.tenantId]);
    await this.auditMutation(request, "assessment_option", "ARCHIVE", before);
    return { ...before, status: "ARCHIVED" };
  }

  private async attemptFor(id: string, user: AuthenticatedUser): Promise<Record<string, unknown>> {
    const result = await this.db.query<Record<string, unknown>>(
      `SELECT at.*, a.title, a.assessment_type, a.status AS assessment_status, a.total_marks,
              a.passing_marks, a.duration_minutes, a.attempt_limit, c.status AS course_status,
              cm.status AS module_status, c.institution_id AS course_institution_id,
              c.campus_id AS course_campus_id, p.status AS programme_status, i.status AS institution_status
       FROM lms_assessment_attempts at
       JOIN lms_assessments a ON a.id = at.assessment_id AND a.tenant_id = at.tenant_id
       JOIN courses c ON c.id = a.course_id AND c.tenant_id = a.tenant_id
       JOIN course_modules cm ON cm.id = a.module_id AND cm.course_id = a.course_id AND cm.tenant_id = a.tenant_id
       JOIN programmes p ON p.id = c.programme_id AND p.tenant_id = a.tenant_id
       JOIN institutions i ON i.id = p.institution_id AND i.tenant_id = a.tenant_id
       WHERE at.id = $1 AND at.tenant_id = $2`,
      [id, user.tenantId],
    );
    const attempt = result.rows[0];
    if (!attempt) throw new NotFoundException("Assessment attempt not found.");
    attempt.institution_id = attempt.course_institution_id ?? attempt.institution_id;
    attempt.campus_id = attempt.course_campus_id ?? attempt.campus_id;
    assertScopeForRead(user, String(attempt.institution_id), attempt.campus_id as string | null | undefined);
    return attempt;
  }

  async startAttempt(assessmentId: string, request: ContextRequest) {
    const user = request.context.user!;
    const assessment = await this.assessmentFor(assessmentId, user);
    const staff = await this.assertLearnerAccess(assessment, user);
    if (staff || assessment.assessment_type === "ASSIGNMENT") throw new BadRequestException("Only enrolled learners can start a scored assessment.");
    if (assessment.status !== "PUBLISHED" || assessment.course_status !== "PUBLISHED" || assessment.module_status !== "PUBLISHED") {
      throw new BadRequestException("Only published assessments in published courses can be started.");
    }
    return this.run(async () => this.db.transaction(async (client) => {
      await client.query("SELECT id FROM lms_assessments WHERE id = $1 AND tenant_id = $2 FOR UPDATE", [assessment.id, user.tenantId]);
      const count = await client.query<{ count: string }>(
        `SELECT count(*)::text AS count FROM lms_assessment_attempts
         WHERE tenant_id = $1 AND assessment_id = $2 AND learner_id = $3`,
        [user.tenantId, assessment.id, user.id],
      );
      const attemptNumber = Number(count.rows[0]?.count ?? 0) + 1;
      if (assessment.attempt_limit !== null && attemptNumber > Number(assessment.attempt_limit)) {
        throw new BadRequestException("The assessment attempt limit has been reached.");
      }
      const inserted = await client.query<Record<string, unknown>>(
        `INSERT INTO lms_assessment_attempts
           (tenant_id, institution_id, campus_id, course_id, module_id, assessment_id, learner_id, attempt_number)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [user.tenantId, assessment.institution_id, assessment.campus_id ?? null, assessment.course_id, assessment.module_id, assessment.id, user.id, attemptNumber],
      );
      const attempt = inserted.rows[0];
      const questions = await this.questionRows(client, String(assessment.id), user, false);
      await this.auditMutation(request, "assessment_attempt", "START", attempt);
      return { ...attempt, assessment: { id: assessment.id, title: assessment.title, assessment_type: assessment.assessment_type, duration_minutes: assessment.duration_minutes, attempt_limit: assessment.attempt_limit }, questions };
    }));
  }

  async getAttempt(id: string, user: AuthenticatedUser) {
    const attempt = await this.attemptFor(id, user);
    const staff = await this.hasStaffAccess(user, String(attempt.institution_id), String(attempt.course_id), attempt.campus_id as string | null);
    if (!staff && attempt.learner_id !== user.id) throw new NotFoundException("Assessment attempt not found.");
    const questions = await this.questionRows(this.db, String(attempt.assessment_id), user, staff);
    const answers = await this.db.query<Record<string, unknown>>(
      `SELECT question_id, answer_json, is_correct, awarded_marks
       FROM lms_assessment_answers WHERE tenant_id = $1 AND attempt_id = $2 ORDER BY question_id`,
      [user.tenantId, id],
    );
    return { ...attempt, questions, answers: answers.rows };
  }

  private scoreQuestion(question: Record<string, unknown>, answer: AssessmentAnswerDto) {
    const options = question.options as Array<Record<string, unknown>>;
    const supplied = (answer.answer as { value?: unknown })?.value;
    if (supplied === undefined) throw new BadRequestException("Each answer must include a value.");
    const normalized = normalizeAnswer(supplied);
    const correctValues = options.filter((option) => option.is_correct === true).map((option) => String(option.value));
    let correct = false;
    if (question.question_type === "MULTIPLE_CHOICE") {
      if (!Array.isArray(normalized)) throw new BadRequestException("Multiple-choice answers must be arrays.");
      correct = sameValues(normalized, correctValues);
    } else if (question.question_type === "NUMERIC") {
      const expected = Number(correctValues[0]);
      const actual = Number(normalized);
      if (!Number.isFinite(actual) || !Number.isFinite(expected)) throw new BadRequestException("Numeric answers must contain a valid number.");
      correct = actual === expected;
    } else {
      const actual = Array.isArray(normalized) ? normalized[0] : normalized;
      correct = correctValues.some((value) => value.toLowerCase() === actual.toLowerCase());
    }
    return { correct, awardedMarks: correct ? Number(question.marks) : 0 };
  }

  async submitAttempt(id: string, input: SubmitAssessmentAttemptDto, request: ContextRequest) {
    const user = request.context.user!;
    const attempt = await this.attemptFor(id, user);
    if (attempt.learner_id !== user.id) throw new ForbiddenException("Only the learner who started an attempt can submit it.");
    if (attempt.assessment_type === "ASSIGNMENT") throw new BadRequestException("Assignments use the assignment submission flow.");
    if (attempt.status !== "IN_PROGRESS") throw new ConflictException("This assessment attempt has already been submitted.");
    if (attempt.assessment_status !== "PUBLISHED" || attempt.course_status !== "PUBLISHED" || attempt.module_status !== "PUBLISHED") {
      throw new BadRequestException("Only published assessments in published courses can be submitted.");
    }
    const questions = await this.questionRows(this.db, String(attempt.assessment_id), user, true);
    const questionMap = new Map(questions.map((question) => [String(question.id), question]));
    if (input.answers.length !== questionMap.size || new Set(input.answers.map((answer) => answer.questionId)).size !== input.answers.length) {
      throw new BadRequestException("Submit exactly one answer for every active assessment question.");
    }
    const results = input.answers.map((answer) => {
      const question = questionMap.get(answer.questionId);
      if (!question) throw new BadRequestException("An answer references an invalid assessment question.");
      return { questionId: answer.questionId, ...this.scoreQuestion(question, answer), answer: answer.answer };
    });
    const score = results.reduce((sum, result) => sum + result.awardedMarks, 0);
    const maxScore = questions.reduce((sum, question) => sum + Number(question.marks), 0);
    const passed = attempt.passing_marks === null ? null : score >= Number(attempt.passing_marks);
    return this.run(async () => this.db.transaction(async (client) => {
      const locked = await client.query<Record<string, unknown>>(
        "SELECT * FROM lms_assessment_attempts WHERE id = $1 AND tenant_id = $2 FOR UPDATE",
        [id, user.tenantId],
      );
      if (locked.rows[0]?.status !== "IN_PROGRESS") throw new ConflictException("This assessment attempt has already been submitted.");
      for (const result of results) {
        await client.query(
          `INSERT INTO lms_assessment_answers
             (tenant_id, institution_id, campus_id, course_id, module_id, assessment_id, attempt_id, question_id, answer_json, is_correct, awarded_marks)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11)`,
          [user.tenantId, attempt.institution_id, attempt.campus_id ?? null, attempt.course_id, attempt.module_id, attempt.assessment_id, id, result.questionId, JSON.stringify(result.answer), result.correct, result.awardedMarks],
        );
      }
      const updated = await client.query<Record<string, unknown>>(
        `UPDATE lms_assessment_attempts
         SET status = 'SUBMITTED', score = $3, max_score = $4, passed = $5, submitted_at = now(), updated_at = now()
         WHERE id = $1 AND tenant_id = $2 RETURNING *`,
        [id, user.tenantId, score, maxScore, passed],
      );
      const completion = await client.query<Record<string, unknown>>(
        `INSERT INTO lms_assessment_completions
           (tenant_id, institution_id, campus_id, course_id, module_id, assessment_id, learner_id, attempt_id, score, passed, completed_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, now())
         ON CONFLICT (tenant_id, assessment_id, learner_id, attempt_id)
         DO UPDATE SET score = EXCLUDED.score, passed = EXCLUDED.passed, completed_at = EXCLUDED.completed_at, updated_at = now()
         RETURNING *`,
        [user.tenantId, attempt.institution_id, attempt.campus_id ?? null, attempt.course_id, attempt.module_id, attempt.assessment_id, user.id, id, score, passed],
      );
      await this.auditMutation(request, "assessment_attempt", "SUBMIT", updated.rows[0], attempt);
      await this.auditMutation(request, "assessment_completion", "COMPLETE", completion.rows[0]);
      return { ...updated.rows[0], results };
    }));
  }
}