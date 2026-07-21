import { z } from "zod";
import { getPayload } from "payload";
import config from "@payload-config";
import { getCurrentCustomer } from "@/lib/customer";
import { json, sameOrigin, readBody } from "@/lib/api";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

const schema = z.object({ code: z.string().trim().min(1).max(60) });

/**
 * Validate a coupon code and return its discount. Coupons are admin-only in the
 * CMS, so this runs with overrideAccess and only exposes a validated result —
 * never the coupon list.
 */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Invalid origin." }, 403);

  const customer = await getCurrentCustomer();
  if (!customer) return json({ error: "Not authenticated." }, 401);
  if (!rateLimit(`coupon:${customer.id}`, 20, 60_000).ok) {
    return json({ error: "Too many attempts. Please wait a moment." }, 429);
  }

  const parsed = await readBody(req, schema);
  if ("error" in parsed) return parsed.error;

  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "coupons",
    where: { code: { equals: parsed.data.code.toUpperCase() } },
    limit: 1,
    overrideAccess: true,
  });
  const coupon = docs[0] as unknown as Record<string, unknown> | undefined;

  if (!coupon || coupon.active === false) {
    return json({ valid: false, message: "That code isn't valid." });
  }

  return json({
    valid: true,
    code: coupon.code,
    type: coupon.type, // "percent" | "fixed"
    value: coupon.value,
    message:
      coupon.type === "percent"
        ? `${coupon.value}% off applied.`
        : `$${coupon.value} off applied.`,
  });
}
