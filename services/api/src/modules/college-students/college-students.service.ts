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
import { LmsService } from "../lms/lms.service";
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

interface ExistingCollegeStudent {
  user_id: string;
  student_type: string;
  institution_id: string;
  college_user_id: string;
  email: string | null;
  mobile: string | null;
}

type StudentColumnIndexes = {
  collegeName?: number;
  collegeUserId: number;
  studentName: number;
  password: number;
  status: number;
  email?: number;
  mobile?: number;
};

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
    private readonly lms: LmsService,
  ) {}

  private assertCitisAdmin(user: AuthenticatedUser) {
    if (!user.roles.some((role) => role.code === "CITIS_ADMIN")) {
      throw new ForbiddenException("Only CITIS Admin can manage college students.");
    }
  }

  private headerIndexes(headers: string[], institutionSelected = false): StudentColumnIndexes {
    const indexes = new Map(headers.map((header, index) => [normalizedHeader(header), index]));
    const find = (...names: string[]) => names.map(normalizedHeader).map((name) => indexes.get(name)).find((index) => index !== undefined);
    const collegeName = find("College/University", "College University", "Institution");
    const required = [
      ...(!institutionSelected ? [{ label: "College/University", index: collegeName }] : []),
      { label: "College User ID", index: find("College User ID", "College UserID", "User ID", "Student ID") },
      { label: "Student Name", index: find("Student Name", "Name") },
      { label: "Password", index: find("Password supplied by college", "Password", "Temporary Password") },
      { label: "Active/Inactive status", index: find("Active/Inactive status", "Status") },
    ];
    const missing = required.filter(({ index }) => index === undefined).map(({ label }) => label);
    if (missing.length) throw new BadRequestException(`CSV is missing required columns: ${missing.join(", ")}.`);
    return {
      collegeName,
      collegeUserId: find("College User ID", "College UserID", "User ID", "Student ID")!,
      studentName: find("Student Name", "Name")!,
      password: find("Password supplied by college", "Password", "Temporary Password")!,
      status: find("Active/Inactive status", "Status")!,
      email: find("Email", "Email optional"),
      mobile: find("Phone", "Mobile", "Phone optional"),
    };
  }

  private parseStudent(
    record: CsvRecord,
    indexes: StudentColumnIndexes,
    selectedInstitutionName?: string,
  ) {
    const cell = (index: number | undefined) => (index === undefined ? "" : (record.row[index] ?? "").trim());
    const csvCollegeName = cell(indexes.collegeName);
    const collegeName = selectedInstitutionName || csvCollegeName;
    const collegeUserId = cell(indexes.collegeUserId);
    const studentName = cell(indexes.studentName);
    const emailValue = cell(indexes.email);
    const mobileValue = cell(indexes.mobile);
    const password = cell(indexes.password);
    const statusValue = cell(indexes.status).toUpperCase();
    const errors: string[] = [];

    if (!collegeName) errors.push("College/University is required.");
    if (selectedInstitutionName && csvCollegeName && csvCollegeName.toLowerCase() !== selectedInstitutionName.toLowerCase()) {
      errors.push("College/University must match the selected institution.");
    }
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
    institutionId: string,
  ): Promise<{ status: "IMPORTED" | "UPDATED"; userId: string; institutionId: string }> {
    const existingProfile = await client.query<ExistingCollegeStudent>(
      `SELECT sp.user_id, sp.student_type, sp.institution_id, sp.college_user_id,
              u.email, u.mobile
       FROM lms_student_profiles sp
       JOIN users u ON u.tenant_id = sp.tenant_id AND u.id = sp.user_id
       WHERE sp.tenant_id = $1 AND sp.institution_id = $2
         AND sp.student_type = 'COLLEGE_STUDENT'
         AND lower(sp.college_user_id) = lower($3)
       FOR UPDATE OF sp, u`,
      [tenantId, institutionId, data.collegeUserId],
    );
    let existing = existingProfile.rows[0];
    if (!existing) {
      const [sameIdCandidates, contactCandidates] = await Promise.all([
        client.query<ExistingCollegeStudent>(
          `SELECT sp.user_id, sp.student_type, sp.institution_id, sp.college_user_id,
                  u.email, u.mobile
           FROM lms_student_profiles sp
           JOIN users u ON u.tenant_id = sp.tenant_id AND u.id = sp.user_id
           WHERE sp.tenant_id = $1 AND sp.institution_id <> $2
             AND sp.student_type = 'COLLEGE_STUDENT'
             AND lower(sp.college_user_id) = lower($3)
           FOR UPDATE OF sp, u`,
          [tenantId, institutionId, data.collegeUserId],
        ),
        data.email || data.mobile
          ? client.query<ExistingCollegeStudent>(
            `SELECT sp.user_id, sp.student_type, sp.institution_id, sp.college_user_id,
                    u.email, u.mobile
             FROM lms_student_profiles sp
             JOIN users u ON u.tenant_id = sp.tenant_id AND u.id = sp.user_id
             WHERE sp.tenant_id = $1 AND sp.student_type = 'COLLEGE_STUDENT'
               AND (($2::text IS NOT NULL AND lower(u.email) = lower($2))
                 OR ($3::text IS NOT NULL AND u.mobile = $3))
             ORDER BY sp.institution_id, sp.user_id
             FOR UPDATE OF sp, u`,
            [tenantId, data.email, data.mobile],
          )
          : Promise.resolve({ rows: [] as ExistingCollegeStudent[] }),
      ]);

      if (sameIdCandidates.rows.length > 1) {
        throw new ConflictException("This College User ID is linked to multiple institutions; resolve the duplicate before importing it.");
      }
      if (contactCandidates.rows.length > 1) {
        throw new ConflictException("The email or phone matches multiple college student accounts; the institution transfer is ambiguous.");
      }
      const sameIdCandidate = sameIdCandidates.rows[0];
      const contactCandidate = contactCandidates.rows[0];
      if (sameIdCandidate && !contactCandidate) {
        throw new ConflictException("This College User ID belongs to another institution. Include the student's current email or phone to confirm a safe transfer.");
      }
      if (sameIdCandidate && contactCandidate && sameIdCandidate.user_id !== contactCandidate.user_id) {
        throw new ConflictException("The College User ID and contact details identify different student accounts.");
      }
      existing = sameIdCandidate ?? contactCandidate;
    }

    let userId: string;
    let status: "IMPORTED" | "UPDATED" = "IMPORTED";

    if (existing) {
      if (existing.student_type !== "COLLEGE_STUDENT") {
        throw new Error("The existing account is not a college student.");
      }
      userId = existing.user_id;
      status = "UPDATED";
      await this.assertContactAvailable(client, tenantId, data, userId);
      const passwordHash = await hashPassword(data.password);
      const { firstName, lastName } = splitName(data.studentName);
      await client.query(
        `UPDATE users
         SET first_name = $1, last_name = $2, email = COALESCE($3, email),
             mobile = COALESCE($4, mobile), password_hash = $5, status = $6, updated_at = now()
         WHERE tenant_id = $7 AND id = $8`,
        [firstName, lastName, data.email, data.mobile, passwordHash, data.status === "ACTIVE" ? "ACTIVE" : "DISABLED", tenantId, userId],
      );
      await client.query(
        `UPDATE lms_student_profiles
         SET institution_id = $1, status = $2, college_user_id = $3, updated_at = now()
         WHERE tenant_id = $4 AND user_id = $5 AND student_type = 'COLLEGE_STUDENT'`,
        [institutionId, data.status, data.collegeUserId, tenantId, userId],
      );
      if (existing.institution_id !== institutionId) {
        await this.moveCollegeStudentRoleScope(client, tenantId, userId, institutionId);
      }
    } else {
      await this.assertContactAvailable(client, tenantId, data, null);
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

  private async assertContactAvailable(
    client: PoolClient,
    tenantId: string,
    data: ParsedStudent,
    userId: string | null,
  ) {
    if (!data.email && !data.mobile) return;
    const contact = await client.query<{ id: string }>(
      `SELECT id FROM users
       WHERE tenant_id = $1 AND ($4::uuid IS NULL OR id <> $4)
         AND (($2::text IS NOT NULL AND lower(email) = lower($2))
           OR ($3::text IS NOT NULL AND mobile = $3))
       LIMIT 1`,
      [tenantId, data.email, data.mobile, userId],
    );
    if (contact.rows[0]) throw new ConflictException("Email or phone already belongs to another account.");
  }

  private async moveCollegeStudentRoleScope(
    client: PoolClient,
    tenantId: string,
    userId: string,
    institutionId: string,
  ) {
    const role = await client.query<{ id: string }>(
      "SELECT id FROM roles WHERE tenant_id = $1 AND code = $2 AND status = 'ACTIVE' LIMIT 1",
      [tenantId, COLLEGE_STUDENT_ROLE],
    );
    if (!role.rows[0]) throw new Error("The student role is not configured for this tenant.");

    // Keep only this student's selected-institution STUDENT scope; leave every other role untouched.
    await client.query(
      `DELETE FROM user_roles ur
       USING roles r
       WHERE ur.tenant_id = $1 AND ur.user_id = $2
         AND r.tenant_id = ur.tenant_id AND r.id = ur.role_id AND r.code = $3
         AND (ur.institution_id IS DISTINCT FROM $4 OR ur.campus_id IS NOT NULL)`,
      [tenantId, userId, COLLEGE_STUDENT_ROLE, institutionId],
    );
    await client.query(
      `INSERT INTO user_roles (tenant_id, user_id, role_id, institution_id, campus_id)
       SELECT $1, $2, $3, $4, NULL
       WHERE NOT EXISTS (
         SELECT 1 FROM user_roles existing
         WHERE existing.tenant_id = $1 AND existing.user_id = $2
           AND existing.role_id = $3 AND existing.institution_id = $4
           AND existing.campus_id IS NULL
       )
       ON CONFLICT DO NOTHING`,
      [tenantId, userId, role.rows[0].id, institutionId],
    );
  }

  async importCsv(file: LmsUpload | undefined, request: ContextRequest, institutionId?: string) {
    const user = request.context.user!;
    this.assertCitisAdmin(user);
    if (!institutionId) throw new BadRequestException("Select an institution before importing the CSV.");
    if (!file?.buffer?.length) throw new BadRequestException("A CSV file is required.");
    if (file.size > MAX_IMPORT_BYTES) throw new BadRequestException("CSV file exceeds the 5 MB limit.");
    if (file.originalname && !file.originalname.toLowerCase().endsWith(".csv")) {
      throw new BadRequestException("Only CSV files are supported.");
    }

    let parsed: ReturnType<typeof parseCsv>;
    try {
      parsed = parseCsv(file.buffer.toString("utf8"));
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : "CSV could not be parsed.",
      );
    }
    const indexes = this.headerIndexes(parsed.headers, true);
    if (parsed.records.length > MAX_IMPORT_ROWS) throw new BadRequestException(`CSV cannot contain more than ${MAX_IMPORT_ROWS} rows.`);
    const counts: ImportCounts = { totalRows: parsed.records.length, imported: 0, updated: 0, duplicates: 0, invalid: 0, failed: 0 };

    const createdEnrollments: Record<string, unknown>[] = [];
    const result = await this.db.transaction(async (client) => {
      const selectedInstitution = await client.query<{ id: string; name: string }>(
        `SELECT id, name FROM institutions
         WHERE tenant_id = $1 AND id = $2 AND status <> 'ARCHIVED'
         LIMIT 1`,
        [user.tenantId, institutionId],
      );
      if (!selectedInstitution.rows[0]) {
        throw new BadRequestException("The selected institution is not available in this tenant.");
      }
      const targetInstitution = selectedInstitution.rows[0];
      const run = await client.query<{ id: string }>(
        `INSERT INTO lms_student_imports (tenant_id, uploaded_by, original_filename, total_rows)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [user.tenantId, user.id, safeFilename(file.originalname), parsed.records.length],
      );
      const importId = run.rows[0].id;
      const seen = new Set<string>();
      for (const record of parsed.records) {
        const parsedRow = this.parseStudent(record, indexes, targetInstitution?.name);
        if (parsedRow.errors.length) {
          counts.invalid += 1;
          await client.query(
            `INSERT INTO lms_student_import_rows
              (tenant_id, import_id, row_number, college_name, college_user_id, status, reason)
             VALUES ($1, $2, $3, $4, $5, 'INVALID', $6)`,
            [
              user.tenantId,
              importId,
              record.rowNumber,
              targetInstitution?.name || (indexes.collegeName === undefined ? "" : record.row[indexes.collegeName]?.trim() || ""),
              record.row[indexes.collegeUserId]?.trim() || null,
              parsedRow.errors.join(" "),
            ],
          );
          continue;
        }
        const data = parsedRow.student!;
        const duplicateKey = `${targetInstitution?.id || data.collegeName.toLowerCase()}:${data.collegeUserId.toLowerCase()}`;
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
          const imported = await this.insertRow(client, user.tenantId, importId, record.rowNumber, data, targetInstitution.id);
          await client.query(
            `INSERT INTO lms_student_import_rows
              (tenant_id, import_id, row_number, college_name, college_user_id, institution_id, user_id, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [user.tenantId, importId, record.rowNumber, data.collegeName, data.collegeUserId, imported.institutionId, imported.userId, imported.status],
          );
          const rowEnrollments = data.status === "ACTIVE"
            ? await this.lms.enrollImportedCsvStudentInAllocatedCourses(
              client,
              imported.institutionId,
              imported.userId,
              request,
            )
            : [];
          createdEnrollments.push(...rowEnrollments);
          counts[imported.status === "IMPORTED" ? "imported" : "updated"] += 1;
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

    await this.lms.auditCreatedCsvEnrollments(request, createdEnrollments);
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

  async listOwnActivity(user: AuthenticatedUser) {
    const profile = await this.db.query<{ id: string }>(
      `SELECT id FROM lms_student_profiles
       WHERE tenant_id = $1 AND user_id = $2 AND student_type = 'COLLEGE_STUDENT'`,
      [user.tenantId, user.id],
    );
    if (!profile.rows[0]) throw new NotFoundException("College student profile not found.");
    return this.listActivity(profile.rows[0].id, user);
  }
}