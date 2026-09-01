import { createHash } from "node:crypto";
import { mkdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import pg from "pg";

const { Pool } = pg;

const PROGRAMME_CODE = "AUTODESK-CERTIFIED-USER";
const PROGRAMME_NAME = "Autodesk Certified User";
const PUBLISHED = "PUBLISHED";

const COURSE_DEFINITIONS = [
  {
    code: "AUTOCAD-ACU",
    title: "Autodesk Certified User in AutoCAD",
    sourcePath: "attached_assets/ACU_OD_AutoCAD_0922_(2)_1788280310076.pdf",
    resourceTitle: "Source PDF — Autodesk AutoCAD Certified User Exam Objectives",
    storageFilename: "autodesk-autocad-certified-user-exam-objectives.pdf",
    description:
      "The official Autodesk AutoCAD Certified User objectives cover computer-aided design, drafting, drawing, editing, annotation, layouts, and printing.",
    modules: [
      {
        title: "Draw and Modify Objects",
        lessons: [
          "1.1 Create basic drawing objects",
          "1.2 Draw polylines",
          "1.3 Select and deselect objects",
          "1.4 Manage layers",
          "1.5 Work with blocks",
        ],
      },
      {
        title: "Draw with Accuracy",
        lessons: [
          "2.1 Apply basic object snaps",
          "2.2 Identify and use coordinates",
        ],
      },
      {
        title: "Basic Editing",
        lessons: [
          "3.1 Modify object properties",
          "3.2 Use basic editing commands to modify objects",
          "3.3 Trim, extend, or lengthen objects",
          "3.4 Create rectangular and polar arrays",
          "3.5 Offset objects at a specific distance",
          "3.6 Apply a fillet or chamfer to objects",
        ],
      },
      {
        title: "Annotation",
        lessons: [
          "4.1 Create and modify text",
          "4.2 Add and modify leaders and/or multileaders",
          "4.3 Create and edit dimensions",
          "4.4 Apply hatches or fill patterns",
        ],
      },
      {
        title: "Layouts and Printing",
        lessons: [
          "5.1 Work with layouts and viewports",
          "5.2 Manage output formats",
        ],
      },
    ],
  },
  {
    code: "FUSION-360-ACU",
    title: "Autodesk Certified User in Fusion 360",
    sourcePath: "attached_assets/ACU_OD_Fusion360_0922_(2)_1788280310075.pdf",
    resourceTitle: "Source PDF — Autodesk Fusion 360 Certified User Exam Objectives",
    storageFilename: "autodesk-fusion-360-certified-user-exam-objectives.pdf",
    description:
      "The official Autodesk Fusion 360 Certified User objectives cover workspace navigation, sketching, modeling, assemblies, and technical documentation.",
    modules: [
      {
        title: "Workspace and Navigation",
        lessons: [
          "1.1 Get started",
          "1.2 Navigate the workspace and environment",
          "1.3 Use work features",
        ],
      },
      {
        title: "Sketch",
        lessons: [
          "2.1 Create and modify a sketch",
          "2.2 Apply sketch constraints and dimensions",
        ],
      },
      {
        title: "Model",
        lessons: [
          "3.1 Create solids from sketches",
          "3.2 Modify solids",
          "3.3 Work with Forms",
        ],
      },
      {
        title: "Assemble",
        lessons: [
          "4.1 Create and manage assemblies and subassemblies",
          "4.2 Create a component from a body",
          "4.3 Align and/or position components with joints",
          "4.4 Check for interference between components",
        ],
      },
      {
        title: "Document",
        lessons: [
          "5.1 Create drawings",
          "5.2 Apply dimensions and annotations",
        ],
      },
    ],
  },
  {
    code: "INVENTOR-ACU",
    title: "Autodesk Certified User in Inventor",
    sourcePath: "attached_assets/ACU_OD_Inventor_0922_(1)_1788280310074.pdf",
    resourceTitle: "Source PDF — Autodesk Inventor Certified User Exam Objectives",
    storageFilename: "autodesk-inventor-certified-user-exam-objectives.pdf",
    description:
      "The official Autodesk Inventor Certified User objectives cover workspace navigation, sketching, feature modeling, assemblies, and drawings.",
    modules: [
      {
        title: "Workspace and Navigation",
        lessons: [
          "1.1 Get started (understand/apply)",
          "1.2 Navigate the workspace and environment (understand/apply)",
          "1.3 Create and use work planes and axes",
        ],
      },
      {
        title: "Sketch",
        lessons: [
          "2.1 Create and modify a sketch",
          "2.2 Apply sketch constraints and dimensions",
        ],
      },
      {
        title: "Model",
        lessons: [
          "3.1 Create and modify sketched features",
          "3.2 Create and modify placed features",
        ],
      },
      {
        title: "Assemble",
        lessons: [
          "4.1 Place components into assemblies",
          "4.2 Create relationships",
          "4.3 Analyze components",
        ],
      },
      {
        title: "Document",
        lessons: [
          "5.1 Create drawings",
          "5.2 Apply dimensions and annotations",
        ],
      },
    ],
  },
  {
    code: "MAYA-ACU",
    title: "Autodesk Certified User in Maya",
    sourcePath: "attached_assets/ACU_OD_Maya_0922_(1)_1788280310073.pdf",
    resourceTitle: "Source PDF — Autodesk Maya Certified User Exam Objectives",
    storageFilename: "autodesk-maya-certified-user-exam-objectives.pdf",
    description:
      "The official Autodesk Maya Certified User objectives cover scene management, modeling, texture coordinates, materials, rigging, cameras, animation, lighting, and rendering.",
    modules: [
      {
        title: "Scene Management",
        lessons: [
          "1.1 Set up a project",
          "1.2 Setup the scene preferences",
          "1.3 Manage scene objects",
          "1.4 Modify Pivots",
          "1.5 Modify attributes on one or more objects",
          "1.6 Change viewport display",
        ],
      },
      {
        title: "Modeling",
        lessons: [
          "2.1 Create and modify a polygon primitive",
          "2.2 Edit polygon surfaces",
          "2.3 Use image planes",
          "2.4 Modeling tool kit",
        ],
      },
      {
        title: "Texture Coordinates",
        lessons: [
          "3.1 Assign UVs to a mesh",
          "3.2 Use the UV Editor",
        ],
      },
      {
        title: "Materials / Shading",
        lessons: [
          "4.1 Work with a material",
          "4.2 Modify material attributes",
        ],
      },
      {
        title: "Rigging",
        lessons: [
          "5.1 Utilize the Skeleton tools",
          "5.2 Use the Skin tools",
          "5.3 Apply Constraints",
        ],
      },
      {
        title: "Cameras",
        lessons: [
          "6.1 Work with cameras",
          "6.2 Modify camera attribute names or values",
          "6.3 Display Film Gate, Resolution Gate, and other view guides",
        ],
      },
      {
        title: "Animation",
        lessons: [
          "7.1 Use the Time Slider and set Animation preferences",
          "7.2 Demonstrate how to animate an object along a path",
          "7.3 Edit animation tangents using the Graph Editor",
        ],
      },
      {
        title: "Lighting",
        lessons: [
          "8.1 Work with lights",
          "8.2 Work with shadow types",
        ],
      },
      {
        title: "Rendering",
        lessons: [
          "9.1 Differentiate the built-in renderers",
          "9.2 Configure render settings",
        ],
      },
    ],
  },
  {
    code: "3DS-MAX-ACU",
    title: "Autodesk Certified User in 3ds Max",
    sourcePath: "attached_assets/ACU_OD_3DsMax_0922_(1)_(1)_1788280310077.pdf",
    resourceTitle: "Source PDF — Autodesk 3ds Max Certified User Exam Objectives",
    storageFilename: "autodesk-3ds-max-certified-user-exam-objectives.pdf",
    description:
      "The official Autodesk 3ds Max Certified User objectives cover scene management, modeling, UVW coordinates, materials, rigging, cameras, animation, lighting, and rendering.",
    modules: [
      {
        title: "Scene Management",
        lessons: [
          "1.1 Set up a project",
          "1.2 Setup the scene preferences",
          "1.3 Manage scene objects",
          "1.4 Modify the properties of one or more objects",
          "1.5 Manipulate objects’ transformations and pivot point",
          "1.6 Change viewport display",
        ],
      },
      {
        title: "Modeling",
        lessons: [
          "2.1 Create a polygon primitive",
          "2.2 Edit polygon surfaces",
          "2.3 Use the modeling and selection tools",
        ],
      },
      {
        title: "UVW Coordinates",
        lessons: [
          "3.1 Configure Basic UVW Projections using the UVW Map Modifier",
          "3.2 Use the Unwrap UVW modifier",
        ],
      },
      {
        title: "Materials / Shading",
        lessons: [
          "4.1 Work with a material",
          "4.2 Modify material properties",
        ],
      },
      {
        title: "Rigging",
        lessons: [
          "5.1 Utilize the Bone tools",
          "5.2 Use the Skin modifier",
          "5.3 Apply constraints",
          "5.4 Utilize Character Studio",
        ],
      },
      {
        title: "Cameras",
        lessons: [
          "6.1 Work with cameras",
          "6.2 Modify camera property names or values",
          "6.3 Show Safe Frames",
        ],
      },
      {
        title: "Animation",
        lessons: [
          "7.1 Use the Time Slider and set the Time Configuration settings",
          "7.2 Demonstrate how to animate an object along a path",
          "7.3 Edit animation using the Track View (Curve Editor / Dope Sheet)",
        ],
      },
      {
        title: "Lighting",
        lessons: [
          "8.1 Work with lights",
          "8.2 Work with shadow types",
        ],
      },
      {
        title: "Rendering",
        lessons: [
          "9.1 Differentiate the built-in renderers",
          "9.2 Configure Scanline render parameters",
        ],
      },
    ],
  },
  {
    code: "REVIT-ARCHITECTURAL-DESIGN-ACU",
    title: "Autodesk Certified User in Revit for Architectural Design",
    sourcePath: "attached_assets/ACU_OD_Revit_0922_(2)_1788280310072.pdf",
    resourceTitle: "Source PDF — Autodesk Revit for Architectural Design Certified User Exam Objectives",
    storageFilename: "autodesk-revit-architectural-design-certified-user-exam-objectives.pdf",
    description:
      "The official Autodesk Revit for Architectural Design Certified User objectives cover building information modeling, architectural modeling, display, views, annotation, schedules, and sheets.",
    modules: [
      {
        title: "Modeling",
        lessons: [
          "1.1 Work with walls",
          "1.2 Add doors, windows, and openings",
          "1.3 Add and edit floors, ceilings, and roofs",
          "1.4 Place a component",
          "1.5 Work with grids and columns",
          "1.6 Work with stairs, ramps, and railings",
          "1.7 Place rooms",
          "1.8 Use modify tools",
        ],
      },
      {
        title: "Display",
        lessons: [
          "2.1 Use levels to define the height or story within a building",
          "2.2 Create and modify views",
          "2.3 Control view display",
          "2.4 Configure family types",
        ],
      },
      {
        title: "Documentation",
        lessons: [
          "3.1 Create and modify text",
          "3.2 Add tags",
          "3.3 Use dimensions",
          "3.4 Create and use schedules",
          "3.5 Add 2D annotation detail elements to views",
          "3.6 Create and arrange sheet composition",
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
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
     RETURNING id, tenant_id, institution_id, campus_id, name, code, description, status`,
    [
      institution.tenant_id,
      institution.id,
      institution.campus_id ?? null,
      PROGRAMME_NAME,
      PROGRAMME_CODE,
      "Autodesk Certified User certification course catalogue.",
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
      `Autodesk Certified User objective area: ${definition.title}.`,
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
      `Autodesk Certified User exam objective: ${title}`,
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
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", ["citis-import-autodesk-objectives-courses"]);

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
  console.error(`Autodesk objectives import failed: ${error instanceof Error ? error.message : error}`);
  process.exitCode = 1;
});