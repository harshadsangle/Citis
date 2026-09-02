import { createHash } from "node:crypto";
import { mkdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import pg from "pg";

const { Pool } = pg;

const PROGRAMME_CODE = "MICROSOFT-OFFICE-SPECIALIST";
const PROGRAMME_NAME = "Microsoft Office Specialist";
const PUBLISHED = "PUBLISHED";

function courseDefinition({ code, title, sourcePath, product, version, modules }) {
  return {
    code,
    title,
    sourcePath,
    resourceTitle: `Source PDF — ${title} official exam objectives`,
    storageFilename: `${code.toLowerCase()}.pdf`,
    description: `Official Microsoft Office Specialist objectives for ${product} in ${version}.`,
    modules: modules.map((moduleTitle) => ({
      title: moduleTitle,
      lessons: [`Review the official MOS exam objectives for ${moduleTitle}.`],
    })),
  };
}

const COURSE_DEFINITIONS = [
  courseDefinition({
    code: "MOS-77-725",
    title: "Microsoft Word (Office 2016) — Exam 77-725",
    sourcePath: "attached_assets/MOS_Word_2016_Exam_Objectives_1788327703493.pdf",
    product: "creating, formatting, collaborating on, and communicating with professional Word documents",
    version: "Office 2016",
    modules: [
      "Create and Manage Documents",
      "Navigate Through a Document",
      "Format a Document",
      "Customize Options and Views for Documents",
      "Manage Tables and Lists",
      "Insert and Format Graphic Elements",
    ],
  }),
  courseDefinition({
    code: "MOS-77-726",
    title: "Microsoft Word Expert (Office 2016) — Exam 77-726",
    sourcePath: "attached_assets/MOS_Word_Expert_2016_Exam_Objectives_1788327703493.pdf",
    product: "advanced Word document management, review, formatting, custom elements, and productivity features",
    version: "Office 2016",
    modules: [
      "Manage Documents and Templates",
      "Prepare Documents for Review",
      "Use Advanced Editing and Formatting Features",
      "Create Custom Document Elements",
      "Use Advanced Word Features",
    ],
  }),
  courseDefinition({
    code: "MOS-77-727",
    title: "Microsoft Excel (Office 2016) — Exam 77-727",
    sourcePath: "attached_assets/MOS_Excel_2016_Exam_Objectives_1788327703495.pdf",
    product: "creating, managing, formatting, analyzing, and visualizing worksheets and workbooks",
    version: "Office 2016",
    modules: [
      "Create Worksheets and Workbooks",
      "Navigate in Worksheets and Workbooks",
      "Format Worksheets and Workbooks",
      "Manage Data Cells and Ranges",
      "Create Tables",
      "Perform Operations with Formulas and Functions",
      "Create Charts and Objects",
    ],
  }),
  courseDefinition({
    code: "MOS-77-728",
    title: "Microsoft Excel Expert (Office 2016) — Exam 77-728",
    sourcePath: "attached_assets/MOS_Excel_Expert_2016_Exam_Objectives_1788327703495.pdf",
    product: "advanced Excel workbook management, data analysis, formulas, charts, and PivotTables",
    version: "Office 2016",
    modules: [
      "Manage Workbook Options and Settings",
      "Apply Custom Data Formats and Layouts",
      "Create Advanced Formulas and Macros",
      "Create Advanced Charts and Tables",
    ],
  }),
  courseDefinition({
    code: "MOS-77-729",
    title: "Microsoft PowerPoint (Office 2016) — Exam 77-729",
    sourcePath: "attached_assets/MOS_PowerPoint_2016_Exam_Objectives_1788327703494.pdf",
    product: "creating, formatting, presenting, and managing professional presentations",
    version: "Office 2016",
    modules: [
      "Create and Manage Presentations",
      "Insert and Format Slides",
      "Modify Slides, Handouts, and Notes",
      "Insert and Format Text, Shapes, and Images",
      "Insert Tables, Charts, SmartArt, 3D Models, and Media",
      "Apply Transitions and Animations",
    ],
  }),
  courseDefinition({
    code: "MOS-77-731",
    title: "Microsoft Outlook (Office 2016) — Exam 77-731",
    sourcePath: "attached_assets/MOS_Outlook_2016_Exam_Objectives_1788327703494.pdf",
    product: "professional email, correspondence, calendars, contacts, scheduling, and tasks",
    version: "Office 2016",
    modules: [
      "Manage the Outlook Environment",
      "Manage Messages",
      "Manage Contacts",
      "Manage Calendars",
      "Manage Tasks",
    ],
  }),
  courseDefinition({
    code: "MOS-MO-100",
    title: "Microsoft Word (Office 2019) — Exam MO-100",
    sourcePath: "attached_assets/MOS_OD_Word_Associate_1122_(1)_1788327703496.pdf",
    product: "managing documents, formatting content, tables, references, graphics, and collaboration",
    version: "Office 2019",
    modules: [
      "Manage Documents",
      "Insert and Format Text, Paragraphs, and Sections",
      "Manage Tables and Lists",
      "Create and Manage References",
      "Insert and Format Graphic Elements",
      "Manage Document Collaboration",
    ],
  }),
  courseDefinition({
    code: "MOS-MO-101",
    title: "Microsoft Word Expert (Office 2019) — Exam MO-101",
    sourcePath: "attached_assets/MOS_OD_Word_Expert_1122_1788327703495.pdf",
    product: "advanced Word editing, document options, custom elements, references, and productivity features",
    version: "Office 2019",
    modules: [
      "Manage Document Options and Settings",
      "Use Advanced Editing and Formatting Features",
      "Create Custom Document Elements",
      "Use Advanced Word Features",
    ],
  }),
  courseDefinition({
    code: "MOS-MO-200",
    title: "Microsoft Excel (Office 2019) — Exam MO-200",
    sourcePath: "attached_assets/MOS_OD_Excel_Associate_1122_1788327703498.pdf",
    product: "managing worksheets, data, tables, formulas, functions, and charts",
    version: "Office 2019",
    modules: [
      "Manage Worksheets and Workbooks",
      "Manage Data Cells and Ranges",
      "Manage Tables and Table Data",
      "Perform Operations Using Formulas and Functions",
      "Manage Charts",
    ],
  }),
  courseDefinition({
    code: "MOS-MO-201",
    title: "Microsoft Excel Expert (Office 2019) — Exam MO-201",
    sourcePath: "attached_assets/MOS_OD_Excel_Expert_1122_1788327703497.pdf",
    product: "advanced Excel workbook settings, data formats, formulas, macros, charts, and PivotTables",
    version: "Office 2019",
    modules: [
      "Manage Workbook Options and Settings",
      "Manage and Format Data",
      "Create Advanced Formulas and Macros",
      "Manage Advanced Charts and Tables",
    ],
  }),
  courseDefinition({
    code: "MOS-MO-300",
    title: "Microsoft PowerPoint (Office 2019) — Exam MO-300",
    sourcePath: "attached_assets/MOS_OD_PowerPoint_Associate_1122_1788327703496.pdf",
    product: "managing presentations, slides, content, media, transitions, animations, and presentation delivery",
    version: "Office 2019",
    modules: [
      "Manage Presentations",
      "Manage Slides",
      "Insert and Format Text, Shapes, and Images",
      "Insert Tables, Charts, SmartArt, 3D Models, and Media",
      "Apply Transitions and Animations",
      "Manage Multiple Presentations",
    ],
  }),
  courseDefinition({
    code: "MOS-MO-400",
    title: "Microsoft Outlook (Office 2019) — Exam MO-400",
    sourcePath: "attached_assets/MOS_OD_Outlook_Associate_1122_1788327703497.pdf",
    product: "Outlook settings, correspondence, contacts, calendars, meetings, scheduling, and tasks",
    version: "Office 2019",
    modules: [
      "Manage Outlook Settings and Processes",
      "Manage Messages",
      "Manage Schedules",
      "Manage Contacts and Tasks",
      "Manage Multiple Accounts",
    ],
  }),
  courseDefinition({
    code: "MOS-MO-500",
    title: "Microsoft Access Expert (Office 2019) — Exam MO-500",
    sourcePath: "attached_assets/MOS_OD_Access_Expert_1122_1788327703498.pdf",
    product: "advanced Access database objects, data management, queries, forms, reports, and relationships",
    version: "Office 2019",
    modules: [
      "Manage Database Objects",
      "Manage Data",
      "Create Queries",
      "Create Forms",
      "Create Reports",
    ],
  }),
  courseDefinition({
    code: "MOS-MO-110",
    title: "Word (Microsoft 365 Apps) — Exam MO-110",
    sourcePath: "attached_assets/MOS_365_Word_OD_2022_1788327703498.pdf",
    product: "managing documents, formatting content, tables, references, graphics, and collaboration",
    version: "Microsoft 365 Apps",
    modules: [
      "Manage Documents",
      "Insert and Format Text, Paragraphs, and Sections",
      "Manage Tables and Lists",
      "Create and Manage References",
      "Insert and Format Graphic Elements",
      "Manage Document Collaboration",
    ],
  }),
  courseDefinition({
    code: "MOS-MO-111",
    title: "Word Expert (Microsoft 365 Apps) — Exam MO-111",
    sourcePath: "attached_assets/MOS_365_Word_Expert_OD_2022_1788327703498.pdf",
    product: "advanced Word editing, document options, custom elements, references, and productivity features",
    version: "Microsoft 365 Apps",
    modules: [
      "Manage Document Options and Settings",
      "Use Advanced Editing and Formatting Features",
      "Create Custom Document Elements",
      "Use Advanced Word Features",
    ],
  }),
  courseDefinition({
    code: "MOS-MO-210",
    title: "Excel (Microsoft 365 Apps) — Exam MO-210",
    sourcePath: "attached_assets/MOS_365_Excel_OD_2022_1788327703499.pdf",
    product: "managing worksheets, data, tables, formulas, functions, and charts",
    version: "Microsoft 365 Apps",
    modules: [
      "Manage Worksheets and Workbooks",
      "Manage Data Cells and Ranges",
      "Manage Tables and Table Data",
      "Perform Operations Using Formulas and Functions",
      "Manage Charts",
    ],
  }),
  courseDefinition({
    code: "MOS-MO-211",
    title: "Excel Expert (Microsoft 365 Apps) — Exam MO-211",
    sourcePath: "attached_assets/MOS_365_Excel_Expert_2022_OD_1788327703499.pdf",
    product: "advanced Excel workbook settings, data formats, formulas, macros, charts, and PivotTables",
    version: "Microsoft 365 Apps",
    modules: [
      "Manage Workbook Options and Settings",
      "Manage and Format Data",
      "Create Advanced Formulas and Macros",
      "Manage Advanced Charts and Tables",
    ],
  }),
  courseDefinition({
    code: "MOS-MO-310",
    title: "PowerPoint (Microsoft 365 Apps) — Exam MO-310",
    sourcePath: "attached_assets/MOS_365_PPT_2022_OD_1788327703499.pdf",
    product: "managing presentations, slides, content, media, transitions, animations, and delivery",
    version: "Microsoft 365 Apps",
    modules: [
      "Manage Presentations",
      "Manage Slides",
      "Insert and Format Text, Shapes, and Images",
      "Insert Tables, Charts, SmartArt, 3D Models, and Media",
      "Apply Transitions and Animations",
      "Manage Multiple Presentations",
    ],
  }),
];

const codes = new Set();
for (const definition of COURSE_DEFINITIONS) {
  if (codes.has(definition.code)) throw new Error(`Duplicate MOS course code: ${definition.code}`);
  codes.add(definition.code);
}

function assertEnvironment() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
}

