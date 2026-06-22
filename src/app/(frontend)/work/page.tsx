import type { Metadata } from "next";
import { Aurora, SectionHeading } from "@/components/ui";
import WorkClient from "@/components/WorkClient";
import { getProjects } from "@/lib/content";

export const metadata: Metadata = {
  title: "Our Work",
  description:
    "Real results for Australian businesses — websites, branding, SEO and marketing projects by SyberInfo.",
};

export const dynamic = "force-dynamic";

export default async function WorkPage() {
  const projects = await getProjects();
  return (
    <div className="relative pt-36 pb-12">
      <Aurora />
      <div className="mx-auto max-w-7xl px-5">
        <SectionHeading
          eyebrow="Our work"
          title={
            <>
              Results we&apos;re <span className="text-gradient">proud of</span>
            </>
          }
          subtitle="Drag the slider to see the before and after. Filter by industry to find work like yours."
        />
        <WorkClient projects={projects} />
      </div>
    </div>
  );
}
