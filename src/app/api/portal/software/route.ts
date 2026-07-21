import { getPayload } from "payload";
import config from "@payload-config";
import { json } from "@/lib/api";
import { software as fallbackSoftware } from "@/lib/portal-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Rec = Record<string, unknown>;
const s = (v: unknown) => (v == null ? "" : String(v));
const n = (v: unknown) => (typeof v === "number" ? v : Number(v) || 0);

/**
 * Software & cloud licence catalogue for the portal. Reads the CMS `software`
 * collection (managed at /admin) and falls back to the bundled seed data if the
 * CMS is empty/unavailable, so the marketplace is never blank.
 */
export async function GET() {
  try {
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: "software",
      where: { active: { not_equals: false } },
      sort: "order",
      limit: 200,
      depth: 0,
    });
    if (docs.length) {
      return json({
        products: (docs as unknown as Rec[]).map((d) => ({
          id: s(d.id),
          name: s(d.name),
          brand: s(d.brand),
          category: s(d.category) || "Other",
          letter: s(d.letter) || s(d.name).slice(0, 1).toUpperCase(),
          color: s(d.color) || "#5e5bff",
          tagline: s(d.tagline),
          plans: Array.isArray(d.plans)
            ? (d.plans as Rec[]).map((p) => ({ name: s(p.name), price: n(p.price), unit: s(p.unit) || "per user / month", feat: s(p.feature) }))
            : [],
          addons: Array.isArray(d.addons)
            ? (d.addons as Rec[]).map((a) => ({ name: s(a.name), price: n(a.price), desc: s(a.desc) }))
            : [],
        })),
      });
    }
  } catch {
    /* fall through to seed */
  }

  return json({
    products: fallbackSoftware.map((w) => ({
      id: w.id,
      name: w.name,
      brand: w.brand,
      category: w.category,
      letter: w.letter,
      color: w.color,
      tagline: w.tagline,
      plans: w.plans.map((p) => ({ name: p.name, price: p.priceNum, unit: "per user / month", feat: p.feat })),
      addons: (w.addons || []).map((a) => ({ name: a.name, price: a.priceNum, desc: a.desc })),
    })),
  });
}
