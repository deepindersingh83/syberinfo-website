import { z } from "zod";
import { headers as nextHeaders } from "next/headers";
import { getPayload } from "payload";
import config from "@payload-config";
import { json, readBody } from "@/lib/api";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  subscription: z.coerce.number().int().positive(),
  customer: z.coerce.number().int().positive().optional(),
  description: z.string().trim().min(2).max(200),
  quantity: z.coerce.number().positive().default(1),
  unitAmount: z.coerce.number().min(0),
  occurredAt: z.string().datetime().optional(),
});

/**
 * Record a metered usage event against a subscription. Unbilled usage is rolled
 * into the subscription's next renewal invoice by the billing run. Authorise
 * via CRON_SECRET bearer (for external meters) or an admin session.
 */
export async function POST(req: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const hdrs = await nextHeaders();
  const auth = hdrs.get("authorization") || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : "";

  let authorised = false;
  if (cronSecret && bearer && timingSafeEqual(bearer, cronSecret)) {
    authorised = true;
  } else {
    const payload = await getPayload({ config });
    const { user } = await payload.auth({ headers: hdrs });
    if (user && user.collection === "users") authorised = true;
  }
  if (!authorised) return json({ error: "Unauthorised." }, 401);

  const parsed = await readBody(req, schema);
  if ("error" in parsed) return parsed.error;
  const d = parsed.data;

  try {
    const payload = await getPayload({ config });

    // Default the customer from the subscription if not supplied.
    let customerId = d.customer;
    if (!customerId) {
      const sub = (await payload
        .findByID({ collection: "subscriptions", id: d.subscription, depth: 0, overrideAccess: true })
        .catch(() => null)) as Record<string, unknown> | null;
      const owner = sub?.customer as { id?: number } | number | undefined;
      customerId = typeof owner === "object" ? owner?.id : owner;
    }

    const rec = await payload.create({
      collection: "usage-records",
      overrideAccess: true,
      data: {
        description: d.description,
        subscription: d.subscription,
        customer: customerId,
        quantity: d.quantity,
        unitAmount: d.unitAmount,
        billed: false,
        occurredAt: d.occurredAt || new Date().toISOString(),
      },
    });
    return json({ ok: true, id: (rec as { id: string | number }).id });
  } catch (err) {
    logger.error("usage record failed", { message: err instanceof Error ? err.message : String(err) });
    return json({ error: "Could not record usage." }, 500);
  }
}

/** Constant-time string compare to avoid leaking the secret via timing. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
