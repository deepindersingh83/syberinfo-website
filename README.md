# SyberInfo Website

Marketing & lead-generation website for **SyberInfo** — an Australian digital
agency offering web development, design, SEO, SMO and digital marketing, plus
domains, hosting and Google/Microsoft Workspace as a reseller.

## Tech stack

| Layer        | Choice                                            | Why |
|--------------|---------------------------------------------------|-----|
| Framework    | **Next.js 16 (App Router)** + React 19 + TypeScript | SSR/SSG for top-tier SEO & Core Web Vitals |
| Styling      | **Tailwind CSS v4**                               | Fast, consistent, custom design system |
| Backend      | **Next.js Route Handlers** (`/api/contact`)       | Lead capture without a separate server |
| Email        | **Resend** (optional, via env)                    | Transactional contact emails |
| Fonts        | Sora + JetBrains Mono (`next/font`)               | Self-hosted, no layout shift |
| Database     | **MySQL / MariaDB** (when needed) + Prisma        | Native to CloudPanel; Prisma supports it fully |
| Deploy       | **CloudPanel** Node.js site on your VPS           | Matches your existing hosting/control panel |

> **Hosting note:** SyberInfo runs **CloudPanel.io**, which provides MySQL/MariaDB
> (not PostgreSQL) and can serve Node.js apps behind its built-in reverse proxy.
> Deploy this app as a **Node.js site** in CloudPanel (`npm run build` then
> `npm run start`, or PM2), or use Vercel if you prefer a managed platform.

Products (domains/hosting/Workspace) are sold through the existing client
portal at **hosting.syberinfo.com.au** — the site deep-links into it rather
than rebuilding billing.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build    # production build
npm run start    # serve the production build
npm run lint     # eslint
```

## Configuration

Edit `src/lib/site.ts` for brand details, contact info, social links and
store/portal URLs. Edit `src/lib/data.ts` for services, products, stats,
process steps and testimonials.

### Contact form email

Copy `.env.example` to `.env.local` and add a `RESEND_API_KEY` to receive
enquiry emails. Without it, submissions are logged to the server console so
nothing is lost during setup.

## Project structure

```
src/
  app/
    page.tsx            # Home (hero, services, products, process, testimonials, CTA)
    services/           # Services detail page
    products/           # Web products + portal links
    about/              # About & values
    contact/            # Contact page + form
    api/contact/        # Lead capture route handler
    sitemap.ts robots.ts
  components/           # Navbar, Footer, ContactForm, Reveal, ui primitives
  lib/                  # site config + content data
```

## Suggested next steps

- Add a **blog** (MDX, or a headless CMS) to fuel content SEO.
- Wire `RESEND_API_KEY` (or your CRM webhook) for live lead delivery.
- When you need a database (e.g. quotes, blog), use **MySQL/MariaDB** via
  CloudPanel with Prisma (`provider = "mysql"`).
- Add real testimonials, case studies and an OpenGraph image.
- Deploy as a CloudPanel **Node.js site**, point `syberinfo.com.au` at it and
  enable analytics.
