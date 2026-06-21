import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { Aurora, SectionHeading } from "@/components/ui";
import { getPosts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Blog & Insights",
  description:
    "Practical tips on web development, design, SEO, digital marketing and cloud — from the SyberInfo team.",
};

export const dynamic = "force-dynamic";

function formatDate(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogPage() {
  const posts = await getPosts();
  return (
    <div className="relative pt-36 pb-12">
      <Aurora />
      <div className="mx-auto max-w-7xl px-5">
        <SectionHeading
          eyebrow="Blog & insights"
          title={
            <>
              Ideas to <span className="text-gradient">grow online</span>
            </>
          }
          subtitle="Practical, no-jargon advice on web, design, SEO, marketing and cloud."
        />

        {posts.length === 0 ? (
          <p className="mt-16 text-center text-muted">
            No posts yet — check back soon.
          </p>
        ) : (
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p, i) => (
              <Reveal key={p.slug} delay={i * 60}>
                <Link
                  href={`/blog/${p.slug}`}
                  className="group flex h-full flex-col rounded-3xl glass p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-white/20"
                >
                  <div className="flex items-center gap-2 text-xs text-muted">
                    {p.category && (
                      <span className="rounded-full bg-white/5 px-3 py-1 font-semibold text-gradient">
                        {p.category}
                      </span>
                    )}
                    <span>{p.readMins} min read</span>
                  </div>
                  <h2 className="mt-4 text-xl font-bold leading-snug">
                    {p.title}
                  </h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                    {p.excerpt}
                  </p>
                  <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-sm">
                    <span className="text-muted">{formatDate(p.date)}</span>
                    <span className="font-semibold text-foreground/80 transition-transform group-hover:translate-x-1">
                      Read →
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
