import { getPayload } from "payload";
import config from "@payload-config";
import { logger } from "@/lib/logger";
import {
  products as fallbackProducts,
  plans as fallbackPlans,
  generalFaqs as fallbackFaqs,
  helpArticles as fallbackHelp,
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
// Managed-IT content is the source of truth for these collections; the CMS
// overrides them once seeded, otherwise these are served.
import {
  services as fallbackServices,
  testimonials as fallbackTestimonials,
  posts as fallbackPosts,
  partners as fallbackPartners,
  projects as fallbackProjects,
  stats as fallbackStats,
  caseStudies as fallbackCaseStudies,
  type CaseStudy,
} from "./it-data";

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
  const slug = String(doc.slug ?? "");
  // Design-only fields (accent colours, glyph tints, key features, metrics)
  // aren't modelled in the CMS — backfill them from the managed-IT source by
  // slug so CMS-edited text keeps full design fidelity.
  const design = fallbackServices.find((s) => s.slug === slug);
  return {
    slug,
    title: String(doc.title ?? ""),
    tagline: String(doc.tagline ?? ""),
    description: String(doc.description ?? ""),
    overview: String(doc.overview ?? ""),
    icon: String(doc.icon ?? design?.icon ?? ""),
    accent: String(doc.accent ?? "from-cyan-glow to-violet-glow"),
    accentHex: design?.accentHex,
    tintHex: design?.tintHex,
    short: design?.short,
    lead: design?.lead,
    keyFeatures: design?.keyFeatures,
    metrics: design?.metrics,
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
    pricing: Array.isArray(doc.pricing)
      ? (doc.pricing as Record<string, unknown>[]).map((pl) => ({
          name: String(pl.name ?? ""),
          price: pl.price ? String(pl.price) : undefined,
          unit: pl.unit ? String(pl.unit) : undefined,
          features: Array.isArray(pl.features)
            ? (pl.features as { feature: string }[]).map((f) => f.feature)
            : [],
          highlight: Boolean(pl.highlight),
          ctaLabel: pl.ctaLabel ? String(pl.ctaLabel) : "Get a quote",
          ctaHref: pl.ctaHref ? String(pl.ctaHref) : "/contact",
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

export type HomeContent = {
  hero: {
    eyebrow: string;
    heading: string; // empty = use the styled default in the page
    subheading: string;
    ctaPrimaryLabel: string;
    ctaPrimaryHref: string;
    ctaSecondaryLabel: string;
    ctaSecondaryHref: string;
  };
  closingCta: { heading: string; subheading: string; buttonLabel: string; buttonHref: string };
};

const homeDefaults: HomeContent = {
  hero: {
    eyebrow: "Now onboarding new clients · 2026",
    heading: "",
    subheading:
      "Managed IT, cloud, and cybersecurity for growing Australian businesses. We handle the infrastructure, the threats, and the 2am alerts — so your team never has to think about any of it.",
    ctaPrimaryLabel: "Get a free IT audit →",
    ctaPrimaryHref: "/book",
    ctaSecondaryLabel: "Explore services",
    ctaSecondaryHref: "/services",
  },
  closingCta: {
    heading: "Let’s get your IT off your plate.",
    subheading:
      "Book a free 30-minute audit. We’ll map your current setup, flag the risks, and show you exactly what we’d do — no obligation.",
    buttonLabel: "Book a free audit",
    buttonHref: "/book",
  },
};

export async function getHomeContent(): Promise<HomeContent> {
  return tryPayload(async (payload) => {
    const g = (await payload.findGlobal({ slug: "site-content" })) as unknown as Record<string, unknown>;
    const h = (g.hero as Record<string, unknown>) || {};
    const c = (g.closingCta as Record<string, unknown>) || {};
    const s = (v: unknown, fb: string) => (v == null || String(v).trim() === "" ? fb : String(v));
    return {
      hero: {
        eyebrow: s(h.eyebrow, homeDefaults.hero.eyebrow),
        heading: s(h.heading, homeDefaults.hero.heading),
        subheading: s(h.subheading, homeDefaults.hero.subheading),
        ctaPrimaryLabel: s(h.ctaPrimaryLabel, homeDefaults.hero.ctaPrimaryLabel),
        ctaPrimaryHref: s(h.ctaPrimaryHref, homeDefaults.hero.ctaPrimaryHref),
        ctaSecondaryLabel: s(h.ctaSecondaryLabel, homeDefaults.hero.ctaSecondaryLabel),
        ctaSecondaryHref: s(h.ctaSecondaryHref, homeDefaults.hero.ctaSecondaryHref),
      },
      closingCta: {
        heading: s(c.heading, homeDefaults.closingCta.heading),
        subheading: s(c.subheading, homeDefaults.closingCta.subheading),
        buttonLabel: s(c.buttonLabel, homeDefaults.closingCta.buttonLabel),
        buttonHref: s(c.buttonHref, homeDefaults.closingCta.buttonHref),
      },
    };
  }, homeDefaults);
}

/* ------------------------------ Case studies ----------------------------- */
type Rec = Record<string, unknown>;
const cstr = (v: unknown) => (v == null ? "" : String(v));

function mapCaseStudy(d: unknown): CaseStudy {
  const doc = d as Rec;
  const arr = (v: unknown) => (Array.isArray(v) ? (v as Rec[]) : []);
  return {
    slug: cstr(doc.slug),
    title: cstr(doc.title),
    summary: cstr(doc.summary),
    mark: cstr(doc.mark) || "+",
    gradient: cstr(doc.gradient) || "linear-gradient(135deg,#3F3DCC,#5E5BFF)",
    tags: arr(doc.tags).map((t) => cstr(t.tag)).filter(Boolean),
    metrics: arr(doc.metrics).map((m) => ({ k: cstr(m.k), v: cstr(m.v) })),
    sections: arr(doc.sections).map((s) => ({ head: cstr(s.head), body: cstr(s.body) })),
    quote: cstr(doc.quote),
    author: cstr(doc.author),
    authorRole: cstr(doc.authorRole),
    authorInitials: cstr(doc.authorInitials),
  };
}

export async function getCaseStudies(): Promise<CaseStudy[]> {
  return tryPayload(async (payload) => {
    const { docs } = await payload.find({ collection: "case-studies", sort: "order", limit: 100 });
    if (!docs.length) return fallbackCaseStudies;
    return docs.map(mapCaseStudy);
  }, fallbackCaseStudies);
}

export async function getCaseStudy(slug: string): Promise<CaseStudy | null> {
  return tryPayload(async (payload) => {
    const { docs } = await payload.find({ collection: "case-studies", where: { slug: { equals: slug } }, limit: 1 });
    if (docs.length) return mapCaseStudy(docs[0]);
    return fallbackCaseStudies.find((c) => c.slug === slug) ?? null;
  }, fallbackCaseStudies.find((c) => c.slug === slug) ?? null);
}

/* ------------------------------ Page headers ----------------------------- */
export type PageHeaderContent = { eyebrow: string; heading: string; subheading: string };

const pageHeaderDefaults: Record<string, PageHeaderContent> = {
  about: {
    eyebrow: "WHO WE ARE",
    heading: "",
    subheading:
      "Founded in Melbourne in 2015, SyberInfo grew out of a simple frustration: IT support that only shows up when something's already broken. We flipped the model.",
  },
  careers: {
    eyebrow: "CAREERS",
    heading: "",
    subheading:
      "We're a small Melbourne team that believes great support comes from engineers who are rested, trusted and genuinely cared for.",
  },
  services: {
    eyebrow: "SERVICES",
    heading: "",
    subheading:
      "Six core practices, one accountable team. Take one service or hand us the whole stack — either way, you get proactive engineers who know your business.",
  },
  pricing: {
    eyebrow: "Pricing & packages",
    heading: "",
    subheading:
      "Official Australian pricing on Google Workspace & Microsoft 365, plus flexible packages for websites and marketing.",
  },
};

export async function getPageHeader(page: string): Promise<PageHeaderContent> {
  const fb = pageHeaderDefaults[page] ?? { eyebrow: "", heading: "", subheading: "" };
  return tryPayload(async (payload) => {
    const g = (await payload.findGlobal({ slug: "page-content" })) as unknown as Record<string, unknown>;
    const rows = Array.isArray(g.headers) ? (g.headers as Record<string, unknown>[]) : [];
    const row = rows.find((r) => String(r.page).trim() === page);
    if (!row) return fb;
    const s = (v: unknown, d: string) => (v == null || String(v).trim() === "" ? d : String(v));
    return {
      eyebrow: s(row.eyebrow, fb.eyebrow),
      heading: s(row.heading, fb.heading),
      subheading: s(row.subheading, fb.subheading),
    };
  }, fb);
}

/* ------------------------------ Legal pages ------------------------------ */
export async function getLegalPage(slug: string): Promise<{ title: string; body: unknown } | null> {
  return tryPayload(async (payload) => {
    const { docs } = await payload.find({ collection: "legal-pages", where: { slug: { equals: slug } }, limit: 1 });
    const doc = docs[0] as unknown as Record<string, unknown> | undefined;
    if (!doc || !hasRichText(doc.body)) return null;
    return { title: String(doc.title ?? ""), body: doc.body };
  }, null);
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

/** Extract a usable URL from a populated Payload upload relationship. */
function mediaUrl(v: unknown): string | undefined {
  if (v && typeof v === "object" && "url" in v) {
    const u = (v as { url?: unknown }).url;
    return typeof u === "string" && u ? u : undefined;
  }
  return undefined;
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
    richBody: hasRichText(doc.richBody) ? doc.richBody : undefined,
    status: (doc.status as Post["status"]) ?? "published",
    coverImage: mediaUrl(doc.coverImage),
  } satisfies Post;
}

/** True when a Lexical value actually has content (not an empty root). */
function hasRichText(v: unknown): boolean {
  const root = (v as { root?: { children?: unknown[] } })?.root;
  if (!root || !Array.isArray(root.children)) return false;
  // An "empty" editor is a single empty paragraph — treat that as no content.
  if (root.children.length === 0) return false;
  if (root.children.length === 1) {
    const only = root.children[0] as { type?: string; children?: unknown[] };
    if (only?.type === "paragraph" && (!only.children || only.children.length === 0)) return false;
  }
  return true;
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
      return {
        name: String(doc.name ?? ""),
        order: Number(doc.order ?? 0),
        logo: mediaUrl(doc.logoMedia) ?? (doc.logo ? String(doc.logo) : undefined),
      };
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
  } catch (err) {
    // A duplicate (unique email) is fine; anything else is worth a log line.
    const msg = err instanceof Error ? err.message : String(err);
    if (!/unique|duplicate/i.test(msg)) {
      logger.error("saveSubscriber failed", { email, message: msg });
      return false;
    }
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
    beforeImage:
      mediaUrl(doc.beforeMedia) ?? (doc.beforeImage ? String(doc.beforeImage) : undefined),
    afterImage:
      mediaUrl(doc.afterMedia) ?? (doc.afterImage ? String(doc.afterImage) : undefined),
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
  } catch (err) {
    logger.error("saveDataRequest failed", { email, message: err instanceof Error ? err.message : String(err) });
    return false;
  }
}

export type LeadAttribution = {
  source?: string;
  medium?: string;
  campaign?: string;
  referrer?: string;
  landingPage?: string;
};
export type LeadInput = {
  name: string;
  email: string;
  phone?: string;
  service?: string;
  message: string;
  attribution?: LeadAttribution;
};

/**
 * Persist a contact-form enquiry to the CMS so it appears under Enquiries in
 * the admin. Returns true on success; callers should not fail the request if
 * this returns false (email delivery is the primary channel).
 */
export async function saveLead(lead: LeadInput): Promise<string | number | null> {
  try {
    const payload = await getPayload({ config });
    const doc = await payload.create({
      collection: "leads",
      data: {
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        service: lead.service,
        message: lead.message,
        status: "new",
        attribution: lead.attribution,
      },
    });
    return (doc as { id: string | number }).id;
  } catch (err) {
    logger.error("saveLead failed", { email: lead.email, message: err instanceof Error ? err.message : String(err) });
    return null;
  }
}
