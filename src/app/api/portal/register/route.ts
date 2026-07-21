import { z } from "zod";
import { getPayload } from "payload";
import config from "@payload-config";
import { json, readBody, sameOrigin } from "@/lib/api";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(200),
  company: z.string().trim().max(200).optional(),
  email: z.string().trim().toLowerCase().email("Please enter a valid email address.").max(254),
  phone: z.string().trim().max(50).optional(),
  password: z.string().min(8, "Use at least 8 characters.").max(200),
});

/**
 * Public customer sign-up. The `customers` collection is create-admin-only in
 * the CMS, so we create with overrideAccess here (rate-limited + same-origin),
 * then the client logs in via Payload's /api/customers/login.
 */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Invalid origin." }, 403);

  const ip = clientIp(req);
  if (!rateLimit(`register:${ip}`, 5, 60_000).ok) {
    return json({ error: "Too many attempts. Please try again shortly." }, 429);
  }

  const parsed = await readBody(req, schema);
  if ("error" in parsed) return parsed.error;
  const { name, company, email, phone, password } = parsed.data;

  const payload = await getPayload({ config });

  // Reject duplicate emails cleanly.
  const existing = await payload.find({
    collection: "customers",
    where: { email: { equals: email } },
    limit: 1,
    overrideAccess: true,
  });
  if (existing.totalDocs > 0) {
    return json({ error: "An account with that email already exists." }, 409);
  }

  try {
    await payload.create({
      collection: "customers",
      overrideAccess: true,
      data: { name, company: company || undefined, email, phone, password },
    });
  } catch (err) {
    logger.error("register: create customer failed", {
      email,
      message: err instanceof Error ? err.message : String(err),
    });
    return json({ error: "Could not create your account. Please try again." }, 500);
  }

  logger.info("portal: customer registered", { email });
  return json({ ok: true });
}
