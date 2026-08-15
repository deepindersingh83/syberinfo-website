import type { Metadata } from "next";
import LegalLayout from "@/components/LegalLayout";
import RichBody from "@/components/RichBody";
import { getLegalPage } from "@/lib/content";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "SyberInfo's approach to refunds for services and reseller products.",
};

export default async function RefundPolicyPage() {
  const cms = await getLegalPage("refund-policy");
  if (cms) {
    return (
      <LegalLayout title={cms.title || "Refund Policy"} updated="">
        <RichBody data={cms.body} />
      </LegalLayout>
    );
  }
  return (
    <LegalLayout title="Refund Policy" updated="June 2026">
      <p>
        This policy explains when refunds apply. Nothing here limits your rights
        under the Australian Consumer Law.
      </p>

      <h2>Services (web, design, marketing)</h2>
      <p>
        Project work is quoted and delivered in stages. If we haven&apos;t started
        work, deposits are refundable less any costs already incurred. Once work
        has begun, fees for completed stages are non-refundable, but we&apos;ll
        always work with you to make things right.
      </p>

      <h2>Domains</h2>
      <p>
        Domain registrations and renewals are generally non-refundable once
        processed, as the registry charges are incurred immediately.
      </p>

      <h2>Hosting & subscriptions</h2>
      <p>
        Hosting and workspace subscriptions can be cancelled at any time to stop
        future renewals. Part-used billing periods are generally non-refundable
        unless required by law.
      </p>

      <h2>Faults & guarantees</h2>
      <p>
        If a service is faulty or not as described, you may be entitled to a
        repair, replacement or refund under the Australian Consumer Law. Contact us
        and we&apos;ll resolve it promptly.
      </p>

      <h2>Contact</h2>
      <p>
        To request a refund or discuss an issue, email{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>
    </LegalLayout>
  );
}
