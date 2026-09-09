import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { PoolClient } from "pg";
import { isLmsAdministrator } from "../../common/access-scope";
import { AuditService } from "../../common/audit.service";
import type { AuthenticatedUser, ContextRequest } from "../../common/request-context";
import { paginationMeta } from "../../common/pagination";
import { DatabaseService } from "../../database/database.service";
import { hashPassword, STRONG_PASSWORD_PATTERN } from "../auth/password-security";
import type { LmsUpload } from "../lms/resource-storage.service";
import { normalizedHeader, parseCsv, type CsvRecord } from "./college-students.csv";
import type { CollegeStudentListQueryDto } from "./college-students.dto";

const MAX_IMPORT_BYTES = 5 * 1024 * 1024;
const MAX_IMPORT_ROWS = 5_000;
const COLLEGE_STUDENT_ROLE = "STUDENT";

type ImportStatus = "IMPORTED" | "UPDATED" | "DUPLICATE" | "INVALID" | "FAILED";
type ImportCounts = {
  totalRows: number;
  imported: number;
  updated: number;
  duplicates: number;
  invalid: number;
  failed: number;
};

interface ParsedStudent {
  collegeName: string;
  collegeUserId: string;
  studentName: string;
  email: string | null;
  mobile: string | null;
  password: string;
  status: "ACTIVE" | "INACTIVE";
}

function safeFilename(name: string) {
  return name.trim().slice(0, 255) || "college-students.csv";
}

