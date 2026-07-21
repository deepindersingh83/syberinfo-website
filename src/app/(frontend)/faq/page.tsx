import type { Metadata } from "next";
import { Aurora, SectionHeading, ButtonLink } from "@/components/ui";
import JsonLd, { faqJsonLd } from "@/components/JsonLd";
import { getFaqs } from "@/lib/content";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to common questions about SyberInfo's web, design, SEO, hosting and email services for Australian businesses.",
};

export const dynamic = "force-dynamic";

export default async function FaqPage() {
  const faqs = await getFaqs();
  const categories = Array.from(new Set(faqs.map((f) => f.category)));

  return (
    <div className="relative pt-36 pb-12">
      <Aurora />
      {faqs.length > 0 && <JsonLd data={faqJsonLd(faqs)} />}
      <div className="mx-auto max-w-3xl px-5">
        <SectionHeading
          eyebrow="FAQ"
          title={
            <>
              Frequently asked <span className="text-gradient">questions</span>
            </>
          }
          subtitle="Can't find what you're looking for? Get in touch — we're happy to help."
        />

        <div className="mt-14 space-y-10">
          {categories.map((category) => (
            <div key={category}>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted">
                {category}
              </h2>
              <div className="space-y-3">
                {faqs
                  .filter((f) => f.category === category)
                  .map((f) => (
                    <details
                      key={f.question}
                      className="group rounded-2xl glass p-5 [&_summary]:cursor-pointer"
                    >
                      <summary className="flex items-center justify-between gap-4 font-semibold marker:content-['']">
                        {f.question}
                        <span className="text-cyan-glow transition-transform group-open:rotate-45">
                          +
                        </span>
                      </summary>
                      <p className="mt-3 text-sm leading-relaxed text-muted">
                        {f.answer}
                      </p>
                    </details>
                  ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <ButtonLink href="/contact">Still have questions? Ask us →</ButtonLink>
        </div>
      </div>
    </div>
  );
}
