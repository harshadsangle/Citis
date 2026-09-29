import type { NextRequest } from "next/server";
import {
  proxyPublicGet,
  rewritePublicAssetPaths,
} from "../../../lib/public-site-proxy";

type AssetRouteContext = {
  params: Promise<{ path: string[] }>;
};

export async function GET(request: NextRequest, { params }: AssetRouteContext) {
  const { path } = await params;
  if (path.some((segment) => segment === "." || segment === ".." || segment.includes("\\"))) {
    return new Response("Invalid asset path.", { status: 400 });
  }

  const upstreamPath = `/${path.map(encodeURIComponent).join("/")}`;
  return proxyPublicGet(request, upstreamPath, {
    rewriteText: rewritePublicAssetPaths,
  });
}