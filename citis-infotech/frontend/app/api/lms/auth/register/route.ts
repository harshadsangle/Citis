import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { queryLms } from "@/lib/lms-db";
import { setLmsSession } from "@/lib/lms-session";

const registrationSchema = z.object({
  name: z.string().trim().min(1).max(160),
  email: z.string().trim().email().max(320),
  password: z.string().min(6).max(200),
  role: z.enum(["student", "instructor", "admin"]).default("student"),
});

export async function POST(request: Request) {
  try {
    const input = registrationSchema.parse(await request.json());
    const email = input.email.toLowerCase();
    const passwordHash = await bcrypt.hash(input.password, 12);
    const result = await queryLms<{ id: number; name: string; email: string; role: "student" | "instructor" | "admin" }>(
      "INSERT INTO lms_users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role",
      [input.name, email, passwordHash, input.role],
    );
    const user = result.rows[0];
    await setLmsSession(user.id);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Enter a name, valid email, password of at least 6 characters, and a valid role." }, { status: 400 });
    }
    if (error && typeof error === "object" && "code" in error && error.code === "23505") {
      return NextResponse.json({ error: "An LMS account with this email already exists." }, { status: 409 });
    }
    console.error("LMS registration failed", error);
    return NextResponse.json({ error: "Unable to create your LMS account right now." }, { status: 500 });
  }
}