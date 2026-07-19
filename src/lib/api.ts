import { NextResponse } from "next/server";
import type { ZodType } from "zod";
import { logger } from "@/lib/logger";

/**
 * Extra allowed origin hosts (beyond the request's own host). Anyone on the
 * real site is already allowed via the host match in sameOrigin(); this just
 * lets you permit additional trusted domains via SITE_URL / EXTRA_ORIGINS.
 */
function extraAllowedHosts(): string[] {
  const hosts = new Set<string>();
  const add = (v?: string) => {
    if (!v) return;
    try {
      hosts.add(new URL(v).host.toLowerCase());
    } catch {
      hosts.add(v.trim().toLowerCase()); // allow a bare host too
    }
  };
  add(process.env.SITE_URL);
  // Comma-separated list of additional origins (schemes optional).
  (process.env.EXTRA_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean).forEach(add);
  if (process.env.NODE_ENV !== "production") hosts.add("localhost:3000");
  return [...hosts];
}

/**
 * CSRF defence for cookie-authenticated routes. A request is same-origin when
 * its Origin/Referer host matches the host the request was actually served on
 * — so it works on ANY domain you deploy to (and from users anywhere in the
 * world), while still rejecting genuine cross-site (attacker-domain) requests.
 */
export function sameOrigin(req: Request): boolean {
  const source = req.headers.get("origin") || req.headers.get("referer");
  if (!source) return false; // no Origin on a cross-site fetch → reject
  let host: string;
  try {
    host = new URL(source).host.toLowerCase();
  } catch {
    return false;
  }
  // The public host this request came in on (nginx sets x-forwarded-host/host).
  const serverHost = (req.headers.get("x-forwarded-host") || req.headers.get("host") || "").toLowerCase();
  if (serverHost && host === serverHost) return true;
  return extraAllowedHosts().includes(host);
}

/** JSON response shorthand. */
export function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status });
}

/**
 * Parse + validate a JSON body against a Zod schema. Returns either the typed
 * data or a ready-to-return NextResponse error.
 */
export async function readBody<T>(
  req: Request,
  schema: ZodType<T>,
): Promise<{ data: T } | { error: NextResponse }> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return { error: json({ error: "Invalid request body." }, 400) };
  }
  const result = schema.safeParse(raw);
  if (!result.success) {
    const first = result.error.issues[0];
    return {
      error: json({ error: first?.message || "Please check your input." }, 400),
    };
  }
  return { data: result.data };
}

/** Wrap a handler so uncaught errors are logged and return a clean 500. */
export function withErrorLog(
  name: string,
  handler: (req: Request, ctx: unknown) => Promise<Response>,
) {
  return async (req: Request, ctx: unknown): Promise<Response> => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      logger.error(`api.${name} failed`, {
        message: err instanceof Error ? err.message : String(err),
      });
      return json({ error: "Something went wrong. Please try again." }, 500);
    }
  };
}
