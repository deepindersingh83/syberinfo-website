import { logger } from "@/lib/logger";

/**
 * On-demand internal link checker. Seeds from the sitemap, crawls each page for
 * same-origin links, then verifies every unique internal link actually resolves
 * (2xx/3xx). Broken links are reported with the pages they were found on.
 *
 * Bounded (page + request caps) so it's safe to run on demand from the admin.
 */

export type LinkReport = {
  base: string;
  pagesCrawled: number;
  linksChecked: number;
  broken: { url: string; status: number; foundOn: string[] }[];
  ranAt: string;
};

const PAGE_CAP = 60;
const LINK_CAP = 400;

function sameOriginPath(href: string, base: string): string | null {
  try {
    const u = new URL(href, base);
    if (u.origin !== new URL(base).origin) return null;
    // Ignore anchors, non-http and asset/route noise.
    if (!/^https?:$/.test(u.protocol)) return null;
    let p = u.pathname;
    if (p.startsWith("/api/") || p.startsWith("/admin")) return null;
    if (/\.(png|jpe?g|svg|webp|gif|ico|css|js|xml|txt|pdf|woff2?)$/i.test(p)) return null;
    p = p.replace(/\/+$/, "") || "/";
    return p + u.search;
  } catch {
    return null;
  }
}

async function fetchText(url: string): Promise<{ ok: boolean; status: number; body: string }> {
  try {
    const res = await fetch(url, { redirect: "follow", headers: { "user-agent": "SyberInfo-LinkCheck" } });
    const body = res.headers.get("content-type")?.includes("text/html") ? await res.text() : "";
    return { ok: res.ok, status: res.status, body };
  } catch {
    return { ok: false, status: 0, body: "" };
  }
}

async function statusOf(url: string): Promise<number> {
  try {
    // GET (many app routes don't implement HEAD); follow redirects to final.
    const res = await fetch(url, { redirect: "follow", headers: { "user-agent": "SyberInfo-LinkCheck" } });
    return res.status;
  } catch {
    return 0;
  }
}

export async function runLinkCheck(base: string): Promise<LinkReport> {
  const origin = new URL(base).origin;

  // 1. Seed page list from the sitemap.
  const seeds = new Set<string>(["/"]);
  try {
    const sm = await fetch(`${origin}/sitemap.xml`, { headers: { "user-agent": "SyberInfo-LinkCheck" } });
    if (sm.ok) {
      const xml = await sm.text();
      for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
        // The sitemap uses the canonical production host; we only want the path
        // so seeds work no matter which origin we're crawling (staging/local).
        try {
          const p = new URL(m[1].trim()).pathname.replace(/\/+$/, "") || "/";
          if (p.startsWith("/api/") || p.startsWith("/admin")) continue;
          seeds.add(p);
        } catch {
          /* skip malformed loc */
        }
      }
    }
  } catch {
    /* fall back to crawling from "/" only */
  }

  // 2. Crawl seed pages, collect internal links + where they were found.
  const found = new Map<string, Set<string>>(); // link -> pages it appears on
  const pages = [...seeds].slice(0, PAGE_CAP);
  for (const page of pages) {
    const { body } = await fetchText(`${origin}${page}`);
    if (!body) continue;
    for (const m of body.matchAll(/href=["']([^"']+)["']/g)) {
      const p = sameOriginPath(m[1], origin);
      if (!p) continue;
      if (!found.has(p)) found.set(p, new Set());
      found.get(p)!.add(page);
    }
  }

  // 3. Verify each unique link resolves.
  const links = [...found.keys()].slice(0, LINK_CAP);
  const broken: LinkReport["broken"] = [];
  for (const link of links) {
    const status = await statusOf(`${origin}${link}`);
    if (status === 0 || status >= 400) {
      broken.push({ url: link, status, foundOn: [...(found.get(link) || [])] });
    }
  }

  const report: LinkReport = {
    base: origin,
    pagesCrawled: pages.length,
    linksChecked: links.length,
    broken: broken.sort((a, b) => b.status - a.status),
    ranAt: new Date().toISOString(),
  };
  logger.info("link check complete", { pages: report.pagesCrawled, links: report.linksChecked, broken: broken.length });
  return report;
}
