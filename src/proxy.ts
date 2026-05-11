import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/login", "/api/auth/login", "/api/auth/signup"];

export function proxy(request: NextRequest) {
  const isPublic = publicPaths.some((path) => request.nextUrl.pathname.startsWith(path));
  const hasSession = request.cookies.has("plp_session");
  if (!isPublic && !hasSession && !request.nextUrl.pathname.startsWith("/api")) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  if (!isPublic && !hasSession && request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (request.nextUrl.pathname === "/login" && hasSession) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
