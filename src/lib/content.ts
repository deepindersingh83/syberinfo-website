import { getPayload } from "payload";
import config from "@payload-config";
import {
  services as fallbackServices,
  products as fallbackProducts,
  testimonials as fallbackTestimonials,
  posts as fallbackPosts,
  plans as fallbackPlans,
  partners as fallbackPartners,
  generalFaqs as fallbackFaqs,
  helpArticles as fallbackHelp,
  projects as fallbackProjects,
  stats as fallbackStats,
  steps as fallbackSteps,
  type Service,
  type Product,
  type Post,
  type Plan,
  type Partner,
  type Faq,
  type HelpArticle,
  type Project,
} from "./data";

type Testimonial = { quote: string; name: string; role: string };
type Stat = { value: string; label: string };
type Step = { n: string; title: string; text: string };

/**
 * Content accessors. Each reads from the Payload CMS and transparently falls
 * back to the static seed data if the CMS/DB isn't available (e.g. before the
 * first run) or returns nothing. This keeps the marketing site resilient.
 */

async function tryPayload<T>(fn: (payload: Awaited<ReturnType<typeof getPayload>>) => Promise<T>, fallback: T): Promise<T> {
  try {
    const payload = await getPayload({ config });
    return await fn(payload);
  } catch {
    return fallback;
  }
}

function mapService(d: unknown): Service {
  const doc = d as Record<string, unknown>;
  return {
    slug: String(doc.slug ?? ""),
    title: String(doc.title ?? ""),
    tagline: String(doc.tagline ?? ""),
    description: String(doc.description ?? ""),
    overview: String(doc.overview ?? ""),
    icon: String(doc.icon ?? ""),
    accent: String(doc.accent ?? "from-cyan-glow to-violet-glow"),
    features: Array.isArray(doc.features)
      ? (doc.features as { feature: string }[]).map((f) => f.feature)
      : [],
    benefits: Array.isArray(doc.benefits)
      ? (doc.benefits as { benefit: string }[]).map((b) => b.benefit)
      : [],
    sections: Array.isArray(doc.sections)
      ? (doc.sections as { heading: string; body: string }[]).map((s) => ({
          heading: s.heading,
          body: s.body,
        }))
      : [],
    faqs: Array.isArray(doc.faqs)
      ? (doc.faqs as { question: string; answer: string }[]).map((f) => ({
          question: f.question,
          answer: f.answer,
        }))
      : [],
  } satisfies Service;
}

export async function getServices(): Promise<Service[]> {
  return tryPayload(async (payload) => {
    const { docs } = await payload.find({
      collection: "services",
      sort: "order",
      limit: 100,
    });
    if (!docs.length) return fallbackServices;
    return docs.map(mapService);
  }, fallbackServices);
}

export async function getService(slug: string): Promise<Service | null> {
  return tryPayload(async (payload) => {
    const { docs } = await payload.find({
      collection: "services",
      where: { slug: { equals: slug } },
      limit: 1,
    });
    if (docs.length) return mapService(docs[0]);
    return fallbackServices.find((s) => s.slug === slug) ?? null;
  }, fallbackServices.find((s) => s.slug === slug) ?? null);
}

export async function getProducts(): Promise<Product[]> {
  return tryPayload(async (payload) => {
    const { docs } = await payload.find({
      collection: "products",
      sort: "order",
      limit: 100,
    });
    if (!docs.length) return fallbackProducts;
    return docs.map(mapProduct);
  }, fallbackProducts);
}

function mapProduct(d: unknown): Product {
  const doc = d as Record<string, unknown>;
  return {
    slug: String(doc.slug ?? ""),
    title: String(doc.title ?? ""),
    description: String(doc.description ?? ""),
    overview: String(doc.overview ?? ""),
    icon: String(doc.icon ?? ""),
    href: String(doc.href ?? "#"),
    price: doc.price ? String(doc.price) : undefined,
    highlight: Boolean(doc.highlight),
    bullets: Array.isArray(doc.bullets)
      ? (doc.bullets as { bullet: string }[]).map((b) => b.bullet)
      : [],
    sections: Array.isArray(doc.sections)
      ? (doc.sections as { heading: string; body: string }[]).map((s) => ({
          heading: s.heading,
          body: s.body,
        }))
      : [],
    faqs: Array.isArray(doc.faqs)
      ? (doc.faqs as { question: string; answer: string }[]).map((f) => ({
          question: f.question,
          answer: f.answer,
        }))
      : [],
  } satisfies Product;
}

