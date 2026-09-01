import { createHash } from "node:crypto";
import { mkdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import pg from "pg";

const { Pool } = pg;

const DEFAULT_PDF_PATH = "attached_assets/AC_PRO_Exam_Objectives_Acrobat_0624_(1)_1788254000647.pdf";
const PROGRAMME_CODE = "ADOBE-CERTIFIED-PROFESSIONAL";
const COURSE_CODE = "ACROBAT-PRO-ACP";
const RESOURCE_TITLE = "Source PDF — Adobe Acrobat Pro Exam Objectives (June 2024)";

const courseDescription = [
  "Adobe Certified Professional certifications, delivered by Certiport, are the official, industry-recognized credentials that validate entry-level proficiency in Adobe Creative Cloud applications and foundational knowledge for digital media careers.",
  "",
  "The Document Creation and Management Using Adobe Acrobat Pro exam is 50-minutes in length, comprised of two sections—selected-response items followed by live-in-the-app tasks inside Acrobat Pro. The Target Candidate has approximately 150 hours of instruction and hands-on experience with the product and is familiar with product features, capabilities, and relevant career concepts.",
  "",
  "Source note: All Key Terms, Key Tools, Key Concepts, and Key Settings in the source are examples and not a comprehensive list."
].join("\n");

const modules = [
  {
    title: "Working in Document Management",
    description: "These objectives cover critical concepts related to working with colleagues and clients as well as crucial legal, technical, and document management-related knowledge.",
    lessons: [
      {
        title: "1.1 Identify the purpose, audience, and audience needs when preparing documents.",
        description: [
          "Objective 1.1: Identify the purpose, audience, and audience needs when preparing documents.",
          "1.1.a Determine whether content is relevant to the purpose, audience, audience needs, user experience, and has an appropriate configuration for target devices.",
          "Key Terms: client goals, target audience, demographics, accessibility, etc.",
          "1.1.b Identify requirements based on how the document will be used, including web, print, and mobile."
        ].join("\n")
      },
      {
        title: "1.2 Communicate with colleagues and clients about document development.",
        description: [
          "Objective 1.2: Communicate with colleagues and clients about document development.",
          "1.2.a Demonstrate knowledge of techniques for communicating about document development with peers and clients.",
          "Key Terms: document requirements, specifications, versions, change orders, drafts, etc.",
          "1.2.b Demonstrate knowledge of basic project management concepts.",
          "Key Terms: project scope, scope creep, document sharing, cloud collaboration and file management."
        ].join("\n")
      },
      {
        title: "1.3 Determine the appropriate type of copyright, permissions, and licensing required to use specific content.",
        description: [
          "Objective 1.3: Determine the appropriate type of copyright, permissions, and licensing required to use specific content.",
          "1.3.a Identify legal and ethical considerations for using third-party content, such as copyright, permissions, and licensing.",
          "Key Concepts: Creative Commons, public domain, intellectual property, derivative work, commercial use, attribution, work for hire, fair use, fair dealing, images, graphics, rich media, etc."
        ].join("\n")
      },
      {
        title: "1.4 Demonstrate an understanding of best practices for the design and layout of a professional document.",
        description: [
          "Objective 1.4: Demonstrate an understanding of best practices for the design and layout of a professional document.",
          "1.4.a Demonstrate knowledge of document specification terminology.",
          "Key Terms: resolution, file types (*.txt, *.pdf, *.rtf, *.md, *.jpg, *.png, *.svg, *.docx, *.pptx, *.xlsx, *.xml, *.html, etc.), document output file sizes, typeface, resizing, aspect ratio, units of measurement (inches, pixels, centimeters), metadata, etc.",
          "1.4.b Define document layout terms and principles.",
          "Key Terms: orientation, text justification and alignment, line and paragraph spacing, foreground, background, color, hierarchy (outline), readability spacing, grids, callouts, pull quotes, title, header, block quote, footer, caption, table of contents, index, page size, page orientation, facing pages, column, gutter, margin, etc.",
          "1.4.c Identify and use common typographic adjustments to create contrast, hierarchy, and enhanced readability.",
          "Key Terms: font (typeface), size, style (bold, italics, underline), color, alignment, tracking (character spacing), leading (line spacing), horizontal scale, line length, serif vs. sans-serif, etc.",
          "1.4.d Recognize the need for embedding fonts.",
          "Key Terms: 12 basic principles of animation (squash and stretch, anticipation, staging, straight ahead action and pose to pose, follow through and overlapping action, slow in and slow out, arc, secondary action, timing, exaggeration, solid drawing, and appeal), etc."
        ].join("\n")
      }
    ]
  },
  {
    title: "Acrobat Workspace",
    description: "These objectives cover the interface setup and program settings that assist in an efficient and effective workflow.",
    lessons: [
      {
        title: "2.1 Navigate and organize the application workspace.",
        description: [
          "Objective 2.1: Navigate and organize the application workspace.",
          "2.1.a Prepare Acrobat to work on a document.",
          "Key Concepts: All tools view, minimize, expand, add, remove, and reposition tools.",
          "2.1.b Configure application preferences.",
          "Key Concepts: Commenting, Documents, Full Screen, General, Page Display, Convert From PDF, Convert to PDF, Units and Guides, Accessibility."
        ].join("\n")
      },
      {
        title: "2.2 Use non-printing design tools in the interface to aid in design or workflow.",
        description: [
          "Objective 2.2: Use non-printing design tools in the interface to aid in design or workflow.",
          "2.2.a Use rulers.",
          "Key Concepts: showing and hiding rulers, changing the measurement unit on rulers, Guides, etc.",
          "2.2.b Navigate, view and zoom in documents to work efficiently.",
          "Key Concepts: Full-screen mode, Single Page View, Enable Scrolling, Two Page View, Two Page Scrolling, Dynamic Zooming, Read Mode, Zoom to Page Level, Marquee Zoom, Loupe Tool, Page Navigation, Automatic Scroll, Reflow Mode, Grids, Snap to Grid, Line Weight, etc."
        ].join("\n")
      }
    ]
  },
  {
    title: "Creating and Organizing PDFs",
    description: "These objectives cover methods of creating a PDF and a PDF portfolio, as well as organizing the pages.",
    lessons: [
      {
        title: "3.1 Create a document from the appropriate source.",
        description: [
          "Objective 3.1: Create a document from the appropriate source.",
          "3.1.a Create a PDF from a single file.",
          "File types: Word, Excel, PowerPoint, Photoshop, Illustrator, InDesign, Text file.",
          "3.1.b Create a PDF from multiple files.",
          "Key features: Combine files into a single PDF, creating multiple PDFs at the same time.",
          "3.1.c Create a PDF from a scanner.",
          "3.1.d Create a PDF from a web page.",
          "3.1.e Create a PDF from the clipboard."
        ].join("\n")
      },
      {
        title: "3.2 Set appropriate document settings for printed and onscreen viewing.",
        description: [
          "Objective 3.2: Set appropriate document settings for printed and onscreen viewing.",
          "3.2.a Set Initial View properties.",
          "Key Concepts: layout, magnification, facing pages, initial page, navigation tab.",
          "3.2.b Set Page Boxes.",
          "Key Concepts: width, height, margins, orientation, pages, XOffset and YOffset, page range, etc."
        ].join("\n")
      },
      {
        title: "3.3 Organize pages.",
        description: [
          "Objective 3.3: Organize pages.",
          "3.3.a Insert, delete, and reorder pages in a document.",
          "Key Tools: inserting/deleting pages, selecting pages, rearranging pages, extracting, splitting, rotating, replacing, page labels (numbering), page transitions."
        ].join("\n")
      },
      {
        title: "3.4 Create and edit portfolios.",
        description: [
          "Objective 3.4: Create and edit portfolios.",
          "3.4.a Create, edit, and organize multiple files into a PDF Portfolio.",
          "Key Tools: adding/deleting, drag and drop, previewing, editing, sorting, searching.",
          "Key Concepts: independence of source files, reusing files in multiple portfolios."
        ].join("\n")
      }
    ]
  },
  {
    title: "Editing PDFs",
    description: "These objectives cover the tools that allow you to add and format content on each page.",
    lessons: [
      {
        title: "4.1 Add and format text.",
        description: [
          "Objective 4.1: Add and format text.",
          "4.1.a Use type tools to add text.",
          "Key Tools: text frames, Add Text tool.",
          "4.1.b Use appropriate text settings.",
          "Key Settings: font, font style (bold, italic, superscript, subscript), size, character spacing, line spacing, horizontal and paragraph spacing, and color, alignment, numbered and bulleted lists, justification.",
          "4.1.c Recognize text to make it editable.",
          "Key Tools: Scan & OCR."
        ].join("\n")
      },
      {
        title: "4.2 Add assets to a PDF.",
        description: [
          "Objective 4.2: Add assets to a PDF.",
          "4.2.a Add images.",
          "4.2.b Attach files.",
          "4.2.c Add Rich Media.",
          "4.2.d Add Headers and Footers."
        ].join("\n")
      },
      {
        title: "4.3 Select and modify objects.",
        description: [
          "Objective 4.3: Select and modify objects.",
          "4.3.a Select objects.",
          "Key Tools: keyboard modifiers, selecting multiple objects.",
          "4.3.b ransform objects.",
          "Key Tools: moving, cut, copy, paste, flip, arrange, rotate, align, crop image."
        ].join("\n")
      },
      {
        title: "4.4 Add and remove links and bookmarks.",
        description: [
          "Objective 4.4: Add and remove links and bookmarks.",
          "4.4.a Add links to documents.",
          "4.4.b Add bookmarks to documents."
        ].join("\n")
      },
      {
        title: "4.5 Prepare forms.",
        description: [
          "Objective 4.5: Prepare forms.",
          "4.5.a Create and modify forms.",
          "Key Elements: text fields, check boxes, radio buttons, lists, drop-down lists, buttons, data fields, signature fields, bar code fields.",
          "Key Tools: align, center, match size, distribute.",
          "Key Functions: Importing data, exporting data, merging data, clearing form, preparing form for e-signature, changing field properties, duplicating across pages, creating multiple copies."
        ].join("\n")
      }
    ]
  },
  {
    title: "Sharing and Reviewing PDFs",
    description: "These objectives cover the collaboration features of Acrobat.",
    lessons: [
      {
        title: "5.1 Share and review documents.",
        description: [
          "Objective 5.1: Share and review documents.",
          "5.1.a Share PDFs.",
          "Key Tools: Share File/Send for Comment.",
          "5.1.b Annotate documents.",
          "Key Tools: Add sticky note, Highlight text, Underline, Strikethrough, Add note to replace text, Insert text a cursor, Add text comments, Add text box, Erase drawing, Add stamp, Add new attachment, Drawing tools, Keep tool selected, Change color, Line thickness, add Watermarks."
        ].join("\n")
      },
      {
        title: "5.2 Use Acrobat proofreading and error correction tools.",
        description: [
          "Objective 5.2: Use Acrobat proofreading and error correction tools.",
          "5.2.a Use various tools to revise and refine project content.",
          "Key Tools: find/replace, advanced search, modify dictionary, dictionary language, spell check."
        ].join("\n")
      }
    ]
  },
  {
    title: "Protecting, Standardizing, and Exporting",
    description: "These objectives cover ensuring a document meets accessibility standards, redacting private data, exporting, and printing documents in multiple formats.",
    lessons: [
      {
        title: "6.1 Make the document accessible.",
        description: [
          "Objective 6.1: Make the document accessible.",
          "6.1.a Add accessibility features to a document.",
          "Key Concepts: Alternate text, document title, document description, Accessibility Setup Assistant."
        ].join("\n")
      },
      {
        title: "6.2 Redact documents.",
        description: [
          "Objective 6.2: Redact documents.",
          "6.2.a Prepare documents for external users.",
          "Key Tools: Redact documents."
        ].join("\n")
      },
      {
        title: "6.3 Protect documents.",
        description: [
          "Objective 6.3: Protect documents.",
          "6.3.a Secure documents.",
          "Key Tools: Protect using password, Remove hidden information, Encrypt with password, prevent editing/printing."
        ].join("\n")
      },
      {
        title: "6.4 Export and print PDFs.",
        description: [
          "Objective 6.4: Export and print PDFs.",
          "6.4.a Save, export, or distribute in appropriate formats for print, screen or online.",
          "Key Formats: PDF, Microsoft Word, Microsoft Excel, Microsoft PowerPoint, Image, HTML Page, Rich Text Format, Plain Text, including associated settings.",
          "6.4.b Reduce file size or compress PDF.",
          "6.4.c Print documents.",
          "Key Concepts: Page sizing and handling options, Comments, Orientation, Print on both sides of paper, printing grayscale, page range, number of copies."
        ].join("\n")
      }
    ]
  }
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
    if (existing.rows[0].name !== "Adobe Certified Professional") {
      throw new Error(`Programme code ${PROGRAMME_CODE} already belongs to a different programme.`);
    }
    return { row: existing.rows[0], created: false };
  }

  const duplicateName = await client.query(
    `SELECT id, code FROM programmes
     WHERE tenant_id = $1 AND institution_id = $2 AND name = $3
     FOR UPDATE`,
    [institution.tenant_id, institution.id, "Adobe Certified Professional"],
  );
  if (duplicateName.rows[0]) {
    throw new Error(`Adobe Certified Professional already exists with code ${duplicateName.rows[0].code}; refusing to create a duplicate.`);
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
      "Adobe Certified Professional",
      PROGRAMME_CODE,
      "Adobe Certified Professional certification course catalogue.",
      createdBy,
    ],
  );
  return { row: inserted.rows[0], created: true };
}

