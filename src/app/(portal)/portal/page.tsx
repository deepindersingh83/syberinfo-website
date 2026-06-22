import Link from "next/link";
import PortalShell from "@/components/portal/PortalShell";
import { requireCustomer, getMyServices, getMyDomains, getMyInvoices } from "@/lib/customer";
import { aud, dateAU, statusClass } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function PortalDashboard() {
  const customer = await requireCustomer();
  const [services, domains, invoices] = await Promise.all([
    getMyServices(customer.id),
    getMyDomains(customer.id),
    getMyInvoices(customer.id),
  ]);
  const unpaid = invoices.filter((i) => i.status === "unpaid" || i.status === "overdue");
  const activeServices = services.filter((s) => s.status === "active");

  const stats = [
    { label: "Active services", value: activeServices.length, href: "/portal/services" },
    { label: "Domains", value: domains.length, href: "/portal/domains" },
    { label: "Unpaid invoices", value: unpaid.length, href: "/portal/invoices" },
  ];

  return (
    <PortalShell customerName={customer.name || customer.email}>
      <h1 className="text-2xl font-bold">
        Welcome back{customer.name ? `, ${customer.name.split(" ")[0]}` : ""} 👋
      </h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="rounded-2xl glass p-5 transition-colors hover:border-white/20">
            <div className="text-3xl font-bold text-gradient">{s.value}</div>
            <div className="mt-1 text-sm text-muted">{s.label}</div>
          </Link>
        ))}
      </div>

      {unpaid.length > 0 && (
        <div className="mt-8 rounded-2xl border border-pink-glow/30 bg-pink-glow/5 p-5">
          <h2 className="font-semibold">You have {unpaid.length} invoice(s) due</h2>
          <ul className="mt-3 space-y-2">
            {unpaid.map((i) => (
              <li key={String(i.id)} className="flex items-center justify-between text-sm">
                <Link href={`/portal/invoices/${i.id}`} className="underline underline-offset-4">
                  {String(i.number)}
                </Link>
                <span>{aud(i.total as number)} · due {dateAU(i.dueDate as string)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Your services</h2>
          <Link href="/portal/services" className="text-sm text-muted hover:text-foreground">View all →</Link>
        </div>
        {services.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No services yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {services.slice(0, 5).map((s) => (
              <div key={String(s.id)} className="flex items-center justify-between rounded-xl glass px-4 py-3">
                <div>
                  <div className="font-medium">{String(s.label)}</div>
                  <div className="text-xs text-muted">
                    {s.billingCycle ? `${String(s.billingCycle)} · ` : ""}next due {dateAU(s.nextDueDate as string)}
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(s.status as string)}`}>
                  {String(s.status)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </PortalShell>
  );
}
