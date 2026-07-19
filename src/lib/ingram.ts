import { logger } from "@/lib/logger";

/**
 * Ingram Micro Cloud (reseller) API client — foundation.
 *
 * The OAuth2 client-credentials flow and request plumbing here are standard and
 * reusable. The exact resource PATHS and the catalog RESPONSE SHAPE differ per
 * Ingram account/version, so they're configured via env (see the *_PATH vars)
 * and the catalog→product mapping is isolated in `mapCatalogItem()` for you to
 * confirm against your OpenAPI spec / a sample response.
 *
 * Everything is gated by `ingramEnabled()` — with no INGRAM_* env set, nothing
 * runs and the app is unaffected.
 *
 * Required env:
 *   INGRAM_TOKEN_URL      OAuth2 token endpoint (from the docs)
 *   INGRAM_CLIENT_ID      OAuth2 client id
 *   INGRAM_CLIENT_SECRET  OAuth2 client secret
 *   INGRAM_BASE_URL       API base, e.g. https://api.ingrammicro.com
 *   INGRAM_CATALOG_PATH   Catalog/SKU list path (from the OpenAPI spec)
 *   INGRAM_ORDER_PATH     Subscription-order create path (from the spec)
 * Optional:
 *   INGRAM_RESELLER_ID / INGRAM_CUSTOMER_ID and any account headers your tenant needs.
 */

export function ingramEnabled(): boolean {
  return Boolean(
    process.env.INGRAM_TOKEN_URL &&
      process.env.INGRAM_CLIENT_ID &&
      process.env.INGRAM_CLIENT_SECRET &&
      process.env.INGRAM_BASE_URL,
  );
}

let cachedToken: { value: string; expires: number } | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expires - 30_000) return cachedToken.value;

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: process.env.INGRAM_CLIENT_ID!,
    client_secret: process.env.INGRAM_CLIENT_SECRET!,
  });
  const res = await fetch(process.env.INGRAM_TOKEN_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) throw new Error(`Ingram token failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { access_token: string; expires_in?: number };
  cachedToken = {
    value: data.access_token,
    expires: Date.now() + (data.expires_in ?? 3600) * 1000,
  };
  return cachedToken.value;
}

/** Authenticated request against the Ingram API. */
export async function ingramFetch<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(process.env.INGRAM_RESELLER_ID ? { "IM-ResellerID": process.env.INGRAM_RESELLER_ID } : {}),
    ...((init.headers as Record<string, string>) || {}),
  };
  const url = path.startsWith("http") ? path : `${process.env.INGRAM_BASE_URL}${path}`;
  const res = await fetch(url, { ...init, headers });
  if (!res.ok) throw new Error(`Ingram API ${res.status} on ${path}: ${await res.text()}`);
  return (await res.json()) as T;
}

/* --------------------------- Catalog → software --------------------------- */
export type NormalizedProduct = {
  externalId: string;
  name: string;
  brand: string;
  category: string;
  letter: string;
  color: string;
  tagline: string;
  plans: { name: string; price: number; unit: string; feature: string }[];
  addons: { name: string; price: number; desc: string }[];
};

/**
 * Map one Ingram catalog item to our `software` product shape. ADJUST the field
 * names below to match your Ingram catalog response (confirm from the OpenAPI
 * spec or a sample payload) — they vary by tenant/version.
 */
export function mapCatalogItem(item: Record<string, unknown>): NormalizedProduct {
  const s = (v: unknown, d = "") => (v == null ? d : String(v));
  const name = s(item.name ?? item.productName ?? item.description);
  const rawPlans = item.plans ?? item.rateplans;
  const plans = Array.isArray(rawPlans)
    ? (rawPlans as Record<string, unknown>[]).map((pr) => ({
        name: s(pr.name ?? pr.planName),
        price: Number(pr.price ?? pr.unitPrice ?? 0) || 0,
        unit: s(pr.billingPeriod, "per user / month"),
        feature: s(pr.description ?? ""),
      }))
    : [];
  return {
    externalId: s(item.id ?? item.sku ?? item.productId),
    name,
    brand: s(item.vendorName ?? item.publisher ?? item.brand),
    category: s(item.category ?? item.categoryName ?? "Other"),
    letter: name.slice(0, 1).toUpperCase() || "•",
    color: "#5e5bff",
    tagline: s(item.shortDescription ?? item.summary ?? item.description),
    plans,
    addons: [],
  };
}

/** Fetch the Ingram catalog (path from INGRAM_CATALOG_PATH) and normalize it. */
export async function fetchCatalog(): Promise<NormalizedProduct[]> {
  const path = process.env.INGRAM_CATALOG_PATH;
  if (!path) throw new Error("INGRAM_CATALOG_PATH is not set");
  const data = await ingramFetch<Record<string, unknown>>(path);
  // Ingram commonly wraps lists as { items: [...] } / { catalog: [...] }.
  const items = (data.items ?? data.catalog ?? data.products ?? data) as Record<string, unknown>[];
  if (!Array.isArray(items)) {
    logger.warn("ingram: unexpected catalog shape — adjust fetchCatalog()");
    return [];
  }
  return items.map(mapCatalogItem);
}

/**
 * Place a subscription order with Ingram (path from INGRAM_ORDER_PATH). The
 * payload shape depends on your tenant — pass the fields your spec requires.
 */
export async function placeOrder(payload: Record<string, unknown>): Promise<unknown> {
  const path = process.env.INGRAM_ORDER_PATH;
  if (!path) throw new Error("INGRAM_ORDER_PATH is not set");
  return ingramFetch(path, { method: "POST", body: JSON.stringify(payload) });
}
