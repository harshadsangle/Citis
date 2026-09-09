import { randomBytes } from "node:crypto";
import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { assertScopeForRead, filterScopedRows, isLmsAdministrator, isPlatformUser } from "../../common/access-scope";
import { AuditService } from "../../common/audit.service";
import type { AuthenticatedUser, ContextRequest } from "../../common/request-context";
import { DatabaseService } from "../../database/database.service";
import { renderCertificateSvg } from "./certificate-renderer";
import type { CertificateListQueryDto, CertificateReportQueryDto, CertificateReviewDecisionDto } from "./lms.dto";

const certificateSelect = `
  SELECT cert.id, cert.tenant_id, cert.institution_id, cert.campus_id, cert.course_id,
         cert.enrollment_id, cert.learner_id, cert.certificate_number, cert.verification_id,
         cert.issue_date, cert.completion_date, cert.eligible_at, cert.status,
         cert.document_format, cert.renderer_version, cert.approved_by, cert.approved_at,
         cert.review_notes, cert.rejected_by, cert.rejected_at, cert.rejection_notes,
         cert.revoked_by, cert.revoked_at, cert.revocation_reason, cert.issued_at,
         cert.created_at, cert.updated_at, u.first_name AS learner_first_name,
         u.last_name AS learner_last_name, c.title AS course_title, c.code AS course_code,
         i.name AS institution_name
  FROM lms_certificates cert
  JOIN users u ON u.id = cert.learner_id AND u.tenant_id = cert.tenant_id
  JOIN courses c ON c.id = cert.course_id AND c.tenant_id = cert.tenant_id
  LEFT JOIN institutions i ON i.id = cert.institution_id AND i.tenant_id = cert.tenant_id
`;

function learnerName(row: Record<string, unknown>) {
  return [row.learner_first_name, row.learner_last_name]
    .filter((part) => typeof part === "string" && part.trim())
    .join(" ");
}

function issueDateLabel(value: unknown) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "long" }).format(new Date(String(value)));
}

function isCitisAdmin(user: AuthenticatedUser) {
  return user.roles.some((role) => role.code === "CITIS_ADMIN");
}

