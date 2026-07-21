import { z } from "zod";
import { getPayload } from "payload";
import config from "@payload-config";
import { getCurrentCustomer } from "@/lib/customer";
import { json, readBody, sameOrigin } from "@/lib/api";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

const schema = z.object({
  message: z.string().trim().min(1, "Message is required.").max(5000),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!sameOrigin(req)) return json({ error: "Invalid origin." }, 403);

  const { id } = await params;
  const customer = await getCurrentCustomer();
  if (!customer) return json({ error: "Not authenticated." }, 401);

  if (!rateLimit(`ticket-reply:${customer.id}`, 20, 60_000).ok) {
    return json({ error: "Too many requests. Please slow down." }, 429);
  }

  const parsed = await readBody(req, schema);
  if ("error" in parsed) return parsed.error;
  const { message } = parsed.data;

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
    return json({ error: "Not found." }, 404);
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
      messages: [...existing, { author: customer.name || customer.email, message }],
    },
  });

  return json({ ok: true });
}
