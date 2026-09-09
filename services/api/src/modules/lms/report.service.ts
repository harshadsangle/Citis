import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { DatabaseService } from "../../database/database.service";
import type { AuthenticatedUser } from "../../common/request-context";
import type { CertificateReportQueryDto } from "./lms.dto";

export const LMS_REPORTS = [
  "students",
  "activity",
  "progress",
  "assessments",
  "assignments",
  "certificates",
  "payments",
  "refunds",
] as const;

type ReportName = typeof LMS_REPORTS[number];

const reportHeaders: Record<ReportName, string[]> = {
  students: ["id", "student_type", "institution_name", "college_user_id", "status", "created_at", "last_login_at"],
  activity: ["id", "event_type", "resource_type", "resource_id", "student_id", "student_name", "metadata", "created_at"],
  progress: ["student_id", "student_name", "student_type", "institution_name", "course_id", "course_title", "enrollment_status", "enrolled_at", "completed_at", "progress_percent"],
  assessments: ["student_id", "student_name", "course_id", "course_title", "assessment_id", "assessment_title", "attempt_id", "attempt_status", "score", "passed", "submitted_at"],
  assignments: ["student_id", "student_name", "course_id", "course_title", "assignment_id", "assignment_title", "submission_id", "submission_status", "grade", "passed", "submitted_at", "reviewer_id", "graded_at"],
  certificates: ["id", "certificate_number", "status", "student_id", "student_name", "course_id", "course_title", "completion_date", "approved_at", "issue_date", "revoked_at"],
  payments: ["id", "student_id", "student_name", "course_id", "course_title", "amount_minor", "currency", "status", "created_at", "captured_at"],
  refunds: ["id", "student_id", "student_name", "course_id", "course_title", "payment_id", "amount_minor", "status", "reason", "created_at", "processed_at"],
};

function isCitisAdmin(user: AuthenticatedUser) {
  return user.roles.some((role) => role.code === "CITIS_ADMIN");
}

@Injectable()
export class ReportService {
  constructor(private readonly db: DatabaseService) {}

  private assertAdmin(user: AuthenticatedUser) {
    if (!isCitisAdmin(user)) throw new ForbiddenException("Only CITIS Admin can access global reports.");
  }

  private normalizeReport(report: string): ReportName {
    if (!LMS_REPORTS.includes(report as ReportName)) throw new BadRequestException("Unsupported report.");
    return report as ReportName;
  }

  private commonFilters(report: ReportName, query: CertificateReportQueryDto, values: unknown[], clauses: string[]) {
    if (query.dateFrom) {
      values.push(query.dateFrom);
      clauses.push(`report_date >= $${values.length}`);
    }
    if (query.dateTo) {
      values.push(query.dateTo);
      clauses.push(`report_date < ($${values.length}::timestamptz + interval '1 day')`);
    }
    if (query.studentId) {
      values.push(query.studentId);
      clauses.push(`student_id = $${values.length}`);
    }
    if (query.courseId && report !== "students" && report !== "activity") {
      values.push(query.courseId);
      clauses.push(`course_id = $${values.length}`);
    }
    if (query.institutionId && report !== "payments" && report !== "refunds") {
      values.push(query.institutionId);
      clauses.push(`institution_id = $${values.length}`);
    }
    if (query.studentType && report !== "certificates" && report !== "payments" && report !== "refunds") {
      values.push(query.studentType);
      clauses.push(`student_type = $${values.length}`);
    }
    if (query.instructorId && ["progress", "assessments", "assignments"].includes(report)) {
      values.push(query.instructorId);
      clauses.push(`EXISTS (
        SELECT 1 FROM lms_instructor_assignments ri
        WHERE ri.tenant_id = report_tenant_id AND ri.course_id = report_course_id
          AND ri.instructor_id = $${values.length} AND ri.status = 'ACTIVE'
      )`);
    }
  }

