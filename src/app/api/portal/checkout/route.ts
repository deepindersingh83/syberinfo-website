import { getPayload } from "payload";
import config from "@payload-config";
import { getCurrentCustomer } from "@/lib/customer";
import { json, sameOrigin, readBody } from "@/lib/api";
import { stripeEnabled, createInvoiceCheckout } from "@/lib/stripe";
import { rateLimit } from "@/lib/rateLimit";
import { logger } from "@/lib/logger";
import { z } from "zod";

export const runtime = "nodejs";

const schema = z.object({ invoiceId: z.string().min(1) });

/** Create a Stripe Checkout Session to pay one of the customer's invoices. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Invalid origin." }, 403);
  if (!stripeEnabled()) return json({ error: "Online payments are not enabled." }, 501);

  const customer = await getCurrentCustomer();
  if (!customer) return json({ error: "Not authenticated." }, 401);
  if (!rateLimit(`checkout:${customer.id}`, 10, 60_000).ok) {
    return json({ error: "Too many requests." }, 429);
  }

  const parsed = await readBody(req, schema);
  if ("error" in parsed) return parsed.error;

  const payload = await getPayload({ config });
  const invoice = (await payload
    .findByID({ collection: "invoices", id: parsed.data.invoiceId, overrideAccess: true, depth: 0 })
    .catch(() => null)) as Record<string, unknown> | null;

  if (!invoice) return json({ error: "Invoice not found." }, 404);
  const owner = invoice.customer as { id?: string | number } | string | number;
  const ownerId = typeof owner === "object" ? owner?.id : owner;
  if (String(ownerId) !== String(customer.id)) return json({ error: "Not found." }, 404);
  if (invoice.status === "paid") return json({ error: "This invoice is already paid." }, 400);

  const total = Number(invoice.total) || 0;
  const base = process.env.SITE_URL || "https://syberinfo.com.au";

  try {
    const session = await createInvoiceCheckout({
      invoiceNumber: String(invoice.number),
      amountCents: Math.round(total * 100),
      customerEmail: customer.email,
      successUrl: `${base}/portal?paid=${invoice.number}`,
      cancelUrl: `${base}/portal?cancelled=${invoice.number}`,
    });
    return json({ url: session.url });
  } catch (err) {
    logger.error("checkout: failed to create session", {
      invoice: invoice.number,
      message: err instanceof Error ? err.message : String(err),
    });
    return json({ error: "Could not start checkout. Please try again." }, 502);
  }
}
