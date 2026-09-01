import { createHash } from "node:crypto";
import { mkdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import pg from "pg";

const { Pool } = pg;

const PROGRAMME_CODE = "ADOBE-CERTIFIED-PROFESSIONAL";
const PROGRAMME_NAME = "Adobe Certified Professional";

const COURSE_DEFINITIONS = [
  {
    code: "INDESIGN-ACP",
    title: "Adobe Certified Professional in Print & Digital Media Publication Using Adobe InDesign 2021 (v 16.x)",
    sourcePath: "attached_assets/AC_PRO_Exam_Objectives_Indesign_0923_1788273953200.pdf",
    resourceTitle: "Source PDF — Adobe InDesign Exam Objectives (2021 v16.x)",
    storageFilename: "adobe-indesign-exam-objectives.pdf",
    description:
      "Adobe Certified Professional certification objectives for print and digital media publication using Adobe InDesign.",
    modules: [
      {
        title: "Working in the Design Industry",
        lessons: [
          "1.1 Identify the purpose, audience, and audience needs for preparing publications.",
          "1.2 Communicate with colleagues and clients about design plans.",
          "1.3 Determine the type of copyright, permissions, and licensing required to use specific content.",
          "1.4 Demonstrate an understanding of key terminology related to publications.",
          "1.5 Demonstrate knowledge of basic design principles and best practices employed in the design industry.",
        ],
      },
      {
        title: "Project Setup and Interface",
        lessons: [
          "2.1 Create a document with the appropriate settings for web, print, and mobile.",
          "2.2 Navigate, organize, and customize the application workspace.",
          "2.3 Use non-printing design tools in the interface to aid in design or workflow.",
          "2.4 Import assets into a project.",
          "2.5 Manage colors, swatches, and gradients.",
          "2.6 Manage paragraph, character, and object styles.",
        ],
      },
      {
        title: "Organizing Documents",
        lessons: [
          "3.1 Use layers to manage design elements.",
          "3.2 Manage and modify pages.",
        ],
      },
      {
        title: "Creating and Modifying Document Elements",
        lessons: [
          "4.1 Use core tools and features to lay out visual elements.",
          "4.2 Add and manipulate text using appropriate typographic settings.",
          "4.3 Make, manage, and edit selections.",
          "4.4 Transform digital graphics and media within a publication.",
          "4.5 Use basic reconstructing and editing techniques to manipulate document content.",
          "4.6 Modify the appearance of design elements by using effects and styles.",
          "4.7 Add interactive or dynamic content or media to a project.",
          "4.8 Create and edit tables.",
        ],
      },
      {
        title: "Publishing Documents",
        lessons: [
          "5.1 Prepare documents for publishing to web, print, and other digital devices.",
          "5.2 Export or save documents to various file formats.",
        ],
      },
    ],
  },
  {
    code: "ILLUSTRATOR-ACP",
    title: "Adobe Certified Professional in Graphic Design and Illustration Using Adobe Illustrator",
    sourcePath: "attached_assets/AC_PRO_Exam_Objectives_Illustrator_0923_(1)_1788273953200.pdf",
    resourceTitle: "Source PDF — Adobe Illustrator Exam Objectives (2022–2023)",
    storageFilename: "adobe-illustrator-exam-objectives.pdf",
    description:
      "Adobe Certified Professional certification objectives for graphic design and illustration using Adobe Illustrator.",
    modules: [
      {
        title: "Working in the Design Industry",
        lessons: [
          "1.1 Identify the purpose, audience, and audience needs for preparing designs and artwork.",
          "1.2 Communicate with colleagues and clients about design plans.",
          "1.3 Determine the type of copyright, permissions, and licensing required to use specific content.",
          "1.4 Demonstrate an understanding of key terminology related to digital graphics.",
          "1.5 Demonstrate knowledge of basic design principles and best practices employed in the design industry.",
        ],
      },
      {
        title: "Project Setup and Interface",
        lessons: [
          "2.1 Create a document with the appropriate settings for mobile, web, print, film and video, or art and illustration.",
          "2.2 Navigate, organize, and customize the application workspace.",
          "2.3 Use non-printing design tools in the interface to aid in design or workflow.",
          "2.4 Manage assets in a project.",
          "2.5 Manage colors, swatches, and gradients.",
          "2.6 Manage preset brushes, symbols, styles, and patterns.",
        ],
      },
      {
        title: "Organizing Documents",
        lessons: [
          "3.1 Use layers to manage design elements.",
          "3.2 Modify layer visibility using opacity and masks.",
        ],
      },
      {
        title: "Creating and Modifying Visual Elements",
        lessons: [
          "4.1 Use core tools and features to create visual elements.",
          "4.2 Add and manipulate text using appropriate typographic settings.",
          "4.3 Make, manage, and manipulate selections.",
          "4.4 Transform digital graphics and media.",
          "4.5 Use basic reconstructing and editing techniques to manipulate digital graphics and media.",
          "4.6 Modify the appearance of design elements using effects and graphic styles.",
        ],
      },
      {
        title: "Publishing Digital Media",
        lessons: [
          "5.1 Prepare images for export to web, print, and video.",
          "5.2 Export or save digital images to various file formats.",
        ],
      },
    ],
  },
  {
    code: "EXPRESS-ACP",
    title: "Adobe Certified Professional in Content Creation and Marketing Using Adobe Express",
    sourcePath: "attached_assets/AC_PRO_Exam_Objectives_Express_0624_1788273953201.pdf",
    resourceTitle: "Source PDF — Adobe Express Exam Objectives",
    storageFilename: "adobe-express-exam-objectives.pdf",
    description:
      "Adobe Certified Professional certification objectives for content creation and marketing using Adobe Express.",
    modules: [
      {
        title: "Digital Marketing Principles",
        lessons: [
          "1.1 Summarize promotion concepts.",
          "1.2 Implement target marketing strategies, concepts, and principles.",
          "1.3 Adapt and apply branding to content.",
          "1.4 Use content creation strategies and best practices.",
          "1.5 Identify content optimization methods and distribution channels.",
          "1.6 Automate and monitor social media promotions.",
        ],
      },
      {
        title: "Design Principles",
        lessons: [
          "2.1 Apply basic visual design concepts.",
          "2.2 Explain design processes.",
          "2.3 Identify accessibility requirements.",
          "2.4 Use assets ethically.",
        ],
      },
      {
        title: "Content Creation and Modification",
        lessons: [
          "3.1 Create graphics and publications.",
          "3.2 Create video, audio, and animation.",
          "3.3 Create webpages.",
          "3.4 Add and modify text.",
          "3.5 Use templates.",
          "3.6 Edit and convert files.",
          "3.7 Increase audience reach.",
        ],
      },
      {
        title: "Content Management",
        lessons: [
          "4.1 Create a library of assets.",
          "4.2 Organize files.",
          "4.3 Create templates.",
          "4.4 Create content for multiple platforms.",
        ],
      },
      {
        title: "Sharing and Publishing",
        lessons: [
          "5.1 Collaborate with team members and clients.",
          "5.2 Publish and schedule content.",
          "5.3 Export content in appropriate formats.",
        ],
      },
    ],
  },
  {
    code: "DREAMWEAVER-ACP",
    title: "Adobe Certified Professional in Web Authoring Using Adobe Dreamweaver 2021 (v 21.x)",
    sourcePath: "attached_assets/AC_PRO_Exam_Objectives_DW_0923_1788273953201.pdf",
    resourceTitle: "Source PDF — Adobe Dreamweaver Exam Objectives (2021 v21.x)",
    storageFilename: "adobe-dreamweaver-exam-objectives.pdf",
    description:
      "Adobe Certified Professional certification objectives for web authoring using Adobe Dreamweaver.",
    modules: [
      {
        title: "Working in the Web Industry",
        lessons: [
          "1.1 Identify the purpose, audience, and audience needs for preparing websites.",
          "1.2 Communicate with colleagues and clients throughout the project.",
          "1.3 Demonstrate an understanding of the type of permissions required to use specific content.",
          "1.4 Demonstrate an understanding of key technologies related to web design and development.",
          "1.5 Demonstrate knowledge of basic design principles and best practices employed in the industry.",
        ],
      },
      {
        title: "Project Setup and Interface",
        lessons: [
          "2.1 Create a new site with the appropriate settings.",
          "2.2 Navigate, organize, and customize the application workspace.",
          "2.3 Use non-visible design tools in the interface to aid in project workflow.",
          "2.4 Manage assets in a project.",
        ],
      },
      {
        title: "Organizing Content on a Page",
        lessons: [
          "3.1 Organize page structure.",
          "3.2 Apply responsive and adaptive design concepts.",
        ],
      },
      {
        title: "Working with Code to Create and Modify Content",
        lessons: [
          "4.1 Organize and display content using HTML.",
          "4.2 Apply table and semantic elements to describe content.",
          "4.3 Style a web page using CSS",
          "4.4 Add interactivity using JavaScript",
        ],
      },
      {
        title: "Publishing Digital Media",
        lessons: [
          "5.1 Prepare project for publishing.",
          "5.2 Publish a web site.",
        ],
      },
    ],
  },
];

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
     VALUES ($1, $2, $3, $4, $5, $6, 'DRAFT', $7, $7)
     RETURNING id, tenant_id, institution_id, campus_id, name, code, description, status`,
    [
      institution.tenant_id,
      institution.id,
      institution.campus_id ?? null,
      PROGRAMME_NAME,
      PROGRAMME_CODE,
      "Adobe Certified Professional certification course catalogue.",
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
     VALUES ($1, $2, $3, $4, $5, $6, $7, NULL, 'DRAFT', $8, $8)
     RETURNING id, tenant_id, institution_id, campus_id, programme_id, title, code, description, thumbnail, status`,
    [
      programme.tenant_id,
      programme.institution_id,
      programme.campus_id ?? null,
      programme.id,
      definition.title,
      definition.code,
      definition.description,
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
     VALUES ($1, $2, $3, $4, $5, 'DRAFT', $6, $6)
     RETURNING id, tenant_id, course_id, title, description, sequence, status`,
    [
      course.tenant_id,
      course.id,
      definition.title,
      `Adobe Certified Professional objective area: ${definition.title}.`,
      sequence,
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
     VALUES ($1, $2, $3, $4, $5, NULL, 'DRAFT', $6, $6)
     RETURNING id, tenant_id, module_id, title, description, sequence, estimated_duration, status`,
    [
      module.tenant_id,
      module.id,
      title,
      `Adobe Certified Professional exam objective: ${title}`,
      sequence,
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
     VALUES ($1, $2, 'PDF', $3, NULL, NULL, NULL, 1, 'DRAFT', $4, $4)
     RETURNING id, tenant_id, lesson_id, resource_type, title, url, file_path, duration, sequence, status`,
    [lesson.tenant_id, lesson.id, definition.resourceTitle, createdBy],
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
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", ["citis-import-adobe-objectives-courses"]);

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
        status: "DRAFT_ONLY",
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
  console.error(`Adobe objectives import failed: ${error instanceof Error ? error.message : error}`);
  process.exitCode = 1;
});