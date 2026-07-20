import { logger } from "@/lib/logger";

/**
 * Ingram Micro Cloud "Marketplace API" (CMP, v1.16) client.
 *
 * Two token flows are supported (select with INGRAM_AUTH_MODE):
 *
 *  - "cmp" (default, per the Xvantage CMP guide): Basic auth against the
 *    gateway `POST {base}/token` with header `X-Subscription-Key` and body
 *    `{"marketplace":"<region>"}` → `{ token, expiresInSeconds }`. The Basic
 *    credentials are INGRAM_CLIENT_ID:INGRAM_CLIENT_SECRET (the CMP username /
 *    password), region is INGRAM_MARKETPLACE (e.g. "au", "us").
 *
 *  - "oauth": OAuth2 client-credentials against INGRAM_TOKEN_URL
 *    (https://api.ingrammicro.com/oauth/oauth20/token) → `{ access_token }`.
 *
 * Every Marketplace request additionally needs the gateway subscription-key
 * header `X-Subscription-Key` (INGRAM_SUBSCRIPTION_KEY) and the account's base
 * URL (INGRAM_BASE_URL) — both come from the developer-portal subscription page.
 *
 * Endpoints used: GET {base}/products (catalogue), GET {base}/plans,
 * POST {base}/orders (place a subscription order).
 *
 * Gated by `ingramEnabled()` — with the env unset, nothing runs.
 */

export function ingramEnabled(): boolean {
  return Boolean(
    process.env.INGRAM_CLIENT_ID &&
      process.env.INGRAM_CLIENT_SECRET &&
      process.env.INGRAM_BASE_URL &&
      process.env.INGRAM_SUBSCRIPTION_KEY,
  );
}

function authMode(): "cmp" | "oauth" {
  return (process.env.INGRAM_AUTH_MODE || "cmp").toLowerCase() === "oauth" ? "oauth" : "cmp";
}

const TOKEN_URL = () => process.env.INGRAM_TOKEN_URL || "https://api.ingrammicro.com/oauth/oauth20/token";
const marketplace = () => process.env.INGRAM_MARKETPLACE || "au";

let cachedToken: { value: string; expires: number } | null = null;

/** CMP token flow: Basic auth + X-Subscription-Key + {"marketplace"} body. */
async function getCmpToken(): Promise<{ value: string; ttl: number }> {
  const base = process.env.INGRAM_BASE_URL!.replace(/\/+$/, "");
  const basic = Buffer.from(
    `${process.env.INGRAM_CLIENT_ID}:${process.env.INGRAM_CLIENT_SECRET}`,
  ).toString("base64");
  const res = await fetch(`${base}/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "X-Subscription-Key": process.env.INGRAM_SUBSCRIPTION_KEY!,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ marketplace: marketplace() }),
  });
  if (!res.ok) throw new Error(`Ingram CMP token failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { token: string; expiresInSeconds?: number | string };
  return { value: data.token, ttl: Number(data.expiresInSeconds ?? 1500) };
}

/** OAuth2 client-credentials flow. */
async function getOauthToken(): Promise<{ value: string; ttl: number }> {
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: process.env.INGRAM_CLIENT_ID!,
    client_secret: process.env.INGRAM_CLIENT_SECRET!,
  });
  const res = await fetch(TOKEN_URL(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) throw new Error(`Ingram token failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { access_token: string; expires_in?: number | string };
  return { value: data.access_token, ttl: Number(data.expires_in ?? 3600) };
}

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expires - 60_000) return cachedToken.value;
  const { value, ttl } = authMode() === "oauth" ? await getOauthToken() : await getCmpToken();
  cachedToken = { value, expires: Date.now() + ttl * 1000 };
  return cachedToken.value;
}

async function ingramFetch<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const url = path.startsWith("http") ? path : `${process.env.INGRAM_BASE_URL}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Subscription-Key": process.env.INGRAM_SUBSCRIPTION_KEY!,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...((init.headers as Record<string, string>) || {}),
    },
  });
  if (!res.ok) throw new Error(`Ingram API ${res.status} on ${path}: ${await res.text()}`);
  return (res.json()) as Promise<T>;
}

/* ------------------------------ Types (spec) ------------------------------ */
type Period = { type?: string; duration?: number };
type ProductPrice = { currency?: string; amount?: string };
type IngramProduct = {
  id?: string;
  name?: string;
  mpn?: string;
  vendor?: string;
  serviceName?: string;
  minimumQuantity?: string;
  maximumQuantity?: string;
  prices?: ProductPrice[];
  billingPeriod?: Period;
};
type ProductsResponse = { data: IngramProduct[]; pagination?: { offset: number; limit: number; total: number } };

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

function periodLabel(p?: Period): string {
  if (!p?.type) return "per user / month";
  const n = p.duration && p.duration > 1 ? `${p.duration} ` : "";
  return `per user / ${n}${p.type.toLowerCase()}`;
}

export function mapCatalogItem(p: IngramProduct): NormalizedProduct {
  const name = p.name || p.mpn || "Unnamed";
  const amount = Number(p.prices?.[0]?.amount ?? 0) || 0;
  return {
    externalId: String(p.id ?? p.mpn ?? name),
    name,
    brand: p.vendor || "",
    category: p.serviceName || "Other",
    letter: (p.vendor || name).slice(0, 1).toUpperCase() || "•",
    color: "#5e5bff",
    tagline: [p.vendor, p.mpn].filter(Boolean).join(" · "),
    plans: [
      {
        name: name,
        price: amount,
        unit: periodLabel(p.billingPeriod),
        feature: p.mpn ? `MPN ${p.mpn}` : "",
      },
    ],
    addons: [],
  };
}

/** Fetch the full Ingram catalogue (paginated) and normalise it. */
export async function fetchCatalog(limit = 100, max = 2000): Promise<NormalizedProduct[]> {
  const out: NormalizedProduct[] = [];
  let offset = 0;
  for (;;) {
    const res = await ingramFetch<ProductsResponse>(`/products?limit=${limit}&offset=${offset}`);
    const items = res.data ?? [];
    out.push(...items.map(mapCatalogItem));
    const total = res.pagination?.total ?? items.length;
    offset += items.length;
    if (!items.length || offset >= total || offset >= max) break;
  }
  logger.info("ingram: fetched catalogue", { count: out.length });
  return out;
}

/** Place a subscription order (POST /orders). Payload per the OrderDetailed schema. */
export async function placeOrder(payload: Record<string, unknown>): Promise<unknown> {
  return ingramFetch("/orders", { method: "POST", body: JSON.stringify(payload) });
}
