import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token =
    request.cookies.get("citis_auth_token")?.value ??
    request.cookies.get("auth_token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