export async function getProduct(slug: string): Promise<Product | null> {
  return tryPayload(async (payload) => {
    const { docs } = await payload.find({
      collection: "products",
      where: { slug: { equals: slug } },
      limit: 1,
    });
    if (docs.length) return mapProduct(docs[0]);
    return fallbackProducts.find((p) => p.slug === slug) ?? null;
  }, fallbackProducts.find((p) => p.slug === slug) ?? null);
}

export async function getStats(): Promise<Stat[]> {
  return tryPayload(async (payload) => {
    const g = (await payload.findGlobal({
      slug: "site-content",
    })) as unknown as Record<string, unknown>;
    const stats = g.stats as { value: string; label: string }[] | undefined;
    if (!stats?.length) return fallbackStats;
    return stats.map((s) => ({ value: s.value, label: s.label }));
  }, fallbackStats);
}

export async function getSteps(): Promise<Step[]> {
  return tryPayload(async (payload) => {
    const g = (await payload.findGlobal({
      slug: "site-content",
    })) as unknown as Record<string, unknown>;
    const steps = g.processSteps as { title: string; text: string }[] | undefined;
    if (!steps?.length) return fallbackSteps;
    return steps.map((s, i) => ({
      n: String(i + 1).padStart(2, "0"),
      title: s.title,
      text: s.text,
    }));
  }, fallbackSteps);
}

export async function getTestimonials(): Promise<Testimonial[]> {
  return tryPayload(async (payload) => {
    const { docs } = await payload.find({
      collection: "testimonials",
      sort: "order",
      limit: 100,
    });
    if (!docs.length) return fallbackTestimonials;
    return docs.map((d) => {
      const doc = d as unknown as Record<string, unknown>;
      return {
        quote: String(doc.quote ?? ""),
        name: String(doc.name ?? ""),
        role: String(doc.role ?? ""),
      };
    });
  }, fallbackTestimonials);
}

function mapPost(d: unknown): Post {
  const doc = d as Record<string, unknown>;
  return {
    slug: String(doc.slug ?? ""),
    title: String(doc.title ?? ""),
    excerpt: String(doc.excerpt ?? ""),
    category: String(doc.category ?? ""),
    author: String(doc.author ?? "SyberInfo Team"),
    date: String(doc.date ?? ""),
    readMins: Number(doc.readMins ?? 4),
    body: String(doc.body ?? ""),
    status: (doc.status as Post["status"]) ?? "published",
  } satisfies Post;
}

export async function getPosts(): Promise<Post[]> {
  return tryPayload(async (payload) => {
    const now = new Date().toISOString();
    const { docs } = await payload.find({
      collection: "posts",
      sort: "-date",
      limit: 100,
      where: {
        and: [
          { status: { equals: "published" } },
          { date: { less_than_equal: now } },
        ],
      },
    });
    if (!docs.length) return fallbackPosts;
    return docs.map(mapPost);
  }, fallbackPosts);
}

export async function getPost(slug: string): Promise<Post | null> {
  return tryPayload(async (payload) => {
    const { docs } = await payload.find({
      collection: "posts",
      where: { slug: { equals: slug } },
      limit: 1,
    });
    if (docs.length) return mapPost(docs[0]);
    return fallbackPosts.find((p) => p.slug === slug) ?? null;
  }, fallbackPosts.find((p) => p.slug === slug) ?? null);
}

export async function getPlans(): Promise<Plan[]> {
  return tryPayload(async (payload) => {
    const { docs } = await payload.find({
      collection: "plans",
      sort: "order",
      limit: 200,
    });
    if (!docs.length) return fallbackPlans;
    return docs.map((d) => {
      const doc = d as unknown as Record<string, unknown>;
      return {
        category: String(doc.category ?? "") as Plan["category"],
        name: String(doc.name ?? ""),
        blurb: String(doc.blurb ?? ""),
        priceAnnual: doc.priceAnnual ? String(doc.priceAnnual) : undefined,
        priceMonthly: doc.priceMonthly ? String(doc.priceMonthly) : undefined,
        unit: doc.unit ? String(doc.unit) : undefined,
        features: Array.isArray(doc.features)
          ? (doc.features as { feature: string }[]).map((f) => f.feature)
          : [],
        highlight: Boolean(doc.highlight),
        ctaLabel: String(doc.ctaLabel ?? "Get a quote"),
        ctaHref: String(doc.ctaHref ?? "/contact"),
        order: Number(doc.order ?? 0),
      } satisfies Plan;
    });
  }, fallbackPlans);
}

