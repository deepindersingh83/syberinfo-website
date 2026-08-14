import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { getServices, getPosts } from "@/lib/content";
import { caseStudies } from "@/lib/it-data";
import { serviceAreas } from "@/lib/areas";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: {
    path: string;
    priority: number;
    freq: MetadataRoute.Sitemap[number]["changeFrequency"];
  }[] = [
    { path: "", priority: 1, freq: "weekly" },
    { path: "/services", priority: 0.9, freq: "monthly" },
    { path: "/work", priority: 0.8, freq: "monthly" },
    { path: "/blog", priority: 0.8, freq: "weekly" },
    { path: "/about", priority: 0.6, freq: "monthly" },
    { path: "/careers", priority: 0.5, freq: "monthly" },
    { path: "/contact", priority: 0.7, freq: "yearly" },
    { path: "/book", priority: 0.8, freq: "yearly" },
    { path: "/status", priority: 0.4, freq: "daily" },
    { path: "/essential-eight", priority: 0.7, freq: "monthly" },
    { path: "/managed-it", priority: 0.7, freq: "monthly" },
    { path: "/privacy", priority: 0.2, freq: "yearly" },
    { path: "/terms", priority: 0.2, freq: "yearly" },
  ];

  const base: MetadataRoute.Sitemap = staticRoutes.map((r) => ({
    url: `${site.url}${r.path}`,
    lastModified: now,
    changeFrequency: r.freq,
    priority: r.priority,
  }));

  const [services, posts] = await Promise.all([getServices(), getPosts()]);

  const serviceRoutes: MetadataRoute.Sitemap = services.map((s) => ({
    url: `${site.url}/services/${s.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const workRoutes: MetadataRoute.Sitemap = caseStudies.map((c) => ({
    url: `${site.url}/work/${c.slug}`,
    lastModified: now,
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${site.url}/blog/${p.slug}`,
    lastModified: p.date ? new Date(p.date) : now,
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  const areaRoutes: MetadataRoute.Sitemap = serviceAreas.map((a) => ({
    url: `${site.url}/managed-it/${a.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...base, ...serviceRoutes, ...workRoutes, ...postRoutes, ...areaRoutes];
}
