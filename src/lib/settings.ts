import { getPayload } from "payload";
import config from "@payload-config";
import { site, footerCols } from "@/lib/site";

/**
 * Site-wide brand / contact / social settings, editable at
 * /admin → Globals → Site Settings. Reads the `site-settings` global and falls
 * back to the hardcoded defaults in src/lib/site.ts for any blank field, so the
 * site is never missing a phone number or email. Server components call
 * `await getSettings()`; the shape is stable regardless of CMS availability.
 */

export type Settings = {
  name: string;
  legalName: string;
  tagline: string;
  description: string;
  email: string;
  phone: string;
  phoneIntl: string;
  address: string;
  abn: string;
  hours: string;
  whatsapp: string;
  social: { linkedin: string; twitter: string; github: string; facebook: string; instagram: string };
  footerColumns: { heading: string; links: { label: string; href: string }[] }[];
};

const str = (v: unknown, fallback = "") => {
  const s = v == null ? "" : String(v).trim();
  return s || fallback;
};

function fallback(): Settings {
  return {
    name: site.name,
    legalName: site.legalName,
    tagline: site.tagline,
    description: site.description,
    email: site.email,
    phone: site.phone,
    phoneIntl: site.phoneIntl,
    address: site.address,
    abn: site.abn,
    hours: site.local.hoursHuman,
    whatsapp: site.whatsapp,
    social: {
      linkedin: site.social.linkedin,
      twitter: site.social.twitter,
      github: site.social.github,
      facebook: site.social.facebook,
      instagram: site.social.instagram,
    },
    footerColumns: footerCols.map((c) => ({ heading: c.head, links: c.links.map((l) => ({ label: l.label, href: l.href })) })),
  };
}

export async function getSettings(): Promise<Settings> {
  const fb = fallback();
  try {
    const payload = await getPayload({ config });
    const g = (await payload.findGlobal({ slug: "site-settings" })) as unknown as Record<string, unknown>;
    if (!g) return fb;
    const social = (g.social as Record<string, unknown>) || {};
    const cols = Array.isArray(g.footerColumns)
      ? (g.footerColumns as Record<string, unknown>[])
          .map((c) => ({
            heading: str(c.heading),
            links: Array.isArray(c.links)
              ? (c.links as Record<string, unknown>[]).map((l) => ({ label: str(l.label), href: str(l.href) }))
              : [],
          }))
          .filter((c) => c.heading && c.links.length)
      : [];
    return {
      name: str(g.name, fb.name),
      legalName: str(g.legalName, fb.legalName),
      tagline: str(g.tagline, fb.tagline),
      description: str(g.description, fb.description),
      email: str(g.email, fb.email),
      phone: str(g.phone, fb.phone),
      phoneIntl: str(g.phoneIntl, fb.phoneIntl),
      address: str(g.address, fb.address),
      abn: str(g.abn, fb.abn),
      hours: str(g.hours, fb.hours),
      whatsapp: str(g.whatsapp, fb.whatsapp),
      social: {
        linkedin: str(social.linkedin, fb.social.linkedin),
        twitter: str(social.twitter, fb.social.twitter),
        github: str(social.github, fb.social.github),
        facebook: str(social.facebook),
        instagram: str(social.instagram),
      },
      footerColumns: cols.length ? cols : fb.footerColumns,
    };
  } catch {
    return fb;
  }
}
