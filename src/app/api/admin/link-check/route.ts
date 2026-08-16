import { headers as nextHeaders } from "next/headers";
import { getPayload } from "payload";
import config from "@payload-config";
import { json } from "@/lib/api";
import { runLinkCheck } from "@/lib/link-check";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Crawl the site and report broken internal links. On-demand admin tool.
 * Authorise via CRON_SECRET bearer or a logged-in admin session.
 */
export async function GET(req: Request) {
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

  const base = process.env.SITE_URL || new URL(req.url).origin;
  try {
    const report = await runLinkCheck(base);
    return json({ ok: true, ...report });
  } catch (err) {
    logger.error("link-check failed", { message: err instanceof Error ? err.message : String(err) });
    return json({ error: "Link check failed — see server logs." }, 500);
  }
}

/** Constant-time string compare to avoid leaking the secret via timing. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
