import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import BlogList from "@/components/BlogList";
import { getPosts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Practical, no-jargon advice on managed IT, cloud, cybersecurity and backup — from the SyberInfo team.",
  alternates: { types: { "application/rss+xml": "/blog/rss.xml" } },
};

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await getPosts();
  return (
    <>
      <PageHeader
        tag="INSIGHTS"
        title={
          <>
            Plain-English IT, <span className="text-indigo">explained</span>.
          </>
        }
        subtitle="Practical, jargon-free advice on security, cloud, backup and getting the most from the tools your team already uses."
      />
      <section className="relative z-[1] mx-auto max-w-[1240px] px-5 pb-20 sm:px-10">
        {posts.length === 0 ? (
          <p className="mt-8 text-center text-muted">No posts yet — check back soon.</p>
        ) : (
          <BlogList posts={posts} />
        )}
        <p className="mt-12 text-center text-sm text-muted-3">
          Prefer a reader?{" "}
          <a
            href="/blog/rss.xml"
            className="font-semibold text-foreground underline decoration-lime/50 underline-offset-4"
          >
            Subscribe via RSS
          </a>
        </p>
      </section>
    </>
  );
}
