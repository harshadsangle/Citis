export function lmsHomepageUrl() {
  const configured = process.env.NEXT_PUBLIC_WEBSITE_URL?.trim();
  if (configured) {
    try {
      return new URL("/lms", configured).toString();
    } catch {
      // Fall back to the current host if the optional public URL is malformed.
    }
  }

  const destination = new URL(window.location.href);
  destination.pathname = "/lms";
  destination.search = "";
  destination.hash = "";
  if (destination.hostname === "localhost" || destination.hostname === "127.0.0.1") {
    destination.port = "5000";
  } else if (["4101", "4102", "4103"].includes(destination.port)) {
    destination.port = "";
  }
  return destination.toString();
}