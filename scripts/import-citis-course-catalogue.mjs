import { createHash } from "node:crypto";
import { mkdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import unzipper from "unzipper";
import pg from "pg";

const { Pool } = pg;

const DEFAULT_SOURCE_PATH = "attached_assets/Courses_to_be_uploaded_on_CITIS_LMS_(2)_1788348250813.docx";
const DEMO_LEARNER_EMAIL = "learner.demo@citis.in";

const PROGRAMME_DEFINITIONS = [
  {
    code: "CITIS-CAREER-PATHWAY-PROGRAMS",
    name: "Career Pathway Programs",
    description: "Card A: Career Pathway. CITIS Industry Integrated Learning Programs (IILP).",
    category: "career",
  },
  {
    code: "CITIS-SPECIALIZATIONS",
    name: "Specializations",
    description: "Card A: Career Pathway. A 270-Hour Industry Integrated Career Specialization Program.",
    category: "specialization",
  },
  {
    code: "CITIS-CERTIFICATE-PROGRAMS",
    name: "Certificate & Professional Certificate Programs",
    description: "Card B: Certificate & Professional Certificate Programs.",
    category: "certificate",
  },
];

function assertEnvironment() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
}

function decodeXml(value) {
  return value.replace(/&(#x[0-9a-f]+|#[0-9]+|amp|lt|gt|apos|quot);/gi, (match, entity) => {
    if (entity.toLowerCase().startsWith("#x")) return String.fromCodePoint(parseInt(entity.slice(2), 16));
    if (entity.startsWith("#")) return String.fromCodePoint(parseInt(entity.slice(1), 10));
    return { amp: "&", lt: "<", gt: ">", apos: "'", quot: "\"" }[entity.toLowerCase()] || match;
  });
}

function textFromXml(xml) {
  return [...xml.matchAll(/<w:t(?: [^>]*)?>([\s\S]*?)<\/w:t>/g)]
    .map((match) => decodeXml(match[1]))
    .join("")
    .trim();
}

async function readDocxBlocks(sourcePath) {
  const archive = await unzipper.Open.file(sourcePath);
  const documentEntry = archive.files.find((entry) => entry.path === "word/document.xml");
  if (!documentEntry) throw new Error(`The DOCX does not contain word/document.xml: ${sourcePath}`);
  const xml = (await documentEntry.buffer()).toString("utf8");
  const body = xml.match(/<w:body>([\s\S]*?)<\/w:body>/)?.[1] || "";
  const blocks = [];
  const blockPattern = /<w:(p|tbl)\b[\s\S]*?<\/w:\1>/g;
  let match;

  while ((match = blockPattern.exec(body))) {
    const kind = match[1];
    const blockXml = match[0];
    if (kind === "p") {
      const text = textFromXml(blockXml);
      if (text) blocks.push({ kind: "p", text });
      continue;
    }

    const rows = [];
    for (const rowMatch of blockXml.matchAll(/<w:tr\b[\s\S]*?<\/w:tr>/g)) {
      const cells = [];
      for (const cellMatch of rowMatch[0].matchAll(/<w:tc\b[\s\S]*?<\/w:tc>/g)) {
        cells.push(textFromXml(cellMatch[0]));
      }
      rows.push(cells);
    }
    blocks.push({ kind: "tbl", rows });
  }
  return blocks;
}

function isDetailedCourseTitle(text) {
  return /^(Professional Program in|Specialization in)\s+.+$/.test(text);
}

function nextBoundary(blocks, start, end) {
  for (let index = start; index < end; index += 1) {
    const block = blocks[index];
    if (block.kind === "p" && (
      isDetailedCourseTitle(block.text)
      || block.text === "Recommended positioning:"
      || block.text.startsWith("A 270-Hour Industry Integrated Career Specialization Program")
      || block.text.startsWith("Card B :")
    )) {
      return index;
    }
  }
  return end;
}

function sectionContent(blocks) {
  const labels = new Set(["Overview", "Course Objectives", "Course Outcomes", "Key Content", "Industry Opportunity", "Job Roles Mapping"]);
  const sections = new Map();
  let current = null;

  for (const block of blocks) {
    if (block.kind === "p" && labels.has(block.text)) {
      current = block.text;
      sections.set(current, []);
      continue;
    }
    if (!current) continue;
    if (block.kind === "tbl" && current === "Key Content") {
      sections.get(current).push(...block.rows.slice(1).map(([number, topic]) => ({ number, topic })).filter((row) => row.number && row.topic));
    } else if (block.kind === "p" && block.text) {
      sections.get(current).push(block.text);
    }
  }
  return sections;
}

