import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Aurora, ButtonLink } from "@/components/ui";
import { getHelpArticle, getHelpArticles } from "@/lib/content";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const article = await getHelpArticle(slug);
  if (!article) return { title: "Article not found" };
  return { title: article.title, description: article.excerpt };
}

export default async function HelpArticlePage({ params }: Params) {
  const { slug } = await params;
  const [article, all] = await Promise.all([
    getHelpArticle(slug),
    getHelpArticles(),
  ]);
  if (!article) notFound();

  const related = all
    .filter((a) => a.category === article.category && a.slug !== article.slug)
    .slice(0, 3);
  const paragraphs = article.body.split(/\n\s*\n/).filter(Boolean);

  return (
    <div className="relative pt-32 pb-12">
      <Aurora />
      <article className="mx-auto max-w-3xl px-5">
        <nav className="text-sm text-muted">
          <Link href="/help" className="transition-colors hover:text-foreground">
            ← Help Centre
          </Link>
        </nav>
        <span className="mt-6 inline-block text-xs font-semibold text-gradient">
          {article.category}
        </span>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          {article.title}
        </h1>
        <div className="mt-8 space-y-5 leading-relaxed text-foreground/90">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <div className="mt-12 rounded-3xl border border-white/10 bg-ink-800/60 p-8 text-center">
          <h2 className="text-xl font-bold">Still need a hand?</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Our team is happy to help with setup, migrations and anything else.
          </p>
          <div className="mt-5">
            <ButtonLink href="/contact">Contact support →</ButtonLink>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-bold">Related guides</h2>
            <ul className="mt-4 space-y-2">
              {related.map((a) => (
                <li key={a.slug}>
                  <Link
                    href={`/help/${a.slug}`}
                    className="text-sm text-muted underline-offset-4 transition-colors hover:text-foreground hover:underline"
                  >
                    {a.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </article>
    </div>
  );
}
