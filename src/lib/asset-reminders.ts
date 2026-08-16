import type { Payload } from "payload";
import { emitEvent } from "@/lib/events";
import { logger } from "@/lib/logger";

/**
 * Asset & licence renewal reminders. Finds managed assets whose renewal date is
 * approaching, emails the owning client (and flags the team for an upsell), and
 * stamps lastReminderAt so each renewal is only chased once per window.
 *
 * Idempotent within the window: an asset reminded in the last `cooldownDays`
 * is skipped. Intended to run daily from the same scheduler as the billing run.
 */
export async function runAssetReminders(
  payload: Payload,
  opts: { withinDays?: number; cooldownDays?: number } = {},
): Promise<{ scanned: number; reminded: number }> {
  const withinDays = opts.withinDays ?? 30;
  const cooldownDays = opts.cooldownDays ?? 25;
  const now = Date.now();
  const horizon = new Date(now + withinDays * 86_400_000).toISOString();

  const { docs } = await payload.find({
    collection: "assets",
    where: {
      and: [
        { autoRemind: { equals: true } },
        { status: { not_equals: "retired" } },
        { renewalDate: { less_than_equal: horizon } },
        { renewalDate: { greater_than_equal: new Date(now).toISOString() } },
      ],
    },
    depth: 1,
    limit: 500,
    overrideAccess: true,
  });

  let reminded = 0;

  for (const raw of docs) {
    const asset = raw as unknown as Record<string, unknown>;

    // Respect the cooldown so daily runs don't spam the same renewal.
    const last = asset.lastReminderAt ? new Date(asset.lastReminderAt as string).getTime() : 0;
    if (last && now - last < cooldownDays * 86_400_000) continue;

    const customer = (typeof asset.customer === "object" ? asset.customer : null) as Record<string, unknown> | null;
    const email = customer?.email ? String(customer.email) : "";
    const name = String(asset.name || "your asset");
    const renews = asset.renewalDate ? new Date(asset.renewalDate as string) : null;
    const renewsStr = renews
      ? renews.toLocaleDateString("en-AU", { day: "2-digit", month: "long", year: "numeric" })
      : "";

    // Email the client (best-effort).
    if (email) {
      try {
        await payload.sendEmail({
          to: email,
          subject: `Renewal coming up: ${name}${renewsStr ? ` (${renewsStr})` : ""}`,
          html: `<p>Hi${customer?.name ? " " + String(customer.name) : ""},</p>
<p>Just a heads-up that <strong>${name}</strong> is due to renew${renewsStr ? ` on <strong>${renewsStr}</strong>` : " soon"}.</p>
<p>We'll take care of it for you. If anything's changed — more seats, a different plan, or you'd like to retire it — just reply and we'll sort it out.</p>
<p>— The SyberInfo team</p>`,
        });
      } catch (err) {
        logger.warn("asset reminder: client email failed", {
          asset: name,
          message: err instanceof Error ? err.message : String(err),
        });
      }
    }

    // Flag the team for a renewal/upsell conversation.
    const staff = process.env.CONTACT_TO || process.env.CONTACT_FROM_ADDRESS;
    if (staff) {
      const qty = Number(asset.quantity) || 1;
      const unit = Number(asset.unitCost) || 0;
      const value = qty * unit;
      try {
        await payload.sendEmail({
          to: staff,
          subject: `🔁 Renewal due — ${name} (${customer?.company || customer?.name || "client"})`,
          html: `<p><strong>${name}</strong> renews${renewsStr ? ` on ${renewsStr}` : " soon"} for <strong>${
            customer?.company || customer?.name || "a client"
          }</strong>.</p>
<p>Quantity: ${qty}${value ? ` · est. value $${value.toFixed(2)} ex-GST` : ""}</p>
<p>Reach out to confirm the renewal and check for an upsell.</p>`,
        });
      } catch {
        /* best-effort */
      }
    }

    await payload.update({
      collection: "assets",
      id: asset.id as string,
      overrideAccess: true,
      data: { lastReminderAt: new Date(now).toISOString() },
    });

    await emitEvent("asset.renewal_due", {
      name,
      customer: customer?.id,
      renewalDate: asset.renewalDate,
      quantity: asset.quantity,
    });

    reminded += 1;
  }

  logger.info("asset reminders complete", { scanned: docs.length, reminded });
  return { scanned: docs.length, reminded };
}
