import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";

const reminderSchema = z.object({
  phone: z.string().min(6),
  tenantName: z.string().optional(),
  flatNumber: z.string().optional(),
  propertyName: z.string().optional(),
  amount: z.coerce.number().min(0).optional(),
  month: z.coerce.number().min(1).max(12).optional(),
  year: z.coerce.number().min(2020).optional(),
  message: z.string().optional()
});

function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

export async function POST(request: Request) {
  await requireUser();
  const input = reminderSchema.parse(await request.json());
  const phone = normalizePhone(input.phone);
  const text =
    input.message ||
    `Hello ${input.tenantName || "Tenant"}, rent reminder for ${input.propertyName || "your property"} flat ${input.flatNumber || ""} for ${input.month || ""}/${input.year || ""}. Pending amount: ${input.amount || 0}. Please complete the payment.`;

  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (token && phoneNumberId) {
    const response = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phone,
        type: "text",
        text: { body: text }
      })
    });

    if (!response.ok) {
      return NextResponse.json({ message: "WhatsApp API send failed", fallbackUrl: `https://wa.me/${phone}?text=${encodeURIComponent(text)}` }, { status: 502 });
    }

    return NextResponse.json({ sent: true });
  }

  return NextResponse.json({
    sent: false,
    fallbackUrl: `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
  });
}
