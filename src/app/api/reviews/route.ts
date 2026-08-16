import { z } from "zod";
import { getPayload } from "payload";
import config from "@payload-config";
import { json, readBody, sameOrigin } from "@/lib/api";
import { emitEvent } from "@/lib/events";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  role: z.string().trim().max(80).optional(),
  company: z.string().trim().max(120).optional(),
  rating: z.coerce.number().int().min(1).max(5),
  quote: z.string().trim().min(10).max(1000),
});

/**
 * Public review submission. Anyone can submit; reviews land unapproved and are
 * hidden until an admin ticks "Approved". Rate-limited + same-origin to curb
 * spam. The team is notified so they can moderate.
 */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Invalid origin." }, 403);
  if (!rateLimit(`review:${clientIp(req)}`, 5, 60_000).ok) {
    return json({ error: "Too many requests. Please try again shortly." }, 429);
  }

  const parsed = await readBody(req, schema);
  if ("error" in parsed) return parsed.error;
  const { name, role, company, rating, quote } = parsed.data;

  try {
    const payload = await getPayload({ config });
    await payload.create({
      collection: "testimonials",
      overrideAccess: true,
      data: {
        quote,
        name,
        role: role || "",
        company: company || "",
        rating,
        approved: false,
        submittedAt: new Date().toISOString(),
        order: 999,
      },
    });

    const notify = process.env.CONTACT_TO || process.env.CONTACT_FROM_ADDRESS;
    if (notify) {
      const base = process.env.SITE_URL || "https://syberinfo.com.au";
      try {
        await payload.sendEmail({
          to: notify,
          subject: `⭐ New review (${rating}/5) from ${name}`,
          html: `<p><strong>${name}</strong>${company ? ` — ${company}` : ""} left a ${rating}-star review:</p>
<blockquote>${quote}</blockquote>
<p><a href="${base}/admin/collections/testimonials">Moderate in admin</a></p>`,
        });
      } catch {
        /* best-effort */
      }
    }
    await emitEvent("review.submitted", { name, company, rating });

    return json({ ok: true });
  } catch (err) {
    logger.error("review submit failed", { message: err instanceof Error ? err.message : String(err) });
    return json({ error: "Could not submit your review. Please try again." }, 500);
  }
}
