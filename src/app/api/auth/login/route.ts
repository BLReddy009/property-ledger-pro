import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, verifyPassword } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const input = loginSchema.parse(await request.json());
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
    return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
  }

  await createSession({ id: user.id, name: user.name, email: user.email, role: user.role });
  await prisma.auditLog.create({
    data: { userId: user.id, action: "LOGIN", entity: "User", entityId: user.id }
  });

  return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role });
}