@Injectable()
export class CertificateService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  private certificateNumber() {
    return `CITIS-${new Date().getUTCFullYear()}-${randomBytes(5).toString("hex").toUpperCase()}`;
  }

  private verificationId() {
    return randomBytes(18).toString("base64url");
  }

  private assertAdmin(user: AuthenticatedUser) {
    if (!isCitisAdmin(user)) throw new ForbiddenException("Only CITIS Admin can manage certificates.");
  }

  private async certificateRow(id: string, user: AuthenticatedUser) {
    const result = await this.db.query<Record<string, unknown>>(
      `${certificateSelect} WHERE cert.id = $1 AND cert.tenant_id = $2`,
      [id, user.tenantId],
    );
    const row = result.rows[0];
    if (!row) throw new NotFoundException("Certificate not found.");
    if (row.learner_id !== user.id && !isPlatformUser(user) && !isCitisAdmin(user)) {
      const instructor = user.roles.some((role) => role.code === "TEACHER" || role.code === "INSTRUCTOR");
      if (!instructor) throw new NotFoundException("Certificate not found.");
      const assigned = await this.db.query(
        `SELECT 1 FROM lms_instructor_assignments
         WHERE tenant_id = $1 AND institution_id IS NOT DISTINCT FROM $2
           AND course_id = $3 AND (campus_id IS NULL OR $4::uuid IS NULL OR campus_id = $4)
           AND instructor_id = $5 AND status = 'ACTIVE'
         UNION ALL
         SELECT 1 FROM lms_instructor_colleges
         WHERE tenant_id = $1 AND institution_id IS NOT DISTINCT FROM $2
           AND instructor_id = $5 AND status = 'ACTIVE'
         LIMIT 1`,
        [user.tenantId, row.institution_id ?? null, row.course_id, row.campus_id ?? null, user.id],
      );
      if (!assigned.rows[0]) throw new NotFoundException("Certificate not found.");
    } else if (row.learner_id !== user.id && !isPlatformUser(user) && !isCitisAdmin(user)) {
      throw new NotFoundException("Certificate not found.");
    }
    if (row.learner_id !== user.id) {
      if (typeof row.institution_id === "string") {
        assertScopeForRead(user, row.institution_id, row.campus_id as string | null | undefined);
      }
    }
    return row;
  }

  private safeDetails(row: Record<string, unknown>) {
    return {
      id: row.id,
      course_id: row.course_id,
      enrollment_id: row.enrollment_id,
      certificate_number: row.certificate_number,
      verification_id: row.verification_id,
      learner_name: learnerName(row),
      course_title: row.course_title,
      course_code: row.course_code,
      institution_name: row.institution_name ?? null,
      completion_date: row.completion_date,
      eligible_at: row.eligible_at,
      issue_date: row.issue_date,
      issued_at: row.issued_at,
      status: row.status,
      approved_at: row.approved_at,
      review_notes: row.review_notes,
      rejection_notes: row.rejection_notes,
      revoked_at: row.revoked_at,
      revocation_reason: row.revocation_reason,
      document_format: row.document_format,
    };
  }

  async list(user: AuthenticatedUser, page: number, pageSize: number, offset: number, query: CertificateListQueryDto = {}) {
    const values: unknown[] = [user.tenantId];
    const clauses = ["cert.tenant_id = $1"];
    const administrator = isCitisAdmin(user) || isLmsAdministrator(user);
    const instructor = user.roles.some((role) => role.code === "TEACHER" || role.code === "INSTRUCTOR");

    if (!administrator && !instructor) {
      values.push(user.id);
      clauses.push(`cert.learner_id = $${values.length}`);
    } else if (query.learnerId) {
      values.push(query.learnerId);
      clauses.push(`cert.learner_id = $${values.length}`);
    }
    if (query.courseId) {
      values.push(query.courseId);
      clauses.push(`cert.course_id = $${values.length}`);
    }
    if (!isPlatformUser(user) && instructor && !administrator) {
      values.push(user.id);
      clauses.push(`EXISTS (
        SELECT 1 FROM lms_instructor_assignments ia
        WHERE ia.tenant_id = cert.tenant_id AND ia.institution_id IS NOT DISTINCT FROM cert.institution_id
          AND ia.course_id = cert.course_id
          AND (ia.campus_id IS NULL OR ia.campus_id IS NOT DISTINCT FROM cert.campus_id)
          AND ia.instructor_id = $${values.length} AND ia.status = 'ACTIVE'
        UNION ALL
        SELECT 1 FROM lms_instructor_colleges ic
        WHERE ic.tenant_id = cert.tenant_id AND ic.institution_id IS NOT DISTINCT FROM cert.institution_id
          AND ic.instructor_id = $${values.length} AND ic.status = 'ACTIVE'
      )`);
    }
    const result = await this.db.query<Record<string, unknown>>(
      `${certificateSelect} WHERE ${clauses.join(" AND ")} ORDER BY cert.updated_at DESC, cert.id ASC`,
      values,
    );
    const visible = (!administrator && !instructor && user.studentType === "DIRECT_STUDENT")
      ? result.rows
      : filterScopedRows(user, result.rows);
    const data = visible.slice(offset, offset + pageSize).map((row) => this.safeDetails(row));
    return {
      data,
      meta: { page, pageSize, total: visible.length, totalPages: Math.ceil(visible.length / pageSize) },
    };
  }

  async get(id: string, user: AuthenticatedUser) {
    return this.safeDetails(await this.certificateRow(id, user));
  }

  async download(id: string, request: ContextRequest) {
    const user = request.context.user!;
    const row = await this.certificateRow(id, user);
    if (row.status !== "ISSUED") throw new NotFoundException("Issued certificate not found.");
    await this.audit.record({
      tenantId: user.tenantId,
      institutionId: (row.institution_id as string | null) ?? null,
      campusId: (row.campus_id as string | null) ?? null,
      actorUserId: user.id,
      requestId: request.context.requestId,
      module: "lms",
      resource: "certificate",
      resourceId: row.id as string,
      action: "DOWNLOAD",
      newValue: { certificate_number: row.certificate_number, document_format: row.document_format },
      ipAddress: request.context.ipAddress,
      deviceContext: { userAgent: request.context.userAgent },
    });
    const svg = renderCertificateSvg({
      learnerName: learnerName(row),
      courseTitle: String(row.course_title),
      courseCode: String(row.course_code),
      institutionName: String(row.institution_name ?? "CITIS InfoTech"),
      certificateNumber: String(row.certificate_number),
      issueDate: issueDateLabel(row.issue_date),
      verificationId: String(row.verification_id),
    });
    return {
      content: Buffer.from(svg, "utf8"),
      filename: `citis-certificate-${String(row.certificate_number).replace(/[^A-Za-z0-9-]/g, "")}.svg`,
    };
  }

  async verify(identifier: string, requestId?: string) {
    const normalized = identifier.trim();
    if (!normalized || normalized.length > 160) return { valid: false };
    const result = await this.db.query<Record<string, unknown>>(
      `${certificateSelect}
       WHERE cert.status IN ('ISSUED', 'REVOKED')
         AND (cert.certificate_number = $1 OR cert.verification_id = $1)
       LIMIT 1`,
      [normalized],
    );
    const row = result.rows[0];
    if (!row) return { valid: false };
    if (requestId) {
      await this.audit.record({
        tenantId: String(row.tenant_id),
        institutionId: (row.institution_id as string | null) ?? null,
        campusId: (row.campus_id as string | null) ?? null,
        requestId,
        module: "lms",
        resource: "certificate",
        resourceId: row.id as string,
        action: "VERIFY",
        newValue: { certificate_number: row.certificate_number, status: row.status },
      });
    }
    return {
      valid: row.status === "ISSUED",
      certificate_number: row.certificate_number,
      verification_id: row.verification_id,
      learner_name: learnerName(row),
      course_title: row.course_title,
      course_code: row.course_code,
      institution_name: row.institution_name ?? null,
      issue_date: row.issue_date,
      status: row.status,
      revocation_reason: row.status === "REVOKED" ? row.revocation_reason : undefined,
    };
  }

  private async eligibilityRow(executor: { query: (text: string, values?: unknown[]) => Promise<{ rows: Record<string, unknown>[] }> }, tenantId: string, enrollmentId: string) {
    const result = await executor.query(
      `SELECT e.id AS enrollment_id, e.tenant_id, e.institution_id, e.campus_id, e.course_id,
              e.learner_id, e.enrolled_at, e.completed_at, e.progress_percent,
              c.title AS course_title, c.code AS course_code, i.name AS institution_name,
              CASE WHEN NOT EXISTS (
                SELECT 1 FROM course_modules cm
                JOIN lessons l ON l.module_id = cm.id AND l.tenant_id = cm.tenant_id
                WHERE cm.tenant_id = e.tenant_id AND cm.course_id = e.course_id
                  AND cm.status = 'PUBLISHED' AND l.status = 'PUBLISHED'
                  AND NOT EXISTS (
                    SELECT 1 FROM lms_lesson_progress lp
                    WHERE lp.tenant_id = e.tenant_id AND lp.course_id = e.course_id
                      AND lp.module_id = cm.id AND lp.lesson_id = l.id
                      AND lp.learner_id = e.learner_id AND lp.status = 'COMPLETED'
                  )
              ) AND NOT EXISTS (
                SELECT 1 FROM lms_assessments a
                JOIN course_modules cm ON cm.id = a.module_id AND cm.tenant_id = a.tenant_id
                WHERE a.tenant_id = e.tenant_id AND a.course_id = e.course_id
                  AND a.status = 'PUBLISHED' AND cm.status = 'PUBLISHED'
                  AND NOT EXISTS (
                    SELECT 1 FROM lms_assessment_completions ac
                    WHERE ac.tenant_id = e.tenant_id AND ac.course_id = e.course_id
                      AND ac.module_id = a.module_id AND ac.assessment_id = a.id
                      AND ac.learner_id = e.learner_id AND ac.status = 'COMPLETED'
                      AND ac.passed IS DISTINCT FROM false
                  )
              ) AND COALESCE(e.progress_percent, 0) = 100
              THEN true ELSE false END AS eligible
       FROM lms_enrollments e
       JOIN courses c ON c.id = e.course_id AND c.tenant_id = e.tenant_id
       JOIN programmes p ON p.id = c.programme_id AND p.tenant_id = e.tenant_id
       LEFT JOIN institutions i ON i.id = p.institution_id AND i.tenant_id = e.tenant_id
       WHERE e.tenant_id = $1 AND e.id = $2 AND e.status = 'ACTIVE'
         AND c.status = 'PUBLISHED' AND p.status = 'PUBLISHED'`,
      [tenantId, enrollmentId],
    );
    return result.rows[0] ?? null;
  }

  private async upsertEligibility(executor: { query: (text: string, values?: unknown[]) => Promise<{ rows: Record<string, unknown>[] }> }, row: Record<string, unknown>) {
    const result = await executor.query(
      `INSERT INTO lms_certificates
         (tenant_id, institution_id, campus_id, course_id, enrollment_id, learner_id,
          certificate_number, verification_id, completion_date, eligible_at, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now(), 'ELIGIBLE_FOR_REVIEW')
       ON CONFLICT (tenant_id, enrollment_id) DO UPDATE
       SET completion_date = EXCLUDED.completion_date,
           eligible_at = CASE WHEN lms_certificates.status IN ('NOT_ELIGIBLE', 'ELIGIBLE_FOR_REVIEW') THEN now() ELSE lms_certificates.eligible_at END,
           status = CASE WHEN lms_certificates.status = 'NOT_ELIGIBLE' THEN 'ELIGIBLE_FOR_REVIEW' ELSE lms_certificates.status END,
           updated_at = now()
       RETURNING id`,
      [
        row.tenant_id,
        row.institution_id ?? null,
        row.campus_id ?? null,
        row.course_id,
        row.enrollment_id,
        row.learner_id,
        this.certificateNumber(),
        this.verificationId(),
        row.completed_at ?? new Date(),
      ],
    );
    return result.rows[0]?.id as string | undefined;
  }

  async eligibility(enrollmentId: string, user: AuthenticatedUser) {
    const row = await this.eligibilityRow(this.db, user.tenantId, enrollmentId);
    if (!row) throw new NotFoundException("Enrollment not found.");
    if (row.learner_id !== user.id) this.assertAdmin(user);
    if (!row.eligible) {
      return { enrollment_id: enrollmentId, course_id: row.course_id, learner_id: row.learner_id, status: "NOT_ELIGIBLE", eligible: false };
    }
    const id = await this.upsertEligibility(this.db, row);
    const certificate = id ? await this.db.query<Record<string, unknown>>(`${certificateSelect} WHERE cert.id = $1 AND cert.tenant_id = $2`, [id, user.tenantId]) : { rows: [] };
    return certificate.rows[0] ? this.safeDetails(certificate.rows[0]) : { enrollment_id: enrollmentId, status: "ELIGIBLE_FOR_REVIEW", eligible: true };
  }

  async listReview(query: CertificateReportQueryDto, user: AuthenticatedUser) {
    this.assertAdmin(user);
    const eligible = await this.db.query<Record<string, unknown>>(
      `SELECT e.id AS enrollment_id
       FROM lms_enrollments e
       WHERE e.tenant_id = $1 AND e.status = 'ACTIVE'
         AND ($2::uuid IS NULL OR e.institution_id = $2)
         AND ($3::uuid IS NULL OR e.learner_id = $3)
         AND ($4::uuid IS NULL OR e.course_id = $4)`,
      [user.tenantId, query.institutionId ?? null, query.studentId ?? null, query.courseId ?? null],
    );
    for (const enrollment of eligible.rows) {
      const row = await this.eligibilityRow(this.db, user.tenantId, String(enrollment.enrollment_id));
      if (row?.eligible) await this.upsertEligibility(this.db, row);
    }
    const values: unknown[] = [user.tenantId];
    const clauses = ["cert.tenant_id = $1"];
    if (query.status) {
      values.push(query.status);
      clauses.push(`cert.status = $${values.length}`);
    }
    if (query.institutionId) {
      values.push(query.institutionId);
      clauses.push(`cert.institution_id = $${values.length}`);
    }
    if (query.studentId) {
      values.push(query.studentId);
      clauses.push(`cert.learner_id = $${values.length}`);
    }
    if (query.courseId) {
      values.push(query.courseId);
      clauses.push(`cert.course_id = $${values.length}`);
    }
    const result = await this.db.query<Record<string, unknown>>(
      `${certificateSelect} WHERE ${clauses.join(" AND ")} ORDER BY cert.updated_at DESC`,
      values,
    );
    return result.rows.map((row) => this.safeDetails(row));
  }

  async approve(id: string, input: CertificateReviewDecisionDto, request: ContextRequest) {
    const user = request.context.user!;
    this.assertAdmin(user);
    const row = await this.certificateRow(id, user);
    if (!["ELIGIBLE_FOR_REVIEW", "APPROVED"].includes(String(row.status))) {
      throw new ConflictException("Only eligible certificates can be approved.");
    }
    const eligibility = await this.eligibilityRow(this.db, user.tenantId, String(row.enrollment_id));
    if (!eligibility?.eligible) throw new ConflictException("The course is no longer eligible for certification.");
    const result = await this.db.query<Record<string, unknown>>(
      `UPDATE lms_certificates
       SET status = 'ISSUED', approved_by = $3, approved_at = COALESCE(approved_at, now()),
           review_notes = $4, completion_date = COALESCE(completion_date, $5),
           issue_date = COALESCE(issue_date, now()), issued_at = COALESCE(issued_at, now()), updated_at = now()
       WHERE id = $1 AND tenant_id = $2 AND status IN ('ELIGIBLE_FOR_REVIEW', 'APPROVED')
       RETURNING id`,
      [id, user.tenantId, user.id, input.notes?.trim() || null, eligibility.completed_at ?? new Date()],
    );
    if (!result.rows[0]) throw new ConflictException("Certificate approval could not be completed.");
    await this.auditCertificateAction(row, request, "APPROVE", { notes: input.notes?.trim() || null });
    await this.auditCertificateAction(row, request, "ISSUE", { certificate_id: id });
    return this.get(id, user);
  }

  async reject(id: string, input: CertificateReviewDecisionDto, request: ContextRequest) {
    const user = request.context.user!;
    this.assertAdmin(user);
    const row = await this.certificateRow(id, user);
    if (!["ELIGIBLE_FOR_REVIEW", "APPROVED"].includes(String(row.status))) {
      throw new ConflictException("Only eligible certificates can be rejected.");
    }
    const result = await this.db.query<Record<string, unknown>>(
      `UPDATE lms_certificates
       SET status = 'REJECTED', rejected_by = $3, rejected_at = now(), rejection_notes = $4, updated_at = now()
       WHERE id = $1 AND tenant_id = $2 AND status IN ('ELIGIBLE_FOR_REVIEW', 'APPROVED')
       RETURNING id`,
      [id, user.tenantId, user.id, input.notes?.trim() || null],
    );
    if (!result.rows[0]) throw new ConflictException("Certificate rejection could not be completed.");
    await this.auditCertificateAction(row, request, "REJECT", { notes: input.notes?.trim() || null });
    return this.get(id, user);
  }

  async issue(id: string, request: ContextRequest) {
    const user = request.context.user!;
    this.assertAdmin(user);
    const row = await this.certificateRow(id, user);
    if (row.status !== "APPROVED") throw new ConflictException("Only approved certificates can be issued.");
    const result = await this.db.query<Record<string, unknown>>(
      `UPDATE lms_certificates
       SET status = 'ISSUED', issue_date = COALESCE(issue_date, now()), issued_at = COALESCE(issued_at, now()), updated_at = now()
       WHERE id = $1 AND tenant_id = $2 AND status = 'APPROVED'
       RETURNING id`,
      [id, user.tenantId],
    );
    if (!result.rows[0]) throw new ConflictException("Certificate issuance could not be completed.");
    await this.auditCertificateAction(row, request, "ISSUE", {});
    return this.get(id, user);
  }

  async revoke(id: string, input: CertificateReviewDecisionDto, request: ContextRequest) {
    const user = request.context.user!;
    this.assertAdmin(user);
    const row = await this.certificateRow(id, user);
    if (row.status !== "ISSUED") throw new ConflictException("Only issued certificates can be revoked.");
    const result = await this.db.query<Record<string, unknown>>(
      `UPDATE lms_certificates
       SET status = 'REVOKED', revoked_by = $3, revoked_at = now(), revocation_reason = $4, updated_at = now()
       WHERE id = $1 AND tenant_id = $2 AND status = 'ISSUED'
       RETURNING id`,
      [id, user.tenantId, user.id, input.notes?.trim() || null],
    );
    if (!result.rows[0]) throw new ConflictException("Certificate revocation could not be completed.");
    await this.auditCertificateAction(row, request, "REVOKE", { reason: input.notes?.trim() || null });
    return this.get(id, user);
  }

  private async auditCertificateAction(row: Record<string, unknown>, request: ContextRequest, action: string, details: Record<string, unknown>) {
    await this.audit.record({
      tenantId: request.context.user!.tenantId,
      institutionId: (row.institution_id as string | null) ?? null,
      campusId: (row.campus_id as string | null) ?? null,
      actorUserId: request.context.user!.id,
      requestId: request.context.requestId,
      module: "lms",
      resource: "certificate",
      resourceId: String(row.id),
      action,
      newValue: { learner_id: row.learner_id, course_id: row.course_id, ...details },
      ipAddress: request.context.ipAddress,
      deviceContext: { userAgent: request.context.userAgent },
    });
  }

  /**
   * Kept as a compatibility boundary for older callers. Eligibility is
   * persisted for admin review; this method never issues a certificate.
   */
  async issueIfEligible(tenantId: string, courseId: string, learnerId: string, request?: ContextRequest) {
    const result = await this.db.query<Record<string, unknown>>(
      `SELECT e.id AS enrollment_id
       FROM lms_enrollments e
       WHERE e.tenant_id = $1 AND e.course_id = $2 AND e.learner_id = $3 AND e.status = 'ACTIVE'
       ORDER BY e.enrolled_at ASC, e.id ASC LIMIT 1`,
      [tenantId, courseId, learnerId],
    );
    if (!result.rows[0]) return null;
    const row = await this.eligibilityRow(this.db, tenantId, String(result.rows[0].enrollment_id));
    if (!row?.eligible) return null;
    const id = await this.upsertEligibility(this.db, row);
    if (request && id) await this.auditCertificateAction({ ...row, id }, request, "ELIGIBILITY_CALCULATED", { status: "ELIGIBLE_FOR_REVIEW" });
    return id ? this.get(id, request?.context.user ?? {
      id: learnerId, tenantId, email: "", firstName: "", lastName: "",
      roles: [{ code: "CITIS_ADMIN", name: "CITIS Admin" }], permissions: [], scopes: [],
    }) : null;
  }
}