  private async rows(reportInput: string, query: CertificateReportQueryDto, user: AuthenticatedUser) {
    this.assertAdmin(user);
    const report = this.normalizeReport(reportInput);
    const values: unknown[] = [user.tenantId];
    const clauses = ["report_tenant_id = $1"];
    let sql: string;

    if (report === "students") {
      sql = `SELECT u.id, sp.student_type, i.name AS institution_name, sp.college_user_id,
                    u.status, u.created_at, u.last_login_at,
                    u.tenant_id AS report_tenant_id, sp.institution_id,
                    u.created_at AS report_date, u.id AS student_id
             FROM users u
             JOIN lms_student_profiles sp ON sp.tenant_id = u.tenant_id AND sp.user_id = u.id
             LEFT JOIN institutions i ON i.tenant_id = sp.tenant_id AND i.id = sp.institution_id
             WHERE 1=1`;
    } else if (report === "activity") {
      sql = `SELECT e.id, e.event_type, e.resource_type, e.resource_id,
                    e.subject_user_id AS student_id,
                    concat_ws(' ', u.first_name, u.last_name) AS student_name,
                    e.metadata, e.created_at,
                    e.tenant_id AS report_tenant_id, e.institution_id,
                    e.created_at AS report_date, sp.student_type,
                    NULL::uuid AS course_id
             FROM lms_activity_events e
             LEFT JOIN users u ON u.tenant_id = e.tenant_id AND u.id = e.subject_user_id
             LEFT JOIN lms_student_profiles sp ON sp.tenant_id = e.tenant_id AND sp.user_id = e.subject_user_id
             WHERE 1=1`;
    } else if (report === "progress") {
      sql = `SELECT e.learner_id AS student_id,
                    concat_ws(' ', u.first_name, u.last_name) AS student_name,
                    sp.student_type, i.name AS institution_name,
                    e.course_id, c.title AS course_title, e.status AS enrollment_status,
                    e.enrolled_at, e.completed_at, e.progress_percent,
                    e.tenant_id AS report_tenant_id, e.institution_id,
                    e.course_id AS report_course_id, e.enrolled_at AS report_date
             FROM lms_enrollments e
             JOIN users u ON u.tenant_id = e.tenant_id AND u.id = e.learner_id
             LEFT JOIN lms_student_profiles sp ON sp.tenant_id = e.tenant_id AND sp.user_id = e.learner_id
             JOIN courses c ON c.tenant_id = e.tenant_id AND c.id = e.course_id
             LEFT JOIN programmes p ON p.tenant_id = c.tenant_id AND p.id = c.programme_id
             LEFT JOIN institutions i ON i.tenant_id = p.tenant_id AND i.id = p.institution_id
             WHERE 1=1`;
    } else if (report === "assessments") {
      sql = `SELECT at.learner_id AS student_id,
                    concat_ws(' ', u.first_name, u.last_name) AS student_name,
                    a.course_id, c.title AS course_title, a.id AS assessment_id,
                    a.title AS assessment_title, at.id AS attempt_id, at.status AS attempt_status,
                    at.score, at.passed, at.submitted_at,
                    at.tenant_id AS report_tenant_id, c.institution_id,
                    a.course_id AS report_course_id, sp.student_type,
                    at.submitted_at AS report_date
             FROM lms_assessment_attempts at
             JOIN lms_assessments a ON a.tenant_id = at.tenant_id AND a.id = at.assessment_id
             JOIN courses c ON c.tenant_id = a.tenant_id AND c.id = a.course_id
             JOIN users u ON u.tenant_id = at.tenant_id AND u.id = at.learner_id
             LEFT JOIN lms_student_profiles sp ON sp.tenant_id = at.tenant_id AND sp.user_id = at.learner_id
             WHERE 1=1`;
    } else if (report === "assignments") {
      sql = `SELECT s.learner_id AS student_id,
                    concat_ws(' ', u.first_name, u.last_name) AS student_name,
                    s.course_id, c.title AS course_title, s.assignment_id,
                    a.title AS assignment_title, s.id AS submission_id, s.status AS submission_status,
                    s.grade, CASE WHEN s.status = 'GRADED' AND s.grade >= (a.total_marks * 0.5) THEN true ELSE false END AS passed,
                    s.submitted_at, s.graded_by AS reviewer_id, s.graded_at,
                    s.tenant_id AS report_tenant_id, s.institution_id,
                    s.course_id AS report_course_id, sp.student_type,
                    s.submitted_at AS report_date
             FROM lms_assignment_submissions s
             JOIN lms_assessments a ON a.tenant_id = s.tenant_id AND a.id = s.assignment_id
             JOIN courses c ON c.tenant_id = s.tenant_id AND c.id = s.course_id
             JOIN users u ON u.tenant_id = s.tenant_id AND u.id = s.learner_id
             LEFT JOIN lms_student_profiles sp ON sp.tenant_id = s.tenant_id AND sp.user_id = s.learner_id
             WHERE 1=1`;
    } else if (report === "certificates") {
      sql = `SELECT cert.id, cert.certificate_number, cert.status, cert.learner_id AS student_id,
                    concat_ws(' ', u.first_name, u.last_name) AS student_name,
                    cert.course_id, c.title AS course_title, cert.completion_date,
                    cert.approved_at, cert.issue_date, cert.revoked_at,
                    cert.tenant_id AS report_tenant_id, cert.institution_id,
                    cert.course_id AS report_course_id, cert.issue_date AS report_date,
                    sp.student_type
             FROM lms_certificates cert
             JOIN users u ON u.tenant_id = cert.tenant_id AND u.id = cert.learner_id
             JOIN courses c ON c.tenant_id = cert.tenant_id AND c.id = cert.course_id
             LEFT JOIN lms_student_profiles sp ON sp.tenant_id = cert.tenant_id AND sp.user_id = cert.learner_id
             WHERE 1=1`;
    } else if (report === "payments") {
      sql = `SELECT p.id, p.student_id, concat_ws(' ', u.first_name, u.last_name) AS student_name,
                    p.course_id, c.title AS course_title, p.amount_minor, p.currency, p.status,
                    p.created_at, p.captured_at,
                    p.tenant_id AS report_tenant_id, p.created_at AS report_date
             FROM lms_payments p
             JOIN users u ON u.tenant_id = p.tenant_id AND u.id = p.student_id
             JOIN courses c ON c.tenant_id = p.tenant_id AND c.id = p.course_id
             WHERE 1=1`;
    } else {
      sql = `SELECT r.id, p.student_id, concat_ws(' ', u.first_name, u.last_name) AS student_name,
                    p.course_id, c.title AS course_title, r.payment_id, r.amount_minor,
                    r.status, r.reason, r.created_at, r.processed_at,
                    r.tenant_id AS report_tenant_id, r.created_at AS report_date
             FROM lms_refunds r
             JOIN lms_payments p ON p.tenant_id = r.tenant_id AND p.id = r.payment_id
             JOIN users u ON u.tenant_id = p.tenant_id AND u.id = p.student_id
             JOIN courses c ON c.tenant_id = p.tenant_id AND c.id = p.course_id
             WHERE 1=1`;
    }

    this.commonFilters(report, query, values, clauses);
    if (query.status && report === "certificates") {
      values.push(query.status);
      clauses.push(`status = $${values.length}`);
    }
    if (query.paymentStatus && ["payments", "refunds"].includes(report)) {
      values.push(query.paymentStatus);
      clauses.push(`status = $${values.length}`);
    }
    if (query.assessmentStatus && report === "assessments") {
      values.push(query.assessmentStatus);
      clauses.push(`attempt_status = $${values.length}`);
    }
    if (query.assignmentStatus && report === "assignments") {
      values.push(query.assignmentStatus);
      clauses.push(`submission_status = $${values.length}`);
    }
    if (query.completionStatus && report === "progress") {
      values.push(query.completionStatus);
      clauses.push(`enrollment_status = $${values.length}`);
    }
    return (await this.db.query<Record<string, unknown>>(`SELECT * FROM (${sql}) report WHERE ${clauses.join(" AND ")} ORDER BY report_date DESC NULLS LAST LIMIT 5000`, values)).rows;
  }

  async run(report: string, query: CertificateReportQueryDto, user: AuthenticatedUser) {
    const normalized = this.normalizeReport(report);
    const rows = await this.rows(normalized, query, user);
    return { report: normalized, count: rows.length, data: rows };
  }

  async csv(report: string, query: CertificateReportQueryDto, user: AuthenticatedUser) {
    const normalized = this.normalizeReport(report);
    const rows = await this.rows(normalized, query, user);
    const headers = reportHeaders[normalized];
    const escape = (value: unknown) => {
      const raw = value === null || value === undefined
        ? ""
        : typeof value === "object" ? JSON.stringify(value) : String(value);
      return `"${raw.replace(/"/g, "\"\"")}"`;
    };
    const lines = [headers.map(escape).join(",")];
    for (const row of rows) lines.push(headers.map((header) => escape(row[header])).join(","));
    return { filename: `citis-${normalized}-report.csv`, content: `${lines.join("\r\n")}\r\n` };
  }
}