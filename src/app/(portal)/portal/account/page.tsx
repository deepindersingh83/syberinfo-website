import PortalShell from "@/components/portal/PortalShell";
import { requireCustomer } from "@/lib/customer";

export const dynamic = "force-dynamic";

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between border-b border-white/5 py-3 text-sm last:border-0">
      <span className="text-muted">{label}</span>
      <span className="text-right">{value || "—"}</span>
    </div>
  );
}

export default async function AccountPage() {
  const c = await requireCustomer();
  const address = [c.addressLine1, c.addressLine2, c.suburb, c.state, c.postcode, c.country]
    .filter(Boolean)
    .join(", ");

  return (
    <PortalShell customerName={c.name || c.email}>
      <h1 className="text-2xl font-bold">Account</h1>
      <div className="mt-6 rounded-2xl glass p-6">
        <Row label="Name" value={c.name} />
        <Row label="Email" value={c.email} />
        <Row label="Company" value={c.company} />
        <Row label="Phone" value={c.phone} />
        <Row label="ABN" value={c.abn} />
        <Row label="Address" value={address} />
      </div>
      <p className="mt-4 text-sm text-muted">
        Need to update your details? Email us at admin@syberinfo.com.au and
        we&apos;ll take care of it. (Self-service editing coming soon.)
      </p>
    </PortalShell>
  );
}
