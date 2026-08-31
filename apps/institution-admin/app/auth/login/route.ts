import { headers } from "next/headers";
import { NextResponse } from "next/server";

function websiteOrigin(requestHeaders: Headers) {
  const configured = process.env.NEXT_PUBLIC_WEBSITE_URL?.trim();
  if (configured) return new URL(configured).origin;
  if (process.env.NODE_ENV === "production") return null;
  const requestedHost = requestHeaders.get("x-forwarded-host")?.split(",")[0]?.trim() || requestHeaders.get("host") || "";
  const hostname = requestedHost ? new URL(`http://${requestedHost}`).hostname : "";
  const allowedHosts = new Set(["localhost", "127.0.0.1", process.env.REPLIT_DEV_DOMAIN, ...(process.env.REPLIT_DOMAINS || "").split(",")].filter(Boolean));
  const host = allowedHosts.has(hostname) ? requestedHost : "127.0.0.1:4101";
  const protocol = requestHeaders.get("x-forwarded-proto")?.split(",")[0]?.trim()
    || (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  const origin = new URL(`${protocol}://${host}`);
  origin.port = origin.hostname === "localhost" || origin.hostname.startsWith("127.")
    ? "5000"
    : "";
  return origin.origin;
}

export async function GET() {
  const requestHeaders = await headers();
  const origin = websiteOrigin(requestHeaders);
  if (!origin) return new NextResponse("NEXT_PUBLIC_WEBSITE_URL is required", { status: 500 });
  const destination = new URL("/auth/login", origin);
  destination.searchParams.set("portal", "admin");
  return NextResponse.redirect(destination);
}