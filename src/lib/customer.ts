import "server-only";
import { headers as nextHeaders } from "next/headers";
import { redirect } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";

export type Customer = {
  id: string | number;
  email: string;
  name?: string;
  company?: string;
  phone?: string;
  abn?: string;
  addressLine1?: string;
  addressLine2?: string;
  suburb?: string;
  state?: string;
  postcode?: string;
  country?: string;
};

/** Returns the logged-in customer (from the customers auth collection) or null. */
export async function getCurrentCustomer(): Promise<Customer | null> {
  try {
    const payload = await getPayload({ config });
    const { user } = await payload.auth({ headers: await nextHeaders() });
    if (user && user.collection === "customers") {
      return user as unknown as Customer;
    }
  } catch {
    /* not authenticated */
  }
  return null;
}

/** Redirects to the login page if not authenticated. */
export async function requireCustomer(): Promise<Customer> {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/portal/login");
  return customer;
}

async function findForCustomer(
  collection:
    | "subscriptions"
    | "client-domains"
    | "invoices"
    | "transactions"
    | "tickets"
    | "assets",
  customerId: string | number,
  opts: { sort?: string; limit?: number } = {},
) {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection,
    where: { customer: { equals: customerId } },
    sort: opts.sort,
    limit: opts.limit ?? 100,
    depth: 1,
    overrideAccess: true,
  });
  return docs as unknown as Record<string, unknown>[];
}

export const getMyServices = (id: string | number) =>
  findForCustomer("subscriptions", id, { sort: "nextDueDate" });
export const getMyDomains = (id: string | number) =>
  findForCustomer("client-domains", id, { sort: "expiryDate" });
export const getMyInvoices = (id: string | number) =>
  findForCustomer("invoices", id, { sort: "-dueDate" });
export const getMyTickets = (id: string | number) =>
  findForCustomer("tickets", id, { sort: "-updatedAt" });
export const getMyAssets = (id: string | number) =>
  findForCustomer("assets", id, { sort: "renewalDate" });

export async function getMyInvoice(id: string, customerId: string | number) {
  const payload = await getPayload({ config });
  try {
    const doc = (await payload.findByID({
      collection: "invoices",
      id,
      depth: 1,
      overrideAccess: true,
    })) as unknown as Record<string, unknown>;
    const owner = doc.customer as { id?: string | number } | string | number;
    const ownerId = typeof owner === "object" ? owner?.id : owner;
    if (String(ownerId) !== String(customerId)) return null;
    return doc;
  } catch {
    return null;
  }
}

export async function getMyTicket(id: string, customerId: string | number) {
  const payload = await getPayload({ config });
  try {
    const doc = (await payload.findByID({
      collection: "tickets",
      id,
      depth: 1,
      overrideAccess: true,
    })) as unknown as Record<string, unknown>;
    const owner = doc.customer as { id?: string | number } | string | number;
    const ownerId = typeof owner === "object" ? owner?.id : owner;
    if (String(ownerId) !== String(customerId)) return null;
    return doc;
  } catch {
    return null;
  }
}
