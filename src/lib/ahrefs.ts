import { site } from "@/lib/site";
import { logger } from "@/lib/logger";

/**
 * Minimal Ahrefs API v3 client for the admin SEO widget. Reads a handful of
 * headline metrics for our own domain. Entirely env-gated: with no
 * AHREFS_API_TOKEN set, `ahrefsEnabled()` is false and nothing is called.
 */

export function ahrefsEnabled(): boolean {
  return Boolean(process.env.AHREFS_API_TOKEN);
}

const BASE = "https://api.ahrefs.com/v3";
const target = () => process.env.AHREFS_TARGET || site.domain;

async function af<T = unknown>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { Authorization: `Bearer ${process.env.AHREFS_API_TOKEN}`, Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
      // Cache for an hour — SEO metrics don't move minute to minute, and the
      // Ahrefs API bills per request.
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      logger.warn("ahrefs api non-2xx", { path, status: res.status });
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    logger.warn("ahrefs api failed", { path, message: err instanceof Error ? err.message : String(err) });
    return null;
  }
}

export type AhrefsSummary = {
  domainRating: number | null;
  refDomains: number | null;
  backlinks: number | null;
  orgKeywords: number | null;
  orgTraffic: number | null;
};

const num = (v: unknown): number | null => (v == null || Number.isNaN(Number(v)) ? null : Number(v));

/** Headline domain metrics for the dashboard. Each call is independent so one
 *  failing endpoint doesn't blank the whole panel. */
export async function getAhrefsSummary(): Promise<AhrefsSummary> {
  const t = encodeURIComponent(target());
  const today = new Date().toISOString().slice(0, 10);
  const [dr, backlinks, metrics] = await Promise.all([
    af<{ domain_rating?: number }>(`/site-explorer/domain-rating?target=${t}&date=${today}`),
    af<{ metrics?: { live_refdomains?: number; live?: number } }>(
      `/site-explorer/backlinks-stats?target=${t}&mode=domain&date=${today}`,
    ),
    af<{ metrics?: { org_keywords?: number; org_traffic?: number } }>(
      `/site-explorer/metrics?target=${t}&mode=domain&date=${today}`,
    ),
  ]);
  return {
    domainRating: num(dr?.domain_rating),
    refDomains: num(backlinks?.metrics?.live_refdomains),
    backlinks: num(backlinks?.metrics?.live),
    orgKeywords: num(metrics?.metrics?.org_keywords),
    orgTraffic: num(metrics?.metrics?.org_traffic),
  };
}
