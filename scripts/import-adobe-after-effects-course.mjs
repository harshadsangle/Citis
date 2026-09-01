import { createHash } from "node:crypto";
import { mkdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import pg from "pg";

const { Pool } = pg;

const DEFAULT_PDF_PATH = "attached_assets/AC_PRO_Exam_Objectives_AE_0923_(1)_1788273050778.pdf";
const PROGRAMME_CODE = "ADOBE-CERTIFIED-PROFESSIONAL";
const COURSE_CODE = "AFTER-EFFECTS-ACP";
const COURSE_TITLE = "Adobe Certified Professional in Visual Effects and Motion Graphics Using Adobe After Effects 2021 (v 18.x)";
const RESOURCE_TITLE = "Source PDF — Adobe After Effects Exam Objectives (2021 v18.x)";

const courseDescription = [
  "Adobe Certified Professional certification objectives for visual effects and motion graphics work using Adobe After Effects.",
  "",
  "The Target Candidate has approximately 150 hours of instruction and hands-on experience with After Effects and can apply video composition and motion graphics principles to routine job tasks with limited assistance.",
  "",
  "Source note: All Key Terms, Key Tools, Key Concepts, and Key Settings in the source are examples and not a comprehensive list.",
].join("\n");

const modules = [
  {
    title: "Working in the Visual Effects and Motion Graphics Industry",
    description: "Industry, communication, legal, technical, animation, visual effects, and design concepts for working with colleagues and clients.",
    lessons: [
      {
        title: "1.1 Identify the purpose, audience, and audience needs for visual effects and motion graphics projects.",
        description: "Determine whether content is relevant to its purpose, audience, accessibility needs, delivery method, distribution, and consumption requirements. Consider client goals, demographics, file size, compression, codecs, formats, and aspect ratio.",
      },
      {
        title: "1.2 Communicate with colleagues and clients about project plans.",
        description: "Communicate project ideas through pre-production planning, shot lists, scripts, storyboards, design compositions, style guides, and animatics. Apply project management concepts such as specifications, milestones, deadlines, deliverables, and file types.",
      },
      {
        title: "1.3 Determine intellectual property rights, permissions, and licensing for specific content.",
        description: "Identify legal and ethical considerations for third-party content, including Creative Commons, public domain, copyright, intellectual property, derivative work, commercial use, attribution, work for hire, and fair use. Recognize when permissions, model releases, location permits, or property releases are needed.",
      },
      {
        title: "1.4 Demonstrate knowledge of digital audio and video terminology and tools.",
        description: "Understand frame rate, aspect ratio, title and action safe areas, resolution, file formats, codecs, pixels, rendering, and audio monitoring. Apply color concepts such as white balance, bit depth, RGB, CMYK, YUV, HLS, editing, transitions, levels, waveforms, and effects.",
      },
      {
        title: "1.5 Demonstrate knowledge of animation, visual effects, and design principles.",
        description: "Apply animation principles such as easing, anticipation, staging, timing, arcs, and follow-through. Understand compositing techniques including lighting, scale, perspective, 3D space, rotoscoping, masking, blending modes, and match moving, as well as cinematic composition and motion-graphics design principles.",
      },
    ],
  },
  {
    title: "Project Setup and Interface",
    description: "Project, composition, workspace, preference, timeline, design-tool, and asset-import workflows for an efficient After Effects workflow.",
    lessons: [
      {
        title: "2.1 Create and modify projects and compositions.",
        description: "Choose project settings and create or modify compositions to meet delivery requirements, including frame rate, resolution, duration, dimensions, aspect ratio, presets, work area, background color, composition names, and compositions created from footage.",
      },
      {
        title: "2.2 Navigate, organize, and customize the application workspace.",
        description: "Navigate menus, toolbars, panels, search, and zoom controls. Work with the Project, Timeline, Composition, Preview, Effects & Presets, Effect Controls, and Layer panels. Switch, dock, group, save, reset, and customize workspaces and application preferences.",
      },
      {
        title: "2.3 Use non-visible design tools to aid in video workflow.",
        description: "Control the timeline and media with panning, zooming, playback, keyboard shortcuts, timecodes, and the current-time indicator. Use composition and layer markers, guides, grids, rulers, title and action safe areas, snapping, and alignment options.",
      },
      {
        title: "2.4 Import and manage assets in a project.",
        description: "Import compatible media from different sources, including Photoshop and Illustrator layers, Adobe Dynamic Link, drag-and-drop media, and image sequences. Find, replace, reload, interpret, organize, and manage linked footage with folders, placeholders, and metadata.",
      },
    ],
  },
  {
    title: "Organizing Projects",
    description: "Composition structure, layer management, visibility, blending, track mattes, and masks for efficient project organization.",
    lessons: [
      {
        title: "3.1 Use the Timeline panel.",
        description: "Recognize footage, text, solid, shape, camera, adjustment, light, null-object, and pre-composition layers. Add, delete, lock, unlock, rename, reorder, label, and manage layer switches and modes. Use pre-composing, parenting, null objects, render order, and audio alignment for complex compositions.",
      },
      {
        title: "3.2 Modify layer visibility with opacity, blending modes, track mattes, and masks.",
        description: "Hide, show, solo, shy, mute, and adjust the opacity of layers. Create, apply, and manipulate layer masks and track mattes with the tools provided by After Effects.",
      },
    ],
  },
  {
    title: "Creating and Modifying Visual Elements",
    description: "Core tools, text, footage, transformations, video, effects, 3D space, composites, and keyframes for building motion-graphics compositions.",
    lessons: [
      {
        title: "4.1 Use core tools and features to create content.",
        description: "Create solids, shape layers, and shapes from vector layers with the Shape, Pen, and vector-editing tools. Place assets in a composition with the correct temporal position, spatial coordinates, and layer stacking order.",
      },
      {
        title: "4.2 Create, manipulate, and animate text.",
        description: "Create point text, paragraph text, and text on a path. Adjust font, size, style, kerning, tracking, leading, scale, alignment, indentation, paragraph spacing, text direction, and preset text animations.",
      },
      {
        title: "4.3 Adjust footage for use in compositions.",
        description: "Move, sequence, trim, and split layers, and set in and out points in the Footage panel.",
      },
      {
        title: "4.4 Modify digital media within a project.",
        description: "Transform visual elements by scaling, rotating, flipping, moving, and fitting them to a composition. Change clip speed with time remapping, time stretching, freeze frames, speed changes, and time reversal.",
      },
      {
        title: "4.5 Manipulate digital video.",
        description: "Use basic auto-correction methods and tools for stabilization and color correction.",
      },
      {
        title: "4.6 Add and modify effects and presets.",
        description: "Apply and adjust video effects and presets in the Effect Controls panel and timeline. Use 3D axes, cameras, lighting, and animation; create composites with keying, opacity, masks, mattes, and alpha channels; and apply effects across multiple layers with adjustment layers and animation presets.",
      },
      {
        title: "4.7 Create and modify keyframes for motion graphics.",
        description: "Apply and adjust transformations with keyframes, motion paths, spatial and temporal interpolation, and the Graph Editor. Animate effects with keyframes in the Effect Controls panel and timeline.",
      },
    ],
  },
  {
    title: "Publishing Digital Media",
    description: "Preparing, archiving, and exporting compositions and assets in formats appropriate for different delivery requirements.",
    lessons: [
      {
        title: "5.1 Prepare a composition for publishing and archiving.",
        description: "Check a composition for hidden layers, animation timing, audio levels, resolution, title-safe areas, frame rate, work area, and other specification issues. Archive a project by finding missing files, fonts, filenames, and locations with the Collect Files command.",
      },
      {
        title: "5.2 Export digital video to various file formats.",
        description: "Export one or multiple frames and complete compositions with appropriate filenames, locations, formats, codecs, target screen sizes, and playback devices. Use the Render Queue and Adobe Media Encoder, including exports to Premiere Pro.",
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
    if (existing.rows[0].name !== "Adobe Certified Professional") {
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
    if (existing.rows[0].title !== COURSE_TITLE) {
      throw new Error(`Course code ${COURSE_CODE} already belongs to a different course.`);
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
      COURSE_TITLE,
      COURSE_CODE,
      courseDescription,
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
      throw new Error(`Course module sequence ${sequence} is already occupied by "${existing.rows[0].title}".`);
    }
    return { row: existing.rows[0], created: false };
  }

  const inserted = await client.query(
    `INSERT INTO course_modules
      (tenant_id, course_id, title, description, sequence, status, created_by, updated_by)
     VALUES ($1, $2, $3, $4, $5, 'DRAFT', $6, $6)
     RETURNING id, tenant_id, course_id, title, description, sequence, status`,
    [course.tenant_id, course.id, definition.title, definition.description, sequence, createdBy],
  );
  return { row: inserted.rows[0], created: true };
}

async function findOrCreateLesson(client, module, definition, sequence, createdBy) {
  const existing = await client.query(
    `SELECT id, tenant_id, module_id, title, description, sequence, estimated_duration, status
     FROM lessons
     WHERE tenant_id = $1 AND module_id = $2 AND sequence = $3
     FOR UPDATE`,
    [module.tenant_id, module.id, sequence],
  );
  if (existing.rows[0]) {
    if (existing.rows[0].title !== definition.title) {
      throw new Error(`Lesson sequence ${sequence} in "${module.title}" is already occupied by "${existing.rows[0].title}".`);
    }
    return { row: existing.rows[0], created: false };
  }

  const inserted = await client.query(
    `INSERT INTO lessons
      (tenant_id, module_id, title, description, sequence, estimated_duration, status, created_by, updated_by)
     VALUES ($1, $2, $3, $4, $5, NULL, 'DRAFT', $6, $6)
     RETURNING id, tenant_id, module_id, title, description, sequence, estimated_duration, status`,
    [module.tenant_id, module.id, definition.title, definition.description, sequence, createdBy],
  );
  return { row: inserted.rows[0], created: true };
}

async function findOrCreateSourceResource(client, lesson, institution, pdf, createdBy) {
  const existing = await client.query(
    `SELECT id, tenant_id, lesson_id, resource_type, title, url, file_path, duration, sequence, status
     FROM learning_resources
     WHERE tenant_id = $1 AND lesson_id = $2 AND sequence = 1
     FOR UPDATE`,
    [lesson.tenant_id, lesson.id],
  );
  if (existing.rows[0]) {
    if (existing.rows[0].title !== RESOURCE_TITLE || existing.rows[0].resource_type !== "PDF") {
      throw new Error(`Learning resource sequence 1 in "${lesson.title}" is already occupied by another resource.`);
    }
    return { row: existing.rows[0], created: false };
  }

  const inserted = await client.query(
    `INSERT INTO learning_resources
      (tenant_id, lesson_id, resource_type, title, url, file_path, duration, sequence, status, created_by, updated_by)
     VALUES ($1, $2, 'PDF', $3, NULL, NULL, NULL, 1, 'DRAFT', $4, $4)
     RETURNING id, tenant_id, lesson_id, resource_type, title, url, file_path, duration, sequence, status`,
    [lesson.tenant_id, lesson.id, RESOURCE_TITLE, createdBy],
  );
  const resource = inserted.rows[0];
  const storageKey = `${lesson.tenant_id}/${resource.id}/adobe-after-effects-exam-objectives.pdf`;
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

async function main() {
  assertEnvironment();
  const sourcePath = process.env.ADOBE_AFTER_EFFECTS_PDF_PATH || process.argv[2] || DEFAULT_PDF_PATH;
  const absolutePath = resolve(process.cwd(), sourcePath);
  const buffer = await readFile(absolutePath);
  if (!buffer.length) throw new Error(`The source PDF is empty: ${sourcePath}`);
  const pdf = {
    filename: basename(absolutePath),
    byteSize: buffer.length,
    sha256: createHash("sha256").update(buffer).digest("hex"),
    buffer,
  };
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const counts = { programmesCreated: 0, coursesCreated: 0, modulesCreated: 0, lessonsCreated: 0, resourcesCreated: 0 };

  try {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", ["citis-import-adobe-after-effects"]);

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
      const course = await findOrCreateCourse(client, programme.row, actorId);
      if (course.created) counts.coursesCreated += 1;

      let firstLesson = null;
      for (const [moduleIndex, definition] of modules.entries()) {
        const module = await findOrCreateModule(client, course.row, definition, moduleIndex + 1, actorId);
        if (module.created) counts.modulesCreated += 1;
        for (const [lessonIndex, lessonDefinition] of definition.lessons.entries()) {
          const lesson = await findOrCreateLesson(client, module.row, lessonDefinition, lessonIndex + 1, actorId);
          if (lesson.created) counts.lessonsCreated += 1;
          if (!firstLesson) firstLesson = lesson.row;
        }
      }
      if (!firstLesson) throw new Error("The course definition did not contain a lesson for the source resource.");
      const resource = await findOrCreateSourceResource(client, firstLesson, institution, pdf, actorId);
      if (resource.created) counts.resourcesCreated += 1;

      await client.query("COMMIT");
      console.log(JSON.stringify({ source: sourcePath, sourceSha256: pdf.sha256, status: "DRAFT_ONLY", counts, programmeId: programme.row.id, courseId: course.row.id }, null, 2));
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
  console.error(`Adobe After Effects import failed: ${error instanceof Error ? error.message : error}`);
  process.exitCode = 1;
});