function splitName(name: string) {
  const parts = name.trim().split(/\s+/);
  return { firstName: parts[0] ?? "", lastName: parts.slice(1).join(" ") };
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

function isMobile(value: string) {
  return /^\+?[0-9][0-9 ()-]{7,19}$/.test(value);
}

@Injectable()
export class CollegeStudentsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  private assertCitisAdmin(user: AuthenticatedUser) {
    if (!user.roles.some((role) => role.code === "CITIS_ADMIN")) {
      throw new ForbiddenException("Only CITIS Admin can manage college students.");
    }
  }

  private headerIndexes(headers: string[]) {
    const indexes = new Map(headers.map((header, index) => [normalizedHeader(header), index]));
    const find = (...names: string[]) => names.map(normalizedHeader).map((name) => indexes.get(name)).find((index) => index !== undefined);
    const required = {
      collegeName: find("College/University", "College University", "Institution"),
      collegeUserId: find("College User ID", "College UserID", "User ID", "Student ID"),
      studentName: find("Student Name", "Name"),
      password: find("Password supplied by college", "Password", "Temporary Password"),
      status: find("Active/Inactive status", "Status"),
    };
    const missing = Object.entries(required)
      .filter(([, value]) => value === undefined)
      .map(([key]) => key);
    if (missing.length) {
      throw new BadRequestException(`CSV is missing required columns: ${missing.join(", ")}.`);
    }
    return {
      ...required as { [K in keyof typeof required]: number },
      email: find("Email", "Email optional"),
      mobile: find("Phone", "Mobile", "Phone optional"),
    };
  }

  private parseStudent(record: CsvRecord, indexes: ReturnType<CollegeStudentsService["headerIndexes"]>) {
    const cell = (index: number | undefined) => (index === undefined ? "" : (record.row[index] ?? "").trim());
    const collegeName = cell(indexes.collegeName);
    const collegeUserId = cell(indexes.collegeUserId);
    const studentName = cell(indexes.studentName);
    const emailValue = cell(indexes.email);
    const mobileValue = cell(indexes.mobile);
    const password = cell(indexes.password);
    const statusValue = cell(indexes.status).toUpperCase();
    const errors: string[] = [];

    if (!collegeName) errors.push("College/University is required.");
    if (!collegeUserId || !/^[A-Za-z0-9._/@-]{1,100}$/.test(collegeUserId)) errors.push("College User ID is required and must be a valid identifier.");
    if (!studentName || studentName.length > 160) errors.push("Student Name is required.");
    if (!password || password.length > 128 || !STRONG_PASSWORD_PATTERN.test(password)) {
      errors.push("Password must be 8–128 characters and include uppercase, lowercase, and a number.");
    }
    if (!["ACTIVE", "INACTIVE"].includes(statusValue)) errors.push("Status must be Active or Inactive.");
    if (emailValue && !isEmail(emailValue)) errors.push("Email is invalid.");
    if (mobileValue && !isMobile(mobileValue)) errors.push("Phone is invalid.");

    if (errors.length) return { errors };
    return {
      student: {
        collegeName,
        collegeUserId,
        studentName,
        email: emailValue ? emailValue.toLowerCase() : null,
        mobile: mobileValue || null,
        password,
        status: statusValue as "ACTIVE" | "INACTIVE",
      } satisfies ParsedStudent,
      errors: [],
    };
  }

  private async insertRow(
    client: PoolClient,
    tenantId: string,
    importId: string,
    rowNumber: number,
    data: ParsedStudent,
  ): Promise<{ status: "IMPORTED" | "UPDATED"; userId: string; institutionId: string }> {
    const institution = await client.query<{ id: string }>(
      `SELECT id FROM institutions
       WHERE tenant_id = $1 AND status <> 'ARCHIVED' AND lower(name) = lower($2)
       LIMIT 2`,
      [tenantId, data.collegeName],
    );
    if (institution.rows.length !== 1) {
      throw new Error(institution.rows.length ? "College/University name is ambiguous." : "College/University was not found.");
    }
    const institutionId = institution.rows[0].id;
    const existingProfile = await client.query<{ user_id: string; student_type: string }>(
      `SELECT user_id, student_type
       FROM lms_student_profiles
       WHERE tenant_id = $1 AND institution_id = $2
         AND student_type = 'COLLEGE_STUDENT'
         AND lower(college_user_id) = lower($3)
       FOR UPDATE`,
      [tenantId, institutionId, data.collegeUserId],
    );
    let userId: string;
    let status: "IMPORTED" | "UPDATED" = "IMPORTED";

    if (existingProfile.rows[0]) {
      if (existingProfile.rows[0].student_type !== "COLLEGE_STUDENT") {
        throw new Error("The existing account is not a college student.");
      }
      userId = existingProfile.rows[0].user_id;
      status = "UPDATED";
      const passwordHash = await hashPassword(data.password);
      const { firstName, lastName } = splitName(data.studentName);
      await client.query(
        `UPDATE users
         SET first_name = $1, last_name = $2, email = $3, mobile = $4,
             password_hash = $5, status = $6, updated_at = now()
         WHERE tenant_id = $7 AND id = $8`,
        [firstName, lastName, data.email, data.mobile, passwordHash, data.status === "ACTIVE" ? "ACTIVE" : "DISABLED", tenantId, userId],
      );
      await client.query(
        `UPDATE lms_student_profiles
         SET status = $1, college_user_id = $2, updated_at = now()
         WHERE tenant_id = $3 AND user_id = $4`,
        [data.status, data.collegeUserId, tenantId, userId],
      );
    } else {
      if (data.email || data.mobile) {
        const contact = await client.query<{ id: string }>(
          `SELECT id FROM users
           WHERE tenant_id = $1
             AND (($2::text IS NOT NULL AND lower(email) = lower($2))
               OR ($3::text IS NOT NULL AND mobile = $3))
           LIMIT 1`,
          [tenantId, data.email, data.mobile],
        );
        if (contact.rows[0]) throw new ConflictException("Email or phone already belongs to another account.");
      }
      const passwordHash = await hashPassword(data.password);
      const { firstName, lastName } = splitName(data.studentName);
      const user = await client.query<{ id: string }>(
        `INSERT INTO users (tenant_id, email, mobile, password_hash, first_name, last_name, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [tenantId, data.email, data.mobile, passwordHash, firstName, lastName, data.status === "ACTIVE" ? "ACTIVE" : "DISABLED"],
      );
      userId = user.rows[0].id;
      const role = await client.query<{ id: string }>(
        "SELECT id FROM roles WHERE tenant_id = $1 AND code = $2 AND status = 'ACTIVE' LIMIT 1",
        [tenantId, COLLEGE_STUDENT_ROLE],
      );
      if (!role.rows[0]) throw new Error("The student role is not configured for this tenant.");
      await client.query(
        `INSERT INTO user_roles (tenant_id, user_id, role_id, institution_id)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT DO NOTHING`,
        [tenantId, userId, role.rows[0].id, institutionId],
      );
      await client.query(
        `INSERT INTO lms_student_profiles
          (tenant_id, user_id, student_type, institution_id, college_user_id, status)
         VALUES ($1, $2, 'COLLEGE_STUDENT', $3, $4, $5)`,
        [tenantId, userId, institutionId, data.collegeUserId, data.status],
      );
    }

    await client.query(
      `INSERT INTO lms_activity_events
        (tenant_id, institution_id, actor_user_id, subject_user_id, event_type, resource_type, resource_id, metadata)
       VALUES ($1, $2, $3, $4, $5, 'college_student_import', $6, $7::jsonb)`,
      [tenantId, institutionId, null, userId, status === "IMPORTED" ? "COLLEGE_STUDENT_IMPORTED" : "COLLEGE_STUDENT_UPDATED", importId, JSON.stringify({ rowNumber })],
    );
    return { status, userId, institutionId };
  }

  async importCsv(file: LmsUpload | undefined, request: ContextRequest) {
    const user = request.context.user!;
    this.assertCitisAdmin(user);
    if (!file?.buffer?.length) throw new BadRequestException("A CSV file is required.");
    if (file.size > MAX_IMPORT_BYTES) throw new BadRequestException("CSV file exceeds the 5 MB limit.");
    if (file.originalname && !file.originalname.toLowerCase().endsWith(".csv")) {
      throw new BadRequestException("Only CSV files are supported.");
    }

    const parsed = parseCsv(file.buffer.toString("utf8"));
    const indexes = this.headerIndexes(parsed.headers);
    if (parsed.records.length > MAX_IMPORT_ROWS) throw new BadRequestException(`CSV cannot contain more than ${MAX_IMPORT_ROWS} rows.`);
    const counts: ImportCounts = { totalRows: parsed.records.length, imported: 0, updated: 0, duplicates: 0, invalid: 0, failed: 0 };

    const result = await this.db.transaction(async (client) => {
      const run = await client.query<{ id: string }>(
        `INSERT INTO lms_student_imports (tenant_id, uploaded_by, original_filename, total_rows)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [user.tenantId, user.id, safeFilename(file.originalname), parsed.records.length],
      );
      const importId = run.rows[0].id;
      const seen = new Set<string>();
      for (const record of parsed.records) {
        const parsedRow = this.parseStudent(record, indexes);
        if (parsedRow.errors.length) {
          counts.invalid += 1;
          await client.query(
            `INSERT INTO lms_student_import_rows
              (tenant_id, import_id, row_number, college_name, college_user_id, status, reason)
             VALUES ($1, $2, $3, $4, $5, 'INVALID', $6)`,
            [user.tenantId, importId, record.rowNumber, record.row[Number(indexes.collegeName)]?.trim() || "", record.row[Number(indexes.collegeUserId)]?.trim() || null, parsedRow.errors.join(" ")],
          );
          continue;
        }
        const data = parsedRow.student!;
        const duplicateKey = `${data.collegeName.toLowerCase()}:${data.collegeUserId.toLowerCase()}`;
        if (seen.has(duplicateKey)) {
          counts.duplicates += 1;
          await client.query(
            `INSERT INTO lms_student_import_rows
              (tenant_id, import_id, row_number, college_name, college_user_id, status, reason)
             VALUES ($1, $2, $3, $4, $5, 'DUPLICATE', $6)`,
            [user.tenantId, importId, record.rowNumber, data.collegeName, data.collegeUserId, "Duplicate College User ID in this CSV."],
          );
          continue;
        }
        seen.add(duplicateKey);

        await client.query(`SAVEPOINT college_student_row`);
        try {
          const imported = await this.insertRow(client, user.tenantId, importId, record.rowNumber, data);
          counts[imported.status === "IMPORTED" ? "imported" : "updated"] += 1;
          await client.query(
            `INSERT INTO lms_student_import_rows
              (tenant_id, import_id, row_number, college_name, college_user_id, institution_id, user_id, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [user.tenantId, importId, record.rowNumber, data.collegeName, data.collegeUserId, imported.institutionId, imported.userId, imported.status],
          );
          await client.query(`RELEASE SAVEPOINT college_student_row`);
        } catch (error) {
          await client.query(`ROLLBACK TO SAVEPOINT college_student_row`);
          await client.query(`RELEASE SAVEPOINT college_student_row`);
          const reason = error instanceof ConflictException
            ? error.message
            : error instanceof Error && error.message.includes("College/University")
              ? error.message
              : "The row could not be imported.";
          counts[reason === "The row could not be imported." ? "failed" : "invalid"] += 1;
          await client.query(
            `INSERT INTO lms_student_import_rows
              (tenant_id, import_id, row_number, college_name, college_user_id, status, reason)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [user.tenantId, importId, record.rowNumber, data.collegeName, data.collegeUserId, reason === "The row could not be imported." ? "FAILED" : "INVALID", reason],
          );
        }
      }
      const status = counts.failed || counts.invalid || counts.duplicates
        ? (counts.imported || counts.updated ? "PARTIAL" : "FAILED")
        : "COMPLETED";
      await client.query(
        `UPDATE lms_student_imports
         SET status = $1, imported_count = $2, updated_count = $3, duplicate_count = $4,
             invalid_count = $5, failed_count = $6, completed_at = now()
         WHERE tenant_id = $7 AND id = $8`,
        [status, counts.imported, counts.updated, counts.duplicates, counts.invalid, counts.failed, user.tenantId, importId],
      );
      return { importId, status };
    });

    await this.audit.record({
      tenantId: user.tenantId,
      actorUserId: user.id,
      requestId: request.context.requestId,
      module: "lms",
      resource: "college_student_import",
      resourceId: result.importId,
      action: "CREATE",
      newValue: counts,
      ipAddress: request.context.ipAddress,
      deviceContext: { userAgent: request.context.userAgent },
    });
    return this.getImport(result.importId, user);
  }

  async listImports(user: AuthenticatedUser) {
    this.assertCitisAdmin(user);
    const result = await this.db.query(
      `SELECT id, original_filename, status, total_rows, imported_count, updated_count,
              duplicate_count, invalid_count, failed_count, created_at, completed_at
       FROM lms_student_imports
       WHERE tenant_id = $1
       ORDER BY created_at DESC`,
      [user.tenantId],
    );
    return result.rows;
  }

  async getImport(id: string, user: AuthenticatedUser) {
    this.assertCitisAdmin(user);
    const run = await this.db.query(
      `SELECT id, original_filename, status, total_rows, imported_count, updated_count,
              duplicate_count, invalid_count, failed_count, created_at, completed_at
       FROM lms_student_imports WHERE tenant_id = $1 AND id = $2`,
      [user.tenantId, id],
    );
    if (!run.rows[0]) throw new NotFoundException("Import result not found.");
    const rows = await this.db.query(
      `SELECT row_number, college_name, college_user_id, institution_id, user_id, status, reason
       FROM lms_student_import_rows
       WHERE tenant_id = $1 AND import_id = $2
       ORDER BY row_number`,
      [user.tenantId, id],
    );
    return { ...run.rows[0], rows: rows.rows };
  }

  async listStudents(user: AuthenticatedUser, query: CollegeStudentListQueryDto, page: number, pageSize: number, offset: number) {
    this.assertCitisAdmin(user);
    const values: unknown[] = [user.tenantId];
    const clauses = ["sp.tenant_id = $1", "sp.student_type = 'COLLEGE_STUDENT'"];
    if (query.institutionId) {
      values.push(query.institutionId);
      clauses.push(`sp.institution_id = $${values.length}`);
    }
    if (query.status) {
      values.push(query.status);
      clauses.push(`sp.status = $${values.length}`);
    }
    if (query.search) {
      values.push(`%${query.search.trim()}%`);
      clauses.push(`(u.first_name ILIKE $${values.length} OR u.last_name ILIKE $${values.length} OR sp.college_user_id ILIKE $${values.length})`);
    }
    const where = clauses.join(" AND ");
    const [rows, total] = await Promise.all([
      this.db.query(
        `SELECT sp.id, sp.user_id, sp.college_user_id, sp.status, sp.institution_id,
                i.name AS institution_name, u.first_name, u.last_name, u.email, u.mobile, u.created_at
         FROM lms_student_profiles sp
         JOIN users u ON u.tenant_id = sp.tenant_id AND u.id = sp.user_id
         JOIN institutions i ON i.tenant_id = sp.tenant_id AND i.id = sp.institution_id
         WHERE ${where}
         ORDER BY u.created_at DESC, sp.id
         LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
        [...values, pageSize, offset],
      ),
      this.db.query<{ count: string }>(`SELECT count(*)::text AS count FROM lms_student_profiles sp JOIN users u ON u.tenant_id = sp.tenant_id AND u.id = sp.user_id WHERE ${where}`, values),
    ]);
    return { data: rows.rows, meta: paginationMeta(page, pageSize, Number(total.rows[0]?.count ?? 0)) };
  }

  async lookup(collegeUserId: string, user: AuthenticatedUser) {
    this.assertCitisAdmin(user);
    const result = await this.db.query(
      `SELECT sp.id, sp.user_id, sp.college_user_id, sp.status, sp.institution_id,
              i.name AS institution_name, u.first_name, u.last_name, u.email, u.mobile, u.created_at
       FROM lms_student_profiles sp
       JOIN users u ON u.tenant_id = sp.tenant_id AND u.id = sp.user_id
       JOIN institutions i ON i.tenant_id = sp.tenant_id AND i.id = sp.institution_id
       WHERE sp.tenant_id = $1 AND sp.student_type = 'COLLEGE_STUDENT'
         AND lower(sp.college_user_id) = lower($2)
       LIMIT 2`,
      [user.tenantId, collegeUserId.trim()],
    );
    if (!result.rows[0] || result.rows.length > 1) throw new NotFoundException("College student not found.");
    return result.rows[0];
  }

  async updateStatus(id: string, status: "ACTIVE" | "INACTIVE", request: ContextRequest) {
    const user = request.context.user!;
    this.assertCitisAdmin(user);
    const result = await this.db.query(
      `UPDATE lms_student_profiles sp
       SET status = $1, updated_at = now()
       WHERE sp.tenant_id = $2 AND sp.id = $3 AND sp.student_type = 'COLLEGE_STUDENT'
       RETURNING sp.user_id, sp.institution_id, sp.college_user_id`,
      [status, user.tenantId, id],
    );
    if (!result.rows[0]) throw new NotFoundException("College student not found.");
    await this.db.query(
      "UPDATE users SET status = $1, updated_at = now() WHERE tenant_id = $2 AND id = $3",
      [status === "ACTIVE" ? "ACTIVE" : "DISABLED", user.tenantId, result.rows[0].user_id],
    );
    await this.audit.record({
      tenantId: user.tenantId,
      institutionId: result.rows[0].institution_id,
      actorUserId: user.id,
      requestId: request.context.requestId,
      module: "lms",
      resource: "college_student",
      resourceId: id,
      action: "UPDATE",
      newValue: { status, collegeUserId: result.rows[0].college_user_id },
      ipAddress: request.context.ipAddress,
      deviceContext: { userAgent: request.context.userAgent },
    });
    return this.lookup(result.rows[0].college_user_id, user);
  }

  async listActivity(studentId: string, user: AuthenticatedUser) {
    const profile = await this.db.query<{ user_id: string }>(
      "SELECT user_id FROM lms_student_profiles WHERE tenant_id = $1 AND id = $2 AND student_type = 'COLLEGE_STUDENT'",
      [user.tenantId, studentId],
    );
    if (!profile.rows[0]) throw new NotFoundException("College student not found.");
    const isSelf = profile.rows[0].user_id === user.id;
    if (!isSelf && !isLmsAdministrator(user)) throw new NotFoundException("College student not found.");
    const result = await this.db.query(
      `SELECT id, event_type, resource_type, resource_id, metadata, created_at
       FROM lms_activity_events
       WHERE tenant_id = $1 AND subject_user_id = $2
       ORDER BY created_at DESC, id DESC
       LIMIT 200`,
      [user.tenantId, profile.rows[0].user_id],
    );
    return result.rows;
  }
}