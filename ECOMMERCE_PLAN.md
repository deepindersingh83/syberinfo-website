# SyberInfo E‑commerce Plan (self-hosted, Payload)

This is the roadmap for turning the current Payload-powered site into a full
self-hosted online store, without changing stacks. Everything stays in the one
Next.js + Payload app on your CloudPanel VPS.

> **Note on the existing portal:** domains, hosting and Google/Microsoft
> Workspace continue to be sold and billed through your current
> `hosting.syberinfo.com.au` portal. This store is for *other* products you sell
> directly (e.g. care plans, fixed-price website packages, add-ons, physical or
> digital goods). The two coexist.

## Foundation we already have
- Payload CMS (admin, auth, REST/GraphQL) in the Next.js app — self-hosted.
- SQLite database on your server (auto-migrations on deploy; CLI now works).
- Content collections (Services, Products, Testimonials) + Homepage global.
- A polished, responsive storefront design system to build on.

## Recommended approach
Use the **official `@payloadcms/plugin-ecommerce`** (+ patterns from Payload's
e-commerce template) rather than hand-building commerce. It provides the core
primitives so ~90% of the backend is the framework's job.

## Phases

### Phase 1 — Catalogue
- Add `@payloadcms/plugin-ecommerce`.
- Collections: **Products** (variants, pricing, images, stock), **Categories**.
- Media uploads via Payload (already have `sharp`); store files on the VPS disk.
- Frontend: shop listing, category pages, product detail (reuse `/products/[slug]`
  pattern), search/filter.
- *Deliverable:* browsable catalogue managed from `/admin`.

### Phase 2 — Cart & checkout
- **Cart** (guest + logged-in), **Customers**, **Addresses**, **Orders**.
- Cart drawer + checkout flow on the storefront.
- *Deliverable:* end-to-end purchase flow (pre-payment).

### Phase 3 — Payments
- **Stripe** via Payload's payment adapter (Payment Element / hosted checkout).
- Stripe **webhooks** → set order status (paid/failed/refunded).
- Order confirmation page + email receipts (reuse Resend from the contact form).
- *Deliverable:* take real payments.
- > Stripe is the payment *processor* (PCI-compliant, hosted) — your data and
  > store still live on your server. Self-hosting card processing yourself is
  > neither practical nor compliant.

### Phase 4 — Operations
- Discount/coupon codes, shipping rules/zones, tax (GST) settings.
- Inventory management and low-stock handling.
- Admin order management (fulfil, refund, notes), customer accounts/order history.
- *Deliverable:* day-to-day store operations.

### Phase 5 — Growth & hardening
- Analytics & conversion tracking; abandoned-cart emails.
- SEO for product/category pages (structured data: `Product`, `Offer`).
- **Database:** evaluate moving from SQLite → **PostgreSQL** on the VPS before
  high order volume (better concurrency for checkout). Payload supports both;
  it's a config + migration change, not a rewrite.
- Backups: automated dumps of the DB + uploaded media off-server.

## Infrastructure notes (CloudPanel)
- Runs as the same Node app behind nginx (see `DEPLOY.md`); no new service to
  host for Phases 1–4.
- Media: served from the app/disk now; can move to S3-compatible storage later
  via Payload's cloud-storage plugin if volume grows.
- Stripe needs a public **webhook URL** (`https://syberinfo.com.au/api/...`) —
  already covered by your domain + SSL.

## What I need from you to start Phase 1
1. Confirm the product types you'll sell directly here (vs. via the portal).
2. A Stripe account (for Phase 3) — test keys are fine to begin.
3. Whether products are physical (need shipping) or digital/services.