async function findOrCreateCourse(client, programme, createdBy) {
  const existing = await client.query(
    `SELECT id, tenant_id, institution_id, campus_id, programme_id, title, code, description, thumbnail, status
     FROM courses
     WHERE tenant_id = $1 AND programme_id = $2 AND code = $3
     FOR UPDATE`,
    [programme.tenant_id, programme.id, COURSE_CODE],
  );
  if (existing.rows[0]) {
    if (existing.rows[0].title !== "Adobe Certified Professional in Document Creation and Management Using Adobe Acrobat Pro") {
      throw new Error(`Course code ${COURSE_CODE} already belongs to a different course.`);
    }
    return { row: existing.rows[0], created: false };
  }

  const duplicateTitle = await client.query(
    `SELECT id, code FROM courses
     WHERE tenant_id = $1 AND programme_id = $2 AND title = $3
     FOR UPDATE`,
    [programme.tenant_id, programme.id, "Adobe Certified Professional in Document Creation and Management Using Adobe Acrobat Pro"],
  );
  if (duplicateTitle.rows[0]) {
    throw new Error(`The Acrobat Pro course already exists with code ${duplicateTitle.rows[0].code}; refusing to create a duplicate.`);
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
      "Adobe Certified Professional in Document Creation and Management Using Adobe Acrobat Pro",
      COURSE_CODE,
      courseDescription,
      createdBy,
    ],
  );
  return { row: inserted.rows[0], created: true };
}

