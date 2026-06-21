import type { NextConfig } from "next";

/**
 * If you must serve the site under a sub-path (e.g. https://syberinfo.com/app),
 * set BASE_PATH=/app at build time. Leave unset to serve at the domain root
 * (recommended — use a subdomain like syberinfo.com.au instead of a sub-folder).
 */
const basePath = process.env.BASE_PATH || undefined;

const nextConfig: NextConfig = {
  basePath,
  // Produces a self-contained server build (.next/standalone) that's ideal for
  // running behind CloudPanel's nginx reverse proxy with PM2. See DEPLOY.md.
  output: "standalone",
};

export default nextConfig;
