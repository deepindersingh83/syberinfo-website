import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { buildConfig, type Access, type EmailAdapter, type Field } from "payload";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import sharp from "sharp";

import { migrations } from "./src/migrations";
import { migrations as pgMigrations } from "./src/migrations/pg";

const dirname = path.dirname(fileURLToPath(import.meta.url));

/* ---------------------------------------------------------------------------
   Access control. By default Payload allows any authenticated user, which — with
   a `customers` auth collection — would let one customer read every other
   customer's billing data via the REST/GraphQL API. These helpers lock each
   collection to admins (the `users` collection) or the owning customer only.
--------------------------------------------------------------------------- */
type AuthedUser = { collection?: string; id?: string | number } | null | undefined;
const isAdmin = (user: AuthedUser): boolean => !!user && user.collection === "users";

/** Admins only. */
const adminOnly: Access = ({ req: { user } }) => isAdmin(user as AuthedUser);

/** Admins see all; a customer sees only their own record. */
const adminOrSelf: Access = ({ req: { user } }) => {
  const u = user as AuthedUser;
  if (!u) return false;
  if (isAdmin(u)) return true;
  if (u.collection === "customers") return { id: { equals: u.id } };
  return false;
};

/** Admins see all; a customer sees only rows whose `field` relates to them. */
const ownerAccess =
  (field = "customer"): Access =>
  ({ req: { user } }) => {
    const u = user as AuthedUser;
    if (!u) return false;
    if (isAdmin(u)) return true;
    if (u.collection === "customers") return { [field]: { equals: u.id } };
    return false;
  };

/**
 * Email transport. Uses the Resend HTTP API directly (no extra dependency) so
 * Payload can send password-reset and notification emails. When RESEND_API_KEY
 * is unset, `email` is left undefined and Payload logs messages to the console.
 */
const FROM_ADDRESS = process.env.CONTACT_FROM_ADDRESS || "noreply@syberinfo.com.au";
const FROM_NAME = process.env.CONTACT_FROM_NAME || "SyberInfo";

const resendAdapter: EmailAdapter = () => ({
  name: "resend-http",
  defaultFromAddress: FROM_ADDRESS,
  defaultFromName: FROM_NAME,
  async sendEmail(message) {
    const toList = Array.isArray(message.to) ? message.to : [message.to];
    const from =
      typeof message.from === "string" && message.from
        ? message.from
        : `${FROM_NAME} <${FROM_ADDRESS}>`;
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: toList,
        subject: message.subject,
        html: message.html,
        text: message.text,
      }),
    });
    if (!res.ok) {
      throw new Error(`Resend send failed: ${res.status} ${await res.text()}`);
    }
    return res.json();
  },
});

const email = process.env.RESEND_API_KEY ? resendAdapter : undefined;

/**
 * Resolve the signing secret. A missing/default secret in production is a
 * security problem (JWTs signed with a publicly-known key), but it must NOT
 * take the whole site down. So: warn loudly and fall back to a strong random
 * per-process secret — the site stays up, the known-default key is never used,
 * and sessions simply won't persist across restarts until PAYLOAD_SECRET is set.
 */
function resolveSecret(): string {
  const provided = process.env.PAYLOAD_SECRET;
  if (provided && provided !== "CHANGE_ME_IN_PRODUCTION") return provided;
  const isProd =
    process.env.NODE_ENV === "production" &&
    process.env.NEXT_PHASE !== "phase-production-build";
  if (isProd) {
    // eslint-disable-next-line no-console
    console.error(
      "[SECURITY] PAYLOAD_SECRET is not set. Using a random per-process secret so the site stays up — set PAYLOAD_SECRET so admin/portal sessions persist and are secure.",
    );
    return crypto.randomBytes(32).toString("hex");
  }
  return "CHANGE_ME_IN_PRODUCTION"; // development default
}
const PAYLOAD_SECRET = resolveSecret();

/**
 * Select the database adapter from DATABASE_URI. A postgres:// / postgresql://
 * URL uses Postgres (recommended for production — real backups, no
 * relative-path/locking pitfalls); anything else falls back to SQLite, which
 * keeps local development zero-setup. Each adapter points at its own migration
 * directory because the generated SQL is dialect-specific.
 */
const DATABASE_URI = process.env.DATABASE_URI || "file:./syberinfo.db";
const usePostgres = /^postgres(ql)?:\/\//i.test(DATABASE_URI);
const dbAdapter = usePostgres
  ? postgresAdapter({
      pool: { connectionString: DATABASE_URI },
      migrationDir: path.resolve(dirname, "src/migrations/pg"),
      prodMigrations: pgMigrations as unknown as Parameters<typeof postgresAdapter>[0]["prodMigrations"],
    })
  : sqliteAdapter({
      client: { url: DATABASE_URI },
      migrationDir: path.resolve(dirname, "src/migrations"),
      prodMigrations: migrations,
    });

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

const trustedOrigins = [
  process.env.SITE_URL || "https://syberinfo.com.au",
  ...(process.env.NODE_ENV !== "production" ? ["http://localhost:3000"] : []),
];

/**
 * Reusable per-page SEO override group. Editors can set a custom title /
 * description / social image / canonical, or flag a page noindex. All optional
 * — pages fall back to sensible auto-generated metadata when these are blank.
 */
const seoGroup: Field = {
  name: "seo",
  type: "group",
  label: "SEO",
  admin: { description: "Optional search / social overrides. Leave blank to use the page defaults." },
  fields: [
    { name: "metaTitle", type: "text" as const, admin: { description: "Overrides the <title> (≤ 60 chars ideal)" } },
    {
      name: "metaDescription",
      type: "textarea" as const,
      admin: { description: "Overrides the meta description (≤ 155 chars ideal)" },
    },
    { name: "ogImage", type: "upload" as const, relationTo: "media", admin: { description: "Social share image (og:image)" } },
    { name: "canonical", type: "text" as const, admin: { description: "Absolute canonical URL, if different from this page" } },
    { name: "noindex", type: "checkbox" as const, defaultValue: false, admin: { description: "Hide this page from search engines" } },
  ],
};

