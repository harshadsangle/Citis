import { createHash } from "node:crypto";
import { mkdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import pg from "pg";

const { Pool } = pg;
const PUBLISHED = "PUBLISHED";
const PROGRAMME_CODE = "META-CERTIFICATIONS";
const PROGRAMME_NAME = "Meta Certifications";
const SOURCE_PATH = "attached_assets/Meta_Objective_Domains_1023_1788431060767.pdf";
const COURSE = {
  code: "META-CERTIFIED-DIGITAL-MARKETING-ASSOCIATE",
  title: "Meta Certified Digital Marketing Associate",
  resourceTitle: "Source PDF — Meta Certified Digital Marketing Associate Objective Domains",
  storageFilename: "meta-certified-digital-marketing-associate-objective-domains.pdf",
  description: "Official Meta objective-led preparation for establishing a digital presence, creating and managing advertisements, and reporting campaign outcomes across Meta technologies.",
  modules: [
    { title: "1. The value of Meta technologies", lessons: ["1.1 Identify Meta technologies.", "1.2 Communicate the value proposition of Meta technologies for businesses."] },
    { title: "2. Establish a business presence", lessons: ["2.1 Identify the steps to establish a business presence on Facebook, Instagram and WhatsApp and the tools needed to engage with audiences.", "2.2 Explain the process to customize settings within Meta Ads Manager.", "2.3 Apply creative best practices optimized for mobile experiences."] },
    { title: "3. Advertising fundamentals", lessons: ["3.1 Recognize the value of advertising on Meta technologies.", "3.2 Recognize the importance of matching business goals to ad campaign objectives.", "3.3 Communicate the value of the Meta Pixel and the Conversions API.", "3.4 Describe how people are charged for ads and where the ads are shown.", "3.5 Identify data privacy protections and common ad policies."] },
    { title: "4. Create and manage ads", lessons: ["4.1 Identify the differences among boosting a Page post, promoting a post on Instagram and creating an ad in Ads Manager.", "4.2 Identify settings available at the campaign, ad set and ad level.", "4.3 Determine the ad campaign objective to achieve business goals.", "4.4 Identify ad targeting capabilities.", "4.5 Determine the appropriate ad formats for a given scenario.", "4.6 Identify budget and ad scheduling options.", "4.7 Identify the relationship between budget and estimated results."] },
    { title: "5. Reporting", lessons: ["5.1 Identify campaign results through Meta Ads Reporting.", "5.2 Measure the success of a campaign."] },
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

async function getProgramme(client, institution, actorId) {
  const found = await client.query("SELECT id,tenant_id,institution_id,campus_id,name,code FROM programmes WHERE tenant_id=$1 AND institution_id=$2 AND code=$3 FOR UPDATE", [institution.tenant_id, institution.id, PROGRAMME_CODE]);
  if (found.rows[0]) {
    if (found.rows[0].name !== PROGRAMME_NAME) throw new Error(`Programme code ${PROGRAMME_CODE} already belongs to a different programme.`);
    return { row: found.rows[0], created: false };
  }
  const inserted = await client.query(
    `INSERT INTO programmes (tenant_id,institution_id,campus_id,name,code,description,status,created_by,updated_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$8) RETURNING id,tenant_id,institution_id,campus_id,name,code`,
    [institution.tenant_id, institution.id, institution.campus_id ?? null, PROGRAMME_NAME, PROGRAMME_CODE, "Meta digital marketing certification course catalogue.", PUBLISHED, actorId],
  );
  return { row: inserted.rows[0], created: true };
}

async function getCourse(client, programme, actorId) {
  const found = await client.query("SELECT id,tenant_id,institution_id,campus_id,programme_id,title,code FROM courses WHERE tenant_id=$1 AND programme_id=$2 AND code=$3 FOR UPDATE", [programme.tenant_id, programme.id, COURSE.code]);
  if (found.rows[0]) {
    if (found.rows[0].title !== COURSE.title) throw new Error(`Course code ${COURSE.code} already belongs to a different course.`);
    return { row: found.rows[0], created: false };
  }
  const inserted = await client.query(
    `INSERT INTO courses (tenant_id,institution_id,campus_id,programme_id,title,code,description,thumbnail,status,created_by,updated_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,NULL,$8,$9,$9) RETURNING id,tenant_id,institution_id,campus_id,programme_id,title,code`,
    [programme.tenant_id, programme.institution_id, programme.campus_id ?? null, programme.id, COURSE.title, COURSE.code, COURSE.description, PUBLISHED, actorId],
  );
  return { row: inserted.rows[0], created: true };
}

async function getModule(client, course, definition, sequence, actorId) {
  const found = await client.query("SELECT id,tenant_id,course_id,title FROM course_modules WHERE tenant_id=$1 AND course_id=$2 AND sequence=$3 FOR UPDATE", [course.tenant_id, course.id, sequence]);
  if (found.rows[0]) {
    if (found.rows[0].title !== definition.title) throw new Error(`Module sequence ${sequence} is already occupied by "${found.rows[0].title}".`);
    return { row: found.rows[0], created: false };
  }
  const inserted = await client.query(
    `INSERT INTO course_modules (tenant_id,course_id,title,description,sequence,status,created_by,updated_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$7) RETURNING id,tenant_id,course_id,title`,
    [course.tenant_id, course.id, definition.title, `Meta Certified Digital Marketing Associate objective domain: ${definition.title}.`, sequence, PUBLISHED, actorId],
  );
  return { row: inserted.rows[0], created: true };
}

async function getLesson(client, module, title, sequence, actorId) {
  const found = await client.query("SELECT id,tenant_id,module_id,title FROM lessons WHERE tenant_id=$1 AND module_id=$2 AND sequence=$3 FOR UPDATE", [module.tenant_id, module.id, sequence]);
  if (found.rows[0]) {
    if (found.rows[0].title !== title) throw new Error(`Lesson sequence ${sequence} in "${module.title}" is already occupied by "${found.rows[0].title}".`);
    return { row: found.rows[0], created: false };
  }
  const inserted = await client.query(
    `INSERT INTO lessons (tenant_id,module_id,title,description,sequence,estimated_duration,status,created_by,updated_by)
     VALUES ($1,$2,$3,$4,$5,NULL,$6,$7,$7) RETURNING id,tenant_id,module_id,title`,
    [module.tenant_id, module.id, title, `Meta Certified Digital Marketing Associate objective: ${title}`, sequence, PUBLISHED, actorId],
  );
  return { row: inserted.rows[0], created: true };
}

async function addSourceResource(client, lesson, institution, actorId, pdf) {
  const found = await client.query("SELECT id,tenant_id,lesson_id,resource_type,title FROM learning_resources WHERE tenant_id=$1 AND lesson_id=$2 AND sequence=1 FOR UPDATE", [lesson.tenant_id, lesson.id]);
  if (found.rows[0]) {
    if (found.rows[0].title !== COURSE.resourceTitle || found.rows[0].resource_type !== "PDF") throw new Error("The first lesson already has a different learning resource.");
    return { created: false };
  }
  const inserted = await client.query(
    `INSERT INTO learning_resources (tenant_id,lesson_id,resource_type,title,url,file_path,duration,sequence,status,created_by,updated_by)
     VALUES ($1,$2,'PDF',$3,NULL,NULL,NULL,1,$4,$5,$5) RETURNING id,tenant_id,lesson_id`,
    [lesson.tenant_id, lesson.id, COURSE.resourceTitle, PUBLISHED, actorId],
  );
  const resource = inserted.rows[0];
  const storageKey = `${lesson.tenant_id}/${resource.id}/${COURSE.storageFilename}`;
  const destination = storagePathFor(storageKey);
  const createdPaths = [];
  if (await exists(destination)) {
    const hash = createHash("sha256").update(await readFile(destination)).digest("hex");
    if (hash !== pdf.sha256) throw new Error("The existing managed Meta PDF contains different content.");
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
  return { created: true };
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const buffer = await readFile(resolve(process.cwd(), SOURCE_PATH));
  const pdf = { buffer, filename: basename(SOURCE_PATH), byteSize: buffer.length, sha256: createHash("sha256").update(buffer).digest("hex") };
  const counts = { programmesCreated: 0, coursesCreated: 0, modulesCreated: 0, lessonsCreated: 0, resourcesCreated: 0 };
  try {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", ["citis-import-meta-digital-marketing-associate"]);
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
      const programmeResult = await getProgramme(client, institution, actorId);
      if (programmeResult.created) counts.programmesCreated += 1;
      const courseResult = await getCourse(client, programmeResult.row, actorId);
      if (courseResult.created) counts.coursesCreated += 1;
      let firstLesson;
      for (const [moduleIndex, definition] of COURSE.modules.entries()) {
        const moduleResult = await getModule(client, courseResult.row, definition, moduleIndex + 1, actorId);
        if (moduleResult.created) counts.modulesCreated += 1;
        for (const [lessonIndex, title] of definition.lessons.entries()) {
          const lessonResult = await getLesson(client, moduleResult.row, title, lessonIndex + 1, actorId);
          if (lessonResult.created) counts.lessonsCreated += 1;
          firstLesson ||= lessonResult.row;
        }
      }
      const resourceResult = await addSourceResource(client, firstLesson, institution, actorId, pdf);
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
  console.error(`Meta Digital Marketing Associate import failed: ${error instanceof Error ? error.message : error}`);
  process.exitCode = 1;
});