import Link from "next/link";
import PortalShell from "@/components/portal/PortalShell";
import NewTicketForm from "@/components/portal/NewTicketForm";
import { requireCustomer } from "@/lib/customer";

export const dynamic = "force-dynamic";

export default async function NewTicketPage() {
  const customer = await requireCustomer();
  return (
    <PortalShell customerName={customer.name || customer.email}>
      <Link href="/portal/tickets" className="text-sm text-muted hover:text-foreground">
        ← Support
      </Link>
      <h1 className="mt-4 text-2xl font-bold">New support ticket</h1>
      <div className="mt-6 max-w-xl">
        <NewTicketForm />
      </div>
    </PortalShell>
  );
}
