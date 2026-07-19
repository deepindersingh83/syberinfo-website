import { z } from "zod";
import { saveSubscriber } from "@/lib/content";
import { verifyTurnstile } from "@/lib/turnstile";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { json, readBody } from "@/lib/api";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Please enter a valid email address.").max(254),
  source: z.string().trim().max(80).optional(),
  turnstileToken: z.string().optional(),
});

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!rateLimit(`newsletter:${ip}`, 5, 60_000).ok) {
    return json({ error: "Too many requests. Please try again shortly." }, 429);
  }

  const parsed = await readBody(req, schema);
  if ("error" in parsed) return parsed.error;
  const { email, source, turnstileToken } = parsed.data;

  if (!(await verifyTurnstile(turnstileToken, ip))) {
    return json({ error: "Spam check failed. Please try again." }, 400);
  }

  const stored = await saveSubscriber(email, source || "website");
  if (!stored) logger.error("newsletter: failed to persist subscriber", { email });

  const apiKey = process.env.KLAVIYO_API_KEY;
  const listId = process.env.KLAVIYO_LIST_ID;
  if (apiKey && listId) {
    try {
      await fetch("https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs", {
        method: "POST",
        headers: {
          Authorization: `Klaviyo-API-Key ${apiKey}`,
          "Content-Type": "application/json",
          accept: "application/json",
          revision: "2024-10-15",
        },
        body: JSON.stringify({
          data: {
            type: "profile-subscription-bulk-create-job",
            attributes: {
              profiles: {
                data: [
                  {
                    type: "profile",
                    attributes: {
                      email,
                      subscriptions: { email: { marketing: { consent: "SUBSCRIBED" } } },
                    },
                  },
                ],
              },
            },
            relationships: { list: { data: { type: "list", id: listId } } },
          },
        }),
      });
    } catch (err) {
      logger.error("newsletter: Klaviyo subscribe failed", { message: err instanceof Error ? err.message : String(err) });
    }
  }

  return json({ ok: true });
}
