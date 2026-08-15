import type { Metadata } from "next";
import LeadForm from "@/components/LeadForm";
import { getContactContent } from "@/lib/content";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with SyberInfo for managed IT, cloud and cybersecurity. We reply within one business day, or book a free 30-minute audit.",
};

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const [content, settings] = await Promise.all([getContactContent(), getSettings()]);

  const contactInfo = [
    { icon: "✉", label: "Email", value: settings.email, href: `mailto:${settings.email}` },
    { icon: "☎", label: "Phone", value: settings.phone, href: `tel:${settings.phoneIntl}` },
    { icon: "⌂", label: "Office", value: settings.address, href: "#" },
  ];

  return (
    <section className="relative z-[1] mx-auto max-w-[1240px] px-5 pb-24 pt-[150px] sm:px-10">
      <div className="grid-bg pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_80%_60%_at_50%_15%,#000,transparent_75%)]" />
      <div className="grid items-start gap-16 md:grid-cols-[1fr_1.05fr]">
        <div>
          <div className="mb-3.5 font-mono text-[13px] tracking-[.05em] text-indigo">{content.eyebrow}</div>
          <h1 className="mb-[22px] max-w-[16ch] font-display text-[clamp(34px,5vw,56px)] font-bold leading-[1.05] tracking-[-.03em]">
            {content.heading}
          </h1>
          <p className="mb-9 max-w-[42ch] text-base leading-[1.7] text-muted">
            {content.subheading}
          </p>
          <div className="flex flex-col gap-[18px]">
            {contactInfo.map((cm) => {
              const inner = (
                <span className="flex items-center gap-3.5">
                  <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-indigo/[.14] text-[18px] text-indigo">
                    {cm.icon}
                  </span>
                  <span>
                    <span className="block font-mono text-xs uppercase tracking-[.03em] text-muted-3">
                      {cm.label}
                    </span>
                    <span className="block text-[15.5px] font-semibold text-foreground">
                      {cm.value}
                    </span>
                  </span>
                </span>
              );
              return cm.href && cm.href !== "#" ? (
                <a key={cm.label} href={cm.href} className="text-inherit">
                  {inner}
                </a>
              ) : (
                <div key={cm.label}>{inner}</div>
              );
            })}
          </div>
        </div>
        <div>
          <LeadForm />
        </div>
      </div>
    </section>
  );
}