export default buildConfig({
  admin: {
    user: "users",
    theme: "dark",
    components: {
      beforeDashboard: ["@/components/admin/DashboardStats#default", "@/components/admin/AhrefsPanel#default"],
    },
    meta: {
      titleSuffix: "· SyberInfo Admin",
    },
  },
  // Restrict cookie-based auth + API to known origins.
  cors: trustedOrigins,
  csrf: trustedOrigins,
  secret: PAYLOAD_SECRET,
  email,
  // Lexical rich-text editor (used by the optional richBody fields for
  // formatted copy + inline images). Default feature set includes uploads.
  editor: lexicalEditor(),
  typescript: {
    outputFile: path.resolve(dirname, "src/payload-types.ts"),
  },
  // Database adapter is chosen from DATABASE_URI: a postgres:// (or
  // postgresql://) URL selects Postgres; anything else (or unset) stays on
  // SQLite. Migration SQL is dialect-specific, so each adapter keeps its own
  // migration set — Postgres in src/migrations/pg, SQLite in src/migrations.
  // In development Payload auto-pushes the schema (no migration files needed);
  // in production these bundled migrations run automatically on startup.
  // After changing collections/fields, regenerate with
  // `npm run payload migrate:create` while pointed at the target database.
  db: dbAdapter,
  sharp,
  collections: [
    {
      slug: "users",
      auth: {
        maxLoginAttempts: 5,
        lockTime: 10 * 60 * 1000, // 10 minutes
        tokenExpiration: 60 * 60 * 8, // 8 hours
      },
      admin: { useAsTitle: "email", group: "Settings" },
      access: {
        read: adminOnly,
        create: adminOnly,
        update: adminOnly,
        delete: adminOnly,
      },
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
        seoGroup,
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
      // Software & cloud licence catalogue shown in the client portal.
      slug: "software",
      labels: { singular: "Software product", plural: "Software & Licences" },
      admin: {
        useAsTitle: "name",
        group: "Catalog",
        defaultColumns: ["name", "brand", "category", "active"],
      },
      access: { read: () => true, create: adminOnly, update: adminOnly, delete: adminOnly },
      fields: [
        { name: "name", type: "text", required: true, admin: { description: "e.g. Microsoft 365" } },
        { name: "brand", type: "text", admin: { description: "Vendor, e.g. Microsoft" } },
        {
          name: "category",
          type: "select",
          defaultValue: "Productivity",
          options: ["Productivity", "Creative", "Communication", "Dev Tools", "Storage", "Security", "Cloud", "Other"].map(
            (v) => ({ label: v, value: v }),
          ),
        },
        { name: "letter", type: "text", admin: { description: "1–2 char badge, e.g. M" } },
        { name: "color", type: "text", admin: { description: "Badge colour hex, e.g. #0078D4" } },
        { name: "tagline", type: "textarea" },
        { name: "active", type: "checkbox", defaultValue: true },
        { name: "order", type: "number", defaultValue: 0, admin: { description: "Lower shows first" } },
        {
          name: "plans",
          type: "array",
          label: "Licence plans",
          fields: [
            { name: "name", type: "text", required: true, admin: { description: "e.g. Business Standard" } },
            { name: "price", type: "number", admin: { description: "AUD ex-GST" } },
            { name: "unit", type: "text", defaultValue: "per user / month" },
            { name: "feature", type: "text", admin: { description: "Short inclusions line" } },
          ],
        },
        {
          name: "addons",
          type: "array",
          label: "Add-ons",
          fields: [
            { name: "name", type: "text", required: true },
            { name: "price", type: "number", admin: { description: "AUD ex-GST / month" } },
            { name: "desc", type: "text" },
          ],
        },
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
          admin: { description: "Plain-text fallback body. Separate paragraphs with a blank line." },
        },
        {
          name: "richBody",
          type: "richText",
          admin: {
            description: "Rich formatted article (headings, lists, links, inline images). When set, it replaces the plain body on the site.",
          },
        },
        seoGroup,
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
      access: { create: () => true, read: adminOnly, update: adminOnly, delete: adminOnly },
      hooks: {
        beforeChange: [
          ({ data, operation }) => {
            // Simple lead score (0–100) from the signals we have, on create.
            if (operation === "create" && (data.score == null || data.score === 0)) {
              let score = 20;
              if (data.phone && String(data.phone).replace(/\D/g, "").length >= 8) score += 20;
              if (data.service && String(data.service) !== "—") score += 20;
              const len = String(data.message || "").length;
              if (len > 240) score += 25;
              else if (len > 80) score += 15;
              const high = /security|cyber|ransom|migrat|compliance|essential eight|managed/i;
              if (high.test(String(data.message || "") + " " + String(data.service || ""))) score += 15;
              data.score = Math.min(100, score);
            }
            return data;
          },
        ],
      },
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
            { label: "Qualified", value: "qualified" },
            { label: "Proposal sent", value: "proposal" },
            { label: "Won", value: "won" },
            { label: "Lost", value: "lost" },
          ],
        },
        { name: "owner", type: "relationship", relationTo: "users", admin: { description: "Salesperson responsible" } },
        { name: "score", type: "number", admin: { description: "Auto-scored 0–100 on submit", readOnly: true } },
        { name: "value", type: "number", admin: { description: "Estimated deal value, AUD" } },
        {
          name: "attribution",
          type: "group",
          label: "Attribution",
          admin: { description: "Where this lead came from (captured automatically)" },
          fields: [
            { name: "source", type: "text", admin: { description: "utm_source" } },
            { name: "medium", type: "text", admin: { description: "utm_medium" } },
            { name: "campaign", type: "text", admin: { description: "utm_campaign" } },
            { name: "referrer", type: "text" },
            { name: "landingPage", type: "text" },
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
      access: { create: () => true, read: adminOnly, update: adminOnly, delete: adminOnly },
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
      access: { create: () => true, read: adminOnly, update: adminOnly, delete: adminOnly },
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
    // ─── Billing / provisioning platform (Phase 0 foundations) ───
    {
      slug: "customers",
      labels: { singular: "Customer", plural: "Customers" },
      auth: {
        maxLoginAttempts: 5,
        lockTime: 10 * 60 * 1000, // 10 minutes
        tokenExpiration: 60 * 60 * 24 * 7, // 7 days
        forgotPassword: {
          generateEmailSubject: () => "Reset your SyberInfo portal password",
          generateEmailHTML: (args) => {
            const token = (args as { token?: string })?.token ?? "";
            const base = process.env.SITE_URL || "https://syberinfo.com.au";
            const url = `${base}/portal/reset-password?token=${token}`;
            return `<p>Hi,</p><p>We received a request to reset your SyberInfo client portal password. Click the link below to choose a new one — it expires in one hour.</p><p><a href="${url}">Reset my password</a></p><p>If you didn't request this, you can safely ignore this email.</p><p>— SyberInfo</p>`;
          },
        },
      },
      admin: { useAsTitle: "email", group: "Billing", defaultColumns: ["email", "name", "company"] },
      access: {
        read: adminOrSelf,
        update: adminOrSelf,
        create: adminOnly, // public sign-up goes through /api/portal/register (rate-limited)
        delete: adminOnly,
      },
      hooks: {
        afterChange: [
          async ({ doc, operation, req }) => {
            // Kick off a standard onboarding checklist for every new client.
            if (operation !== "create") return;
            try {
              const existing = await req.payload.count({
                collection: "onboarding",
                where: { customer: { equals: doc.id } },
              });
              if (existing.totalDocs > 0) return;
              const STEPS = [
                "Welcome call & kickoff scheduled",
                "Documentation & asset inventory collected",
                "Monitoring & RMM agents deployed",
                "Security baseline (Essential Eight) applied",
                "Backups configured & verified",
                "Portal access & billing set up",
                "30-day review booked",
              ];
              await req.payload.create({
                collection: "onboarding",
                overrideAccess: true,
                data: {
                  customer: doc.id,
                  status: "active",
                  steps: STEPS.map((label) => ({ label, done: false })),
                },
              });
            } catch {
              /* onboarding is non-critical — never block customer creation */
            }
          },
        ],
      },
      fields: [
        { name: "name", type: "text", required: true },
        { name: "company", type: "text" },
        { name: "phone", type: "text" },
        { name: "abn", type: "text" },
        { name: "addressLine1", type: "text" },
        { name: "addressLine2", type: "text" },
        { name: "suburb", type: "text" },
        { name: "state", type: "text" },
        { name: "postcode", type: "text" },
        { name: "country", type: "text", defaultValue: "Australia" },
      ],
    },
    {
      slug: "orders",
      labels: { singular: "Order", plural: "Orders" },
      admin: { useAsTitle: "id", group: "Billing", defaultColumns: ["customer", "total", "status", "createdAt"] },
      access: { read: ownerAccess(), create: adminOnly, update: adminOnly, delete: adminOnly },
      fields: [
        { name: "customer", type: "relationship", relationTo: "customers" },
        {
          name: "items",
          type: "array",
          fields: [
            { name: "description", type: "text", required: true },
            { name: "cycle", type: "text", admin: { description: "e.g. monthly, annually, once-off" } },
            { name: "quantity", type: "number", defaultValue: 1 },
            { name: "unitPrice", type: "number", admin: { description: "ex-GST, AUD" } },
          ],
        },
        { name: "total", type: "number", admin: { description: "ex-GST, AUD" } },
        {
          name: "status",
          type: "select",
          defaultValue: "pending",
          options: ["pending", "active", "cancelled", "fraud"].map((v) => ({ label: v, value: v })),
        },
      ],
    },
    {
      slug: "subscriptions",
      labels: { singular: "Service", plural: "Services (Subscriptions)" },
      admin: { useAsTitle: "label", group: "Billing", defaultColumns: ["label", "customer", "status", "nextDueDate"] },
      access: { read: ownerAccess(), create: adminOnly, update: adminOnly, delete: adminOnly },
      hooks: {
        beforeChange: [
          ({ data, operation }) => {
            // Default the next due date from the billing cycle on create.
            if (operation === "create" && !data.nextDueDate) {
              const d = new Date();
              const cycle = String(data.billingCycle || "").toLowerCase();
              if (cycle.includes("year") || cycle.includes("annual")) d.setFullYear(d.getFullYear() + 1);
              else d.setMonth(d.getMonth() + 1);
              data.nextDueDate = d.toISOString();
            }
            return data;
          },
        ],
      },
      fields: [
        { name: "label", type: "text", required: true, admin: { description: "e.g. Web Hosting — example.com.au" } },
        { name: "customer", type: "relationship", relationTo: "customers" },
        { name: "domain", type: "text" },
        {
          name: "status",
          type: "select",
          defaultValue: "pending",
          options: ["pending", "active", "suspended", "terminated", "cancelled"].map((v) => ({ label: v, value: v })),
        },
        { name: "billingCycle", type: "text", admin: { description: "monthly, annually, …" } },
        { name: "recurringAmount", type: "number", admin: { description: "ex-GST, AUD" } },
        { name: "nextDueDate", type: "date" },
        { name: "provisioningRef", type: "text", admin: { description: "e.g. cPanel username (Phase 3)" } },
      ],
    },
    {
      slug: "invoices",
      labels: { singular: "Invoice", plural: "Invoices" },
      admin: { useAsTitle: "number", group: "Billing", defaultColumns: ["number", "customer", "total", "status", "dueDate"] },
      access: { read: ownerAccess(), create: adminOnly, update: adminOnly, delete: adminOnly },
      hooks: {
        beforeChange: [
          async ({ data, operation, req }) => {
            // Compute subtotal / GST / total from line items automatically.
            if (Array.isArray(data.items)) {
              const subtotal = (data.items as { amount?: number }[]).reduce(
                (s, it) => s + (Number(it.amount) || 0),
                0,
              );
              data.subtotal = Math.round(subtotal * 100) / 100;
              data.tax = Math.round(subtotal * 0.1 * 100) / 100; // 10% GST
              data.total = Math.round((subtotal + data.tax) * 100) / 100;
            }
            // Auto-generate a sequential invoice number on create.
            if (operation === "create" && !data.number) {
              const year = new Date().getFullYear();
              const { totalDocs } = await req.payload.count({ collection: "invoices" });
              data.number = `INV-${year}-${String(totalDocs + 1).padStart(4, "0")}`;
            }
            return data;
          },
        ],
      },
      fields: [
        { name: "number", type: "text", unique: true, admin: { description: "Auto-generated on create if left blank" } },
        { name: "customer", type: "relationship", relationTo: "customers" },
        {
          name: "subscription",
          type: "relationship",
          relationTo: "subscriptions",
          admin: { description: "Set automatically for renewal invoices; links dunning back to the service" },
        },
        {
          name: "items",
          type: "array",
          fields: [
            { name: "description", type: "text", required: true },
            { name: "quantity", type: "number", defaultValue: 1 },
            { name: "amount", type: "number", admin: { description: "ex-GST line total, AUD" } },
          ],
        },
        { name: "subtotal", type: "number" },
        { name: "tax", type: "number", admin: { description: "GST" } },
        { name: "total", type: "number" },
        {
          name: "status",
          type: "select",
          defaultValue: "unpaid",
          options: ["unpaid", "paid", "overdue", "refunded", "cancelled"].map((v) => ({ label: v, value: v })),
        },
        { name: "dueDate", type: "date" },
        { name: "paidDate", type: "date" },
        {
          name: "remindersSent",
          type: "number",
          defaultValue: 0,
          admin: { description: "Dunning reminders emailed so far", readOnly: true },
        },
        { name: "lastReminderAt", type: "date", admin: { readOnly: true } },
      ],
    },
    {
      slug: "transactions",
      labels: { singular: "Transaction", plural: "Transactions" },
      admin: { useAsTitle: "reference", group: "Billing", defaultColumns: ["reference", "customer", "amount", "status"] },
      access: { read: ownerAccess(), create: adminOnly, update: adminOnly, delete: adminOnly },
      fields: [
        { name: "reference", type: "text" },
        { name: "invoice", type: "relationship", relationTo: "invoices" },
        { name: "customer", type: "relationship", relationTo: "customers" },
        { name: "gateway", type: "text", defaultValue: "stripe" },
        { name: "amount", type: "number" },
        {
          name: "status",
          type: "select",
          defaultValue: "pending",
          options: ["pending", "succeeded", "failed", "refunded"].map((v) => ({ label: v, value: v })),
        },
      ],
    },
    {
      slug: "client-domains",
      labels: { singular: "Domain", plural: "Domains" },
      admin: { useAsTitle: "domain", group: "Billing", defaultColumns: ["domain", "customer", "expiryDate", "status"] },
      access: { read: ownerAccess(), create: adminOnly, update: adminOnly, delete: adminOnly },
      fields: [
        { name: "domain", type: "text", required: true },
        { name: "customer", type: "relationship", relationTo: "customers" },
        { name: "registrar", type: "text" },
        { name: "registeredDate", type: "date" },
        { name: "expiryDate", type: "date" },
        { name: "autoRenew", type: "checkbox", defaultValue: true },
        {
          name: "status",
          type: "select",
          defaultValue: "active",
          options: ["pending", "active", "expired", "transferred-away"].map((v) => ({ label: v, value: v })),
        },
      ],
    },
    {
      slug: "assets",
      labels: { singular: "Asset", plural: "Assets & Licenses" },
      admin: {
        useAsTitle: "name",
        group: "Billing",
        defaultColumns: ["name", "customer", "category", "renewalDate", "status"],
        description: "Hardware, software and licenses per client — with renewal dates for reminders and upsell.",
      },
      access: { read: ownerAccess(), create: adminOnly, update: adminOnly, delete: adminOnly },
      hooks: {
        beforeChange: [
          ({ data }) => {
            // Auto-derive lifecycle status from the renewal date, unless the
            // asset has been manually retired.
            if (data && data.status !== "retired" && data.renewalDate) {
              const due = new Date(data.renewalDate as string).getTime();
              const now = Date.now();
              const days = (due - now) / 86_400_000;
              data.status = days < 0 ? "expired" : days <= 30 ? "expiring" : "active";
            }
            return data;
          },
        ],
      },
      fields: [
        { name: "name", type: "text", required: true, admin: { description: "e.g. Dell Latitude 5450, Microsoft 365 Business Premium" } },
        { name: "customer", type: "relationship", relationTo: "customers", admin: { description: "The client this asset belongs to" } },
        {
          name: "category",
          type: "select",
          defaultValue: "hardware",
          options: ["hardware", "software", "license", "subscription", "other"].map((v) => ({ label: v, value: v })),
        },
        { name: "vendor", type: "text", admin: { description: "e.g. Dell, Microsoft, Adobe" } },
        { name: "identifier", type: "text", admin: { description: "Serial / asset tag / license key" } },
        { name: "quantity", type: "number", defaultValue: 1, admin: { description: "Seats / units" } },
        { name: "unitCost", type: "number", admin: { description: "ex-GST AUD per unit — used for renewal value / upsell" } },
        { name: "purchaseDate", type: "date" },
        { name: "renewalDate", type: "date", admin: { description: "Warranty end / license or subscription renewal date" } },
        {
          name: "status",
          type: "select",
          defaultValue: "active",
          admin: { description: "Auto-set from the renewal date unless 'retired'." },
          options: ["active", "expiring", "expired", "retired"].map((v) => ({ label: v, value: v })),
        },
        { name: "autoRemind", type: "checkbox", defaultValue: true, admin: { description: "Email the client before this renews" } },
        { name: "lastReminderAt", type: "date", admin: { readOnly: true, description: "Set when a renewal reminder was last sent" } },
        { name: "notes", type: "textarea" },
      ],
    },
    {
      slug: "tickets",
      labels: { singular: "Ticket", plural: "Support Tickets" },
      admin: {
        useAsTitle: "subject",
        group: "Billing",
        defaultColumns: ["subject", "customer", "status", "priority", "slaDueAt"],
      },
      access: { read: ownerAccess(), create: adminOnly, update: adminOnly, delete: adminOnly },
      hooks: {
        beforeChange: [
          ({ data, operation }) => {
            // First-response SLA target (hours) by priority.
            const SLA_HOURS: Record<string, number> = { high: 4, medium: 8, low: 24 };
            if (operation === "create") {
              const hrs = SLA_HOURS[String(data.priority || "medium")] ?? 8;
              const due = new Date();
              due.setHours(due.getHours() + hrs);
              if (!data.slaDueAt) data.slaDueAt = due.toISOString();
            }
            // Stamp first response the first time staff answers.
            if (data.status === "answered" && !data.firstRespondedAt) {
              data.firstRespondedAt = new Date().toISOString();
            }
            // Stamp resolution when closed (clear if reopened).
            if (data.status === "closed" && !data.resolvedAt) {
              data.resolvedAt = new Date().toISOString();
            } else if (data.status && data.status !== "closed") {
              data.resolvedAt = null;
            }
            return data;
          },
        ],
        afterChange: [
          async ({ doc, previousDoc, req, operation }) => {
            // Email the customer when the team adds a new staff reply.
            if (operation !== "update") return;
            const msgs = Array.isArray(doc.messages) ? doc.messages : [];
            const prevMsgs = Array.isArray(previousDoc?.messages) ? previousDoc.messages : [];
            if (msgs.length <= prevMsgs.length) return;
            const last = msgs[msgs.length - 1] as { staff?: boolean; message?: string };
            if (!last?.staff) return;
            try {
              const custRef = doc.customer;
              const cust =
                custRef && typeof custRef === "object"
                  ? custRef
                  : await req.payload.findByID({ collection: "customers", id: custRef, depth: 0, overrideAccess: true });
              const email = (cust as { email?: string })?.email;
              if (!email) return;
              const base = process.env.SITE_URL || "https://syberinfo.com.au";
              await req.payload.sendEmail({
                to: email,
                subject: `Re: ${doc.subject} — SyberInfo support`,
                html: `<p>Hi,</p><p>Our team has replied to your support ticket <strong>${doc.subject}</strong>:</p><blockquote>${String(
                  last.message || "",
                ).replace(/</g, "&lt;")}</blockquote><p><a href="${base}/portal">View &amp; reply in the client portal</a></p><p>— SyberInfo</p>`,
              });
            } catch {
              /* best-effort notification */
            }
          },
        ],
      },
      fields: [
        { name: "subject", type: "text", required: true },
        { name: "customer", type: "relationship", relationTo: "customers" },
        {
          name: "assignee",
          type: "relationship",
          relationTo: "users",
          admin: { description: "Engineer responsible for this ticket" },
        },
        {
          name: "department",
          type: "select",
          defaultValue: "support",
          options: ["support", "billing", "sales"].map((v) => ({ label: v, value: v })),
        },
        {
          name: "status",
          type: "select",
          defaultValue: "open",
          options: ["open", "answered", "customer-reply", "closed"].map((v) => ({ label: v, value: v })),
        },
        {
          name: "priority",
          type: "select",
          defaultValue: "medium",
          options: ["low", "medium", "high"].map((v) => ({ label: v, value: v })),
        },
        { name: "slaDueAt", type: "date", admin: { description: "First-response SLA deadline", readOnly: true } },
        { name: "firstRespondedAt", type: "date", admin: { readOnly: true } },
        { name: "resolvedAt", type: "date", admin: { readOnly: true } },
        {
          name: "messages",
          type: "array",
          fields: [
            { name: "author", type: "text" },
            { name: "staff", type: "checkbox", defaultValue: false, admin: { description: "Was this reply from our team?" } },
            { name: "message", type: "textarea", required: true },
          ],
        },
      ],
    },
    {
      slug: "coupons",
      labels: { singular: "Coupon", plural: "Coupons" },
      admin: { useAsTitle: "code", group: "Billing", defaultColumns: ["code", "type", "value", "active"] },
      access: { read: adminOnly, create: adminOnly, update: adminOnly, delete: adminOnly },
      fields: [
        { name: "code", type: "text", required: true, unique: true },
        {
          name: "type",
          type: "select",
          defaultValue: "percent",
          options: [
            { label: "Percentage", value: "percent" },
            { label: "Fixed amount", value: "fixed" },
          ],
        },
        { name: "value", type: "number", required: true },
        { name: "active", type: "checkbox", defaultValue: true },
      ],
    },
    {
      slug: "legal-pages",
      labels: { singular: "Legal Page", plural: "Legal Pages" },
      admin: {
        useAsTitle: "title",
        group: "Content",
        defaultColumns: ["title", "slug", "updatedAt"],
        description: "Privacy, Terms, etc. Fill the body to override the built-in page text.",
      },
      access: { read: () => true, create: adminOnly, update: adminOnly, delete: adminOnly },
      fields: [
        { name: "title", type: "text", required: true },
        {
          name: "slug",
          type: "text",
          required: true,
          unique: true,
          admin: { description: "Must match the page path: privacy, terms, acceptable-use, or refund-policy" },
        },
        {
          name: "body",
          type: "richText",
          admin: { description: "Rich text. When set, it replaces the built-in page content." },
        },
      ],
    },
    {
      slug: "case-studies",
      labels: { singular: "Case Study", plural: "Case Studies" },
      admin: {
        useAsTitle: "title",
        group: "Content",
        defaultColumns: ["title", "slug", "order"],
      },
      access: { read: () => true, create: adminOnly, update: adminOnly, delete: adminOnly },
      defaultSort: "order",
      fields: [
        { name: "title", type: "text", required: true },
        { name: "slug", type: "text", required: true, unique: true, admin: { description: "URL segment, e.g. clinic" } },
        { name: "summary", type: "textarea", required: true, admin: { description: "Short card summary" } },
        { name: "tags", type: "array", fields: [{ name: "tag", type: "text", required: true }] },
        { name: "mark", type: "text", admin: { description: "Glyph shown on the card, e.g. + or ⚿" } },
        { name: "gradient", type: "text", admin: { description: "CSS gradient for the card, e.g. linear-gradient(135deg,#3F3DCC,#5E5BFF)" } },
        {
          name: "metrics",
          type: "array",
          admin: { description: "Headline result numbers" },
          fields: [
            { name: "k", type: "text", required: true, admin: { description: "Value, e.g. 0 hrs" } },
            { name: "v", type: "text", required: true, admin: { description: "Label, e.g. Downtime" } },
          ],
        },
        {
          name: "sections",
          type: "array",
          admin: { description: "The Challenge / What we did / The outcome blocks" },
          fields: [
            { name: "head", type: "text", required: true },
            { name: "body", type: "textarea", required: true },
          ],
        },
        { name: "quote", type: "textarea", admin: { description: "Client testimonial quote" } },
        { name: "author", type: "text" },
        { name: "authorRole", type: "text" },
        { name: "authorInitials", type: "text" },
        { name: "order", type: "number", defaultValue: 0, admin: { description: "Lower numbers show first" } },
        seoGroup,
      ],
    },
    {
      slug: "quotes",
      labels: { singular: "Quote", plural: "Quotes / Proposals" },
      admin: {
        useAsTitle: "number",
        group: "Billing",
        defaultColumns: ["number", "prospectName", "total", "status", "validUntil"],
      },
      access: { read: adminOnly, create: adminOnly, update: adminOnly, delete: adminOnly },
      hooks: {
        beforeChange: [
          async ({ data, operation, req }) => {
            if (Array.isArray(data.items)) {
              const subtotal = (data.items as { quantity?: number; unitPrice?: number }[]).reduce(
                (s, it) => s + (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0),
                0,
              );
              data.subtotal = Math.round(subtotal * 100) / 100;
              data.tax = Math.round(subtotal * 0.1 * 100) / 100;
              data.total = Math.round((subtotal + data.tax) * 100) / 100;
            }
            if (operation === "create") {
              if (!data.number) {
                const year = new Date().getFullYear();
                const { totalDocs } = await req.payload.count({ collection: "quotes" });
                data.number = `QUO-${year}-${String(totalDocs + 1).padStart(4, "0")}`;
              }
              if (!data.acceptToken) data.acceptToken = crypto.randomBytes(24).toString("hex");
              if (!data.validUntil) {
                const d = new Date();
                d.setDate(d.getDate() + 30);
                data.validUntil = d.toISOString();
              }
            }
            if (data.status === "accepted" && !data.acceptedAt) data.acceptedAt = new Date().toISOString();
            return data;
          },
        ],
      },
      fields: [
        { name: "number", type: "text", unique: true, admin: { description: "Auto-generated" } },
        { name: "prospectName", type: "text", required: true },
        { name: "prospectEmail", type: "email", required: true },
        { name: "customer", type: "relationship", relationTo: "customers", admin: { description: "Link once they're a client" } },
        { name: "title", type: "text", defaultValue: "Proposal", admin: { description: "e.g. Managed IT proposal" } },
        { name: "intro", type: "textarea", admin: { description: "Optional summary shown above the line items" } },
        {
          name: "items",
          type: "array",
          fields: [
            { name: "description", type: "text", required: true },
            { name: "quantity", type: "number", defaultValue: 1 },
            { name: "unitPrice", type: "number", admin: { description: "ex-GST, AUD" } },
          ],
        },
        { name: "subtotal", type: "number", admin: { readOnly: true } },
        { name: "tax", type: "number", admin: { readOnly: true, description: "GST" } },
        { name: "total", type: "number", admin: { readOnly: true } },
        {
          name: "status",
          type: "select",
          defaultValue: "draft",
          options: ["draft", "sent", "accepted", "declined", "expired"].map((v) => ({ label: v, value: v })),
        },
        { name: "validUntil", type: "date" },
        { name: "acceptToken", type: "text", unique: true, admin: { readOnly: true, description: "Used in the public accept link" } },
        { name: "acceptedAt", type: "date", admin: { readOnly: true } },
        { name: "paidAt", type: "date", admin: { readOnly: true, description: "Set when the prospect pays online via Stripe" } },
      ],
    },
    {
      slug: "system-components",
      labels: { singular: "System Component", plural: "Status — Components" },
      admin: {
        useAsTitle: "name",
        group: "Content",
        defaultColumns: ["name", "status", "order"],
        description: "Services shown on the public status page.",
      },
      access: { read: () => true, create: adminOnly, update: adminOnly, delete: adminOnly },
      defaultSort: "order",
      fields: [
        { name: "name", type: "text", required: true },
        { name: "description", type: "text" },
        {
          name: "status",
          type: "select",
          defaultValue: "operational",
          options: [
            { label: "Operational", value: "operational" },
            { label: "Degraded performance", value: "degraded" },
            { label: "Partial outage", value: "partial" },
            { label: "Major outage", value: "major" },
            { label: "Maintenance", value: "maintenance" },
          ],
        },
        { name: "order", type: "number", defaultValue: 0 },
      ],
    },
    {
      slug: "incidents",
      labels: { singular: "Incident", plural: "Status — Incidents" },
      admin: {
        useAsTitle: "title",
        group: "Content",
        defaultColumns: ["title", "severity", "status", "startedAt"],
        description: "Incidents & maintenance shown on the public status page.",
      },
      access: { read: () => true, create: adminOnly, update: adminOnly, delete: adminOnly },
      defaultSort: "-startedAt",
      hooks: {
        beforeChange: [
          ({ data, operation }) => {
            if (operation === "create" && !data.startedAt) data.startedAt = new Date().toISOString();
            if (data.status === "resolved" && !data.resolvedAt) data.resolvedAt = new Date().toISOString();
            if (data.status && data.status !== "resolved") data.resolvedAt = null;
            return data;
          },
        ],
        afterChange: [
          async ({ doc, previousDoc, operation, req }) => {
            // Email status subscribers on a new incident or a status change.
            const statusChanged = operation === "create" || previousDoc?.status !== doc.status;
            if (!statusChanged) return;
            try {
              const subs = await req.payload.find({
                collection: "status-subscribers",
                where: { confirmed: { not_equals: false } },
                limit: 5000,
                depth: 0,
                overrideAccess: true,
              });
              if (!subs.docs.length) return;
              const base = process.env.SITE_URL || "https://syberinfo.com.au";
              const verb = operation === "create" ? "New" : "Update";
              const latest = Array.isArray(doc.updates) && doc.updates.length
                ? (doc.updates[doc.updates.length - 1] as { body?: string }).body
                : "";
              for (const sub of subs.docs as { email?: string; token?: string }[]) {
                if (!sub.email) continue;
                await req.payload.sendEmail({
                  to: sub.email,
                  subject: `[SyberInfo status] ${verb}: ${doc.title} — ${doc.status}`,
                  html: `<p><strong>${doc.title}</strong></p><p>Severity: ${doc.severity} · Status: <strong>${doc.status}</strong></p>${
                    latest ? `<p>${String(latest).replace(/</g, "&lt;")}</p>` : ""
                  }<p><a href="${base}/status">View the status page</a></p><p style="color:#888;font-size:12px"><a href="${base}/api/status/unsubscribe?token=${sub.token || ""}">Unsubscribe</a></p>`,
                });
              }
            } catch {
              /* notifications are best-effort */
            }
          },
        ],
      },
      fields: [
        { name: "title", type: "text", required: true },
        {
          name: "severity",
          type: "select",
          defaultValue: "minor",
          options: [
            { label: "Maintenance", value: "maintenance" },
            { label: "Minor", value: "minor" },
            { label: "Major", value: "major" },
            { label: "Critical", value: "critical" },
          ],
        },
        {
          name: "status",
          type: "select",
          defaultValue: "investigating",
          options: [
            { label: "Investigating", value: "investigating" },
            { label: "Identified", value: "identified" },
            { label: "Monitoring", value: "monitoring" },
            { label: "Resolved", value: "resolved" },
          ],
        },
        {
          name: "affected",
          type: "relationship",
          relationTo: "system-components",
          hasMany: true,
          admin: { description: "Components affected by this incident" },
        },
        {
          name: "updates",
          type: "array",
          admin: { description: "Timeline of updates, newest last" },
          fields: [
            {
              name: "status",
              type: "select",
              defaultValue: "investigating",
              options: ["investigating", "identified", "monitoring", "resolved"].map((v) => ({ label: v, value: v })),
            },
            { name: "body", type: "textarea", required: true },
            { name: "at", type: "date", admin: { description: "Defaults to now if blank" } },
          ],
        },
        { name: "startedAt", type: "date", admin: { readOnly: true } },
        { name: "resolvedAt", type: "date", admin: { readOnly: true } },
      ],
    },
    {
      slug: "onboarding",
      labels: { singular: "Onboarding", plural: "Onboarding" },
      admin: {
        useAsTitle: "id",
        group: "Billing",
        defaultColumns: ["customer", "status", "updatedAt"],
        description: "New-client onboarding checklists. Auto-created when a customer is added.",
      },
      access: { read: ownerAccess(), create: adminOnly, update: adminOnly, delete: adminOnly },
      fields: [
        { name: "customer", type: "relationship", relationTo: "customers" },
        {
          name: "status",
          type: "select",
          defaultValue: "active",
          options: ["active", "complete"].map((v) => ({ label: v, value: v })),
        },
        {
          name: "steps",
          type: "array",
          fields: [
            { name: "label", type: "text", required: true },
            { name: "done", type: "checkbox", defaultValue: false },
            { name: "note", type: "text" },
          ],
        },
      ],
    },
    {
      slug: "status-subscribers",
      labels: { singular: "Status Subscriber", plural: "Status — Subscribers" },
      admin: {
        useAsTitle: "email",
        group: "Content",
        defaultColumns: ["email", "confirmed", "createdAt"],
        description: "People subscribed to incident/maintenance email alerts.",
      },
      // Public create goes through the rate-limited /api/status/subscribe route.
      access: { read: adminOnly, create: adminOnly, update: adminOnly, delete: adminOnly },
      fields: [
        { name: "email", type: "email", required: true, unique: true },
        { name: "confirmed", type: "checkbox", defaultValue: true },
        { name: "token", type: "text", admin: { readOnly: true, description: "Unsubscribe token" } },
      ],
    },
    {
      slug: "redirects",
      labels: { singular: "Redirect", plural: "Redirects" },
      admin: {
        useAsTitle: "from",
        group: "Content",
        defaultColumns: ["from", "to", "permanent", "active"],
        description: "301/302 redirects enforced site-wide. Protects SEO when URLs change.",
      },
      access: { read: () => true, create: adminOnly, update: adminOnly, delete: adminOnly },
      fields: [
        {
          name: "from",
          type: "text",
          required: true,
          unique: true,
          admin: { description: "Source path, e.g. /old-page (leading slash, no domain)" },
        },
        {
          name: "to",
          type: "text",
          required: true,
          admin: { description: "Target path or absolute URL, e.g. /new-page or https://…" },
        },
        {
          name: "permanent",
          type: "checkbox",
          defaultValue: true,
          admin: { description: "On = 301 (permanent). Off = 302 (temporary)." },
        },
        { name: "active", type: "checkbox", defaultValue: true },
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
        {
          name: "hero",
          type: "group",
          label: "Hero",
          admin: { description: "The top section of the homepage. Blank fields use the built-in defaults." },
          fields: [
            { name: "eyebrow", type: "text", admin: { description: "Small pill above the heading, e.g. 'Now onboarding new clients · 2026'" } },
            { name: "heading", type: "text", admin: { description: "Main H1. Plain text — overrides the styled default when set." } },
            { name: "subheading", type: "textarea" },
            { name: "ctaPrimaryLabel", type: "text" },
            { name: "ctaPrimaryHref", type: "text" },
            { name: "ctaSecondaryLabel", type: "text" },
            { name: "ctaSecondaryHref", type: "text" },
          ],
        },
        {
          name: "closingCta",
          type: "group",
          label: "Closing call-to-action",
          admin: { description: "The big indigo call-to-action band near the bottom of the homepage." },
          fields: [
            { name: "heading", type: "text" },
            { name: "subheading", type: "textarea" },
            { name: "buttonLabel", type: "text" },
            { name: "buttonHref", type: "text" },
          ],
        },
      ],
    },
    {
      slug: "page-content",
      label: "Page Headers",
      admin: { group: "Content", description: "Eyebrow / heading / subheading for the top of each marketing page." },
      access: { read: () => true, update: adminOnly },
      fields: [
        {
          name: "headers",
          type: "array",
          admin: { description: "One row per page. 'page' must match the page key (about, careers, services, pricing)." },
          fields: [
            { name: "page", type: "text", required: true, admin: { description: "Page key: about, careers, services, pricing" } },
            { name: "eyebrow", type: "text", admin: { description: "Small label above the heading" } },
            { name: "heading", type: "text", admin: { description: "Plain text; overrides the styled default when set" } },
            { name: "subheading", type: "textarea" },
          ],
        },
        {
          name: "contact",
          type: "group",
          label: "Contact page",
          admin: { description: "Copy on the /contact page. Phone & email come from Site Settings." },
          fields: [
            { name: "eyebrow", type: "text", admin: { description: "Small label above the heading" } },
            { name: "heading", type: "text", admin: { description: "Main heading" } },
            { name: "subheading", type: "textarea", admin: { description: "Lead paragraph under the heading" } },
          ],
        },
        {
          name: "about",
          type: "group",
          label: "About page body",
          admin: { description: "Body copy on the /about page (below the header)." },
          fields: [
            {
              name: "intro",
              type: "array",
              label: "Intro paragraphs",
              admin: { description: "One or more paragraphs of intro copy." },
              fields: [{ name: "text", type: "textarea", required: true }],
            },
            { name: "valuesHeading", type: "text", admin: { description: "Heading above the values grid" } },
            { name: "timelineHeading", type: "text", admin: { description: "Heading above the timeline" } },
            {
              name: "timeline",
              type: "array",
              label: "Timeline",
              admin: { description: "Milestones shown in 'The story so far'." },
              fields: [
                { name: "year", type: "text", required: true },
                { name: "text", type: "textarea", required: true },
              ],
            },
          ],
        },
      ],
    },
    {
      slug: "site-settings",
      label: "Site Settings",
      admin: { group: "Content", description: "Brand, contact details, socials and footer — used site-wide." },
      access: { read: () => true, update: adminOnly },
      fields: [
        {
          type: "collapsible",
          label: "Brand",
          fields: [
            { name: "name", type: "text", admin: { description: "e.g. SyberInfo" } },
            { name: "legalName", type: "text", admin: { description: "e.g. SyberInfo Pty Ltd" } },
            { name: "tagline", type: "text" },
            { name: "description", type: "textarea", admin: { description: "Default meta description / brand blurb" } },
          ],
        },
        {
          type: "collapsible",
          label: "Contact",
          fields: [
            { name: "email", type: "email" },
            { name: "phone", type: "text", admin: { description: "Display phone, e.g. 1300 000 000" } },
            { name: "phoneIntl", type: "text", admin: { description: "International format for tel: links, e.g. +61300000000" } },
            { name: "address", type: "text" },
            { name: "abn", type: "text" },
            { name: "hours", type: "text", admin: { description: "e.g. Mon–Fri 8am–6pm AEST" } },
            { name: "whatsapp", type: "text", admin: { description: "WhatsApp number, digits only; blank hides the button" } },
          ],
        },
        {
          name: "social",
          type: "group",
          label: "Social links",
          fields: [
            { name: "linkedin", type: "text" },
            { name: "twitter", type: "text", label: "X / Twitter" },
            { name: "github", type: "text" },
            { name: "facebook", type: "text" },
            { name: "instagram", type: "text" },
          ],
        },
        {
          name: "footerColumns",
          type: "array",
          label: "Footer columns",
          admin: { description: "Footer link columns. Leave empty to use the built-in defaults." },
          fields: [
            { name: "heading", type: "text", required: true },
            {
              name: "links",
              type: "array",
              fields: [
                { name: "label", type: "text", required: true },
                { name: "href", type: "text", required: true },
              ],
            },
          ],
        },
      ],
    },
    {
      slug: "billing-settings",
      label: "Billing Settings",
      admin: { group: "Billing" },
      access: { read: adminOnly, update: adminOnly },
      fields: [
        { name: "companyLegalName", type: "text", defaultValue: "SyberInfo" },
        { name: "abn", type: "text" },
        { name: "addressLines", type: "textarea" },
        { name: "gstRate", type: "number", defaultValue: 10, admin: { description: "GST percentage" } },
        { name: "gstRegistered", type: "checkbox", defaultValue: true },
        { name: "invoicePrefix", type: "text", defaultValue: "INV-" },
        { name: "invoiceNextNumber", type: "number", defaultValue: 1000 },
        { name: "gracePeriodDays", type: "number", defaultValue: 7, admin: { description: "Days overdue before suspension" } },
      ],
    },
  ],
  async onInit(payload) {
    // Seed content the first time the CMS runs so the site isn't empty.
    // Loaded dynamically so the Payload CLI (migrations/types) doesn't need to
    // resolve app source when it loads this config.
    const {
      products: seedProducts,
      plans: seedPlans,
      generalFaqs: seedFaqs,
      helpArticles: seedHelp,
      steps: seedSteps,
    } = await import("@/lib/data");
    // Managed-IT content is the source of truth for these collections.
    const {
      services: seedServices,
      testimonials: seedTestimonials,
      posts: seedPosts,
      partners: seedPartners,
      projects: seedProjects,
      stats: seedStats,
      caseStudies: seedCaseStudies,
    } = await import("@/lib/it-data");
    const { software: seedSoftware } = await import("@/lib/portal-data");

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
            accent: ACCENTS[0],
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

    const { totalDocs: caseStudyCount } = await payload.count({ collection: "case-studies" });
    if (caseStudyCount === 0) {
      for (let i = 0; i < seedCaseStudies.length; i++) {
        const c = seedCaseStudies[i];
        await payload.create({
          collection: "case-studies",
          data: {
            title: c.title,
            slug: c.slug,
            summary: c.summary,
            mark: c.mark,
            gradient: c.gradient,
            tags: c.tags.map((tag) => ({ tag })),
            metrics: c.metrics.map((m) => ({ k: m.k, v: m.v })),
            sections: c.sections.map((s) => ({ head: s.head, body: s.body })),
            quote: c.quote,
            author: c.author,
            authorRole: c.authorRole,
            authorInitials: c.authorInitials,
            order: i,
          },
        });
      }
      payload.logger.info(`Seeded ${seedCaseStudies.length} case studies`);
    }

    const { totalDocs: legalCount } = await payload.count({ collection: "legal-pages" });
    if (legalCount === 0) {
      const legalSeeds = [
        { title: "Privacy Policy", slug: "privacy" },
        { title: "Terms of Service", slug: "terms" },
        { title: "Acceptable Use Policy", slug: "acceptable-use" },
        { title: "Refund Policy", slug: "refund-policy" },
      ];
      for (const l of legalSeeds) {
        await payload.create({ collection: "legal-pages", data: { title: l.title, slug: l.slug } });
      }
      payload.logger.info("Seeded legal page placeholders (fill body to override built-in text)");
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

    const { totalDocs: softwareCount } = await payload.count({ collection: "software" });
    if (softwareCount === 0) {
      for (let i = 0; i < seedSoftware.length; i++) {
        const w = seedSoftware[i];
        await payload.create({
          collection: "software",
          data: {
            name: w.name,
            brand: w.brand,
            category: w.category as
              | "Productivity" | "Creative" | "Communication" | "Dev Tools" | "Storage" | "Security" | "Cloud" | "Other",
            letter: w.letter,
            color: w.color,
            tagline: w.tagline,
            active: true,
            order: i,
            plans: w.plans.map((p) => ({ name: p.name, price: p.priceNum, unit: "per user / month", feature: p.feat })),
            addons: (w.addons || []).map((a) => ({ name: a.name, price: a.priceNum, desc: a.desc })),
          },
        });
      }
      payload.logger.info(`Seeded ${seedSoftware.length} software products`);
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

    // Top-up seed: create any bundled help article whose slug isn't already in
    // the CMS. Runs every boot but only inserts missing ones, so existing
    // installs pick up newly-added articles without touching edited ones.
    {
      let added = 0;
      for (const h of seedHelp) {
        const { totalDocs } = await payload.count({
          collection: "help-articles",
          where: { slug: { equals: h.slug } },
        });
        if (totalDocs === 0) {
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
          added += 1;
        }
      }
      if (added) payload.logger.info(`Seeded ${added} new help articles`);
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

    // Seed Site Settings from the bundled brand defaults on first run so
    // editors see the current phone/email/etc. to edit (blank fields fall back
    // to these same defaults anyway).
    const settings = (await payload.findGlobal({ slug: "site-settings" })) as { email?: string };
    if (!settings?.email) {
      const { site: seedSite, footerCols: seedFooter } = await import("@/lib/site");
      await payload.updateGlobal({
        slug: "site-settings",
        data: {
          name: seedSite.name,
          legalName: seedSite.legalName,
          tagline: seedSite.tagline,
          description: seedSite.description,
          email: seedSite.email,
          phone: seedSite.phone,
          phoneIntl: seedSite.phoneIntl,
          address: seedSite.address,
          abn: seedSite.abn,
          whatsapp: seedSite.whatsapp,
          social: {
            linkedin: seedSite.social.linkedin,
            twitter: seedSite.social.twitter,
            github: seedSite.social.github,
          },
          footerColumns: seedFooter.map((c) => ({
            heading: c.head,
            links: c.links.map((l) => ({ label: l.label, href: l.href })),
          })),
        },
      });
      payload.logger.info("Seeded site settings (brand, contact, social, footer)");
    }

    // Optional demo billing data for previewing the customer portal.
    // Enable with SEED_DEMO=true (never in production with real data).
    if (process.env.SEED_DEMO === "true") {
      const { totalDocs } = await payload.count({ collection: "customers" });
      if (totalDocs === 0) {
        const days = (n: number) =>
          new Date(Date.now() + n * 86_400_000).toISOString();
        const cust = await payload.create({
          collection: "customers",
          data: {
            email: "demo@syberinfo.com",
            password: "Password123!",
            name: "Demo Customer",
            company: "Demo Pty Ltd",
            abn: "12 345 678 901",
            phone: "+61 400 000 000",
          },
        });
        await payload.create({
          collection: "subscriptions",
          data: {
            label: "Web Hosting — demo.com.au",
            customer: cust.id,
            domain: "demo.com.au",
            status: "active",
            billingCycle: "annually",
            recurringAmount: 99,
            nextDueDate: days(200),
          },
        });
        await payload.create({
          collection: "client-domains",
          data: {
            domain: "demo.com.au",
            customer: cust.id,
            registrar: "SyberInfo",
            registeredDate: days(-160),
            expiryDate: days(205),
            autoRenew: true,
            status: "active",
          },
        });
        await payload.create({
          collection: "invoices",
          data: {
            number: "INV-1001",
            customer: cust.id,
            items: [{ description: "Web Hosting — annually", quantity: 1, amount: 99 }],
            subtotal: 99,
            tax: 9.9,
            total: 108.9,
            status: "unpaid",
            dueDate: days(14),
          },
        });
        payload.logger.info("Seeded demo customer (demo@syberinfo.com / Password123!)");
      }
    }
  },
});
