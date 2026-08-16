import { getPayload } from "payload";
import config from "@payload-config";
import { verifyWebhook } from "@/lib/stripe";
import { json } from "@/lib/api";
import { emitEvent } from "@/lib/events";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stripe webhook receiver. Verifies the signature, then marks the matching
 * invoice paid and records a transaction. Idempotent: re-processing a paid
 * invoice is a no-op.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  const event = verifyWebhook(raw, req.headers.get("stripe-signature")) as
    | { type?: string; data?: { object?: Record<string, unknown> } }
    | null;

  if (!event) return json({ error: "Invalid signature." }, 400);

  if (event.type !== "checkout.session.completed") {
    return json({ received: true });
  }

  const session = event.data?.object ?? {};
  const metadata = (session.metadata as Record<string, string>) || {};
  const invoiceNumber = metadata.invoiceNumber;
  const quoteToken = metadata.quoteToken;
  const amount = Number(session.amount_total) || 0;

  // Quote/proposal payment — reconcile against the quote, not an invoice.
  if (quoteToken) {
    try {
      const payload = await getPayload({ config });
      const { docs } = await payload.find({
        collection: "quotes",
        where: { acceptToken: { equals: quoteToken } },
        limit: 1,
        overrideAccess: true,
      });
      const quote = docs[0] as unknown as Record<string, unknown> | undefined;
      if (!quote) {
        logger.warn("stripe webhook: quote not found", { quoteToken });
        return json({ received: true });
      }
      if (quote.paidAt) return json({ received: true }); // idempotent

      const now = new Date().toISOString();
      await payload.update({
        collection: "quotes",
        id: quote.id as string,
        overrideAccess: true,
        data: {
          paidAt: now,
          // Paying implies acceptance.
          ...(quote.status === "accepted" ? {} : { status: "accepted", acceptedAt: (quote.acceptedAt as string) || now }),
        },
      });
      await payload.create({
        collection: "transactions",
        overrideAccess: true,
        data: {
          reference: String(session.payment_intent || session.id || ""),
          customer: (quote.customer as number) ?? undefined,
          gateway: "stripe",
          amount: amount / 100,
          status: "succeeded",
        },
      });
      logger.info("stripe webhook: quote paid", { number: quote.number });
      await emitEvent("quote.paid", {
        number: quote.number,
        prospectName: quote.prospectName,
        prospectEmail: quote.prospectEmail,
        amount: amount / 100,
      });
    } catch (err) {
      logger.error("stripe webhook: quote processing failed", {
        quoteToken,
        message: err instanceof Error ? err.message : String(err),
      });
      return json({ error: "Processing error." }, 500);
    }
    return json({ received: true });
  }

  if (!invoiceNumber) return json({ received: true });

  try {
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: "invoices",
      where: { number: { equals: invoiceNumber } },
      limit: 1,
      overrideAccess: true,
    });
    const invoice = docs[0] as unknown as Record<string, unknown> | undefined;
    if (!invoice) {
      logger.warn("stripe webhook: invoice not found", { invoiceNumber });
      return json({ received: true });
    }
    if (invoice.status === "paid") return json({ received: true });

    await payload.update({
      collection: "invoices",
      id: invoice.id as string,
      overrideAccess: true,
      data: { status: "paid", paidDate: new Date().toISOString() },
    });
    await payload.create({
      collection: "transactions",
      overrideAccess: true,
      data: {
        reference: String(session.payment_intent || session.id || ""),
        invoice: invoice.id as number,
        customer: invoice.customer as number,
        gateway: "stripe",
        amount: amount / 100,
        status: "succeeded",
      },
    });
    logger.info("stripe webhook: invoice paid", { invoiceNumber });
    await emitEvent("invoice.paid", { number: invoiceNumber, amount: amount / 100, customer: invoice.customer });
  } catch (err) {
    logger.error("stripe webhook: processing failed", {
      invoiceNumber,
      message: err instanceof Error ? err.message : String(err),
    });
    return json({ error: "Processing error." }, 500);
  }

  return json({ received: true });
}
