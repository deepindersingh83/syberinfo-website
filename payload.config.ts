import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { buildConfig, type Access, type EmailAdapter } from "payload";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import sharp from "sharp";

import { migrations } from "./src/migrations";

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

export default buildConfig({
  admin: {
    user: "users",
    theme: "dark",
    components: {
      beforeDashboard: ["@/components/admin/DashboardStats#default"],
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
      access: { create: () => true, read: adminOnly, update: adminOnly, delete: adminOnly },
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
      slug: "tickets",
      labels: { singular: "Ticket", plural: "Support Tickets" },
      admin: { useAsTitle: "subject", group: "Billing", defaultColumns: ["subject", "customer", "status", "priority"] },
      access: { read: ownerAccess(), create: adminOnly, update: adminOnly, delete: adminOnly },
      fields: [
        { name: "subject", type: "text", required: true },
        { name: "customer", type: "relationship", relationTo: "customers" },
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
        {
          name: "messages",
          type: "array",
          fields: [
            { name: "author", type: "text" },
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
