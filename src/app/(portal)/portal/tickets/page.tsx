import Link from "next/link";
import PortalShell from "@/components/portal/PortalShell";
import { requireCustomer, getMyTickets } from "@/lib/customer";
import { dateAU, statusClass } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function TicketsPage() {
  const customer = await requireCustomer();
  const tickets = await getMyTickets(customer.id);

  return (
    <PortalShell customerName={customer.name || customer.email}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Support</h1>
        <Link
          href="/portal/tickets/new"
          className="rounded-full bg-gradient-to-r from-cyan-glow to-violet-glow px-5 py-2.5 text-sm font-semibold text-ink-950 transition-transform hover:scale-[1.03]"
        >
          New ticket
        </Link>
      </div>
      {tickets.length === 0 ? (
        <p className="mt-4 text-sm text-muted">No support tickets yet.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {tickets.map((t) => (
            <Link
              key={String(t.id)}
              href={`/portal/tickets/${t.id}`}
              className="flex items-center justify-between rounded-xl glass px-4 py-3 transition-colors hover:border-white/20"
            >
              <div>
                <div className="font-medium">{String(t.subject)}</div>
                <div className="text-xs text-muted">
                  {String(t.department)} · updated {dateAU(t.updatedAt as string)}
                </div>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(t.status as string)}`}>
                {String(t.status)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </PortalShell>
  );
}
