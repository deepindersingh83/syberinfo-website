import { z } from "zod";
import { getPayload } from "payload";
import config from "@payload-config";
import { getCurrentCustomer } from "@/lib/customer";
import { json, readBody, sameOrigin } from "@/lib/api";
import { rateLimit } from "@/lib/rateLimit";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

const schema = z.object({
  subject: z.string().trim().min(1, "Subject is required.").max(200),
  department: z.enum(["support", "billing", "sales"]).optional(),
  message: z.string().trim().min(1, "Message is required.").max(5000),
});

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Invalid origin." }, 403);

  const customer = await getCurrentCustomer();
  if (!customer) return json({ error: "Not authenticated." }, 401);

  if (!rateLimit(`ticket-new:${customer.id}`, 10, 60_000).ok) {
    return json({ error: "Too many requests. Please slow down." }, 429);
  }

  const parsed = await readBody(req, schema);
  if ("error" in parsed) return parsed.error;
  const { subject, message, department = "support" } = parsed.data;

  const payload = await getPayload({ config });
  const ticket = await payload.create({
    collection: "tickets",
    overrideAccess: true,
    data: {
      subject,
      department,
      customer: customer.id as number,
      status: "open",
      priority: "medium",
      messages: [{ author: customer.name || customer.email, message }],
    },
  });

  logger.info("portal: ticket created", { ticket: ticket.id, customer: customer.id });
  return json({ id: ticket.id });
}
