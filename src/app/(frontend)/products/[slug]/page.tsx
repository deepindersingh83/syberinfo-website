import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Reveal from "@/components/Reveal";
import { Aurora, Eyebrow, ButtonLink } from "@/components/ui";
import JsonLd, { faqJsonLd, breadcrumbJsonLd } from "@/components/JsonLd";
import { getProduct, getProducts } from "@/lib/content";
import { site, store } from "@/lib/site";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.title,
    description: product.overview || product.description,
    openGraph: {
      title: `${product.title} · SyberInfo`,
      description: product.overview || product.description,
    },
  };
}

export default async function ProductDetailPage({ params }: Params) {
  const { slug } = await params;
  const [product, all] = await Promise.all([getProduct(slug), getProducts()]);
  if (!product) notFound();

  const related = all.filter((p) => p.slug !== product.slug).slice(0, 3);

  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.overview || product.description,
    brand: { "@type": "Brand", name: site.name },
    url: `${site.url}/products/${product.slug}`,
  };

  return (
    <div className="relative pt-32 pb-12">
      <Aurora />
      <JsonLd data={productLd} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: site.url },
          { name: "Products", url: `${site.url}/products` },
          { name: product.title, url: `${site.url}/products/${product.slug}` },
        ])}
      />
      {product.faqs.length > 0 && <JsonLd data={faqJsonLd(product.faqs)} />}

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-5">
        <Reveal>
          <Link
            href="/products"
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            ← All products
          </Link>
          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl glass text-3xl">
              {product.icon}
            </div>
            <div>
              {product.price && <Eyebrow>{product.price}</Eyebrow>}
              <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
                {product.title}
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
                {product.overview || product.description}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <ButtonLink href={product.href} external>
                  Order now →
                </ButtonLink>
                <ButtonLink href="/contact" variant="ghost">
                  Talk to us
                </ButtonLink>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Highlights */}
      {product.bullets.length > 0 && (
        <section className="mx-auto mt-12 max-w-5xl px-5">
          <div className="grid gap-3 sm:grid-cols-3">
            {product.bullets.map((b) => (
              <div
                key={b}
                className="flex items-center gap-3 rounded-2xl glass px-5 py-4 text-sm"
              >
                <span className="text-cyan-glow">✓</span>
                {b}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Detailed sections */}
      {product.sections.length > 0 && (
        <section className="mx-auto mt-12 max-w-5xl px-5">
          <div className="grid gap-6">
            {product.sections.map((sec, i) => (
              <Reveal key={sec.heading} delay={i * 60}>
                <div className="rounded-3xl glass p-7 sm:p-9">
                  <h2 className="text-xl font-bold sm:text-2xl">{sec.heading}</h2>
                  <p className="mt-3 leading-relaxed text-muted">{sec.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* FAQs */}
      {product.faqs.length > 0 && (
        <section className="mx-auto mt-16 max-w-3xl px-5">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            Frequently asked questions
          </h2>
          <div className="mt-8 space-y-3">
            {product.faqs.map((f) => (
              <details
                key={f.question}
                className="group rounded-2xl glass p-5 [&_summary]:cursor-pointer"
              >
                <summary className="flex items-center justify-between gap-4 font-semibold marker:content-['']">
                  {f.question}
                  <span className="text-cyan-glow transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {f.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Related products */}
      {related.length > 0 && (
        <section className="mx-auto mt-20 max-w-7xl px-5">
          <h2 className="text-2xl font-bold">More products</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <Link
                key={p.slug}
                href={`/products/${p.slug}`}
                className="group rounded-3xl glass p-6 transition-all hover:-translate-y-1 hover:border-white/20"
              >
                <div className="text-3xl">{p.icon}</div>
                <h3 className="mt-4 font-bold">{p.title}</h3>
                <p className="mt-1 text-sm text-muted">{p.description}</p>
                {p.price && (
                  <p className="mt-3 text-sm font-semibold text-gradient">
                    {p.price}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="mx-auto mt-20 max-w-5xl px-5">
        <div className="rounded-[2rem] border border-white/10 bg-ink-800/60 p-10 text-center">
          <h2 className="text-2xl font-extrabold sm:text-3xl">
            Get started with{" "}
            <span className="text-gradient">{product.title}</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            Order online in minutes, or talk to us and we&apos;ll set everything
            up for you.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <ButtonLink href={product.href} external>
              Order now →
            </ButtonLink>
            <ButtonLink href={store.login} variant="ghost" external>
              Client login
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}
