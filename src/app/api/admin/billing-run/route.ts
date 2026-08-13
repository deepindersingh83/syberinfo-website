import { headers as nextHeaders } from "next/headers";
import { getPayload } from "payload";
import config from "@payload-config";
import { json } from "@/lib/api";
import { runBillingCycle } from "@/lib/billing";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Run the recurring-billing + dunning cycle. Intended to be called once a day
 * by an external scheduler. Two ways to authorise:
 *   • Bearer token:  Authorization: Bearer $CRON_SECRET   (for cron/CI)
 *   • Admin session: a logged-in Payload admin (for a manual "Run now" button)
 * Safe to run repeatedly — the cycle is idempotent.
 */
export async function POST() {
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

  try {
    const payload = await getPayload({ config });
    const result = await runBillingCycle(payload);
    return json({ ok: true, ...result });
  } catch (err) {
    logger.error("billing-run failed", { message: err instanceof Error ? err.message : String(err) });
    return json({ error: "Billing run failed — see server logs." }, 500);
  }
}

/** Constant-time string compare to avoid leaking the secret via timing. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
