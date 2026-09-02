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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LmsService = void 0;
const common_1 = require("@nestjs/common");
const audit_service_1 = require("../../common/audit.service");
const access_scope_1 = require("../../common/access-scope");
const pagination_1 = require("../../common/pagination");
const database_service_1 = require("../../database/database.service");
const resource_storage_service_1 = require("./resource-storage.service");
const certificate_service_1 = require("./certificate.service");
const RESOURCE_TYPES_WITH_URL = ["VIDEO", "LINK", "SCORM", "INTERACTIVE"];
const RESOURCE_TYPES_WITH_FILE_OR_URL = ["PDF", "DOCUMENT", "PRESENTATION"];
function progressState(completed, total) {
    if (completed === 0)
        return "NOT_STARTED";
    if (completed >= total && total > 0)
        return "COMPLETED";
    return "IN_PROGRESS";
}
function progressPercentage(completed, total) {
    return total > 0 ? Math.round((completed / total) * 10000) / 100 : 0;
}
let LmsService = class LmsService {
    db;
    audit;
    storage;
    certificates;
    constructor(db, audit, storage, certificates) {
        this.db = db;
        this.audit = audit;
        this.storage = storage;
        this.certificates = certificates;
    }
    statusFilter(status) {
        if (!status)
            return { clause: "", values: [] };
        if (!["DRAFT", "PUBLISHED", "ARCHIVED"].includes(status))
            throw new common_1.BadRequestException("Invalid LMS status.");
        return { clause: " AND status = $1", values: [status] };
    }
    async run(work) {
        try {
            return await work();
        }
        catch (error) {
            if (error.code === "23505")
                throw new common_1.ConflictException("The LMS content code, sequence, or position is already in use.");
            if (error.code === "23514")
                throw new common_1.BadRequestException("The LMS content does not satisfy its resource or status rules.");
            throw error;
        }
    }
    async institutionFor(user, institutionId) {
        const result = await this.db.query("SELECT id, tenant_id FROM institutions WHERE id = $1 AND tenant_id = $2 AND status <> 'ARCHIVED'", [institutionId, user.tenantId]);
        if (!result.rows[0])
            throw new common_1.NotFoundException("Institution not found in the current tenant.");
        (0, access_scope_1.assertScope)(user, institutionId);
        return result.rows[0];
    }
    async campusFor(user, institutionId, campusId) {
        if (!campusId)
            return null;
        const result = await this.db.query(`SELECT id FROM campuses
       WHERE id = $1 AND tenant_id = $2 AND institution_id = $3 AND status <> 'ARCHIVED'`, [campusId, user.tenantId, institutionId]);
        if (!result.rows[0])
            throw new common_1.NotFoundException("Campus not found in the current institution.");
        (0, access_scope_1.assertScope)(user, institutionId, campusId);
        return campusId;
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
    async auditAccess(request, resource, action, row, details) {
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
            newValue: details,
            ipAddress: request.context.ipAddress,
            deviceContext: { userAgent: request.context.userAgent },
        });
    }
    async listProgrammes(user, page, pageSize, offset, query) {
        const filter = this.statusFilter(query.status);
        const values = [user.tenantId, ...filter.values, pageSize, offset];
        const statusParam = filter.values.length ? " AND p.status = $2" : "";
        const limitParam = filter.values.length ? "$3" : "$2";
        const offsetParam = filter.values.length ? "$4" : "$3";
        const [rows, total] = await Promise.all([
            this.db.query(`SELECT p.id, p.tenant_id, p.institution_id, p.campus_id, i.name AS institution_name, p.name, p.code, p.description, p.status,
                p.created_at, p.updated_at
         FROM programmes p JOIN institutions i ON i.id = p.institution_id
         WHERE p.tenant_id = $1${statusParam}
         ORDER BY p.created_at DESC LIMIT ${limitParam} OFFSET ${offsetParam}`, values),
            this.db.query(`SELECT count(*)::text AS count FROM programmes p WHERE p.tenant_id = $1${statusParam}`, values.slice(0, filter.values.length ? 2 : 1)),
        ]);
        const visible = (0, access_scope_1.filterScopedRows)(user, rows.rows);
        return { data: visible, meta: (0, pagination_1.paginationMeta)(page, pageSize, visible.length) };
    }
    async getProgramme(id, user) {
        const result = await this.db.query(`SELECT p.id, p.tenant_id, p.institution_id, p.campus_id, i.name AS institution_name, p.name, p.code, p.description, p.status,
              p.created_at, p.updated_at
       FROM programmes p JOIN institutions i ON i.id = p.institution_id
       WHERE p.id = $1 AND p.tenant_id = $2`, [id, user.tenantId]);
        if (!result.rows[0])
            throw new common_1.NotFoundException("Programme not found.");
        (0, access_scope_1.assertScopeForRead)(user, String(result.rows[0].institution_id), result.rows[0].campus_id);
        return result.rows[0];
    }
    async createProgramme(input, request) {
        const user = request.context.user;
        await this.institutionFor(user, input.institutionId);
        const campusId = await this.campusFor(user, input.institutionId, input.campusId);
        return this.run(async () => {
            const result = await this.db.query(`INSERT INTO programmes (tenant_id, institution_id, campus_id, name, code, description, created_by, updated_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
         RETURNING id, tenant_id, institution_id, campus_id, name, code, description, status, created_at, updated_at`, [user.tenantId, input.institutionId, campusId, input.name.trim(), input.code.trim().toUpperCase(), input.description?.trim() || null, user.id]);
            const row = result.rows[0];
            await this.auditMutation(request, "programme", "CREATE", row);
            return row;
        });
    }
    async updateProgramme(id, input, request) {
        const before = await this.getProgramme(id, request.context.user);
        return this.run(async () => {
            const result = await this.db.query(`UPDATE programmes
         SET name = COALESCE($3, name), description = COALESCE($4, description), updated_by = $2, updated_at = now()
         WHERE id = $1 AND tenant_id = $5
          RETURNING id, tenant_id, institution_id, campus_id, name, code, description, status, created_at, updated_at`, [id, request.context.user.id, input.name?.trim() || null, input.description?.trim() || null, request.context.user.tenantId]);
            if (!result.rows[0])
                throw new common_1.NotFoundException("Programme not found.");
            await this.auditMutation(request, "programme", "UPDATE", result.rows[0], before);
            return result.rows[0];
        });
    }
    async listCourses(user, page, pageSize, offset, query, programmeId) {
        const filter = this.statusFilter(query.status);
        const values = [user.tenantId];
        const clauses = ["c.tenant_id = $1"];
        const administratorRoles = ["INSTITUTION_ADMINISTRATOR", "PRINCIPAL_DIRECTOR", "ACADEMIC_ADMINISTRATOR"];
        const instructorOnly = user.roles.some((role) => role.code === "TEACHER")
            && !user.roles.some((role) => administratorRoles.includes(role.code))
            && !(0, access_scope_1.isPlatformUser)(user);
        if (instructorOnly) {
            values.push(user.id);
            clauses.push(`EXISTS (
        SELECT 1
        FROM lms_instructor_assignments ia
        WHERE ia.tenant_id = c.tenant_id
          AND ia.institution_id = c.institution_id
          AND ia.course_id = c.id
          AND (ia.campus_id IS NULL OR ia.campus_id = c.campus_id)
          AND ia.instructor_id = $${values.length}
          AND ia.status = 'ACTIVE'
      )`);
        }
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
            this.db.query(`SELECT c.id, c.tenant_id, c.institution_id, c.campus_id, c.programme_id, p.name AS programme_name, c.title, c.code, c.description, c.thumbnail, c.status,
                c.created_at, c.updated_at
         FROM courses c JOIN programmes p ON p.id = c.programme_id
         WHERE ${clauses.join(" AND ")}
         ORDER BY c.created_at DESC LIMIT $${pageParam} OFFSET $${pageParam + 1}`, values),
            this.db.query(`SELECT count(*)::text AS count FROM courses c WHERE ${clauses.join(" AND ")}`, values.slice(0, -2)),
        ]);
        const visible = (0, access_scope_1.filterScopedRows)(user, rows.rows);
        return { data: visible, meta: (0, pagination_1.paginationMeta)(page, pageSize, visible.length) };
    }
    async getCourse(id, user) {
        const result = await this.db.query(`SELECT c.id, c.tenant_id, c.institution_id, c.campus_id, c.programme_id, p.name AS programme_name, c.title, c.code, c.description, c.thumbnail, c.status,
              c.created_at, c.updated_at
       FROM courses c JOIN programmes p ON p.id = c.programme_id
       WHERE c.id = $1 AND c.tenant_id = $2`, [id, user.tenantId]);
        if (!result.rows[0])
            throw new common_1.NotFoundException("Course not found.");
        (0, access_scope_1.assertScopeForRead)(user, String(result.rows[0].institution_id), result.rows[0].campus_id);
        return result.rows[0];
    }
    async createCourse(input, request) {
        const user = request.context.user;
        const parent = await this.db.query("SELECT id, institution_id, campus_id FROM programmes WHERE id = $1 AND tenant_id = $2 AND status <> 'ARCHIVED'", [input.programmeId, user.tenantId]);
        if (!parent.rows[0])
            throw new common_1.NotFoundException("Programme not found in the current tenant.");
        (0, access_scope_1.assertScope)(user, parent.rows[0].institution_id, parent.rows[0].campus_id);
        if (parent.rows[0].campus_id && input.campusId && parent.rows[0].campus_id !== input.campusId) {
            throw new common_1.BadRequestException("A course campus must match its programme campus.");
        }
        const campusId = await this.campusFor(user, parent.rows[0].institution_id, input.campusId ?? parent.rows[0].campus_id);
        return this.run(async () => {
            const result = await this.db.query(`INSERT INTO courses (tenant_id, institution_id, campus_id, programme_id, title, code, description, thumbnail, created_by, updated_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9)
         RETURNING id, tenant_id, institution_id, campus_id, programme_id, title, code, description, thumbnail, status, created_at, updated_at`, [user.tenantId, parent.rows[0].institution_id, campusId, input.programmeId, input.title.trim(), input.code.trim().toUpperCase(), input.description?.trim() || null, input.thumbnail?.trim() || null, user.id]);
            const row = result.rows[0];
            await this.auditMutation(request, "course", "CREATE", row);
            return row;
        });
    }
    async updateCourse(id, input, request) {
        const before = await this.getCourse(id, request.context.user);
        return this.run(async () => {
            const result = await this.db.query(`UPDATE courses
         SET title = COALESCE($3, title), description = COALESCE($4, description), thumbnail = COALESCE($5, thumbnail),
             updated_by = $2, updated_at = now()
         WHERE id = $1 AND tenant_id = $6
          RETURNING id, tenant_id, institution_id, campus_id, programme_id, title, code, description, thumbnail, status, created_at, updated_at`, [id, request.context.user.id, input.title?.trim() || null, input.description?.trim() || null, input.thumbnail?.trim() || null, request.context.user.tenantId]);
            if (!result.rows[0])
                throw new common_1.NotFoundException("Course not found.");
            await this.auditMutation(request, "course", "UPDATE", result.rows[0], before);
            return result.rows[0];
        });
    }
    async listCourseModules(user, page, pageSize, offset, query, courseId) {
        return this.listChild("course_modules", "course_id", "course", user, page, pageSize, offset, query, courseId, "course_module");
    }
    async listLessons(user, page, pageSize, offset, query, moduleId) {
        return this.listChild("lessons", "module_id", "course_modules", user, page, pageSize, offset, query, moduleId, "lesson");
    }
    async listResources(user, page, pageSize, offset, query, lessonId) {
        return this.listChild("learning_resources", "lesson_id", "lessons", user, page, pageSize, offset, query, lessonId, "learning_resource");
    }
    async listChild(table, parentColumn, parentTable, user, page, pageSize, offset, query, parentId, resource) {
        const filter = this.statusFilter(query.status);
        const values = [user.tenantId];
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
            ? "x.id, x.tenant_id, p.institution_id, c.campus_id, x.course_id, x.title, x.description, x.sequence, x.status, x.created_at, x.updated_at"
            : table === "lessons"
                ? "x.id, x.tenant_id, p.institution_id, c.campus_id, x.module_id, x.title, x.description, x.sequence, x.estimated_duration, x.status, x.created_at, x.updated_at"
                : "x.id, x.tenant_id, p.institution_id, c.campus_id, x.lesson_id, x.resource_type, x.title, x.url, x.file_path, x.duration, x.sequence, x.status, x.created_at, x.updated_at, m.id AS managed_file_id, m.original_filename AS managed_file_name, m.byte_size AS managed_file_size, m.mime_type AS managed_file_mime_type";
        const fromClause = table === "learning_resources"
            ? `${table} x
         JOIN lessons l ON l.id = x.lesson_id AND l.tenant_id = x.tenant_id
         JOIN course_modules cm ON cm.id = l.module_id AND cm.tenant_id = x.tenant_id
         JOIN courses c ON c.id = cm.course_id AND c.tenant_id = x.tenant_id
         JOIN programmes p ON p.id = c.programme_id AND p.tenant_id = x.tenant_id
         LEFT JOIN managed_files m ON m.resource_id = x.id AND m.tenant_id = x.tenant_id`
            : table === "lessons"
                ? `${table} x
           JOIN course_modules cm ON cm.id = x.module_id AND cm.tenant_id = x.tenant_id
           JOIN courses c ON c.id = cm.course_id AND c.tenant_id = x.tenant_id
           JOIN programmes p ON p.id = c.programme_id AND p.tenant_id = x.tenant_id`
                : `${table} x
           JOIN courses c ON c.id = x.course_id AND c.tenant_id = x.tenant_id
           JOIN programmes p ON p.id = c.programme_id AND p.tenant_id = x.tenant_id`;
        const [rows, total] = await Promise.all([
            this.db.query(`SELECT ${selection} FROM ${fromClause}
         WHERE ${clauses.join(" AND ")}
         ORDER BY x.sequence ASC LIMIT $${pageParam} OFFSET $${pageParam + 1}`, values),
            this.db.query(`SELECT count(*)::text AS count FROM ${table} x WHERE ${clauses.join(" AND ")}`, values.slice(0, -2)),
        ]);
        void parentTable;
        void resource;
        const visible = (0, access_scope_1.filterScopedRows)(user, rows.rows);
        return { data: visible, meta: (0, pagination_1.paginationMeta)(page, pageSize, visible.length) };
    }
    async getChild(id, table, user) {
        const scope = await this.contentScope(id, table, user);
        (0, access_scope_1.assertScopeForRead)(user, scope.institution_id, scope.campus_id);
        const result = await this.db.query(`SELECT * FROM ${table} WHERE id = $1 AND tenant_id = $2`, [id, user.tenantId]);
        if (!result.rows[0])
            throw new common_1.NotFoundException("LMS content not found.");
        return { ...result.rows[0], institution_id: scope.institution_id, campus_id: scope.campus_id };
    }
    async createCourseModule(input, request) {
        const user = request.context.user;
        await this.assertParent("courses", input.courseId, user);
        return this.createChild("course_modules", "course_module", input.courseId, input.title, input.description, input.sequence, user, request);
    }
    async updateCourseModule(id, input, request) {
        const before = await this.getChild(id, "course_modules", request.context.user);
        return this.updateChild("course_modules", "course_module", id, input, request, before, "title, description, sequence");
    }
    async createLesson(input, request) {
        const user = request.context.user;
        await this.assertParent("course_modules", input.moduleId, user);
        return this.run(async () => {
            const result = await this.db.query(`INSERT INTO lessons (tenant_id, module_id, title, description, sequence, estimated_duration, created_by, updated_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
         RETURNING id, tenant_id, module_id, title, description, sequence, estimated_duration, status, created_at, updated_at`, [user.tenantId, input.moduleId, input.title.trim(), input.description?.trim() || null, input.sequence, input.estimatedDuration ?? null, user.id]);
            const row = result.rows[0];
            await this.auditMutation(request, "lesson", "CREATE", row);
            return row;
        });
    }
    async updateLesson(id, input, request) {
        const before = await this.getChild(id, "lessons", request.context.user);
        return this.run(async () => {
            const result = await this.db.query(`UPDATE lessons
         SET title = COALESCE($3, title), description = COALESCE($4, description), sequence = COALESCE($5, sequence),
             estimated_duration = COALESCE($6, estimated_duration), updated_by = $2, updated_at = now()
         WHERE id = $1 AND tenant_id = $7
         RETURNING id, tenant_id, module_id, title, description, sequence, estimated_duration, status, created_at, updated_at`, [id, request.context.user.id, input.title?.trim() || null, input.description?.trim() || null, input.sequence ?? null, input.estimatedDuration ?? null, request.context.user.tenantId]);
            if (!result.rows[0])
                throw new common_1.NotFoundException("Lesson not found.");
            await this.auditMutation(request, "lesson", "UPDATE", result.rows[0], before);
            return result.rows[0];
        });
    }
    async createLearningResource(input, request) {
        const user = request.context.user;
        this.validateResource(input.resourceType, input.url, input.filePath);
        await this.assertParent("lessons", input.lessonId, user);
        return this.run(async () => {
            const result = await this.db.query(`INSERT INTO learning_resources (tenant_id, lesson_id, resource_type, title, url, file_path, duration, sequence, created_by, updated_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9)
         RETURNING id, tenant_id, lesson_id, resource_type, title, url, file_path, duration, sequence, status, created_at, updated_at`, [user.tenantId, input.lessonId, input.resourceType, input.title.trim(), input.url?.trim() || null, input.filePath?.trim() || null, input.duration ?? null, input.sequence, user.id]);
            const row = result.rows[0];
            await this.auditMutation(request, "learning_resource", "CREATE", row);
            return row;
        });
    }
    async updateLearningResource(id, input, request) {
        const user = request.context.user;
        const before = await this.getChild(id, "learning_resources", user);
        const resourceType = (input.resourceType ?? String(before.resource_type ?? ""));
        this.validateResource(resourceType, input.url ?? before.url, input.filePath ?? before.file_path);
        return this.run(async () => {
            const result = await this.db.query(`UPDATE learning_resources
         SET resource_type = COALESCE($3, resource_type), title = COALESCE($4, title), url = COALESCE($5, url),
             file_path = COALESCE($6, file_path), duration = COALESCE($7, duration), sequence = COALESCE($8, sequence),
             updated_by = $2, updated_at = now()
         WHERE id = $1 AND tenant_id = $9
         RETURNING id, tenant_id, lesson_id, resource_type, title, url, file_path, duration, sequence, status, created_at, updated_at`, [id, user.id, input.resourceType ?? null, input.title?.trim() || null, input.url?.trim() || null, input.filePath?.trim() || null, input.duration ?? null, input.sequence ?? null, user.tenantId]);
            if (!result.rows[0])
                throw new common_1.NotFoundException("Learning resource not found.");
            await this.auditMutation(request, "learning_resource", "UPDATE", result.rows[0], before);
            return result.rows[0];
        });
    }
    async resourceFor(id, user) {
        const result = await this.db.query(`SELECT lr.*, p.institution_id, c.campus_id
       FROM learning_resources lr
       JOIN lessons l ON l.id = lr.lesson_id AND l.tenant_id = lr.tenant_id
       JOIN course_modules cm ON cm.id = l.module_id AND cm.tenant_id = lr.tenant_id
       JOIN courses c ON c.id = cm.course_id AND c.tenant_id = lr.tenant_id
       JOIN programmes p ON p.id = c.programme_id AND p.tenant_id = lr.tenant_id
       WHERE lr.id = $1 AND lr.tenant_id = $2`, [id, user.tenantId]);
        if (!result.rows[0])
            throw new common_1.NotFoundException("Learning resource not found.");
        (0, access_scope_1.assertScopeForRead)(user, String(result.rows[0].institution_id), result.rows[0].campus_id);
        return result.rows[0];
    }
    async uploadResourceFile(id, file, request) {
        const resource = await this.resourceFor(id, request.context.user);
        if (!["PDF", "DOCUMENT", "PRESENTATION"].includes(String(resource.resource_type))) {
            throw new common_1.BadRequestException("Only document resources can receive managed files.");
        }
        const stored = await this.storage.storeDocument(request.context.user.tenantId, id, file);
        return this.replaceManagedFile(resource, stored, "FILE", request);
    }
    async uploadScormPackage(id, file, request) {
        const resource = await this.resourceFor(id, request.context.user);
        if (resource.resource_type !== "SCORM")
            throw new common_1.BadRequestException("The resource must be a SCORM resource.");
        const stored = await this.storage.storeScormPackage(request.context.user.tenantId, id, file);
        return this.replaceManagedFile(resource, stored, "SCORM", request);
    }
    async replaceManagedFile(resource, stored, kind, request) {
        let previousStorageKey = null;
        let committed = false;
        try {
            const managed = await this.db.transaction(async (client) => {
                const previous = await client.query("SELECT storage_key FROM managed_files WHERE resource_id = $1 AND tenant_id = $2 FOR UPDATE", [resource.id, request.context.user.tenantId]);
                previousStorageKey = previous.rows[0]?.storage_key ?? null;
                const result = await client.query(`INSERT INTO managed_files
            (tenant_id, institution_id, campus_id, resource_id, kind, storage_key, original_filename, mime_type, byte_size, sha256, entrypoint, created_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           ON CONFLICT (resource_id) DO UPDATE SET
              tenant_id = EXCLUDED.tenant_id, institution_id = EXCLUDED.institution_id, campus_id = EXCLUDED.campus_id, kind = EXCLUDED.kind,
             storage_key = EXCLUDED.storage_key, original_filename = EXCLUDED.original_filename,
             mime_type = EXCLUDED.mime_type, byte_size = EXCLUDED.byte_size, sha256 = EXCLUDED.sha256,
             entrypoint = EXCLUDED.entrypoint, created_by = EXCLUDED.created_by, created_at = now()
             RETURNING id, tenant_id, institution_id, campus_id, resource_id, kind, storage_key, original_filename, mime_type, byte_size, sha256, entrypoint, created_at`, [
                    request.context.user.tenantId,
                    resource.institution_id,
                    resource.campus_id ?? null,
                    resource.id,
                    kind,
                    stored.storageKey,
                    stored.originalFilename,
                    stored.mimeType,
                    stored.byteSize,
                    stored.sha256,
                    stored.entrypoint ?? null,
                    request.context.user.id,
                ]);
                return result.rows[0];
            });
            committed = true;
            if (previousStorageKey && previousStorageKey !== stored.storageKey)
                await this.storage.remove(previousStorageKey);
            await this.audit.record({
                tenantId: request.context.user.tenantId,
                institutionId: resource.institution_id,
                actorUserId: request.context.user.id,
                requestId: request.context.requestId,
                module: "lms",
                resource: "learning_resource_file",
                resourceId: resource.id,
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
        }
        catch (error) {
            if (!committed)
                await this.storage.remove(stored.storageKey);
            throw error;
        }
    }
    async getManagedFile(id, request) {
        const resource = await this.resourceFor(id, request.context.user);
        const result = await this.db.query("SELECT * FROM managed_files WHERE resource_id = $1 AND tenant_id = $2 AND institution_id = $3 AND campus_id IS NOT DISTINCT FROM $4 AND kind = 'FILE'", [id, request.context.user.tenantId, resource.institution_id, resource.campus_id ?? null]);
        if (!result.rows[0])
            throw new common_1.NotFoundException("No managed file is attached to this resource.");
        const managed = result.rows[0];
        let content;
        try {
            content = await this.storage.read(String(managed.storage_key));
        }
        catch (error) {
            if (error.code === "ENOENT")
                throw new common_1.NotFoundException("The managed file is unavailable.");
            throw error;
        }
        await this.auditAccess(request, "learning_resource_file", "DOWNLOAD", resource, {
            managedFileId: managed.id,
            filename: managed.original_filename,
        });
        return { content, mimeType: managed.mime_type, filename: managed.original_filename };
    }
    async getScormLaunch(id, request) {
        const resource = await this.resourceFor(id, request.context.user);
        const result = await this.db.query("SELECT * FROM managed_files WHERE resource_id = $1 AND tenant_id = $2 AND institution_id = $3 AND campus_id IS NOT DISTINCT FROM $4 AND kind = 'SCORM'", [id, request.context.user.tenantId, resource.institution_id, resource.campus_id ?? null]);
        if (!result.rows[0])
            throw new common_1.NotFoundException("No SCORM package is attached to this resource.");
        await this.auditAccess(request, "learning_resource_scorm", "LAUNCH", resource, {
            managedFileId: result.rows[0].id,
            entrypoint: result.rows[0].entrypoint,
        });
        return { launchUrl: `/api/v1/learning-resources/${id}/scorm/${encodeURI(String(result.rows[0].entrypoint))}` };
    }
    async getScormAsset(id, assetPath, request) {
        const resource = await this.resourceFor(id, request.context.user);
        const result = await this.db.query("SELECT * FROM managed_files WHERE resource_id = $1 AND tenant_id = $2 AND institution_id = $3 AND campus_id IS NOT DISTINCT FROM $4 AND kind = 'SCORM'", [id, request.context.user.tenantId, resource.institution_id, resource.campus_id ?? null]);
        if (!result.rows[0])
            throw new common_1.NotFoundException("No SCORM package is attached to this resource.");
        let content;
        try {
            content = await this.storage.readScormAsset(String(result.rows[0].storage_key), assetPath);
        }
        catch (error) {
            if (error.code === "ENOENT")
                throw new common_1.NotFoundException("The SCORM asset is unavailable.");
            throw error;
        }
        await this.auditAccess(request, "learning_resource_scorm", "ASSET_ACCESS", resource, {
            managedFileId: result.rows[0].id,
            assetPath,
        });
        return { content, mimeType: (0, resource_storage_service_1.mimeTypeForFilename)(assetPath) };
    }
    async assertParent(table, id, user) {
        const scope = await this.contentScope(id, table, user);
        const result = await this.db.query(`SELECT id FROM ${table} WHERE id = $1 AND tenant_id = $2 AND status <> 'ARCHIVED'`, [id, user.tenantId]);
        if (!result.rows[0])
            throw new common_1.NotFoundException("Parent LMS content not found in the current tenant.");
        (0, access_scope_1.assertScope)(user, scope.institution_id, scope.campus_id);
    }
    async contentScope(id, table, user) {
        const query = table === "programmes"
            ? "SELECT institution_id, campus_id FROM programmes WHERE id = $1 AND tenant_id = $2"
            : table === "courses"
                ? "SELECT institution_id, campus_id FROM courses WHERE id = $1 AND tenant_id = $2"
                : table === "course_modules"
                    ? `SELECT p.institution_id, c.campus_id
             FROM course_modules x
             JOIN courses c ON c.id = x.course_id AND c.tenant_id = x.tenant_id
             JOIN programmes p ON p.id = c.programme_id AND p.tenant_id = x.tenant_id
             WHERE x.id = $1 AND x.tenant_id = $2`
                    : table === "lessons"
                        ? `SELECT p.institution_id, c.campus_id
               FROM lessons x
               JOIN course_modules cm ON cm.id = x.module_id AND cm.tenant_id = x.tenant_id
               JOIN courses c ON c.id = cm.course_id AND c.tenant_id = x.tenant_id
               JOIN programmes p ON p.id = c.programme_id AND p.tenant_id = x.tenant_id
               WHERE x.id = $1 AND x.tenant_id = $2`
                        : `SELECT p.institution_id, c.campus_id
               FROM learning_resources x
               JOIN lessons l ON l.id = x.lesson_id AND l.tenant_id = x.tenant_id
               JOIN course_modules cm ON cm.id = l.module_id AND cm.tenant_id = x.tenant_id
               JOIN courses c ON c.id = cm.course_id AND c.tenant_id = x.tenant_id
               JOIN programmes p ON p.id = c.programme_id AND p.tenant_id = x.tenant_id
               WHERE x.id = $1 AND x.tenant_id = $2`;
        const result = await this.db.query(query, [id, user.tenantId]);
        if (!result.rows[0])
            throw new common_1.NotFoundException("LMS content not found.");
        return result.rows[0];
    }
    async createChild(table, resource, parentId, title, description, sequence, user, request) {
        return this.run(async () => {
            const result = await this.db.query(`INSERT INTO ${table} (tenant_id, course_id, title, description, sequence, created_by, updated_by)
         VALUES ($1, $2, $3, $4, $5, $6, $6)
         RETURNING id, tenant_id, course_id, title, description, sequence, status, created_at, updated_at`, [user.tenantId, parentId, title.trim(), description?.trim() || null, sequence, user.id]);
            const row = result.rows[0];
            await this.auditMutation(request, resource, "CREATE", row);
            return row;
        });
    }
    async updateChild(table, resource, id, input, request, before, _fields) {
        return this.run(async () => {
            const result = await this.db.query(`UPDATE ${table}
         SET title = COALESCE($3, title), description = COALESCE($4, description), sequence = COALESCE($5, sequence),
             updated_by = $2, updated_at = now()
         WHERE id = $1 AND tenant_id = $6
         RETURNING id, tenant_id, course_id, title, description, sequence, status, created_at, updated_at`, [id, request.context.user.id, input.title?.trim() || null, input.description?.trim() || null, input.sequence ?? null, request.context.user.tenantId]);
            if (!result.rows[0])
                throw new common_1.NotFoundException("Course module not found.");
            await this.auditMutation(request, resource, "UPDATE", result.rows[0], before);
            return result.rows[0];
        });
    }
    validateResource(resourceType, url, filePath) {
        if (RESOURCE_TYPES_WITH_URL.includes(resourceType) && !url) {
            throw new common_1.BadRequestException(`${resourceType} resources require a URL.`);
        }
        if (RESOURCE_TYPES_WITH_FILE_OR_URL.includes(resourceType) && !url && !filePath)
            return;
    }
    async assertInstitutionAccess(user, institutionId, campusId) {
        (0, access_scope_1.assertScope)(user, institutionId, campusId);
        if ((0, access_scope_1.isPlatformUser)(user))
            return;
        const result = await this.db.query(`SELECT 1
       FROM user_roles ur
       JOIN roles r ON r.id = ur.role_id AND r.tenant_id = ur.tenant_id
        WHERE ur.user_id = $1 AND ur.tenant_id = $2 AND ur.institution_id = $3
          AND (ur.campus_id IS NULL OR $4::uuid IS NULL OR ur.campus_id = $4)
         AND r.status = 'ACTIVE'
         AND r.code IN ('INSTITUTION_ADMINISTRATOR', 'PRINCIPAL_DIRECTOR', 'ACADEMIC_ADMINISTRATOR')
       LIMIT 1`, [user.id, user.tenantId, institutionId, campusId ?? null]);
        if (!result.rows[0])
            throw new common_1.ForbiddenException("You are not authorized for this institution.");
    }
    async relationshipCourse(courseId, user, allowAssignedTeacher = false) {
        const result = await this.db.query(`SELECT c.id, c.tenant_id, c.institution_id, c.campus_id, c.title, c.code, c.status,
              p.status AS programme_status, i.status AS institution_status
       FROM courses c
       JOIN programmes p ON p.id = c.programme_id AND p.tenant_id = c.tenant_id
       JOIN institutions i ON i.id = p.institution_id AND i.tenant_id = c.tenant_id
       WHERE c.id = $1 AND c.tenant_id = $2`, [courseId, user.tenantId]);
        const course = result.rows[0];
        if (!course)
            throw new common_1.NotFoundException("Course not found in the current tenant.");
        if (allowAssignedTeacher && await this.hasAssignmentStaffAccess(user, String(course.institution_id), String(course.id), course.campus_id)) {
            // Assigned teachers may read the roster for their own course.
        }
        else {
            await this.assertInstitutionAccess(user, String(course.institution_id), course.campus_id);
        }
        if (course.status !== "PUBLISHED")
            throw new common_1.BadRequestException("Enrollments and instructor assignments require a published course.");
        if (course.programme_status === "ARCHIVED" || course.institution_status !== "ACTIVE") {
            throw new common_1.BadRequestException("The course institution or programme is not active.");
        }
        return course;
    }
    relationshipStatus(status) {
        if (status && !["ACTIVE", "REMOVED"].includes(status)) {
            throw new common_1.BadRequestException("Invalid relationship status.");
        }
        return status || "ACTIVE";
    }
    async eligiblePerson(user, institutionId, campusId, personId, roleCode) {
        const result = await this.db.query(`SELECT u.id, u.tenant_id, u.first_name, u.last_name, u.email, u.mobile
       FROM users u
       JOIN user_roles ur ON ur.user_id = u.id AND ur.tenant_id = u.tenant_id
       JOIN roles r ON r.id = ur.role_id AND r.tenant_id = ur.tenant_id
       WHERE u.id = $1 AND u.tenant_id = $2 AND u.status = 'ACTIVE'
          AND ur.institution_id = $3
          AND (ur.campus_id IS NULL OR $4::uuid IS NULL OR ur.campus_id = $4)
          AND r.code = $5 AND r.status = 'ACTIVE'
       LIMIT 1`, [personId, user.tenantId, institutionId, campusId, roleCode]);
        if (!result.rows[0]) {
            throw new common_1.NotFoundException(roleCode === "STUDENT"
                ? "The learner was not found as an active Student in this institution."
                : "The instructor was not found as an active Teacher in this institution.");
        }
        return result.rows[0];
    }
    async listCandidates(courseId, user, page, pageSize, offset, query, roleCode) {
        const course = await this.relationshipCourse(courseId, user);
        const relationshipTable = roleCode === "STUDENT" ? "lms_enrollments" : "lms_instructor_assignments";
        const relationshipColumn = roleCode === "STUDENT" ? "learner_id" : "instructor_id";
        const search = query.search?.trim() || "";
        const searchClause = search
            ? " AND (u.first_name ILIKE $6 OR u.last_name ILIKE $6 OR concat_ws(' ', u.first_name, u.last_name) ILIKE $6 OR COALESCE(u.email, '') ILIKE $6)"
            : "";
        const values = [user.tenantId, course.institution_id, course.id, roleCode, course.campus_id ?? null];
        if (search)
            values.push(`%${search}%`);
        const limitParam = values.length + 1;
        const offsetParam = values.length + 2;
        const [rows, total] = await Promise.all([
            this.db.query(`SELECT u.id, u.first_name, u.last_name, u.email, u.mobile
         FROM users u
         JOIN user_roles ur ON ur.user_id = u.id AND ur.tenant_id = u.tenant_id
         JOIN roles r ON r.id = ur.role_id AND r.tenant_id = ur.tenant_id
         WHERE u.tenant_id = $1 AND u.status = 'ACTIVE'
            AND ur.institution_id = $2 AND (ur.campus_id IS NULL OR $5::uuid IS NULL OR ur.campus_id = $5)
            AND r.code = $4 AND r.status = 'ACTIVE'
           AND NOT EXISTS (
             SELECT 1 FROM ${relationshipTable} x
              WHERE x.tenant_id = $1 AND x.institution_id = $2 AND x.course_id = $3
                AND x.campus_id IS NOT DISTINCT FROM $5
               AND x.${relationshipColumn} = u.id AND x.status = 'ACTIVE'
           )${searchClause}
         ORDER BY u.first_name ASC, u.last_name ASC, u.id ASC
         LIMIT $${limitParam} OFFSET $${offsetParam}`, [...values, pageSize, offset]),
            this.db.query(`SELECT count(DISTINCT u.id)::text AS count
         FROM users u
         JOIN user_roles ur ON ur.user_id = u.id AND ur.tenant_id = u.tenant_id
         JOIN roles r ON r.id = ur.role_id AND r.tenant_id = ur.tenant_id
         WHERE u.tenant_id = $1 AND u.status = 'ACTIVE'
            AND ur.institution_id = $2 AND (ur.campus_id IS NULL OR $5::uuid IS NULL OR ur.campus_id = $5)
            AND r.code = $4 AND r.status = 'ACTIVE'
           AND NOT EXISTS (
             SELECT 1 FROM ${relationshipTable} x
              WHERE x.tenant_id = $1 AND x.institution_id = $2 AND x.course_id = $3
                AND x.campus_id IS NOT DISTINCT FROM $5
               AND x.${relationshipColumn} = u.id AND x.status = 'ACTIVE'
           )${searchClause}`, values),
        ]);
        return { data: rows.rows, meta: (0, pagination_1.paginationMeta)(page, pageSize, Number(total.rows[0]?.count ?? 0)) };
    }
    async listEnrollmentCandidates(courseId, user, page, pageSize, offset, query) {
        return this.listCandidates(courseId, user, page, pageSize, offset, query, "STUDENT");
    }
    async listInstructorCandidates(courseId, user, page, pageSize, offset, query) {
        return this.listCandidates(courseId, user, page, pageSize, offset, query, "TEACHER");
    }
    async listRelationships(courseId, user, page, pageSize, offset, query, kind) {
        const course = await this.relationshipCourse(courseId, user, kind === "enrollment");
        const table = kind === "enrollment" ? "lms_enrollments" : "lms_instructor_assignments";
        const personColumn = kind === "enrollment" ? "learner_id" : "instructor_id";
        const personAlias = kind === "enrollment" ? "learner" : "instructor";
        const dateColumn = kind === "enrollment" ? "enrolled_at" : "assigned_at";
        const status = this.relationshipStatus(query.status);
        const values = [user.tenantId, course.institution_id, course.id, status, course.campus_id ?? null];
        const select = `x.id, x.tenant_id, x.institution_id, x.campus_id, x.course_id, x.${personColumn}, x.status,
                    x.${dateColumn}, x.removed_at, ${personAlias}.first_name AS ${personAlias}_first_name,
                    ${personAlias}.last_name AS ${personAlias}_last_name, ${personAlias}.email AS ${personAlias}_email`;
        const [rows, total] = await Promise.all([
            this.db.query(`SELECT ${select}
         FROM ${table} x JOIN users ${personAlias} ON ${personAlias}.id = x.${personColumn} AND ${personAlias}.tenant_id = x.tenant_id
          WHERE x.tenant_id = $1 AND x.institution_id = $2 AND x.course_id = $3 AND x.status = $4
            AND x.campus_id IS NOT DISTINCT FROM $5
           ORDER BY x.${dateColumn} DESC, x.id DESC LIMIT $6 OFFSET $7`, [...values, pageSize, offset]),
            this.db.query(`SELECT count(*)::text AS count FROM ${table} x
          WHERE x.tenant_id = $1 AND x.institution_id = $2 AND x.course_id = $3 AND x.status = $4
            AND x.campus_id IS NOT DISTINCT FROM $5`, values),
        ]);
        return { data: rows.rows, meta: (0, pagination_1.paginationMeta)(page, pageSize, Number(total.rows[0]?.count ?? 0)) };
    }
    async listEnrollments(courseId, user, page, pageSize, offset, query) {
        return this.listRelationships(courseId, user, page, pageSize, offset, query, "enrollment");
    }
    async listInstructorAssignments(courseId, user, page, pageSize, offset, query) {
        return this.listRelationships(courseId, user, page, pageSize, offset, query, "instructor_assignment");
    }
    async runRelationship(work) {
        try {
            return await work();
        }
        catch (error) {
            if (error.code === "23505") {
                throw new common_1.ConflictException("This person already has an active relationship with the course.");
            }
            if (error.code === "23514") {
                throw new common_1.BadRequestException("The relationship status is invalid.");
            }
            throw error;
        }
    }
    async enrollLearner(courseId, input, request) {
        const user = request.context.user;
        const course = await this.relationshipCourse(courseId, user);
        await this.eligiblePerson(user, String(course.institution_id), course.campus_id, input.learnerId, "STUDENT");
        return this.runRelationship(async () => {
            const result = await this.db.query(`INSERT INTO lms_enrollments (tenant_id, institution_id, campus_id, course_id, learner_id, enrolled_by)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id, tenant_id, institution_id, campus_id, course_id, learner_id, status, enrolled_by, enrolled_at, removed_at, created_at, updated_at`, [user.tenantId, course.institution_id, course.campus_id ?? null, course.id, input.learnerId, user.id]);
            const row = result.rows[0];
            await this.auditMutation(request, "enrollment", "CREATE", row);
            return row;
        });
    }
    async assignInstructor(courseId, input, request) {
        const user = request.context.user;
        const course = await this.relationshipCourse(courseId, user);
        await this.eligiblePerson(user, String(course.institution_id), course.campus_id, input.instructorId, "TEACHER");
        return this.runRelationship(async () => {
            const result = await this.db.query(`INSERT INTO lms_instructor_assignments (tenant_id, institution_id, campus_id, course_id, instructor_id, assigned_by)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id, tenant_id, institution_id, campus_id, course_id, instructor_id, status, assigned_by, assigned_at, removed_at, created_at, updated_at`, [user.tenantId, course.institution_id, course.campus_id ?? null, course.id, input.instructorId, user.id]);
            const row = result.rows[0];
            await this.auditMutation(request, "instructor_assignment", "CREATE", row);
            return row;
        });
    }
    async removeRelationship(courseId, relationshipId, request, kind) {
        const user = request.context.user;
        const course = await this.relationshipCourse(courseId, user);
        const table = kind === "enrollment" ? "lms_enrollments" : "lms_instructor_assignments";
        const result = await this.db.query(`SELECT * FROM ${table}
       WHERE id = $1 AND tenant_id = $2 AND institution_id = $3 AND course_id = $4
         AND campus_id IS NOT DISTINCT FROM $5`, [relationshipId, user.tenantId, course.institution_id, course.id, course.campus_id ?? null]);
        const before = result.rows[0];
        if (!before)
            throw new common_1.NotFoundException("Course relationship not found.");
        if (before.status !== "ACTIVE")
            throw new common_1.ConflictException("This course relationship has already been removed.");
        return this.runRelationship(async () => {
            const removed = await this.db.query(`UPDATE ${table}
         SET status = 'REMOVED', removed_by = $2, removed_at = now(), updated_at = now()
          WHERE id = $1 AND tenant_id = $3 AND institution_id = $4 AND course_id = $5
            AND campus_id IS NOT DISTINCT FROM $6 AND status = 'ACTIVE'
         RETURNING *`, [relationshipId, user.id, user.tenantId, course.institution_id, course.id, course.campus_id ?? null]);
            if (!removed.rows[0])
                throw new common_1.ConflictException("This course relationship has already been removed.");
            await this.auditMutation(request, kind, "REMOVE", removed.rows[0], before);
            return removed.rows[0];
        });
    }
    async removeEnrollment(courseId, enrollmentId, request) {
        return this.removeRelationship(courseId, enrollmentId, request, "enrollment");
    }
    async removeInstructorAssignment(courseId, assignmentId, request) {
        return this.removeRelationship(courseId, assignmentId, request, "instructor_assignment");
    }
    async progressCourse(courseId, user) {
        const result = await this.db.query(`SELECT c.id, c.tenant_id, c.institution_id, c.campus_id, c.title, c.code, c.description, c.status,
              p.name AS programme_name, p.status AS programme_status, i.status AS institution_status
       FROM courses c
       JOIN programmes p ON p.id = c.programme_id AND p.tenant_id = c.tenant_id
       JOIN institutions i ON i.id = p.institution_id AND i.tenant_id = c.tenant_id
       WHERE c.id = $1 AND c.tenant_id = $2`, [courseId, user.tenantId]);
        const course = result.rows[0];
        if (!course)
            throw new common_1.NotFoundException("Course not found in the current tenant.");
        (0, access_scope_1.assertScopeForRead)(user, String(course.institution_id), course.campus_id);
        if (course.status !== "PUBLISHED")
            throw new common_1.BadRequestException("Progress is available only for published courses.");
        if (course.programme_status === "ARCHIVED" || course.institution_status !== "ACTIVE") {
            throw new common_1.BadRequestException("The course institution or programme is not active.");
        }
        return course;
    }
    async activeEnrollment(courseId, learnerId, user) {
        const result = await this.db.query(`SELECT id, tenant_id, institution_id, course_id, learner_id, status, enrolled_at
       FROM lms_enrollments
       WHERE tenant_id = $1 AND course_id = $2 AND learner_id = $3 AND status = 'ACTIVE'`, [user.tenantId, courseId, learnerId]);
        if (!result.rows[0])
            throw new common_1.ForbiddenException("An active course enrollment is required.");
        return result.rows[0];
    }
    async assertProgressViewer(course, user, learnerId) {
        const selfEnrollment = await this.db.query(`SELECT 1
       FROM lms_enrollments
        WHERE tenant_id = $1 AND institution_id = $2 AND course_id = $3 AND learner_id = $4
          AND campus_id IS NOT DISTINCT FROM $5 AND status = 'ACTIVE'
       LIMIT 1`, [user.tenantId, course.institution_id, course.id, learnerId, course.campus_id ?? null]);
        if (!selfEnrollment.rows[0])
            throw new common_1.NotFoundException("Active learner enrollment not found.");
        if (learnerId === user.id)
            return;
        if ((0, access_scope_1.isPlatformUser)(user))
            return;
        const staffAccess = await this.db.query(`SELECT 1
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
               SELECT 1
               FROM lms_instructor_assignments ia
                WHERE ia.tenant_id = $2 AND ia.institution_id = $3 AND ia.course_id = $4
                  AND ia.campus_id IS NOT DISTINCT FROM $5
                 AND ia.instructor_id = ur.user_id AND ia.status = 'ACTIVE'
             )
           )
         )
       LIMIT 1`, [user.id, user.tenantId, course.institution_id, course.id, course.campus_id ?? null]);
        if (!staffAccess.rows[0])
            throw new common_1.ForbiddenException("You are not authorized to view this learner's progress.");
    }
    async calculateCourseProgress(course, learnerId, user) {
        const result = await this.db.query(`SELECT cm.id AS module_id, cm.title AS module_title, cm.sequence,
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
                  )) AS assessment_completed,
               (SELECT COALESCE(json_agg(
                 json_build_object(
                   'id', l.id,
                   'title', l.title,
                   'description', l.description,
                   'sequence', l.sequence,
                   'estimatedDuration', l.estimated_duration
                 ) ORDER BY l.sequence ASC, l.id ASC
               ), '[]'::json)
                FROM lessons l
                WHERE l.tenant_id = $2 AND l.module_id = cm.id AND l.status = 'PUBLISHED') AS lesson_items
       FROM course_modules cm
       WHERE cm.tenant_id = $2 AND cm.course_id = $1 AND cm.status = 'PUBLISHED'
       ORDER BY cm.sequence ASC, cm.id ASC`, [course.id, user.tenantId, learnerId]);
        const modules = result.rows.map((row) => {
            const lessonTotal = Number(row.lesson_total ?? 0);
            const lessonCompleted = Number(row.lesson_completed ?? 0);
            const assessmentTotal = Number(row.assessment_total ?? 0);
            const assessmentCompleted = Number(row.assessment_completed ?? 0);
            const total = lessonTotal + assessmentTotal;
            const completed = lessonCompleted + assessmentCompleted;
            const lessonItems = Array.isArray(row.lesson_items)
                ? row.lesson_items.map((item) => {
                    const lesson = item;
                    return {
                        id: String(lesson.id),
                        title: String(lesson.title),
                        description: lesson.description,
                        sequence: Number(lesson.sequence),
                        estimatedDuration: lesson.estimatedDuration == null ? null : Number(lesson.estimatedDuration),
                    };
                })
                : [];
            return {
                id: row.module_id,
                title: row.module_title,
                sequence: Number(row.sequence),
                state: progressState(completed, total),
                percentage: progressPercentage(completed, total),
                lessons: { completed: lessonCompleted, total: lessonTotal },
                assessments: { completed: assessmentCompleted, total: assessmentTotal },
                lessonItems,
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
                programme_name: course.programme_name,
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
    async listLearnerProgress(user) {
        const result = await this.db.query(`SELECT course_id
       FROM lms_enrollments
       WHERE tenant_id = $1 AND learner_id = $2 AND status = 'ACTIVE'
       ORDER BY enrolled_at DESC, course_id ASC`, [user.tenantId, user.id]);
        return Promise.all(result.rows.map(({ course_id }) => this.getCourseProgress(course_id, user)));
    }
    async getCourseProgress(courseId, user, learnerId = user.id) {
        const course = await this.progressCourse(courseId, user);
        await this.assertProgressViewer(course, user, learnerId);
        return this.calculateCourseProgress(course, learnerId, user);
    }
    async completeLesson(lessonId, request) {
        const user = request.context.user;
        const result = await this.db.query(`SELECT l.id, l.tenant_id, l.module_id, cm.course_id, c.institution_id, c.campus_id,
              l.status AS lesson_status, cm.status AS module_status, c.status AS course_status,
              p.status AS programme_status, i.status AS institution_status
       FROM lessons l
       JOIN course_modules cm ON cm.id = l.module_id AND cm.tenant_id = l.tenant_id
       JOIN courses c ON c.id = cm.course_id AND c.tenant_id = l.tenant_id
       JOIN programmes p ON p.id = c.programme_id AND p.tenant_id = l.tenant_id
       JOIN institutions i ON i.id = p.institution_id AND i.tenant_id = l.tenant_id
       WHERE l.id = $1 AND l.tenant_id = $2`, [lessonId, user.tenantId]);
        const lesson = result.rows[0];
        if (!lesson)
            throw new common_1.NotFoundException("Lesson not found in the current tenant.");
        (0, access_scope_1.assertScope)(user, String(lesson.institution_id), lesson.campus_id);
        if (lesson.course_status !== "PUBLISHED" || lesson.module_status !== "PUBLISHED" || lesson.lesson_status !== "PUBLISHED") {
            throw new common_1.BadRequestException("Only published lessons in published courses can be completed.");
        }
        if (lesson.programme_status === "ARCHIVED" || lesson.institution_status !== "ACTIVE") {
            throw new common_1.BadRequestException("The course institution or programme is not active.");
        }
        await this.activeEnrollment(String(lesson.course_id), user.id, user);
        const beforeResult = await this.db.query(`SELECT * FROM lms_lesson_progress
       WHERE tenant_id = $1 AND course_id = $2 AND lesson_id = $3 AND learner_id = $4`, [user.tenantId, lesson.course_id, lesson.id, user.id]);
        const before = beforeResult.rows[0];
        const completed = await this.db.query(`INSERT INTO lms_lesson_progress
          (tenant_id, institution_id, campus_id, course_id, module_id, lesson_id, learner_id, status, started_at, completed_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'COMPLETED', now(), now())
       ON CONFLICT (tenant_id, course_id, lesson_id, learner_id)
       DO UPDATE SET status = 'COMPLETED', completed_at = COALESCE(lms_lesson_progress.completed_at, now()), updated_at = now()
       RETURNING *`, [user.tenantId, lesson.institution_id, lesson.campus_id ?? null, lesson.course_id, lesson.module_id, lesson.id, user.id]);
        const row = completed.rows[0];
        if (before?.status !== "COMPLETED")
            await this.auditMutation(request, "lesson_progress", "COMPLETE", row, before);
        await this.certificates?.issueIfEligible(user.tenantId, String(lesson.course_id), user.id, request);
        return row;
    }
    async assignmentCourse(courseId, user) {
        const result = await this.db.query(`SELECT c.id, c.tenant_id, c.institution_id, c.campus_id, c.title, c.code, c.status,
              p.status AS programme_status, i.status AS institution_status
       FROM courses c
       JOIN programmes p ON p.id = c.programme_id AND p.tenant_id = c.tenant_id
       JOIN institutions i ON i.id = p.institution_id AND i.tenant_id = c.tenant_id
       WHERE c.id = $1 AND c.tenant_id = $2`, [courseId, user.tenantId]);
        const course = result.rows[0];
        if (!course)
            throw new common_1.NotFoundException("Course not found in the current tenant.");
        (0, access_scope_1.assertScopeForRead)(user, String(course.institution_id), course.campus_id);
        if (course.programme_status === "ARCHIVED" || course.institution_status !== "ACTIVE" || course.status === "ARCHIVED") {
            throw new common_1.BadRequestException("The course institution, programme, or course is not active.");
        }
        return course;
    }
    async hasAssignmentStaffAccess(user, institutionId, courseId, campusId) {
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
               SELECT 1
               FROM lms_instructor_assignments ia
                WHERE ia.tenant_id = $2 AND ia.institution_id = $3 AND ia.course_id = $4
                  AND ia.campus_id IS NOT DISTINCT FROM $5
                 AND ia.instructor_id = ur.user_id AND ia.status = 'ACTIVE'
             )
           )
         )
       LIMIT 1`, [user.id, user.tenantId, institutionId, courseId, campusId ?? null]);
        return Boolean(result.rows[0]);
    }
    async assertAssignmentStaffAccess(user, institutionId, courseId, campusId) {
        if (!await this.hasAssignmentStaffAccess(user, institutionId, courseId, campusId)) {
            throw new common_1.ForbiddenException("You are not authorized to manage assignments for this course.");
        }
    }
    async assignmentModule(moduleId, courseId, user) {
        const result = await this.db.query(`SELECT cm.id, cm.tenant_id, cm.course_id, cm.title, cm.status
       FROM course_modules cm
       WHERE cm.id = $1 AND cm.course_id = $2 AND cm.tenant_id = $3`, [moduleId, courseId, user.tenantId]);
        const module = result.rows[0];
        if (!module || module.status === "ARCHIVED")
            throw new common_1.NotFoundException("Course module not found in the current tenant.");
        return module;
    }
    async assignmentFor(id, user) {
        const result = await this.db.query(`SELECT a.*, c.institution_id, c.campus_id, c.title AS course_title, c.status AS course_status,
              cm.title AS module_title, cm.status AS module_status,
              p.status AS programme_status, i.status AS institution_status
       FROM lms_assessments a
       JOIN courses c ON c.id = a.course_id AND c.tenant_id = a.tenant_id
       JOIN course_modules cm ON cm.id = a.module_id AND cm.course_id = a.course_id AND cm.tenant_id = a.tenant_id
       JOIN programmes p ON p.id = c.programme_id AND p.tenant_id = a.tenant_id
       JOIN institutions i ON i.id = p.institution_id AND i.tenant_id = a.tenant_id
       WHERE a.id = $1 AND a.tenant_id = $2 AND a.assessment_type = 'ASSIGNMENT'`, [id, user.tenantId]);
        const assignment = result.rows[0];
        if (!assignment)
            throw new common_1.NotFoundException("Assignment not found in the current tenant.");
        (0, access_scope_1.assertScopeForRead)(user, String(assignment.institution_id), assignment.campus_id);
        return assignment;
    }
    async assertAssignmentViewer(assignment, user) {
        if (await this.hasAssignmentStaffAccess(user, String(assignment.institution_id), String(assignment.course_id), assignment.campus_id))
            return;
        if (assignment.status !== "PUBLISHED"
            || assignment.course_status !== "PUBLISHED"
            || assignment.module_status !== "PUBLISHED"
            || assignment.programme_status === "ARCHIVED"
            || assignment.institution_status !== "ACTIVE") {
            throw new common_1.NotFoundException("Assignment not found.");
        }
        await this.activeEnrollment(String(assignment.course_id), user.id, user);
    }
    async listAssignments(user, page, pageSize, offset, query) {
        const filter = this.statusFilter(query.status);
        const values = [user.tenantId];
        const clauses = ["a.tenant_id = $1", "a.assessment_type = 'ASSIGNMENT'"];
        if (query.courseId) {
            const course = await this.assignmentCourse(query.courseId, user);
            const staff = await this.hasAssignmentStaffAccess(user, String(course.institution_id), String(course.id), course.campus_id);
            if (!staff) {
                await this.activeEnrollment(String(course.id), user.id, user);
                clauses.push("a.status = 'PUBLISHED'", "c.status = 'PUBLISHED'", "cm.status = 'PUBLISHED'", "p.status = 'PUBLISHED'", "i.status = 'ACTIVE'");
            }
            values.push(query.courseId);
            clauses.push(`a.course_id = $${values.length}`);
            if (!staff)
                clauses.push("a.status = 'PUBLISHED'");
        }
        else {
            if (!user.roles.some((role) => role.code === "STUDENT")) {
                throw new common_1.BadRequestException("courseId is required when listing assignments as staff.");
            }
            const enrolled = await this.db.query(`SELECT course_id FROM lms_enrollments WHERE tenant_id = $1 AND learner_id = $2 AND status = 'ACTIVE'`, [user.tenantId, user.id]);
            if (!enrolled.rows.length)
                return { data: [], meta: (0, pagination_1.paginationMeta)(page, pageSize, 0) };
            values.push(enrolled.rows.map((row) => row.course_id));
            clauses.push(`a.course_id = ANY($${values.length}::uuid[])`);
            clauses.push("a.status = 'PUBLISHED'", "c.status = 'PUBLISHED'", "cm.status = 'PUBLISHED'", "p.status = 'PUBLISHED'", "i.status = 'ACTIVE'");
        }
        if (filter.values.length) {
            values.push(filter.values[0]);
            clauses.push(`a.status = $${values.length}`);
        }
        const pageParam = values.length + 1;
        const [rows, total] = await Promise.all([
            this.db.query(`SELECT a.id, a.tenant_id, a.institution_id, a.campus_id, a.course_id, a.module_id, a.title,
                a.description, a.instructions, a.due_at, a.total_marks AS max_marks, a.status,
                a.created_at, a.updated_at, c.title AS course_title, cm.title AS module_title
         FROM lms_assessments a
         JOIN courses c ON c.id = a.course_id AND c.tenant_id = a.tenant_id
         JOIN course_modules cm ON cm.id = a.module_id AND cm.course_id = a.course_id AND cm.tenant_id = a.tenant_id
         JOIN programmes p ON p.id = c.programme_id AND p.tenant_id = a.tenant_id
         JOIN institutions i ON i.id = p.institution_id AND i.tenant_id = a.tenant_id
         WHERE ${clauses.join(" AND ")}
         ORDER BY a.due_at ASC NULLS LAST, a.created_at DESC, a.id ASC
         LIMIT $${pageParam} OFFSET $${pageParam + 1}`, [...values, pageSize, offset]),
            this.db.query(`SELECT count(*)::text AS count
          FROM lms_assessments a
          JOIN courses c ON c.id = a.course_id AND c.tenant_id = a.tenant_id
          JOIN course_modules cm ON cm.id = a.module_id AND cm.course_id = a.course_id AND cm.tenant_id = a.tenant_id
          JOIN programmes p ON p.id = c.programme_id AND p.tenant_id = a.tenant_id
          JOIN institutions i ON i.id = p.institution_id AND i.tenant_id = a.tenant_id
          WHERE ${clauses.join(" AND ")}`, values),
        ]);
        const visible = (0, access_scope_1.filterScopedRows)(user, rows.rows);
        return { data: visible, meta: (0, pagination_1.paginationMeta)(page, pageSize, visible.length) };
    }
    async getAssignment(id, user) {
        const assignment = await this.assignmentFor(id, user);
        await this.assertAssignmentViewer(assignment, user);
        return assignment;
    }
    async createAssignment(input, request) {
        const user = request.context.user;
        const course = await this.assignmentCourse(input.courseId, user);
        await this.assertAssignmentStaffAccess(user, String(course.institution_id), String(course.id), course.campus_id);
        const module = await this.assignmentModule(input.moduleId, input.courseId, user);
        return this.run(async () => {
            const result = await this.db.query(`INSERT INTO lms_assessments
           (tenant_id, institution_id, campus_id, course_id, module_id, title, description, instructions, due_at, total_marks, assessment_type, attempt_limit)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'ASSIGNMENT', 1)
         RETURNING id, tenant_id, institution_id, campus_id, course_id, module_id, title, description, instructions,
                   due_at, total_marks AS max_marks, assessment_type, status, created_at, updated_at`, [
                user.tenantId,
                course.institution_id,
                course.campus_id ?? null,
                course.id,
                module.id,
                input.title.trim(),
                input.description?.trim() || null,
                input.instructions.trim(),
                input.dueAt ?? null,
                input.maxMarks,
            ]);
            const row = result.rows[0];
            await this.auditMutation(request, "assignment", "CREATE", row);
            return row;
        });
    }
    async updateAssignment(id, input, request) {
        const user = request.context.user;
        const before = await this.assignmentFor(id, user);
        await this.assertAssignmentStaffAccess(user, String(before.institution_id), String(before.course_id), before.campus_id);
        if (before.status === "ARCHIVED")
            throw new common_1.ConflictException("Archived assignments cannot be edited.");
        return this.run(async () => {
            const result = await this.db.query(`UPDATE lms_assessments
         SET title = COALESCE($3, title), description = COALESCE($4, description),
             instructions = COALESCE($5, instructions), due_at = COALESCE($6::timestamptz, due_at),
             total_marks = COALESCE($7, total_marks), updated_at = now()
         WHERE id = $1 AND tenant_id = $2 AND assessment_type = 'ASSIGNMENT'
         RETURNING id, tenant_id, institution_id, course_id, module_id, title, description, instructions,
                   due_at, total_marks AS max_marks, assessment_type, status, created_at, updated_at`, [
                id,
                user.tenantId,
                input.title?.trim() || null,
                input.description?.trim() || null,
                input.instructions?.trim() || null,
                input.dueAt ?? null,
                input.maxMarks ?? null,
            ]);
            if (!result.rows[0])
                throw new common_1.NotFoundException("Assignment not found.");
            const row = result.rows[0];
            await this.auditMutation(request, "assignment", "UPDATE", row, before);
            return row;
        });
    }
    async changeAssignmentStatus(id, status, request) {
        const user = request.context.user;
        const before = await this.assignmentFor(id, user);
        await this.assertAssignmentStaffAccess(user, String(before.institution_id), String(before.course_id), before.campus_id);
        if (status === "PUBLISHED" && (before.course_status !== "PUBLISHED" || before.module_status !== "PUBLISHED")) {
            throw new common_1.BadRequestException("Assignments can be published only inside published courses and modules.");
        }
        return this.run(async () => {
            const result = await this.db.query(`UPDATE lms_assessments
         SET status = $3, updated_at = now()
         WHERE id = $1 AND tenant_id = $2 AND assessment_type = 'ASSIGNMENT'
         RETURNING id, tenant_id, institution_id, course_id, module_id, title, description, instructions,
                   due_at, total_marks AS max_marks, assessment_type, status, created_at, updated_at`, [id, user.tenantId, status]);
            if (!result.rows[0])
                throw new common_1.NotFoundException("Assignment not found.");
            const row = result.rows[0];
            await this.auditMutation(request, "assignment", status === "PUBLISHED" ? "PUBLISH" : "ARCHIVE", row, before);
            return row;
        });
    }
    async listAssignmentSubmissions(id, user, page, pageSize, offset) {
        const assignment = await this.assignmentFor(id, user);
        await this.assertAssignmentStaffAccess(user, String(assignment.institution_id), String(assignment.course_id), assignment.campus_id);
        const values = [user.tenantId, id, pageSize, offset];
        const [rows, total] = await Promise.all([
            this.db.query(`SELECT s.id, s.tenant_id, s.institution_id, s.campus_id, s.course_id, s.module_id, s.assignment_id,
                s.learner_id, s.submission_text, s.attachment_url, s.is_late, s.status, s.grade,
                s.feedback, s.submitted_at, s.graded_by, s.graded_at, s.created_at, s.updated_at,
                u.first_name AS learner_first_name, u.last_name AS learner_last_name, u.email AS learner_email
         FROM lms_assignment_submissions s
         JOIN users u ON u.id = s.learner_id AND u.tenant_id = s.tenant_id
         WHERE s.tenant_id = $1 AND s.assignment_id = $2
         ORDER BY s.submitted_at DESC, s.id ASC LIMIT $3 OFFSET $4`, values),
            this.db.query("SELECT count(*)::text AS count FROM lms_assignment_submissions WHERE tenant_id = $1 AND assignment_id = $2", values.slice(0, 2)),
        ]);
        return { data: rows.rows, meta: (0, pagination_1.paginationMeta)(page, pageSize, Number(total.rows[0]?.count ?? 0)) };
    }
    async getMyAssignmentSubmission(id, user) {
        const assignment = await this.assignmentFor(id, user);
        await this.assertAssignmentViewer(assignment, user);
        const result = await this.db.query(`SELECT * FROM lms_assignment_submissions
        WHERE tenant_id = $1 AND assignment_id = $2 AND learner_id = $3
          AND campus_id IS NOT DISTINCT FROM $4`, [user.tenantId, id, user.id, assignment.campus_id ?? null]);
        return result.rows[0] ?? null;
    }
    async submitAssignment(id, input, request) {
        const user = request.context.user;
        const submissionText = typeof input.submissionText === "string" ? input.submissionText.trim() : "";
        if (!submissionText)
            throw new common_1.BadRequestException("Submission text cannot be empty.");
        if (submissionText.length > 20000)
            throw new common_1.BadRequestException("Submission text cannot exceed 20,000 characters.");
        const assignment = await this.assignmentFor(id, user);
        if (assignment.status !== "PUBLISHED"
            || assignment.course_status !== "PUBLISHED"
            || assignment.module_status !== "PUBLISHED"
            || assignment.programme_status === "ARCHIVED"
            || assignment.institution_status !== "ACTIVE") {
            throw new common_1.BadRequestException("Only published assignments in published courses can be submitted.");
        }
        await this.activeEnrollment(String(assignment.course_id), user.id, user);
        const existingResult = await this.db.query(`SELECT * FROM lms_assignment_submissions
        WHERE tenant_id = $1 AND assignment_id = $2 AND learner_id = $3
          AND campus_id IS NOT DISTINCT FROM $4`, [user.tenantId, id, user.id, assignment.campus_id ?? null]);
        const before = existingResult.rows[0];
        if (before?.status === "GRADED")
            throw new common_1.ConflictException("A graded assignment cannot be resubmitted.");
        return this.run(async () => {
            const result = await this.db.query(`INSERT INTO lms_assignment_submissions
           (tenant_id, institution_id, campus_id, course_id, module_id, assignment_id, learner_id, submission_text, attachment_url, is_late)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, ($10::timestamptz IS NOT NULL AND now() > $10::timestamptz))
         ON CONFLICT (tenant_id, assignment_id, learner_id)
         DO UPDATE SET submission_text = EXCLUDED.submission_text, attachment_url = EXCLUDED.attachment_url,
                       is_late = EXCLUDED.is_late, status = 'SUBMITTED', grade = NULL, feedback = NULL,
                       graded_by = NULL, graded_at = NULL, submitted_at = now(), updated_at = now()
         RETURNING *`, [
                user.tenantId,
                assignment.institution_id,
                assignment.campus_id ?? null,
                assignment.course_id,
                assignment.module_id,
                assignment.id,
                user.id,
                submissionText,
                input.attachmentUrl?.trim() || null,
                assignment.due_at ?? null,
            ]);
            const row = result.rows[0];
            await this.auditMutation(request, "assignment_submission", before ? "RESUBMIT" : "SUBMIT", row, before);
            return row;
        });
    }
    async gradeAssignmentSubmission(id, submissionId, input, request) {
        const user = request.context.user;
        const assignment = await this.assignmentFor(id, user);
        await this.assertAssignmentStaffAccess(user, String(assignment.institution_id), String(assignment.course_id), assignment.campus_id);
        if (input.grade > Number(assignment.total_marks))
            throw new common_1.BadRequestException("Grade cannot exceed the assignment's maximum marks.");
        const submissionResult = await this.db.query(`SELECT * FROM lms_assignment_submissions
       WHERE id = $1 AND tenant_id = $2 AND assignment_id = $3`, [submissionId, user.tenantId, id]);
        const before = submissionResult.rows[0];
        if (!before)
            throw new common_1.NotFoundException("Assignment submission not found.");
        if (before.status !== "SUBMITTED" && before.status !== "GRADED") {
            throw new common_1.ConflictException("This assignment submission cannot be graded.");
        }
        return this.run(async () => {
            const result = await this.db.query(`UPDATE lms_assignment_submissions
         SET status = 'GRADED', grade = $4, feedback = $5, graded_by = $2, graded_at = now(), updated_at = now()
         WHERE id = $1 AND tenant_id = $3 AND assignment_id = $6
         RETURNING *`, [submissionId, user.id, user.tenantId, input.grade, input.feedback?.trim() || null, id]);
            const row = result.rows[0];
            await this.auditMutation(request, "assignment_submission", "GRADE", row, before);
            const completion = await this.db.query(`INSERT INTO lms_assessment_completions
           (tenant_id, institution_id, campus_id, course_id, module_id, assessment_id, learner_id, attempt_id, score, passed, completed_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NULL, now())
         ON CONFLICT (tenant_id, assessment_id, learner_id, attempt_id)
         DO UPDATE SET score = EXCLUDED.score, completed_at = now(), updated_at = now()
         RETURNING *`, [
                user.tenantId,
                assignment.institution_id,
                assignment.campus_id ?? null,
                assignment.course_id,
                assignment.module_id,
                assignment.id,
                before.learner_id,
                `assignment:${submissionId}`,
                input.grade,
            ]);
            await this.auditMutation(request, "assessment_completion", "COMPLETE", completion.rows[0]);
            await this.certificates?.issueIfEligible(user.tenantId, String(assignment.course_id), String(before.learner_id), request);
            return row;
        });
    }
    async changeStatus(id, kind, status, request) {
        const table = kind === "programme" ? "programmes" : kind === "course" ? "courses" : kind === "course_module" ? "course_modules" : kind === "lesson" ? "lessons" : "learning_resources";
        const before = await this.getChild(id, table, request.context.user);
        return this.run(async () => {
            const result = await this.db.query(`UPDATE ${table} SET status = $2, updated_by = $3, updated_at = now()
         WHERE id = $1 AND tenant_id = $4
         RETURNING *`, [id, status, request.context.user.id, request.context.user.tenantId]);
            if (!result.rows[0])
                throw new common_1.NotFoundException("LMS content not found.");
            await this.auditMutation(request, kind, status === "PUBLISHED" ? "PUBLISH" : "ARCHIVE", result.rows[0], before);
            return result.rows[0];
        });
    }
};
exports.LmsService = LmsService;
exports.LmsService = LmsService = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        audit_service_1.AuditService,
        resource_storage_service_1.ResourceStorageService,
        certificate_service_1.CertificateService])
], LmsService);
//# sourceMappingURL=lms.service.js.map