function formatSection(lines) {
  if (!lines?.length) return "";
  if (typeof lines[0] === "object") return lines.map((line) => `${line.number} — ${line.topic}`).join("\n");
  return lines.join("\n");
}

function detailedDescription(sections) {
  return ["Overview", "Course Objectives", "Course Outcomes", "Key Content", "Industry Opportunity", "Job Roles Mapping"]
    .filter((label) => sections.has(label))
    .map((label) => `${label}\n${formatSection(sections.get(label))}`)
    .join("\n\n");
}

function parseDetailedCourses(blocks, cardBIndex) {
  const courses = [];
  let index = 0;
  while (index < cardBIndex) {
    const block = blocks[index];
    if (block.kind !== "p" || !isDetailedCourseTitle(block.text)) {
      index += 1;
      continue;
    }
    const title = block.text;
    // The source repeats most course headings once before the Overview.
    const contentStart = blocks[index + 1]?.kind === "p" && blocks[index + 1].text === title ? index + 2 : index + 1;
    const contentEnd = nextBoundary(blocks, contentStart, cardBIndex);
    const sections = sectionContent(blocks.slice(contentStart, contentEnd));
    const keyContent = sections.get("Key Content") || [];
    if (!sections.has("Overview") || keyContent.length === 0) {
      throw new Error(`Could not parse the detailed course content for "${title}".`);
    }

    courses.push({
      title,
      description: detailedDescription(sections),
      modules: keyContent.map(({ number, topic }) => ({
        title: `Module ${number}`,
        description: topic,
        lessons: [{ title: topic, description: `Key Content — Module ${number}: ${topic}` }],
      })),
    });
    index = contentEnd;
  }
  return courses;
}

function parseCertificateCourses(blocks, cardBIndex) {
  const courses = [];
  let section = "";
  let group = "";

  for (const block of blocks.slice(cardBIndex + 1)) {
    if (block.kind !== "p") continue;
    if (/^Section \d+\s*:/.test(block.text)) {
      section = block.text;
      group = "";
      continue;
    }
    const entry = block.text.match(/^(\d+)\.\s*(.+?)Aligned to (.+)$/);
    if (entry) {
      const [, number, title, alignment] = entry;
      courses.push({
        number: Number(number),
        title,
        description: [
          section,
          group ? `Program group: ${group}` : "",
          `Aligned to ${alignment}`,
        ].filter(Boolean).join("\n"),
        modules: [{
          title: "Certificate alignment",
          description: `Aligned to ${alignment}`,
          lessons: [{ title: `Aligned to ${alignment}`, description: `Source catalogue entry ${number}: ${title}` }],
        }],
      });
      continue;
    }
    // These are the named program groups in Card B. They are retained in each
    // course description so the catalogue's original grouping is not lost.
    if (block.text && !block.text.startsWith("Card ")) group = block.text;
  }
  return courses;
}

