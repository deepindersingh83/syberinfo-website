"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { nav, store } from "@/lib/site";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const closeMenu = () => setOpen(false);

  return (
    <header className="glass fixed inset-x-0 top-9 z-50 border-b border-white/[.06]">
      <nav className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-4 sm:px-10">
        <Link href="/" className="flex items-center gap-2.5 text-foreground">
          <span className="grid h-[30px] w-[30px] place-items-center rounded-lg bg-indigo font-display text-[17px] font-extrabold text-white">
            S
          </span>
          <span className="font-display text-[19px] font-bold tracking-[-.02em]">
            SyberInfo
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-[14.5px] font-medium transition-colors hover:text-foreground ${
                isActive(item.href) ? "text-foreground" : "text-muted"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={store.login}
            className="text-[14.5px] font-medium text-muted transition-colors hover:text-foreground"
          >
            Client login
          </Link>
          <Link
            href={store.login}
            className="rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-ink-950 transition-transform hover:-translate-y-0.5"
          >
            Client portal →
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="glass grid h-10 w-10 place-items-center rounded-lg lg:hidden"
        >
          <div className="space-y-1.5">
            <span className={`block h-0.5 w-5 bg-foreground transition-transform ${open ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`block h-0.5 w-5 bg-foreground transition-opacity ${open ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-5 bg-foreground transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`} />
          </div>
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="mx-4 mb-3 rounded-2xl border border-white/[.08] bg-ink-900/95 p-5 lg:hidden">
          <div className="flex flex-col gap-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className="rounded-lg px-3 py-3 text-base font-medium text-muted transition-colors hover:bg-white/5 hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={store.login}
              onClick={closeMenu}
              className="rounded-lg px-3 py-3 text-base font-medium text-muted hover:text-foreground"
            >
              Client login
            </Link>
            <Link
              href={store.login}
              onClick={closeMenu}
              className="mt-2 rounded-full bg-foreground px-5 py-3 text-center text-base font-semibold text-ink-950"
            >
              Client portal →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
