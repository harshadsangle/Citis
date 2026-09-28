import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { AuditService } from "../../common/audit.service";
import { assertScope, assertScopeForRead, canAccessScope, filterScopedRows } from "../../common/access-scope";
import { paginationMeta } from "../../common/pagination";
import type { ContextRequest, AuthenticatedUser } from "../../common/request-context";
import { DatabaseService } from "../../database/database.service";
import type {
  CreateDepartmentDto,
  CreateFacultyDto,
  CreateOfferingDto,
  CreateSemesterDto,
  UpdateAcademicDto,
} from "./academic-structure.dto";

const tables: Record<string, string> = {
  faculties: "academic_faculties",
  departments: "academic_departments",
  semesters: "academic_semesters",
  "course-offerings": "academic_course_offerings",
};

@Injectable()
export class AcademicStructureService {
  constructor(private readonly db: DatabaseService, private readonly audit: AuditService) {}

  private table(kind: string) {
    const table = tables[kind];
    if (!table) throw new BadRequestException("Unknown academic resource.");
    return table;
  }

  async list(kind: string, user: AuthenticatedUser, page: number, size: number, offset: number, query: Record<string, string>) {
    const table = this.table(kind);
    const values: unknown[] = [user.tenantId];
    const filters = ["a.tenant_id = $1"];
    const addFilter = (column: string, value: string) => {
      values.push(value);
      filters.push(`a.${column} = $${values.length}`);
    };

    if (query.institutionId) {
      assertScopeForRead(user, query.institutionId);
      addFilter("institution_id", query.institutionId);
    }
    if (query.facultyId && kind === "departments") addFilter("faculty_id", query.facultyId);
    if (query.semesterId && kind === "course-offerings") addFilter("semester_id", query.semesterId);

    const result = await this.db.query(
      `SELECT a.* FROM ${table} a WHERE ${filters.join(" AND ")}
       ORDER BY a.created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
      [...values, size, offset],
    );
    const rows = filterScopedRows(user, result.rows as Array<Record<string, unknown>>, "institution_id", "campus_id");
    return { data: rows, meta: paginationMeta(page, size, rows.length) };
  }

  async courseOptions(user: AuthenticatedUser, institutionId: string) {
    assertScopeForRead(user, institutionId);
    const result = await this.db.query(
      `SELECT c.id, c.institution_id, c.campus_id, c.title, c.code
       FROM courses c
       JOIN programmes p ON p.id = c.programme_id AND p.tenant_id = c.tenant_id
       JOIN institutions owner ON owner.id = c.institution_id AND owner.tenant_id = c.tenant_id
       JOIN institutions target ON target.id = $2 AND target.tenant_id = c.tenant_id
       WHERE c.tenant_id = $1 AND c.status = 'PUBLISHED' AND p.status = 'PUBLISHED'
         AND owner.status = 'ACTIVE' AND target.status = 'ACTIVE'
         AND (
           c.institution_id = $2
           OR EXISTS (
             SELECT 1 FROM lms_course_institution_allocations allocation
             WHERE allocation.tenant_id = c.tenant_id AND allocation.course_id = c.id
               AND allocation.institution_id = $2 AND allocation.status = 'ACTIVE'
           )
         )
       ORDER BY c.title, c.code
       LIMIT 500`,
      [user.tenantId, institutionId],
    );
    const eligible = (result.rows as Array<Record<string, unknown>>).filter((course) => (
      course.institution_id !== institutionId
      || canAccessScope(user, institutionId, course.campus_id as string | null | undefined)
    ));
    return eligible.map(({ id, title, code }) => ({ id, title, code }));
  }

  async create(
    kind: string,
    input: CreateFacultyDto | CreateDepartmentDto | CreateSemesterDto | CreateOfferingDto,
    request: ContextRequest,
  ) {
    const user = request.context.user!;
    const table = this.table(kind);
    assertScope(user, input.institutionId);
    let fields: string[];
    let values: unknown[];

    if (kind === "faculties" || kind === "departments") {
      const data = input as CreateFacultyDto | CreateDepartmentDto;
      if (kind === "departments") {
        const department = input as CreateDepartmentDto;
        const faculty = await this.db.query<{ campus_id: string | null }>(
          `SELECT campus_id FROM academic_faculties
           WHERE id = $1 AND tenant_id = $2 AND institution_id = $3 AND status = 'ACTIVE'`,
          [department.facultyId, user.tenantId, department.institutionId],
        );
        if (!faculty.rows[0]) throw new NotFoundException("Active faculty not found in the selected institution.");
        if (faculty.rows[0].campus_id && faculty.rows[0].campus_id !== (department.campusId ?? null)) {
          throw new BadRequestException("Department campus must match its faculty campus.");
        }
      }
      fields = ["tenant_id", "institution_id", "campus_id", "name", "code", "description", "created_by", "updated_by"];
      values = [
        user.tenantId,
        data.institutionId,
        data.campusId ?? null,
        data.name.trim(),
        data.code.trim().toUpperCase(),
        data.description?.trim() || null,
        user.id,
        user.id,
      ];
      if (kind === "departments") {
        fields.splice(5, 0, "faculty_id");
        values.splice(5, 0, (input as CreateDepartmentDto).facultyId);
      }
    } else if (kind === "semesters") {
      const semester = input as CreateSemesterDto;
      if (semester.endDate <= semester.startDate) {
        throw new BadRequestException("Semester end date must be after its start date.");
      }
      fields = ["tenant_id", "institution_id", "campus_id", "code", "name", "start_date", "end_date", "created_by", "updated_by"];
      values = [
        user.tenantId,
        semester.institutionId,
        semester.campusId ?? null,
        semester.code.trim().toUpperCase(),
        semester.name.trim(),
        semester.startDate,
        semester.endDate,
        user.id,
        user.id,
      ];
    } else {
      const offering = input as CreateOfferingDto;
      const [semester, course] = await Promise.all([
        this.db.query<{ campus_id: string | null }>(
          `SELECT campus_id FROM academic_semesters
           WHERE id = $1 AND tenant_id = $2 AND institution_id = $3 AND status <> 'ARCHIVED'`,
          [offering.semesterId, user.tenantId, offering.institutionId],
        ),
        this.db.query<{ campus_id: string | null; institution_id: string }>(
          `SELECT c.campus_id FROM courses c
           JOIN programmes p ON p.id = c.programme_id AND p.tenant_id = c.tenant_id
           WHERE c.id = $1 AND c.tenant_id = $2 AND c.status <> 'ARCHIVED' AND p.status <> 'ARCHIVED'
             AND (
               c.institution_id = $3
               OR EXISTS (
                 SELECT 1 FROM lms_course_institution_allocations allocation
                 WHERE allocation.tenant_id = c.tenant_id AND allocation.course_id = c.id
                   AND allocation.institution_id = $3 AND allocation.status = 'ACTIVE'
               )
             )`,
          [offering.courseId, user.tenantId, offering.institutionId],
        ),
      ]);
      if (!semester.rows[0]) throw new NotFoundException("Semester not found in the selected institution.");
      if (!course.rows[0]) throw new NotFoundException("Course not found in the selected institution.");
      const campusId = offering.campusId ?? null;
      if ((semester.rows[0].campus_id && semester.rows[0].campus_id !== campusId)
        || (course.rows[0].institution_id === offering.institutionId
          && course.rows[0].campus_id && course.rows[0].campus_id !== campusId)) {
        throw new BadRequestException("Offering campus must match the selected course and semester campuses.");
      }
      fields = ["tenant_id", "institution_id", "course_id", "semester_id", "campus_id", "section", "created_by", "updated_by"];
      values = [
        user.tenantId,
        offering.institutionId,
        offering.courseId,
        offering.semesterId,
        campusId,
        offering.section?.trim() ?? "",
        user.id,
        user.id,
      ];
    }

    const result = await this.db.query(
      `INSERT INTO ${table} (${fields.join(", ")})
       VALUES (${fields.map((_, index) => `$${index + 1}`).join(", ")}) RETURNING *`,
      values,
    );
    const row = result.rows[0];
    await this.audit.record({
      tenantId: user.tenantId,
      institutionId: input.institutionId,
      actorUserId: user.id,
      requestId: request.context.requestId,
      module: "lms",
      resource: kind,
      resourceId: row.id,
      action: "CREATE",
      newValue: row,
    });
    return row;
  }

  async update(kind: string, id: string, input: UpdateAcademicDto, request: ContextRequest) {
    const user = request.context.user!;
    const table = this.table(kind);
    const before = await this.db.query(
      `SELECT * FROM ${table} WHERE id = $1 AND tenant_id = $2`,
      [id, user.tenantId],
    );
    if (!before.rows[0]) throw new NotFoundException("Academic record not found.");
    assertScope(user, before.rows[0].institution_id, before.rows[0].campus_id);

    const statuses = kind === "semesters"
      ? ["DRAFT", "ACTIVE", "CLOSED", "ARCHIVED"]
      : kind === "course-offerings"
        ? ["ACTIVE", "CLOSED", "ARCHIVED"]
        : ["ACTIVE", "ARCHIVED"];
    if (input.status && !statuses.includes(input.status)) {
      throw new BadRequestException("Invalid status for this academic resource.");
    }

    if (kind === "departments" && input.facultyId) {
      const faculty = await this.db.query<{ campus_id: string | null }>(
        `SELECT campus_id FROM academic_faculties
         WHERE id = $1 AND tenant_id = $2 AND institution_id = $3 AND status = 'ACTIVE'`,
        [input.facultyId, user.tenantId, before.rows[0].institution_id],
      );
      if (!faculty.rows[0]) throw new NotFoundException("Active faculty not found in the current institution.");
      if (faculty.rows[0].campus_id && faculty.rows[0].campus_id !== (before.rows[0].campus_id ?? null)) {
        throw new BadRequestException("Department campus must match its faculty campus.");
      }
    }
    if (kind === "semesters") {
      const start = input.startDate ?? String(before.rows[0].start_date).slice(0, 10);
      const end = input.endDate ?? String(before.rows[0].end_date).slice(0, 10);
      if (end <= start) throw new BadRequestException("Semester end date must be after its start date.");
    }

    const assignments: string[] = [];
    const values: unknown[] = [id, user.id];
    const add = (column: string, value: unknown) => {
      values.push(value);
      assignments.push(`${column} = $${values.length}`);
    };
    if ((kind === "faculties" || kind === "departments") && input.name !== undefined) add("name", input.name.trim());
    if ((kind === "faculties" || kind === "departments" || kind === "semesters") && input.code !== undefined) {
      add("code", input.code.trim().toUpperCase());
    }
    if ((kind === "faculties" || kind === "departments") && input.description !== undefined) {
      add("description", input.description.trim());
    }
    if (input.status !== undefined) add("status", input.status);
    if (kind === "departments" && input.facultyId !== undefined) add("faculty_id", input.facultyId);
    if (kind === "semesters" && input.startDate !== undefined) add("start_date", input.startDate);
    if (kind === "semesters" && input.endDate !== undefined) add("end_date", input.endDate);
    if (kind === "course-offerings" && input.section !== undefined) add("section", input.section.trim());
    if (!assignments.length) throw new BadRequestException("Provide at least one field to update.");

    assignments.push("updated_by = $2", "updated_at = now()");
    values.push(user.tenantId);
    const result = await this.db.query(
      `UPDATE ${table} SET ${assignments.join(", ")}
       WHERE id = $1 AND tenant_id = $${values.length} RETURNING *`,
      values,
    );
    const row = result.rows[0];
    await this.audit.record({
      tenantId: user.tenantId,
      institutionId: row.institution_id,
      actorUserId: user.id,
      requestId: request.context.requestId,
      module: "lms",
      resource: kind,
      resourceId: id,
      action: "UPDATE",
      previousValue: before.rows[0],
      newValue: row,
    });
    return row;
  }
}