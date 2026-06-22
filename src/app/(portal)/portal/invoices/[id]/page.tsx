import Link from "next/link";
import { notFound } from "next/navigation";
import PortalShell from "@/components/portal/PortalShell";
import { requireCustomer, getMyInvoice } from "@/lib/customer";
import { aud, dateAU, statusClass } from "@/lib/format";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export default async function InvoiceDetailPage({ params }: Params) {
  const { id } = await params;
  const customer = await requireCustomer();
  const invoice = await getMyInvoice(id, customer.id);
  if (!invoice) notFound();

  const items = Array.isArray(invoice.items)
    ? (invoice.items as Record<string, unknown>[])
    : [];
  const unpaid = invoice.status === "unpaid" || invoice.status === "overdue";

  return (
    <PortalShell customerName={customer.name || customer.email}>
      <Link href="/portal/invoices" className="text-sm text-muted hover:text-foreground">
        ← Invoices
      </Link>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Invoice {String(invoice.number)}</h1>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(invoice.status as string)}`}>
          {String(invoice.status)}
        </span>
      </div>
      <p className="mt-1 text-sm text-muted">Due {dateAU(invoice.dueDate as string)}</p>

      <div className="mt-6 overflow-hidden rounded-2xl glass">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-muted">
              <th className="px-5 py-3 font-medium">Description</th>
              <th className="px-5 py-3 font-medium">Qty</th>
              <th className="px-5 py-3 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => (
              <tr key={idx} className="border-b border-white/5 last:border-0">
                <td className="px-5 py-3">{String(it.description ?? "")}</td>
                <td className="px-5 py-3">{Number(it.quantity ?? 1)}</td>
                <td className="px-5 py-3 text-right">{aud(it.amount as number)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="text-sm">
            <tr><td className="px-5 py-2" /><td className="px-5 py-2 text-right text-muted">Subtotal</td><td className="px-5 py-2 text-right">{aud(invoice.subtotal as number)}</td></tr>
            <tr><td className="px-5 py-2" /><td className="px-5 py-2 text-right text-muted">GST</td><td className="px-5 py-2 text-right">{aud(invoice.tax as number)}</td></tr>
            <tr className="font-bold"><td className="px-5 py-2" /><td className="px-5 py-2 text-right">Total</td><td className="px-5 py-2 text-right text-gradient">{aud(invoice.total as number)}</td></tr>
          </tfoot>
        </table>
      </div>

      {unpaid && (
        <div className="mt-6 rounded-2xl border border-cyan-glow/30 bg-cyan-glow/5 p-5 text-sm">
          Online card payment is coming soon. In the meantime, please pay via your
          usual method or{" "}
          <Link href="/contact" className="text-cyan-glow underline underline-offset-4">
            contact us
          </Link>
          .
        </div>
      )}
    </PortalShell>
  );
}