async function findOrCreateModule(client, course, moduleDefinition, sequence, createdBy) {
  const existingBySequence = await client.query(
    `SELECT id, tenant_id, course_id, title, description, sequence, status
     FROM course_modules
     WHERE tenant_id = $1 AND course_id = $2 AND sequence = $3
     FOR UPDATE`,
    [course.tenant_id, course.id, sequence],
  );
  if (existingBySequence.rows[0]) {
    if (existingBySequence.rows[0].title !== moduleDefinition.title) {
      throw new Error(`Course module sequence ${sequence} is already occupied by "${existingBySequence.rows[0].title}".`);
    }
    return { row: existingBySequence.rows[0], created: false };
  }

  const inserted = await client.query(
    `INSERT INTO course_modules
      (tenant_id, course_id, title, description, sequence, status, created_by, updated_by)
     VALUES ($1, $2, $3, $4, $5, 'DRAFT', $6, $6)
     RETURNING id, tenant_id, course_id, title, description, sequence, status`,
    [course.tenant_id, course.id, moduleDefinition.title, moduleDefinition.description, sequence, createdBy],
  );
  return { row: inserted.rows[0], created: true };
}

async function findOrCreateLesson(client, module, lessonDefinition, sequence, createdBy) {
  const existingBySequence = await client.query(
    `SELECT id, tenant_id, module_id, title, description, sequence, estimated_duration, status
     FROM lessons
     WHERE tenant_id = $1 AND module_id = $2 AND sequence = $3
     FOR UPDATE`,
    [module.tenant_id, module.id, sequence],
  );
  if (existingBySequence.rows[0]) {
    if (existingBySequence.rows[0].title !== lessonDefinition.title) {
      throw new Error(`Lesson sequence ${sequence} in "${module.title}" is already occupied by "${existingBySequence.rows[0].title}".`);
    }
    return { row: existingBySequence.rows[0], created: false };
  }

  const inserted = await client.query(
    `INSERT INTO lessons
      (tenant_id, module_id, title, description, sequence, estimated_duration, status, created_by, updated_by)
     VALUES ($1, $2, $3, $4, $5, NULL, 'DRAFT', $6, $6)
     RETURNING id, tenant_id, module_id, title, description, sequence, estimated_duration, status`,
    [module.tenant_id, module.id, lessonDefinition.title, lessonDefinition.description, sequence, createdBy],
  );
  return { row: inserted.rows[0], created: true };
}

