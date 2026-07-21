import { headers as nextHeaders } from "next/headers";
import { getPayload } from "payload";
import config from "@payload-config";
import { json } from "@/lib/api";
import { ingramEnabled, fetchCatalog } from "@/lib/ingram";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Admin-only: pull the Ingram Micro catalogue and upsert it into the `software`
 * collection (matched by name). Trigger it from a cron/scheduled task or a
 * button in the admin. No-op (501) until the INGRAM_* env is configured.
 */
export async function POST() {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: await nextHeaders() });
  if (!user || user.collection !== "users") {
    return json({ error: "Admin only." }, 403);
  }
  if (!ingramEnabled()) {
    return json({ error: "Ingram integration is not configured (set INGRAM_* env)." }, 501);
  }

  let created = 0;
  let updated = 0;
  try {
    const products = await fetchCatalog();
    for (const p of products) {
      const existing = await payload.find({
        collection: "software",
        where: { name: { equals: p.name } },
        limit: 1,
        overrideAccess: true,
      });
      const data = {
        name: p.name,
        brand: p.brand,
        category: p.category as
          | "Productivity" | "Creative" | "Communication" | "Dev Tools" | "Storage" | "Security" | "Cloud" | "Other",
        letter: p.letter,
        color: p.color,
        tagline: p.tagline,
        active: true,
        plans: p.plans,
        addons: p.addons,
      };
      if (existing.docs[0]) {
        await payload.update({ collection: "software", id: existing.docs[0].id, data, overrideAccess: true });
        updated++;
      } else {
        await payload.create({ collection: "software", data, overrideAccess: true });
        created++;
      }
    }
  } catch (err) {
    logger.error("ingram-sync failed", { message: err instanceof Error ? err.message : String(err) });
    return json({ error: "Sync failed — see server logs." }, 502);
  }

  logger.info("ingram-sync complete", { created, updated });
  return json({ ok: true, created, updated });
}
