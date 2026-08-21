/** Public support inbox — forms open a mail draft to this address (no API backend). */
export const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || "support@citis.in";
export const CAREERS_EMAIL = "careers@citis.in";

export function buildMailto(options: {
  to?: string;
  subject: string;
  body: string;
}) {
  const to = options.to || SUPPORT_EMAIL;
  const params = new URLSearchParams();
  params.set("subject", options.subject);
  params.set("body", options.body);
  return `mailto:${to}?${params.toString()}`;
}

export function openMailto(options: { to?: string; subject: string; body: string }) {
  const href = buildMailto(options);
  if (typeof window !== "undefined") {
    window.location.href = href;
  }
  return href;
}
