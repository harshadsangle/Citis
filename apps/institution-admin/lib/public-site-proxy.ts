import { NextResponse, type NextRequest } from "next/server";

export type ProxyTextRewriter = (
  text: string,
  websiteOrigin: string,
  requestOrigin: string,
) => string;

const forwardedRequestHeaders = [
  "accept",
  "accept-language",
  "user-agent",
  "rsc",
  "next-router-state-tree",
  "next-router-prefetch",
  "next-router-segment-prefetch",
  "next-url",
  "x-nextjs-data",
];

const hopByHopResponseHeaders = [
  "connection",
  "content-encoding",
  "content-length",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
];

function getWebsiteOrigin(request: NextRequest) {
  const configured = process.env.NEXT_PUBLIC_WEBSITE_URL?.trim();
  if (configured) {
    try {
      return new URL(configured).origin;
    } catch {
      return null;
    }
  }
  if (process.env.NODE_ENV === "production") return null;

  const requestedHost =
    request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    request.headers.get("host") ||
    "";
  let hostname = "";
  try {
    hostname = requestedHost ? new URL(`http://${requestedHost}`).hostname : "";
  } catch {
    // Use the local public-site origin below for malformed forwarded hosts.
  }

  const allowedHosts = new Set([
    "localhost",
    "127.0.0.1",
    process.env.REPLIT_DEV_DOMAIN,
    ...(process.env.REPLIT_DOMAINS || "").split(","),
  ].filter(Boolean));
  const host = allowedHosts.has(hostname) ? requestedHost : "127.0.0.1:4101";
  const protocol =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
    (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  const origin = new URL(`${protocol}://${host}`);
  origin.port =
    origin.hostname === "localhost" || origin.hostname.startsWith("127.") ? "5000" : origin.port;
  return origin.origin;
}

export function rewritePublicAssetPaths(
  text: string,
  websiteOrigin: string,
  requestOrigin: string,
) {
  return text
    .replace(/(["'`(<])\/_next\//g, "$1/auth-assets/_next/")
    .replaceAll(`${websiteOrigin}/_next/`, `${requestOrigin}/auth-assets/_next/`)
    .replace(/(["'`(<])\/icons\//g, "$1/auth-assets/icons/")
    .replaceAll(`${websiteOrigin}/icons/`, `${requestOrigin}/auth-assets/icons/`)
    .replace(/(["'`(<])\/favicon\.ico(?=[?#"'`)>])/g, "$1/auth-assets/favicon.ico")
    .replaceAll(`${websiteOrigin}/favicon.ico`, `${requestOrigin}/auth-assets/favicon.ico`)
    .replace(/(["'`(<])\/manifest\.json(?=[?#"'`)>])/g, "$1/auth-assets/manifest.json")
    .replaceAll(
      `${websiteOrigin}/manifest.json`,
      `${requestOrigin}/auth-assets/manifest.json`,
    );
}

export function rewriteAuthPage(
  text: string,
  websiteOrigin: string,
  requestOrigin: string,
) {
  return rewritePublicAssetPaths(text, websiteOrigin, requestOrigin)
    .replaceAll(`${websiteOrigin}/auth/`, `${requestOrigin}/auth/`)
    .replace(/href=(["'])\/lms([^"']*)\1/g, (_match, quote: string, suffix: string) =>
      `href=${quote}${websiteOrigin}/lms${suffix}${quote}`,
    )
    .replace(/href=(["'])\/contact([^"']*)\1/g, (_match, quote: string, suffix: string) =>
      `href=${quote}${websiteOrigin}/contact${suffix}${quote}`,
    );
}

export async function proxyPublicGet(
  request: NextRequest,
  upstreamPath: string,
  options: {
    forwardCookies?: boolean;
    rewriteText?: ProxyTextRewriter;
  } = {},
) {
  const websiteOrigin = getWebsiteOrigin(request);
  if (!websiteOrigin) {
    return new NextResponse(
      "Admin sign-in proxy is not configured. Set NEXT_PUBLIC_WEBSITE_URL and rebuild.",
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (
    !upstreamPath.startsWith("/") ||
    upstreamPath.startsWith("//") ||
    upstreamPath.includes("\\") ||
    upstreamPath.split("/").some((part) => part === "." || part === "..")
  ) {
    return new NextResponse("Invalid proxy path.", {
      status: 400,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const upstreamUrl = new URL(upstreamPath, websiteOrigin);
  upstreamUrl.search = request.nextUrl.search;
  if (upstreamPath.startsWith("/auth/")) {
    upstreamUrl.searchParams.set("portal", "admin");
  }

  const requestHeaders = new Headers();
  for (const name of forwardedRequestHeaders) {
    const value = request.headers.get(name);
    if (value) requestHeaders.set(name, value);
  }
  if (options.forwardCookies) {
    const cookie = request.headers.get("cookie");
    if (cookie) requestHeaders.set("cookie", cookie);
  }

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(upstreamUrl, {
      headers: requestHeaders,
      cache: "no-store",
      redirect: "manual",
      signal: request.signal,
    });
  } catch {
    return new NextResponse("Admin sign-in proxy could not reach the public login service.", {
      status: 502,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const responseHeaders = new Headers(upstreamResponse.headers);
  for (const name of hopByHopResponseHeaders) responseHeaders.delete(name);
  if (options.forwardCookies) responseHeaders.set("Cache-Control", "no-store");

  const status = upstreamResponse.status;
  if ([301, 302, 303, 307, 308].includes(status)) {
    const location = upstreamResponse.headers.get("location");
    if (!location) {
      return new NextResponse(null, { status, headers: responseHeaders });
    }

    const target = new URL(location, upstreamUrl);
    if (target.origin !== websiteOrigin) {
      return new NextResponse("Admin sign-in proxy blocked an external redirect.", {
        status: 502,
        headers: { "Cache-Control": "no-store" },
      });
    }

    const isAuthPage = upstreamPath.startsWith("/auth/");
    if (isAuthPage && !target.pathname.startsWith("/auth/")) {
      return new NextResponse("Admin sign-in proxy blocked a redirect outside authentication.", {
        status: 502,
        headers: { "Cache-Control": "no-store" },
      });
    }
    const clientPath = isAuthPage ? target.pathname : `/auth-assets${target.pathname}`;
    responseHeaders.set("location", `${clientPath}${target.search}${target.hash}`);
    return new NextResponse(null, { status, headers: responseHeaders });
  }

  let body: BodyInit | null = upstreamResponse.body;
  const contentType = upstreamResponse.headers.get("content-type")?.toLowerCase() ?? "";
  const isTextResponse =
    contentType.startsWith("text/") ||
    contentType.includes("javascript") ||
    contentType.includes("json") ||
    contentType.includes("svg+xml");

  if (options.rewriteText && isTextResponse && upstreamResponse.body) {
    const text = await upstreamResponse.text();
    body = options.rewriteText(text, websiteOrigin, request.nextUrl.origin);
    const linkHeader = responseHeaders.get("link");
    if (linkHeader) {
      responseHeaders.set(
        "link",
        options.rewriteText(linkHeader, websiteOrigin, request.nextUrl.origin),
      );
    }
  }

  return new NextResponse(body, { status, headers: responseHeaders });
}