export async function getPartners(): Promise<Partner[]> {
  return tryPayload(async (payload) => {
    const { docs } = await payload.find({
      collection: "partners",
      sort: "order",
      limit: 100,
    });
    if (!docs.length) return fallbackPartners;
    return docs.map((d) => {
      const doc = d as unknown as Record<string, unknown>;
      return { name: String(doc.name ?? ""), order: Number(doc.order ?? 0) };
    });
  }, fallbackPartners);
}

export async function getFaqs(): Promise<Faq[]> {
  return tryPayload(async (payload) => {
    const { docs } = await payload.find({
      collection: "faqs",
      sort: "order",
      limit: 200,
    });
    if (!docs.length) return fallbackFaqs;
    return docs.map((d) => {
      const doc = d as unknown as Record<string, unknown>;
      return {
        question: String(doc.question ?? ""),
        answer: String(doc.answer ?? ""),
        category: String(doc.category ?? "General"),
        order: Number(doc.order ?? 0),
      };
    });
  }, fallbackFaqs);
}

/**
 * Save a newsletter subscriber to the CMS. Ignores duplicate emails.
 * Returns true if stored (or already existed).
 */
export async function saveSubscriber(
  email: string,
  source = "website",
): Promise<boolean> {
  try {
    const payload = await getPayload({ config });
    await payload.create({
      collection: "subscribers",
      data: { email, source },
    });
    return true;
  } catch {
    // Likely a duplicate (unique email) — treat as success.
    return true;
  }
}

function mapHelp(d: unknown): HelpArticle {
  const doc = d as Record<string, unknown>;
  return {
    slug: String(doc.slug ?? ""),
    title: String(doc.title ?? ""),
    category: String(doc.category ?? "General"),
    excerpt: String(doc.excerpt ?? ""),
    body: String(doc.body ?? ""),
    order: Number(doc.order ?? 0),
  } satisfies HelpArticle;
}

export async function getHelpArticles(): Promise<HelpArticle[]> {
  return tryPayload(async (payload) => {
    const { docs } = await payload.find({
      collection: "help-articles",
      sort: "order",
      limit: 200,
    });
    if (!docs.length) return fallbackHelp;
    return docs.map(mapHelp);
  }, fallbackHelp);
}

export async function getHelpArticle(slug: string): Promise<HelpArticle | null> {
  return tryPayload(async (payload) => {
    const { docs } = await payload.find({
      collection: "help-articles",
      where: { slug: { equals: slug } },
      limit: 1,
    });
    if (docs.length) return mapHelp(docs[0]);
    return fallbackHelp.find((h) => h.slug === slug) ?? null;
  }, fallbackHelp.find((h) => h.slug === slug) ?? null);
}

function mapProject(d: unknown): Project {
  const doc = d as Record<string, unknown>;
  return {
    slug: String(doc.slug ?? ""),
    title: String(doc.title ?? ""),
    industry: String(doc.industry ?? ""),
    services: Array.isArray(doc.services)
      ? (doc.services as { service: string }[]).map((s) => s.service)
      : [],
    summary: String(doc.summary ?? ""),
    beforeImage: doc.beforeImage ? String(doc.beforeImage) : undefined,
    afterImage: doc.afterImage ? String(doc.afterImage) : undefined,
    url: doc.url ? String(doc.url) : undefined,
    results: Array.isArray(doc.results)
      ? (doc.results as { result: string }[]).map((r) => r.result)
      : [],
    order: Number(doc.order ?? 0),
  } satisfies Project;
}

export async function getProjects(): Promise<Project[]> {
  return tryPayload(async (payload) => {
    const { docs } = await payload.find({
      collection: "projects",
      sort: "order",
      limit: 200,
    });
    if (!docs.length) return fallbackProjects;
    return docs.map(mapProject);
  }, fallbackProjects);
}

export async function saveDataRequest(
  email: string,
  type: "export" | "delete",
  details?: string,
): Promise<boolean> {
  try {
    const payload = await getPayload({ config });
    await payload.create({
      collection: "data-requests",
      data: { email, type, details, status: "new" },
    });
    return true;
  } catch {
    return false;
  }
}

export type LeadInput = {
  name: string;
  email: string;
  phone?: string;
  service?: string;
  message: string;
};

/**
 * Persist a contact-form enquiry to the CMS so it appears under Enquiries in
 * the admin. Returns true on success; callers should not fail the request if
 * this returns false (email delivery is the primary channel).
 */
export async function saveLead(lead: LeadInput): Promise<boolean> {
  try {
    const payload = await getPayload({ config });
    await payload.create({
      collection: "leads",
      data: {
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        service: lead.service,
        message: lead.message,
        status: "new",
      },
    });
    return true;
  } catch {
    return false;
  }
}
