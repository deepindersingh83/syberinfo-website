import type { Metadata } from "next";
import { Aurora, SectionHeading } from "@/components/ui";
import FindMyPlan from "@/components/FindMyPlan";

export const metadata: Metadata = {
  title: "Find Your Plan",
  description:
    "Answer a few quick questions and we'll recommend the right website, hosting or workspace plan for your business.",
};

export default function FindMyPlanPage() {
  return (
    <div className="relative pt-36 pb-12">
      <Aurora />
      <div className="mx-auto max-w-2xl px-5">
        <SectionHeading
          eyebrow="Find your plan"
          title={
            <>
              Let&apos;s find your <span className="text-gradient">perfect fit</span>
            </>
          }
          subtitle="A few quick questions — no email required."
        />
        <div className="mt-12">
          <FindMyPlan />
        </div>
      </div>
    </div>
  );
}