function buildCatalogue(blocks) {
  const cardBIndex = blocks.findIndex((block) => block.kind === "p" && block.text === "Card B : Certificate & Professional Certificate Programs");
  if (cardBIndex < 0) throw new Error("The source DOCX is missing Card B: Certificate & Professional Certificate Programs.");

  const detailedCourses = parseDetailedCourses(blocks, cardBIndex);
  const certificateCourses = parseCertificateCourses(blocks, cardBIndex);
  const careerCourses = detailedCourses.filter((course) => course.title.startsWith("Professional Program in "));
  const specializationCourses = detailedCourses.filter((course) => course.title.startsWith("Specialization in "));
  const withNumberedCodes = (courses, prefix) => courses.map((course, index) => ({
    ...course,
    code: `${prefix}-${String(index + 1).padStart(2, "0")}`,
  }));

  if (careerCourses.length !== 12) throw new Error(`Expected 12 Career Pathway courses, found ${careerCourses.length}.`);
  if (specializationCourses.length !== 7) throw new Error(`Expected 7 Specializations, found ${specializationCourses.length}.`);
  if (certificateCourses.length !== 58) throw new Error(`Expected 58 Certificate & Professional Certificate courses, found ${certificateCourses.length}.`);

  return [
    { ...PROGRAMME_DEFINITIONS[0], courses: withNumberedCodes(careerCourses, "CITIS-CAREER") },
    { ...PROGRAMME_DEFINITIONS[1], courses: withNumberedCodes(specializationCourses, "CITIS-SPECIALIZATION") },
    {
      ...PROGRAMME_DEFINITIONS[2],
      courses: certificateCourses.map((course) => ({
        ...course,
        code: `CITIS-CERTIFICATE-${String(course.number).padStart(2, "0")}`,
      })),
    },
  ];
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

async function upsertProgramme(client, institution, definition, actorId, counts) {
  const existing = await client.query(
    `SELECT id, tenant_id, institution_id, campus_id, name, code, description, status
     FROM programmes
     WHERE tenant_id = $1 AND institution_id = $2 AND code = $3
     FOR UPDATE`,
    [institution.tenant_id, institution.id, definition.code],
  );
  if (existing.rows[0]) {
    if (existing.rows[0].name !== definition.name) {
      throw new Error(`Programme code ${definition.code} already belongs to "${existing.rows[0].name}".`);
    }
    const updated = await client.query(
      `UPDATE programmes
       SET description = $4, status = 'PUBLISHED', updated_by = $5, updated_at = now()
       WHERE id = $1 AND tenant_id = $2 AND institution_id = $3
       RETURNING id, tenant_id, institution_id, campus_id, name, code, description, status`,
      [existing.rows[0].id, institution.tenant_id, institution.id, definition.description, actorId],
    );
    counts.programmesUpdated += 1;
    return updated.rows[0];
  }

  const inserted = await client.query(
    `INSERT INTO programmes
      (tenant_id, institution_id, campus_id, name, code, description, status, created_by, updated_by)
     VALUES ($1, $2, $3, $4, $5, $6, 'PUBLISHED', $7, $7)
     RETURNING id, tenant_id, institution_id, campus_id, name, code, description, status`,
    [
      institution.tenant_id,
      institution.id,
      institution.campus_id ?? null,
      definition.name,
      definition.code,
      definition.description,
      actorId,
    ],
  );
  counts.programmesCreated += 1;
  return inserted.rows[0];
}

async function upsertCourse(client, programme, definition, actorId, counts) {
  const code = definition.code;
  let existing = await client.query(
    `SELECT id, tenant_id, institution_id, campus_id, programme_id, title, code, description, thumbnail, status
     FROM courses
     WHERE tenant_id = $1 AND programme_id = $2 AND code = $3
     FOR UPDATE`,
    [programme.tenant_id, programme.id, code],
  );
  if (!existing.rows[0]) {
    const legacy = await client.query(
      `SELECT id, tenant_id, institution_id, campus_id, programme_id, title, code, description, thumbnail, status
       FROM courses
       WHERE tenant_id = $1 AND programme_id = $2 AND title = $3
       FOR UPDATE`,
      [programme.tenant_id, programme.id, definition.title],
    );
    if (legacy.rows[0]) {
      if (!legacy.rows[0].code.startsWith(`${programme.code}-`)) {
        throw new Error(`Course title "${definition.title}" already belongs to unexpected code ${legacy.rows[0].code}.`);
      }
      const renamed = await client.query(
        `UPDATE courses
         SET code = $4, updated_by = $5, updated_at = now()
         WHERE id = $1 AND tenant_id = $2 AND programme_id = $3
         RETURNING id, tenant_id, institution_id, campus_id, programme_id, title, code, description, thumbnail, status`,
        [legacy.rows[0].id, programme.tenant_id, programme.id, code, actorId],
      );
      existing = renamed;
      counts.courseCodesUpdated += 1;
    }
  }
  if (existing.rows[0]) {
    if (existing.rows[0].title !== definition.title) {
      throw new Error(`Course code ${code} already belongs to "${existing.rows[0].title}".`);
    }
    const updated = await client.query(
      `UPDATE courses
       SET description = $4, status = 'PUBLISHED', updated_by = $5, updated_at = now()
       WHERE id = $1 AND tenant_id = $2 AND programme_id = $3
       RETURNING id, tenant_id, institution_id, campus_id, programme_id, title, code, description, thumbnail, status`,
      [existing.rows[0].id, programme.tenant_id, programme.id, definition.description, actorId],
    );
    counts.coursesUpdated += 1;
    return updated.rows[0];
  }

  const inserted = await client.query(
    `INSERT INTO courses
      (tenant_id, institution_id, campus_id, programme_id, title, code, description, thumbnail, status, created_by, updated_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NULL, 'PUBLISHED', $8, $8)
     RETURNING id, tenant_id, institution_id, campus_id, programme_id, title, code, description, thumbnail, status`,
    [
      programme.tenant_id,
      programme.institution_id,
      programme.campus_id ?? null,
      programme.id,
      definition.title,
      code,
      definition.description,
      actorId,
    ],
  );
  counts.coursesCreated += 1;
  return inserted.rows[0];
}

async function upsertModule(client, course, definition, sequence, actorId, counts) {
  const existing = await client.query(
    `SELECT id, tenant_id, course_id, title, description, sequence, status
     FROM course_modules
     WHERE tenant_id = $1 AND course_id = $2 AND sequence = $3
     FOR UPDATE`,
    [course.tenant_id, course.id, sequence],
  );
  if (existing.rows[0]) {
    const updated = await client.query(
      `UPDATE course_modules
       SET title = $4, description = $5, status = 'PUBLISHED', updated_by = $6, updated_at = now()
       WHERE id = $1 AND tenant_id = $2 AND course_id = $3
       RETURNING id, tenant_id, course_id, title, description, sequence, status`,
      [existing.rows[0].id, course.tenant_id, course.id, definition.title, definition.description, actorId],
    );
    counts.modulesUpdated += 1;
    return updated.rows[0];
  }

  const inserted = await client.query(
    `INSERT INTO course_modules
      (tenant_id, course_id, title, description, sequence, status, created_by, updated_by)
     VALUES ($1, $2, $3, $4, $5, 'PUBLISHED', $6, $6)
     RETURNING id, tenant_id, course_id, title, description, sequence, status`,
    [course.tenant_id, course.id, definition.title, definition.description, sequence, actorId],
  );
  counts.modulesCreated += 1;
  return inserted.rows[0];
}

async function upsertLesson(client, module, definition, sequence, actorId, counts) {
  const existing = await client.query(
    `SELECT id, tenant_id, module_id, title, description, sequence, estimated_duration, status
     FROM lessons
     WHERE tenant_id = $1 AND module_id = $2 AND sequence = $3
     FOR UPDATE`,
    [module.tenant_id, module.id, sequence],
  );
  if (existing.rows[0]) {
    const updated = await client.query(
      `UPDATE lessons
       SET title = $4, description = $5, status = 'PUBLISHED', updated_by = $6, updated_at = now()
       WHERE id = $1 AND tenant_id = $2 AND module_id = $3
       RETURNING id, tenant_id, module_id, title, description, sequence, estimated_duration, status`,
      [existing.rows[0].id, module.tenant_id, module.id, definition.title, definition.description ?? null, actorId],
    );
    counts.lessonsUpdated += 1;
    return updated.rows[0];
  }

  const inserted = await client.query(
    `INSERT INTO lessons
      (tenant_id, module_id, title, description, sequence, estimated_duration, status, created_by, updated_by)
     VALUES ($1, $2, $3, $4, $5, NULL, 'PUBLISHED', $6, $6)
     RETURNING id, tenant_id, module_id, title, description, sequence, estimated_duration, status`,
    [module.tenant_id, module.id, definition.title, definition.description ?? null, sequence, actorId],
  );
  counts.lessonsCreated += 1;
  return inserted.rows[0];
}

async function upsertSourceResource(client, lesson, institution, source, courseTitle, actorId, counts) {
  const resourceTitle = `Course catalogue source — ${courseTitle}`;
  const existing = await client.query(
    `SELECT id, tenant_id, lesson_id, resource_type, title, url, file_path, duration, sequence, status
     FROM learning_resources
     WHERE tenant_id = $1 AND lesson_id = $2 AND sequence = 1
     FOR UPDATE`,
    [lesson.tenant_id, lesson.id],
  );
  let resource;
  if (existing.rows[0]) {
    if (existing.rows[0].title !== resourceTitle || existing.rows[0].resource_type !== "DOCUMENT") {
      throw new Error(`Learning resource sequence 1 in "${lesson.title}" is already occupied by another resource.`);
    }
    const updated = await client.query(
      `UPDATE learning_resources
       SET status = 'PUBLISHED', updated_by = $3, updated_at = now()
       WHERE id = $1 AND tenant_id = $2
       RETURNING id, tenant_id, lesson_id, resource_type, title, url, file_path, duration, sequence, status`,
      [existing.rows[0].id, lesson.tenant_id, actorId],
    );
    resource = updated.rows[0];
    counts.resourcesUpdated += 1;
  } else {
    const inserted = await client.query(
      `INSERT INTO learning_resources
        (tenant_id, lesson_id, resource_type, title, url, file_path, duration, sequence, status, created_by, updated_by)
       VALUES ($1, $2, 'DOCUMENT', $3, NULL, NULL, NULL, 1, 'PUBLISHED', $4, $4)
       RETURNING id, tenant_id, lesson_id, resource_type, title, url, file_path, duration, sequence, status`,
      [lesson.tenant_id, lesson.id, resourceTitle, actorId],
    );
    resource = inserted.rows[0];
    counts.resourcesCreated += 1;
  }

  const storageKey = `${lesson.tenant_id}/${resource.id}/courses-to-be-uploaded-on-citis-lms.docx`;
  const destination = storagePathFor(storageKey);
  const sourceSha256 = createHash("sha256").update(source.buffer).digest("hex");
  if (await fileExists(destination)) {
    const currentHash = createHash("sha256").update(await readFile(destination)).digest("hex");
    if (currentHash !== sourceSha256) throw new Error(`The managed course catalogue file for "${courseTitle}" differs from the source DOCX.`);
  } else {
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, source.buffer, { flag: "wx" });
  }

  const managed = await client.query(
    `SELECT id, sha256, storage_key
     FROM managed_files
     WHERE tenant_id = $1 AND resource_id = $2
     FOR UPDATE`,
    [lesson.tenant_id, resource.id],
  );
  if (managed.rows[0]) {
    if (managed.rows[0].sha256 !== sourceSha256 || managed.rows[0].storage_key !== storageKey) {
      throw new Error(`The managed course catalogue file for "${courseTitle}" differs from the source DOCX.`);
    }
  } else {
    try {
      await client.query(
        `INSERT INTO managed_files
          (tenant_id, institution_id, campus_id, resource_id, kind, storage_key, original_filename, mime_type, byte_size, sha256, entrypoint, created_by)
         VALUES ($1, $2, $3, $4, 'FILE', $5, $6, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', $7, $8, NULL, $9)`,
        [
          lesson.tenant_id,
          institution.id,
          institution.campus_id ?? null,
          resource.id,
          storageKey,
          basename(source.path),
          source.buffer.length,
          sourceSha256,
          actorId,
        ],
      );
    } catch (error) {
      if (!managed.rows[0]) await unlink(destination).catch(() => {});
      throw error;
    }
  }
  return resource;
}

