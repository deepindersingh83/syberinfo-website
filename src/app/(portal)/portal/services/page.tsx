import PortalShell from "@/components/portal/PortalShell";
import { requireCustomer, getMyServices } from "@/lib/customer";
import { aud, dateAU, statusClass } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const customer = await requireCustomer();
  const services = await getMyServices(customer.id);

  return (
    <PortalShell customerName={customer.name || customer.email}>
      <h1 className="text-2xl font-bold">Your services</h1>
      {services.length === 0 ? (
        <p className="mt-4 text-sm text-muted">You don&apos;t have any active services yet.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {services.map((s) => (
            <div key={String(s.id)} className="rounded-2xl glass p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-bold">{String(s.label)}</h2>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(s.status as string)}`}>
                  {String(s.status)}
                </span>
              </div>
              {s.domain ? <p className="mt-1 text-sm text-muted">{String(s.domain)}</p> : null}
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                <div>
                  <div className="text-muted">Billing</div>
                  <div>{s.billingCycle ? String(s.billingCycle) : "—"}</div>
                </div>
                <div>
                  <div className="text-muted">Amount</div>
                  <div>{aud(s.recurringAmount as number)}</div>
                </div>
                <div>
                  <div className="text-muted">Next due</div>
                  <div>{dateAU(s.nextDueDate as string)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PortalShell>
  );
}
