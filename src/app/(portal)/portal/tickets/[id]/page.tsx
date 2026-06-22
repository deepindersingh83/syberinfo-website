import Link from "next/link";
import { notFound } from "next/navigation";
import PortalShell from "@/components/portal/PortalShell";
import ReplyForm from "@/components/portal/ReplyForm";
import { requireCustomer, getMyTicket } from "@/lib/customer";
import { statusClass } from "@/lib/format";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export default async function TicketDetailPage({ params }: Params) {
  const { id } = await params;
  const customer = await requireCustomer();
  const ticket = await getMyTicket(id, customer.id);
  if (!ticket) notFound();

  const messages = Array.isArray(ticket.messages)
    ? (ticket.messages as Record<string, unknown>[])
    : [];
  const closed = ticket.status === "closed";

  return (
    <PortalShell customerName={customer.name || customer.email}>
      <Link href="/portal/tickets" className="text-sm text-muted hover:text-foreground">
        ← Support
      </Link>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{String(ticket.subject)}</h1>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(ticket.status as string)}`}>
          {String(ticket.status)}
        </span>
      </div>
      <p className="mt-1 text-sm text-muted capitalize">{String(ticket.department)}</p>

      <div className="mt-6 space-y-3">
        {messages.length === 0 ? (
          <p className="text-sm text-muted">No messages yet.</p>
        ) : (
          messages.map((m, i) => (
            <div key={i} className="rounded-2xl glass p-4">
              <div className="text-xs font-semibold text-muted">
                {String(m.author || "You")}
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm">{String(m.message)}</p>
            </div>
          ))
        )}
      </div>

      {closed ? (
        <p className="mt-6 text-sm text-muted">This ticket is closed.</p>
      ) : (
        <ReplyForm ticketId={id} />
      )}
    </PortalShell>
  );
}
