import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function GET(request: Request) {
  await requireUser();
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") ?? "json";
  const payments = await prisma.rentPayment.findMany({
    include: { flat: { include: { property: true } }, account: true },
    orderBy: { receivedDate: "desc" }
  });

  const rows = payments.map((payment) => ({
    property: payment.flat.property.name,
    flat: payment.flat.flatNumber,
    tenant: payment.flat.tenantName,
    month: `${payment.month}/${payment.year}`,
    expected: Number(payment.expectedAmount),
    received: Number(payment.receivedAmount),
    status: payment.status,
    method: payment.method,
    account: payment.account?.name ?? ""
  }));

  if (format === "csv") {
    const header = Object.keys(rows[0] ?? { property: "", flat: "", tenant: "", month: "" }).join(",");
    const body = rows.map((row) => Object.values(row).map((value) => `"${value}"`).join(",")).join("\n");
    return new Response(`${header}\n${body}`, {
      headers: {
        "content-type": "text/csv",
        "content-disposition": "attachment; filename=rent-report.csv"
      }
    });
  }

  return NextResponse.json(rows);
}
