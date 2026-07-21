import type { Metadata } from "next";
import Link from "next/link";
import { Aurora, SectionHeading } from "@/components/ui";
import { getHelpArticles } from "@/lib/content";

export const metadata: Metadata = {
  title: "Help Centre",
  description:
    "Guides and how-tos for domains, hosting, email and billing with SyberInfo.",
};

export const dynamic = "force-dynamic";

export default async function HelpPage() {
  const articles = await getHelpArticles();
  const categories = Array.from(new Set(articles.map((a) => a.category)));

  return (
    <div className="relative pt-36 pb-12">
      <Aurora />
      <div className="mx-auto max-w-5xl px-5">
        <SectionHeading
          eyebrow="Help Centre"
          title={
            <>
              How can we <span className="text-gradient">help</span>?
            </>
          }
          subtitle="Step-by-step guides for domains, hosting, email and billing. Can't find it? Contact us anytime."
        />

        <div className="mt-14 space-y-10">
          {categories.map((category) => (
            <div key={category}>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted">
                {category}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {articles
                  .filter((a) => a.category === category)
                  .map((a) => (
                    <Link
                      key={a.slug}
                      href={`/help/${a.slug}`}
                      className="group rounded-2xl glass p-5 transition-all hover:-translate-y-1 hover:border-white/20"
                    >
                      <h3 className="font-bold">{a.title}</h3>
                      {a.excerpt && (
                        <p className="mt-1 text-sm text-muted">{a.excerpt}</p>
                      )}
                      <span className="mt-3 inline-block text-sm font-semibold text-foreground/80 transition-transform group-hover:translate-x-1">
                        Read →
                      </span>
                    </Link>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
