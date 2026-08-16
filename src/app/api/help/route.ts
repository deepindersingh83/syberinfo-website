import { json } from "@/lib/api";
import { getHelpArticles } from "@/lib/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public help-centre articles (CMS-backed, falls back to bundled defaults).
 * Used by the client portal's Knowledge base tab and open to the public site.
 */
export async function GET() {
  const articles = await getHelpArticles();
  return json({
    articles: articles.map((a) => ({
      slug: a.slug,
      title: a.title,
      category: a.category,
      excerpt: a.excerpt,
      // Split the stored body into paragraphs for lightweight rendering.
      paragraphs: String(a.body || "")
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean),
    })),
  });
}
