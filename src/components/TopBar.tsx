import Link from "next/link";
import { getSettings } from "@/lib/settings";

/**
 * Slim promo/status bar pinned above the nav.
 */
export default async function TopBar() {
  const s = await getSettings();
  return (
    <div className="fixed inset-x-0 top-0 z-[51] border-b border-white/10 bg-gradient-to-r from-indigo to-indigo-600">
      <div className="mx-auto flex h-9 max-w-[1240px] items-center justify-between gap-4 whitespace-nowrap px-5 font-mono text-[12px] tracking-[.01em] text-white/90 sm:px-10">
        <Link
          href="/status"
          className="inline-flex items-center gap-2 text-inherit transition-opacity hover:text-lime"
        >
          <span className="h-[7px] w-[7px] animate-blink rounded-full bg-lime shadow-[0_0_9px_#c9f25e]" />
          All systems operational
        </Link>
        <span className="hidden opacity-90 md:inline">
          ⛨ 24/7 monitored security desk · now onboarding for Q3 2026
        </span>
        <span className="inline-flex items-center gap-5">
          {s.phone && (
            <a href={`tel:${s.phoneIntl || s.phone}`} className="text-white transition-colors hover:text-lime">
              {s.phone}
            </a>
          )}
          {s.email && (
            <a
              href={`mailto:${s.email}`}
              className="hidden text-white transition-colors hover:text-lime sm:inline"
            >
              {s.email}
            </a>
          )}
        </span>
      </div>
    </div>
  );
}
