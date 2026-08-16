import { z } from "zod";
import { getPayload } from "payload";
import config from "@payload-config";
import { json, readBody, sameOrigin } from "@/lib/api";
import { stripeEnabled, createQuoteCheckout } from "@/lib/stripe";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

const schema = z.object({ token: z.string().trim().min(10).max(100) });

/**
 * Public quote payment. The prospect clicks "Pay now" on their proposal page;
 * we create a Stripe Checkout Session for the quote total and return the hosted
 * URL. Reconciliation happens in the Stripe webhook (metadata.quoteToken).
 */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Invalid origin." }, 403);
  if (!stripeEnabled()) return json({ error: "Online payments are not enabled." }, 501);
  if (!rateLimit(`quote-pay:${clientIp(req)}`, 10, 60_000).ok) {
    return json({ error: "Too many requests." }, 429);
  }

  const parsed = await readBody(req, schema);
  if ("error" in parsed) return parsed.error;

  try {
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: "quotes",
      where: { acceptToken: { equals: parsed.data.token } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });
    const quote = docs[0] as unknown as Record<string, unknown> | undefined;
    if (!quote) return json({ error: "Quote not found." }, 404);

    if (quote.paidAt) return json({ error: "This proposal is already paid." }, 400);
    if (quote.validUntil && new Date(quote.validUntil as string) < new Date()) {
      return json({ error: "This proposal has expired. Please contact us for an updated quote." }, 410);
    }

    const total = Number(quote.total) || 0;
    if (total <= 0) return json({ error: "This proposal has no payable total." }, 400);

    const base = process.env.SITE_URL || "https://syberinfo.com.au";
    const session = await createQuoteCheckout({
      quoteNumber: String(quote.number || ""),
      quoteToken: parsed.data.token,
      title: String(quote.title || "Proposal"),
      amountCents: Math.round(total * 100),
      customerEmail: quote.prospectEmail ? String(quote.prospectEmail) : undefined,
      successUrl: `${base}/quote/${parsed.data.token}?paid=1`,
      cancelUrl: `${base}/quote/${parsed.data.token}?cancelled=1`,
    });
    return json({ url: session.url });
  } catch (err) {
    logger.error("quote pay: failed to create session", {
      message: err instanceof Error ? err.message : String(err),
    });
    return json({ error: "Could not start checkout. Please try again." }, 502);
  }
}
