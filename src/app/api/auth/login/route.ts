import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, hashPassword, verifyPassword } from "@/lib/auth";
import { demoUsers } from "@/lib/roles";
import { loginSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const input = loginSchema.parse(await request.json());
    let user = await prisma.user.findUnique({ where: { email: input.email } });

    const demoLogin = demoUsers.find((demo) => demo.email === input.email && demo.password === input.password);

    if (demoLogin) {
      const passwordMatches = user ? await verifyPassword(input.password, user.passwordHash) : false;
      const demoPasswordHash = passwordMatches && user ? user.passwordHash : await hashPassword(input.password);

      user = await prisma.user.upsert({
        where: { email: input.email },
        create: {
          name: demoLogin.name,
          email: input.email,
          passwordHash: demoPasswordHash,
          role: demoLogin.role
        },
        update: passwordMatches
          ? { role: demoLogin.role }
          : {
              passwordHash: demoPasswordHash,
              role: demoLogin.role
            }
      });
    }

    if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    await createSession({ id: user.id, name: user.name, email: user.email, role: user.role });
    await prisma.auditLog.create({
      data: { userId: user.id, action: "LOGIN", entity: "User", entityId: user.id }
    });

    return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Login failed. Check database migration and environment variables." },
      { status: 500 }
    );
  }
}
