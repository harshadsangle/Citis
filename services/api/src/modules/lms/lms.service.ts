import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { AuditService } from "../../common/audit.service";
import { paginationMeta } from "../../common/pagination";
import type { AuthenticatedUser, ContextRequest } from "../../common/request-context";
import { DatabaseService } from "../../database/database.service";
import { ResourceStorageService, mimeTypeForFilename, type LmsUpload } from "./resource-storage.service";
import type {
  ContentListQueryDto,
  CandidateListQueryDto,
  AssignInstructorDto,
  AssignmentListQueryDto,
  CreateCourseDto,
  CreateCourseModuleDto,
  CreateLearningResourceDto,
  CreateLessonDto,
  CreateProgrammeDto,
  CompleteAssessmentDto,
  CreateAssignmentDto,
  EnrollLearnerDto,
  GradeAssignmentSubmissionDto,
  ProgressViewerQueryDto,
  RelationshipListQueryDto,
  SubmitAssignmentDto,
  UpdateAssignmentDto,
  UpdateCourseDto,
  UpdateCourseModuleDto,
  UpdateLearningResourceDto,
  UpdateLessonDto,
  UpdateProgrammeDto,
} from "./lms.dto";

type LmsStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
type LmsResourceType = "VIDEO" | "PDF" | "DOCUMENT" | "PRESENTATION" | "LINK" | "SCORM" | "INTERACTIVE";
type LmsTable = "programmes" | "courses" | "course_modules" | "lessons" | "learning_resources";
type ProgressState = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

const RESOURCE_TYPES_WITH_URL: LmsResourceType[] = ["VIDEO", "LINK", "SCORM", "INTERACTIVE"];
const RESOURCE_TYPES_WITH_FILE_OR_URL: LmsResourceType[] = ["PDF", "DOCUMENT", "PRESENTATION"];

function progressState(completed: number, total: number): ProgressState {
  if (completed === 0) return "NOT_STARTED";
  if (completed >= total && total > 0) return "COMPLETED";
  return "IN_PROGRESS";
}

function progressPercentage(completed: number, total: number) {
  return total > 0 ? Math.round((completed / total) * 10000) / 100 : 0;
}

