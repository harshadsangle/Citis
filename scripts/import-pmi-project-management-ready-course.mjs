import { createHash } from "node:crypto";
import { mkdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import pg from "pg";

const { Pool } = pg;
const PUBLISHED = "PUBLISHED";
const PROGRAMME_CODE = "PMI-CERTIFICATIONS";
const PROGRAMME_NAME = "PMI Certifications";
const SOURCE_PATH = "attached_assets/PMI_OD_0424_1788430508244.pdf";
const COURSE = {
  code: "PMI-PROJECT-MANAGEMENT-READY",
  title: "PMI Project Management Ready®",
  resourceTitle: "Source PDF — PMI Project Management Ready® Exam Objectives",
  storageFilename: "pmi-project-management-ready-exam-objectives.pdf",
  description: "Official PMI Project Management Ready® objective-led preparation introducing project management concepts and tools across career paths.",
  modules: [
    { title: "1. Project Management Fundamentals", lessons: ["1.1 Describe common project management approaches", "1.2 Describe the role of ethics in project management", "1.3 Identify basic leadership skills", "1.4 Describe project communications"] },
    { title: "2. Starting the Project", lessons: ["2.1 Describe a project charter", "2.2 Differentiate between various stakeholder roles and responsibilities"] },
    { title: "3. Planning the work", lessons: ["3.1 Describe the purpose of the project management plan", "3.2 Describe the concept of project scope", "3.3 Describe the concept of project scheduling", "3.4 Describe the concept of project budget"] },
    { title: "4. Completing the work", lessons: ["4.1 Monitor project scope, schedule, and budget", "4.2 Describe the concept of quality in project work", "4.3 Describe the change management process"] },
    { title: "5. Ending the project", lessons: ["5.1 Verify project completion", "5.2 Describe project closing activities related to documentation"] },
  ],
};

function storagePathFor(storageKey) {
  const root = resolve(process.env.LMS_STORAGE_DIR || join(process.cwd(), "var", "lms-storage"));
  const destination = resolve(root, storageKey);
  if (destination !== root && !destination.startsWith(`${root}/`)) throw new Error("Refusing to use a managed file path outside LMS storage.");
  return destination;
}

async function exists(path) {
  try { await stat(path); return true; } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

async function programme(client, institution, actorId) {
  const found = await client.query(
    "SELECT id, tenant_id, institution_id, campus_id, name, code FROM programmes WHERE tenant_id=$1 AND institution_id=$2 AND code=$3 FOR UPDATE",
    [institution.tenant_id, institution.id, PROGRAMME_CODE],
  );
  if (found.rows[0]) {
    if (found.rows[0].name !== PROGRAMME_NAME) throw new Error(`Programme code ${PROGRAMME_CODE} already belongs to a different programme.`);
    return { row: found.rows[0], created: false };
  }
  const inserted = await client.query(
    `INSERT INTO programmes (tenant_id,institution_id,campus_id,name,code,description,status,created_by,updated_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$8) RETURNING id,tenant_id,institution_id,campus_id,name,code`,
    [institution.tenant_id, institution.id, institution.campus_id ?? null, PROGRAMME_NAME, PROGRAMME_CODE, "Project Management Institute certification course catalogue.", PUBLISHED, actorId],
  );
  return { row: inserted.rows[0], created: true };
}

async function course(client, programmeRow, actorId) {
  const found = await client.query(
    "SELECT id,tenant_id,institution_id,campus_id,programme_id,title,code FROM courses WHERE tenant_id=$1 AND programme_id=$2 AND code=$3 FOR UPDATE",
    [programmeRow.tenant_id, programmeRow.id, COURSE.code],
  );
  if (found.rows[0]) {
    if (found.rows[0].title !== COURSE.title) throw new Error(`Course code ${COURSE.code} already belongs to a different course.`);
    return { row: found.rows[0], created: false };
  }
  const inserted = await client.query(
    `INSERT INTO courses (tenant_id,institution_id,campus_id,programme_id,title,code,description,thumbnail,status,created_by,updated_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,NULL,$8,$9,$9)
     RETURNING id,tenant_id,institution_id,campus_id,programme_id,title,code`,
    [programmeRow.tenant_id, programmeRow.institution_id, programmeRow.campus_id ?? null, programmeRow.id, COURSE.title, COURSE.code, COURSE.description, PUBLISHED, actorId],
  );
  return { row: inserted.rows[0], created: true };
}

async function moduleRow(client, courseRow, definition, sequence, actorId) {
  const found = await client.query(
    "SELECT id,tenant_id,course_id,title FROM course_modules WHERE tenant_id=$1 AND course_id=$2 AND sequence=$3 FOR UPDATE",
    [courseRow.tenant_id, courseRow.id, sequence],
  );
  if (found.rows[0]) {
    if (found.rows[0].title !== definition.title) throw new Error(`Module sequence ${sequence} is already occupied by "${found.rows[0].title}".`);
    return { row: found.rows[0], created: false };
  }
  const inserted = await client.query(
    `INSERT INTO course_modules (tenant_id,course_id,title,description,sequence,status,created_by,updated_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$7) RETURNING id,tenant_id,course_id,title`,
    [courseRow.tenant_id, courseRow.id, definition.title, `PMI Project Management Ready® objective area: ${definition.title}.`, sequence, PUBLISHED, actorId],
  );
  return { row: inserted.rows[0], created: true };
}

async function lessonRow(client, module, title, sequence, actorId) {
  const found = await client.query(
    "SELECT id,tenant_id,module_id,title FROM lessons WHERE tenant_id=$1 AND module_id=$2 AND sequence=$3 FOR UPDATE",
    [module.tenant_id, module.id, sequence],
  );
  if (found.rows[0]) {
    if (found.rows[0].title !== title) throw new Error(`Lesson sequence ${sequence} in "${module.title}" is already occupied by "${found.rows[0].title}".`);
    return { row: found.rows[0], created: false };
  }
  const inserted = await client.query(
    `INSERT INTO lessons (tenant_id,module_id,title,description,sequence,estimated_duration,status,created_by,updated_by)
     VALUES ($1,$2,$3,$4,$5,NULL,$6,$7,$7) RETURNING id,tenant_id,module_id,title`,
    [module.tenant_id, module.id, title, `PMI Project Management Ready® exam objective: ${title}`, sequence, PUBLISHED, actorId],
  );
  return { row: inserted.rows[0], created: true };
}

async function sourceResource(client, lesson, institution, actorId, pdf) {
  const found = await client.query(
    "SELECT id,tenant_id,lesson_id,resource_type,title FROM learning_resources WHERE tenant_id=$1 AND lesson_id=$2 AND sequence=1 FOR UPDATE",
    [lesson.tenant_id, lesson.id],
  );
  if (found.rows[0]) {
    if (found.rows[0].title !== COURSE.resourceTitle || found.rows[0].resource_type !== "PDF") throw new Error("The first lesson already has a different learning resource.");
    return { row: found.rows[0], created: false };
  }
  const inserted = await client.query(
    `INSERT INTO learning_resources (tenant_id,lesson_id,resource_type,title,url,file_path,duration,sequence,status,created_by,updated_by)
     VALUES ($1,$2,'PDF',$3,NULL,NULL,NULL,1,$4,$5,$5) RETURNING id,tenant_id,lesson_id,resource_type,title`,
    [lesson.tenant_id, lesson.id, COURSE.resourceTitle, PUBLISHED, actorId],
  );
  const resource = inserted.rows[0];
  const storageKey = `${lesson.tenant_id}/${resource.id}/${COURSE.storageFilename}`;
  const destination = storagePathFor(storageKey);
  const createdPaths = [];
  if (await exists(destination)) {
    const hash = createHash("sha256").update(await readFile(destination)).digest("hex");
    if (hash !== pdf.sha256) throw new Error("The existing managed PMI PDF contains different content.");
  } else {
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, pdf.buffer, { flag: "wx" });
    createdPaths.push(destination);
  }
  try {
    await client.query(
      `INSERT INTO managed_files (tenant_id,institution_id,campus_id,resource_id,kind,storage_key,original_filename,mime_type,byte_size,sha256,entrypoint,created_by)
       VALUES ($1,$2,$3,$4,'FILE',$5,$6,'application/pdf',$7,$8,NULL,$9)`,
      [lesson.tenant_id, institution.id, institution.campus_id ?? null, resource.id, storageKey, pdf.filename, pdf.byteSize, pdf.sha256, actorId],
    );
  } catch (error) {
    for (const path of createdPaths) await unlink(path).catch(() => {});
    throw error;
  }
  return { row: resource, created: true };
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const pdfBuffer = await readFile(resolve(process.cwd(), SOURCE_PATH));
  const pdf = { buffer: pdfBuffer, filename: basename(SOURCE_PATH), byteSize: pdfBuffer.length, sha256: createHash("sha256").update(pdfBuffer).digest("hex") };
  const counts = { programmesCreated: 0, coursesCreated: 0, modulesCreated: 0, lessonsCreated: 0, resourcesCreated: 0 };
  try {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", ["citis-import-pmi-project-management-ready"]);
      const institutions = process.env.INSTITUTION_ID
        ? await client.query("SELECT id,tenant_id FROM institutions WHERE id=$1 AND status <> 'ARCHIVED'", [process.env.INSTITUTION_ID])
        : await client.query("SELECT id,tenant_id FROM institutions WHERE status <> 'ARCHIVED' ORDER BY created_at ASC,id ASC");
      if (!institutions.rows[0]) throw new Error("No active institution is available for the import.");
      if (!process.env.INSTITUTION_ID && institutions.rows.length !== 1) throw new Error("More than one active institution exists; set INSTITUTION_ID to choose the import scope.");
      const institution = institutions.rows[0];
      const actors = await client.query(
        `SELECT u.id FROM users u JOIN user_roles ur ON ur.user_id=u.id AND ur.tenant_id=u.tenant_id
         JOIN roles r ON r.id=ur.role_id AND r.tenant_id=ur.tenant_id
         WHERE u.tenant_id=$1 AND u.status <> 'ARCHIVED'
         AND r.code IN ('CITIS_SUPER_ADMIN','INSTITUTION_ADMINISTRATOR','PRINCIPAL_DIRECTOR','ACADEMIC_ADMINISTRATOR')
         ORDER BY u.created_at ASC,u.id ASC LIMIT 1`,
        [institution.tenant_id],
      );
      if (!actors.rows[0]) throw new Error("No active administrator actor exists in the current tenant.");
      const actorId = actors.rows[0].id;
      const programmeResult = await programme(client, institution, actorId);
      if (programmeResult.created) counts.programmesCreated += 1;
      const courseResult = await course(client, programmeResult.row, actorId);
      if (courseResult.created) counts.coursesCreated += 1;
      let firstLesson;
      for (const [moduleIndex, definition] of COURSE.modules.entries()) {
        const moduleResult = await moduleRow(client, courseResult.row, definition, moduleIndex + 1, actorId);
        if (moduleResult.created) counts.modulesCreated += 1;
        for (const [lessonIndex, title] of definition.lessons.entries()) {
          const lessonResult = await lessonRow(client, moduleResult.row, title, lessonIndex + 1, actorId);
          if (lessonResult.created) counts.lessonsCreated += 1;
          firstLesson ||= lessonResult.row;
        }
      }
      const resourceResult = await sourceResource(client, firstLesson, institution, actorId, pdf);
      if (resourceResult.created) counts.resourcesCreated += 1;
      await client.query("COMMIT");
      console.log(JSON.stringify({ status: PUBLISHED, counts, programmeId: programmeResult.row.id, courseId: courseResult.row.id, moduleCount: COURSE.modules.length, lessonCount: COURSE.modules.reduce((sum, module) => sum + module.lessons.length, 0), sourceSha256: pdf.sha256 }, null, 2));
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
  console.error(`PMI Project Management Ready import failed: ${error instanceof Error ? error.message : error}`);
  process.exitCode = 1;
});