import { getPayload } from "payload";
import config from "@payload-config";
import {
  services as fallbackServices,
  products as fallbackProducts,
  testimonials as fallbackTestimonials,
  type Service,
  type Product,
} from "./data";

type Testimonial = { quote: string; name: string; role: string };

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

export async function getServices(): Promise<Service[]> {
  return tryPayload(async (payload) => {
    const { docs } = await payload.find({
      collection: "services",
      sort: "order",
      limit: 100,
    });
    if (!docs.length) return fallbackServices;
    return docs.map((d) => {
      const doc = d as unknown as Record<string, unknown>;
      return {
        slug: String(doc.slug ?? ""),
        title: String(doc.title ?? ""),
        tagline: String(doc.tagline ?? ""),
        description: String(doc.description ?? ""),
        icon: String(doc.icon ?? ""),
        accent: String(doc.accent ?? "from-cyan-glow to-violet-glow"),
        features: Array.isArray(doc.features)
          ? (doc.features as { feature: string }[]).map((f) => f.feature)
          : [],
      } satisfies Service;
    });
  }, fallbackServices);
}

export async function getProducts(): Promise<Product[]> {
  return tryPayload(async (payload) => {
    const { docs } = await payload.find({
      collection: "products",
      sort: "order",
      limit: 100,
    });
    if (!docs.length) return fallbackProducts;
    return docs.map((d) => {
      const doc = d as unknown as Record<string, unknown>;
      return {
        title: String(doc.title ?? ""),
        description: String(doc.description ?? ""),
        icon: String(doc.icon ?? ""),
        href: String(doc.href ?? "#"),
        price: doc.price ? String(doc.price) : undefined,
        highlight: Boolean(doc.highlight),
        bullets: Array.isArray(doc.bullets)
          ? (doc.bullets as { bullet: string }[]).map((b) => b.bullet)
          : [],
      } satisfies Product;
    });
  }, fallbackProducts);
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
