import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import {
  getServices,
  getProducts,
  getPosts,
  getHelpArticles,
} from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes = [
    "",
    "/services",
    "/products",
    "/pricing",
    "/work",
    "/blog",
    "/help",
    "/faq",
    "/find-my-plan",
    "/seo-audit",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/acceptable-use",
    "/refund-policy",
    "/data-request",
  ].map((path) => ({
    url: `${site.url}${path}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const [services, products, posts, help] = await Promise.all([
    getServices(),
    getProducts(),
    getPosts(),
    getHelpArticles(),
  ]);

  const serviceRoutes = services.map((s) => ({
    url: `${site.url}/services/${s.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const productRoutes = products.map((p) => ({
    url: `${site.url}/products/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const postRoutes = posts.map((p) => ({
    url: `${site.url}/blog/${p.slug}`,
    lastModified: p.date ? new Date(p.date) : now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const helpRoutes = help.map((h) => ({
    url: `${site.url}/help/${h.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [
    ...staticRoutes,
    ...serviceRoutes,
    ...productRoutes,
    ...postRoutes,
    ...helpRoutes,
  ];
}
