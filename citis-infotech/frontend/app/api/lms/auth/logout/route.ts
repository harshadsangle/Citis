import { NextResponse } from "next/server";
import { clearLmsSession } from "@/lib/lms-session";

export async function POST() {
  await clearLmsSession();
  return NextResponse.json({ ok: true });
}