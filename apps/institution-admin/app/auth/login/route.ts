import type { NextRequest } from "next/server";
import { proxyPublicGet, rewriteAuthPage } from "../../../lib/public-site-proxy";

export async function GET(request: NextRequest) {
  return proxyPublicGet(request, "/auth/login", {
    forwardCookies: true,
    rewriteText: rewriteAuthPage,
  });
}