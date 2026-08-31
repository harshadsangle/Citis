import { NextResponse, type NextRequest } from "next/server";

const API_BASE = process.env.LMS_API_ORIGIN || "http://127.0.0.1:4000/api/v1";
const ADMIN_ROLES = ["CITIS_SUPER_ADMIN", "CITIS_PLATFORM_SUPPORT", "INSTITUTION_ADMINISTRATOR", "PRINCIPAL_DIRECTOR", "ACADEMIC_ADMINISTRATOR"];

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
  const response = await fetch(`${API_BASE}/auth/me`, { cache: "no-store", headers: { cookie: request.headers.get("cookie") || "" } });
  if (!response.ok) return NextResponse.redirect(new URL("/auth/login", request.url));
  const principal = await response.json() as { data?: { roles?: Array<{ code: string }> } };
  const roles = new Set(principal.data?.roles?.map((role) => role.code) || []);
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

export const config = { matcher: ["/"] };