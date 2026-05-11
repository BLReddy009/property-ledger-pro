import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/login", "/api/auth/login", "/api/auth/signup"];

export function proxy(request: NextRequest) {
  const isPublic = publicPaths.some((path) => request.nextUrl.pathname.startsWith(path));
  const hasSession = request.cookies.has("plp_session");
  if (!isPublic && !hasSession && request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
