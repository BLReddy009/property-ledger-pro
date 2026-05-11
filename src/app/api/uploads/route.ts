import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { DocumentCategory, Role } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  await requireUser([Role.OWNER_ADMIN, Role.ACCOUNTANT_MANAGER]);
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ message: "file is required" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const uploadRoot = process.env.UPLOAD_DIR ?? "./uploads";
  await mkdir(uploadRoot, { recursive: true });
  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9_.-]/g, "_")}`;
  const target = path.join(uploadRoot, safeName);
  await writeFile(target, bytes);

  const document = await prisma.document.create({
    data: {
      name: file.name,
      category: (String(form.get("category") ?? "OTHER") as DocumentCategory) || "OTHER",
      mimeType: file.type || "application/octet-stream",
      size: bytes.length,
      path: target,
      propertyId: String(form.get("propertyId") || "") || undefined,
      flatId: String(form.get("flatId") || "") || undefined
    }
  });

  return NextResponse.json(document, { status: 201 });
}
