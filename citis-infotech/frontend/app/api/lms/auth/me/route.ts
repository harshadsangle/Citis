import { NextResponse } from "next/server";
import { getLmsSessionUser } from "@/lib/lms-session";

export async function GET() {
  try {
    const user = await getLmsSessionUser();
    if (!user) return NextResponse.json({ user: null }, { status: 401 });
    return NextResponse.json({ user });
  } catch (error) {
    console.error("LMS session lookup failed", error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}