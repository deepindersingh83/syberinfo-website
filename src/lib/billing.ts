import type { Payload } from "payload";
import { logger } from "@/lib/logger";

/**
 * Recurring-billing + dunning engine. Designed to run once a day from an
 * external scheduler (cron / GitHub Action / uptime pinger) hitting
 * POST /api/admin/billing-run. Everything is idempotent so a double-run in the
 * same day does no harm.
 *
 * Three responsibilities:
 *   1. Renewal  — for each active subscription due within GEN_LEAD_DAYS, raise
 *      the next invoice and roll nextDueDate forward one cycle. Advancing the
 *      date is the idempotency key: a second run won't re-bill the same period.
 *   2. Dunning  — flip past-due invoices to "overdue" and email staged reminders
 *      (on the due date, then +3 and +7 days), tracked per-invoice so we never
 *      double-send.
 *   3. Suspend  — when an invoice is overdue by more than the billing-settings
 *      grace period, suspend the linked subscription.
 */

const GEN_LEAD_DAYS = 7; // raise the renewal invoice this many days before it's due
const REMINDER_OFFSETS = [0, 3, 7]; // days after due date to send reminder 1, 2, 3
const DAY = 24 * 60 * 60 * 1000;

type Sub = {
  id: string | number;
  label?: string;
  customer?: { id?: string | number } | string | number | null;
  status?: string;
  billingCycle?: string;
  recurringAmount?: number;
  nextDueDate?: string | null;
};
type Invoice = {
  id: string | number;
  number?: string;
  customer?: { id?: string | number; email?: string; name?: string } | string | number | null;
  subscription?: { id?: string | number } | string | number | null;
  total?: number;
  status?: string;
  dueDate?: string | null;
  remindersSent?: number;
  lastReminderAt?: string | null;
};

export type BillingRunResult = {
  invoicesRaised: number;
  markedOverdue: number;
  remindersSent: number;
  subscriptionsSuspended: number;
  errors: number;
};

const idOf = (v: unknown): string | number | undefined =>
  v && typeof v === "object" ? (v as { id?: string | number }).id : (v as string | number | undefined);

function advance(from: Date, cycle: string): Date {
  const d = new Date(from);
  const c = cycle.toLowerCase();
  if (c.includes("year") || c.includes("annual")) d.setFullYear(d.getFullYear() + 1);
  else if (c.includes("quarter")) d.setMonth(d.getMonth() + 3);
  else if (c.includes("week")) d.setDate(d.getDate() + 7);
  else d.setMonth(d.getMonth() + 1); // default monthly
  return d;
}

const aud = (n: number) =>
  new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(Number(n) || 0);

