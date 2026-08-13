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
      messages: [...existing, { author: customer.name || customer.email, staff: false, message }],
    },
  });

  // Notify the team that the customer replied (best-effort; never blocks the reply).
  const notify = process.env.CONTACT_TO || process.env.CONTACT_FROM_ADDRESS;
  if (notify) {
    try {
      const base = process.env.SITE_URL || "https://syberinfo.com.au";
      await payload.sendEmail({
        to: notify,
        subject: `Customer reply — ticket "${String(ticket.subject || "")}"`,
        html: `<p><strong>${customer.name || customer.email}</strong> replied to ticket <strong>${String(
          ticket.subject || "",
        )}</strong>:</p><blockquote>${message.replace(/</g, "&lt;")}</blockquote><p><a href="${base}/admin/collections/tickets/${id}">Open in admin</a></p>`,
      });
    } catch {
      /* email is best-effort */
    }
  }

  return json({ ok: true });
}
