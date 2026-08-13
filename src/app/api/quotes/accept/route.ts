import { z } from "zod";
import { getPayload } from "payload";
import config from "@payload-config";
import { json, readBody, sameOrigin } from "@/lib/api";
import { emitEvent } from "@/lib/events";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

const schema = z.object({ token: z.string().trim().min(10).max(100) });

/**
 * Public quote acceptance. The prospect clicks "Accept" on their proposal page;
 * we mark the quote accepted, notify the team, and emit a quote.accepted event
 * (which an automation can turn into onboarding). Idempotent.
 */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Invalid origin." }, 403);
  if (!rateLimit(`quote-accept:${clientIp(req)}`, 10, 60_000).ok) {
    return json({ error: "Too many requests." }, 429);
  }

  const parsed = await readBody(req, schema);
  if ("error" in parsed) return parsed.error;

  try {
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: "quotes",
      where: { acceptToken: { equals: parsed.data.token } },
      limit: 1,
      overrideAccess: true,
    });
    const quote = docs[0] as unknown as Record<string, unknown> | undefined;
    if (!quote) return json({ error: "Quote not found." }, 404);

    // Expired?
    if (quote.validUntil && new Date(quote.validUntil as string) < new Date() && quote.status !== "accepted") {
      return json({ error: "This quote has expired. Please contact us for an updated proposal." }, 410);
    }
    if (quote.status === "accepted") return json({ ok: true, already: true });

    await payload.update({
      collection: "quotes",
      id: quote.id as string,
      overrideAccess: true,
      data: { status: "accepted", acceptedAt: new Date().toISOString() },
    });

    const notify = process.env.CONTACT_TO || process.env.CONTACT_FROM_ADDRESS;
    if (notify) {
      try {
        const base = process.env.SITE_URL || "https://syberinfo.com.au";
        await payload.sendEmail({
          to: notify,
          subject: `✅ Quote accepted — ${String(quote.number || "")} (${String(quote.prospectName || "")})`,
          html: `<p><strong>${String(quote.prospectName || "")}</strong> accepted quote <strong>${String(
            quote.number || "",
          )}</strong> for <strong>$${Number(quote.total || 0).toFixed(2)}</strong>.</p><p><a href="${base}/admin/collections/quotes/${quote.id}">Open in admin</a></p>`,
        });
      } catch {
        /* best-effort */
      }
    }
    await emitEvent("quote.accepted", {
      number: quote.number,
      prospectName: quote.prospectName,
      prospectEmail: quote.prospectEmail,
      total: quote.total,
    });

    return json({ ok: true });
  } catch (err) {
    logger.error("quote accept failed", { message: err instanceof Error ? err.message : String(err) });
    return json({ error: "Could not record acceptance." }, 500);
  }
}
