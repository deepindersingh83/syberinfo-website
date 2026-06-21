import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import { Aurora, SectionHeading, ButtonLink } from "@/components/ui";
import { getProducts } from "@/lib/content";
import { site, store } from "@/lib/site";

export const metadata: Metadata = {
  title: "Web Products",
  description:
    "Domains, web hosting, Linux hosting, Google Workspace and Microsoft 365 — buy and manage through SyberInfo's secure client portal.",
};

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await getProducts();
  return (
    <div className="relative pt-36 pb-12">
      <Aurora />
      <div className="mx-auto max-w-7xl px-5">
        <SectionHeading
          eyebrow="Web products"
          title={
            <>
              Domains, hosting &amp;{" "}
              <span className="text-gradient">workspace</span>
            </>
          }
          subtitle="As a trusted reseller, we get you reliable infrastructure at great prices — managed in one place with local support."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p, i) => (
            <Reveal key={p.title} delay={i * 70}>
              <a
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative flex h-full flex-col overflow-hidden rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1.5 ${
                  p.highlight
                    ? "border border-cyan-glow/40 bg-gradient-to-b from-cyan-glow/10 to-transparent"
                    : "glass hover:border-white/20"
                }`}
              >
                {p.highlight && (
                  <span className="absolute right-5 top-5 rounded-full bg-cyan-glow px-3 py-1 text-xs font-bold text-ink-950">
                    Popular
                  </span>
                )}
                <div className="text-3xl">{p.icon}</div>
                <h3 className="mt-4 text-xl font-bold">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {p.description}
                </p>
                <ul className="mt-4 space-y-2">
                  {p.bullets.map((b) => (
                    <li
                      key={b}
                      className="flex items-center gap-2 text-sm text-foreground/80"
                    >
                      <span className="text-cyan-glow">✓</span>
                      {b}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="text-sm font-semibold text-gradient">
                    {p.price}
                  </span>
                  <span className="text-sm font-semibold text-foreground/80 transition-transform group-hover:translate-x-1">
                    Order →
                  </span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>

        {/* Portal banner */}
        <Reveal>
          <div className="mt-12 flex flex-col items-center justify-between gap-6 overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-glow to-violet-glow p-8 text-ink-950 md:flex-row md:p-10">
            <div>
              <h3 className="text-2xl font-extrabold">Already a customer?</h3>
              <p className="mt-1 max-w-md text-sm font-medium text-ink-900/80">
                Manage your domains, hosting and email in the client portal at{" "}
                hosting.syberinfo.com.au.
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href={store.login}
                className="rounded-full bg-ink-950 px-6 py-3 text-sm font-semibold text-foreground transition-transform hover:scale-[1.03]"
              >
                Client Login
              </a>
              <a
                href={site.storeUrl}
                className="rounded-full border border-ink-950/30 px-6 py-3 text-sm font-semibold text-ink-950 transition-colors hover:bg-ink-950/10"
              >
                Visit Store
              </a>
            </div>
          </div>
        </Reveal>

        <div className="mt-14 text-center">
          <ButtonLink href="/contact" variant="ghost">
            Need help choosing? Talk to us →
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