@Injectable()
export class LmsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
    private readonly storage: ResourceStorageService,
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

  private async auditAccess(request: ContextRequest, resource: string, action: string, row: Record<string, unknown>, details: Record<string, unknown>) {
    await this.audit.record({
      tenantId: request.context.user!.tenantId,
      institutionId: (row.institution_id as string | null) ?? null,
      actorUserId: request.context.user!.id,
      requestId: request.context.requestId,
      module: "lms",
      resource,
      resourceId: row.id as string,
      action,
      newValue: details,
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
        : "x.id, x.tenant_id, x.lesson_id, x.resource_type, x.title, x.url, x.file_path, x.duration, x.sequence, x.status, x.created_at, x.updated_at, m.id AS managed_file_id, m.original_filename AS managed_file_name, m.byte_size AS managed_file_size, m.mime_type AS managed_file_mime_type";
    const fromClause = table === "learning_resources"
      ? `${table} x LEFT JOIN managed_files m ON m.resource_id = x.id AND m.tenant_id = x.tenant_id`
      : `${table} x`;
    const [rows, total] = await Promise.all([
      this.db.query(
        `SELECT ${selection} FROM ${fromClause}
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

  private async resourceFor(id: string, user: AuthenticatedUser) {
    const result = await this.db.query<Record<string, unknown>>(
      `SELECT lr.*, p.institution_id
       FROM learning_resources lr
       JOIN lessons l ON l.id = lr.lesson_id AND l.tenant_id = lr.tenant_id
       JOIN course_modules cm ON cm.id = l.module_id AND cm.tenant_id = lr.tenant_id
       JOIN courses c ON c.id = cm.course_id AND c.tenant_id = lr.tenant_id
       JOIN programmes p ON p.id = c.programme_id AND p.tenant_id = lr.tenant_id
       WHERE lr.id = $1 AND lr.tenant_id = $2`,
      [id, user.tenantId],
    );
    if (!result.rows[0]) throw new NotFoundException("Learning resource not found.");
    return result.rows[0];
  }

  async uploadResourceFile(id: string, file: LmsUpload, request: ContextRequest) {
    const resource = await this.resourceFor(id, request.context.user!);
    if (!["PDF", "DOCUMENT", "PRESENTATION"].includes(String(resource.resource_type))) {
      throw new BadRequestException("Only document resources can receive managed files.");
    }
    const stored = await this.storage.storeDocument(request.context.user!.tenantId, id, file);
    return this.replaceManagedFile(resource, stored, "FILE", request);
  }

  async uploadScormPackage(id: string, file: LmsUpload, request: ContextRequest) {
    const resource = await this.resourceFor(id, request.context.user!);
    if (resource.resource_type !== "SCORM") throw new BadRequestException("The resource must be a SCORM resource.");
    const stored = await this.storage.storeScormPackage(request.context.user!.tenantId, id, file);
    return this.replaceManagedFile(resource, stored, "SCORM", request);
  }

  private async replaceManagedFile(
    resource: Record<string, unknown>,
    stored: { storageKey: string; originalFilename: string; mimeType: string; byteSize: number; sha256: string; entrypoint?: string },
    kind: "FILE" | "SCORM",
    request: ContextRequest,
  ) {
    let previousStorageKey: string | null = null;
    let committed = false;
    try {
      const managed = await this.db.transaction(async (client) => {
        const previous = await client.query<{ storage_key: string }>(
          "SELECT storage_key FROM managed_files WHERE resource_id = $1 FOR UPDATE",
          [resource.id],
        );
        previousStorageKey = previous.rows[0]?.storage_key ?? null;
        const result = await client.query(
          `INSERT INTO managed_files
            (tenant_id, institution_id, resource_id, kind, storage_key, original_filename, mime_type, byte_size, sha256, entrypoint, created_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           ON CONFLICT (resource_id) DO UPDATE SET
             tenant_id = EXCLUDED.tenant_id, institution_id = EXCLUDED.institution_id, kind = EXCLUDED.kind,
             storage_key = EXCLUDED.storage_key, original_filename = EXCLUDED.original_filename,
             mime_type = EXCLUDED.mime_type, byte_size = EXCLUDED.byte_size, sha256 = EXCLUDED.sha256,
             entrypoint = EXCLUDED.entrypoint, created_by = EXCLUDED.created_by, created_at = now()
           RETURNING id, tenant_id, institution_id, resource_id, kind, storage_key, original_filename, mime_type, byte_size, sha256, entrypoint, created_at`,
          [
            request.context.user!.tenantId,
            resource.institution_id,
            resource.id,
            kind,
            stored.storageKey,
            stored.originalFilename,
            stored.mimeType,
            stored.byteSize,
            stored.sha256,
            stored.entrypoint ?? null,
            request.context.user!.id,
          ],
        );
        return result.rows[0];
      });
      committed = true;
      if (previousStorageKey && previousStorageKey !== stored.storageKey) await this.storage.remove(previousStorageKey);
      await this.audit.record({
        tenantId: request.context.user!.tenantId,
        institutionId: resource.institution_id as string,
        actorUserId: request.context.user!.id,
        requestId: request.context.requestId,
        module: "lms",
        resource: "learning_resource_file",
        resourceId: resource.id as string,
        action: "UPLOAD",
        newValue: {
          resourceId: resource.id,
          managedFileId: managed.id,
          kind: managed.kind,
          originalFilename: managed.original_filename,
          mimeType: managed.mime_type,
          byteSize: managed.byte_size,
          sha256: managed.sha256,
          entrypoint: managed.entrypoint,
        },
        ipAddress: request.context.ipAddress,
        deviceContext: { userAgent: request.context.userAgent },
      });
      return managed;
    } catch (error) {
      if (!committed) await this.storage.remove(stored.storageKey);
      throw error;
    }
  }

  async getManagedFile(id: string, request: ContextRequest) {
    const resource = await this.resourceFor(id, request.context.user!);
    const result = await this.db.query<Record<string, unknown>>(
      "SELECT * FROM managed_files WHERE resource_id = $1 AND tenant_id = $2 AND kind = 'FILE'",
      [id, request.context.user!.tenantId],
    );
    if (!result.rows[0]) throw new NotFoundException("No managed file is attached to this resource.");
    const managed = result.rows[0];
    let content: Buffer;
    try {
      content = await this.storage.read(String(managed.storage_key));
    } catch (error) {
      if ((error as { code?: string }).code === "ENOENT") throw new NotFoundException("The managed file is unavailable.");
      throw error;
    }
    await this.auditAccess(request, "learning_resource_file", "DOWNLOAD", resource, {
      managedFileId: managed.id,
      filename: managed.original_filename,
    });
    return { content, mimeType: managed.mime_type, filename: managed.original_filename };
  }

  async getScormLaunch(id: string, request: ContextRequest) {
    const resource = await this.resourceFor(id, request.context.user!);
    const result = await this.db.query<Record<string, unknown>>(
      "SELECT * FROM managed_files WHERE resource_id = $1 AND tenant_id = $2 AND kind = 'SCORM'",
      [id, request.context.user!.tenantId],
    );
    if (!result.rows[0]) throw new NotFoundException("No SCORM package is attached to this resource.");
    await this.auditAccess(request, "learning_resource_scorm", "LAUNCH", resource, {
      managedFileId: result.rows[0].id,
      entrypoint: result.rows[0].entrypoint,
    });
    return { launchUrl: `/api/v1/learning-resources/${id}/scorm/${encodeURI(String(result.rows[0].entrypoint))}` };
  }

  async getScormAsset(id: string, assetPath: string, request: ContextRequest) {
    const resource = await this.resourceFor(id, request.context.user!);
    const result = await this.db.query<Record<string, unknown>>(
      "SELECT * FROM managed_files WHERE resource_id = $1 AND tenant_id = $2 AND kind = 'SCORM'",
      [id, request.context.user!.tenantId],
    );
    if (!result.rows[0]) throw new NotFoundException("No SCORM package is attached to this resource.");
    let content: Buffer;
    try {
      content = await this.storage.readScormAsset(String(result.rows[0].storage_key), assetPath);
    } catch (error) {
      if ((error as { code?: string }).code === "ENOENT") throw new NotFoundException("The SCORM asset is unavailable.");
      throw error;
    }
    await this.auditAccess(request, "learning_resource_scorm", "ASSET_ACCESS", resource, {
      managedFileId: result.rows[0].id,
      assetPath,
    });
    return { content, mimeType: mimeTypeForFilename(assetPath) };
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
    if (RESOURCE_TYPES_WITH_FILE_OR_URL.includes(resourceType as LmsResourceType) && !url && !filePath) return;
  }

  private async assertInstitutionAccess(user: AuthenticatedUser, institutionId: string) {
    if (user.roles.some((role) => role.code === "CITIS_SUPER_ADMIN")) return;
    const result = await this.db.query(
      `SELECT 1
       FROM user_roles ur
       JOIN roles r ON r.id = ur.role_id AND r.tenant_id = ur.tenant_id
       WHERE ur.user_id = $1 AND ur.tenant_id = $2 AND ur.institution_id = $3
         AND r.status = 'ACTIVE'
         AND r.code IN ('INSTITUTION_ADMINISTRATOR', 'PRINCIPAL_DIRECTOR', 'ACADEMIC_ADMINISTRATOR')
       LIMIT 1`,
      [user.id, user.tenantId, institutionId],
    );
    if (!result.rows[0]) throw new ForbiddenException("You are not authorized for this institution.");
  }

  private async relationshipCourse(courseId: string, user: AuthenticatedUser) {
    const result = await this.db.query<Record<string, unknown>>(
      `SELECT c.id, c.tenant_id, c.institution_id, c.title, c.code, c.status,
              p.status AS programme_status, i.status AS institution_status
       FROM courses c
       JOIN programmes p ON p.id = c.programme_id AND p.tenant_id = c.tenant_id
       JOIN institutions i ON i.id = p.institution_id AND i.tenant_id = c.tenant_id
       WHERE c.id = $1 AND c.tenant_id = $2`,
      [courseId, user.tenantId],
    );
    const course = result.rows[0];
    if (!course) throw new NotFoundException("Course not found in the current tenant.");
    await this.assertInstitutionAccess(user, String(course.institution_id));
    if (course.status !== "PUBLISHED") throw new BadRequestException("Enrollments and instructor assignments require a published course.");
    if (course.programme_status === "ARCHIVED" || course.institution_status !== "ACTIVE") {
      throw new BadRequestException("The course institution or programme is not active.");
    }
    return course;
  }

  private relationshipStatus(status?: string) {
    if (status && !["ACTIVE", "REMOVED"].includes(status)) {
      throw new BadRequestException("Invalid relationship status.");
    }
    return status || "ACTIVE";
  }

  private async eligiblePerson(user: AuthenticatedUser, institutionId: string, personId: string, roleCode: "STUDENT" | "TEACHER") {
    const result = await this.db.query<Record<string, unknown>>(
      `SELECT u.id, u.tenant_id, u.first_name, u.last_name, u.email, u.mobile
       FROM users u
       JOIN user_roles ur ON ur.user_id = u.id AND ur.tenant_id = u.tenant_id
       JOIN roles r ON r.id = ur.role_id AND r.tenant_id = ur.tenant_id
       WHERE u.id = $1 AND u.tenant_id = $2 AND u.status = 'ACTIVE'
         AND ur.institution_id = $3 AND r.code = $4 AND r.status = 'ACTIVE'
       LIMIT 1`,
      [personId, user.tenantId, institutionId, roleCode],
    );
    if (!result.rows[0]) {
      throw new NotFoundException(roleCode === "STUDENT"
        ? "The learner was not found as an active Student in this institution."
        : "The instructor was not found as an active Teacher in this institution.");
    }
    return result.rows[0];
  }

  private async listCandidates(
    courseId: string,
    user: AuthenticatedUser,
    page: number,
    pageSize: number,
    offset: number,
    query: CandidateListQueryDto,
    roleCode: "STUDENT" | "TEACHER",
  ) {
    const course = await this.relationshipCourse(courseId, user);
    const relationshipTable = roleCode === "STUDENT" ? "lms_enrollments" : "lms_instructor_assignments";
    const relationshipColumn = roleCode === "STUDENT" ? "learner_id" : "instructor_id";
    const search = query.search?.trim() || "";
    const searchClause = search
      ? " AND (u.first_name ILIKE $5 OR u.last_name ILIKE $5 OR concat_ws(' ', u.first_name, u.last_name) ILIKE $5 OR COALESCE(u.email, '') ILIKE $5)"
      : "";
    const values: unknown[] = [user.tenantId, course.institution_id, course.id, roleCode];
    if (search) values.push(`%${search}%`);
    const limitParam = values.length + 1;
    const offsetParam = values.length + 2;
    const [rows, total] = await Promise.all([
      this.db.query(
        `SELECT u.id, u.first_name, u.last_name, u.email, u.mobile
         FROM users u
         JOIN user_roles ur ON ur.user_id = u.id AND ur.tenant_id = u.tenant_id
         JOIN roles r ON r.id = ur.role_id AND r.tenant_id = ur.tenant_id
         WHERE u.tenant_id = $1 AND u.status = 'ACTIVE'
           AND ur.institution_id = $2 AND r.code = $4 AND r.status = 'ACTIVE'
           AND NOT EXISTS (
             SELECT 1 FROM ${relationshipTable} x
             WHERE x.tenant_id = $1 AND x.institution_id = $2 AND x.course_id = $3
               AND x.${relationshipColumn} = u.id AND x.status = 'ACTIVE'
           )${searchClause}
         ORDER BY u.first_name ASC, u.last_name ASC, u.id ASC
         LIMIT $${limitParam} OFFSET $${offsetParam}`,
        [...values, pageSize, offset],
      ),
      this.db.query<{ count: string }>(
        `SELECT count(DISTINCT u.id)::text AS count
         FROM users u
         JOIN user_roles ur ON ur.user_id = u.id AND ur.tenant_id = u.tenant_id
         JOIN roles r ON r.id = ur.role_id AND r.tenant_id = ur.tenant_id
         WHERE u.tenant_id = $1 AND u.status = 'ACTIVE'
           AND ur.institution_id = $2 AND r.code = $4 AND r.status = 'ACTIVE'
           AND NOT EXISTS (
             SELECT 1 FROM ${relationshipTable} x
             WHERE x.tenant_id = $1 AND x.institution_id = $2 AND x.course_id = $3
               AND x.${relationshipColumn} = u.id AND x.status = 'ACTIVE'
           )${searchClause}`,
        values,
      ),
    ]);
    return { data: rows.rows, meta: paginationMeta(page, pageSize, Number(total.rows[0]?.count ?? 0)) };
  }

  async listEnrollmentCandidates(courseId: string, user: AuthenticatedUser, page: number, pageSize: number, offset: number, query: CandidateListQueryDto) {
    return this.listCandidates(courseId, user, page, pageSize, offset, query, "STUDENT");
  }

  async listInstructorCandidates(courseId: string, user: AuthenticatedUser, page: number, pageSize: number, offset: number, query: CandidateListQueryDto) {
    return this.listCandidates(courseId, user, page, pageSize, offset, query, "TEACHER");
  }

  private async listRelationships(
    courseId: string,
    user: AuthenticatedUser,
    page: number,
    pageSize: number,
    offset: number,
    query: RelationshipListQueryDto,
    kind: "enrollment" | "instructor_assignment",
  ) {
    const course = await this.relationshipCourse(courseId, user);
    const table = kind === "enrollment" ? "lms_enrollments" : "lms_instructor_assignments";
    const personColumn = kind === "enrollment" ? "learner_id" : "instructor_id";
    const personAlias = kind === "enrollment" ? "learner" : "instructor";
    const dateColumn = kind === "enrollment" ? "enrolled_at" : "assigned_at";
    const status = this.relationshipStatus(query.status);
    const values: unknown[] = [user.tenantId, course.institution_id, course.id, status];
    const select = `x.id, x.tenant_id, x.institution_id, x.course_id, x.${personColumn}, x.status,
                    x.${dateColumn}, x.removed_at, ${personAlias}.first_name AS ${personAlias}_first_name,
                    ${personAlias}.last_name AS ${personAlias}_last_name, ${personAlias}.email AS ${personAlias}_email`;
    const [rows, total] = await Promise.all([
      this.db.query(
        `SELECT ${select}
         FROM ${table} x JOIN users ${personAlias} ON ${personAlias}.id = x.${personColumn} AND ${personAlias}.tenant_id = x.tenant_id
         WHERE x.tenant_id = $1 AND x.institution_id = $2 AND x.course_id = $3 AND x.status = $4
         ORDER BY x.${dateColumn} DESC, x.id DESC LIMIT $5 OFFSET $6`,
        [...values, pageSize, offset],
      ),
      this.db.query<{ count: string }>(
        `SELECT count(*)::text AS count FROM ${table} x
         WHERE x.tenant_id = $1 AND x.institution_id = $2 AND x.course_id = $3 AND x.status = $4`,
        values,
      ),
    ]);
    return { data: rows.rows, meta: paginationMeta(page, pageSize, Number(total.rows[0]?.count ?? 0)) };
  }

  async listEnrollments(courseId: string, user: AuthenticatedUser, page: number, pageSize: number, offset: number, query: RelationshipListQueryDto) {
    return this.listRelationships(courseId, user, page, pageSize, offset, query, "enrollment");
  }

  async listInstructorAssignments(courseId: string, user: AuthenticatedUser, page: number, pageSize: number, offset: number, query: RelationshipListQueryDto) {
    return this.listRelationships(courseId, user, page, pageSize, offset, query, "instructor_assignment");
  }

  private async runRelationship<T>(work: () => Promise<T>) {
    try {
      return await work();
    } catch (error) {
      if ((error as { code?: string }).code === "23505") {
        throw new ConflictException("This person already has an active relationship with the course.");
      }
      if ((error as { code?: string }).code === "23514") {
        throw new BadRequestException("The relationship status is invalid.");
      }
      throw error;
    }
  }

  async enrollLearner(courseId: string, input: EnrollLearnerDto, request: ContextRequest) {
    const user = request.context.user!;
    const course = await this.relationshipCourse(courseId, user);
    await this.eligiblePerson(user, String(course.institution_id), input.learnerId, "STUDENT");
    return this.runRelationship(async () => {
      const result = await this.db.query<Record<string, unknown>>(
        `INSERT INTO lms_enrollments (tenant_id, institution_id, course_id, learner_id, enrolled_by)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, tenant_id, institution_id, course_id, learner_id, status, enrolled_by, enrolled_at, removed_at, created_at, updated_at`,
        [user.tenantId, course.institution_id, course.id, input.learnerId, user.id],
      );
      const row = result.rows[0];
      await this.auditMutation(request, "enrollment", "CREATE", row);
      return row;
    });
  }

  async assignInstructor(courseId: string, input: AssignInstructorDto, request: ContextRequest) {
    const user = request.context.user!;
    const course = await this.relationshipCourse(courseId, user);
    await this.eligiblePerson(user, String(course.institution_id), input.instructorId, "TEACHER");
    return this.runRelationship(async () => {
      const result = await this.db.query<Record<string, unknown>>(
        `INSERT INTO lms_instructor_assignments (tenant_id, institution_id, course_id, instructor_id, assigned_by)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, tenant_id, institution_id, course_id, instructor_id, status, assigned_by, assigned_at, removed_at, created_at, updated_at`,
        [user.tenantId, course.institution_id, course.id, input.instructorId, user.id],
      );
      const row = result.rows[0];
      await this.auditMutation(request, "instructor_assignment", "CREATE", row);
      return row;
    });
  }

  private async removeRelationship(
    courseId: string,
    relationshipId: string,
    request: ContextRequest,
    kind: "enrollment" | "instructor_assignment",
  ) {
    const user = request.context.user!;
    const course = await this.relationshipCourse(courseId, user);
    const table = kind === "enrollment" ? "lms_enrollments" : "lms_instructor_assignments";
    const result = await this.db.query<Record<string, unknown>>(
      `SELECT * FROM ${table}
       WHERE id = $1 AND tenant_id = $2 AND institution_id = $3 AND course_id = $4`,
      [relationshipId, user.tenantId, course.institution_id, course.id],
    );
    const before = result.rows[0];
    if (!before) throw new NotFoundException("Course relationship not found.");
    if (before.status !== "ACTIVE") throw new ConflictException("This course relationship has already been removed.");
    return this.runRelationship(async () => {
      const removed = await this.db.query<Record<string, unknown>>(
        `UPDATE ${table}
         SET status = 'REMOVED', removed_by = $2, removed_at = now(), updated_at = now()
         WHERE id = $1 AND tenant_id = $3 AND institution_id = $4 AND course_id = $5 AND status = 'ACTIVE'
         RETURNING *`,
        [relationshipId, user.id, user.tenantId, course.institution_id, course.id],
      );
      if (!removed.rows[0]) throw new ConflictException("This course relationship has already been removed.");
      await this.auditMutation(request, kind, "REMOVE", removed.rows[0], before);
      return removed.rows[0];
    });
  }

  async removeEnrollment(courseId: string, enrollmentId: string, request: ContextRequest) {
    return this.removeRelationship(courseId, enrollmentId, request, "enrollment");
  }

  async removeInstructorAssignment(courseId: string, assignmentId: string, request: ContextRequest) {
    return this.removeRelationship(courseId, assignmentId, request, "instructor_assignment");
  }

  private async progressCourse(courseId: string, user: AuthenticatedUser) {
    const result = await this.db.query<Record<string, unknown>>(
      `SELECT c.id, c.tenant_id, c.institution_id, c.title, c.code, c.description, c.status,
              p.status AS programme_status, i.status AS institution_status
       FROM courses c
       JOIN programmes p ON p.id = c.programme_id AND p.tenant_id = c.tenant_id
       JOIN institutions i ON i.id = p.institution_id AND i.tenant_id = c.tenant_id
       WHERE c.id = $1 AND c.tenant_id = $2`,
      [courseId, user.tenantId],
    );
    const course = result.rows[0];
    if (!course) throw new NotFoundException("Course not found in the current tenant.");
    if (course.status !== "PUBLISHED") throw new BadRequestException("Progress is available only for published courses.");
    if (course.programme_status === "ARCHIVED" || course.institution_status !== "ACTIVE") {
      throw new BadRequestException("The course institution or programme is not active.");
    }
    return course;
  }

  private async activeEnrollment(courseId: string, learnerId: string, user: AuthenticatedUser) {
    const result = await this.db.query<Record<string, unknown>>(
      `SELECT id, tenant_id, institution_id, course_id, learner_id, status, enrolled_at
       FROM lms_enrollments
       WHERE tenant_id = $1 AND course_id = $2 AND learner_id = $3 AND status = 'ACTIVE'`,
      [user.tenantId, courseId, learnerId],
    );
    if (!result.rows[0]) throw new ForbiddenException("An active course enrollment is required.");
    return result.rows[0];
  }

  private async assertProgressViewer(course: Record<string, unknown>, user: AuthenticatedUser, learnerId: string) {
    const selfEnrollment = await this.db.query(
      `SELECT 1
       FROM lms_enrollments
       WHERE tenant_id = $1 AND institution_id = $2 AND course_id = $3 AND learner_id = $4 AND status = 'ACTIVE'
       LIMIT 1`,
      [user.tenantId, course.institution_id, course.id, learnerId],
    );
    if (!selfEnrollment.rows[0]) throw new NotFoundException("Active learner enrollment not found.");
    if (learnerId === user.id) return;
    if (user.roles.some((role) => role.code === "CITIS_SUPER_ADMIN")) return;

    const staffAccess = await this.db.query(
      `SELECT 1
       FROM user_roles ur
       JOIN roles r ON r.id = ur.role_id AND r.tenant_id = ur.tenant_id
       WHERE ur.user_id = $1 AND ur.tenant_id = $2 AND ur.institution_id = $3
         AND r.status = 'ACTIVE'
         AND (
           r.code IN ('INSTITUTION_ADMINISTRATOR', 'PRINCIPAL_DIRECTOR', 'ACADEMIC_ADMINISTRATOR')
           OR (
             r.code = 'TEACHER'
             AND EXISTS (
               SELECT 1
               FROM lms_instructor_assignments ia
               WHERE ia.tenant_id = $2 AND ia.institution_id = $3 AND ia.course_id = $4
                 AND ia.instructor_id = ur.user_id AND ia.status = 'ACTIVE'
             )
           )
         )
       LIMIT 1`,
      [user.id, user.tenantId, course.institution_id, course.id],
    );
    if (!staffAccess.rows[0]) throw new ForbiddenException("You are not authorized to view this learner's progress.");
  }

  private async calculateCourseProgress(course: Record<string, unknown>, learnerId: string, user: AuthenticatedUser) {
    const result = await this.db.query<Record<string, unknown>>(
      `SELECT cm.id AS module_id, cm.title AS module_title, cm.sequence,
              (SELECT count(*)::int
               FROM lessons l
               WHERE l.tenant_id = $2 AND l.module_id = cm.id AND l.status = 'PUBLISHED') AS lesson_total,
              (SELECT count(*)::int
               FROM lessons l
               WHERE l.tenant_id = $2 AND l.module_id = cm.id AND l.status = 'PUBLISHED'
                 AND EXISTS (
                   SELECT 1 FROM lms_lesson_progress lp
                   WHERE lp.tenant_id = $2 AND lp.course_id = $1 AND lp.module_id = cm.id
                     AND lp.lesson_id = l.id AND lp.learner_id = $3 AND lp.status = 'COMPLETED'
                 )) AS lesson_completed,
              (SELECT count(*)::int
               FROM lms_assessments a
               WHERE a.tenant_id = $2 AND a.course_id = $1 AND a.module_id = cm.id AND a.status = 'PUBLISHED') AS assessment_total,
              (SELECT count(*)::int
               FROM lms_assessments a
               WHERE a.tenant_id = $2 AND a.course_id = $1 AND a.module_id = cm.id AND a.status = 'PUBLISHED'
                 AND EXISTS (
                   SELECT 1 FROM lms_assessment_completions ac
                   WHERE ac.tenant_id = $2 AND ac.course_id = $1 AND ac.module_id = cm.id
                     AND ac.assessment_id = a.id AND ac.learner_id = $3 AND ac.status = 'COMPLETED'
                 )) AS assessment_completed
       FROM course_modules cm
       WHERE cm.tenant_id = $2 AND cm.course_id = $1 AND cm.status = 'PUBLISHED'
       ORDER BY cm.sequence ASC, cm.id ASC`,
      [course.id, user.tenantId, learnerId],
    );

    const modules = result.rows.map((row) => {
      const lessonTotal = Number(row.lesson_total ?? 0);
      const lessonCompleted = Number(row.lesson_completed ?? 0);
      const assessmentTotal = Number(row.assessment_total ?? 0);
      const assessmentCompleted = Number(row.assessment_completed ?? 0);
      const total = lessonTotal + assessmentTotal;
      const completed = lessonCompleted + assessmentCompleted;
      return {
        id: row.module_id,
        title: row.module_title,
        sequence: Number(row.sequence),
        state: progressState(completed, total),
        percentage: progressPercentage(completed, total),
        lessons: { completed: lessonCompleted, total: lessonTotal },
        assessments: { completed: assessmentCompleted, total: assessmentTotal },
      };
    });
    const lessons = modules.reduce((summary, module) => ({
      completed: summary.completed + module.lessons.completed,
      total: summary.total + module.lessons.total,
    }), { completed: 0, total: 0 });
    const assessments = modules.reduce((summary, module) => ({
      completed: summary.completed + module.assessments.completed,
      total: summary.total + module.assessments.total,
    }), { completed: 0, total: 0 });
    const total = lessons.total + assessments.total;
    const completed = lessons.completed + assessments.completed;

    return {
      course: {
        id: course.id,
        title: course.title,
        code: course.code,
        description: course.description,
        status: course.status,
      },
      learnerId,
      state: progressState(completed, total),
      percentage: progressPercentage(completed, total),
      lessons,
      assessments,
      modules,
    };
  }

  async listLearnerProgress(user: AuthenticatedUser) {
    const result = await this.db.query<{ course_id: string }>(
      `SELECT course_id
       FROM lms_enrollments
       WHERE tenant_id = $1 AND learner_id = $2 AND status = 'ACTIVE'
       ORDER BY enrolled_at DESC, course_id ASC`,
      [user.tenantId, user.id],
    );
    return Promise.all(result.rows.map(({ course_id }) => this.getCourseProgress(course_id, user)));
  }

  async getCourseProgress(courseId: string, user: AuthenticatedUser, learnerId = user.id) {
    const course = await this.progressCourse(courseId, user);
    await this.assertProgressViewer(course, user, learnerId);
    return this.calculateCourseProgress(course, learnerId, user);
  }

  async completeLesson(lessonId: string, request: ContextRequest) {
    const user = request.context.user!;
    const result = await this.db.query<Record<string, unknown>>(
      `SELECT l.id, l.tenant_id, l.module_id, cm.course_id, c.institution_id,
              l.status AS lesson_status, cm.status AS module_status, c.status AS course_status,
              p.status AS programme_status, i.status AS institution_status
       FROM lessons l
       JOIN course_modules cm ON cm.id = l.module_id AND cm.tenant_id = l.tenant_id
       JOIN courses c ON c.id = cm.course_id AND c.tenant_id = l.tenant_id
       JOIN programmes p ON p.id = c.programme_id AND p.tenant_id = l.tenant_id
       JOIN institutions i ON i.id = p.institution_id AND i.tenant_id = l.tenant_id
       WHERE l.id = $1 AND l.tenant_id = $2`,
      [lessonId, user.tenantId],
    );
    const lesson = result.rows[0];
    if (!lesson) throw new NotFoundException("Lesson not found in the current tenant.");
    if (lesson.course_status !== "PUBLISHED" || lesson.module_status !== "PUBLISHED" || lesson.lesson_status !== "PUBLISHED") {
      throw new BadRequestException("Only published lessons in published courses can be completed.");
    }
    if (lesson.programme_status === "ARCHIVED" || lesson.institution_status !== "ACTIVE") {
      throw new BadRequestException("The course institution or programme is not active.");
    }
    await this.activeEnrollment(String(lesson.course_id), user.id, user);
    const beforeResult = await this.db.query<Record<string, unknown>>(
      `SELECT * FROM lms_lesson_progress
       WHERE tenant_id = $1 AND course_id = $2 AND lesson_id = $3 AND learner_id = $4`,
      [user.tenantId, lesson.course_id, lesson.id, user.id],
    );
    const before = beforeResult.rows[0];
    const completed = await this.db.query<Record<string, unknown>>(
      `INSERT INTO lms_lesson_progress
         (tenant_id, institution_id, course_id, module_id, lesson_id, learner_id, status, started_at, completed_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'COMPLETED', now(), now())
       ON CONFLICT (tenant_id, course_id, lesson_id, learner_id)
       DO UPDATE SET status = 'COMPLETED', completed_at = COALESCE(lms_lesson_progress.completed_at, now()), updated_at = now()
       RETURNING *`,
      [user.tenantId, lesson.institution_id, lesson.course_id, lesson.module_id, lesson.id, user.id],
    );
    const row = completed.rows[0];
    if (before?.status !== "COMPLETED") await this.auditMutation(request, "lesson_progress", "COMPLETE", row, before);
    return row;
  }

  async completeAssessment(input: CompleteAssessmentDto, request: ContextRequest) {
    const user = request.context.user!;
    const result = await this.db.query<Record<string, unknown>>(
      `SELECT a.*, c.institution_id, c.status AS course_status, cm.status AS module_status,
              p.status AS programme_status, i.status AS institution_status
       FROM lms_assessments a
       JOIN course_modules cm ON cm.id = a.module_id AND cm.tenant_id = a.tenant_id
       JOIN courses c ON c.id = a.course_id AND c.tenant_id = a.tenant_id
       JOIN programmes p ON p.id = c.programme_id AND p.tenant_id = a.tenant_id
       JOIN institutions i ON i.id = p.institution_id AND i.tenant_id = a.tenant_id
       WHERE a.id = $1 AND a.tenant_id = $2`,
      [input.assessmentId, user.tenantId],
    );
    const assessment = result.rows[0];
    if (!assessment) throw new NotFoundException("Assessment not found in the current tenant.");
    if (assessment.status !== "PUBLISHED" || assessment.module_status !== "PUBLISHED" || assessment.course_status !== "PUBLISHED") {
      throw new BadRequestException("Only published assessments in published courses can be completed.");
    }
    if (assessment.programme_status === "ARCHIVED" || assessment.institution_status !== "ACTIVE") {
      throw new BadRequestException("The course institution or programme is not active.");
    }
    await this.activeEnrollment(String(assessment.course_id), user.id, user);
    if (input.score !== undefined && assessment.total_marks !== null && input.score > Number(assessment.total_marks)) {
      throw new BadRequestException("Assessment score cannot exceed total marks.");
    }
    const existingResult = await this.db.query<Record<string, unknown>>(
      `SELECT * FROM lms_assessment_completions
       WHERE tenant_id = $1 AND assessment_id = $2 AND learner_id = $3 AND attempt_id = $4`,
      [user.tenantId, assessment.id, user.id, input.attemptId.trim()],
    );
    const before = existingResult.rows[0];
    if (!before && assessment.attempt_limit !== null) {
      const attempts = await this.db.query<{ count: string }>(
        `SELECT count(*)::text AS count
         FROM lms_assessment_completions
         WHERE tenant_id = $1 AND assessment_id = $2 AND learner_id = $3 AND status = 'COMPLETED'`,
        [user.tenantId, assessment.id, user.id],
      );
      if (Number(attempts.rows[0]?.count ?? 0) >= Number(assessment.attempt_limit)) {
        throw new BadRequestException("The assessment attempt limit has been reached.");
      }
    }
    const passed = input.passed ?? (
      input.score !== undefined && assessment.passing_marks !== null
        ? input.score >= Number(assessment.passing_marks)
        : null
    );
    const completed = await this.db.query<Record<string, unknown>>(
      `INSERT INTO lms_assessment_completions
         (tenant_id, institution_id, course_id, module_id, assessment_id, learner_id, attempt_id, score, passed, completed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, COALESCE($10::timestamptz, now()))
       ON CONFLICT (tenant_id, assessment_id, learner_id, attempt_id)
       DO UPDATE SET score = EXCLUDED.score, passed = EXCLUDED.passed, completed_at = EXCLUDED.completed_at, updated_at = now()
       RETURNING *`,
      [
        user.tenantId,
        assessment.institution_id,
        assessment.course_id,
        assessment.module_id,
        assessment.id,
        user.id,
        input.attemptId.trim(),
        input.score ?? null,
        passed,
        input.completedAt ?? null,
      ],
    );
    const row = completed.rows[0];
    if (!before) await this.auditMutation(request, "assessment_completion", "COMPLETE", row);
    return row;
  }

  private async assignmentCourse(courseId: string, user: AuthenticatedUser) {
    const result = await this.db.query<Record<string, unknown>>(
      `SELECT c.id, c.tenant_id, c.institution_id, c.title, c.code, c.status,
              p.status AS programme_status, i.status AS institution_status
       FROM courses c
       JOIN programmes p ON p.id = c.programme_id AND p.tenant_id = c.tenant_id
       JOIN institutions i ON i.id = p.institution_id AND i.tenant_id = c.tenant_id
       WHERE c.id = $1 AND c.tenant_id = $2`,
      [courseId, user.tenantId],
    );
    const course = result.rows[0];
    if (!course) throw new NotFoundException("Course not found in the current tenant.");
    if (course.programme_status === "ARCHIVED" || course.institution_status !== "ACTIVE" || course.status === "ARCHIVED") {
      throw new BadRequestException("The course institution, programme, or course is not active.");
    }
    return course;
  }

  private async hasAssignmentStaffAccess(user: AuthenticatedUser, institutionId: string, courseId: string) {
    if (user.roles.some((role) => role.code === "CITIS_SUPER_ADMIN")) return true;
    const result = await this.db.query(
      `SELECT 1
       FROM user_roles ur
       JOIN roles r ON r.id = ur.role_id AND r.tenant_id = ur.tenant_id
       WHERE ur.user_id = $1 AND ur.tenant_id = $2 AND ur.institution_id = $3
         AND r.status = 'ACTIVE'
         AND (
           r.code IN ('INSTITUTION_ADMINISTRATOR', 'PRINCIPAL_DIRECTOR', 'ACADEMIC_ADMINISTRATOR')
           OR (
             r.code = 'TEACHER'
             AND EXISTS (
               SELECT 1
               FROM lms_instructor_assignments ia
               WHERE ia.tenant_id = $2 AND ia.institution_id = $3 AND ia.course_id = $4
                 AND ia.instructor_id = ur.user_id AND ia.status = 'ACTIVE'
             )
           )
         )
       LIMIT 1`,
      [user.id, user.tenantId, institutionId, courseId],
    );
    return Boolean(result.rows[0]);
  }

  private async assertAssignmentStaffAccess(user: AuthenticatedUser, institutionId: string, courseId: string) {
    if (!await this.hasAssignmentStaffAccess(user, institutionId, courseId)) {
      throw new ForbiddenException("You are not authorized to manage assignments for this course.");
    }
  }

  private async assignmentModule(moduleId: string, courseId: string, user: AuthenticatedUser) {
    const result = await this.db.query<Record<string, unknown>>(
      `SELECT cm.id, cm.tenant_id, cm.course_id, cm.title, cm.status
       FROM course_modules cm
       WHERE cm.id = $1 AND cm.course_id = $2 AND cm.tenant_id = $3`,
      [moduleId, courseId, user.tenantId],
    );
    const module = result.rows[0];
    if (!module || module.status === "ARCHIVED") throw new NotFoundException("Course module not found in the current tenant.");
    return module;
  }

  private async assignmentFor(id: string, user: AuthenticatedUser) {
    const result = await this.db.query<Record<string, unknown>>(
      `SELECT a.*, c.institution_id, c.title AS course_title, c.status AS course_status,
              cm.title AS module_title, cm.status AS module_status,
              p.status AS programme_status, i.status AS institution_status
       FROM lms_assessments a
       JOIN courses c ON c.id = a.course_id AND c.tenant_id = a.tenant_id
       JOIN course_modules cm ON cm.id = a.module_id AND cm.course_id = a.course_id AND cm.tenant_id = a.tenant_id
       JOIN programmes p ON p.id = c.programme_id AND p.tenant_id = a.tenant_id
       JOIN institutions i ON i.id = p.institution_id AND i.tenant_id = a.tenant_id
       WHERE a.id = $1 AND a.tenant_id = $2 AND a.assessment_type = 'ASSIGNMENT'`,
      [id, user.tenantId],
    );
    const assignment = result.rows[0];
    if (!assignment) throw new NotFoundException("Assignment not found in the current tenant.");
    return assignment;
  }

  private async assertAssignmentViewer(assignment: Record<string, unknown>, user: AuthenticatedUser) {
    if (await this.hasAssignmentStaffAccess(user, String(assignment.institution_id), String(assignment.course_id))) return;
    if (assignment.status !== "PUBLISHED" || assignment.course_status !== "PUBLISHED" || assignment.module_status !== "PUBLISHED") {
      throw new NotFoundException("Assignment not found.");
    }
    await this.activeEnrollment(String(assignment.course_id), user.id, user);
  }

  async listAssignments(user: AuthenticatedUser, page: number, pageSize: number, offset: number, query: AssignmentListQueryDto) {
    const filter = this.statusFilter(query.status);
    const values: unknown[] = [user.tenantId];
    const clauses = ["a.tenant_id = $1", "a.assessment_type = 'ASSIGNMENT'"];
    if (query.courseId) {
      const course = await this.assignmentCourse(query.courseId, user);
      const staff = await this.hasAssignmentStaffAccess(user, String(course.institution_id), String(course.id));
      if (!staff) await this.activeEnrollment(String(course.id), user.id, user);
      values.push(query.courseId);
      clauses.push(`a.course_id = $${values.length}`);
      if (!staff) clauses.push("a.status = 'PUBLISHED'");
    } else {
      if (!user.roles.some((role) => role.code === "STUDENT")) {
        throw new BadRequestException("courseId is required when listing assignments as staff.");
      }
      const enrolled = await this.db.query<{ course_id: string }>(
        `SELECT course_id FROM lms_enrollments WHERE tenant_id = $1 AND learner_id = $2 AND status = 'ACTIVE'`,
        [user.tenantId, user.id],
      );
      if (!enrolled.rows.length) return { data: [], meta: paginationMeta(page, pageSize, 0) };
      values.push(enrolled.rows.map((row) => row.course_id));
      clauses.push(`a.course_id = ANY($${values.length}::uuid[])`);
      clauses.push("a.status = 'PUBLISHED'");
    }
    if (filter.values.length) {
      values.push(filter.values[0]);
      clauses.push(`a.status = $${values.length}`);
    }
    const pageParam = values.length + 1;
    const [rows, total] = await Promise.all([
      this.db.query(
        `SELECT a.id, a.tenant_id, a.institution_id, a.course_id, a.module_id, a.title,
                a.description, a.instructions, a.due_at, a.total_marks AS max_marks, a.status,
                a.created_at, a.updated_at, c.title AS course_title, cm.title AS module_title
         FROM lms_assessments a
         JOIN courses c ON c.id = a.course_id AND c.tenant_id = a.tenant_id
         JOIN course_modules cm ON cm.id = a.module_id AND cm.course_id = a.course_id AND cm.tenant_id = a.tenant_id
         WHERE ${clauses.join(" AND ")}
         ORDER BY a.due_at ASC NULLS LAST, a.created_at DESC, a.id ASC
         LIMIT $${pageParam} OFFSET $${pageParam + 1}`,
        [...values, pageSize, offset],
      ),
      this.db.query<{ count: string }>(
        `SELECT count(*)::text AS count FROM lms_assessments a WHERE ${clauses.join(" AND ")}`,
        values,
      ),
    ]);
    return { data: rows.rows, meta: paginationMeta(page, pageSize, Number(total.rows[0]?.count ?? 0)) };
  }

  async getAssignment(id: string, user: AuthenticatedUser) {
    const assignment = await this.assignmentFor(id, user);
    await this.assertAssignmentViewer(assignment, user);
    return assignment;
  }

  async createAssignment(input: CreateAssignmentDto, request: ContextRequest) {
    const user = request.context.user!;
    const course = await this.assignmentCourse(input.courseId, user);
    await this.assertAssignmentStaffAccess(user, String(course.institution_id), String(course.id));
    const module = await this.assignmentModule(input.moduleId, input.courseId, user);
    return this.run(async () => {
      const result = await this.db.query<Record<string, unknown>>(
        `INSERT INTO lms_assessments
           (tenant_id, institution_id, course_id, module_id, title, description, instructions, due_at, total_marks, assessment_type, attempt_limit)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'ASSIGNMENT', 1)
         RETURNING id, tenant_id, institution_id, course_id, module_id, title, description, instructions,
                   due_at, total_marks AS max_marks, assessment_type, status, created_at, updated_at`,
        [
          user.tenantId,
          course.institution_id,
          course.id,
          module.id,
          input.title.trim(),
          input.description?.trim() || null,
          input.instructions.trim(),
          input.dueAt ?? null,
          input.maxMarks,
        ],
      );
      const row = result.rows[0];
      await this.auditMutation(request, "assignment", "CREATE", row);
      return row;
    });
  }

  async updateAssignment(id: string, input: UpdateAssignmentDto, request: ContextRequest) {
    const user = request.context.user!;
    const before = await this.assignmentFor(id, user);
    await this.assertAssignmentStaffAccess(user, String(before.institution_id), String(before.course_id));
    if (before.status === "ARCHIVED") throw new ConflictException("Archived assignments cannot be edited.");
    return this.run(async () => {
      const result = await this.db.query<Record<string, unknown>>(
        `UPDATE lms_assessments
         SET title = COALESCE($3, title), description = COALESCE($4, description),
             instructions = COALESCE($5, instructions), due_at = COALESCE($6::timestamptz, due_at),
             total_marks = COALESCE($7, total_marks), updated_at = now()
         WHERE id = $1 AND tenant_id = $2 AND assessment_type = 'ASSIGNMENT'
         RETURNING id, tenant_id, institution_id, course_id, module_id, title, description, instructions,
                   due_at, total_marks AS max_marks, assessment_type, status, created_at, updated_at`,
        [
          id,
          user.tenantId,
          input.title?.trim() || null,
          input.description?.trim() || null,
          input.instructions?.trim() || null,
          input.dueAt ?? null,
          input.maxMarks ?? null,
        ],
      );
      if (!result.rows[0]) throw new NotFoundException("Assignment not found.");
      const row = result.rows[0];
      await this.auditMutation(request, "assignment", "UPDATE", row, before);
      return row;
    });
  }

  async changeAssignmentStatus(id: string, status: LmsStatus, request: ContextRequest) {
    const user = request.context.user!;
    const before = await this.assignmentFor(id, user);
    await this.assertAssignmentStaffAccess(user, String(before.institution_id), String(before.course_id));
    if (status === "PUBLISHED" && (before.course_status !== "PUBLISHED" || before.module_status !== "PUBLISHED")) {
      throw new BadRequestException("Assignments can be published only inside published courses and modules.");
    }
    return this.run(async () => {
      const result = await this.db.query<Record<string, unknown>>(
        `UPDATE lms_assessments
         SET status = $3, updated_at = now()
         WHERE id = $1 AND tenant_id = $2 AND assessment_type = 'ASSIGNMENT'
         RETURNING id, tenant_id, institution_id, course_id, module_id, title, description, instructions,
                   due_at, total_marks AS max_marks, assessment_type, status, created_at, updated_at`,
        [id, user.tenantId, status],
      );
      if (!result.rows[0]) throw new NotFoundException("Assignment not found.");
      const row = result.rows[0];
      await this.auditMutation(request, "assignment", status === "PUBLISHED" ? "PUBLISH" : "ARCHIVE", row, before);
      return row;
    });
  }

  async listAssignmentSubmissions(id: string, user: AuthenticatedUser, page: number, pageSize: number, offset: number) {
    const assignment = await this.assignmentFor(id, user);
    await this.assertAssignmentStaffAccess(user, String(assignment.institution_id), String(assignment.course_id));
    const values = [user.tenantId, id, pageSize, offset];
    const [rows, total] = await Promise.all([
      this.db.query(
        `SELECT s.id, s.tenant_id, s.institution_id, s.course_id, s.module_id, s.assignment_id,
                s.learner_id, s.submission_text, s.attachment_url, s.is_late, s.status, s.grade,
                s.feedback, s.submitted_at, s.graded_by, s.graded_at, s.created_at, s.updated_at,
                u.first_name AS learner_first_name, u.last_name AS learner_last_name, u.email AS learner_email
         FROM lms_assignment_submissions s
         JOIN users u ON u.id = s.learner_id AND u.tenant_id = s.tenant_id
         WHERE s.tenant_id = $1 AND s.assignment_id = $2
         ORDER BY s.submitted_at DESC, s.id ASC LIMIT $3 OFFSET $4`,
        values,
      ),
      this.db.query<{ count: string }>(
        "SELECT count(*)::text AS count FROM lms_assignment_submissions WHERE tenant_id = $1 AND assignment_id = $2",
        values.slice(0, 2),
      ),
    ]);
    return { data: rows.rows, meta: paginationMeta(page, pageSize, Number(total.rows[0]?.count ?? 0)) };
  }

  async getMyAssignmentSubmission(id: string, user: AuthenticatedUser) {
    const assignment = await this.assignmentFor(id, user);
    await this.assertAssignmentViewer(assignment, user);
    const result = await this.db.query<Record<string, unknown>>(
      `SELECT * FROM lms_assignment_submissions
       WHERE tenant_id = $1 AND assignment_id = $2 AND learner_id = $3`,
      [user.tenantId, id, user.id],
    );
    return result.rows[0] ?? null;
  }

  async submitAssignment(id: string, input: SubmitAssignmentDto, request: ContextRequest) {
    const user = request.context.user!;
    const assignment = await this.assignmentFor(id, user);
    if (assignment.status !== "PUBLISHED" || assignment.course_status !== "PUBLISHED" || assignment.module_status !== "PUBLISHED") {
      throw new BadRequestException("Only published assignments in published courses can be submitted.");
    }
    await this.activeEnrollment(String(assignment.course_id), user.id, user);
    const existingResult = await this.db.query<Record<string, unknown>>(
      `SELECT * FROM lms_assignment_submissions
       WHERE tenant_id = $1 AND assignment_id = $2 AND learner_id = $3`,
      [user.tenantId, id, user.id],
    );
    const before = existingResult.rows[0];
    if (before?.status === "GRADED") throw new ConflictException("A graded assignment cannot be resubmitted.");
    return this.run(async () => {
      const result = await this.db.query<Record<string, unknown>>(
        `INSERT INTO lms_assignment_submissions
           (tenant_id, institution_id, course_id, module_id, assignment_id, learner_id, submission_text, attachment_url, is_late)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, ($9::timestamptz IS NOT NULL AND now() > $9::timestamptz))
         ON CONFLICT (tenant_id, assignment_id, learner_id)
         DO UPDATE SET submission_text = EXCLUDED.submission_text, attachment_url = EXCLUDED.attachment_url,
                       is_late = EXCLUDED.is_late, status = 'SUBMITTED', grade = NULL, feedback = NULL,
                       graded_by = NULL, graded_at = NULL, submitted_at = now(), updated_at = now()
         RETURNING *`,
        [
          user.tenantId,
          assignment.institution_id,
          assignment.course_id,
          assignment.module_id,
          assignment.id,
          user.id,
          input.submissionText.trim(),
          input.attachmentUrl?.trim() || null,
          assignment.due_at ?? null,
        ],
      );
      const row = result.rows[0];
      await this.auditMutation(request, "assignment_submission", before ? "RESUBMIT" : "SUBMIT", row, before);
      return row;
    });
  }

  async gradeAssignmentSubmission(id: string, submissionId: string, input: GradeAssignmentSubmissionDto, request: ContextRequest) {
    const user = request.context.user!;
    const assignment = await this.assignmentFor(id, user);
    await this.assertAssignmentStaffAccess(user, String(assignment.institution_id), String(assignment.course_id));
    if (input.grade > Number(assignment.total_marks)) throw new BadRequestException("Grade cannot exceed the assignment's maximum marks.");
    const submissionResult = await this.db.query<Record<string, unknown>>(
      `SELECT * FROM lms_assignment_submissions
       WHERE id = $1 AND tenant_id = $2 AND assignment_id = $3`,
      [submissionId, user.tenantId, id],
    );
    const before = submissionResult.rows[0];
    if (!before) throw new NotFoundException("Assignment submission not found.");
    if (before.status !== "SUBMITTED" && before.status !== "GRADED") {
      throw new ConflictException("This assignment submission cannot be graded.");
    }
    return this.run(async () => {
      const result = await this.db.query<Record<string, unknown>>(
        `UPDATE lms_assignment_submissions
         SET status = 'GRADED', grade = $4, feedback = $5, graded_by = $2, graded_at = now(), updated_at = now()
         WHERE id = $1 AND tenant_id = $3 AND assignment_id = $6
         RETURNING *`,
        [submissionId, user.id, user.tenantId, input.grade, input.feedback?.trim() || null, id],
      );
      const row = result.rows[0];
      await this.auditMutation(request, "assignment_submission", "GRADE", row, before);
      const completion = await this.db.query<Record<string, unknown>>(
        `INSERT INTO lms_assessment_completions
           (tenant_id, institution_id, course_id, module_id, assessment_id, learner_id, attempt_id, score, passed, completed_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NULL, now())
         ON CONFLICT (tenant_id, assessment_id, learner_id, attempt_id)
         DO UPDATE SET score = EXCLUDED.score, completed_at = now(), updated_at = now()
         RETURNING *`,
        [
          user.tenantId,
          assignment.institution_id,
          assignment.course_id,
          assignment.module_id,
          assignment.id,
          before.learner_id,
          `assignment:${submissionId}`,
          input.grade,
        ],
      );
      await this.auditMutation(request, "assessment_completion", "COMPLETE", completion.rows[0]);
      return row;
    });
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