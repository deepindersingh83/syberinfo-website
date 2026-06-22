import type { Metadata } from "next";
import { Aurora, SectionHeading } from "@/components/ui";
import BlogList from "@/components/BlogList";
import { getPosts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Blog & Insights",
  description:
    "Practical tips on web development, design, SEO, digital marketing and cloud — from the SyberInfo team.",
  alternates: { types: { "application/rss+xml": "/blog/rss.xml" } },
};

export const dynamic = "force-dynamic";

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
          <BlogList posts={posts} />
        )}
        <p className="mt-12 text-center text-sm text-muted">
          Prefer a reader?{" "}
          <a
            href="/blog/rss.xml"
            className="font-semibold text-foreground underline decoration-cyan-glow/50 underline-offset-4"
          >
            Subscribe via RSS
          </a>
        </p>
      </div>
    </div>
  );
}
