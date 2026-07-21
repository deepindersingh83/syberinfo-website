import type { Metadata } from "next";
import { Aurora, Eyebrow } from "@/components/ui";
import DataRequestForm from "@/components/DataRequestForm";

export const metadata: Metadata = {
  title: "Data Request",
  description:
    "Request access to or deletion of your personal information held by SyberInfo, under the Australian Privacy Act.",
};

export default function DataRequestPage() {
  return (
    <div className="relative pt-36 pb-12">
      <Aurora />
      <div className="mx-auto max-w-2xl px-5">
        <Eyebrow>Privacy</Eyebrow>
        <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">
          Access or delete your data
        </h1>
        <p className="mt-4 leading-relaxed text-muted">
          Under the Australian Privacy Act you can request a copy of the personal
          information we hold about you, or ask us to delete it. Submit the form
          below and we&apos;ll verify your identity and respond within 30 days.
        </p>
        <div className="mt-8">
          <DataRequestForm />
        </div>
      </div>
    </div>
  );
}
