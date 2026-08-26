import { NextResponse } from "next/server";
import { z } from "zod";
import { getLmsCourseBySlug } from "@/lib/lms-course-db";
import { queryLms } from "@/lib/lms-db";
import { getLmsSessionUser } from "@/lib/lms-session";

const courseUpdateSchema = z.object({
  title: z.string().trim().min(1).max(240),
  description: z.string().trim().max(10000).default(""),
  category: z.string().trim().max(120).default("Future Skills"),
  level: z.string().trim().max(40).default("Foundation"),
  duration: z.string().trim().max(80).default("6 weeks"),
  outcomes: z.array(z.string().trim().min(1).max(500)).max(20).default([]),
  modules: z.array(z.unknown()).max(100).default([]),
  status: z.enum(["Draft", "Published", "draft", "published"]).transform((value) => value.toLowerCase() as "draft" | "published").default("draft"),
});

async function canManageCourse(slug: string) {
  const user = await getLmsSessionUser();
  if (!user) return { response: NextResponse.json({ error: "Sign in to manage courses." }, { status: 401 }), user: null, course: null };
  if (user.role !== "instructor" && user.role !== "admin") return { response: NextResponse.json({ error: "Only instructors and admins can manage courses." }, { status: 403 }), user: null, course: null };

  const result = await queryLms<{ id: number; instructor_id: number | null }>("SELECT id, instructor_id FROM lms_courses WHERE slug = $1", [slug]);
  const course = result.rows[0];
  if (!course) return { response: NextResponse.json({ error: "Course not found." }, { status: 404 }), user: null, course: null };
  if (user.role === "instructor" && course.instructor_id !== null && String(course.instructor_id) !== String(user.id)) {
    return { response: NextResponse.json({ error: "You can only manage your own courses." }, { status: 403 }), user: null, course: null };
  }
  return { response: null, user, course };
}

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const course = await getLmsCourseBySlug((await context.params).slug);
  if (!course || course.status !== "Published") return NextResponse.json({ error: "Course not found." }, { status: 404 });
  return NextResponse.json({ course });
}

export async function PUT(request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const slug = (await context.params).slug;
    const access = await canManageCourse(slug);
    if (access.response) return access.response;
    if (access.user?.role === "instructor" && access.course?.instructor_id === null) {
      return NextResponse.json({ error: "Legacy catalogue courses cannot be deleted by instructors." }, { status: 403 });
    }
    const input = courseUpdateSchema.parse(await request.json());
    await queryLms(
      `UPDATE lms_courses
       SET title = $1, description = $2, category = $3, level = $4, duration = $5,
           instructor_id = COALESCE(instructor_id, $6), status = $7, outcomes = $8::jsonb,
           modules = $9::jsonb, updated_at = NOW()
       WHERE slug = $10`,
      [input.title, input.description, input.category, input.level, input.duration, access.user?.id, input.status, JSON.stringify(input.outcomes), JSON.stringify(input.modules), slug],
    );
    const course = await getLmsCourseBySlug(slug);
    if (!course) return NextResponse.json({ error: "Course not found." }, { status: 404 });
    return NextResponse.json({ course });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Enter valid course details before saving." }, { status: 400 });
    console.error("LMS course update failed", error);
    return NextResponse.json({ error: "Unable to update the course right now." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const slug = (await context.params).slug;
    const access = await canManageCourse(slug);
    if (access.response) return access.response;
    await queryLms("DELETE FROM lms_courses WHERE slug = $1", [slug]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("LMS course deletion failed", error);
    return NextResponse.json({ error: "Unable to delete the course right now." }, { status: 500 });
  }
}