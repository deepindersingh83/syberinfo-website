import { headers as nextHeaders } from "next/headers";
import { getPayload } from "payload";
import config from "@payload-config";
import { getCurrentCustomer, getMyInvoice } from "@/lib/customer";
import { renderInvoicePdf, type InvoiceData, type CustomerData, type SellerData } from "@/lib/invoice-pdf";
import { json } from "@/lib/api";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Download a single invoice as a branded AU GST tax-invoice PDF. Access is
 * owner-or-admin: a logged-in customer may fetch only their own invoice; a
 * logged-in admin (users collection) may fetch any. Generated server-side with
 * the zero-dependency writer in src/lib/pdf.ts.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  let invoice: Record<string, unknown> | null = null;
  const payload = await getPayload({ config });

  // Admin (users) can read any invoice; customers only their own.
  const { user } = await payload.auth({ headers: await nextHeaders() });
  if (user && user.collection === "users") {
    invoice = (await payload
      .findByID({ collection: "invoices", id, depth: 1, overrideAccess: true })
      .catch(() => null)) as Record<string, unknown> | null;
  } else {
    const customer = await getCurrentCustomer();
    if (!customer) return json({ error: "Not authenticated." }, 401);
    invoice = await getMyInvoice(id, customer.id);
  }

  if (!invoice) return json({ error: "Invoice not found." }, 404);

  try {
    const settings = (await payload
      .findGlobal({ slug: "billing-settings", overrideAccess: true })
      .catch(() => ({}))) as Record<string, unknown>;

    const cust = (invoice.customer && typeof invoice.customer === "object"
      ? invoice.customer
      : {}) as CustomerData;

    const seller: SellerData = {
      companyLegalName: (settings.companyLegalName as string) || "SyberInfo Pty Ltd",
      abn: settings.abn as string,
      addressLines: settings.addressLines as string,
      gstRegistered: settings.gstRegistered !== false,
      email: process.env.CONTACT_TO || "accounts@syberinfo.com.au",
    };

    const pdf = renderInvoicePdf(invoice as InvoiceData, cust, seller);
    const filename = `${String(invoice.number || "invoice").replace(/[^\w.-]/g, "_")}.pdf`;

    return new Response(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    logger.error("invoice pdf render failed", {
      id,
      message: err instanceof Error ? err.message : String(err),
    });
    return json({ error: "Could not render invoice." }, 500);
  }
}
