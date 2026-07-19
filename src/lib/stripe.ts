import crypto from "crypto";

/**
 * Minimal Stripe integration via the REST API + native crypto — no SDK
 * dependency. All entry points are guarded by STRIPE_SECRET_KEY so the app
 * runs fine with payments disabled.
 */

export const stripeEnabled = () => Boolean(process.env.STRIPE_SECRET_KEY);

function form(obj: Record<string, string | number | undefined>): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(obj)) if (v !== undefined) p.append(k, String(v));
  return p.toString();
}

async function stripeApi(path: string, body: string) {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || `Stripe API error (${res.status})`);
  }
  return data;
}

/**
 * Create a one-off Checkout Session to pay an invoice. `amountCents` is AUD in
 * the smallest unit. Returns the hosted checkout URL.
 */
export async function createInvoiceCheckout(opts: {
  invoiceNumber: string;
  amountCents: number;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ id: string; url: string }> {
  const body = form({
    mode: "payment",
    "line_items[0][price_data][currency]": "aud",
    "line_items[0][price_data][product_data][name]": `Invoice ${opts.invoiceNumber}`,
    "line_items[0][price_data][unit_amount]": opts.amountCents,
    "line_items[0][quantity]": 1,
    success_url: opts.successUrl,
    cancel_url: opts.cancelUrl,
    customer_email: opts.customerEmail,
    "metadata[invoiceNumber]": opts.invoiceNumber,
  });
  const session = await stripeApi("checkout/sessions", body);
  return { id: session.id, url: session.url };
}

/**
 * Verify a Stripe webhook signature (t=…,v1=…) against STRIPE_WEBHOOK_SECRET
 * using a constant-time compare. Returns the parsed event or null.
 */
export function verifyWebhook(payload: string, sigHeader: string | null): unknown | null {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !sigHeader) return null;
  const parts = Object.fromEntries(
    sigHeader.split(",").map((kv) => kv.split("=") as [string, string]),
  );
  const timestamp = parts["t"];
  const signature = parts["v1"];
  if (!timestamp || !signature) return null;

  // Reject events older than 5 minutes (replay protection).
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return null;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${payload}`)
    .digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    return JSON.parse(payload);
  } catch {
    return null;
  }
}
