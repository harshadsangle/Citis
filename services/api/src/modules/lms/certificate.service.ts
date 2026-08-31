import { randomBytes } from "node:crypto";
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { assertScopeForRead, filterScopedRows, isPlatformUser } from "../../common/access-scope";
import { AuditService } from "../../common/audit.service";
import type { AuthenticatedUser, ContextRequest } from "../../common/request-context";
import { DatabaseService } from "../../database/database.service";
import { renderCertificateSvg } from "./certificate-renderer";
import type { CertificateListQueryDto } from "./lms.dto";

const certificateSelect = `
  SELECT cert.id, cert.tenant_id, cert.institution_id, cert.campus_id, cert.course_id,
         cert.enrollment_id, cert.learner_id, cert.certificate_number, cert.verification_id,
         cert.issue_date, cert.status, cert.document_format, cert.renderer_version,
         cert.created_at, cert.updated_at, u.first_name AS learner_first_name,
         u.last_name AS learner_last_name, c.title AS course_title, c.code AS course_code,
         i.name AS institution_name
  FROM lms_certificates cert
  JOIN users u ON u.id = cert.learner_id AND u.tenant_id = cert.tenant_id
  JOIN courses c ON c.id = cert.course_id AND c.tenant_id = cert.tenant_id
  JOIN institutions i ON i.id = cert.institution_id AND i.tenant_id = cert.tenant_id
`;

function staffRole(user: AuthenticatedUser) {
  return user.roles.some((role) => [
    "CITIS_SUPER_ADMIN",
    "INSTITUTION_ADMINISTRATOR",
    "PRINCIPAL_DIRECTOR",
    "ACADEMIC_ADMINISTRATOR",
    "TEACHER",
  ].includes(role.code));
}

function learnerName(row: Record<string, unknown>) {
  return [row.learner_first_name, row.learner_last_name].filter((part) => typeof part === "string" && part.trim()).join(" ");
}