async function upsertDemoEnrollment(client, institution, course, learnerId, actorId, counts) {
  const existing = await client.query(
    `SELECT id, status
     FROM lms_enrollments
     WHERE tenant_id = $1 AND institution_id = $2 AND course_id = $3 AND learner_id = $4
     ORDER BY CASE WHEN status = 'ACTIVE' THEN 0 ELSE 1 END, created_at DESC
     LIMIT 1
     FOR UPDATE`,
    [course.tenant_id, institution.id, course.id, learnerId],
  );
  if (existing.rows[0]?.status === "ACTIVE") return;
  if (existing.rows[0]) {
    await client.query(
      `UPDATE lms_enrollments
       SET status = 'ACTIVE', enrolled_by = $2, removed_by = NULL, removed_at = NULL, enrolled_at = now(), updated_at = now()
       WHERE id = $1`,
      [existing.rows[0].id, actorId],
    );
    counts.demoEnrollmentsReactivated += 1;
    return;
  }

  await client.query(
    `INSERT INTO lms_enrollments
      (tenant_id, institution_id, campus_id, course_id, learner_id, status, enrolled_by)
     VALUES ($1, $2, $3, $4, $5, 'ACTIVE', $6)`,
    [course.tenant_id, institution.id, course.campus_id ?? null, course.id, learnerId, actorId],
  );
  counts.demoEnrollmentsCreated += 1;
}

