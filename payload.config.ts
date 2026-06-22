import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import sharp from "sharp";

import { migrations } from "./src/migrations";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const ACCENTS = [
  "from-cyan-glow to-violet-glow",
  "from-violet-glow to-pink-glow",
  "from-pink-glow to-cyan-glow",
  "from-cyan-glow to-pink-glow",
  "from-violet-glow to-cyan-glow",
] as const;

// Kept in sync with PLAN_CATEGORIES in src/lib/data.ts (defined locally so the
// Payload CLI doesn't need to resolve app source when loading this config).
const PLAN_CATEGORIES = [
  "Google Workspace",
  "Microsoft 365",
  "Website Packages",
  "Marketing & SEO",
] as const;

export default buildConfig({
  admin: {
    user: "users",
    meta: {
      titleSuffix: "· SyberInfo Admin",
    },
  },
  secret: process.env.PAYLOAD_SECRET || "CHANGE_ME_IN_PRODUCTION",
  typescript: {
    outputFile: path.resolve(dirname, "src/payload-types.ts"),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || "file:./syberinfo.db",
    },
    migrationDir: path.resolve(dirname, "src/migrations"),
    // In development Payload auto-pushes the schema. In production these
    // bundled migrations run automatically on startup, so the database is
    // ready with no manual migrate step on deploy. After changing
    // collections/fields, regenerate with `npm run payload migrate:create`
    // and commit the new files in src/migrations (see DEPLOY.md).
    prodMigrations: migrations,
  }),
  sharp,
  collections: [
    {
      slug: "users",
      auth: true,
      admin: { useAsTitle: "email", group: "Settings" },
      fields: [
        { name: "name", type: "text" },
      ],
    },
    {
      slug: "services",
      admin: {
        useAsTitle: "title",
        defaultColumns: ["title", "tagline", "order"],
        group: "Content",
      },
      access: { read: () => true },
      defaultSort: "order",
      fields: [
        { name: "title", type: "text", required: true },
        {
          name: "slug",
          type: "text",
          required: true,
          unique: true,
          admin: { description: "URL anchor, e.g. web-development" },
        },
        { name: "tagline", type: "text" },
        {
          name: "description",
          type: "textarea",
          required: true,
          admin: { description: "Short one-liner used on cards" },
        },
        {
          name: "overview",
          type: "textarea",
          admin: { description: "Wide intro shown at the top of the service page" },
        },
        {
          name: "icon",
          type: "text",
          admin: { description: "Emoji or short glyph, e.g. </> or ✦" },
        },
        {
          name: "accent",
          type: "select",
          defaultValue: ACCENTS[0],
          options: ACCENTS.map((a) => ({ label: a, value: a })),
        },
        {
          name: "features",
          type: "array",
          fields: [{ name: "feature", type: "text", required: true }],
        },
        {
          name: "benefits",
          type: "array",
          fields: [{ name: "benefit", type: "text", required: true }],
        },
        {
          name: "sections",
          type: "array",
          admin: { description: "Detailed content blocks on the service page" },
          fields: [
            { name: "heading", type: "text", required: true },
            { name: "body", type: "textarea", required: true },
          ],
        },
        {
          name: "faqs",
          type: "array",
          fields: [
            { name: "question", type: "text", required: true },
            { name: "answer", type: "textarea", required: true },
          ],
        },
        {
          name: "pricing",
          type: "array",
          label: "Pricing table",
          admin: { description: "Optional pricing tiers shown on this service's page" },
          fields: [
            { name: "name", type: "text", required: true },
            {
              name: "price",
              type: "text",
              admin: { description: "e.g. from $990 — leave blank for 'Get a quote'" },
            },
            { name: "unit", type: "text", admin: { description: "e.g. once-off, per month" } },
            {
              name: "features",
              type: "array",
              fields: [{ name: "feature", type: "text", required: true }],
            },
            { name: "highlight", type: "checkbox", defaultValue: false },
            { name: "ctaLabel", type: "text", defaultValue: "Get a quote" },
            { name: "ctaHref", type: "text", defaultValue: "/contact" },
          ],
        },
        {
          name: "order",
          type: "number",
          defaultValue: 0,
          admin: { description: "Lower numbers show first" },
        },
      ],
    },
    {
      slug: "products",
      admin: {
        useAsTitle: "title",
        defaultColumns: ["title", "price", "highlight", "order"],
        group: "Content",
      },
      access: { read: () => true },
      defaultSort: "order",
      fields: [
        { name: "title", type: "text", required: true },
        {
          name: "slug",
          type: "text",
          required: true,
          unique: true,
          admin: { description: "URL segment, e.g. web-hosting" },
        },
        {
          name: "description",
          type: "textarea",
          required: true,
          admin: { description: "Short one-liner used on cards" },
        },
        {
          name: "overview",
          type: "textarea",
          admin: { description: "Wide intro on the product page" },
        },
        { name: "icon", type: "text" },
        {
          name: "href",
          type: "text",
          required: true,
          admin: { description: "External order link (hosting portal)" },
        },
        { name: "price", type: "text" },
        {
          name: "highlight",
          type: "checkbox",
          defaultValue: false,
          admin: { description: "Show the 'Popular' badge" },
        },
        {
          name: "bullets",
          type: "array",
          fields: [{ name: "bullet", type: "text", required: true }],
        },
        {
          name: "sections",
          type: "array",
          admin: { description: "Detailed content blocks on the product page" },
          fields: [
            { name: "heading", type: "text", required: true },
            { name: "body", type: "textarea", required: true },
          ],
        },
        {
          name: "faqs",
          type: "array",
          fields: [
            { name: "question", type: "text", required: true },
            { name: "answer", type: "textarea", required: true },
          ],
        },
        { name: "order", type: "number", defaultValue: 0 },
      ],
    },
    {
      slug: "testimonials",
      admin: {
        useAsTitle: "name",
        defaultColumns: ["name", "role", "order"],
        group: "Content",
      },
      access: { read: () => true },
      defaultSort: "order",
      fields: [
        { name: "quote", type: "textarea", required: true },
        { name: "name", type: "text", required: true },
        { name: "role", type: "text" },
        { name: "order", type: "number", defaultValue: 0 },
      ],
    },
    {
      slug: "posts",
      labels: { singular: "Post", plural: "Blog Posts" },
      admin: {
        useAsTitle: "title",
        defaultColumns: ["title", "category", "date"],
        group: "Content",
      },
      access: { read: () => true },
      defaultSort: "-date",
      fields: [
        { name: "title", type: "text", required: true },
        {
          name: "slug",
          type: "text",
          required: true,
          unique: true,
          admin: { description: "URL segment, e.g. why-website-speed-matters" },
        },
        {
          name: "excerpt",
          type: "textarea",
          required: true,
          admin: { description: "Short summary shown on cards & meta description" },
        },
        { name: "coverImage", type: "upload", relationTo: "media" },
        { name: "category", type: "text" },
        { name: "author", type: "text", defaultValue: "SyberInfo Team" },
        {
          name: "status",
          type: "select",
          defaultValue: "published",
          options: [
            { label: "Draft", value: "draft" },
            { label: "Published", value: "published" },
          ],
          admin: { description: "Drafts are hidden from the public blog" },
        },
        { name: "date", type: "date", required: true },
        {
          name: "readMins",
          type: "number",
          defaultValue: 4,
          admin: { description: "Estimated read time in minutes" },
        },
        {
          name: "body",
          type: "textarea",
          required: true,
          admin: { description: "Article body. Separate paragraphs with a blank line." },
        },
      ],
    },
    {
      slug: "leads",
      labels: { singular: "Enquiry", plural: "Enquiries" },
      admin: {
        useAsTitle: "name",
        defaultColumns: ["name", "email", "service", "status", "createdAt"],
        group: "Enquiries",
      },
      // Submitted by the public contact form; only admins can read/manage.
      access: { create: () => true },
      fields: [
        { name: "name", type: "text", required: true },
        { name: "email", type: "email", required: true },
        { name: "phone", type: "text" },
        { name: "service", type: "text" },
        { name: "message", type: "textarea", required: true },
        {
          name: "status",
          type: "select",
          defaultValue: "new",
          options: [
            { label: "New", value: "new" },
            { label: "In progress", value: "in-progress" },
            { label: "Won", value: "won" },
            { label: "Closed", value: "closed" },
          ],
        },
      ],
    },
    {
      slug: "plans",
      labels: { singular: "Plan", plural: "Pricing Plans" },
      admin: {
        useAsTitle: "name",
        defaultColumns: ["name", "category", "priceAnnual", "order"],
        group: "Content",
      },
      access: { read: () => true },
      defaultSort: "order",
      fields: [
        {
          name: "category",
          type: "select",
          required: true,
          options: PLAN_CATEGORIES.map((c) => ({ label: c, value: c })),
        },
        { name: "name", type: "text", required: true },
        { name: "blurb", type: "textarea" },
        {
          name: "priceAnnual",
          type: "text",
          admin: {
            description:
              "AUD ex-GST, billed yearly (e.g. 8.40). Leave blank for 'Get a quote'.",
          },
        },
        {
          name: "priceMonthly",
          type: "text",
          admin: { description: "AUD ex-GST, flexible/monthly (e.g. 10.10)." },
        },
        {
          name: "unit",
          type: "text",
          admin: { description: "e.g. per user / month" },
        },
        {
          name: "features",
          type: "array",
          fields: [{ name: "feature", type: "text", required: true }],
        },
        {
          name: "highlight",
          type: "checkbox",
          defaultValue: false,
          admin: { description: "Show as the featured plan" },
        },
        { name: "ctaLabel", type: "text", defaultValue: "Get a quote" },
        {
          name: "ctaHref",
          type: "text",
          defaultValue: "/contact",
          admin: { description: "Order link or /contact" },
        },
        { name: "order", type: "number", defaultValue: 0 },
      ],
    },
    {
      slug: "partners",
      labels: { singular: "Partner", plural: "Partners" },
      admin: {
        useAsTitle: "name",
        defaultColumns: ["name", "order"],
        group: "Content",
      },
      access: { read: () => true },
      defaultSort: "order",
      fields: [
        { name: "name", type: "text", required: true },
        { name: "logoMedia", type: "upload", relationTo: "media" },
        {
          name: "logo",
          type: "text",
          admin: { description: "Or paste a logo image URL (upload above is preferred)" },
        },
        { name: "order", type: "number", defaultValue: 0 },
      ],
    },
    {
      slug: "faqs",
      labels: { singular: "FAQ", plural: "FAQs" },
      admin: {
        useAsTitle: "question",
        defaultColumns: ["question", "category", "order"],
        group: "Content",
      },
      access: { read: () => true },
      defaultSort: "order",
      fields: [
        { name: "question", type: "text", required: true },
        { name: "answer", type: "textarea", required: true },
        { name: "category", type: "text", defaultValue: "General" },
        { name: "order", type: "number", defaultValue: 0 },
      ],
    },
    {
      slug: "subscribers",
      labels: { singular: "Subscriber", plural: "Subscribers" },
      admin: {
        useAsTitle: "email",
        defaultColumns: ["email", "source", "createdAt"],
        group: "Enquiries",
      },
      access: { create: () => true },
      fields: [
        { name: "email", type: "email", required: true, unique: true },
        {
          name: "source",
          type: "text",
          admin: { description: "Where they subscribed from (footer, blog, …)" },
        },
      ],
    },
    {
      slug: "media",
      labels: { singular: "Media", plural: "Media" },
      admin: { group: "Content" },
      access: { read: () => true },
      upload: {
        // Persist uploads outside the build output in production. Set MEDIA_DIR
        // to an absolute path on the server (see DEPLOY.md) so files survive
        // redeploys.
        staticDir: process.env.MEDIA_DIR || path.resolve(dirname, "media"),
        mimeTypes: ["image/*"],
        imageSizes: [
          { name: "thumbnail", width: 400 },
          { name: "card", width: 768 },
          { name: "hero", width: 1600 },
        ],
      },
      fields: [{ name: "alt", type: "text" }],
    },
    {
      slug: "help-articles",
      labels: { singular: "Help Article", plural: "Help Centre" },
      admin: {
        useAsTitle: "title",
        defaultColumns: ["title", "category", "order"],
        group: "Content",
      },
      access: { read: () => true },
      defaultSort: "order",
      fields: [
        { name: "title", type: "text", required: true },
        { name: "slug", type: "text", required: true, unique: true },
        { name: "category", type: "text", defaultValue: "General" },
        { name: "excerpt", type: "textarea" },
        {
          name: "body",
          type: "textarea",
          required: true,
          admin: { description: "Separate paragraphs with a blank line." },
        },
        { name: "order", type: "number", defaultValue: 0 },
      ],
    },
    {
      slug: "projects",
      labels: { singular: "Project", plural: "Portfolio" },
      admin: {
        useAsTitle: "title",
        defaultColumns: ["title", "industry", "order"],
        group: "Content",
      },
      access: { read: () => true },
      defaultSort: "order",
      fields: [
        { name: "title", type: "text", required: true },
        { name: "slug", type: "text", required: true, unique: true },
        { name: "industry", type: "text" },
        {
          name: "services",
          type: "array",
          fields: [{ name: "service", type: "text", required: true }],
        },
        { name: "summary", type: "textarea" },
        { name: "beforeMedia", type: "upload", relationTo: "media" },
        { name: "afterMedia", type: "upload", relationTo: "media" },
        {
          name: "beforeImage",
          type: "text",
          admin: { description: "Or paste a 'before' image URL (upload preferred)" },
        },
        {
          name: "afterImage",
          type: "text",
          admin: { description: "Or paste an 'after' image URL (upload preferred)" },
        },
        { name: "url", type: "text", admin: { description: "Live site URL (optional)" } },
        {
          name: "results",
          type: "array",
          fields: [{ name: "result", type: "text", required: true }],
        },
        { name: "order", type: "number", defaultValue: 0 },
      ],
    },
    {
      slug: "data-requests",
      labels: { singular: "Data Request", plural: "Data Requests" },
      admin: {
        useAsTitle: "email",
        defaultColumns: ["email", "type", "status", "createdAt"],
        group: "Enquiries",
      },
      access: { create: () => true },
      fields: [
        { name: "email", type: "email", required: true },
        {
          name: "type",
          type: "select",
          required: true,
          options: [
            { label: "Access / export my data", value: "export" },
            { label: "Delete my data", value: "delete" },
          ],
        },
        { name: "details", type: "textarea" },
        {
          name: "status",
          type: "select",
          defaultValue: "new",
          options: [
            { label: "New", value: "new" },
            { label: "In progress", value: "in-progress" },
            { label: "Completed", value: "completed" },
          ],
        },
      ],
    },
  ],
  globals: [
    {
      slug: "site-content",
      label: "Homepage Content",
      admin: { group: "Content" },
      access: { read: () => true },
      fields: [
        {
          name: "stats",
          type: "array",
          label: "Stats",
          admin: { description: "Headline numbers shown on the homepage & about page" },
          fields: [
            { name: "value", type: "text", required: true },
            { name: "label", type: "text", required: true },
          ],
        },
        {
          name: "processSteps",
          type: "array",
          label: "Process steps",
          admin: { description: "The 'How we work' steps on the homepage" },
          fields: [
            { name: "title", type: "text", required: true },
            { name: "text", type: "textarea", required: true },
          ],
        },
      ],
    },
  ],
  async onInit(payload) {
    // Seed content the first time the CMS runs so the site isn't empty.
    // Loaded dynamically so the Payload CLI (migrations/types) doesn't need to
    // resolve app source when it loads this config.
    const {
      services: seedServices,
      products: seedProducts,
      testimonials: seedTestimonials,
      posts: seedPosts,
      plans: seedPlans,
      partners: seedPartners,
      generalFaqs: seedFaqs,
      helpArticles: seedHelp,
      projects: seedProjects,
      stats: seedStats,
      steps: seedSteps,
    } = await import("@/lib/data");

    const { totalDocs: serviceCount } = await payload.count({
      collection: "services",
    });
    if (serviceCount === 0) {
      for (let i = 0; i < seedServices.length; i++) {
        const s = seedServices[i];
        await payload.create({
          collection: "services",
          data: {
            title: s.title,
            slug: s.slug,
            tagline: s.tagline,
            description: s.description,
            overview: s.overview,
            icon: s.icon,
            accent: s.accent as (typeof ACCENTS)[number],
            features: s.features.map((feature) => ({ feature })),
            benefits: s.benefits.map((benefit) => ({ benefit })),
            sections: s.sections.map((sec) => ({
              heading: sec.heading,
              body: sec.body,
            })),
            faqs: s.faqs.map((f) => ({ question: f.question, answer: f.answer })),
            pricing: (s.pricing ?? []).map((pl) => ({
              name: pl.name,
              price: pl.price,
              unit: pl.unit,
              features: pl.features.map((feature) => ({ feature })),
              highlight: pl.highlight ?? false,
              ctaLabel: pl.ctaLabel,
              ctaHref: pl.ctaHref,
            })),
            order: i,
          },
        });
      }
      payload.logger.info(`Seeded ${seedServices.length} services`);
    }

    const { totalDocs: productCount } = await payload.count({
      collection: "products",
    });
    if (productCount === 0) {
      for (let i = 0; i < seedProducts.length; i++) {
        const p = seedProducts[i];
        await payload.create({
          collection: "products",
          data: {
            title: p.title,
            slug: p.slug,
            description: p.description,
            overview: p.overview,
            icon: p.icon,
            href: p.href,
            price: p.price,
            highlight: p.highlight ?? false,
            bullets: p.bullets.map((bullet) => ({ bullet })),
            sections: p.sections.map((sec) => ({
              heading: sec.heading,
              body: sec.body,
            })),
            faqs: p.faqs.map((f) => ({ question: f.question, answer: f.answer })),
            order: i,
          },
        });
      }
      payload.logger.info(`Seeded ${seedProducts.length} products`);
    }

    const { totalDocs: testimonialCount } = await payload.count({
      collection: "testimonials",
    });
    if (testimonialCount === 0) {
      for (let i = 0; i < seedTestimonials.length; i++) {
        const t = seedTestimonials[i];
        await payload.create({
          collection: "testimonials",
          data: { quote: t.quote, name: t.name, role: t.role, order: i },
        });
      }
      payload.logger.info(`Seeded ${seedTestimonials.length} testimonials`);
    }

    const { totalDocs: postCount } = await payload.count({ collection: "posts" });
    if (postCount === 0) {
      for (const p of seedPosts) {
        await payload.create({
          collection: "posts",
          data: {
            title: p.title,
            slug: p.slug,
            excerpt: p.excerpt,
            category: p.category,
            author: p.author,
            status: "published",
            date: p.date,
            readMins: p.readMins,
            body: p.body,
          },
        });
      }
      payload.logger.info(`Seeded ${seedPosts.length} posts`);
    }

    const { totalDocs: helpCount } = await payload.count({
      collection: "help-articles",
    });
    if (helpCount === 0) {
      for (const h of seedHelp) {
        await payload.create({
          collection: "help-articles",
          data: {
            title: h.title,
            slug: h.slug,
            category: h.category,
            excerpt: h.excerpt,
            body: h.body,
            order: h.order,
          },
        });
      }
      payload.logger.info(`Seeded ${seedHelp.length} help articles`);
    }

    const { totalDocs: projectCount } = await payload.count({
      collection: "projects",
    });
    if (projectCount === 0) {
      for (const pr of seedProjects) {
        await payload.create({
          collection: "projects",
          data: {
            title: pr.title,
            slug: pr.slug,
            industry: pr.industry,
            services: pr.services.map((service) => ({ service })),
            summary: pr.summary,
            beforeImage: pr.beforeImage,
            afterImage: pr.afterImage,
            url: pr.url,
            results: pr.results.map((result) => ({ result })),
            order: pr.order,
          },
        });
      }
      payload.logger.info(`Seeded ${seedProjects.length} projects`);
    }

    const { totalDocs: planCount } = await payload.count({ collection: "plans" });
    if (planCount === 0) {
      for (const p of seedPlans) {
        await payload.create({
          collection: "plans",
          data: {
            category: p.category as (typeof PLAN_CATEGORIES)[number],
            name: p.name,
            blurb: p.blurb,
            priceAnnual: p.priceAnnual,
            priceMonthly: p.priceMonthly,
            unit: p.unit,
            features: p.features.map((feature) => ({ feature })),
            highlight: p.highlight ?? false,
            ctaLabel: p.ctaLabel,
            ctaHref: p.ctaHref,
            order: p.order,
          },
        });
      }
      payload.logger.info(`Seeded ${seedPlans.length} pricing plans`);
    }

    const { totalDocs: partnerCount } = await payload.count({
      collection: "partners",
    });
    if (partnerCount === 0) {
      for (const p of seedPartners) {
        await payload.create({
          collection: "partners",
          data: { name: p.name, order: p.order },
        });
      }
      payload.logger.info(`Seeded ${seedPartners.length} partners`);
    }

    const { totalDocs: faqCount } = await payload.count({ collection: "faqs" });
    if (faqCount === 0) {
      for (const f of seedFaqs) {
        await payload.create({
          collection: "faqs",
          data: {
            question: f.question,
            answer: f.answer,
            category: f.category,
            order: f.order,
          },
        });
      }
      payload.logger.info(`Seeded ${seedFaqs.length} FAQs`);
    }

    // Seed the homepage content global (stats + process steps) if empty.
    const siteContent = await payload.findGlobal({ slug: "site-content" });
    if (!siteContent?.stats?.length) {
      await payload.updateGlobal({
        slug: "site-content",
        data: {
          stats: seedStats.map((s) => ({ value: s.value, label: s.label })),
          processSteps: seedSteps.map((s) => ({ title: s.title, text: s.text })),
        },
      });
      payload.logger.info("Seeded homepage content (stats & process)");
    }
  },
});
