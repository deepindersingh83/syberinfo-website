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
        { name: "description", type: "textarea", required: true },
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
        { name: "description", type: "textarea", required: true },
        { name: "icon", type: "text" },
        {
          name: "href",
          type: "text",
          required: true,
          admin: { description: "Link to the store / order page" },
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
  ],
  async onInit(payload) {
    // Seed content the first time the CMS runs so the site isn't empty.
    // Loaded dynamically so the Payload CLI (migrations/types) doesn't need to
    // resolve app source when it loads this config.
    const {
      services: seedServices,
      products: seedProducts,
      testimonials: seedTestimonials,
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
            icon: s.icon,
            accent: s.accent as (typeof ACCENTS)[number],
            features: s.features.map((feature) => ({ feature })),
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
            description: p.description,
            icon: p.icon,
            href: p.href,
            price: p.price,
            highlight: p.highlight ?? false,
            bullets: p.bullets.map((bullet) => ({ bullet })),
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
  },
});
