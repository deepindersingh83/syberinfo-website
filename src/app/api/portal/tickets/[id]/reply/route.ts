import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { getCurrentCustomer } from "@/lib/customer";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let body: { message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const message = body.message?.trim();
  if (!message) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  const payload = await getPayload({ config });
  const ticket = (await payload.findByID({
    collection: "tickets",
    id,
    overrideAccess: true,
    depth: 0,
  })) as unknown as Record<string, unknown>;

  const owner = ticket.customer as { id?: string | number } | string | number;
  const ownerId = typeof owner === "object" ? owner?.id : owner;
  if (String(ownerId) !== String(customer.id)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const existing = Array.isArray(ticket.messages)
    ? (ticket.messages as Record<string, unknown>[])
    : [];

  await payload.update({
    collection: "tickets",
    id,
    overrideAccess: true,
    data: {
      status: "customer-reply",
      messages: [
        ...existing,
        { author: customer.name || customer.email, message },
      ],
    },
  });

  return NextResponse.json({ ok: true });
}
