type LmsPortal = "learner" | "instructor";

const portalConfig: Record<LmsPortal, { localPort: number; externalPort: number }> = {
  learner: { localPort: 4103, externalPort: 3002 },
  instructor: { localPort: 4102, externalPort: 3003 },
};

function configuredOrigin(portal: LmsPortal) {
  return portal === "learner"
    ? process.env.NEXT_PUBLIC_STUDENT_PORTAL_URL?.trim()
    : process.env.NEXT_PUBLIC_TEACHER_PORTAL_URL?.trim();
}

export function lmsPortalUrl(portal: LmsPortal) {
  const configured = configuredOrigin(portal);
  if (configured) {
    try {
      return new URL("/", configured).toString();
    } catch {
      // Fall back to the current host if the optional portal URL is malformed.
    }
  }

  const destination = new URL(window.location.href);
  destination.pathname = "/";
  destination.search = "";
  destination.hash = "";
  const isLocal = destination.hostname === "localhost" || destination.hostname === "127.0.0.1";
  destination.port = String(isLocal ? portalConfig[portal].localPort : portalConfig[portal].externalPort);
  return destination.toString();
}