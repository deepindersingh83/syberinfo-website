import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import { Aurora, Eyebrow } from "@/components/ui";
import { site, store } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with SyberInfo for web development, design, SEO, digital marketing, domains and hosting. Free quotes for Australian businesses.",
};

export default function ContactPage() {
  return (
    <div className="relative pt-36 pb-12">
      <Aurora />
      <div className="mx-auto max-w-7xl px-5">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          {/* Left — info */}
          <div>
            <Eyebrow>Contact</Eyebrow>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Let&apos;s talk about your{" "}
              <span className="text-gradient">project</span>
            </h1>
            <p className="mt-4 max-w-md leading-relaxed text-muted">
              Tell us what you need and we&apos;ll reply within one business day
              with ideas and a free, no-obligation quote.
            </p>

            <div className="mt-10 space-y-4">
              <InfoRow label="Email" value={site.email} href={`mailto:${site.email}`} />
              <InfoRow label="Client portal" value="hosting.syberinfo.com.au" href={store.login} />
              <InfoRow label="Location" value={site.location} />
            </div>

            <div className="mt-10 rounded-3xl glass p-6">
              <h3 className="font-semibold">Why businesses choose us</h3>
              <ul className="mt-4 space-y-3 text-sm text-muted">
                {[
                  "Web, design, marketing & hosting in one place",
                  "Fast, SEO-ready, conversion-focused builds",
                  "Transparent pricing & clear reporting",
                  "Local Australian support, 24/7",
                ].map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <span className="mt-0.5 text-cyan-glow">✓</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right — form */}
          <ContactForm />
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-center gap-4 rounded-2xl glass px-5 py-4 transition-colors hover:border-white/20">
      <span className="text-xs font-semibold uppercase tracking-widest text-muted">
        {label}
      </span>
      <span className="ml-auto font-medium">{value}</span>
    </div>
  );
  return href ? (
    <a href={href} className="block">
      {content}
    </a>
  ) : (
    content
  );
}
