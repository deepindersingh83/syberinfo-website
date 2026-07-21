import { getPayload } from "payload";
import config from "@payload-config";
import { verifyWebhook } from "@/lib/stripe";
import { json } from "@/lib/api";
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
  const amount = Number(session.amount_total) || 0;

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
  } catch (err) {
    logger.error("stripe webhook: processing failed", {
      invoiceNumber,
      message: err instanceof Error ? err.message : String(err),
    });
    return json({ error: "Processing error." }, 500);
  }

  return json({ received: true });
}
