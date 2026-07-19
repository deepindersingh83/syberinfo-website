import path from "path";
import { fileURLToPath } from "url";
import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/**
 * If you must serve the site under a sub-path (e.g. https://syberinfo.com/app),
 * set BASE_PATH=/app at build time. Leave unset to serve at the domain root
 * (recommended — use a subdomain like syberinfo.com.au instead of a sub-folder).
 */
const basePath = process.env.BASE_PATH || undefined;

// Baseline security headers applied to every response. Note: the /admin panel
// needs some inline styles/scripts, so we keep a pragmatic CSP rather than a
// strict nonce-based one. Tighten `script-src`/`style-src` if you drop Payload
// admin from this deployment.
const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  basePath,
  // Pin the workspace root so a stray nested lockfile in node_modules can't
  // make Turbopack misdetect the project root.
  turbopack: { root: projectRoot },
  outputFileTracingRoot: projectRoot,
  // Produces a self-contained server build (.next/standalone) that's ideal for
  // running behind CloudPanel's nginx reverse proxy with PM2. See DEPLOY.md.
  output: "standalone",
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    // The client portal is now a single-page app at /portal. Redirect the
    // legacy server-rendered sub-pages there so there are no dead-ends
    // (reset-password is exempt — it completes the password-reset email flow).
    return [
      {
        source: "/portal/:path((?!reset-password).+)",
        destination: "/portal",
        permanent: false,
      },
    ];
  },
};

export default withPayload(nextConfig);
