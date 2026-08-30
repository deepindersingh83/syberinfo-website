import Link from "next/link";
import { Aurora, ButtonLink } from "@/components/ui";

const popular = [
  { label: "Services", href: "/services" },
  { label: "Pricing", href: "/pricing" },
  { label: "Insights", href: "/blog" },
  { label: "Help centre", href: "/help" },
  { label: "Reviews", href: "/reviews" },
  { label: "Essential Eight check", href: "/essential-eight" },
];

export default function NotFound() {
  return (
    <div className="relative grid min-h-[70vh] place-items-center px-5 pt-36">
      <Aurora />
      <div className="text-center">
        <div className="text-8xl font-black text-gradient">404</div>
        <h1 className="mt-4 text-2xl font-bold">Page not found</h1>
        <p className="mx-auto mt-2 max-w-sm text-muted">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <ButtonLink href="/">Back home →</ButtonLink>
          <ButtonLink href="/contact" variant="ghost">
            Contact us
          </ButtonLink>
        </div>
        <div className="mt-10">
          <div className="mb-3 text-[12.5px] font-semibold uppercase tracking-[.06em] text-muted-3">
            Popular pages
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {popular.map((p) => (
              <Link
                key={p.href}
                href={p.href}
                className="rounded-full border border-white/[.12] px-4 py-2 text-[13px] text-muted-2 transition-colors hover:text-foreground"
              >
                {p.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