function issueDateLabel(value: unknown) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "long" }).format(new Date(String(value)));
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

  private async certificateRow(id: string, user: AuthenticatedUser) {
    const result = await this.db.query<Record<string, unknown>>(
      `${certificateSelect}
       WHERE cert.id = $1 AND cert.tenant_id = $2 AND cert.status = 'ISSUED'`,
      [id, user.tenantId],
    );
    const row = result.rows[0];
    if (!row) throw new NotFoundException("Certificate not found.");
    assertScopeForRead(user, String(row.institution_id), row.campus_id as string | null | undefined);
    return row;
  }

  private async assertCertificateAccess(row: Record<string, unknown>, user: AuthenticatedUser) {
    if (row.learner_id === user.id) return;
    if (isPlatformUser(user)) return;
    if (!staffRole(user)) throw new NotFoundException("Certificate not found.");
    if (user.roles.some((role) => role.code === "TEACHER")
      && !user.roles.some((role) => ["INSTITUTION_ADMINISTRATOR", "PRINCIPAL_DIRECTOR", "ACADEMIC_ADMINISTRATOR"].includes(role.code))) {
      const assigned = await this.db.query(
        `SELECT 1 FROM lms_instructor_assignments
         WHERE tenant_id = $1 AND institution_id = $2 AND course_id = $3
           AND (campus_id IS NULL OR $4::uuid IS NULL OR campus_id = $4)
           AND instructor_id = $5 AND status = 'ACTIVE'
         LIMIT 1`,
        [user.tenantId, row.institution_id, row.course_id, row.campus_id ?? null, user.id],
      );
      if (!assigned.rows[0]) throw new NotFoundException("Certificate not found.");
    }
  }

  private safeDetails(row: Record<string, unknown>) {
    return {
      id: row.id,
      certificate_number: row.certificate_number,
      verification_id: row.verification_id,
      learner_name: learnerName(row),
      course_title: row.course_title,
      course_code: row.course_code,
      institution_name: row.institution_name,
      issue_date: row.issue_date,
      status: row.status,
      document_format: row.document_format,
    };
  }

  async list(user: AuthenticatedUser, page: number, pageSize: number, offset: number, query: CertificateListQueryDto = {}) {
    const values: unknown[] = [user.tenantId];
    const clauses = ["cert.tenant_id = $1", "cert.status = 'ISSUED'"];
    const administrator = user.roles.some((role) => [
      "INSTITUTION_ADMINISTRATOR",
      "PRINCIPAL_DIRECTOR",
      "ACADEMIC_ADMINISTRATOR",
    ].includes(role.code));

    if (!staffRole(user) || (!administrator && !isPlatformUser(user))) {
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
    if (!isPlatformUser(user) && user.roles.some((role) => role.code === "TEACHER") && !administrator) {
      values.push(user.id);
      clauses.push(`EXISTS (
        SELECT 1 FROM lms_instructor_assignments ia
        WHERE ia.tenant_id = cert.tenant_id AND ia.institution_id = cert.institution_id
          AND ia.course_id = cert.course_id
          AND (ia.campus_id IS NULL OR ia.campus_id IS NOT DISTINCT FROM cert.campus_id)
          AND ia.instructor_id = $${values.length} AND ia.status = 'ACTIVE'
      )`);
    }
    const result = await this.db.query<Record<string, unknown>>(
      `${certificateSelect}
       WHERE ${clauses.join(" AND ")}
       ORDER BY cert.issue_date DESC, cert.id ASC`,
      values,
    );
    const visible = filterScopedRows(user, result.rows);
    const data = visible.slice(offset, offset + pageSize).map((row) => this.safeDetails(row));
    return {
      data,
      meta: { page, pageSize, total: visible.length, totalPages: Math.ceil(visible.length / pageSize) },
    };
  }

  async get(id: string, user: AuthenticatedUser) {
    const row = await this.certificateRow(id, user);
    await this.assertCertificateAccess(row, user);
    return this.safeDetails(row);
  }

  async download(id: string, request: ContextRequest) {
    const user = request.context.user!;
    const row = await this.certificateRow(id, user);
    await this.assertCertificateAccess(row, user);
    await this.audit.record({
      tenantId: user.tenantId,
      institutionId: row.institution_id as string,
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
      institutionName: String(row.institution_name),
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
       WHERE cert.status = 'ISSUED'
         AND (cert.certificate_number = $1 OR cert.verification_id = $1)
       LIMIT 1`,
      [normalized],
    );
    const row = result.rows[0];
    if (!row) return { valid: false };
    if (requestId) {
      await this.audit.record({
        tenantId: String(row.tenant_id),
        institutionId: String(row.institution_id),
        campusId: (row.campus_id as string | null) ?? null,
        requestId,
        module: "lms",
        resource: "certificate",
        resourceId: row.id as string,
        action: "VERIFY",
        newValue: { certificate_number: row.certificate_number },
      });
    }
    return {
      valid: true,
      certificate_number: row.certificate_number,
      verification_id: row.verification_id,
      learner_name: learnerName(row),
      course_title: row.course_title,
      course_code: row.course_code,
      institution_name: row.institution_name,
      issue_date: row.issue_date,
    };
  }

  async issueIfEligible(tenantId: string, courseId: string, learnerId: string, request?: ContextRequest) {
    const issued = await this.db.transaction(async (client) => {
      const enrollment = await client.query<Record<string, unknown>>(
        `SELECT e.id AS enrollment_id, e.tenant_id, e.institution_id, e.campus_id, e.course_id,
                e.learner_id, c.title AS course_title, c.code AS course_code,
                i.name AS institution_name
         FROM lms_enrollments e
         JOIN courses c ON c.id = e.course_id AND c.tenant_id = e.tenant_id
         JOIN programmes p ON p.id = c.programme_id AND p.tenant_id = e.tenant_id
         JOIN institutions i ON i.id = e.institution_id AND i.tenant_id = e.tenant_id
         JOIN users u ON u.id = e.learner_id AND u.tenant_id = e.tenant_id
         WHERE e.tenant_id = $1 AND e.course_id = $2 AND e.learner_id = $3
           AND e.status = 'ACTIVE' AND c.status = 'PUBLISHED' AND p.status = 'PUBLISHED'
           AND i.status = 'ACTIVE' AND u.status = 'ACTIVE'
           AND e.campus_id IS NOT DISTINCT FROM c.campus_id
           AND EXISTS (
             SELECT 1 FROM course_modules cm
             JOIN lessons l ON l.module_id = cm.id AND l.tenant_id = cm.tenant_id
             WHERE cm.tenant_id = e.tenant_id AND cm.course_id = e.course_id
               AND cm.status = 'PUBLISHED' AND l.status = 'PUBLISHED'
           )
           AND NOT EXISTS (
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
           )
           AND NOT EXISTS (
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
           )
         ORDER BY e.enrolled_at ASC, e.id ASC
         LIMIT 1`,
        [tenantId, courseId, learnerId],
      );
      const eligibleEnrollment = enrollment.rows[0];
      if (!eligibleEnrollment) return null;

      const inserted = await client.query<Record<string, unknown>>(
        `INSERT INTO lms_certificates
           (tenant_id, institution_id, campus_id, course_id, enrollment_id, learner_id,
            certificate_number, verification_id, issue_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now())
         ON CONFLICT (tenant_id, enrollment_id) DO NOTHING
         RETURNING *`,
        [
          tenantId,
          eligibleEnrollment.institution_id,
          eligibleEnrollment.campus_id ?? null,
          courseId,
          eligibleEnrollment.enrollment_id,
          learnerId,
          this.certificateNumber(),
          this.verificationId(),
        ],
      );
      if (inserted.rows[0]) return { ...eligibleEnrollment, ...inserted.rows[0], issued_now: true };
      const existing = await client.query<Record<string, unknown>>(
        `${certificateSelect}
         WHERE cert.tenant_id = $1 AND cert.enrollment_id = $2 AND cert.status = 'ISSUED'`,
        [tenantId, eligibleEnrollment.enrollment_id],
      );
      return existing.rows[0] ? { ...existing.rows[0], issued_now: false } : null;
    });

    if (issued && request && issued.issued_now) {
      await this.audit.record({
        tenantId,
        institutionId: issued.institution_id as string,
        campusId: (issued.campus_id as string | null) ?? null,
        actorUserId: request.context.user?.id ?? null,
        requestId: request.context.requestId,
        module: "lms",
        resource: "certificate",
        resourceId: issued.id as string,
        action: "ISSUE",
        newValue: {
          certificate_number: issued.certificate_number,
          verification_id: issued.verification_id,
          course_id: courseId,
          learner_id: learnerId,
        },
        ipAddress: request.context.ipAddress,
        deviceContext: { userAgent: request.context.userAgent },
      });
    }
    return issued ? this.safeDetails(issued) : null;
  }
}