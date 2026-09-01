import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { LmsPortal } from "@/lib/lms-roles";
import type { LmsCourseProvider } from "@/lib/lms-catalog";

const portalConfig: Record<LmsPortal, { environmentKey: string; localPort: number; externalPort: number }> = {
  learner: {
    environmentKey: "NEXT_PUBLIC_STUDENT_PORTAL_URL",
    localPort: 4103,
    externalPort: 3002,
  },
  admin: {
    environmentKey: "NEXT_PUBLIC_INSTITUTION_PORTAL_URL",
    localPort: 4101,
    externalPort: 3001,
  },
  instructor: {
    environmentKey: "NEXT_PUBLIC_TEACHER_PORTAL_URL",
    localPort: 4102,
    externalPort: 3003,
  },
};

function configuredOrigin(portal: LmsPortal) {
  const configured = process.env[portalConfig[portal].environmentKey]?.trim();
  if (!configured) return null;

  try {
    return new URL(configured).origin;
  } catch {
    throw new Error(`${portalConfig[portal].environmentKey} must be an absolute URL.`);
  }
}

async function requestOrigin(portal: LmsPortal) {
  if (process.env.NODE_ENV === "production") {
    throw new Error(`Missing canonical ${portalConfig[portal].environmentKey} configuration`);
  }
  const requestHeaders = await headers();
  const forwardedHost = requestHeaders.get("x-forwarded-host")?.split(",")[0]?.trim();
  const requestedHost = forwardedHost || requestHeaders.get("host") || "";
  const hostname = requestedHost ? new URL(`http://${requestedHost}`).hostname : "";
  const allowedHosts = new Set([
    "localhost",
    "127.0.0.1",
    process.env.REPLIT_DEV_DOMAIN,
    ...(process.env.REPLIT_DOMAINS || "").split(","),
  ].filter(Boolean));
  const host = allowedHosts.has(hostname) ? requestedHost : "127.0.0.1:5000";
  const forwardedProto = requestHeaders.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProto || (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  const origin = new URL(`${protocol}://${host}`);
  const isLocal = origin.hostname === "localhost" || origin.hostname === "127.0.0.1";
  origin.port = String(isLocal ? portalConfig[portal].localPort : portalConfig[portal].externalPort);
  return origin.origin;
}

export async function redirectToLmsPortal(portal: LmsPortal, provider?: LmsCourseProvider) {
  const origin = configuredOrigin(portal) || (await requestOrigin(portal));
  const destination = new URL(`${origin}/`);
  if (provider) destination.searchParams.set("provider", provider);
  redirect(destination.toString());
}

export type { LmsPortal } from "@/lib/lms-roles";