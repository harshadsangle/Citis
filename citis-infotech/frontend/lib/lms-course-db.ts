import { getCourseBySlug, type CourseModule, type LmsCourse } from "@/lib/lms-courses";
import { queryLms } from "@/lib/lms-db";

export type LmsCourseDbRow = {
  id: number;
  slug: string;
  title: string;
  description: string;
  category: string;
  level: string;
  duration: string;
  status: "draft" | "published";
  outcomes: unknown;
  modules: unknown;
  instructor_id: number | null;
  instructor_name: string | null;
};

const courseSelect = `
  SELECT c.id, c.slug, c.title, c.description, c.category, c.level, c.duration,
         c.status, c.outcomes, c.modules, c.instructor_id,
         u.name AS instructor_name
  FROM lms_courses c
  LEFT JOIN lms_users u ON u.id = c.instructor_id
`;

function arrayValue<T>(value: unknown, fallback: T[]): T[] {
  return Array.isArray(value) ? value as T[] : fallback;
}

export function mapDbCourse(row: LmsCourseDbRow): LmsCourse {
  const legacyCourse = getCourseBySlug(row.slug);
  const storedModules = arrayValue<CourseModule>(row.modules, []);
  const modules = storedModules.length > 0 ? storedModules : legacyCourse?.modules ?? [];
  return {
    slug: row.slug,
    title: row.title,
    category: row.category,
    level: row.level,
    duration: row.duration,
    learners: legacyCourse?.learners ?? "New course",
    progress: legacyCourse?.progress ?? 0,
    instructor: row.instructor_name ?? legacyCourse?.instructor ?? "CITIS Instructor",
    description: row.description,
    outcomes: arrayValue<string>(row.outcomes, legacyCourse?.outcomes ?? []),
    modules,
    // Activity remains on the existing static/browser-storage implementation.
    quiz: legacyCourse?.quiz ?? [],
    assignments: legacyCourse?.assignments ?? [],
    status: row.status === "published" ? "Published" : "Draft",
  };
}

export async function getPublishedLmsCourses() {
  const result = await queryLms<LmsCourseDbRow>(`${courseSelect} WHERE c.status = 'published' ORDER BY c.created_at DESC, c.id DESC`);
  return result.rows.map(mapDbCourse);
}

export async function getManageableLmsCourses(userId: number, role: "instructor" | "admin") {
  const result = role === "admin"
    ? await queryLms<LmsCourseDbRow>(`${courseSelect} ORDER BY c.created_at DESC, c.id DESC`)
    : await queryLms<LmsCourseDbRow>(`${courseSelect} WHERE c.instructor_id = $1 OR c.instructor_id IS NULL ORDER BY c.created_at DESC, c.id DESC`, [userId]);
  return result.rows.map(mapDbCourse);
}

export async function getLmsCourseBySlug(slug: string) {
  const result = await queryLms<LmsCourseDbRow>(`${courseSelect} WHERE c.slug = $1`, [slug]);
  return result.rows[0] ? mapDbCourse(result.rows[0]) : null;
}

export async function getPublishedLmsCourseRecord(slug: string) {
  const result = await queryLms<LmsCourseDbRow>(`${courseSelect} WHERE c.slug = $1 AND c.status = 'published'`, [slug]);
  return result.rows[0] ? { id: result.rows[0].id, course: mapDbCourse(result.rows[0]) } : null;
}

export type LmsEnrollmentDbRow = LmsCourseDbRow & {
  enrollment_id: number;
  enrollment_status: "active" | "completed" | "withdrawn";
  enrolled_at: Date;
};

export async function getLmsUserEnrollments(userId: number) {
  const result = await queryLms<LmsEnrollmentDbRow>(
    `SELECT e.id AS enrollment_id, e.status AS enrollment_status, e.enrolled_at,
            c.id, c.slug, c.title, c.description, c.category, c.level, c.duration,
            c.status, c.outcomes, c.modules, c.instructor_id,
            u.name AS instructor_name
     FROM lms_enrollments e
     JOIN lms_courses c ON c.id = e.course_id
     LEFT JOIN lms_users u ON u.id = c.instructor_id
     WHERE e.user_id = $1 AND e.status <> 'withdrawn'
     ORDER BY e.enrolled_at DESC, e.id DESC`,
    [userId],
  );
  return result.rows.map((row) => ({
    id: row.enrollment_id,
    status: row.enrollment_status,
    enrolledAt: row.enrolled_at,
    course: mapDbCourse(row),
  }));
}