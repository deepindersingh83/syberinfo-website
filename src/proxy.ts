import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { resolveRedirect } from "@/lib/redirects";

/**
 * Proxy (Next 16's node-runtime replacement for `middleware`). Two jobs:
 *
 *   1. CMS-managed redirects — resolve the request path against the `redirects`
 *      collection and 301/302 to the target. Protects link equity when URLs
 *      change. Runs on the node runtime, so it can read Payload directly.
 *   2. Canonical-host redirect — opt-in via CANONICAL_HOST: any other public
 *      host 301s to it, so search engines see one domain. Localhost/IPs are
 *      left alone. No-op if CANONICAL_HOST is unset.
 */
const CANONICAL = process.env.CANONICAL_HOST;

export async function proxy(req: NextRequest) {
  const host = (req.headers.get("host") || "").toLowerCase();
  const isLocal =
    !host ||
    host.startsWith("localhost") ||
    host.startsWith("127.") ||
    /^\d+\.\d+\.\d+\.\d+(:\d+)?$/.test(host);

  // 1. CMS-managed redirects (skip the admin/portal/api surfaces).
  const path = req.nextUrl.pathname;
  if (!/^\/(admin|portal|api)(\/|$)/.test(path)) {
    const match = await resolveRedirect(path);
    if (match) {
      // Relative target → same host; absolute target → as given.
      if (match.to.startsWith("http")) return NextResponse.redirect(match.to, match.status);
      const url = req.nextUrl.clone();
      url.pathname = match.to;
      url.search = "";
      return NextResponse.redirect(url, match.status);
    }
  }

  // 2. Canonical-host redirect.
  if (CANONICAL && !isLocal && host !== CANONICAL.toLowerCase()) {
    const url = req.nextUrl.clone();
    url.host = CANONICAL;
    url.protocol = "https";
    url.port = "";
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  // Skip Next internals and any request for a file with an extension.
  matcher: ["/((?!_next/|.*\\..*).*)"],
};
