import { z } from "zod";
import { site } from "@/lib/site";
import { saveLead } from "@/lib/content";
import { verifyTurnstile } from "@/lib/turnstile";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { json, readBody } from "@/lib/api";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(200),
  email: z.string().trim().email("Please enter a valid email address.").max(254),
  phone: z.string().trim().max(50).optional(),
  service: z.string().trim().max(120).optional(),
  message: z.string().trim().min(1, "Please enter a message.").max(5000),
  company_website: z.string().optional(), // honeypot
  turnstileToken: z.string().optional(),
});

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!rateLimit(`contact:${ip}`, 5, 60_000).ok) {
    return json({ error: "Too many requests. Please try again shortly." }, 429);
  }

  const parsed = await readBody(req, schema);
  if ("error" in parsed) return parsed.error;
  const data = parsed.data;

  // Honeypot: bots fill hidden fields → silently accept, do nothing.
  if (data.company_website) return json({ ok: true });

  if (!(await verifyTurnstile(data.turnstileToken, ip))) {
    return json({ error: "Spam check failed. Please try again." }, 400);
  }

  const lead = {
    name: data.name,
    email: data.email,
    phone: data.phone || "—",
    service: data.service || "—",
    message: data.message,
    receivedAt: new Date().toISOString(),
  };

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.CONTACT_FROM || `SyberInfo <noreply@${site.domain}>`,
          to: process.env.CONTACT_TO || site.email,
          reply_to: data.email,
          subject: `New enquiry: ${lead.service} — ${lead.name}`,
          text: [
            `Name: ${lead.name}`,
            `Email: ${lead.email}`,
            `Phone: ${lead.phone}`,
            `Service: ${lead.service}`,
            "",
            lead.message,
            "",
            `Received: ${lead.receivedAt}`,
          ].join("\n"),
        }),
      });
      if (!res.ok) {
        logger.error("contact: Resend send failed", { status: res.status, detail: await res.text() });
        return json({ error: "Could not send your message. Please email us directly." }, 502);
      }
    } catch (err) {
      logger.error("contact: email transport error", { message: err instanceof Error ? err.message : String(err) });
      return json({ error: "Could not send your message. Please email us directly." }, 502);
    }
  } else {
    logger.info("contact: new lead (email not configured)", { email: lead.email, service: lead.service });
  }

  // Store the enquiry regardless of email config; log (don't fail) if it can't
  // be persisted so a lead is never lost silently.
  const stored = await saveLead({
    name: data.name,
    email: data.email,
    phone: data.phone || undefined,
    service: data.service || undefined,
    message: data.message,
  });
  if (!stored) logger.error("contact: failed to persist lead to CMS", { email: lead.email });

  return json({ ok: true });
}
