import { getPartners } from "@/lib/content";

export default async function PartnersCarousel() {
  const partners = await getPartners();
  if (!partners.length) return null;
  const items = [...partners, ...partners];

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-5">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted">
          Trusted technology &amp; platform partners
        </p>
      </div>
      <div className="relative mt-8 flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="flex shrink-0 animate-marquee items-center gap-6 pr-6">
          {items.map((p, i) => (
            <span
              key={i}
              className="flex items-center whitespace-nowrap rounded-2xl glass px-6 py-3 text-sm font-semibold text-foreground/80"
            >
              {p.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
