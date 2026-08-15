import type { Metadata } from "next";
import LegalLayout from "@/components/LegalLayout";
import RichBody from "@/components/RichBody";
import { getLegalPage } from "@/lib/content";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Acceptable Use Policy",
  description: "Rules for acceptable use of SyberInfo's hosting and services.",
};

export default async function AcceptableUsePage() {
  const cms = await getLegalPage("acceptable-use");
  if (cms) {
    return (
      <LegalLayout title={cms.title || "Acceptable Use Policy"} updated="">
        <RichBody data={cms.body} />
      </LegalLayout>
    );
  }
  return (
    <LegalLayout title="Acceptable Use Policy" updated="June 2026">
      <p>
        This policy sets out acceptable use of {site.name}&apos;s hosting and
        related services. It exists to keep our platform secure, reliable and fair
        for everyone.
      </p>

      <h2>You must not use our services to</h2>
      <ul>
        <li>Send spam or unsolicited bulk email</li>
        <li>Host or distribute malware, phishing or fraudulent content</li>
        <li>Infringe intellectual property or other people&apos;s rights</li>
        <li>Store or share illegal, harmful or abusive material</li>
        <li>Attempt to gain unauthorised access to systems or networks</li>
        <li>Consume excessive resources in a way that harms other customers</li>
      </ul>

      <h2>Security</h2>
      <p>
        You are responsible for keeping your accounts, passwords and software up to
        date and secure. Notify us immediately if you suspect a breach.
      </p>

      <h2>Enforcement</h2>
      <p>
        We may suspend or terminate services that breach this policy, where
        possible after notice. Serious or illegal activity may be actioned
        immediately and reported to the relevant authorities.
      </p>

      <h2>Contact</h2>
      <p>
        Report abuse or ask questions at{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>
    </LegalLayout>
  );
}
