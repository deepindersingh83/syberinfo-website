import { getPayload } from "payload";
import config from "@payload-config";
import { renderInvoicePdf, type InvoiceData, type SellerData } from "@/lib/invoice-pdf";
import { json } from "@/lib/api";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public, token-gated quote PDF. The acceptToken in the URL is the shared
 * secret from the emailed proposal link, so prospects (who aren't logged in)
 * can download their branded quote. Reuses the invoice PDF writer with a
 * "QUOTE" label.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  try {
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: "quotes",
      where: { acceptToken: { equals: token } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });
    const quote = docs[0] as unknown as Record<string, unknown> | undefined;
    if (!quote) return json({ error: "Quote not found." }, 404);

    const settings = (await payload
      .findGlobal({ slug: "billing-settings", overrideAccess: true })
      .catch(() => ({}))) as Record<string, unknown>;

    // Map quote line items (quantity × unitPrice) into the invoice PDF shape.
    const items = Array.isArray(quote.items)
      ? (quote.items as { description?: string; quantity?: number; unitPrice?: number }[]).map((it) => ({
          description: it.description,
          quantity: Number(it.quantity) || 1,
          amount: (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0),
        }))
      : [];

    const invoiceLike: InvoiceData = {
      number: String(quote.number || ""),
      items,
      subtotal: Number(quote.subtotal) || 0,
      tax: Number(quote.tax) || 0,
      total: Number(quote.total) || 0,
      status: String(quote.status || "draft"),
      dueDate: (quote.validUntil as string) || null,
      createdAt: (quote.createdAt as string) || null,
    };
    const seller: SellerData = {
      companyLegalName: (settings.companyLegalName as string) || "SyberInfo Pty Ltd",
      abn: settings.abn as string,
      addressLines: settings.addressLines as string,
      gstRegistered: settings.gstRegistered !== false,
      email: process.env.CONTACT_TO || "hello@syberinfo.com.au",
    };

    const pdf = renderInvoicePdf(
      invoiceLike,
      { name: String(quote.prospectName || ""), email: String(quote.prospectEmail || "") },
      seller,
      { docLabel: "QUOTE", numberLabel: "Quote" },
    );
    const filename = `${String(quote.number || "quote").replace(/[^\w.-]/g, "_")}.pdf`;
    return new Response(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    logger.error("quote pdf failed", { message: err instanceof Error ? err.message : String(err) });
    return json({ error: "Could not render quote." }, 500);
  }
}
