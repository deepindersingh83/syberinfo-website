/**
 * PM2 process config for running the SyberInfo site on a CloudPanel VPS.
 *
 *   npm ci && npm run build
 *   pm2 start ecosystem.config.cjs
 *   pm2 save && pm2 startup
 *
 * Uses the Next.js "standalone" output (see next.config.ts). nginx (CloudPanel)
 * reverse-proxies port 3000 to this process.
 *
 * IMPORTANT: PM2 does NOT read a .env file on its own. If PAYLOAD_SECRET and
 * DATABASE_URI aren't present in the environment, the app falls back to a
 * random per-restart secret (which silently invalidates every admin/portal
 * session — you get "You are not allowed to perform this action" and the
 * "create first admin" screen keeps coming back) and to a relative SQLite path
 * that resolves inside .next/standalone (which is wiped on every rebuild).
 *
 * So we load .env from this directory ourselves, below, before PM2 forks the
 * app. Put the real values in `.env` next to this file:
 *
 *   PAYLOAD_SECRET=<long random string, e.g. openssl rand -base64 48>
 *   DATABASE_URI=file:/home/<site-user>/syberinfo-website/data/syberinfo.db
 *   RESEND_API_KEY=<optional>
 */

const fs = require("fs");
const path = require("path");

/** Minimal, dependency-free .env loader (no export/quotes gymnastics needed). */
function loadEnv() {
  const out = {};
  const file = path.join(__dirname, ".env");
  let raw;
  try {
    raw = fs.readFileSync(file, "utf8");
  } catch {
    return out; // no .env — rely on the ambient shell environment instead
  }
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    // Strip a single layer of surrounding quotes if present.
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

// Ambient shell values win over .env, so you can still override on the CLI.
const fileEnv = loadEnv();

module.exports = {
  apps: [
    {
      name: "syberinfo",
      script: ".next/standalone/server.js",
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "127.0.0.1",
        // Loaded from .env (see loadEnv above); shell env overrides these.
        PAYLOAD_SECRET: process.env.PAYLOAD_SECRET || fileEnv.PAYLOAD_SECRET,
        DATABASE_URI: process.env.DATABASE_URI || fileEnv.DATABASE_URI,
        RESEND_API_KEY: process.env.RESEND_API_KEY || fileEnv.RESEND_API_KEY,
      },
    },
  ],
};
