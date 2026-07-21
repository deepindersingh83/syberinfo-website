import Link from "next/link";
import PortalShell from "@/components/portal/PortalShell";
import { requireCustomer, getMyInvoices } from "@/lib/customer";
import { aud, dateAU, statusClass } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function InvoicesPage() {
  const customer = await requireCustomer();
  const invoices = await getMyInvoices(customer.id);

  return (
    <PortalShell customerName={customer.name || customer.email}>
      <h1 className="text-2xl font-bold">Invoices</h1>
      {invoices.length === 0 ? (
        <p className="mt-4 text-sm text-muted">No invoices yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl glass">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-muted">
                <th className="px-5 py-3 font-medium">Invoice</th>
                <th className="px-5 py-3 font-medium">Due</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {invoices.map((i) => (
                <tr key={String(i.id)} className="border-b border-white/5 last:border-0">
                  <td className="px-5 py-3 font-medium">{String(i.number)}</td>
                  <td className="px-5 py-3">{dateAU(i.dueDate as string)}</td>
                  <td className="px-5 py-3">{aud(i.total as number)}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(i.status as string)}`}>
                      {String(i.status)}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link href={`/portal/invoices/${i.id}`} className="text-cyan-glow hover:underline">
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PortalShell>
  );
}
