import type { Metadata } from "next";
import Link from "next/link";
import LegalLayout from "@/components/LegalLayout";
import RichBody from "@/components/RichBody";
import { getLegalPage } from "@/lib/content";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How SyberInfo collects, uses and protects your personal information, in line with the Australian Privacy Act 1988.",
};

export default async function PrivacyPage() {
  const cms = await getLegalPage("privacy");
  if (cms) {
    return (
      <LegalLayout title={cms.title || "Privacy Policy"} updated="">
        <RichBody data={cms.body} />
      </LegalLayout>
    );
  }
  return (
    <LegalLayout title="Privacy Policy" updated="June 2026">
      <p>
        {site.name} (ABN {site.abn}) is committed to protecting your privacy. This
        policy explains how we collect, use, disclose and safeguard your personal
        information in accordance with the Australian Privacy Act 1988 (Cth) and
        the Australian Privacy Principles (APPs).
      </p>

      <h2>Information we collect</h2>
      <p>
        We collect information you provide directly — such as your name, email,
        phone number and message when you submit a form, subscribe to our
        newsletter, or purchase a service. We also collect limited technical data
        (such as analytics) when you use our website.
      </p>

      <h2>How we use your information</h2>
      <ul>
        <li>To respond to enquiries and provide quotes</li>
        <li>To deliver and support the services you purchase</li>
        <li>To send updates or marketing you&apos;ve opted into (you can opt out anytime)</li>
        <li>To improve our website and services</li>
      </ul>

      <h2>Cookies & analytics</h2>
      <p>
        We use cookies and analytics to understand how visitors use our site.
        Analytics cookies load only after you accept them via our cookie banner.
        You can decline or change your choice at any time in your browser.
      </p>

      <h2>Disclosure</h2>
      <p>
        We do not sell your personal information. We may share it with trusted
        providers who help us operate (e.g. email, hosting and payment providers),
        only as needed to deliver our services.
      </p>

      <h2>Data security & storage</h2>
      <p>
        We take reasonable steps to protect your information. Our website data is
        stored on our own infrastructure located in {site.dataLocation}.
      </p>

      <h2>Accessing or deleting your data</h2>
      <p>
        You can request a copy of the personal information we hold about you, or
        ask us to delete it, at any time. Submit a request on our{" "}
        <Link href="/data-request">data request page</Link> or email{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy? Email us at{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>
    </LegalLayout>
  );
}
