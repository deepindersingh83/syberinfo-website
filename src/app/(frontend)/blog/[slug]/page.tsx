import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Aurora, ButtonLink } from "@/components/ui";
import JsonLd, { breadcrumbJsonLd } from "@/components/JsonLd";
import { getPost, getPosts } from "@/lib/content";
import { site, ogImage } from "@/lib/site";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

function formatDate(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Article not found" };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `${site.url}/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: `${post.title} · SyberInfo`,
      description: post.excerpt,
      publishedTime: post.date,
      images: [{ url: ogImage(post.title, "Insights"), width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", images: [ogImage(post.title, "Insights")] },
  };
}

export default async function PostPage({ params }: Params) {
  const { slug } = await params;
  const [post, all] = await Promise.all([getPost(slug), getPosts()]);
  if (!post) notFound();

  const related = all.filter((p) => p.slug !== post.slug).slice(0, 3);
  const paragraphs = post.body.split(/\n\s*\n/).filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: { "@type": "Organization", name: post.author },
    publisher: { "@type": "Organization", name: site.name },
    mainEntityOfPage: `${site.url}/blog/${post.slug}`,
  };

  return (
    <div className="relative pt-32 pb-12">
      <Aurora />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: site.url },
          { name: "Insights", url: `${site.url}/blog` },
          { name: post.title, url: `${site.url}/blog/${post.slug}` },
        ])}
      />

      <article className="mx-auto max-w-3xl px-5">
        <nav className="text-sm text-muted">
          <Link href="/blog" className="transition-colors hover:text-foreground">
            ← All articles
          </Link>
        </nav>

        <div className="mt-6 flex items-center gap-2 text-xs text-muted">
          {post.category && (
            <span className="rounded-full bg-white/5 px-3 py-1 font-semibold text-gradient">
              {post.category}
            </span>
          )}
          <span>{formatDate(post.date)}</span>
          <span>· {post.readMins} min read</span>
        </div>

        <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          {post.title}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">{post.excerpt}</p>

        {post.coverImage && (
          <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-3xl">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="mt-10 space-y-5 text-[1.05rem] leading-relaxed text-foreground/90">
          {paragraphs.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        <div className="mt-12 rounded-3xl border border-white/10 bg-ink-800/60 p-8 text-center">
          <h2 className="text-xl font-bold">Want help with this?</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            We help Australian businesses turn ideas like these into real
            results. Get a free, no-obligation chat.
          </p>
          <div className="mt-5">
            <ButtonLink href="/contact">Talk to us →</ButtonLink>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="mx-auto mt-20 max-w-7xl px-5">
          <h2 className="text-2xl font-bold">Keep reading</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {related.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="group rounded-3xl glass p-6 transition-all hover:-translate-y-1 hover:border-white/20"
              >
                {p.category && (
                  <span className="text-xs font-semibold text-gradient">
                    {p.category}
                  </span>
                )}
                <h3 className="mt-2 font-bold leading-snug">{p.title}</h3>
                <p className="mt-2 text-sm text-muted line-clamp-3">
                  {p.excerpt}
                </p>
                <span className="mt-3 inline-block text-sm font-semibold text-foreground/80 transition-transform group-hover:translate-x-1">
                  Read →
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
