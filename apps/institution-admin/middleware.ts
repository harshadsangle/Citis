import { NextResponse, type NextRequest } from "next/server";

const API_BASE = process.env.LMS_API_ORIGIN || "http://127.0.0.1:4000/api/v1";
const ADMIN_ROLES = ["CITIS_SUPER_ADMIN", "CITIS_PLATFORM_SUPPORT", "INSTITUTION_ADMINISTRATOR", "PRINCIPAL_DIRECTOR", "ACADEMIC_ADMINISTRATOR"];
const AUTH_ME_TIMEOUT_MS = 3000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function rolesForRequest(request: NextRequest) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AUTH_ME_TIMEOUT_MS);
  try {
    const response = await fetch(`${API_BASE}/auth/me`, {
      cache: "no-store",
      headers: { cookie: request.headers.get("cookie") || "" },
      signal: controller.signal,
    });
    if (!response.ok) return null;
    const payload: unknown = await response.json();
    if (!isRecord(payload) || !isRecord(payload.data) || !Array.isArray(payload.data.roles)) return null;
    if (!payload.data.roles.every((role) => isRecord(role) && typeof role.code === "string")) return null;
    return new Set(payload.data.roles.map((role) => String((role as Record<string, unknown>).code)));
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function publicPortal(request: NextRequest, portal: "instructor" | "learner") {
  const configured = process.env.NEXT_PUBLIC_WEBSITE_URL?.trim();
  if (!configured && process.env.NODE_ENV === "production") return null;
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const requestedHost = forwardedHost || request.headers.get("host") || "";
  const hostname = requestedHost ? new URL(`http://${requestedHost}`).hostname : "";
  const allowedHosts = new Set(["localhost", "127.0.0.1", process.env.REPLIT_DEV_DOMAIN, ...(process.env.REPLIT_DOMAINS || "").split(",")].filter(Boolean));
  const host = allowedHosts.has(hostname) ? requestedHost : "127.0.0.1:4101";
  const protocol = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  const destination = configured ? new URL("/lms", configured) : new URL(`${protocol}://${host}`);
  if (!configured) destination.port = destination.hostname === "localhost" || destination.hostname.startsWith("127.") ? "5000" : "";
  destination.pathname = "/lms";
  destination.search = `?portal=${portal}`;
  return destination;
}

export async function middleware(request: NextRequest) {
  const roles = await rolesForRequest(request);
  if (!roles) return NextResponse.redirect(new URL("/auth/login", request.url));
  if (ADMIN_ROLES.some((role) => roles.has(role))) return NextResponse.next();
  if (roles.has("TEACHER")) {
    const destination = publicPortal(request, "instructor");
    return destination ? NextResponse.redirect(destination) : new NextResponse("NEXT_PUBLIC_WEBSITE_URL is required", { status: 500 });
  }
  if (roles.has("STUDENT")) {
    const destination = publicPortal(request, "learner");
    return destination ? NextResponse.redirect(destination) : new NextResponse("NEXT_PUBLIC_WEBSITE_URL is required", { status: 500 });
  }
  return NextResponse.redirect(new URL("/auth/login", request.url));
}

export const config = { matcher: ["/((?!auth(?:/.*)?$|_next/static|_next/image|favicon.ico).*)"] };