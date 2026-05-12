import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { requireUser, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createUserSchema } from "@/lib/validations";
import { recordAuditLog } from "@/lib/audit";

export async function GET() {
  await requireUser([Role.OWNER_ADMIN]);
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      flatId: true,
      createdAt: true,
      flat: { select: { flatNumber: true, tenantName: true, property: { select: { name: true } } } }
    },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  try {
    const currentUser = await requireUser([Role.OWNER_ADMIN]);
    const input = createUserSchema.parse(await request.json());
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      return NextResponse.json({ message: "Email already registered" }, { status: 409 });
    }

    if (input.role === Role.TENANT) {
      const flat = await prisma.flat.findUnique({ where: { id: input.flatId || "" } });
      if (!flat) {
        return NextResponse.json({ message: "Select a valid flat for tenant login" }, { status: 400 });
      }
    }

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash: await hashPassword(input.password),
        role: input.role,
        flatId: input.role === Role.TENANT ? input.flatId || undefined : undefined
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        flatId: true,
        createdAt: true,
        flat: { select: { flatNumber: true, tenantName: true, property: { select: { name: true } } } }
      }
    });

    await recordAuditLog({
      userId: currentUser.id,
      action: "CREATE",
      entity: "User",
      entityId: user.id,
      after: { email: user.email, role: user.role, flatId: user.flatId }
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error(error);
    return NextResponse.json({ message: "Could not create user login." }, { status: 500 });
  }
}
