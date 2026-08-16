import {
  getCurrentCustomer,
  getMyServices,
  getMyInvoices,
  getMyTickets,
  getMyDomains,
  getMyAssets,
} from "@/lib/customer";
import { json } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Rec = Record<string, unknown>;
const s = (v: unknown) => (v == null ? "" : String(v));
const n = (v: unknown) => (typeof v === "number" ? v : Number(v) || 0);

/**
 * Everything the logged-in customer's portal needs in one call: profile plus
 * their real subscriptions, invoices, tickets and domains. Access control on
 * each collection already scopes results to the owner.
 */
export async function GET() {
  const customer = await getCurrentCustomer();
  if (!customer) return json({ authenticated: false }, 200);

  const [subs, invoices, tickets, domains, assets] = await Promise.all([
    getMyServices(customer.id),
    getMyInvoices(customer.id),
    getMyTickets(customer.id),
    getMyDomains(customer.id),
    getMyAssets(customer.id),
  ]);

  return json({
    authenticated: true,
    customer: {
      id: customer.id,
      name: customer.name || "",
      company: customer.company || "",
      email: customer.email,
      phone: customer.phone || "",
    },
    subscriptions: (subs as Rec[]).map((d) => ({
      id: s(d.id),
      label: s(d.label),
      domain: s(d.domain),
      status: s(d.status),
      billingCycle: s(d.billingCycle),
      recurringAmount: n(d.recurringAmount),
      nextDueDate: s(d.nextDueDate),
    })),
    invoices: (invoices as Rec[]).map((d) => ({
      id: s(d.id),
      number: s(d.number),
      total: n(d.total),
      status: s(d.status),
      dueDate: s(d.dueDate),
      paidDate: s(d.paidDate),
    })),
    tickets: (tickets as Rec[]).map((d) => ({
      id: s(d.id),
      subject: s(d.subject),
      department: s(d.department),
      status: s(d.status),
      priority: s(d.priority),
      updatedAt: s(d.updatedAt),
      messages: Array.isArray(d.messages)
        ? (d.messages as Rec[]).map((m) => ({ author: s(m.author), message: s(m.message) }))
        : [],
    })),
    domains: (domains as Rec[]).map((d) => ({
      id: s(d.id),
      domain: s(d.domain),
      status: s(d.status),
      expiryDate: s(d.expiryDate),
      autoRenew: Boolean(d.autoRenew),
    })),
    assets: (assets as Rec[]).map((d) => ({
      id: s(d.id),
      name: s(d.name),
      category: s(d.category),
      vendor: s(d.vendor),
      quantity: n(d.quantity),
      renewalDate: s(d.renewalDate),
      status: s(d.status),
    })),
  });
}
