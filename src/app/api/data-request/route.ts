import { z } from "zod";
import { saveDataRequest } from "@/lib/content";
import { verifyTurnstile } from "@/lib/turnstile";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { json, readBody } from "@/lib/api";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Please enter a valid email address.").max(254),
  type: z.enum(["export", "delete"]).optional(),
  details: z.string().trim().max(2000).optional(),
  turnstileToken: z.string().optional(),
});

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!rateLimit(`data-request:${ip}`, 5, 60_000).ok) {
    return json({ error: "Too many requests. Please try again shortly." }, 429);
  }

  const parsed = await readBody(req, schema);
  if ("error" in parsed) return parsed.error;
  const { email, type = "export", details, turnstileToken } = parsed.data;

  if (!(await verifyTurnstile(turnstileToken, ip))) {
    return json({ error: "Spam check failed. Please try again." }, 400);
  }

  const ok = await saveDataRequest(email, type, details);
  if (!ok) {
    return json({ error: "Could not submit your request. Please email us directly." }, 502);
  }
  return json({ ok: true });
}
