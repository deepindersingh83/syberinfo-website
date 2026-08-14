import crypto from "crypto";
import { z } from "zod";
import { getPayload } from "payload";
import config from "@payload-config";
import { json, readBody, sameOrigin } from "@/lib/api";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

const schema = z.object({ email: z.string().trim().email("Please enter a valid email.").max(254) });

/**
 * Public: subscribe an email to status-page incident/maintenance alerts.
 * Single opt-in (with an unsubscribe token). Idempotent per email.
 */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Invalid origin." }, 403);
  if (!rateLimit(`status-sub:${clientIp(req)}`, 5, 60_000).ok) {
    return json({ error: "Too many requests. Please try again shortly." }, 429);
  }

  const parsed = await readBody(req, schema);
  if ("error" in parsed) return parsed.error;
  const email = parsed.data.email.toLowerCase();

  try {
    const payload = await getPayload({ config });
    const existing = await payload.find({
      collection: "status-subscribers",
      where: { email: { equals: email } },
      limit: 1,
      overrideAccess: true,
    });
    if (existing.docs.length) return json({ ok: true, already: true });

    await payload.create({
      collection: "status-subscribers",
      overrideAccess: true,
      data: { email, confirmed: true, token: crypto.randomBytes(20).toString("hex") },
    });
    return json({ ok: true });
  } catch (err) {
    logger.error("status subscribe failed", { message: err instanceof Error ? err.message : String(err) });
    return json({ error: "Could not subscribe. Please try again." }, 500);
  }
}
