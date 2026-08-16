import { headers as nextHeaders } from "next/headers";
import { getPayload } from "payload";
import config from "@payload-config";
import { json } from "@/lib/api";
import { runAssetReminders } from "@/lib/asset-reminders";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Send asset/licence renewal reminders. Intended to be called once a day by an
 * external scheduler (alongside the billing run). Authorise via:
 *   • Bearer token:  Authorization: Bearer $CRON_SECRET   (for cron/CI)
 *   • Admin session: a logged-in Payload admin (manual "Run now")
 * Safe to run repeatedly — reminders respect a per-asset cooldown.
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
    const result = await runAssetReminders(payload);
    return json({ ok: true, ...result });
  } catch (err) {
    logger.error("asset-reminders failed", { message: err instanceof Error ? err.message : String(err) });
    return json({ error: "Asset reminder run failed — see server logs." }, 500);
  }
}

/** Constant-time string compare to avoid leaking the secret via timing. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
