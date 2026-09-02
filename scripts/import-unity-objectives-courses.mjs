import { createHash } from "node:crypto";
import { mkdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import pg from "pg";

const { Pool } = pg;

const PROGRAMME_CODE = "UNITY-CERTIFIED-USER";
const PROGRAMME_NAME = "Unity Certified User";
const PUBLISHED = "PUBLISHED";

const COURSE_DEFINITIONS = [
  {
    code: "UNITY-CERTIFIED-USER-ARTIST",
    title: "Unity Certified User Artist",
    sourcePath: "attached_assets/Unity_Exam_Objectives_-_Digital_Artist_-_Digital_1788328183848.pdf",
    resourceTitle: "Source PDF — Unity Certified User Artist Exam Objectives",
    storageFilename: "unity-certified-user-artist-exam-objectives.pdf",
    description: "Official Unity Certified User Artist objectives for 2D and 3D digital artistry, asset workflows, scene design, lighting, cameras, materials, and rendering.",
    modules: [
      {
        title: "Asset Management",
        lessons: [
          "1.1 Import assets including settings for FBX, OBJ, and associated textures.",
          "1.2 Import and configure assets from the Unity Asset Store.",
          "1.3 Slice spritesheets for use in a 2D scene, including the Sprite Editor and 9-slicing.",
          "1.4 Identify mesh components including vertices, polygon faces, and edges.",
          "1.5 Create keyframes and change tangents in the Curve Editor using the Animation window.",
          "1.6 Create, modify, and use Prefabs.",
        ],
      },
      {
        title: "Scene Content Design",
        lessons: [
          "2.1 Use Transform tools and the Transform component in the Inspector.",
          "2.2 Create prototype scenes using Unity primitives or low-poly meshes with white-box or grey-box techniques.",
          "2.3 Create and edit a landscape with materials using the Terrain tool, including mask maps, texture painting, and diffuse properties.",
        ],
      },
      {
        title: "Lighting, Cameras, and Materials Implementation",
        lessons: [
          "3.1 Modify materials using the Standard Shader, including specular, transparency, normal, and albedo properties.",
          "3.2 Identify basic lighting, shadows, light settings, and directional, area, spot, and point lights.",
          "3.3 Use a single camera setup, including camera component, background, culling masks, clipping planes, and field of view.",
          "3.4 Determine the appropriate rendering pipeline for a scenario.",
        ],
      },
    ],
  },
  {
    code: "UNITY-CERTIFIED-USER-PROGRAMMER",
    title: "Unity Certified User Programmer",
    sourcePath: "attached_assets/Unity_Exam_Objectives_-_Programmer_-_Digital_1788328183847.pdf",
    resourceTitle: "Source PDF — Unity Certified User Programmer Exam Objectives",
    storageFilename: "unity-certified-user-programmer-exam-objectives.pdf",
    description: "Official Unity Certified User Programmer objectives for C# programming, debugging, API interpretation, code evaluation, Unity interface navigation, and Animator state machines.",
    modules: [
      {
        title: "Debugging, Problem-Solving, and Interpreting the API",
        lessons: [
          "1.1 Given a debug log message, create the code that produced the message.",
          "1.2 Given code and its error messages, determine which objects are null.",
          "1.3 Given a programming task requiring a class in the API, determine the appropriate methods, properties, arguments, or syntax.",
        ],
      },
      {
        title: "Creating Code",
        lessons: [
          "2.1 Initialize and use variables and data collections such as Arrays, Lists, and Dictionaries.",
          "2.2 Construct a viable function declaration from keywords and syntax elements.",
          "2.3 Identify the appropriate function to control or trigger a state, including the Animator Controller.",
          "2.4 Construct an input listener for keyboard or touch input from a scenario and provided building blocks.",
          "2.5 Use logic and flow-control operators in C# and Unity.",
          "2.6 Identify appropriate actions when a UI element reports a change.",
        ],
      },
      {
        title: "Evaluating Code",
        lessons: [
          "3.1 Determine the appropriate action for managing an event function, including keyboard and touch input.",
          "3.2 Identify an error caused by an incorrectly declared variable data type.",
          "3.3 Identify an error caused by a function or variable declared or used with incorrect access.",
          "3.4 Distinguish whether a class definition is an ECS class or another type of class.",
          "3.5 Recognize code that observes Unity naming standards.",
          "3.6 Recognize comments that accurately describe what code is doing.",
        ],
      },
      {
        title: "Navigating the Interface",
        lessons: [
          "4.1 Describe the purpose, features, and functions of Unity IDE windows.",
          "4.2 Change the default scripting IDE.",
          "4.3 Create a functional state machine from a game scenario, animation clips, and property settings.",
          "4.4 Create and program a functional state machine within the Unity Animator Controller.",
        ],
      },
    ],
  },
  {
    code: "UNITY-CERTIFIED-USER-VR-DEVELOPER",
    title: "Unity Certified User VR Developer",
    sourcePath: "attached_assets/Unity_Exam_Objectives_-_VR_Developer_-_Digital_1788328183847.pdf",
    resourceTitle: "Source PDF — Unity Certified User VR Developer Exam Objectives",
    storageFilename: "unity-certified-user-vr-developer-exam-objectives.pdf",
    description: "Official Unity Certified User VR Developer objectives for creating VR scenes, world-space UX, interaction, locomotion, C# scripting, troubleshooting, playtesting, and optimization.",
    modules: [
      {
        title: "Basic Unity Concepts for VR Development",
        lessons: [
          "1.1 Define essential VR concepts including stereoscopic vision, XR differences, tracking methods, and VR input methods.",
          "1.2 Use Package Manager to manage packages, including the XR Interaction Toolkit.",
          "1.3 Import or modify assets, including Prefabs.",
          "1.4 Use the Transform component to position, rotate, and scale an object in a scene.",
          "1.5 Identify the primary interface window for completing a task in the default workspace.",
          "1.6 Manage components in the Inspector window.",
        ],
      },
      {
        title: "Building a Scene for VR",
        lessons: [
          "2.1 Identify VR preplanning techniques including design documents, flow charts, animatics, prototyping, greyboxing, storyboarding, concept art, and proportional level scaling.",
          "2.2 Implement environment design with 3D objects using finalized assets.",
          "2.3 Identify light types and when to use Baked versus Realtime lighting.",
        ],
      },
      {
        title: "UX Implementation for VR",
        lessons: [
          "3.1 Create a basic World Space UI for a VR scene using Canvas, Button, Image, Text, and the Event System.",
          "3.2 Determine components needed to physically manipulate objects, including Colliders, XR Grab Interactable, and Rigidbodies.",
          "3.3 Identify player locomotion types including degrees of freedom, avatar movement, 3-axis motion, 6-axis rotation, and rotation along an axis.",
          "3.4 Identify optimal VR interactions for health and safety.",
          "3.5 Differentiate attributes of 2D and spatial audio sources.",
        ],
      },
      {
        title: "Scripting with Unity",
        lessons: [
          "4.1 Select basic C# code for properties, variables, methods, basic data types, and binary operators.",
          "4.2 Select the appropriate Unity class for a goal, including Vector3, GameObject, Collider, Rigidbody, or AudioSource.",
          "4.3 Identify how to handle collision or trigger Enter, Stay, and Exit events.",
        ],
      },
      {
        title: "Troubleshooting and Playtesting",
        lessons: [
          "5.1 Identify areas to troubleshoot after playtesting, including static objects, colliders, rigidbodies, and physics settings.",
          "5.2 Identify types of logs in the Unity Console.",
          "5.3 Identify Console errors and fixes for null references, missing line markers, and syntax errors.",
          "5.4 Identify optimization methods for VR scenes, including occlusion culling, removing unused objects, and level of detail.",
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
      "Unity Certified User certification course catalogue.",
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
      `Unity Certified User objective area: ${definition.title}.`,
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
      `Unity Certified User exam objective: ${title}`,
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
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", ["citis-import-unity-objectives-courses"]);

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
  console.error(`Unity objectives import failed: ${error instanceof Error ? error.message : error}`);
  process.exitCode = 1;
});