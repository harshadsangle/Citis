export function normalizeOrigin(origin: string) {
  return origin.trim().replace(/\/+$/, "");
}

export function isOriginAllowed(origin: string | undefined, allowedOrigins: ReadonlySet<string>) {
  return !origin || allowedOrigins.has(normalizeOrigin(origin));
}