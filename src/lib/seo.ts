import type { Metadata } from "next";
import { getPayload } from "payload";
import config from "@payload-config";
import { site } from "@/lib/site";

/**
 * Per-page SEO overrides. Editors can set a custom title / description /
 * canonical / og-image or flag a page noindex via the `seo` group on a
 * collection (added in Phase 2). This reads just that group for one document
 * and merges it onto a page's base metadata — so the CMS wins when set, and the
 * page's sensible defaults apply otherwise.
 */

type SeoCollection = "services" | "posts";

export type SeoOverride = {
  metaTitle?: string;
  metaDescription?: string;
  canonical?: string;
  noindex?: boolean;
  ogImageUrl?: string;
};

const s = (v: unknown) => (v == null ? "" : String(v));

export async function getSeoOverride(collection: SeoCollection, slug: string): Promise<SeoOverride> {
  try {
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection,
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 1, // resolve the ogImage upload to get its URL
    });
    const seo = (docs[0] as unknown as Record<string, unknown> | undefined)?.seo as Record<string, unknown> | undefined;
    if (!seo) return {};
    const og = seo.ogImage as { url?: string } | string | undefined;
    const ogImageUrl = og && typeof og === "object" ? og.url : undefined;
    return {
      metaTitle: s(seo.metaTitle) || undefined,
      metaDescription: s(seo.metaDescription) || undefined,
      canonical: s(seo.canonical) || undefined,
      noindex: Boolean(seo.noindex),
      ogImageUrl: ogImageUrl ? (ogImageUrl.startsWith("http") ? ogImageUrl : `${site.url}${ogImageUrl}`) : undefined,
    };
  } catch {
    return {};
  }
}

/** Merge an override onto base metadata: CMS values win, defaults fill the rest. */
export function applySeo(base: Metadata, o: SeoOverride): Metadata {
  const out: Metadata = { ...base };
  if (o.metaTitle) out.title = o.metaTitle;
  if (o.metaDescription) out.description = o.metaDescription;
  if (o.canonical) out.alternates = { ...(out.alternates || {}), canonical: o.canonical };
  if (o.noindex) out.robots = { index: false, follow: false };
  if (o.ogImageUrl) {
    out.openGraph = { ...(out.openGraph || {}), images: [{ url: o.ogImageUrl, width: 1200, height: 630 }] };
    out.twitter = { ...(out.twitter || {}), images: [o.ogImageUrl] } as Metadata["twitter"];
  }
  return out;
}
