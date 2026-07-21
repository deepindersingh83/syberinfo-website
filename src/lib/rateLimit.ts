/**
 * Tiny in-memory rate limiter (per key, fixed window). Suitable for a single
 * Node instance (e.g. one PM2 process on CloudPanel). For multi-instance
 * deploys set REDIS_URL and swap this for a shared store — the call sites use
 * the same `rateLimit()` signature so only this file changes.
 *
 * Expired buckets are evicted opportunistically so the Map can't grow forever.
 */
type Hit = { count: number; reset: number };
const buckets = new Map<string, Hit>();
let lastSweep = 0;

function sweep(now: number) {
  // Sweep at most once every 60s to keep it cheap.
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, hit] of buckets) {
    if (now > hit.reset) buckets.delete(key);
  }
}

export function rateLimit(
  key: string,
  limit = 5,
  windowMs = 60_000,
): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  sweep(now);
  const hit = buckets.get(key);

  if (!hit || now > hit.reset) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }
  hit.count += 1;
  if (hit.count > limit) {
    return { ok: false, retryAfter: Math.ceil((hit.reset - now) / 1000) };
  }
  return { ok: true, retryAfter: 0 };
}

/**
 * Best-effort client IP. Only trusts proxy headers when TRUST_PROXY isn't
 * disabled (true behind CloudPanel/nginx); otherwise they're spoofable and
 * would let a client dodge the limiter. Falls back to a coarse per-UA bucket so
 * a single header-less client can't hold the whole limit for everyone.
 */
export function clientIp(req: Request): string {
  const trustProxy = process.env.TRUST_PROXY !== "false"; // default true (deployed behind nginx)
  if (trustProxy) {
    const xff = req.headers.get("x-forwarded-for");
    if (xff) return xff.split(",")[0].trim();
    const xri = req.headers.get("x-real-ip");
    if (xri) return xri.trim();
  }
  const ua = req.headers.get("user-agent") || "";
  let h = 0;
  for (let i = 0; i < ua.length; i++) h = (h * 31 + ua.charCodeAt(i)) | 0;
  return `unknown:${h}`;
}
