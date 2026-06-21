import Link from "next/link";
import { nav, site, store } from "@/lib/site";
import { services } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="relative mt-24 border-t border-white/10 bg-ink-900/60">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-glow to-violet-glow font-mono text-sm font-black text-ink-950">
              S
            </span>
            <span className="text-lg font-bold tracking-tight">
              Syber<span className="text-gradient">Info</span>
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            {site.description}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-foreground">Services</h4>
          <ul className="mt-4 space-y-2.5">
            {services.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/services/${s.slug}`}
                  className="text-sm text-muted transition-colors hover:text-foreground"
                >
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-foreground">Products</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-muted">
            <li><a className="transition-colors hover:text-foreground" href={store.domains}>Domain Names</a></li>
            <li><a className="transition-colors hover:text-foreground" href={store.hosting}>Web Hosting</a></li>
            <li><a className="transition-colors hover:text-foreground" href={store.linux}>Linux Hosting</a></li>
            <li><a className="transition-colors hover:text-foreground" href={store.google}>Google Workspace</a></li>
            <li><a className="transition-colors hover:text-foreground" href={store.microsoft}>Microsoft 365</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-foreground">Company</h4>
          <ul className="mt-4 space-y-2.5">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-muted transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 space-y-1 text-sm text-muted">
            <a className="block transition-colors hover:text-foreground" href={`mailto:${site.email}`}>
              {site.email}
            </a>
            <p>{site.location}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-6 text-sm text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <a href={site.social.facebook} className="transition-colors hover:text-foreground">Facebook</a>
            <a href={site.social.instagram} className="transition-colors hover:text-foreground">Instagram</a>
            <a href={site.social.linkedin} className="transition-colors hover:text-foreground">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
