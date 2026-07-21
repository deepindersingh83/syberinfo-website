import Link from "next/link";
import PortalLogout from "./PortalLogout";

const links = [
  { href: "/portal", label: "Dashboard" },
  { href: "/portal/services", label: "Services" },
  { href: "/portal/domains", label: "Domains" },
  { href: "/portal/invoices", label: "Invoices" },
  { href: "/portal/tickets", label: "Support" },
  { href: "/portal/account", label: "Account" },
];

export default function PortalShell({
  customerName,
  children,
}: {
  customerName: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full">
      <header className="border-b border-white/10 bg-ink-900/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link href="/portal" className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-cyan-glow to-violet-glow font-mono text-sm font-black text-ink-950">
              S
            </span>
            <span className="font-bold tracking-tight">
              Syber<span className="text-gradient">Info</span>{" "}
              <span className="text-muted">Portal</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted sm:inline">{customerName}</span>
            <PortalLogout />
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-8 md:flex-row">
        <nav className="flex gap-2 overflow-x-auto md:w-48 md:flex-col">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-white/5 hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
