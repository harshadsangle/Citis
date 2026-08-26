import { NextResponse } from "next/server";
import { z } from "zod";
import { getManageableLmsCourses, getPublishedLmsCourses, mapDbCourse, type LmsCourseDbRow } from "@/lib/lms-course-db";
import { queryLms } from "@/lib/lms-db";
import { getLmsSessionUser } from "@/lib/lms-session";

const courseInputSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(180),
  title: z.string().trim().min(1).max(240),
  description: z.string().trim().max(10000).default(""),
  category: z.string().trim().max(120).default("Future Skills"),
  level: z.string().trim().max(40).default("Foundation"),
  duration: z.string().trim().max(80).default("6 weeks"),
  outcomes: z.array(z.string().trim().min(1).max(500)).max(20).default([]),
  modules: z.array(z.unknown()).max(100).default([]),
  status: z.enum(["Draft", "Published", "draft", "published"]).transform((value) => value.toLowerCase() as "draft" | "published").default("draft"),
});

const courseSelect = `
  SELECT c.id, c.slug, c.title, c.description, c.category, c.level, c.duration,
         c.status, c.outcomes, c.modules, c.instructor_id,
         u.name AS instructor_name
  FROM lms_courses c
  LEFT JOIN lms_users u ON u.id = c.instructor_id
`;

export async function GET(request: Request) {
  try {
    const user = await getLmsSessionUser();
    const manage = new URL(request.url).searchParams.get("manage") === "1";
    if (manage && user && (user.role === "instructor" || user.role === "admin")) {
      return NextResponse.json({ courses: await getManageableLmsCourses(user.id, user.role) });
    }
    return NextResponse.json({ courses: await getPublishedLmsCourses() });
  } catch (error) {
    console.error("LMS course listing failed", error);
    return NextResponse.json({ error: "Unable to load LMS courses right now." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getLmsSessionUser();
    if (!user) return NextResponse.json({ error: "Sign in to manage courses." }, { status: 401 });
    if (user.role !== "instructor" && user.role !== "admin") return NextResponse.json({ error: "Only instructors and admins can manage courses." }, { status: 403 });

    const input = courseInputSchema.parse(await request.json());
    const result = await queryLms<LmsCourseDbRow>(
      `WITH inserted AS (
        INSERT INTO lms_courses (slug, title, description, category, level, duration, instructor_id, status, outcomes, modules)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb)
        RETURNING id
      )
      ${courseSelect} WHERE c.id = (SELECT id FROM inserted)`,
      [input.slug, input.title, input.description, input.category, input.level, input.duration, user.id, input.status, JSON.stringify(input.outcomes), JSON.stringify(input.modules)],
    );
    return NextResponse.json({ course: mapDbCourse(result.rows[0]) }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Enter valid course details before saving." }, { status: 400 });
    if (error && typeof error === "object" && "code" in error && error.code === "23505") return NextResponse.json({ error: "A course with this slug already exists." }, { status: 409 });
    console.error("LMS course creation failed", error);
    return NextResponse.json({ error: "Unable to create the course right now." }, { status: 500 });
  }
}