import { headers } from "next/headers";
import { NextResponse } from "next/server";

function websiteOrigin(requestHeaders: Headers) {
  const configured = process.env.NEXT_PUBLIC_WEBSITE_URL?.trim();
  if (configured) return new URL(configured).origin;

  const host = requestHeaders.get("x-forwarded-host")?.split(",")[0]?.trim()
    || requestHeaders.get("host")
    || "127.0.0.1:4103";
  const protocol = requestHeaders.get("x-forwarded-proto")?.split(",")[0]?.trim()
    || (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  const origin = new URL(`${protocol}://${host}`);
  origin.port = origin.hostname === "localhost" || origin.hostname === "127." || origin.hostname.startsWith("127.")
    ? "5000"
    : "80";
  return origin.origin;
}

export async function GET() {
  const requestHeaders = await headers();
  const destination = new URL("/auth/login", websiteOrigin(requestHeaders));
  destination.searchParams.set("callbackUrl", "/lms?portal=learner");
  return NextResponse.redirect(destination);
}