async function findOrCreateSourceResource(client, lesson, institution, pdf, createdBy) {
  const resourceType = "PDF";
  const sequence = 1;
  const existingBySequence = await client.query(
    `SELECT id, tenant_id, lesson_id, resource_type, title, url, file_path, duration, sequence, status
     FROM learning_resources
     WHERE tenant_id = $1 AND lesson_id = $2 AND sequence = $3
     FOR UPDATE`,
    [lesson.tenant_id, lesson.id, sequence],
  );
  if (existingBySequence.rows[0]) {
    if (existingBySequence.rows[0].title !== RESOURCE_TITLE || existingBySequence.rows[0].resource_type !== resourceType) {
      throw new Error(`Learning resource sequence 1 in "${lesson.title}" is already occupied by another resource.`);
    }
    return { row: existingBySequence.rows[0], created: false };
  }

  const inserted = await client.query(
    `INSERT INTO learning_resources
      (tenant_id, lesson_id, resource_type, title, url, file_path, duration, sequence, status, created_by, updated_by)
     VALUES ($1, $2, $3, $4, NULL, NULL, NULL, $5, 'DRAFT', $6, $6)
     RETURNING id, tenant_id, lesson_id, resource_type, title, url, file_path, duration, sequence, status`,
    [lesson.tenant_id, lesson.id, resourceType, RESOURCE_TITLE, sequence, createdBy],
  );

  const resource = inserted.rows[0];
  const storageKey = `${lesson.tenant_id}/${resource.id}/acrobat-pro-exam-objectives.pdf`;
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

async function loadSourcePdf(sourcePath) {
  const absolutePath = resolve(process.cwd(), sourcePath);
  const buffer = await readFile(absolutePath);
  if (!buffer.length) throw new Error(`The source PDF is empty: ${sourcePath}`);
  return {
    filename: basename(absolutePath),
    byteSize: buffer.length,
    sha256: createHash("sha256").update(buffer).digest("hex"),
    buffer,
  };
}

async function main() {
  assertEnvironment();
  const sourcePath = process.env.ACROBAT_PDF_PATH || process.argv[2] || DEFAULT_PDF_PATH;
  const pdf = await loadSourcePdf(sourcePath);
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const createdStorageFiles = [];
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
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", ["citis-import-adobe-acrobat-pro"]);

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
         WHERE u.tenant_id = $1
           AND u.status <> 'ARCHIVED'
           AND r.code IN ('CITIS_SUPER_ADMIN', 'INSTITUTION_ADMINISTRATOR', 'PRINCIPAL_DIRECTOR', 'ACADEMIC_ADMINISTRATOR')
         ORDER BY u.created_at ASC, u.id ASC
         LIMIT 1`,
        [institution.tenant_id],
      );
      if (!actorResult.rows[0]) throw new Error("No active administrator actor exists in the current tenant.");
      const actorId = actorResult.rows[0].id;

      const programme = await findOrCreateProgramme(client, institution, actorId);
      if (programme.created) counts.programmesCreated += 1;

      const course = await findOrCreateCourse(client, programme.row, actorId);
      if (course.created) counts.coursesCreated += 1;

      let firstLesson = null;
      for (const [moduleIndex, moduleDefinition] of modules.entries()) {
        const module = await findOrCreateModule(client, course.row, moduleDefinition, moduleIndex + 1, actorId);
        if (module.created) counts.modulesCreated += 1;
        for (const [lessonIndex, lessonDefinition] of moduleDefinition.lessons.entries()) {
          const lesson = await findOrCreateLesson(client, module.row, lessonDefinition, lessonIndex + 1, actorId);
          if (lesson.created) counts.lessonsCreated += 1;
          if (!firstLesson) firstLesson = lesson.row;
        }
      }

      if (!firstLesson) throw new Error("The course definition did not contain a lesson for the source resource.");
      const resource = await findOrCreateSourceResource(client, firstLesson, institution, pdf, actorId);
      if (resource.created) counts.resourcesCreated += 1;

      await client.query("COMMIT");
      console.log(JSON.stringify({
        source: sourcePath,
        sourceSha256: pdf.sha256,
        status: "DRAFT_ONLY",
        counts,
        programmeId: programme.row.id,
        courseId: course.row.id,
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
  console.error(`Adobe Acrobat Pro import failed: ${error instanceof Error ? error.message : error}`);
  process.exitCode = 1;
});