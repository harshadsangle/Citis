import { headers } from "next/headers";
import { redirect } from "next/navigation";

export type LmsPortal = "learner" | "institution";

const portalConfig: Record<LmsPortal, { environmentKey: string; localPort: number; externalPort: number }> = {
  learner: {
    environmentKey: "NEXT_PUBLIC_STUDENT_PORTAL_URL",
    localPort: 4103,
    externalPort: 3002,
  },
  institution: {
    environmentKey: "NEXT_PUBLIC_INSTITUTION_PORTAL_URL",
    localPort: 4101,
    externalPort: 3001,
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
  const requestHeaders = await headers();
  const forwardedHost = requestHeaders.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || requestHeaders.get("host") || "127.0.0.1:5000";
  const forwardedProto = requestHeaders.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProto || (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  const origin = new URL(`${protocol}://${host}`);
  const isLocal = origin.hostname === "localhost" || origin.hostname === "127.0.0.1";
  origin.port = String(isLocal ? portalConfig[portal].localPort : portalConfig[portal].externalPort);
  return origin.origin;
}

export async function redirectToLmsPortal(portal: LmsPortal) {
  const origin = configuredOrigin(portal) || (await requestOrigin(portal));
  redirect(`${origin}/`);
}