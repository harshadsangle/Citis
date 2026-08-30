import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { AuditService } from "../../common/audit.service";
import { paginationMeta } from "../../common/pagination";
import type { AuthenticatedUser, ContextRequest } from "../../common/request-context";
import { DatabaseService } from "../../database/database.service";
import type {
  ContentListQueryDto,
  CreateCourseDto,
  CreateCourseModuleDto,
  CreateLearningResourceDto,
  CreateLessonDto,
  CreateProgrammeDto,
  UpdateCourseDto,
  UpdateCourseModuleDto,
  UpdateLearningResourceDto,
  UpdateLessonDto,
  UpdateProgrammeDto,
} from "./lms.dto";

type LmsStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
type LmsResourceType = "VIDEO" | "PDF" | "DOCUMENT" | "PRESENTATION" | "LINK" | "SCORM" | "INTERACTIVE";
type LmsTable = "programmes" | "courses" | "course_modules" | "lessons" | "learning_resources";

const RESOURCE_TYPES_WITH_URL: LmsResourceType[] = ["VIDEO", "LINK", "SCORM", "INTERACTIVE"];
const RESOURCE_TYPES_WITH_FILE_OR_URL: LmsResourceType[] = ["PDF", "DOCUMENT", "PRESENTATION"];

@Injectable()
export class LmsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  private statusFilter(status?: string) {
    if (!status) return { clause: "", values: [] as unknown[] };
    if (!["DRAFT", "PUBLISHED", "ARCHIVED"].includes(status)) throw new BadRequestException("Invalid LMS status.");
    return { clause: " AND status = $1", values: [status] };
  }

  private async run<T>(work: () => Promise<T>) {
    try {
      return await work();
    } catch (error) {
      if ((error as { code?: string }).code === "23505") throw new ConflictException("The LMS content code, sequence, or position is already in use.");
      if ((error as { code?: string }).code === "23514") throw new BadRequestException("The LMS content does not satisfy its resource or status rules.");
      throw error;
    }
  }

  private async institutionFor(user: AuthenticatedUser, institutionId: string) {
    const result = await this.db.query<{ id: string; tenant_id: string }>(
      "SELECT id, tenant_id FROM institutions WHERE id = $1 AND tenant_id = $2 AND status <> 'ARCHIVED'",
      [institutionId, user.tenantId],
    );
    if (!result.rows[0]) throw new NotFoundException("Institution not found in the current tenant.");
    return result.rows[0];
  }

  private async auditMutation(request: ContextRequest, resource: string, action: string, row: Record<string, unknown>, before?: unknown) {
    await this.audit.record({
      tenantId: request.context.user!.tenantId,
      institutionId: (row.institution_id as string | null) ?? null,
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

  async listProgrammes(user: AuthenticatedUser, page: number, pageSize: number, offset: number, query: ContentListQueryDto) {
    const filter = this.statusFilter(query.status);
    const values = [user.tenantId, ...filter.values, pageSize, offset];
    const statusParam = filter.values.length ? " AND p.status = $2" : "";
    const limitParam = filter.values.length ? "$3" : "$2";
    const offsetParam = filter.values.length ? "$4" : "$3";
    const [rows, total] = await Promise.all([
      this.db.query(
        `SELECT p.id, p.tenant_id, p.institution_id, i.name AS institution_name, p.name, p.code, p.description, p.status,
                p.created_at, p.updated_at
         FROM programmes p JOIN institutions i ON i.id = p.institution_id
         WHERE p.tenant_id = $1${statusParam}
         ORDER BY p.created_at DESC LIMIT ${limitParam} OFFSET ${offsetParam}`,
        values,
      ),
      this.db.query<{ count: string }>(`SELECT count(*)::text AS count FROM programmes p WHERE p.tenant_id = $1${statusParam}`, values.slice(0, filter.values.length ? 2 : 1)),
    ]);
    return { data: rows.rows, meta: paginationMeta(page, pageSize, Number(total.rows[0]?.count ?? 0)) };
  }

  async getProgramme(id: string, user: AuthenticatedUser) {
    const result = await this.db.query(
      `SELECT p.id, p.tenant_id, p.institution_id, i.name AS institution_name, p.name, p.code, p.description, p.status,
              p.created_at, p.updated_at
       FROM programmes p JOIN institutions i ON i.id = p.institution_id
       WHERE p.id = $1 AND p.tenant_id = $2`,
      [id, user.tenantId],
    );
    if (!result.rows[0]) throw new NotFoundException("Programme not found.");
    return result.rows[0];
  }

  async createProgramme(input: CreateProgrammeDto, request: ContextRequest) {
    const user = request.context.user!;
    await this.institutionFor(user, input.institutionId);
    return this.run(async () => {
      const result = await this.db.query(
        `INSERT INTO programmes (tenant_id, institution_id, name, code, description, created_by, updated_by)
         VALUES ($1, $2, $3, $4, $5, $6, $6)
         RETURNING id, tenant_id, institution_id, name, code, description, status, created_at, updated_at`,
        [user.tenantId, input.institutionId, input.name.trim(), input.code.trim().toUpperCase(), input.description?.trim() || null, user.id],
      );
      const row = result.rows[0];
      await this.auditMutation(request, "programme", "CREATE", row);
      return row;
    });
  }

  async updateProgramme(id: string, input: UpdateProgrammeDto, request: ContextRequest) {
    const before = await this.getProgramme(id, request.context.user!);
    return this.run(async () => {
      const result = await this.db.query(
        `UPDATE programmes
         SET name = COALESCE($3, name), description = COALESCE($4, description), updated_by = $2, updated_at = now()
         WHERE id = $1 AND tenant_id = $5
         RETURNING id, tenant_id, institution_id, name, code, description, status, created_at, updated_at`,
        [id, request.context.user!.id, input.name?.trim() || null, input.description?.trim() || null, request.context.user!.tenantId],
      );
      if (!result.rows[0]) throw new NotFoundException("Programme not found.");
      await this.auditMutation(request, "programme", "UPDATE", result.rows[0], before);
      return result.rows[0];
    });
  }

  async listCourses(user: AuthenticatedUser, page: number, pageSize: number, offset: number, query: ContentListQueryDto, programmeId?: string) {
    const filter = this.statusFilter(query.status);
    const values: unknown[] = [user.tenantId];
    const clauses = ["c.tenant_id = $1"];
    if (programmeId) {
      values.push(programmeId);
      clauses.push(`c.programme_id = $${values.length}`);
    }
    if (filter.values.length) {
      values.push(filter.values[0]);
      clauses.push(`c.status = $${values.length}`);
    }
    const pageParam = values.length + 1;
    values.push(pageSize, offset);
    const [rows, total] = await Promise.all([
      this.db.query(
        `SELECT c.id, c.tenant_id, c.programme_id, p.name AS programme_name, c.title, c.code, c.description, c.thumbnail, c.status,
                c.created_at, c.updated_at
         FROM courses c JOIN programmes p ON p.id = c.programme_id
         WHERE ${clauses.join(" AND ")}
         ORDER BY c.created_at DESC LIMIT $${pageParam} OFFSET $${pageParam + 1}`,
        values,
      ),
      this.db.query<{ count: string }>(`SELECT count(*)::text AS count FROM courses c WHERE ${clauses.join(" AND ")}`, values.slice(0, -2)),
    ]);
    return { data: rows.rows, meta: paginationMeta(page, pageSize, Number(total.rows[0]?.count ?? 0)) };
  }

  async getCourse(id: string, user: AuthenticatedUser) {
    const result = await this.db.query(
      `SELECT c.id, c.tenant_id, c.programme_id, p.name AS programme_name, c.title, c.code, c.description, c.thumbnail, c.status,
              c.created_at, c.updated_at
       FROM courses c JOIN programmes p ON p.id = c.programme_id
       WHERE c.id = $1 AND c.tenant_id = $2`,
      [id, user.tenantId],
    );
    if (!result.rows[0]) throw new NotFoundException("Course not found.");
    return result.rows[0];
  }

  async createCourse(input: CreateCourseDto, request: ContextRequest) {
    const user = request.context.user!;
    const parent = await this.db.query("SELECT id FROM programmes WHERE id = $1 AND tenant_id = $2 AND status <> 'ARCHIVED'", [input.programmeId, user.tenantId]);
    if (!parent.rows[0]) throw new NotFoundException("Programme not found in the current tenant.");
    return this.run(async () => {
      const result = await this.db.query(
        `INSERT INTO courses (tenant_id, programme_id, title, code, description, thumbnail, created_by, updated_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
         RETURNING id, tenant_id, programme_id, title, code, description, thumbnail, status, created_at, updated_at`,
        [user.tenantId, input.programmeId, input.title.trim(), input.code.trim().toUpperCase(), input.description?.trim() || null, input.thumbnail?.trim() || null, user.id],
      );
      const row = result.rows[0];
      await this.auditMutation(request, "course", "CREATE", row);
      return row;
    });
  }

  async updateCourse(id: string, input: UpdateCourseDto, request: ContextRequest) {
    const before = await this.getCourse(id, request.context.user!);
    return this.run(async () => {
      const result = await this.db.query(
        `UPDATE courses
         SET title = COALESCE($3, title), description = COALESCE($4, description), thumbnail = COALESCE($5, thumbnail),
             updated_by = $2, updated_at = now()
         WHERE id = $1 AND tenant_id = $6
         RETURNING id, tenant_id, programme_id, title, code, description, thumbnail, status, created_at, updated_at`,
        [id, request.context.user!.id, input.title?.trim() || null, input.description?.trim() || null, input.thumbnail?.trim() || null, request.context.user!.tenantId],
      );
      if (!result.rows[0]) throw new NotFoundException("Course not found.");
      await this.auditMutation(request, "course", "UPDATE", result.rows[0], before);
      return result.rows[0];
    });
  }

  async listCourseModules(user: AuthenticatedUser, page: number, pageSize: number, offset: number, query: ContentListQueryDto, courseId?: string) {
    return this.listChild("course_modules", "course_id", "course", user, page, pageSize, offset, query, courseId, "course_module");
  }

  async listLessons(user: AuthenticatedUser, page: number, pageSize: number, offset: number, query: ContentListQueryDto, moduleId?: string) {
    return this.listChild("lessons", "module_id", "course_modules", user, page, pageSize, offset, query, moduleId, "lesson");
  }

  async listResources(user: AuthenticatedUser, page: number, pageSize: number, offset: number, query: ContentListQueryDto, lessonId?: string) {
    return this.listChild("learning_resources", "lesson_id", "lessons", user, page, pageSize, offset, query, lessonId, "learning_resource");
  }

  private async listChild(
    table: "course_modules" | "lessons" | "learning_resources",
    parentColumn: "course_id" | "module_id" | "lesson_id",
    parentTable: "course" | "course_modules" | "lessons",
    user: AuthenticatedUser,
    page: number,
    pageSize: number,
    offset: number,
    query: ContentListQueryDto,
    parentId?: string,
    resource?: string,
  ) {
    const filter = this.statusFilter(query.status);
    const values: unknown[] = [user.tenantId];
    const clauses = [`x.tenant_id = $1`];
    if (parentId) {
      values.push(parentId);
      clauses.push(`x.${parentColumn} = $${values.length}`);
    }
    if (filter.values.length) {
      values.push(filter.values[0]);
      clauses.push(`x.status = $${values.length}`);
    }
    const pageParam = values.length + 1;
    values.push(pageSize, offset);
    const selection = table === "course_modules"
      ? "x.id, x.tenant_id, x.course_id, x.title, x.description, x.sequence, x.status, x.created_at, x.updated_at"
      : table === "lessons"
        ? "x.id, x.tenant_id, x.module_id, x.title, x.description, x.sequence, x.estimated_duration, x.status, x.created_at, x.updated_at"
        : "x.id, x.tenant_id, x.lesson_id, x.resource_type, x.title, x.url, x.file_path, x.duration, x.sequence, x.status, x.created_at, x.updated_at";
    const [rows, total] = await Promise.all([
      this.db.query(
        `SELECT ${selection} FROM ${table} x
         WHERE ${clauses.join(" AND ")}
         ORDER BY x.sequence ASC LIMIT $${pageParam} OFFSET $${pageParam + 1}`,
        values,
      ),
      this.db.query<{ count: string }>(`SELECT count(*)::text AS count FROM ${table} x WHERE ${clauses.join(" AND ")}`, values.slice(0, -2)),
    ]);
    void parentTable;
    void resource;
    return { data: rows.rows, meta: paginationMeta(page, pageSize, Number(total.rows[0]?.count ?? 0)) };
  }

  async getChild(id: string, table: LmsTable, user: AuthenticatedUser) {
    const result = await this.db.query(
      `SELECT * FROM ${table} WHERE id = $1 AND tenant_id = $2`,
      [id, user.tenantId],
    );
    if (!result.rows[0]) throw new NotFoundException("LMS content not found.");
    return result.rows[0];
  }

  async createCourseModule(input: CreateCourseModuleDto, request: ContextRequest) {
    const user = request.context.user!;
    await this.assertParent("courses", input.courseId, user);
    return this.createChild("course_modules", "course_module", input.courseId, input.title, input.description, input.sequence, user, request);
  }

  async updateCourseModule(id: string, input: UpdateCourseModuleDto, request: ContextRequest) {
    const before = await this.getChild(id, "course_modules", request.context.user!);
    return this.updateChild("course_modules", "course_module", id, input, request, before, "title, description, sequence");
  }

  async createLesson(input: CreateLessonDto, request: ContextRequest) {
    const user = request.context.user!;
    await this.assertParent("course_modules", input.moduleId, user);
    return this.run(async () => {
      const result = await this.db.query(
        `INSERT INTO lessons (tenant_id, module_id, title, description, sequence, estimated_duration, created_by, updated_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
         RETURNING id, tenant_id, module_id, title, description, sequence, estimated_duration, status, created_at, updated_at`,
        [user.tenantId, input.moduleId, input.title.trim(), input.description?.trim() || null, input.sequence, input.estimatedDuration ?? null, user.id],
      );
      const row = result.rows[0];
      await this.auditMutation(request, "lesson", "CREATE", row);
      return row;
    });
  }

  async updateLesson(id: string, input: UpdateLessonDto, request: ContextRequest) {
    const before = await this.getChild(id, "lessons", request.context.user!);
    return this.run(async () => {
      const result = await this.db.query(
        `UPDATE lessons
         SET title = COALESCE($3, title), description = COALESCE($4, description), sequence = COALESCE($5, sequence),
             estimated_duration = COALESCE($6, estimated_duration), updated_by = $2, updated_at = now()
         WHERE id = $1 AND tenant_id = $7
         RETURNING id, tenant_id, module_id, title, description, sequence, estimated_duration, status, created_at, updated_at`,
        [id, request.context.user!.id, input.title?.trim() || null, input.description?.trim() || null, input.sequence ?? null, input.estimatedDuration ?? null, request.context.user!.tenantId],
      );
      if (!result.rows[0]) throw new NotFoundException("Lesson not found.");
      await this.auditMutation(request, "lesson", "UPDATE", result.rows[0], before);
      return result.rows[0];
    });
  }

  async createLearningResource(input: CreateLearningResourceDto, request: ContextRequest) {
    const user = request.context.user!;
    await this.assertParent("lessons", input.lessonId, user);
    this.validateResource(input.resourceType, input.url, input.filePath);
    return this.run(async () => {
      const result = await this.db.query(
        `INSERT INTO learning_resources (tenant_id, lesson_id, resource_type, title, url, file_path, duration, sequence, created_by, updated_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9)
         RETURNING id, tenant_id, lesson_id, resource_type, title, url, file_path, duration, sequence, status, created_at, updated_at`,
        [user.tenantId, input.lessonId, input.resourceType, input.title.trim(), input.url?.trim() || null, input.filePath?.trim() || null, input.duration ?? null, input.sequence, user.id],
      );
      const row = result.rows[0];
      await this.auditMutation(request, "learning_resource", "CREATE", row);
      return row;
    });
  }

  async updateLearningResource(id: string, input: UpdateLearningResourceDto, request: ContextRequest) {
    const user = request.context.user!;
    const before = await this.getChild(id, "learning_resources", user);
    const resourceType = (input.resourceType ?? before.resource_type) as string;
    this.validateResource(resourceType, input.url ?? before.url, input.filePath ?? before.file_path);
    return this.run(async () => {
      const result = await this.db.query(
        `UPDATE learning_resources
         SET resource_type = COALESCE($3, resource_type), title = COALESCE($4, title), url = COALESCE($5, url),
             file_path = COALESCE($6, file_path), duration = COALESCE($7, duration), sequence = COALESCE($8, sequence),
             updated_by = $2, updated_at = now()
         WHERE id = $1 AND tenant_id = $9
         RETURNING id, tenant_id, lesson_id, resource_type, title, url, file_path, duration, sequence, status, created_at, updated_at`,
        [id, user.id, input.resourceType ?? null, input.title?.trim() || null, input.url?.trim() || null, input.filePath?.trim() || null, input.duration ?? null, input.sequence ?? null, user.tenantId],
      );
      if (!result.rows[0]) throw new NotFoundException("Learning resource not found.");
      await this.auditMutation(request, "learning_resource", "UPDATE", result.rows[0], before);
      return result.rows[0];
    });
  }

  private async assertParent(table: "programmes" | "courses" | "course_modules" | "lessons", id: string, user: AuthenticatedUser) {
    const result = await this.db.query(`SELECT id FROM ${table} WHERE id = $1 AND tenant_id = $2 AND status <> 'ARCHIVED'`, [id, user.tenantId]);
    if (!result.rows[0]) throw new NotFoundException("Parent LMS content not found in the current tenant.");
  }

  private async createChild(
    table: "course_modules",
    resource: string,
    parentId: string,
    title: string,
    description: string | undefined,
    sequence: number,
    user: AuthenticatedUser,
    request: ContextRequest,
  ) {
    return this.run(async () => {
      const result = await this.db.query(
        `INSERT INTO ${table} (tenant_id, course_id, title, description, sequence, created_by, updated_by)
         VALUES ($1, $2, $3, $4, $5, $6, $6)
         RETURNING id, tenant_id, course_id, title, description, sequence, status, created_at, updated_at`,
        [user.tenantId, parentId, title.trim(), description?.trim() || null, sequence, user.id],
      );
      const row = result.rows[0];
      await this.auditMutation(request, resource, "CREATE", row);
      return row;
    });
  }

  private async updateChild(
    table: "course_modules",
    resource: string,
    id: string,
    input: UpdateCourseModuleDto,
    request: ContextRequest,
    before: Record<string, unknown>,
    _fields: string,
  ) {
    return this.run(async () => {
      const result = await this.db.query(
        `UPDATE ${table}
         SET title = COALESCE($3, title), description = COALESCE($4, description), sequence = COALESCE($5, sequence),
             updated_by = $2, updated_at = now()
         WHERE id = $1 AND tenant_id = $6
         RETURNING id, tenant_id, course_id, title, description, sequence, status, created_at, updated_at`,
        [id, request.context.user!.id, input.title?.trim() || null, input.description?.trim() || null, input.sequence ?? null, request.context.user!.tenantId],
      );
      if (!result.rows[0]) throw new NotFoundException("Course module not found.");
      await this.auditMutation(request, resource, "UPDATE", result.rows[0], before);
      return result.rows[0];
    });
  }

  private validateResource(resourceType: string, url?: string | null, filePath?: string | null) {
    if (RESOURCE_TYPES_WITH_URL.includes(resourceType as LmsResourceType) && !url) {
      throw new BadRequestException(`${resourceType} resources require a URL.`);
    }
    if (RESOURCE_TYPES_WITH_FILE_OR_URL.includes(resourceType as LmsResourceType) && !url && !filePath) {
      throw new BadRequestException(`${resourceType} resources require a URL or file path.`);
    }
  }

  async changeStatus(id: string, kind: "programme" | "course" | "course_module" | "lesson" | "learning_resource", status: LmsStatus, request: ContextRequest) {
    const table = kind === "programme" ? "programmes" : kind === "course" ? "courses" : kind === "course_module" ? "course_modules" : kind === "lesson" ? "lessons" : "learning_resources";
    const before = await this.getChild(id, table, request.context.user!);
    return this.run(async () => {
      const result = await this.db.query(
        `UPDATE ${table} SET status = $2, updated_by = $3, updated_at = now()
         WHERE id = $1 AND tenant_id = $4
         RETURNING *`,
        [id, status, request.context.user!.id, request.context.user!.tenantId],
      );
      if (!result.rows[0]) throw new NotFoundException("LMS content not found.");
      await this.auditMutation(request, kind, status === "PUBLISHED" ? "PUBLISH" : "ARCHIVE", result.rows[0], before);
      return result.rows[0];
    });
  }
}