function storagePathFor(storageKey) {
  const root = resolve(process.env.LMS_STORAGE_DIR || join(process.cwd(), "var", "lms-storage"));
  const destination = resolve(root, storageKey);
  if (destination !== root && !destination.startsWith(`${root}/`)) {
    throw new Error("Refusing to use a managed file path outside LMS storage.");
  }
  return destination;
}

async function fileExists(path) {
  try {
    await stat(path);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

async function findOrCreateProgramme(client, institution, createdBy) {
  const existing = await client.query(
    `SELECT id, tenant_id, institution_id, campus_id, name, code, description, status
     FROM programmes
     WHERE tenant_id = $1 AND institution_id = $2 AND code = $3
     FOR UPDATE`,
    [institution.tenant_id, institution.id, PROGRAMME_CODE],
  );
  if (existing.rows[0]) {
    if (existing.rows[0].name !== PROGRAMME_NAME) {
      throw new Error(`Programme code ${PROGRAMME_CODE} already belongs to a different programme.`);
    }
    return { row: existing.rows[0], created: false };
  }

  const inserted = await client.query(
    `INSERT INTO programmes
      (tenant_id, institution_id, campus_id, name, code, description, status, created_by, updated_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
     RETURNING id, tenant_id, institution_id, campus_id, name, code, description, status`,
    [
      institution.tenant_id,
      institution.id,
      institution.campus_id ?? null,
      PROGRAMME_NAME,
      PROGRAMME_CODE,
      "Microsoft Office Specialist certification course catalogue.",
      PUBLISHED,
      createdBy,
    ],
  );
  return { row: inserted.rows[0], created: true };
}

async function findOrCreateCourse(client, programme, definition, createdBy) {
  const existing = await client.query(
    `SELECT id, tenant_id, institution_id, campus_id, programme_id, title, code, description, thumbnail, status
     FROM courses
     WHERE tenant_id = $1 AND programme_id = $2 AND code = $3
     FOR UPDATE`,
    [programme.tenant_id, programme.id, definition.code],
  );
  if (existing.rows[0]) {
    if (existing.rows[0].title !== definition.title) {
      throw new Error(`Course code ${definition.code} already belongs to a different course.`);
    }
    return { row: existing.rows[0], created: false };
  }

  const inserted = await client.query(
    `INSERT INTO courses
      (tenant_id, institution_id, campus_id, programme_id, title, code, description, thumbnail, status, created_by, updated_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NULL, $8, $9, $9)
     RETURNING id, tenant_id, institution_id, campus_id, programme_id, title, code, description, thumbnail, status`,
    [
      programme.tenant_id,
      programme.institution_id,
      programme.campus_id ?? null,
      programme.id,
      definition.title,
      definition.code,
      definition.description,
      PUBLISHED,
      createdBy,
    ],
  );
  return { row: inserted.rows[0], created: true };
}

async function findOrCreateModule(client, course, definition, sequence, createdBy) {
  const existing = await client.query(
    `SELECT id, tenant_id, course_id, title, description, sequence, status
     FROM course_modules
     WHERE tenant_id = $1 AND course_id = $2 AND sequence = $3
     FOR UPDATE`,
    [course.tenant_id, course.id, sequence],
  );
  if (existing.rows[0]) {
    if (existing.rows[0].title !== definition.title) {
      throw new Error(`Module sequence ${sequence} is already occupied by "${existing.rows[0].title}".`);
    }
    return { row: existing.rows[0], created: false };
  }

  const inserted = await client.query(
    `INSERT INTO course_modules
      (tenant_id, course_id, title, description, sequence, status, created_by, updated_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
     RETURNING id, tenant_id, course_id, title, description, sequence, status`,
    [
      course.tenant_id,
      course.id,
      definition.title,
      `Microsoft Office Specialist objective area: ${definition.title}.`,
      sequence,
      PUBLISHED,
      createdBy,
    ],
  );
  return { row: inserted.rows[0], created: true };
}

async function findOrCreateLesson(client, module, title, sequence, createdBy) {
  const existing = await client.query(
    `SELECT id, tenant_id, module_id, title, description, sequence, estimated_duration, status
     FROM lessons
     WHERE tenant_id = $1 AND module_id = $2 AND sequence = $3
     FOR UPDATE`,
    [module.tenant_id, module.id, sequence],
  );
  if (existing.rows[0]) {
    if (existing.rows[0].title !== title) {
      throw new Error(`Lesson sequence ${sequence} in "${module.title}" is already occupied by "${existing.rows[0].title}".`);
    }
    return { row: existing.rows[0], created: false };
  }

  const inserted = await client.query(
    `INSERT INTO lessons
      (tenant_id, module_id, title, description, sequence, estimated_duration, status, created_by, updated_by)
     VALUES ($1, $2, $3, $4, $5, NULL, $6, $7, $7)
     RETURNING id, tenant_id, module_id, title, description, sequence, estimated_duration, status`,
    [
      module.tenant_id,
      module.id,
      title,
      `Microsoft Office Specialist exam objective: ${title}`,
      sequence,
      PUBLISHED,
      createdBy,
    ],
  );
  return { row: inserted.rows[0], created: true };
}

async function findOrCreateSourceResource(client, lesson, institution, definition, pdf, createdBy) {
  const existing = await client.query(
    `SELECT id, tenant_id, lesson_id, resource_type, title, url, file_path, duration, sequence, status
     FROM learning_resources
     WHERE tenant_id = $1 AND lesson_id = $2 AND sequence = 1
     FOR UPDATE`,
    [lesson.tenant_id, lesson.id],
  );
  if (existing.rows[0]) {
    if (existing.rows[0].title !== definition.resourceTitle || existing.rows[0].resource_type !== "PDF") {
      throw new Error(`Learning resource sequence 1 in "${lesson.title}" is already occupied by another resource.`);
    }
    return { row: existing.rows[0], created: false };
  }

  const inserted = await client.query(
    `INSERT INTO learning_resources
      (tenant_id, lesson_id, resource_type, title, url, file_path, duration, sequence, status, created_by, updated_by)
     VALUES ($1, $2, 'PDF', $3, NULL, NULL, NULL, 1, $4, $5, $5)
     RETURNING id, tenant_id, lesson_id, resource_type, title, url, file_path, duration, sequence, status`,
    [lesson.tenant_id, lesson.id, definition.resourceTitle, PUBLISHED, createdBy],
  );
  const resource = inserted.rows[0];
  const storageKey = `${lesson.tenant_id}/${resource.id}/${definition.storageFilename}`;
  const destination = storagePathFor(storageKey);
  const createdStorageFiles = [];

  if (await fileExists(destination)) {
    const current = await readFile(destination);
    const currentHash = createHash("sha256").update(current).digest("hex");
    if (currentHash !== pdf.sha256) throw new Error("The existing managed PDF path contains different content.");
  } else {
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, pdf.buffer, { flag: "wx" });
    createdStorageFiles.push(destination);
  }

  try {
    await client.query(
      `INSERT INTO managed_files
        (tenant_id, institution_id, campus_id, resource_id, kind, storage_key, original_filename, mime_type, byte_size, sha256, entrypoint, created_by)
       VALUES ($1, $2, $3, $4, 'FILE', $5, $6, 'application/pdf', $7, $8, NULL, $9)`,
      [
        lesson.tenant_id,
        institution.id,
        institution.campus_id ?? null,
        resource.id,
        storageKey,
        pdf.filename,
        pdf.byteSize,
        pdf.sha256,
        createdBy,
      ],
    );
  } catch (error) {
    for (const createdPath of createdStorageFiles) await unlink(createdPath).catch(() => {});
    throw error;
  }
  return { row: resource, created: true };
}

async function importCourse(client, institution, programme, definition, actorId, counts) {
  const absolutePath = resolve(process.cwd(), definition.sourcePath);
  const buffer = await readFile(absolutePath);
  if (!buffer.length) throw new Error(`The source PDF is empty: ${definition.sourcePath}`);
  const pdf = {
    filename: basename(absolutePath),
    byteSize: buffer.length,
    sha256: createHash("sha256").update(buffer).digest("hex"),
    buffer,
  };

  const course = await findOrCreateCourse(client, programme, definition, actorId);
  if (course.created) counts.coursesCreated += 1;
  let firstLesson = null;
  for (const [moduleIndex, moduleDefinition] of definition.modules.entries()) {
    const module = await findOrCreateModule(client, course.row, moduleDefinition, moduleIndex + 1, actorId);
    if (module.created) counts.modulesCreated += 1;
    for (const [lessonIndex, lessonTitle] of moduleDefinition.lessons.entries()) {
      const lesson = await findOrCreateLesson(client, module.row, lessonTitle, lessonIndex + 1, actorId);
      if (lesson.created) counts.lessonsCreated += 1;
      if (!firstLesson) firstLesson = lesson.row;
    }
  }
  if (!firstLesson) throw new Error(`Course ${definition.code} has no lessons for its source resource.`);
  const resource = await findOrCreateSourceResource(client, firstLesson, institution, definition, pdf, actorId);
  if (resource.created) counts.resourcesCreated += 1;
  return { row: course.row, sourceSha256: pdf.sha256 };
}

async function main() {
  assertEnvironment();
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const counts = {
    programmesCreated: 0,
    coursesCreated: 0,
    modulesCreated: 0,
    lessonsCreated: 0,
    resourcesCreated: 0,
  };

  try {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", ["citis-import-microsoft-mos-objectives-courses"]);

      const institutionResult = process.env.INSTITUTION_ID
        ? await client.query(
          `SELECT id, tenant_id FROM institutions WHERE id = $1 AND status <> 'ARCHIVED'`,
          [process.env.INSTITUTION_ID],
        )
        : await client.query(
          `SELECT id, tenant_id FROM institutions WHERE status <> 'ARCHIVED' ORDER BY created_at ASC, id ASC`,
        );
      if (!institutionResult.rows[0]) throw new Error("No active institution is available for the import.");
      if (!process.env.INSTITUTION_ID && institutionResult.rows.length !== 1) {
        throw new Error("More than one active institution exists; set INSTITUTION_ID to choose the import scope.");
      }
      const institution = institutionResult.rows[0];

      const actorResult = await client.query(
        `SELECT u.id
         FROM users u
         JOIN user_roles ur ON ur.user_id = u.id AND ur.tenant_id = u.tenant_id
         JOIN roles r ON r.id = ur.role_id AND r.tenant_id = ur.tenant_id
         WHERE u.tenant_id = $1 AND u.status <> 'ARCHIVED'
           AND r.code IN ('CITIS_SUPER_ADMIN', 'INSTITUTION_ADMINISTRATOR', 'PRINCIPAL_DIRECTOR', 'ACADEMIC_ADMINISTRATOR')
         ORDER BY u.created_at ASC, u.id ASC
         LIMIT 1`,
        [institution.tenant_id],
      );
      if (!actorResult.rows[0]) throw new Error("No active administrator actor exists in the current tenant.");
      const actorId = actorResult.rows[0].id;

      const programme = await findOrCreateProgramme(client, institution, actorId);
      if (programme.created) counts.programmesCreated += 1;
      const courses = [];
      for (const definition of COURSE_DEFINITIONS) {
        courses.push({
          definition,
          ...(await importCourse(client, institution, programme.row, definition, actorId, counts)),
        });
      }

      await client.query("COMMIT");
      console.log(JSON.stringify({
        status: PUBLISHED,
        counts,
        programmeId: programme.row.id,
        courses: courses.map(({ definition, row, sourceSha256 }) => ({
          code: definition.code,
          title: definition.title,
          courseId: row.id,
          source: definition.sourcePath,
          sourceSha256,
        })),
      }, null, 2));
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(`Microsoft MOS objectives import failed: ${error instanceof Error ? error.message : error}`);
  process.exitCode = 1;
});