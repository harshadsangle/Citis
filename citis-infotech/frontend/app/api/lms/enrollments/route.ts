import { NextResponse } from "next/server";
import { z } from "zod";
import { getLmsUserEnrollments, getPublishedLmsCourseRecord } from "@/lib/lms-course-db";
import { queryLms } from "@/lib/lms-db";
import { getLmsSessionUser } from "@/lib/lms-session";

const enrollmentSchema = z.object({
  courseSlug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(180),
});

export async function GET() {
  try {
    const user = await getLmsSessionUser();
    if (!user) return NextResponse.json({ error: "Sign in to view your enrollments." }, { status: 401 });
    return NextResponse.json({ enrollments: await getLmsUserEnrollments(user.id) });
  } catch (error) {
    console.error("LMS enrollment listing failed", error);
    return NextResponse.json({ error: "Unable to load enrollments right now." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getLmsSessionUser();
    if (!user) return NextResponse.json({ error: "Sign in before enrolling in a course." }, { status: 401 });
    if (user.role !== "student") return NextResponse.json({ error: "Only student accounts can enroll in courses." }, { status: 403 });

    const { courseSlug } = enrollmentSchema.parse(await request.json());
    const courseRecord = await getPublishedLmsCourseRecord(courseSlug);
    if (!courseRecord) return NextResponse.json({ error: "This course is unavailable for enrollment." }, { status: 404 });

    const result = await queryLms<{ id: number; status: "active" | "completed" | "withdrawn"; enrolled_at: Date }>(
      `INSERT INTO lms_enrollments (user_id, course_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, course_id) DO NOTHING
       RETURNING id, status, enrolled_at`,
      [user.id, courseRecord.id],
    );
    if (!result.rows[0]) return NextResponse.json({ error: "You are already enrolled in this course." }, { status: 409 });

    return NextResponse.json({
      enrollment: {
        id: result.rows[0].id,
        status: result.rows[0].status,
        enrolledAt: result.rows[0].enrolled_at,
        course: courseRecord.course,
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Choose a valid course before enrolling." }, { status: 400 });
    console.error("LMS enrollment creation failed", error);
    return NextResponse.json({ error: "Unable to enroll in this course right now." }, { status: 500 });
  }
}