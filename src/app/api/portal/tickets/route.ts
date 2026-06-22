import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { getCurrentCustomer } from "@/lib/customer";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let body: { subject?: string; department?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const subject = body.subject?.trim();
  const message = body.message?.trim();
  const department = ["support", "billing", "sales"].includes(body.department || "")
    ? body.department
    : "support";
  if (!subject || !message) {
    return NextResponse.json({ error: "Subject and message are required." }, { status: 400 });
  }

  const payload = await getPayload({ config });
  const ticket = await payload.create({
    collection: "tickets",
    overrideAccess: true,
    data: {
      subject,
      department: department as "support" | "billing" | "sales",
      customer: customer.id as number,
      status: "open",
      priority: "medium",
      messages: [{ author: customer.name || customer.email, message }],
    },
  });

  return NextResponse.json({ id: ticket.id });
}
