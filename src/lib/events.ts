import { logger } from "@/lib/logger";

/**
 * Outbound business events. When `MAKE_WEBHOOK_URL` (or `EVENT_WEBHOOK_URL`) is
 * configured, domain events — lead.created, invoice.paid, quote.accepted, … —
 * are POSTed as JSON so an automation platform (Make/Integromat, Zapier, n8n)
 * can fan them out to Slack/Teams/PSA/accounting without more code here.
 *
 * Best-effort and non-blocking: a webhook failure is logged, never thrown, so
 * it can't break the user-facing request that triggered it.
 */

export type EventName =
  | "lead.created"
  | "invoice.paid"
  | "invoice.overdue"
  | "subscription.suspended"
  | "quote.sent"
  | "quote.accepted"
  | "quote.paid"
  | "asset.renewal_due"
  | "review.submitted"
  | "ticket.created";

function targets(): string[] {
  return [process.env.MAKE_WEBHOOK_URL, process.env.EVENT_WEBHOOK_URL].filter(
    (u): u is string => Boolean(u && /^https?:\/\//.test(u)),
  );
}

export function eventsEnabled(): boolean {
  return targets().length > 0;
}

/** Fire-and-forget a domain event to the configured webhook(s). */
export async function emitEvent(event: EventName, data: Record<string, unknown>): Promise<void> {
  const urls = targets();
  if (!urls.length) return;
  const body = JSON.stringify({ event, data, at: new Date().toISOString() });
  await Promise.all(
    urls.map(async (url) => {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          signal: AbortSignal.timeout(5000),
        });
        if (!res.ok) logger.warn("event webhook non-2xx", { event, status: res.status });
      } catch (err) {
        logger.warn("event webhook failed", { event, message: err instanceof Error ? err.message : String(err) });
      }
    }),
  );
}
