import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, hashPassword } from "@/lib/auth";
import { signupSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const input = signupSchema.parse(await request.json());
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    return NextResponse.json({ message: "Email already registered" }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash: await hashPassword(input.password),
      role: input.role
    }
  });

  await createSession({ id: user.id, name: user.name, email: user.email, role: user.role });
  return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role });
}
