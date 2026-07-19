import { NextResponse } from "next/server";
import type { ZodType } from "zod";
import { logger } from "@/lib/logger";

/**
 * Allowed origins for state-changing requests. Add your production domain(s)
 * via SITE_URL; localhost is always allowed in development.
 */
function allowedHosts(): string[] {
  const hosts = new Set<string>();
  const site = process.env.SITE_URL;
  if (site) {
    try {
      hosts.add(new URL(site).host);
    } catch {
      /* ignore malformed SITE_URL */
    }
  }
  hosts.add("syberinfo.com.au");
  hosts.add("www.syberinfo.com.au");
  if (process.env.NODE_ENV !== "production") hosts.add("localhost:3000");
  return [...hosts];
}

/**
 * Reject cross-site POSTs by comparing the request's Origin/Referer host to the
 * allowlist. Cheap CSRF defence for cookie-authenticated route handlers.
 */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const source = origin || referer;
  if (!source) return false; // no Origin on a cross-site fetch → reject
  let host: string;
  try {
    host = new URL(source).host;
  } catch {
    return false;
  }
  return allowedHosts().includes(host);
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
