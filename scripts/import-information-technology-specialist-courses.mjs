import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { mkdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import { promisify } from "node:util";
import { basename, dirname, join, resolve } from "node:path";
import pg from "pg";

const { Pool } = pg;
const execFileAsync = promisify(execFile);

const PROGRAMME_CODE = "IT-SPECIALIST-CERTIFICATIONS";
const PROGRAMME_NAME = "IT Specialist Certifications";
const PUBLISHED = "PUBLISHED";

const COURSE_SOURCES = [
  ["ITS-NETWORK-SECURITY", "IT Specialist Network Security", "ITS_OD_102_Network_Security_0922_1788429376324.pdf", "it-specialist-network-security-exam-objectives.pdf", "Official Certiport IT Specialist Network Security exam objectives covering defense in depth, operating system security, network device security, and secure computing."],
  ["ITS-DEVICE-CONFIGURATION-MANAGEMENT", "IT Specialist Device Configuration and Management", "ITS_OD_103_Devices_0125_1788429376325.pdf", "it-specialist-device-configuration-management-exam-objectives.pdf", "Official Certiport IT Specialist Device Configuration and Management exam objectives covering Windows installation, applications, data access, security, and troubleshooting."],
  ["ITS-CLOUD-COMPUTING", "IT Specialist Cloud Computing", "ITS_OD_104_Cloud_Computing_1023_1788429376325.pdf", "it-specialist-cloud-computing-exam-objectives.pdf", "Official Certiport IT Specialist Cloud Computing exam objectives covering cloud concepts, architecture, development, deployment, and governance."],
  ["ITS-CYBERSECURITY", "IT Specialist Cybersecurity", "ITS_OD_105_Cybersecurity_0524(3)_1788429376326.pdf", "it-specialist-cybersecurity-exam-objectives.pdf", "Official Certiport IT Specialist Cybersecurity exam objectives covering security principles, network and endpoint security, risk management, and incident handling."],
  ["ITS-DATABASES", "IT Specialist Databases", "ITS_OD_201_Databases_0922_1788429376326.pdf", "it-specialist-databases-exam-objectives.pdf", "Official Certiport IT Specialist Databases exam objectives covering database design, DDL, data retrieval, DML, and troubleshooting."],
  ["ITS-DATA-ANALYTICS", "IT Specialist Data Analytics", "ITS_OD_202_Data_Analytics_0922_1788429376327.pdf", "it-specialist-data-analytics-exam-objectives.pdf", "Official Certiport IT Specialist Data Analytics exam objectives covering data basics, manipulation, analysis, visualization, communication, and responsible practice."],
  ["ITS-HTML-AND-CSS", "IT Specialist HTML and CSS", "ITS_OD_301_HTML_and_CSS_1023_1788429376327.pdf", "it-specialist-html-and-css-exam-objectives.pdf", "Official Certiport IT Specialist HTML and CSS exam objectives covering markup, document structure, multimedia, styling, accessibility, and testing."],
  ["ITS-JAVASCRIPT", "IT Specialist JavaScript", "ITS_OD_302_Javascript_0922_1788429376328.pdf", "it-specialist-javascript-exam-objectives.pdf", "Official Certiport IT Specialist JavaScript exam objectives covering operators, variables, functions, control flow, the DOM, and HTML forms."],
  ["ITS-PYTHON", "IT Specialist Python", "ITS_OD_303_Python_1023_1788429376328.pdf", "it-specialist-python-exam-objectives.pdf", "Official Certiport IT Specialist Python exam objectives covering data types, control flow, input/output, code structure, error handling, modules, and tools."],
  ["ITS-JAVA", "IT Specialist Java", "ITS_OD_304_Java_0922_1788429376329.pdf", "it-specialist-java-exam-objectives.pdf", "Official Certiport IT Specialist Java exam objectives covering Java fundamentals, data types, flow control, object-oriented programming, compilation, and debugging."],
  ["ITS-SOFTWARE-DEVELOPMENT", "IT Specialist Software Development", "ITS_OD_305_Software_Develop_0922(1)_1788429376329.pdf", "it-specialist-software-development-exam-objectives.pdf", "Official Certiport IT Specialist Software Development exam objectives covering programming concepts, software development principles, OOP, web applications, and databases."],
  ["ITS-HTML5-APPLICATION-DEVELOPMENT", "IT Specialist HTML5 Application Development", "ITS_OD_306_HTML_App_Develop_0922_1788429376330.pdf", "it-specialist-html5-application-development-exam-objectives.pdf", "Official Certiport IT Specialist HTML5 Application Development exam objectives covering lifecycle management, graphics, forms, layouts, and JavaScript coding."],
  ["ITS-COMPUTATIONAL-THINKING", "IT Specialist Computational Thinking", "ITS_OD_Computational_Think_1023(2)_1788429376331.pdf", "it-specialist-computational-thinking-exam-objectives.pdf", "Official Certiport IT Specialist Computational Thinking exam objectives covering data, abstraction, solution design, automation, collaboration, and iterative improvement."],
  ["ITS-NETWORKING", "IT Specialist Networking", "ITS_OD_Networking_101_0922_1788429376331.pdf", "it-specialist-networking-exam-objectives.pdf", "Official Certiport IT Specialist Networking exam objectives covering networking concepts, infrastructures, hardware, protocols, services, and troubleshooting."],
].map(([code, title, filename, storageFilename, description]) => ({
  code,
  title,
  sourcePath: `attached_assets/${filename}`,
  resourceTitle: `Source PDF — ${title} Exam Objectives`,
  storageFilename,
  description,
}));

function normalizeText(value) {
  return value.replace(/\s+/g, " ").trim();
}

async function extractModules(sourcePath) {
  const { stdout } = await execFileAsync("pdftotext", ["-layout", sourcePath, "-"]);
  const lines = stdout.split(/\r?\n/);
  const modules = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = normalizeText(lines[index]);
    if (!line || line.startsWith("©") || line === "IT SPECIALIST EXAM OBJECTIVES" || line === "Manage Workbook Options and Settings") continue;

    const moduleMatch = line.match(/^(\d+)\.\s+(.+)$/);
    const objectiveMatch = line.match(/^(\d+\.\d+)\s+(.+)$/);
    if (moduleMatch && !objectiveMatch && line.length < 120) {
      modules.push({ title: moduleMatch[2], lessons: [] });
      continue;
    }
    if (!objectiveMatch || !modules.length) continue;

    let title = objectiveMatch[2];
    for (let next = index + 1; next < lines.length; next += 1) {
      const continuation = normalizeText(lines[next]);
      if (!continuation || continuation.startsWith("©") || continuation === "IT SPECIALIST EXAM OBJECTIVES" || continuation === "Manage Workbook Options and Settings") continue;
      if (continuation.startsWith("•") || /^\d+\.\d+\s+/.test(continuation) || /^\d+\.\s+/.test(continuation)) break;
      if (continuation.length > 140 || /^(Candidates |Although |To be successful |This exam |This certification |The exam )/.test(continuation)) break;
      title += ` ${continuation}`;
      index = next;
    }
    modules[modules.length - 1].lessons.push(`${objectiveMatch[1]} ${title}`);
  }

  if (!modules.length || modules.some((module) => !module.lessons.length)) {
    throw new Error(`Could not extract a complete objective hierarchy from ${sourcePath}.`);
  }
  return modules;
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
     FROM programmes WHERE tenant_id = $1 AND institution_id = $2 AND code = $3 FOR UPDATE`,
    [institution.tenant_id, institution.id, PROGRAMME_CODE],
  );
  if (existing.rows[0]) {
    if (existing.rows[0].name !== PROGRAMME_NAME) throw new Error(`Programme code ${PROGRAMME_CODE} already belongs to a different programme.`);
    return { row: existing.rows[0], created: false };
  }
  const inserted = await client.query(
    `INSERT INTO programmes
      (tenant_id, institution_id, campus_id, name, code, description, status, created_by, updated_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
     RETURNING id, tenant_id, institution_id, campus_id, name, code, description, status`,
    [institution.tenant_id, institution.id, institution.campus_id ?? null, PROGRAMME_NAME, PROGRAMME_CODE, "Certiport IT Specialist certification course catalogue.", PUBLISHED, createdBy],
  );
  return { row: inserted.rows[0], created: true };
}

async function findOrCreateCourse(client, programme, definition, createdBy) {
  const existing = await client.query(
    `SELECT id, tenant_id, institution_id, campus_id, programme_id, title, code, description, thumbnail, status
     FROM courses WHERE tenant_id = $1 AND programme_id = $2 AND code = $3 FOR UPDATE`,
    [programme.tenant_id, programme.id, definition.code],
  );
  if (existing.rows[0]) {
    if (existing.rows[0].title !== definition.title) throw new Error(`Course code ${definition.code} already belongs to a different course.`);
    return { row: existing.rows[0], created: false };
  }
  const inserted = await client.query(
    `INSERT INTO courses
      (tenant_id, institution_id, campus_id, programme_id, title, code, description, thumbnail, status, created_by, updated_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NULL, $8, $9, $9)
     RETURNING id, tenant_id, institution_id, campus_id, programme_id, title, code, description, thumbnail, status`,
    [programme.tenant_id, programme.institution_id, programme.campus_id ?? null, programme.id, definition.title, definition.code, definition.description, PUBLISHED, createdBy],
  );
  return { row: inserted.rows[0], created: true };
}

async function findOrCreateModule(client, course, definition, sequence, createdBy) {
  const existing = await client.query(
    `SELECT id, tenant_id, course_id, title, description, sequence, status
     FROM course_modules WHERE tenant_id = $1 AND course_id = $2 AND sequence = $3 FOR UPDATE`,
    [course.tenant_id, course.id, sequence],
  );
  if (existing.rows[0]) {
    if (existing.rows[0].title !== definition.title) throw new Error(`Module sequence ${sequence} is already occupied by "${existing.rows[0].title}".`);
    return { row: existing.rows[0], created: false };
  }
  const inserted = await client.query(
    `INSERT INTO course_modules
      (tenant_id, course_id, title, description, sequence, status, created_by, updated_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
     RETURNING id, tenant_id, course_id, title, description, sequence, status`,
    [course.tenant_id, course.id, definition.title, `IT Specialist objective area: ${definition.title}.`, sequence, PUBLISHED, createdBy],
  );
  return { row: inserted.rows[0], created: true };
}

async function findOrCreateLesson(client, module, title, sequence, createdBy) {
  const existing = await client.query(
    `SELECT id, tenant_id, module_id, title, description, sequence, estimated_duration, status
     FROM lessons WHERE tenant_id = $1 AND module_id = $2 AND sequence = $3 FOR UPDATE`,
    [module.tenant_id, module.id, sequence],
  );
  if (existing.rows[0]) {
    if (existing.rows[0].title !== title) throw new Error(`Lesson sequence ${sequence} in "${module.title}" is already occupied by "${existing.rows[0].title}".`);
    return { row: existing.rows[0], created: false };
  }
  const inserted = await client.query(
    `INSERT INTO lessons
      (tenant_id, module_id, title, description, sequence, estimated_duration, status, created_by, updated_by)
     VALUES ($1, $2, $3, $4, $5, NULL, $6, $7, $7)
     RETURNING id, tenant_id, module_id, title, description, sequence, estimated_duration, status`,
    [module.tenant_id, module.id, title, `IT Specialist exam objective: ${title}`, sequence, PUBLISHED, createdBy],
  );
  return { row: inserted.rows[0], created: true };
}

async function findOrCreateSourceResource(client, lesson, institution, definition, pdf, createdBy) {
  const existing = await client.query(
    `SELECT id, tenant_id, lesson_id, resource_type, title, url, file_path, duration, sequence, status
     FROM learning_resources WHERE tenant_id = $1 AND lesson_id = $2 AND sequence = 1 FOR UPDATE`,
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
    const currentHash = createHash("sha256").update(await readFile(destination)).digest("hex");
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
      [lesson.tenant_id, institution.id, institution.campus_id ?? null, resource.id, storageKey, pdf.filename, pdf.byteSize, pdf.sha256, createdBy],
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
  const pdf = { filename: basename(absolutePath), byteSize: buffer.length, sha256: createHash("sha256").update(buffer).digest("hex"), buffer };
  const modules = await extractModules(absolutePath);
  const course = await findOrCreateCourse(client, programme, definition, actorId);
  if (course.created) counts.coursesCreated += 1;
  let firstLesson = null;
  for (const [moduleIndex, moduleDefinition] of modules.entries()) {
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
  return { row: course.row, sourceSha256: pdf.sha256, moduleCount: modules.length, lessonCount: modules.reduce((total, module) => total + module.lessons.length, 0) };
}

async function main() {
  assertEnvironment();
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const counts = { programmesCreated: 0, coursesCreated: 0, modulesCreated: 0, lessonsCreated: 0, resourcesCreated: 0 };
  try {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", ["citis-import-information-technology-specialist-courses"]);
      const institutionResult = process.env.INSTITUTION_ID
        ? await client.query("SELECT id, tenant_id FROM institutions WHERE id = $1 AND status <> 'ARCHIVED'", [process.env.INSTITUTION_ID])
        : await client.query("SELECT id, tenant_id FROM institutions WHERE status <> 'ARCHIVED' ORDER BY created_at ASC, id ASC");
      if (!institutionResult.rows[0]) throw new Error("No active institution is available for the import.");
      if (!process.env.INSTITUTION_ID && institutionResult.rows.length !== 1) throw new Error("More than one active institution exists; set INSTITUTION_ID to choose the import scope.");
      const institution = institutionResult.rows[0];
      const actorResult = await client.query(
        `SELECT u.id FROM users u
         JOIN user_roles ur ON ur.user_id = u.id AND ur.tenant_id = u.tenant_id
         JOIN roles r ON r.id = ur.role_id AND r.tenant_id = ur.tenant_id
         WHERE u.tenant_id = $1 AND u.status <> 'ARCHIVED'
           AND r.code IN ('CITIS_SUPER_ADMIN', 'INSTITUTION_ADMINISTRATOR', 'PRINCIPAL_DIRECTOR', 'ACADEMIC_ADMINISTRATOR')
         ORDER BY u.created_at ASC, u.id ASC LIMIT 1`,
        [institution.tenant_id],
      );
      if (!actorResult.rows[0]) throw new Error("No active administrator actor exists in the current tenant.");
      const actorId = actorResult.rows[0].id;
      const programme = await findOrCreateProgramme(client, institution, actorId);
      if (programme.created) counts.programmesCreated += 1;
      const courses = [];
      for (const definition of COURSE_SOURCES) {
        courses.push({ definition, ...(await importCourse(client, institution, programme.row, definition, actorId, counts)) });
      }
      await client.query("COMMIT");
      console.log(JSON.stringify({ status: PUBLISHED, counts, programmeId: programme.row.id, courses: courses.map(({ definition, row, sourceSha256, moduleCount, lessonCount }) => ({ code: definition.code, title: definition.title, courseId: row.id, source: definition.sourcePath, sourceSha256, moduleCount, lessonCount })) }, null, 2));
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
  console.error(`IT Specialist objectives import failed: ${error instanceof Error ? error.message : error}`);
  process.exitCode = 1;
});