"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssessmentService = void 0;
const common_1 = require("@nestjs/common");
const access_scope_1 = require("../../common/access-scope");
const audit_service_1 = require("../../common/audit.service");
const database_service_1 = require("../../database/database.service");
const pagination_1 = require("../../common/pagination");
const assessmentTypes = ["PRACTICE_QUIZ", "FORMATIVE", "SUMMATIVE", "ASSIGNMENT", "PROJECT", "VIVA", "PRACTICAL"];
const questionTypes = ["SINGLE_CHOICE", "MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_TEXT", "NUMERIC"];
const manuallyGradedAssessmentTypes = ["PROJECT", "VIVA", "PRACTICAL"];
function asString(value) {
    return typeof value === "string" ? value : "";
}
function normalizeAnswer(value) {
    if (Array.isArray(value))
        return value.map((item) => String(item).trim()).filter(Boolean);
    return String(value ?? "").trim();
}
function sameValues(left, right) {
    return left.length === right.length && left.every((value) => right.includes(value));
}
let AssessmentService = class AssessmentService {
    db;
    audit;
    constructor(db, audit) {
        this.db = db;
        this.audit = audit;
    }
    async courseFor(courseId, user) {
        const result = await this.db.query(`SELECT c.id, c.id AS course_id, c.tenant_id, c.institution_id, c.campus_id, c.title, c.code, c.status,
              p.status AS programme_status, i.status AS institution_status
       FROM courses c
       JOIN programmes p ON p.id = c.programme_id AND p.tenant_id = c.tenant_id
       JOIN institutions i ON i.id = p.institution_id AND i.tenant_id = c.tenant_id
       WHERE c.id = $1 AND c.tenant_id = $2`, [courseId, user.tenantId]);
        const course = result.rows[0];
        if (!course)
            throw new common_1.NotFoundException("Course not found in the current tenant.");
        (0, access_scope_1.assertScopeForRead)(user, String(course.institution_id), course.campus_id);
        if (course.status === "ARCHIVED" || course.programme_status === "ARCHIVED" || course.institution_status !== "ACTIVE") {
            throw new common_1.BadRequestException("The course institution, programme, or course is not active.");
        }
        return course;
    }
    async moduleFor(moduleId, courseId, user) {
        const result = await this.db.query(`SELECT id, tenant_id, course_id, title, status
       FROM course_modules
       WHERE id = $1 AND course_id = $2 AND tenant_id = $3`, [moduleId, courseId, user.tenantId]);
        const module = result.rows[0];
        if (!module || module.status === "ARCHIVED")
            throw new common_1.NotFoundException("Course module not found in the current tenant.");
        return module;
    }
    async hasStaffAccess(user, institutionId, courseId, campusId) {
        if ((0, access_scope_1.isPlatformUser)(user))
            return true;
        const result = await this.db.query(`SELECT 1
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
                  AND (ia.campus_id IS NULL OR ia.campus_id = $5)
                 AND ia.instructor_id = ur.user_id AND ia.status = 'ACTIVE'
             )
           )
         )
       LIMIT 1`, [user.id, user.tenantId, institutionId, courseId, campusId ?? null]);
        return Boolean(result.rows[0]);
    }
    async assertStaff(assessment, user) {
        if (!await this.hasStaffAccess(user, String(assessment.institution_id), String(assessment.course_id), assessment.campus_id)) {
            throw new common_1.ForbiddenException("You are not authorized to manage this assessment.");
        }
    }
    async assessmentFor(id, user) {
        const result = await this.db.query(`SELECT a.*, c.institution_id AS course_institution_id, c.campus_id AS course_campus_id,
              c.title AS course_title, c.status AS course_status, cm.title AS module_title,
              cm.status AS module_status, p.status AS programme_status, i.status AS institution_status
       FROM lms_assessments a
       JOIN courses c ON c.id = a.course_id AND c.tenant_id = a.tenant_id
       JOIN course_modules cm ON cm.id = a.module_id AND cm.course_id = a.course_id AND cm.tenant_id = a.tenant_id
       JOIN programmes p ON p.id = c.programme_id AND p.tenant_id = a.tenant_id
       JOIN institutions i ON i.id = p.institution_id AND i.tenant_id = a.tenant_id
       WHERE a.id = $1 AND a.tenant_id = $2`, [id, user.tenantId]);
        const assessment = result.rows[0];
        if (!assessment)
            throw new common_1.NotFoundException("Assessment not found in the current tenant.");
        const institutionId = String(assessment.course_institution_id ?? assessment.institution_id);
        const campusId = (assessment.course_campus_id ?? assessment.campus_id);
        (0, access_scope_1.assertScopeForRead)(user, institutionId, campusId);
        return { ...assessment, institution_id: institutionId, campus_id: campusId ?? null };
    }
    async assertLearnerAccess(assessment, user) {
        const staff = await this.hasStaffAccess(user, String(assessment.institution_id), String(assessment.course_id), assessment.campus_id);
        if (staff)
            return true;
        if (assessment.status !== "PUBLISHED" || assessment.course_status !== "PUBLISHED" || assessment.module_status !== "PUBLISHED") {
            throw new common_1.NotFoundException("Assessment not found.");
        }
        const enrollment = await this.db.query(`SELECT 1 FROM lms_enrollments
       WHERE tenant_id = $1 AND institution_id = $2 AND course_id = $3 AND learner_id = $4
         AND campus_id IS NOT DISTINCT FROM $5 AND status = 'ACTIVE'
       LIMIT 1`, [user.tenantId, assessment.institution_id, assessment.course_id, user.id, assessment.campus_id ?? null]);
        if (!enrollment.rows[0])
            throw new common_1.ForbiddenException("An active course enrollment is required.");
        return false;
    }
    async assertActiveEnrollmentForAttempt(attempt, user) {
        const enrollment = await this.db.query(`SELECT 1 FROM lms_enrollments
       WHERE tenant_id = $1 AND institution_id = $2 AND course_id = $3 AND learner_id = $4
         AND campus_id IS NOT DISTINCT FROM $5 AND status = 'ACTIVE'
       LIMIT 1`, [user.tenantId, attempt.institution_id, attempt.course_id, user.id, attempt.campus_id ?? null]);
        if (!enrollment.rows[0])
            throw new common_1.ForbiddenException("An active course enrollment is required.");
    }
    async auditMutation(request, resource, action, row, before) {
        await this.audit.record({
            tenantId: request.context.user.tenantId,
            institutionId: row.institution_id ?? null,
            campusId: row.campus_id ?? null,
            actorUserId: request.context.user.id,
            requestId: request.context.requestId,
            module: "lms",
            resource,
            resourceId: row.id,
            action,
            previousValue: before,
            newValue: row,
            ipAddress: request.context.ipAddress,
            deviceContext: { userAgent: request.context.userAgent },
        });
    }
    async run(work) {
        try {
            return await work();
        }
        catch (error) {
            if (error.code === "23505")
                throw new common_1.ConflictException("The assessment sequence or option value is already in use.");
            if (error.code === "23514")
                throw new common_1.BadRequestException("The assessment data does not satisfy its validation rules.");
            throw error;
        }
    }
    validateAssessmentInput(input, currentTotal) {
        if ("assessmentType" in input && input.assessmentType && !assessmentTypes.includes(input.assessmentType)) {
            throw new common_1.BadRequestException("Unsupported assessment type.");
        }
        const total = input.totalMarks ?? currentTotal;
        if (input.passingMarks !== undefined && total !== null && total !== undefined && input.passingMarks > total) {
            throw new common_1.BadRequestException("Passing marks cannot exceed total marks.");
        }
    }
    async validateAssessmentMarks(id, totalMarks, passingMarks, tenantId) {
        const result = await this.db.query(`SELECT COALESCE(SUM(marks), 0)::numeric AS total, count(*)::text AS count
       FROM lms_assessment_questions
       WHERE tenant_id = $1 AND assessment_id = $2 AND status = 'ACTIVE'`, [tenantId, id]);
        if (Number(result.rows[0]?.count ?? 0) === 0)
            return;
        const questionTotal = Number(result.rows[0]?.total ?? 0);
        if (totalMarks !== null && totalMarks !== undefined && Math.round(Number(totalMarks) * 100) !== Math.round(questionTotal * 100)) {
            throw new common_1.BadRequestException("Total marks must equal the sum of active question marks.");
        }
        if (passingMarks !== null && passingMarks !== undefined && Number(passingMarks) > questionTotal) {
            throw new common_1.BadRequestException("Passing marks cannot exceed the sum of active question marks.");
        }
    }
    async listAssessments(user, page, pageSize, offset, query) {
        let courseIds;
        if (query.courseId) {
            const course = await this.courseFor(query.courseId, user);
            const staff = await this.hasStaffAccess(user, String(course.institution_id), String(course.id), course.campus_id);
            if (!staff) {
                const enrollment = await this.db.query(`SELECT course_id FROM lms_enrollments
           WHERE tenant_id = $1 AND institution_id = $2 AND course_id = $3 AND learner_id = $4
             AND campus_id IS NOT DISTINCT FROM $5 AND status = 'ACTIVE'`, [user.tenantId, course.institution_id, course.id, user.id, course.campus_id ?? null]);
                if (!enrollment.rows.length)
                    throw new common_1.ForbiddenException("An active course enrollment is required.");
            }
            courseIds = [String(course.id)];
        }
        else if (user.roles.some((role) => role.code === "STUDENT") && !(0, access_scope_1.isPlatformUser)(user)) {
            const enrollment = await this.db.query("SELECT course_id FROM lms_enrollments WHERE tenant_id = $1 AND learner_id = $2 AND status = 'ACTIVE'", [user.tenantId, user.id]);
            courseIds = enrollment.rows.map((row) => row.course_id);
        }
        const values = [user.tenantId];
        const clauses = ["a.tenant_id = $1"];
        if (courseIds) {
            if (!courseIds.length)
                return { data: [], meta: { page, pageSize, total: 0, totalPages: 0 } };
            values.push(courseIds);
            clauses.push(`a.course_id = ANY($${values.length}::uuid[])`);
            clauses.push("a.status = 'PUBLISHED'");
        }
        clauses.push("a.assessment_type <> 'ASSIGNMENT'");
        const isPlatform = (0, access_scope_1.isPlatformUser)(user);
        const isTeacher = user.roles.some((role) => role.code === "TEACHER");
        const isAdministrator = user.roles.some((role) => ["INSTITUTION_ADMINISTRATOR", "PRINCIPAL_DIRECTOR", "ACADEMIC_ADMINISTRATOR"].includes(role.code));
        const isStudent = user.roles.some((role) => role.code === "STUDENT");
        if (!courseIds && !isPlatform && !isTeacher && !isAdministrator && !isStudent) {
            return { data: [], meta: { page, pageSize, total: 0, totalPages: 0 } };
        }
        if (!courseIds && !isPlatform && isTeacher && !isAdministrator) {
            values.push(user.id);
            clauses.push(`EXISTS (
        SELECT 1 FROM lms_instructor_assignments ia
        WHERE ia.tenant_id = a.tenant_id
          AND ia.institution_id = a.institution_id
          AND ia.course_id = a.course_id
           AND (ia.campus_id IS NULL OR ia.campus_id = a.campus_id)
          AND ia.instructor_id = $${values.length}
          AND ia.status = 'ACTIVE'
      )`);
        }
        if (query.status) {
            values.push(query.status);
            clauses.push(`a.status = $${values.length}`);
        }
        const result = await this.db.query(`SELECT a.id, a.tenant_id, a.institution_id, a.campus_id, a.course_id, a.module_id, a.title,
              a.description, a.assessment_type, a.total_marks, a.passing_marks, a.duration_minutes,
              a.attempt_limit, a.status, a.created_at, a.updated_at, c.title AS course_title,
              cm.title AS module_title
       FROM lms_assessments a
       JOIN courses c ON c.id = a.course_id AND c.tenant_id = a.tenant_id
       JOIN course_modules cm ON cm.id = a.module_id AND cm.course_id = a.course_id AND cm.tenant_id = a.tenant_id
       WHERE ${clauses.join(" AND ")}
       ORDER BY a.created_at DESC, a.id ASC`, values);
        const visible = (0, access_scope_1.filterScopedRows)(user, result.rows);
        const data = visible.slice(offset, offset + pageSize);
        return { data, meta: { page, pageSize, total: visible.length, totalPages: Math.ceil(visible.length / pageSize) } };
    }
    async getAssessment(id, user) {
        const assessment = await this.assessmentFor(id, user);
        await this.assertLearnerAccess(assessment, user);
        return assessment;
    }
    async createAssessment(input, request) {
        const user = request.context.user;
        this.validateAssessmentInput(input);
        const course = await this.courseFor(input.courseId, user);
        await this.moduleFor(input.moduleId, input.courseId, user);
        await this.assertStaff(course, user);
        return this.run(async () => {
            const result = await this.db.query(`INSERT INTO lms_assessments
           (tenant_id, institution_id, campus_id, course_id, module_id, title, description,
            assessment_type, total_marks, passing_marks, duration_minutes, attempt_limit)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING *`, [
                user.tenantId, course.institution_id, course.campus_id ?? null, course.id, input.moduleId,
                input.title.trim(), input.description?.trim() || null, input.assessmentType,
                input.totalMarks ?? null, input.passingMarks ?? null, input.durationMinutes ?? null,
                input.attemptLimit ?? null,
            ]);
            const row = result.rows[0];
            await this.auditMutation(request, "assessment", "CREATE", row);
            return row;
        });
    }
    async updateAssessment(id, input, request) {
        const user = request.context.user;
        const before = await this.assessmentFor(id, user);
        await this.assertStaff(before, user);
        if (before.status === "ARCHIVED")
            throw new common_1.ConflictException("Archived assessments cannot be edited.");
        this.validateAssessmentInput(input, before.total_marks);
        await this.validateAssessmentMarks(id, input.totalMarks ?? before.total_marks, input.passingMarks ?? before.passing_marks, user.tenantId);
        return this.run(async () => {
            const result = await this.db.query(`UPDATE lms_assessments
         SET title = COALESCE($3, title), description = COALESCE($4, description),
             total_marks = COALESCE($5, total_marks), passing_marks = COALESCE($6, passing_marks),
             duration_minutes = COALESCE($7, duration_minutes), attempt_limit = COALESCE($8, attempt_limit),
             updated_at = now()
         WHERE id = $1 AND tenant_id = $2
         RETURNING *`, [id, user.tenantId, input.title?.trim() || null, input.description?.trim() || null,
                input.totalMarks ?? null, input.passingMarks ?? null, input.durationMinutes ?? null, input.attemptLimit ?? null]);
            const row = result.rows[0];
            await this.auditMutation(request, "assessment", "UPDATE", row, before);
            return row;
        });
    }
    async changeAssessmentStatus(id, status, request) {
        const user = request.context.user;
        const before = await this.assessmentFor(id, user);
        await this.assertStaff(before, user);
        if (status === "PUBLISHED" && (before.course_status !== "PUBLISHED" || before.module_status !== "PUBLISHED")) {
            throw new common_1.BadRequestException("Assessments can be published only inside published courses and modules.");
        }
        if (status === "PUBLISHED") {
            const questionCount = await this.db.query("SELECT count(*)::text AS count FROM lms_assessment_questions WHERE tenant_id = $1 AND assessment_id = $2 AND status = 'ACTIVE'", [user.tenantId, id]);
            if (Number(questionCount.rows[0]?.count ?? 0) === 0)
                throw new common_1.BadRequestException("Add at least one active question before publishing an assessment.");
            await this.validateAssessmentMarks(id, before.total_marks, before.passing_marks, user.tenantId);
        }
        return this.run(async () => {
            const result = await this.db.query(`UPDATE lms_assessments SET status = $3, updated_at = now()
         WHERE id = $1 AND tenant_id = $2 RETURNING *`, [id, user.tenantId, status]);
            const row = result.rows[0];
            await this.auditMutation(request, "assessment", status === "PUBLISHED" ? "PUBLISH" : "ARCHIVE", row, before);
            return row;
        });
    }
    validateOptions(questionType, options) {
        if (!questionTypes.includes(questionType))
            throw new common_1.BadRequestException("Unsupported question type.");
        if (!options.length)
            throw new common_1.BadRequestException("Each question needs at least one answer option.");
        if (options.some((option) => !option.value.trim() || !option.label.trim())) {
            throw new common_1.BadRequestException("Question options must include a value and label.");
        }
        const values = options.map((option) => option.value.trim());
        if (new Set(values).size !== values.length)
            throw new common_1.BadRequestException("Question option values must be unique.");
        const correct = options.filter((option) => option.isCorrect);
        if (["SINGLE_CHOICE", "TRUE_FALSE"].includes(questionType) && correct.length !== 1) {
            throw new common_1.BadRequestException("This question type needs exactly one correct option.");
        }
        if (questionType === "MULTIPLE_CHOICE" && correct.length < 1) {
            throw new common_1.BadRequestException("Multiple-choice questions need at least one correct option.");
        }
        if (questionType === "TRUE_FALSE" || questionType === "SINGLE_CHOICE" || questionType === "MULTIPLE_CHOICE") {
            if (options.length < 2)
                throw new common_1.BadRequestException("Choice questions need at least two options.");
        }
        if (["SHORT_TEXT", "NUMERIC"].includes(questionType) && correct.length !== 1) {
            throw new common_1.BadRequestException("Text and numeric questions need exactly one correct answer.");
        }
        if (questionType === "TRUE_FALSE" && (() => {
            const normalized = new Set(values.map((value) => value.toLowerCase()));
            return normalized.size !== 2 || !normalized.has("true") || !normalized.has("false");
        })()) {
            throw new common_1.BadRequestException("True/false questions need true and false options.");
        }
    }
    async questionFor(id, user) {
        const result = await this.db.query(`SELECT q.*, a.title AS assessment_title, a.status AS assessment_status, a.assessment_type,
              a.course_id, a.institution_id AS assessment_institution_id, a.campus_id AS assessment_campus_id,
              c.status AS course_status, cm.status AS module_status
       FROM lms_assessment_questions q
       JOIN lms_assessments a ON a.id = q.assessment_id AND a.tenant_id = q.tenant_id
       JOIN courses c ON c.id = a.course_id AND c.tenant_id = a.tenant_id
       JOIN course_modules cm ON cm.id = a.module_id AND cm.course_id = a.course_id AND cm.tenant_id = a.tenant_id
       WHERE q.id = $1 AND q.tenant_id = $2`, [id, user.tenantId]);
        const question = result.rows[0];
        if (!question)
            throw new common_1.NotFoundException("Assessment question not found.");
        (0, access_scope_1.assertScopeForRead)(user, String(question.assessment_institution_id ?? question.institution_id), question.assessment_campus_id);
        return { ...question, institution_id: question.assessment_institution_id ?? question.institution_id, campus_id: question.assessment_campus_id ?? question.campus_id };
    }
    async questionRows(executor, assessmentId, user, includeCorrect) {
        const correctColumn = includeCorrect ? ", o.is_correct" : "";
        const result = await executor.query(`SELECT q.id, q.tenant_id, q.institution_id, q.campus_id, q.course_id, q.module_id,
              q.assessment_id, q.prompt, q.question_type, q.marks, q.sequence, q.status,
              o.id AS option_id, o.option_value, o.option_label, o.sequence AS option_sequence${correctColumn}
       FROM lms_assessment_questions q
       LEFT JOIN lms_assessment_options o ON o.question_id = q.id AND o.tenant_id = q.tenant_id
       WHERE q.tenant_id = $1 AND q.assessment_id = $2 AND q.status = 'ACTIVE'
       ORDER BY q.sequence ASC, q.id ASC, o.sequence ASC, o.id ASC`, [user.tenantId, assessmentId]);
        const questions = new Map();
        for (const row of result.rows) {
            let question = questions.get(String(row.id));
            if (!question) {
                question = { id: row.id, tenant_id: row.tenant_id, institution_id: row.institution_id, campus_id: row.campus_id, course_id: row.course_id, module_id: row.module_id, assessment_id: row.assessment_id, prompt: row.prompt, question_type: row.question_type, marks: row.marks, sequence: row.sequence, status: row.status, options: [] };
                questions.set(String(row.id), question);
            }
            if (row.option_id) {
                const option = { id: row.option_id, value: row.option_value, label: row.option_label, sequence: row.option_sequence };
                if (includeCorrect)
                    option.is_correct = row.is_correct;
                question.options.push(option);
            }
        }
        return [...questions.values()];
    }
    snapshotQuestions(attempt, includeCorrect) {
        const raw = attempt.question_snapshot;
        const snapshot = typeof raw === "string" ? JSON.parse(raw) : raw;
        if (!Array.isArray(snapshot) || snapshot.length === 0)
            return null;
        return snapshot.map((question) => {
            const options = Array.isArray(question.options)
                ? question.options.map((option) => {
                    const result = { ...option };
                    if (!includeCorrect)
                        delete result.is_correct;
                    return result;
                })
                : [];
            return { ...question, options };
        });
    }
    async questionsForAttempt(executor, attempt, user, includeCorrect) {
        return this.snapshotQuestions(attempt, includeCorrect)
            ?? this.questionRows(executor, String(attempt.assessment_id), user, includeCorrect);
    }
    publicAttempt(attempt) {
        const result = { ...attempt };
        delete result.question_snapshot;
        return result;
    }
    async draftRows(executor, attemptId, tenantId) {
        const result = await executor.query(`SELECT question_id, answer_json
       FROM lms_assessment_attempt_drafts
       WHERE tenant_id = $1 AND attempt_id = $2
       ORDER BY question_id`, [tenantId, attemptId]);
        return result.rows;
    }
    async listQuestions(assessmentId, user) {
        const assessment = await this.assessmentFor(assessmentId, user);
        const staff = await this.assertLearnerAccess(assessment, user);
        const questions = await this.questionRows(this.db, assessmentId, user, staff);
        return questions;
    }
    async createQuestion(assessmentId, input, request) {
        const user = request.context.user;
        const assessment = await this.assessmentFor(assessmentId, user);
        await this.assertStaff(assessment, user);
        if (assessment.status === "PUBLISHED")
            throw new common_1.ConflictException("Published assessments cannot be changed. Archive and recreate them to change their question set.");
        this.validateOptions(input.questionType, input.options);
        return this.run(async () => this.db.transaction(async (client) => {
            const questionResult = await client.query(`INSERT INTO lms_assessment_questions
           (tenant_id, institution_id, campus_id, course_id, module_id, assessment_id, prompt, question_type, marks, sequence)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`, [user.tenantId, assessment.institution_id, assessment.campus_id ?? null, assessment.course_id, assessment.module_id, assessment.id, input.prompt.trim(), input.questionType, input.marks, input.sequence]);
            const question = questionResult.rows[0];
            for (const [index, option] of input.options.entries()) {
                await client.query(`INSERT INTO lms_assessment_options
             (tenant_id, institution_id, campus_id, course_id, module_id, assessment_id, question_id, option_value, option_label, is_correct, sequence)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`, [user.tenantId, assessment.institution_id, assessment.campus_id ?? null, assessment.course_id, assessment.module_id, assessment.id, question.id, option.value.trim(), option.label.trim(), option.isCorrect, index + 1]);
            }
            const row = { ...question, options: input.options };
            await this.auditMutation(request, "assessment_question", "CREATE", row);
            return row;
        }));
    }
    async updateQuestion(id, input, request) {
        const user = request.context.user;
        const before = await this.questionFor(id, user);
        const assessment = await this.assessmentFor(String(before.assessment_id), user);
        await this.assertStaff(assessment, user);
        if (assessment.status === "PUBLISHED")
            throw new common_1.ConflictException("Published assessments cannot be changed. Archive and recreate them to change their question set.");
        const attempts = await this.db.query("SELECT 1 FROM lms_assessment_attempts WHERE tenant_id = $1 AND assessment_id = $2 AND status = 'SUBMITTED' LIMIT 1", [user.tenantId, assessment.id]);
        if (attempts.rows[0])
            throw new common_1.ConflictException("Questions cannot be edited after an attempt has been submitted.");
        if (input.options)
            this.validateOptions(String(before.question_type), input.options);
        return this.run(async () => this.db.transaction(async (client) => {
            const result = await client.query(`UPDATE lms_assessment_questions
         SET prompt = COALESCE($3, prompt), marks = COALESCE($4, marks), sequence = COALESCE($5, sequence), updated_at = now()
         WHERE id = $1 AND tenant_id = $2 RETURNING *`, [id, user.tenantId, input.prompt?.trim() || null, input.marks ?? null, input.sequence ?? null]);
            const row = result.rows[0];
            if (input.options) {
                await client.query("DELETE FROM lms_assessment_options WHERE tenant_id = $1 AND question_id = $2", [user.tenantId, id]);
                for (const [index, option] of input.options.entries()) {
                    await client.query(`INSERT INTO lms_assessment_options
             (tenant_id, institution_id, campus_id, course_id, module_id, assessment_id, question_id, option_value, option_label, is_correct, sequence)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`, [user.tenantId, assessment.institution_id, assessment.campus_id ?? null, assessment.course_id, assessment.module_id, assessment.id, id, option.value.trim(), option.label.trim(), option.isCorrect, index + 1]);
                }
            }
            await this.auditMutation(request, "assessment_question", "UPDATE", row, before);
            return row;
        }));
    }
    async archiveQuestion(id, request) {
        const user = request.context.user;
        const before = await this.questionFor(id, user);
        const assessment = await this.assessmentFor(String(before.assessment_id), user);
        await this.assertStaff(assessment, user);
        if (assessment.status === "PUBLISHED")
            throw new common_1.ConflictException("Published assessments cannot be changed. Archive and recreate them to change their question set.");
        const result = await this.db.query(`UPDATE lms_assessment_questions SET status = 'ARCHIVED', updated_at = now()
       WHERE id = $1 AND tenant_id = $2 RETURNING *`, [id, user.tenantId]);
        const row = result.rows[0];
        await this.auditMutation(request, "assessment_question", "ARCHIVE", row, before);
        return row;
    }
    async optionFor(id, user) {
        const result = await this.db.query(`SELECT o.*, q.question_type, q.assessment_id, q.prompt, a.title AS assessment_title,
              a.institution_id AS assessment_institution_id, a.campus_id AS assessment_campus_id
       FROM lms_assessment_options o
       JOIN lms_assessment_questions q ON q.id = o.question_id AND q.tenant_id = o.tenant_id
       JOIN lms_assessments a ON a.id = q.assessment_id AND a.tenant_id = q.tenant_id
       WHERE o.id = $1 AND o.tenant_id = $2`, [id, user.tenantId]);
        const option = result.rows[0];
        if (!option)
            throw new common_1.NotFoundException("Assessment option not found.");
        (0, access_scope_1.assertScopeForRead)(user, String(option.assessment_institution_id ?? option.institution_id), option.assessment_campus_id);
        return { ...option, institution_id: option.assessment_institution_id ?? option.institution_id, campus_id: option.assessment_campus_id ?? option.campus_id };
    }
    async allOptions(questionId, user) {
        const result = await this.db.query(`SELECT id, option_value AS value, option_label AS label, is_correct AS "isCorrect"
       FROM lms_assessment_options WHERE tenant_id = $1 AND question_id = $2 ORDER BY sequence`, [user.tenantId, questionId]);
        return result.rows.map((row) => ({ value: String(row.value), label: String(row.label), isCorrect: Boolean(row.isCorrect) }));
    }
    async createOption(questionId, input, request) {
        const user = request.context.user;
        const question = await this.questionFor(questionId, user);
        const assessment = await this.assessmentFor(String(question.assessment_id), user);
        await this.assertStaff(assessment, user);
        if (assessment.status === "PUBLISHED")
            throw new common_1.ConflictException("Published assessments cannot be changed. Archive and recreate them to change their question set.");
        const options = await this.allOptions(questionId, user);
        this.validateOptions(String(question.question_type), [...options, input]);
        const result = await this.run(() => this.db.query(`INSERT INTO lms_assessment_options
         (tenant_id, institution_id, campus_id, course_id, module_id, assessment_id, question_id, option_value, option_label, is_correct, sequence)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
         (SELECT COALESCE(MAX(sequence), 0) + 1 FROM lms_assessment_options WHERE tenant_id = $1 AND question_id = $7))
       RETURNING *`, [user.tenantId, assessment.institution_id, assessment.campus_id ?? null, assessment.course_id, assessment.module_id, assessment.id, questionId, input.value.trim(), input.label.trim(), input.isCorrect]));
        await this.auditMutation(request, "assessment_option", "CREATE", result.rows[0]);
        return result.rows[0];
    }
    async updateOption(id, input, request) {
        const user = request.context.user;
        const before = await this.optionFor(id, user);
        const question = await this.questionFor(String(before.question_id), user);
        const assessment = await this.assessmentFor(String(question.assessment_id), user);
        await this.assertStaff(assessment, user);
        if (assessment.status === "PUBLISHED")
            throw new common_1.ConflictException("Published assessments cannot be changed. Archive and recreate them to change their question set.");
        const existing = await this.allOptions(String(before.question_id), user);
        const options = existing.map((option) => String(option.value) === String(before.option_value)
            ? { value: input.value?.trim() ?? option.value, label: input.label?.trim() ?? option.label, isCorrect: input.isCorrect ?? option.isCorrect }
            : option);
        this.validateOptions(String(question.question_type), options);
        const result = await this.run(() => this.db.query(`UPDATE lms_assessment_options
       SET option_value = COALESCE($3, option_value), option_label = COALESCE($4, option_label),
           is_correct = COALESCE($5, is_correct)
       WHERE id = $1 AND tenant_id = $2 RETURNING *`, [id, user.tenantId, input.value?.trim() || null, input.label?.trim() || null, input.isCorrect ?? null]));
        await this.auditMutation(request, "assessment_option", "UPDATE", result.rows[0], before);
        return result.rows[0];
    }
    async archiveOption(id, request) {
        const user = request.context.user;
        const before = await this.optionFor(id, user);
        const question = await this.questionFor(String(before.question_id), user);
        const assessment = await this.assessmentFor(String(question.assessment_id), user);
        await this.assertStaff(assessment, user);
        if (assessment.status === "PUBLISHED")
            throw new common_1.ConflictException("Published assessments cannot be changed. Archive and recreate them to change their question set.");
        const options = await this.allOptions(String(before.question_id), user);
        const remaining = options.filter((option) => option.value !== String(before.option_value));
        this.validateOptions(String(question.question_type), remaining);
        await this.db.query("DELETE FROM lms_assessment_options WHERE id = $1 AND tenant_id = $2", [id, user.tenantId]);
        await this.auditMutation(request, "assessment_option", "ARCHIVE", before);
        return { ...before, status: "ARCHIVED" };
    }
    async attemptFor(id, user) {
        const result = await this.db.query(`SELECT at.*, a.title, a.assessment_type, a.status AS assessment_status, a.total_marks,
              a.passing_marks, a.duration_minutes, a.attempt_limit, c.status AS course_status,
              cm.status AS module_status, c.institution_id AS course_institution_id,
              c.campus_id AS course_campus_id, p.status AS programme_status, i.status AS institution_status
       FROM lms_assessment_attempts at
       JOIN lms_assessments a ON a.id = at.assessment_id AND a.tenant_id = at.tenant_id
       JOIN courses c ON c.id = a.course_id AND c.tenant_id = a.tenant_id
       JOIN course_modules cm ON cm.id = a.module_id AND cm.course_id = a.course_id AND cm.tenant_id = a.tenant_id
       JOIN programmes p ON p.id = c.programme_id AND p.tenant_id = a.tenant_id
       JOIN institutions i ON i.id = p.institution_id AND i.tenant_id = a.tenant_id
       WHERE at.id = $1 AND at.tenant_id = $2`, [id, user.tenantId]);
        const attempt = result.rows[0];
        if (!attempt)
            throw new common_1.NotFoundException("Assessment attempt not found.");
        attempt.institution_id = attempt.course_institution_id ?? attempt.institution_id;
        attempt.campus_id = attempt.course_campus_id ?? attempt.campus_id;
        (0, access_scope_1.assertScopeForRead)(user, String(attempt.institution_id), attempt.campus_id);
        return attempt;
    }
    async startAttempt(assessmentId, request) {
        const user = request.context.user;
        const assessment = await this.assessmentFor(assessmentId, user);
        const staff = await this.assertLearnerAccess(assessment, user);
        if (staff || assessment.assessment_type === "ASSIGNMENT")
            throw new common_1.BadRequestException("Only enrolled learners can start a scored assessment.");
        if (assessment.status !== "PUBLISHED" || assessment.course_status !== "PUBLISHED" || assessment.module_status !== "PUBLISHED") {
            throw new common_1.BadRequestException("Only published assessments in published courses can be started.");
        }
        await this.validateAssessmentMarks(assessment.id, assessment.total_marks, assessment.passing_marks, user.tenantId);
        return this.run(async () => this.db.transaction(async (client) => {
            await client.query("SELECT id FROM lms_assessments WHERE id = $1 AND tenant_id = $2 FOR UPDATE", [assessment.id, user.tenantId]);
            const existing = await client.query(`SELECT * FROM lms_assessment_attempts
         WHERE tenant_id = $1 AND assessment_id = $2 AND learner_id = $3 AND status = 'IN_PROGRESS'
         ORDER BY started_at DESC LIMIT 1`, [user.tenantId, assessment.id, user.id]);
            if (existing.rows[0]) {
                let attempt = existing.rows[0];
                if (attempt.expires_at && new Date(String(attempt.expires_at)).getTime() <= Date.now()) {
                    const expired = await client.query(`UPDATE lms_assessment_attempts
             SET status = 'EXPIRED', updated_at = now()
             WHERE id = $1 AND tenant_id = $2 AND status = 'IN_PROGRESS'
             RETURNING *`, [attempt.id, user.tenantId]);
                    if (expired.rows[0]) {
                        await this.auditMutation(request, "assessment_attempt", "EXPIRE", expired.rows[0], attempt);
                        attempt = expired.rows[0];
                    }
                }
                else {
                    let snapshot = this.snapshotQuestions(attempt, true);
                    if (!snapshot) {
                        snapshot = await this.questionRows(client, String(assessment.id), user, true);
                        const updated = await client.query(`UPDATE lms_assessment_attempts
               SET question_snapshot = $3::jsonb,
                   total_marks_snapshot = $4,
                   passing_marks_snapshot = $5,
                   duration_minutes_snapshot = $6,
                   expires_at = CASE WHEN $6::int IS NULL THEN NULL ELSE started_at + ($6::text || ' minutes')::interval END,
                   updated_at = now()
               WHERE id = $1 AND tenant_id = $2
               RETURNING *`, [
                            attempt.id,
                            user.tenantId,
                            JSON.stringify(snapshot),
                            snapshot.reduce((sum, question) => sum + Number(question.marks), 0),
                            assessment.passing_marks ?? null,
                            assessment.duration_minutes ?? null,
                        ]);
                        attempt = updated.rows[0] ?? {
                            ...attempt,
                            question_snapshot: snapshot,
                            total_marks_snapshot: snapshot.reduce((sum, question) => sum + Number(question.marks), 0),
                            passing_marks_snapshot: assessment.passing_marks ?? null,
                            duration_minutes_snapshot: assessment.duration_minutes ?? null,
                        };
                    }
                    const drafts = await this.draftRows(client, String(attempt.id), user.tenantId);
                    return {
                        ...this.publicAttempt(attempt),
                        assessment: {
                            id: assessment.id,
                            title: assessment.title,
                            assessment_type: assessment.assessment_type,
                            duration_minutes: attempt.duration_minutes_snapshot ?? assessment.duration_minutes,
                            attempt_limit: assessment.attempt_limit,
                        },
                        questions: this.snapshotQuestions(attempt, false) ?? [],
                        draft_answers: drafts,
                    };
                }
            }
            const count = await client.query(`SELECT count(*)::text AS count FROM lms_assessment_attempts
         WHERE tenant_id = $1 AND assessment_id = $2 AND learner_id = $3`, [user.tenantId, assessment.id, user.id]);
            const attemptNumber = Number(count.rows[0]?.count ?? 0) + 1;
            if (assessment.attempt_limit !== null && attemptNumber > Number(assessment.attempt_limit)) {
                throw new common_1.BadRequestException("The assessment attempt limit has been reached.");
            }
            const inserted = await client.query(`INSERT INTO lms_assessment_attempts
           (tenant_id, institution_id, campus_id, course_id, module_id, assessment_id, learner_id, attempt_number,
            question_snapshot, total_marks_snapshot, passing_marks_snapshot, duration_minutes_snapshot, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11, $12,
                 CASE WHEN $12::int IS NULL THEN NULL ELSE now() + ($12::text || ' minutes')::interval END)
         RETURNING *`, [
                user.tenantId,
                assessment.institution_id,
                assessment.campus_id ?? null,
                assessment.course_id,
                assessment.module_id,
                assessment.id,
                user.id,
                attemptNumber,
                JSON.stringify(await this.questionRows(client, String(assessment.id), user, true)),
                assessment.total_marks ?? null,
                assessment.passing_marks ?? null,
                assessment.duration_minutes ?? null,
            ]);
            const attempt = inserted.rows[0];
            const questions = this.snapshotQuestions(attempt, false) ?? [];
            await this.auditMutation(request, "assessment_attempt", "START", attempt);
            return {
                ...this.publicAttempt(attempt),
                assessment: {
                    id: assessment.id,
                    title: assessment.title,
                    assessment_type: assessment.assessment_type,
                    duration_minutes: attempt.duration_minutes_snapshot ?? assessment.duration_minutes,
                    attempt_limit: assessment.attempt_limit,
                },
                questions,
                draft_answers: [],
            };
        }));
    }
    async getAttempt(id, user) {
        const attempt = await this.attemptFor(id, user);
        const staff = await this.hasStaffAccess(user, String(attempt.institution_id), String(attempt.course_id), attempt.campus_id);
        if (!staff && attempt.learner_id !== user.id)
            throw new common_1.NotFoundException("Assessment attempt not found.");
        const questions = await this.questionsForAttempt(this.db, attempt, user, staff);
        const answers = await this.db.query(`SELECT question_id, answer_json, is_correct, awarded_marks
       FROM lms_assessment_answers WHERE tenant_id = $1 AND attempt_id = $2 ORDER BY question_id`, [user.tenantId, id]);
        const draftAnswers = !staff && attempt.status === "IN_PROGRESS"
            ? await this.draftRows(this.db, String(attempt.id), user.tenantId)
            : [];
        return { ...this.publicAttempt(attempt), questions, answers: answers.rows, draft_answers: draftAnswers };
    }
    async saveDraft(id, input, request) {
        const user = request.context.user;
        const attempt = await this.attemptFor(id, user);
        if (attempt.learner_id !== user.id)
            throw new common_1.ForbiddenException("Only the learner who started an attempt can save it.");
        if (attempt.assessment_type === "ASSIGNMENT")
            throw new common_1.BadRequestException("Assignments use the assignment submission flow.");
        if (attempt.status !== "IN_PROGRESS")
            throw new common_1.ConflictException("Only an in-progress attempt can save answers.");
        await this.assertActiveEnrollmentForAttempt(attempt, user);
        if (attempt.expires_at && new Date(String(attempt.expires_at)).getTime() <= Date.now()) {
            throw new common_1.ConflictException("This assessment attempt has expired.");
        }
        const questions = await this.questionsForAttempt(this.db, attempt, user, false);
        const questionIds = new Set(questions.map((question) => String(question.id)));
        if (new Set(input.answers.map((answer) => answer.questionId)).size !== input.answers.length ||
            input.answers.some((answer) => !questionIds.has(answer.questionId))) {
            throw new common_1.BadRequestException("Draft answers must reference active questions exactly once.");
        }
        return this.run(async () => this.db.transaction(async (client) => {
            const locked = await client.query("SELECT * FROM lms_assessment_attempts WHERE id = $1 AND tenant_id = $2 FOR UPDATE", [id, user.tenantId]);
            if (locked.rows[0]?.status !== "IN_PROGRESS")
                throw new common_1.ConflictException("Only an in-progress attempt can save answers.");
            if (locked.rows[0]?.expires_at && new Date(String(locked.rows[0].expires_at)).getTime() <= Date.now()) {
                await client.query("UPDATE lms_assessment_attempts SET status = 'EXPIRED', updated_at = now() WHERE id = $1 AND tenant_id = $2", [id, user.tenantId]);
                throw new common_1.ConflictException("This assessment attempt has expired.");
            }
            await client.query("DELETE FROM lms_assessment_attempt_drafts WHERE tenant_id = $1 AND attempt_id = $2", [user.tenantId, id]);
            for (const answer of input.answers) {
                await client.query(`INSERT INTO lms_assessment_attempt_drafts
             (tenant_id, institution_id, campus_id, course_id, module_id, assessment_id, attempt_id, question_id, answer_json)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)`, [
                    user.tenantId,
                    attempt.institution_id,
                    attempt.campus_id ?? null,
                    attempt.course_id,
                    attempt.module_id,
                    attempt.assessment_id,
                    id,
                    answer.questionId,
                    JSON.stringify(answer.answer),
                ]);
            }
            return { attemptId: id, saved: input.answers.length };
        }));
    }
    async listAttempts(assessmentId, user, page, pageSize, offset, query) {
        const assessment = await this.assessmentFor(assessmentId, user);
        await this.assertStaff(assessment, user);
        const values = [user.tenantId, assessmentId];
        const clauses = ["at.tenant_id = $1", "at.assessment_id = $2", "at.status = 'SUBMITTED'"];
        if (query.gradingStatus) {
            values.push(query.gradingStatus);
            clauses.push(`at.grading_status = $${values.length}`);
        }
        const result = await this.db.query(`SELECT at.id, at.tenant_id, at.institution_id, at.campus_id, at.course_id, at.module_id,
              at.assessment_id, at.learner_id, at.attempt_number, at.status, at.score, at.max_score,
              at.passed, at.grading_status, at.grader_id, at.graded_at, at.grading_feedback,
              at.started_at, at.submitted_at, u.first_name AS learner_first_name,
              u.last_name AS learner_last_name, u.email AS learner_email,
              a.title AS assessment_title, a.assessment_type
       FROM lms_assessment_attempts at
       JOIN users u ON u.id = at.learner_id AND u.tenant_id = at.tenant_id
       JOIN lms_assessments a ON a.id = at.assessment_id AND a.tenant_id = at.tenant_id
       WHERE ${clauses.join(" AND ")}
       ORDER BY at.submitted_at DESC, at.attempt_number DESC, at.id ASC`, values);
        const visible = (0, access_scope_1.filterScopedRows)(user, result.rows);
        return { data: visible.slice(offset, offset + pageSize), meta: (0, pagination_1.paginationMeta)(page, pageSize, visible.length) };
    }
    async listLearnerHistory(user, page, pageSize, offset) {
        const result = await this.db.query(`SELECT at.id AS attempt_id, at.tenant_id, at.institution_id, at.campus_id, at.course_id,
              at.module_id, at.assessment_id, at.attempt_number, at.score, at.max_score, at.passed,
              at.grading_status, at.grading_feedback, at.submitted_at, a.title,
              a.assessment_type, c.title AS course_title, c.code AS course_code, cm.title AS module_title
       FROM lms_assessment_attempts at
       JOIN lms_assessments a ON a.id = at.assessment_id AND a.tenant_id = at.tenant_id
       JOIN courses c ON c.id = at.course_id AND c.tenant_id = at.tenant_id
       JOIN course_modules cm ON cm.id = at.module_id AND cm.course_id = at.course_id AND cm.tenant_id = at.tenant_id
       WHERE at.tenant_id = $1 AND at.learner_id = $2 AND at.status = 'SUBMITTED'
       ORDER BY at.submitted_at DESC, at.id ASC`, [user.tenantId, user.id]);
        const visible = (0, access_scope_1.filterScopedRows)(user, result.rows);
        return { data: visible.slice(offset, offset + pageSize), meta: (0, pagination_1.paginationMeta)(page, pageSize, visible.length) };
    }
    scoreQuestion(question, answer) {
        const options = question.options;
        const supplied = answer.answer?.value;
        if (supplied === undefined)
            throw new common_1.BadRequestException("Each answer must include a value.");
        if (question.question_type === "MULTIPLE_CHOICE") {
            if (!Array.isArray(supplied) || supplied.some((value) => typeof value !== "string")) {
                throw new common_1.BadRequestException("Multiple-choice answers must be arrays of strings.");
            }
        }
        else if (question.question_type === "NUMERIC") {
            if (typeof supplied !== "string" && typeof supplied !== "number") {
                throw new common_1.BadRequestException("Numeric answers must contain a valid number.");
            }
        }
        else if (typeof supplied !== "string") {
            throw new common_1.BadRequestException("This answer must contain a string value.");
        }
        const normalized = normalizeAnswer(supplied);
        const correctValues = options.filter((option) => option.is_correct === true).map((option) => String(option.value));
        let correct = false;
        if (question.question_type === "MULTIPLE_CHOICE") {
            if (!Array.isArray(normalized))
                throw new common_1.BadRequestException("Multiple-choice answers must be arrays.");
            correct = sameValues(normalized, correctValues);
        }
        else if (question.question_type === "NUMERIC") {
            if (typeof supplied === "string" && supplied.trim() === "") {
                return { correct: false, awardedMarks: 0 };
            }
            const expected = Number(correctValues[0]);
            const actual = Number(normalized);
            if (!Number.isFinite(actual) || !Number.isFinite(expected))
                throw new common_1.BadRequestException("Numeric answers must contain a valid number.");
            correct = actual === expected;
        }
        else {
            const actual = Array.isArray(normalized) ? normalized[0] : normalized;
            correct = correctValues.some((value) => value.toLowerCase() === actual.toLowerCase());
        }
        return { correct, awardedMarks: correct ? Number(question.marks) : 0 };
    }
    async submitAttempt(id, input, request) {
        const user = request.context.user;
        const attempt = await this.attemptFor(id, user);
        if (attempt.learner_id !== user.id)
            throw new common_1.ForbiddenException("Only the learner who started an attempt can submit it.");
        if (attempt.assessment_type === "ASSIGNMENT")
            throw new common_1.BadRequestException("Assignments use the assignment submission flow.");
        if (attempt.status !== "IN_PROGRESS")
            throw new common_1.ConflictException("This assessment attempt has already been submitted.");
        if (attempt.assessment_status !== "PUBLISHED" || attempt.course_status !== "PUBLISHED" || attempt.module_status !== "PUBLISHED") {
            throw new common_1.BadRequestException("Only published assessments in published courses can be submitted.");
        }
        await this.assertActiveEnrollmentForAttempt(attempt, user);
        const questions = await this.questionsForAttempt(this.db, attempt, user, true);
        const questionMap = new Map(questions.map((question) => [String(question.id), question]));
        if (input.answers.length !== questionMap.size || new Set(input.answers.map((answer) => answer.questionId)).size !== input.answers.length) {
            throw new common_1.BadRequestException("Submit exactly one answer for every active assessment question.");
        }
        const requiresManualGrading = manuallyGradedAssessmentTypes.includes(String(attempt.assessment_type));
        const results = input.answers.map((answer) => {
            const question = questionMap.get(answer.questionId);
            if (!question)
                throw new common_1.BadRequestException("An answer references an invalid assessment question.");
            return {
                questionId: answer.questionId,
                ...(requiresManualGrading ? { correct: null, awardedMarks: 0 } : this.scoreQuestion(question, answer)),
                answer: answer.answer,
            };
        });
        const score = results.reduce((sum, result) => sum + result.awardedMarks, 0);
        const maxScore = attempt.total_marks_snapshot === null || attempt.total_marks_snapshot === undefined
            ? questions.reduce((sum, question) => sum + Number(question.marks), 0)
            : Number(attempt.total_marks_snapshot);
        const passingMarks = attempt.passing_marks_snapshot ?? attempt.passing_marks;
        const passed = requiresManualGrading || passingMarks === null ? null : score >= Number(passingMarks);
        const outcome = await this.run(async () => this.db.transaction(async (client) => {
            const locked = await client.query("SELECT * FROM lms_assessment_attempts WHERE id = $1 AND tenant_id = $2 FOR UPDATE", [id, user.tenantId]);
            if (locked.rows[0]?.status !== "IN_PROGRESS")
                throw new common_1.ConflictException("This assessment attempt has already been submitted.");
            const enrollment = await client.query(`SELECT 1 FROM lms_enrollments
         WHERE tenant_id = $1 AND institution_id = $2 AND course_id = $3 AND learner_id = $4
           AND campus_id IS NOT DISTINCT FROM $5 AND status = 'ACTIVE'
         LIMIT 1 FOR SHARE`, [user.tenantId, attempt.institution_id, attempt.course_id, user.id, attempt.campus_id ?? null]);
            if (!enrollment.rows[0])
                throw new common_1.ForbiddenException("An active course enrollment is required.");
            if (locked.rows[0]?.expires_at && new Date(String(locked.rows[0].expires_at)).getTime() <= Date.now()) {
                const expired = await client.query(`UPDATE lms_assessment_attempts
           SET status = 'EXPIRED', updated_at = now()
           WHERE id = $1 AND tenant_id = $2 AND status = 'IN_PROGRESS'
           RETURNING *`, [id, user.tenantId]);
                await this.auditMutation(request, "assessment_attempt", "EXPIRE", expired.rows[0], attempt);
                return { expired: true, attempt: expired.rows[0] };
            }
            for (const result of results) {
                await client.query(`INSERT INTO lms_assessment_answers
             (tenant_id, institution_id, campus_id, course_id, module_id, assessment_id, attempt_id, question_id, answer_json, is_correct, awarded_marks)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11)`, [user.tenantId, attempt.institution_id, attempt.campus_id ?? null, attempt.course_id, attempt.module_id, attempt.assessment_id, id, result.questionId, JSON.stringify(result.answer), result.correct, result.awardedMarks]);
            }
            await client.query("DELETE FROM lms_assessment_attempt_drafts WHERE tenant_id = $1 AND attempt_id = $2", [user.tenantId, id]);
            const updated = await client.query(`UPDATE lms_assessment_attempts
          SET status = 'SUBMITTED', score = $3, max_score = $4, passed = $5,
              grading_status = $6, submitted_at = now(), updated_at = now()
         WHERE id = $1 AND tenant_id = $2 RETURNING *`, [id, user.tenantId, score, maxScore, passed, requiresManualGrading ? "PENDING" : "NOT_REQUIRED"]);
            await this.auditMutation(request, "assessment_attempt", "SUBMIT", updated.rows[0], attempt);
            if (!requiresManualGrading) {
                const completion = await client.query(`INSERT INTO lms_assessment_completions
              (tenant_id, institution_id, campus_id, course_id, module_id, assessment_id, learner_id, attempt_id, score, passed, completed_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, now())
            ON CONFLICT (tenant_id, assessment_id, learner_id, attempt_id)
            DO UPDATE SET score = EXCLUDED.score, passed = EXCLUDED.passed, completed_at = EXCLUDED.completed_at, updated_at = now()
            RETURNING *`, [user.tenantId, attempt.institution_id, attempt.campus_id ?? null, attempt.course_id, attempt.module_id, attempt.assessment_id, user.id, id, score, passed]);
                await this.auditMutation(request, "assessment_completion", "COMPLETE", completion.rows[0]);
            }
            return { ...updated.rows[0], results };
        }));
        if ("expired" in outcome && outcome.expired) {
            throw new common_1.ConflictException("This assessment attempt expired before it was submitted.");
        }
        return outcome;
    }
    async gradeAttempt(id, input, request) {
        const user = request.context.user;
        const attempt = await this.attemptFor(id, user);
        const staff = await this.hasStaffAccess(user, String(attempt.institution_id), String(attempt.course_id), attempt.campus_id);
        if (!staff)
            throw new common_1.ForbiddenException("You are not authorized to grade this assessment attempt.");
        if (!manuallyGradedAssessmentTypes.includes(String(attempt.assessment_type))) {
            throw new common_1.BadRequestException("This assessment is scored automatically.");
        }
        if (attempt.status !== "SUBMITTED" || attempt.grading_status !== "PENDING") {
            throw new common_1.ConflictException("This assessment attempt is no longer awaiting grading.");
        }
        const questions = await this.questionsForAttempt(this.db, attempt, user, false);
        const questionMap = new Map(questions.map((question) => [String(question.id), question]));
        if (input.grades.length !== questionMap.size || new Set(input.grades.map((grade) => grade.questionId)).size !== input.grades.length) {
            throw new common_1.BadRequestException("Grade exactly one mark for every active assessment question.");
        }
        for (const grade of input.grades) {
            const question = questionMap.get(grade.questionId);
            if (!question)
                throw new common_1.BadRequestException("A grade references an invalid assessment question.");
            if (grade.awardedMarks > Number(question.marks)) {
                throw new common_1.BadRequestException("A question grade cannot exceed its configured marks.");
            }
        }
        const score = input.grades.reduce((sum, grade) => sum + grade.awardedMarks, 0);
        const maxScore = attempt.total_marks_snapshot === null || attempt.total_marks_snapshot === undefined
            ? questions.reduce((sum, question) => sum + Number(question.marks), 0)
            : Number(attempt.total_marks_snapshot);
        const passingMarks = attempt.passing_marks_snapshot ?? attempt.passing_marks;
        const passed = passingMarks === null ? null : score >= Number(passingMarks);
        return this.run(async () => this.db.transaction(async (client) => {
            const locked = await client.query("SELECT * FROM lms_assessment_attempts WHERE id = $1 AND tenant_id = $2 FOR UPDATE", [id, user.tenantId]);
            if (locked.rows[0]?.status !== "SUBMITTED" || locked.rows[0]?.grading_status !== "PENDING") {
                throw new common_1.ConflictException("This assessment attempt is no longer awaiting grading.");
            }
            const answerRows = await client.query("SELECT question_id, answer_json FROM lms_assessment_answers WHERE tenant_id = $1 AND attempt_id = $2", [user.tenantId, id]);
            if (answerRows.rows.length !== questions.length) {
                throw new common_1.BadRequestException("Every assessment question must have a submitted answer before grading.");
            }
            const results = [];
            for (const grade of input.grades) {
                const answer = await client.query(`UPDATE lms_assessment_answers
           SET awarded_marks = $3, is_correct = NULL
           WHERE tenant_id = $1 AND attempt_id = $2 AND question_id = $4
           RETURNING question_id, answer_json, awarded_marks`, [user.tenantId, id, grade.awardedMarks, grade.questionId]);
                if (!answer.rows[0])
                    throw new common_1.BadRequestException("Every grade must match a submitted assessment answer.");
                results.push({ questionId: grade.questionId, answer: answer.rows[0].answer_json, correct: null, awardedMarks: grade.awardedMarks });
            }
            const updated = await client.query(`UPDATE lms_assessment_attempts
         SET score = $3, max_score = $4, passed = $5, grading_status = 'GRADED',
             grader_id = $6, graded_at = now(), grading_feedback = $7, updated_at = now()
         WHERE id = $1 AND tenant_id = $2 RETURNING *`, [id, user.tenantId, score, maxScore, passed, user.id, input.feedback?.trim() || null]);
            const completion = await client.query(`INSERT INTO lms_assessment_completions
           (tenant_id, institution_id, campus_id, course_id, module_id, assessment_id, learner_id, attempt_id, score, passed, completed_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, now())
         ON CONFLICT (tenant_id, assessment_id, learner_id, attempt_id)
         DO UPDATE SET score = EXCLUDED.score, passed = EXCLUDED.passed, completed_at = EXCLUDED.completed_at, updated_at = now()
         RETURNING *`, [user.tenantId, attempt.institution_id, attempt.campus_id ?? null, attempt.course_id, attempt.module_id, attempt.assessment_id, attempt.learner_id, id, score, passed]);
            await this.auditMutation(request, "assessment_attempt", "GRADE", updated.rows[0], attempt);
            await this.auditMutation(request, "assessment_completion", "COMPLETE", completion.rows[0]);
            return { ...updated.rows[0], results };
        }));
    }
};
exports.AssessmentService = AssessmentService;
exports.AssessmentService = AssessmentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        audit_service_1.AuditService])
], AssessmentService);
//# sourceMappingURL=assessment.service.js.map