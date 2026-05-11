import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, hashPassword, verifyPassword } from "@/lib/auth";
import { demoUsers } from "@/lib/roles";
import { loginSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const input = loginSchema.parse(await request.json());
    const email = input.email;
    const password = input.password.trim();
    const demoLogin = demoUsers.find((demo) => demo.email === email && demo.password === password);
    let user = null;

    if (demoLogin) {
      try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        const passwordMatches = existingUser ? await verifyPassword(password, existingUser.passwordHash) : false;
        const demoPasswordHash = passwordMatches && existingUser ? existingUser.passwordHash : await hashPassword(password);

        user = await prisma.user.upsert({
          where: { email },
          create: {
            name: demoLogin.name,
            email,
            passwordHash: demoPasswordHash,
            role: demoLogin.role
          },
          update: passwordMatches
            ? { name: demoLogin.name, role: demoLogin.role }
            : {
                name: demoLogin.name,
                passwordHash: demoPasswordHash,
                role: demoLogin.role
              }
        });
      } catch (error) {
        console.error("Demo login database fallback", error);
        user = {
          id: `demo-${demoLogin.role.toLowerCase()}`,
          name: demoLogin.name,
          email: demoLogin.email,
          role: demoLogin.role,
          passwordHash: ""
        };
      }
    } else {
      user = await prisma.user.findUnique({ where: { email } });
    }

    if (!user || (!demoLogin && !(await verifyPassword(password, user.passwordHash)))) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    await createSession({ id: user.id, name: user.name, email: user.email, role: user.role, flatId: user.flatId });

    if (!user.id.startsWith("demo-")) {
      prisma.auditLog
        .create({
          data: { userId: user.id, action: "LOGIN", entity: "User", entityId: user.id }
        })
        .catch((error) => console.error("Login audit log failed", error));
    }

    return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Login failed. Check database migration and environment variables." },
      { status: 500 }
    );
  }
}