async function importCourse(client, institution, programme, definition, source, actorId, counts, learnerId) {
  const course = await upsertCourse(client, programme, definition, actorId, counts);
  let firstLesson = null;
  for (const [moduleIndex, moduleDefinition] of definition.modules.entries()) {
    const module = await upsertModule(client, course, moduleDefinition, moduleIndex + 1, actorId, counts);
    for (const [lessonIndex, lessonDefinition] of moduleDefinition.lessons.entries()) {
      const lesson = await upsertLesson(client, module, lessonDefinition, lessonIndex + 1, actorId, counts);
      if (!firstLesson) firstLesson = lesson;
    }
  }
  if (!firstLesson) throw new Error(`Course "${definition.title}" does not contain any lessons.`);
  await upsertSourceResource(client, firstLesson, institution, source, definition.title, actorId, counts);
  if (learnerId) await upsertDemoEnrollment(client, institution, course, learnerId, actorId, counts);
  return course;
}

async function main() {
  assertEnvironment();
  const sourcePath = resolve(process.cwd(), process.env.CITIS_COURSE_CATALOGUE_PATH || DEFAULT_SOURCE_PATH);
  const sourceBuffer = await readFile(sourcePath);
  if (!sourceBuffer.length) throw new Error(`The source DOCX is empty: ${sourcePath}`);
  const blocks = await readDocxBlocks(sourcePath);
  const catalogue = buildCatalogue(blocks);
  const source = { path: sourcePath, buffer: sourceBuffer };
  const counts = {
    programmesCreated: 0,
    programmesUpdated: 0,
    coursesCreated: 0,
    coursesUpdated: 0,
    modulesCreated: 0,
    modulesUpdated: 0,
    lessonsCreated: 0,
    lessonsUpdated: 0,
    resourcesCreated: 0,
    resourcesUpdated: 0,
    courseCodesUpdated: 0,
    demoEnrollmentsCreated: 0,
    demoEnrollmentsReactivated: 0,
  };
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", ["citis-import-course-catalogue"]);

      const institutionResult = process.env.INSTITUTION_ID
        ? await client.query(
          `SELECT id, tenant_id
           FROM institutions
           WHERE id = $1 AND status <> 'ARCHIVED'`,
          [process.env.INSTITUTION_ID],
        )
        : await client.query(
          `SELECT id, tenant_id
           FROM institutions
           WHERE status <> 'ARCHIVED'
           ORDER BY created_at ASC, id ASC`,
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

      let learnerId = null;
      if (process.env.SEED_DEMO_ENROLLMENTS !== "false") {
        const learnerResult = await client.query(
          `SELECT u.id
           FROM users u
           JOIN user_roles ur ON ur.user_id = u.id AND ur.tenant_id = u.tenant_id
           JOIN roles r ON r.id = ur.role_id AND r.tenant_id = ur.tenant_id
           WHERE u.tenant_id = $1 AND lower(u.email) = lower($2)
             AND u.status <> 'ARCHIVED' AND r.code = 'STUDENT'
           LIMIT 1`,
          [institution.tenant_id, DEMO_LEARNER_EMAIL],
        );
        learnerId = learnerResult.rows[0]?.id ?? null;
      }

      const importedCourses = [];
      for (const programmeDefinition of catalogue) {
        const programme = await upsertProgramme(client, institution, programmeDefinition, actorId, counts);
        for (const courseDefinition of programmeDefinition.courses) {
          const course = await importCourse(client, institution, programme, courseDefinition, source, actorId, counts, learnerId);
          importedCourses.push({ programme: programme.name, ...course });
        }
      }

      await client.query("COMMIT");
      console.log(JSON.stringify({
        status: "PUBLISHED",
        source: sourcePath,
        parsedCounts: {
          programmes: catalogue.length,
          careerPathwayPrograms: catalogue[0].courses.length,
          specializations: catalogue[1].courses.length,
          certificatePrograms: catalogue[2].courses.length,
        },
        demoLearnerEnrollments: learnerId ? DEMO_LEARNER_EMAIL : "not found or disabled",
        counts,
        courses: importedCourses.map((course) => ({
          programme: course.programme,
          code: course.code,
          title: course.title,
          courseId: course.id,
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
  console.error(`CITIS course catalogue import failed: ${error instanceof Error ? error.message : error}`);
  process.exitCode = 1;
});