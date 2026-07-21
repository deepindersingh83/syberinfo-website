import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Liveness + readiness probe. Returns 200 when the app and its database are
 * reachable, 503 otherwise. Safe to point an uptime monitor at.
 */
export async function GET() {
  const started = Date.now();
  try {
    const payload = await getPayload({ config });
    // Cheap DB round-trip.
    await payload.count({ collection: "users" });
    return NextResponse.json({
      status: "ok",
      db: "ok",
      uptime: process.uptime(),
      responseMs: Date.now() - started,
      time: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { status: "degraded", db: "unreachable", time: new Date().toISOString() },
      { status: 503 },
    );
  }
}
