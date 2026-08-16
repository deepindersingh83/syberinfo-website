import type { Metadata } from "next";
import { Aurora, SectionHeading } from "@/components/ui";
import ReviewForm from "@/components/ReviewForm";
import { getTestimonials, getReviewStats } from "@/lib/content";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Client Reviews",
  description:
    "What Australian businesses say about SyberInfo's managed IT, cloud and cybersecurity. Read reviews or leave your own.",
  alternates: { canonical: `${site.url}/reviews` },
};

export const dynamic = "force-dynamic";

function Stars({ n }: { n: number }) {
  return (
    <span aria-label={`${n} out of 5 stars`} className="tracking-[2px]">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= Math.round(n) ? "text-[#f5b301]" : "text-white/20"}>
          ★
        </span>
      ))}
    </span>
  );
}

export default async function ReviewsPage() {
  const [reviews, stats] = await Promise.all([getTestimonials(), getReviewStats()]);
  const rated = reviews.filter((r) => r.rating);

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.url,
  };
  if (stats) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: stats.average,
      reviewCount: stats.count,
      bestRating: 5,
      worstRating: 1,
    };
  }
  if (rated.length) {
    jsonLd.review = rated.slice(0, 20).map((r) => ({
      "@type": "Review",
      reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5, worstRating: 1 },
      author: { "@type": "Person", name: r.name },
      reviewBody: r.quote,
    }));
  }

  return (
    <div className="relative pt-36 pb-20">
      <Aurora />
      {(stats || rated.length) && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      <div className="mx-auto max-w-5xl px-5">
        <SectionHeading
          eyebrow="Client reviews"
          title={
            <>
              Trusted by Australian <span className="text-gradient">businesses</span>
            </>
          }
          subtitle="Real words from the teams we look after."
        />

        {stats && (
          <div className="mx-auto mt-6 flex w-fit items-center gap-3 rounded-full border border-white/10 bg-ink-800/60 px-6 py-3">
            <span className="font-display text-2xl font-bold">{stats.average.toFixed(1)}</span>
            <Stars n={stats.average} />
            <span className="text-sm text-muted">from {stats.count} review{stats.count === 1 ? "" : "s"}</span>
          </div>
        )}

        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {reviews.map((r, i) => (
            <div key={i} className="rounded-3xl border border-white/10 bg-ink-800/40 p-6">
              {r.rating ? <Stars n={r.rating} /> : null}
              <p className="mt-3 text-[15.5px] leading-relaxed text-foreground/90">“{r.quote}”</p>
              <div className="mt-4 text-sm">
                <span className="font-semibold">{r.name}</span>
                {(r.role || r.company) && (
                  <span className="text-muted">
                    {" "}
                    — {[r.role, r.company].filter(Boolean).join(", ")}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 rounded-[2rem] border border-white/10 bg-ink-800/60 p-8 sm:p-10">
          <h2 className="font-display text-2xl font-bold tracking-[-.02em]">Leave a review</h2>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Worked with us? We&rsquo;d love to hear how it went. Reviews are checked before they appear.
          </p>
          <div className="mt-7">
            <ReviewForm />
          </div>
        </div>
      </div>
    </div>
  );
}
