import Link from "next/link";
import { footerCols, legalNav, site } from "@/lib/site";

const socials = [
  { label: "in", href: site.social.linkedin },
  { label: "X", href: site.social.twitter },
  { label: "gh", href: site.social.github },
];

export default function Footer() {
  return (
    <footer className="relative z-[1] overflow-hidden border-t border-white/[.06] bg-[linear-gradient(180deg,rgba(255,255,255,.012),rgba(94,91,255,.05))]">
      <div className="mx-auto max-w-[1240px] px-5 pt-[76px] sm:px-10">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 md:[grid-template-columns:1.5fr_1fr_1fr_1.1fr]">
          {/* brand col */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-[18px] flex items-center gap-2.5">
              <span className="grid h-[30px] w-[30px] place-items-center rounded-lg bg-indigo font-display text-[17px] font-extrabold text-white">
                S
              </span>
              <span className="font-display text-[19px] font-bold tracking-[-.02em]">
                SyberInfo
              </span>
            </div>
            <p className="mb-5 max-w-[30ch] text-sm leading-relaxed text-muted-2">
              Managed IT, cloud &amp; cybersecurity for growing Australian
              businesses. Quietly keeping you online since {site.founded}.
            </p>
            <Link
              href="/status"
              className="inline-flex items-center gap-2 rounded-full border border-lime/30 bg-lime/[.06] px-3 py-[7px] font-mono text-[11.5px] text-lime"
            >
              <span className="h-1.5 w-1.5 animate-blink rounded-full bg-lime shadow-[0_0_8px_#c9f25e]" />
              Helpdesk online · Mon–Sun
            </Link>
            <div className="mt-6 flex gap-2.5">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  className="grid h-[38px] w-[38px] place-items-center rounded-[10px] border border-white/[.12] font-mono text-[13px] text-muted transition-all hover:-translate-y-0.5 hover:border-indigo hover:bg-indigo/[.16] hover:text-white"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* link cols */}
          {footerCols.map((col) => (
            <div key={col.head}>
              <div className="mb-[18px] font-mono text-[11.5px] tracking-[.06em] text-indigo">
                {col.head}
              </div>
              <div className="flex flex-col gap-[11px]">
                {col.links.map((ln) =>
                  ln.href.startsWith("/") ? (
                    <Link
                      key={ln.label}
                      href={ln.href}
                      className="text-sm text-muted transition-colors hover:text-foreground"
                    >
                      {ln.label}
                    </Link>
                  ) : (
                    <a
                      key={ln.label}
                      href={ln.href}
                      className="text-sm text-muted transition-colors hover:text-foreground"
                    >
                      {ln.label}
                    </a>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>

        {/* oversized wordmark */}
        <div className="mt-16 select-none leading-[.78]">
          <div className="translate-y-[18%] bg-[linear-gradient(180deg,rgba(237,239,243,.14),rgba(237,239,243,0))] bg-clip-text text-center font-display text-[clamp(78px,18.5vw,290px)] font-extrabold tracking-[-.045em] text-transparent">
            SyberInfo
          </div>
        </div>
      </div>

      {/* bottom bar */}
      <div className="relative z-[1] border-t border-white/[.06] bg-ink-950">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-[18px] px-5 py-[22px] font-mono text-xs text-faint sm:px-10">
          <span>
            © {new Date().getFullYear()} {site.legalName} · ABN {site.abn}
          </span>
          <span className="inline-flex gap-[22px]">
            {legalNav.map((l) => (
              <Link key={l.href} href={l.href} className="text-muted-3">
                {l.label}
              </Link>
            ))}
          </span>
          <span className="inline-flex items-center gap-[7px]">
            Made in Melbourne <span className="text-lime">◆</span> AU
          </span>
        </div>
      </div>
    </footer>
  );
}
