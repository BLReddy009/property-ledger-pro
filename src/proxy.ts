import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const publicPaths = ["/login", "/api/auth/login", "/api/auth/signup"];
const secret = new TextEncoder().encode(process.env.AUTH_SECRET ?? "dev-secret-change-me");

async function getSessionRole(request: NextRequest) {
  const token = request.cookies.get("plp_session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as { role?: string };
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
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
  const session = hasSession ? await getSessionRole(request) : null;
  const isTenant = session?.role === "TENANT";
  if (isTenant && request.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/tenant", request.url));
  }
  if (isTenant && !request.nextUrl.pathname.startsWith("/tenant") && !request.nextUrl.pathname.startsWith("/api/auth")) {
    if (request.nextUrl.pathname.startsWith("/api")) {
      return NextResponse.json({ message: "Tenant access is limited to assigned flat details" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/tenant", request.url));
  }
  if (request.nextUrl.pathname === "/login" && hasSession) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
