export function normalizeOrigin(origin: string) {
  return origin.trim().replace(/\/+$/, "");
}

export function isOriginAllowed(origin: string | undefined, allowedOrigins: ReadonlySet<string>) {
  return !origin || allowedOrigins.has(normalizeOrigin(origin));
}

/** Pair apex and www for citisinfotech.in when either is configured in WEB_ORIGIN. */
export function expandWebOrigins(origins: string[]) {
  const expanded = new Set(origins.map(normalizeOrigin).filter(Boolean));
  for (const origin of expanded) {
    try {
      const url = new URL(origin);
      if (url.hostname === "www.citisinfotech.in") {
        expanded.add("https://citisinfotech.in");
      } else if (url.hostname === "citisinfotech.in") {
        expanded.add("https://www.citisinfotech.in");
      }
    } catch {
      // Ignore malformed WEB_ORIGIN entries.
    }
  }
  return [...expanded];
}