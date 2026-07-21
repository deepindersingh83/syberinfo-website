# SyberInfo Billing & Provisioning Platform — Build Plan

Goal: a self-hosted billing, provisioning and client-management system (a custom
WHMCS replacement) built on our existing **Next.js + Payload + SQLite** stack,
running on CloudPanel. Branded, unified with the marketing site, and fully owned.

> **Reality check.** The marketing-facing parts (catalogue, dashboard UI) are
> straightforward. The hard, risky 20% is **recurring billing, payments/PCI,
> hosting provisioning and registrar integration** — that's where WHMCS earns
> its keep. We will build in phases and **keep the existing WHMCS/portal running
> in parallel** until the custom system is proven, then migrate and cut over.

## Architecture

```
Next.js app (one deploy on CloudPanel)
├─ (frontend)   marketing site (built)
├─ (portal)     authenticated customer portal  ← new
├─ (payload)    admin for staff                 ← extended
└─ /api         checkout, Stripe webhooks, cron, provisioning callbacks
Payload + SQLite  (data)        Stripe (payments)
cPanel/WHM API (hosting)        Registrar reseller API (domains)
Resend (email)                  System cron (automation)
```

Could live at `/portal` in this app now, and later move to a subdomain
(e.g. replace `hosting.syberinfo.com.au`).

## Data model (Payload collections)

- **customers** — auth-enabled (separate from staff `users`); profile, contacts, ABN.
- **catalogue** — sellable products/plans: type (hosting/domain/workspace/addon),
  billing cycles, setup fee, provisioning module, stock, pricing (reuse `plans`).
- **orders** — a purchase (one+ items); status: pending → active/cancelled.
- **services** (subscriptions) — a provisioned product instance for a customer;
  status: pending/active/suspended/terminated; next-due date, recurring amount,
  cycle, provisioning ref (cPanel username, etc.).
- **domains** — name, registrar, registered/expiry dates, auto-renew, EPP, NS.
- **invoices** — line items, GST, totals, due date, status (unpaid/paid/overdue/
  refunded/cancelled); sequential invoice number; PDF.
- **transactions** — gateway, amount, status, gateway reference.
- **tickets** — support: department, status, threaded messages.
- **coupons** — discounts.
- **settings** (global) — company legal name, ABN, address, GST rate, invoice
  numbering, grace periods, gateway/provisioning config.

## Integrations (adapters, swappable)

- **Payments — Stripe.** Payment Element / hosted fields (PCI SAQ-A: we never
  touch raw card data). Save card to Stripe Customer for off-session recurring
  charges. Webhooks drive invoice/order state.
- **Hosting — cPanel/WHM API.** create / suspend / unsuspend / terminate /
  change-package; SSO to cPanel.
- **Domains — registrar reseller API.** availability, register, renew, transfer,
  nameserver/DNS management. (Confirm which registrar you resell through.)
- **Email — Resend.** invoices, receipts, dunning, welcome, suspension notices.

## Automation (secured cron endpoints, run by CloudPanel cron)

- Generate recurring invoices N days before due date.
- Charge saved cards off-session; retry failed payments (dunning schedule).
- Auto-suspend overdue services; auto-terminate after grace.
- Domain renewal reminders; provisioning status sync.

## Phased roadmap

### Phase 0 — Foundations & data model  *(no external credentials — build first)*
Collections above + customer auth + **portal skeleton** (login, dashboard shell,
account, view services/invoices read-only) + full **staff admin** management +
settings global (GST, ABN, invoice numbering). Seed demo data.
**Deliverable:** model customers/products/orders/invoices; customers can log in.

### Phase 1 — Cart, checkout & orders  *(needs Stripe test keys)*
Cart + checkout; create order + invoice; **Stripe Payment Element**; webhook →
mark paid + activate order; save payment methods.
**Deliverable:** customers can buy and pay; invoices created.

### Phase 2 — Invoicing, GST PDFs & recurring billing
GST-compliant **invoice PDFs** (ABN, tax breakdown, sequential numbers);
subscriptions with next-due dates; cron recurring invoicing + off-session
charging; dunning (reminders/retries/overdue).
**Deliverable:** recurring billing end-to-end.

### Phase 3 — Hosting provisioning  *(needs WHM/cPanel API)*
Provisioning adapter: auto-create account on payment, suspend on overdue,
terminate after grace, package change on upgrade; cPanel SSO; status sync.
**Deliverable:** hosting auto-provisioning.

### Phase 4 — Domains  *(needs registrar reseller API)*
Live domain search on the site; register/renew/transfer; NS/DNS management;
renewal reminders.
**Deliverable:** full domain lifecycle.

### Phase 5 — Support & growth
Support tickets (departments, email piping), coupons, affiliate/referral,
reports/dashboards.

### Phase 6 — Hardening & migration
Security review + PCI posture, 2FA for portal/admin, audit logs, automated
backups, load test, **data migration from existing WHMCS**, parallel-run, cutover.

## What I'll need from you (per phase)

| Phase | Needed |
|---|---|
| 1 | Stripe test (then live) keys; GST registered? |
| 2 | Company legal name, **ABN**, address, invoice prefix/start number |
| 3 | WHM API URL + token; server hostname/package names |
| 4 | Registrar **reseller API** credentials (which registrar?) |
| 6 | Access/export from current WHMCS for data migration |

## Key risks (and how we manage them)
- **PCI / card data** → Stripe hosted fields only; never store PANs.
- **Failed provisioning / payments** → idempotent jobs, retries, rollback, alerts.
- **Tax correctness** → GST handled centrally; invoices reviewed by your accountant.
- **Security** → portal holds customer + billing data: 2FA, rate limiting,
  Turnstile, audit logs, least-privilege API tokens.
- **Maintenance burden** → you now own updates/compliance that WHMCS handled.
- **Cutover risk** → run in parallel with WHMCS; migrate when proven.
