import PortalShell from "@/components/portal/PortalShell";
import { requireCustomer, getMyDomains } from "@/lib/customer";
import { dateAU, statusClass } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DomainsPage() {
  const customer = await requireCustomer();
  const domains = await getMyDomains(customer.id);

  return (
    <PortalShell customerName={customer.name || customer.email}>
      <h1 className="text-2xl font-bold">Your domains</h1>
      {domains.length === 0 ? (
        <p className="mt-4 text-sm text-muted">No domains registered with us yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl glass">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-muted">
                <th className="px-5 py-3 font-medium">Domain</th>
                <th className="px-5 py-3 font-medium">Registrar</th>
                <th className="px-5 py-3 font-medium">Expires</th>
                <th className="px-5 py-3 font-medium">Auto-renew</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {domains.map((d) => (
                <tr key={String(d.id)} className="border-b border-white/5 last:border-0">
                  <td className="px-5 py-3 font-medium">{String(d.domain)}</td>
                  <td className="px-5 py-3 text-muted">{d.registrar ? String(d.registrar) : "—"}</td>
                  <td className="px-5 py-3">{dateAU(d.expiryDate as string)}</td>
                  <td className="px-5 py-3">{d.autoRenew ? "On" : "Off"}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(d.status as string)}`}>
                      {String(d.status)}
                    </span>
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
