/**
 * After `next build`, Next's `output: "standalone"` produces a self-contained
 * server at .next/standalone/server.js — but it deliberately does NOT include
 * the static assets (.next/static) or the public/ folder. If you run that
 * server without them, every CSS/JS/image 404s: the admin looks like plain text
 * and the front end has no styling or interactivity.
 *
 * This script copies them in automatically so `.next/standalone` is always
 * ready to run. Safe to run anywhere — it no-ops if the standalone dir is absent
 * (e.g. when output isn't standalone).
 */
import { cp, access } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const standalone = path.join(root, ".next", "standalone");

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (!(await exists(standalone))) {
    console.log("[postbuild] no standalone output — skipping asset copy.");
    return;
  }
  // .next/static → .next/standalone/.next/static
  const staticSrc = path.join(root, ".next", "static");
  if (await exists(staticSrc)) {
    await cp(staticSrc, path.join(standalone, ".next", "static"), { recursive: true });
    console.log("[postbuild] copied .next/static into standalone.");
  }
  // public → .next/standalone/public
  const publicSrc = path.join(root, "public");
  if (await exists(publicSrc)) {
    await cp(publicSrc, path.join(standalone, "public"), { recursive: true });
    console.log("[postbuild] copied public/ into standalone.");
  }
  console.log("[postbuild] standalone is ready to run: node .next/standalone/server.js");
}

main().catch((err) => {
  console.error("[postbuild] failed:", err);
  process.exit(1);
});
