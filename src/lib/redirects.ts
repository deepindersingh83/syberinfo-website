import { getPayload } from "payload";
import config from "@payload-config";

/**
 * CMS-managed redirect map. Editors add entries in the `redirects` collection
 * (from → to, permanent?) and this module resolves an incoming path to its
 * target. Runs in `proxy.ts` (Next 16's node-runtime replacement for
 * middleware), so it can read Payload/SQLite directly — cached in-process with
 * a short TTL so we don't hit the DB on every request.
 */

type Redirect = { from: string; to: string; permanent: boolean };

let cache: { at: number; list: Redirect[] } | null = null;
const TTL_MS = 60_000; // refresh at most once a minute

const norm = (p: string) => {
  const clean = (p || "/").split("?")[0].split("#")[0];
  if (clean.length > 1 && clean.endsWith("/")) return clean.slice(0, -1);
  return clean || "/";
};

async function load(): Promise<Redirect[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.list;
  try {
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: "redirects",
      where: { active: { not_equals: false } },
      limit: 1000,
      depth: 0,
      overrideAccess: true,
    });
    const list = (docs as { from?: string; to?: string; permanent?: boolean }[])
      .filter((d) => d.from && d.to)
      .map((d) => ({ from: norm(String(d.from)), to: String(d.to), permanent: d.permanent !== false }));
    cache = { at: Date.now(), list };
    return list;
  } catch {
    return cache?.list ?? [];
  }
}

export type RedirectMatch = { to: string; status: 301 | 302 };

/** Resolve a path to its redirect target, or null if none applies. */
export async function resolveRedirect(pathname: string): Promise<RedirectMatch | null> {
  const list = await load();
  if (!list.length) return null;
  const from = norm(pathname);
  const hit = list.find((r) => r.from === from);
  if (!hit) return null;
  // Guard against a redirect that points at itself.
  if (norm(hit.to) === from) return null;
  return { to: hit.to, status: hit.permanent ? 301 : 302 };
}
