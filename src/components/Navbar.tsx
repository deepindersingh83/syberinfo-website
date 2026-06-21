"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav, site, store } from "@/lib/site";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass border-b border-white/10 py-3"
          : "border-b border-transparent py-5"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-glow to-violet-glow font-mono text-sm font-black text-ink-950 shadow-[0_0_24px_-4px_var(--color-cyan-glow)]">
            S
          </span>
          <span className="text-lg font-bold tracking-tight">
            Syber<span className="text-gradient">Info</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-foreground ${
                isActive(item.href) ? "text-foreground" : "text-muted"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href={store.login}
            className="text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            Client Login
          </a>
          <Link
            href="/contact"
            className="rounded-full bg-gradient-to-r from-cyan-glow to-violet-glow px-5 py-2.5 text-sm font-semibold text-ink-950 shadow-[0_0_24px_-6px_var(--color-violet-glow)] transition-transform hover:scale-[1.03]"
          >
            Get a Quote
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-lg glass md:hidden"
        >
          <div className="space-y-1.5">
            <span
              className={`block h-0.5 w-5 bg-foreground transition-transform ${
                open ? "translate-y-2 rotate-45" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-5 bg-foreground transition-opacity ${
                open ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-5 bg-foreground transition-transform ${
                open ? "-translate-y-2 -rotate-45" : ""
              }`}
            />
          </div>
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="mx-4 mt-3 rounded-2xl glass p-5 md:hidden">
          <div className="flex flex-col gap-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-base font-medium text-muted transition-colors hover:bg-white/5 hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
            <a
              href={store.login}
              className="rounded-lg px-3 py-3 text-base font-medium text-muted hover:text-foreground"
            >
              Client Login
            </a>
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-gradient-to-r from-cyan-glow to-violet-glow px-5 py-3 text-center text-base font-semibold text-ink-950"
            >
              Get a Quote
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export { site };
