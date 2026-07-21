import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Canonical-host redirect. Opt-in: set CANONICAL_HOST (e.g. "syberinfo.com.au")
 * and any other public host (www., the .com, etc.) 301-redirects to it — one
 * domain for SEO, no duplicate-content split. Localhost/IPs are left alone so
 * dev and health checks aren't affected. No-op if CANONICAL_HOST is unset.
 */
const CANONICAL = process.env.CANONICAL_HOST;

export function middleware(req: NextRequest) {
  if (!CANONICAL) return NextResponse.next();

  const host = (req.headers.get("host") || "").toLowerCase();
  if (
    !host ||
    host.startsWith("localhost") ||
    host.startsWith("127.") ||
    /^\d+\.\d+\.\d+\.\d+(:\d+)?$/.test(host)
  ) {
    return NextResponse.next();
  }

  if (host !== CANONICAL.toLowerCase()) {
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
