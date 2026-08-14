import { getPayload } from "payload";
import config from "@payload-config";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * One-click unsubscribe from status alerts via the token in each email's footer.
 * GET so it works straight from an email link; returns a small confirmation page.
 */
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token") || "";
  const html = (msg: string) =>
    new Response(
      `<!doctype html><meta charset="utf-8"><title>SyberInfo status alerts</title><body style="font-family:system-ui;background:#0A0C10;color:#eee;display:grid;place-items:center;height:100vh;margin:0"><div style="text-align:center"><h1 style="color:#5E5BFF">SyberInfo</h1><p>${msg}</p><p><a href="/status" style="color:#C9F25E">Back to status page</a></p></div>`,
      { status: 200, headers: { "Content-Type": "text/html" } },
    );

  if (!token) return html("Invalid unsubscribe link.");
  try {
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: "status-subscribers",
      where: { token: { equals: token } },
      limit: 1,
      overrideAccess: true,
    });
    if (docs[0]) {
      await payload.delete({ collection: "status-subscribers", id: docs[0].id, overrideAccess: true });
    }
    return html("You've been unsubscribed from status alerts.");
  } catch (err) {
    logger.error("status unsubscribe failed", { message: err instanceof Error ? err.message : String(err) });
    return html("Something went wrong. Please contact us to unsubscribe.");
  }
}
