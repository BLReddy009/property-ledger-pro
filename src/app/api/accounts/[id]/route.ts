import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { ZodError } from "zod";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { accountUpdateSchema } from "@/lib/validations";
import { recordAuditLog } from "@/lib/audit";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser([Role.OWNER_ADMIN, Role.ACCOUNTANT_MANAGER]);
    const { id } = await params;
    const input = accountUpdateSchema.parse(await request.json());
    const before = await prisma.account.findUnique({ where: { id } });

    if (!before) {
      return NextResponse.json({ message: "Account not found" }, { status: 404 });
    }

    const account = await prisma.account.update({
      where: { id },
      data: { name: input.name },
      include: { property: { select: { id: true, name: true } } }
    });

    await recordAuditLog({
      userId: user.id,
      action: "UPDATE",
      entity: "Account",
      entityId: account.id,
      before,
      after: { name: account.name }
    });

    return NextResponse.json(account);
  } catch (error) {
    if (error instanceof Response) return error;
    if (error instanceof ZodError) {
      return NextResponse.json({ message: "Account name must be 2 to 80 characters." }, { status: 400 });
    }

    console.error(error);
    return NextResponse.json({ message: "Could not update account name." }, { status: 500 });
  }
}
