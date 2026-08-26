import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { queryLms } from "@/lib/lms-db";
import { setLmsSession } from "@/lib/lms-session";

const loginSchema = z.object({
  email: z.string().trim().email().max(320),
  password: z.string().min(1).max(200),
});

export async function POST(request: Request) {
  try {
    const input = loginSchema.parse(await request.json());
    const result = await queryLms<{ id: number; name: string; email: string; role: "student" | "instructor" | "admin"; password_hash: string | null }>(
      "SELECT id, name, email, role, password_hash FROM lms_users WHERE email = $1",
      [input.email.toLowerCase()],
    );
    const user = result.rows[0];
    if (!user?.password_hash || !(await bcrypt.compare(input.password, user.password_hash))) {
      return NextResponse.json({ error: "The email or password is incorrect." }, { status: 401 });
    }

    await setLmsSession(user.id);
    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Enter a valid email and password to continue." }, { status: 400 });
    }
    console.error("LMS login failed", error);
    return NextResponse.json({ error: "Unable to sign in right now." }, { status: 500 });
  }
}