export async function runBillingCycle(payload: Payload, now = new Date()): Promise<BillingRunResult> {
  const res: BillingRunResult = {
    invoicesRaised: 0,
    markedOverdue: 0,
    remindersSent: 0,
    subscriptionsSuspended: 0,
    errors: 0,
  };

  const settings = (await payload
    .findGlobal({ slug: "billing-settings", overrideAccess: true })
    .catch(() => ({}))) as { gracePeriodDays?: number };
  const graceDays = Number(settings.gracePeriodDays ?? 7);
  const siteUrl = process.env.SITE_URL || "https://syberinfo.com.au";

  // ---- 1. Renewals -------------------------------------------------------
  const cutoff = new Date(now.getTime() + GEN_LEAD_DAYS * DAY).toISOString();
  const dueSubs = await payload.find({
    collection: "subscriptions",
    where: {
      status: { equals: "active" },
      nextDueDate: { less_than_equal: cutoff },
      recurringAmount: { greater_than: 0 },
    },
    limit: 500,
    depth: 0,
    overrideAccess: true,
  });

  for (const s of dueSubs.docs as unknown as Sub[]) {
    try {
      const customerId = idOf(s.customer);
      if (!customerId) continue;
      const dueDate = s.nextDueDate ? new Date(s.nextDueDate) : new Date(now);

      // Roll any unbilled metered usage for this subscription into the invoice.
      const usage = await payload.find({
        collection: "usage-records",
        where: { and: [{ subscription: { equals: Number(s.id) } }, { billed: { not_equals: true } }] },
        limit: 500,
        depth: 0,
        overrideAccess: true,
      });
      const usageDocs = usage.docs as unknown as { id: string | number; description?: string; quantity?: number; amount?: number }[];
      const items = [
        { description: s.label || "Subscription renewal", quantity: 1, amount: Number(s.recurringAmount) || 0 },
        ...usageDocs.map((u) => ({
          description: u.description || "Metered usage",
          quantity: Number(u.quantity) || 1,
          amount: Number(u.amount) || 0,
        })),
      ];

      const invoice = await payload.create({
        collection: "invoices",
        overrideAccess: true,
        data: {
          customer: Number(customerId),
          subscription: Number(s.id),
          items,
          status: "unpaid",
          dueDate: dueDate.toISOString(),
        },
      });

      // Mark the usage as billed against this invoice so it's never double-billed.
      for (const u of usageDocs) {
        await payload.update({
          collection: "usage-records",
          id: u.id,
          overrideAccess: true,
          data: { billed: true, billedInvoice: Number((invoice as { id: string | number }).id) },
        });
      }

      await payload.update({
        collection: "subscriptions",
        id: s.id,
        overrideAccess: true,
        data: { nextDueDate: advance(dueDate, String(s.billingCycle || "monthly")).toISOString() },
      });
      res.invoicesRaised++;
    } catch (err) {
      res.errors++;
      logger.error("billing: renewal failed", { sub: s.id, message: err instanceof Error ? err.message : String(err) });
    }
  }

  // ---- 2. Dunning: mark overdue + staged reminders -----------------------
  const openInvoices = await payload.find({
    collection: "invoices",
    where: { status: { in: ["unpaid", "overdue"] }, dueDate: { less_than_equal: now.toISOString() } },
    limit: 1000,
    depth: 1,
    overrideAccess: true,
  });

  for (const inv of openInvoices.docs as unknown as Invoice[]) {
    try {
      const due = inv.dueDate ? new Date(inv.dueDate) : null;
      if (!due) continue;
      const daysOverdue = Math.floor((now.getTime() - due.getTime()) / DAY);

      if (inv.status === "unpaid") {
        await payload.update({ collection: "invoices", id: inv.id, overrideAccess: true, data: { status: "overdue" } });
        res.markedOverdue++;
      }

      // Staged reminder: send the next one whose offset has elapsed.
      const sent = Number(inv.remindersSent) || 0;
      if (sent < REMINDER_OFFSETS.length && daysOverdue >= REMINDER_OFFSETS[sent]) {
        const cust = typeof inv.customer === "object" && inv.customer ? inv.customer : null;
        const email = cust?.email as string | undefined;
        if (email) {
          const stage = sent + 1;
          await payload.sendEmail({
            to: email,
            subject: `Reminder: invoice ${inv.number || ""} is overdue`,
            html: dunningEmail({
              name: (cust?.name as string) || "there",
              number: inv.number || "",
              amount: aud(Number(inv.total) || 0),
              daysOverdue,
              stage,
              graceDays,
              url: `${siteUrl}/portal`,
            }),
          });
        }
        await payload.update({
          collection: "invoices",
          id: inv.id,
          overrideAccess: true,
          data: { remindersSent: sent + 1, lastReminderAt: now.toISOString() },
        });
        res.remindersSent++;
      }

      // ---- 3. Suspend past the grace period ------------------------------
      if (daysOverdue > graceDays) {
        const subId = idOf(inv.subscription);
        if (subId) {
          const sub = (await payload
            .findByID({ collection: "subscriptions", id: subId, depth: 0, overrideAccess: true })
            .catch(() => null)) as Sub | null;
          if (sub && sub.status === "active") {
            await payload.update({
              collection: "subscriptions",
              id: subId,
              overrideAccess: true,
              data: { status: "suspended" },
            });
            res.subscriptionsSuspended++;
            const cust = typeof inv.customer === "object" && inv.customer ? inv.customer : null;
            if (cust?.email) {
              await payload.sendEmail({
                to: cust.email as string,
                subject: `Service suspended — invoice ${inv.number || ""} unpaid`,
                html: suspensionEmail({
                  name: (cust.name as string) || "there",
                  label: sub.label || "your service",
                  number: inv.number || "",
                  url: `${siteUrl}/portal`,
                }),
              });
            }
          }
        }
      }
    } catch (err) {
      res.errors++;
      logger.error("billing: dunning failed", { inv: inv.id, message: err instanceof Error ? err.message : String(err) });
    }
  }

  logger.info("billing run complete", { ...res });
  return res;
}

function shell(body: string): string {
  return `<div style="font-family:system-ui,Segoe UI,Arial,sans-serif;max-width:520px;margin:0 auto;color:#0a0c10">${body}<p style="margin-top:24px;color:#6b7280;font-size:13px">— SyberInfo · Managed IT, Cloud &amp; Cybersecurity</p></div>`;
}

function dunningEmail(o: {
  name: string;
  number: string;
  amount: string;
  daysOverdue: number;
  stage: number;
  graceDays: number;
  url: string;
}): string {
  const overdue = o.daysOverdue <= 0 ? "due today" : `${o.daysOverdue} day${o.daysOverdue === 1 ? "" : "s"} overdue`;
  const warn =
    o.stage >= 2
      ? `<p style="color:#b91c1c">To avoid interruption, please settle this invoice. Services may be suspended once an invoice is more than ${o.graceDays} days overdue.</p>`
      : "";
  return shell(
    `<p>Hi ${o.name},</p>
     <p>This is a friendly reminder that invoice <strong>${o.number}</strong> for <strong>${o.amount}</strong> is ${overdue}.</p>
     ${warn}
     <p><a href="${o.url}" style="display:inline-block;background:#5e5bff;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">Pay in the client portal</a></p>
     <p style="color:#6b7280;font-size:13px">If you've already paid, thank you — please disregard this notice.</p>`,
  );
}

function suspensionEmail(o: { name: string; label: string; number: string; url: string }): string {
  return shell(
    `<p>Hi ${o.name},</p>
     <p>We've had to <strong>suspend ${o.label}</strong> because invoice <strong>${o.number}</strong> remains unpaid past its grace period.</p>
     <p>Settle the invoice to have the service restored — this is usually automatic once payment is received.</p>
     <p><a href="${o.url}" style="display:inline-block;background:#5e5bff;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">Pay now to restore service</a></p>`,
  );
}
