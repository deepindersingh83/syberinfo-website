import type { Metadata } from "next";
import LegalLayout from "@/components/LegalLayout";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms governing the use of SyberInfo's website and services.",
};

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" updated="June 2026">
      <p>
        These terms govern your use of the {site.name} website and the services we
        provide. By engaging our services you agree to these terms.
      </p>

      <h2>Services</h2>
      <p>
        We provide web development, design, SEO, social media and digital
        marketing services, and resell domains, hosting and productivity suites
        (Google Workspace, Microsoft 365). Specific deliverables, timelines and
        fees are set out in your individual quote or proposal.
      </p>

      <h2>Quotes & payment</h2>
      <p>
        Quotes are valid for 30 days unless stated otherwise. All prices are in
        Australian dollars and exclude GST unless noted. Reseller products are
        billed and renewed through our client portal.
      </p>

      <h2>Third-party products</h2>
      <p>
        Domains, hosting and workspace products are subject to the terms of the
        respective providers. We act as a reseller and will assist with setup and
        support.
      </p>

      <h2>Intellectual property</h2>
      <p>
        On full payment, you own the final deliverables we create for you, except
        for third-party components and our pre-existing tools, which are licensed
        to you for use in your project.
      </p>

      <h2>Liability</h2>
      <p>
        Our services come with guarantees that cannot be excluded under the
        Australian Consumer Law. To the extent permitted by law, our liability is
        limited to re-supplying the relevant services or the cost of doing so.
      </p>

      <h2>Contact</h2>
      <p>
        Questions? Email <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>
    </LegalLayout>
  );
}
