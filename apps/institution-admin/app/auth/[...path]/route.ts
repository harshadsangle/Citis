import type { NextRequest } from "next/server";
import { proxyPublicGet, rewriteAuthPage } from "../../../lib/public-site-proxy";

type AuthRouteContext = {
  params: Promise<{ path: string[] }>;
};

export async function GET(request: NextRequest, { params }: AuthRouteContext) {
  const { path } = await params;
  if (path.some((segment) => segment === "." || segment === ".." || segment.includes("\\"))) {
    return new Response("Invalid authentication path.", { status: 400 });
  }

  const upstreamPath = `/auth/${path.map(encodeURIComponent).join("/")}`;
  return proxyPublicGet(request, upstreamPath, {
    forwardCookies: true,
    rewriteText: rewriteAuthPage,
  });
}