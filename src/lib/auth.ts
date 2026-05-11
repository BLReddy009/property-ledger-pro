import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const cookieName = "plp_session";
const secret = new TextEncoder().encode(process.env.AUTH_SECRET ?? "dev-secret-change-me");

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  (await cookies()).set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
}

export async function clearSession() {
  (await cookies()).delete(cookieName);
}

export async function getSession(): Promise<SessionUser | null> {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as SessionUser;
  } catch {
    return null;
  }
}

export async function requireUser(roles?: Role[]) {
  const session = await getSession();
  if (!session) {
    throw new Response("Unauthorized", { status: 401 });
  }
  if (roles?.length && !roles.includes(session.role)) {
    throw new Response("Forbidden", { status: 403 });
  }
  return session;
}

export async function getFreshSessionUser() {
  const session = await getSession();
  if (!session) return null;
  return prisma.user
    .findUnique({
      where: { id: session.id },
      select: { id: true, name: true, email: true, role: true, currency: true, locale: true }
    })
    .catch(() => ({ ...session, currency: "INR", locale: "en" }));
}
