import type { Metadata } from "next";
import { Aurora, SectionHeading, ButtonLink } from "@/components/ui";
import PricingClient from "@/components/PricingClient";
import CompareTable from "@/components/CompareTable";
import { getPlans, getPageHeader } from "@/lib/content";

export const metadata: Metadata = {
  title: "Pricing & Packages",
  description:
    "Transparent pricing for Google Workspace, Microsoft 365, websites and digital marketing — for Australian businesses. AUD, ex-GST.",
};

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const [plans, ph] = await Promise.all([getPlans(), getPageHeader("pricing")]);
  return (
    <div className="relative pt-36 pb-12">
      <Aurora />
      <div className="mx-auto max-w-7xl px-5">
        <SectionHeading
          eyebrow={ph.eyebrow}
          title={
            ph.heading ? (
              ph.heading
            ) : (
              <>
                Simple, honest <span className="text-gradient">pricing</span>
              </>
            )
          }
          subtitle={ph.subheading}
        />

        <PricingClient plans={plans} />

        <CompareTable />

        {/* Reassurance / CTA */}
        <div className="mt-20 rounded-[2rem] border border-white/10 bg-ink-800/60 p-10 text-center">
          <h2 className="text-2xl font-extrabold sm:text-3xl">
            Not sure which plan fits?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            Tell us about your team and goals — we&apos;ll recommend the right
            mix, set everything up and migrate you across with no downtime.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/contact">Get a tailored quote →</ButtonLink>
            <ButtonLink href="/products" variant="ghost">
              Browse products
            </ButtonLink>
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-xs text-muted">
            All prices in AUD and exclude GST. Google Workspace and Microsoft 365
            prices follow official Australian rates and may change (Microsoft
            pricing updates from 1 July 2026). Final pricing is confirmed at
            checkout.
          </p>
        </div>
      </div>
    </div>
  );
}
