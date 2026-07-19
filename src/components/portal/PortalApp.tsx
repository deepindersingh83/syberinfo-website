"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  authStats,
  baseServices,
  addonCatalog,
  planTiersPortal,
  software,
  allTickets,
  invoices as invoiceData,
  kbArticles,
  notifications,
  paymentMethods,
  billingHistory,
  statusTint,
  statusColor,
  navTabs,
} from "@/lib/portal-data";

type User = { name: string; company: string; email: string; phone?: string };
type View = "login" | "register" | "dash";

const SESSION_KEY = "syber_portal_session";
const ONBOARD_KEY = "syber_portal_onboarded";

const input =
  "w-full rounded-[11px] border border-white/[.12] bg-white/[.03] px-[15px] py-[13px] text-[14.5px] text-foreground outline-none transition-colors placeholder:text-muted-3 focus:border-indigo";
const card = "rounded-[18px] border border-white/[.08] bg-white/[.02]";

export default function PortalApp() {
  const [view, setView] = useState<View>("login");
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("overview");
  const [toast, setToast] = useState("");
  const [activated, setActivated] = useState<string[]>([]);
  const [plan, setPlan] = useState("Professional");
  const [swSel, setSwSel] = useState<string | null>(null);
  const [cat, setCat] = useState("All");
  const [tkSel, setTkSel] = useState<string | null>(null);
  const [replies, setReplies] = useState<Record<string, { who: string; role: string; time: string; msg: string; you?: boolean }[]>>({});
  const [kbSel, setKbSel] = useState<string | null>(null);
  const [kbQuery, setKbQuery] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifRead, setNotifRead] = useState(false);
  const [autopay, setAutopay] = useState(true);
  const [mfaOn, setMfaOn] = useState(false);
  const [onboarding, setOnboarding] = useState(false);
  const [obStep, setObStep] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMsgs, setChatMsgs] = useState<{ text: string; you?: boolean }[]>([]);

  useEffect(() => {
    try {
      const s = localStorage.getItem(SESSION_KEY);
      if (s) {
        setUser(JSON.parse(s));
        setView("dash");
      }
    } catch {}
  }, []);

  function flash(msg: string) {
    setToast(msg);
    window.clearTimeout((flash as unknown as { _t?: number })._t);
    (flash as unknown as { _t?: number })._t = window.setTimeout(() => setToast(""), 2800);
  }

  function startSession(u: User) {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(u));
    } catch {}
    let done = false;
    try {
      done = !!localStorage.getItem(ONBOARD_KEY);
    } catch {}
    setUser(u);
    setView("dash");
    setError("");
    setOnboarding(!done);
    setObStep(0);
  }

  function onLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget;
    const email = (f.elements.namedItem("email") as HTMLInputElement).value.trim();
    const password = (f.elements.namedItem("password") as HTMLInputElement).value.trim();
    if (!email || !password) return setError("Please enter your email and password.");
    if (!/.+@.+\..+/.test(email)) return setError("That email doesn’t look right.");
    const name = email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    startSession({ name, company: "Acme Pty Ltd", email });
  }

  function onRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget;
    const get = (n: string) => (f.elements.namedItem(n) as HTMLInputElement)?.value.trim() ?? "";
    const name = get("name");
    const company = get("company");
    const email = get("email");
    const password = get("password");
    if (!name || !email || !password) return setError("Please fill in all required fields.");
    if (!/.+@.+\..+/.test(email)) return setError("That email doesn’t look right.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    startSession({ name, company: company || "My Company", email });
  }

  function logout() {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {}
    setUser(null);
    setView("login");
    setTab("overview");
  }

  function activate(id: string) {
    setActivated((a) => (a.includes(id) ? a : [...a, id]));
    flash("Activation requested — our team will confirm shortly.");
  }

  function pushChat(text: string) {
    setChatMsgs((m) => [...m, { text, you: true }]);
    window.setTimeout(() => {
      setChatMsgs((m) => [...m, { text: "Thanks — a SyberInfo engineer has been notified and will jump in here shortly. Anything else you can tell us?" }]);
    }, 1100);
  }

  const firstName = (user?.name || "Client").split(" ")[0];
  const initials = (user?.name || "C").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const today = new Date().toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" }).toUpperCase();

  /* ------------------------------- AUTH ------------------------------- */
  if (view !== "dash" || !user) {
    const isLogin = view === "login";
    return (
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* brand panel */}
        <div className="relative hidden overflow-hidden bg-[linear-gradient(135deg,#3F3DCC,#5E5BFF)] p-12 lg:flex lg:flex-col lg:justify-between">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,.18),transparent_40%),radial-gradient(circle_at_85%_80%,rgba(201,242,94,.22),transparent_45%)]" />
          <Link href="/" className="relative flex items-center gap-2.5 text-white">
            <span className="grid h-[30px] w-[30px] place-items-center rounded-lg bg-white/20 font-display text-[17px] font-extrabold">S</span>
            <span className="font-display text-[19px] font-bold tracking-[-.02em]">SyberInfo</span>
          </Link>
          <div className="relative">
            <h1 className="max-w-[16ch] font-display text-[clamp(28px,3.5vw,44px)] font-bold leading-[1.05] tracking-[-.03em] text-white">
              Your IT, all in one calm place.
            </h1>
            <p className="mt-4 max-w-[38ch] text-[15px] leading-relaxed text-white/80">
              Track tickets, manage services, download invoices and chat to your
              engineers — the SyberInfo client portal.
            </p>
            <div className="mt-9 grid grid-cols-3 gap-4">
              {authStats.map((s) => (
                <div key={s.v}>
                  <div className="font-display text-[26px] font-bold tracking-[-.02em] text-white">{s.k}</div>
                  <div className="mt-1 text-[12px] text-white/70">{s.v}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative font-mono text-[12px] text-white/60">© 2026 SyberInfo Pty Ltd</div>
        </div>

        {/* form */}
        <div className="flex items-center justify-center bg-ink-950 px-5 py-16">
          <div className="w-full max-w-[400px]">
            <div className="mb-7 flex rounded-[11px] bg-white/[.04] p-1">
              <button
                onClick={() => { setView("login"); setError(""); }}
                className={`flex-1 rounded-[9px] py-2.5 text-sm font-semibold transition-colors ${isLogin ? "bg-foreground text-ink-950" : "text-muted-2"}`}
              >
                Sign in
              </button>
              <button
                onClick={() => { setView("register"); setError(""); }}
                className={`flex-1 rounded-[9px] py-2.5 text-sm font-semibold transition-colors ${!isLogin ? "bg-foreground text-ink-950" : "text-muted-2"}`}
              >
                Create account
              </button>
            </div>

            {isLogin ? (
              <form onSubmit={onLogin} className="flex flex-col gap-4">
                <h2 className="font-display text-2xl font-bold tracking-[-.02em]">Welcome back</h2>
                <label className="flex flex-col gap-1.5 text-[12.5px] font-medium text-muted-2">
                  Email
                  <input name="email" type="email" placeholder="you@company.com.au" className={input} />
                </label>
                <label className="flex flex-col gap-1.5 text-[12.5px] font-medium text-muted-2">
                  Password
                  <input name="password" type="password" placeholder="••••••••" className={input} />
                </label>
                {error && <p className="text-[13px] text-[#ff8a8a]">{error}</p>}
                <button className="mt-1 w-full rounded-[11px] bg-indigo py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_26px_rgba(94,91,255,.4)]">
                  Sign in →
                </button>
                <p className="text-center font-mono text-[11.5px] text-faint">Demo portal — any email &amp; password works.</p>
              </form>
            ) : (
              <form onSubmit={onRegister} className="flex flex-col gap-4">
                <h2 className="font-display text-2xl font-bold tracking-[-.02em]">Create your account</h2>
                <label className="flex flex-col gap-1.5 text-[12.5px] font-medium text-muted-2">
                  Full name
                  <input name="name" placeholder="Jane Doe" className={input} />
                </label>
                <label className="flex flex-col gap-1.5 text-[12.5px] font-medium text-muted-2">
                  Company
                  <input name="company" placeholder="Acme Pty Ltd" className={input} />
                </label>
                <label className="flex flex-col gap-1.5 text-[12.5px] font-medium text-muted-2">
                  Work email
                  <input name="email" type="email" placeholder="jane@company.com.au" className={input} />
                </label>
                <label className="flex flex-col gap-1.5 text-[12.5px] font-medium text-muted-2">
                  Password
                  <input name="password" type="password" placeholder="At least 6 characters" className={input} />
                </label>
                {error && <p className="text-[13px] text-[#ff8a8a]">{error}</p>}
                <button className="mt-1 w-full rounded-[11px] bg-indigo py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_26px_rgba(94,91,255,.4)]">
                  Create account →
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------ DASHBOARD ------------------------------ */
  const notifCount = notifRead ? 0 : notifications.length;

  const services = [
    ...baseServices,
    ...addonCatalog
      .filter((c) => activated.includes(c.id))
      .map((c) => ({ icon: c.icon, name: c.name, tier: "Add-on · just activated", price: c.price.replace(" / month", ""), renew: "Provisioning…", status: "Provisioning", statusColor: "#9d9bff", statusTint: "rgba(94,91,255,.16)" })),
  ];

  return (
    <div className="flex min-h-screen bg-ink-950">
      {/* Sidebar */}
      <aside className="sidebar sticky top-0 hidden h-screen w-[248px] flex-none flex-col gap-1 border-r border-white/[.06] bg-ink-900 p-4 md:flex">
        <Link href="/" className="mb-4 flex items-center gap-2.5 px-2 py-1.5 text-foreground">
          <span className="grid h-[30px] w-[30px] place-items-center rounded-lg bg-indigo font-display text-[16px] font-extrabold text-white">S</span>
          <span className="font-display text-[17px] font-bold tracking-[-.02em]">SyberInfo</span>
        </Link>
        {navTabs.map((t) => {
          const on = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setTkSel(null); setSwSel(null); setKbSel(null); }}
              className={`flex items-center gap-3 rounded-[10px] px-3 py-[11px] text-sm transition-colors ${on ? "bg-indigo/[.16] font-semibold text-foreground" : "text-muted-2 hover:bg-white/[.04]"}`}
            >
              <span className="grid h-5 w-5 place-items-center text-[13px]" style={{ color: on ? "#9d9bff" : undefined }}>{t.icon}</span>
              <span className="flex-1 text-left">{t.label}</span>
              {"badge" in t && t.badge ? (
                <span className="rounded-full bg-indigo px-2 py-0.5 text-[11px] font-semibold text-white">{t.badge}</span>
              ) : null}
            </button>
          );
        })}
        <div className="mt-auto rounded-[12px] border border-white/[.08] bg-white/[.02] p-4">
          <div className="text-[13px] font-semibold">Need a hand?</div>
          <p className="mt-1 text-[12px] leading-[1.5] text-muted-3">Chat to your engineers in real time.</p>
          <button onClick={() => setChatOpen(true)} className="mt-3 w-full rounded-[9px] bg-indigo py-2 text-[13px] font-semibold text-white">
            Open chat
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-white/[.06] bg-ink-950/90 px-5 py-3.5 backdrop-blur-md sm:px-8">
          {/* mobile tab select */}
          <select
            value={tab}
            onChange={(e) => { setTab(e.target.value); setTkSel(null); setSwSel(null); setKbSel(null); }}
            className="rounded-lg border border-white/[.12] bg-white/[.03] px-3 py-2 text-sm text-foreground md:hidden"
          >
            {navTabs.map((t) => (
              <option key={t.key} value={t.key}>{t.label}</option>
            ))}
          </select>
          <div className="hidden md:block">
            <div className="font-mono text-[11px] tracking-[.06em] text-muted-3">{today}</div>
            <div className="font-display text-[19px] font-bold tracking-[-.02em]">Welcome back, {firstName}</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => { setNotifOpen((v) => !v); setNotifRead(true); }}
                className="relative grid h-10 w-10 place-items-center rounded-[10px] border border-white/[.1] text-muted"
                aria-label="Notifications"
              >
                🔔
                {notifCount > 0 && <span className="absolute right-1.5 top-1.5 grid h-[15px] min-w-[15px] place-items-center rounded-full bg-lime px-1 text-[9px] font-bold text-ink-950">{notifCount}</span>}
              </button>
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />
                  <div className={`absolute right-0 top-12 z-40 w-[320px] ${card} p-2`}>
                    {notifications.map((n) => (
                      <div key={n.title} className="flex gap-3 rounded-[10px] px-3 py-2.5 hover:bg-white/[.03]">
                        <span className="grid h-8 w-8 flex-none place-items-center rounded-lg text-sm" style={{ background: "rgba(255,255,255,.05)", color: n.color }}>{n.icon}</span>
                        <div>
                          <div className="text-[13px] font-medium leading-tight">{n.title}</div>
                          <div className="mt-0.5 text-[11.5px] text-muted-3">{n.meta}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-indigo/[.18] font-display text-[13px] font-bold text-indigo">{initials}</span>
              <span className="hidden text-sm sm:block">{user.name}</span>
            </div>
            <button onClick={logout} className="rounded-[9px] border border-white/[.12] px-3 py-2 text-[13px] font-semibold text-muted transition-colors hover:text-foreground">
              Log out
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-5 py-7 sm:px-8">
          {tab === "overview" && <Overview firstName={firstName} services={services} setTab={setTab} />}
          {tab === "services" && <MyServices services={services} setTab={setTab} />}
          {tab === "plans" && <BrowsePlans plan={plan} setPlan={(p) => { setPlan(p); flash(`${p} plan selected. We’ll prorate your next invoice.`); }} activated={activated} activate={activate} />}
          {tab === "software" && <SoftwareMarket cat={cat} setCat={setCat} swSel={swSel} setSwSel={setSwSel} flash={flash} />}
          {tab === "tickets" && <Tickets tkSel={tkSel} setTkSel={setTkSel} replies={replies} setReplies={setReplies} flash={flash} />}
          {tab === "invoices" && <Invoices flash={flash} />}
          {tab === "knowledge" && <Knowledge kbSel={kbSel} setKbSel={setKbSel} kbQuery={kbQuery} setKbQuery={setKbQuery} />}
          {tab === "payments" && <Payments autopay={autopay} setAutopay={(v) => { setAutopay(v); flash(v ? "Auto-pay enabled." : "Auto-pay disabled."); }} flash={flash} />}
          {tab === "settings" && <Settings user={user} plan={plan} mfaOn={mfaOn} setMfaOn={setMfaOn} flash={flash} />}
        </main>
      </div>

      {/* Onboarding */}
      {onboarding && (
        <Onboarding
          firstName={firstName}
          user={user}
          step={obStep}
          setStep={setObStep}
          mfaOn={mfaOn}
          setMfaOn={setMfaOn}
          finish={() => { try { localStorage.setItem(ONBOARD_KEY, "1"); } catch {} setOnboarding(false); flash("You’re all set — welcome to SyberInfo."); }}
          skip={() => { try { localStorage.setItem(ONBOARD_KEY, "1"); } catch {} setOnboarding(false); }}
        />
      )}

      {/* Chat */}
      <ChatWidget open={chatOpen} setOpen={setChatOpen} firstName={firstName} msgs={chatMsgs} push={pushChat} />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[80] -translate-x-1/2 rounded-full border border-white/[.12] bg-ink-800 px-5 py-3 text-sm text-foreground shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}

/* ============================ Tab components ============================ */

const cardCls = "rounded-[18px] border border-white/[.08] bg-white/[.02]";
const StatusPill = ({ label, color, tint }: { label: string; color: string; tint: string }) => (
  <span className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-medium" style={{ background: tint, color }}>
    <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
    {label}
  </span>
);

type SvcRow = { icon: string; name: string; tier: string; price: string; renew: string; status: string; statusColor: string; statusTint: string };

function Overview({ firstName, services, setTab }: { firstName: string; services: SvcRow[]; setTab: (t: string) => void }) {
  const openTickets = allTickets.length;
  const nextInvoice = invoiceData.find((i) => i.sc === "wait");
  const tiles = [
    { label: "Active services", value: services.filter((s) => s.status === "Active").length, tab: "services" },
    { label: "Open tickets", value: openTickets, tab: "tickets" },
    { label: "Next invoice", value: nextInvoice?.amount ?? "—", tab: "invoices" },
    { label: "Current plan", value: "Professional", tab: "plans" },
  ];
  return (
    <div className="mx-auto max-w-[1100px]">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <button key={t.label} onClick={() => setTab(t.tab)} className={`${cardCls} px-5 py-6 text-left transition-colors hover:border-indigo/40`}>
            <div className="font-display text-[30px] font-bold tracking-[-.02em]">{t.value}</div>
            <div className="mt-1 text-[13px] text-muted-2">{t.label}</div>
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className={`${cardCls} p-6`}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold tracking-[-.01em]">Your services</h2>
            <button onClick={() => setTab("services")} className="text-[13px] font-semibold text-lime">View all →</button>
          </div>
          <div className="flex flex-col gap-3">
            {services.slice(0, 4).map((s) => (
              <div key={s.name} className="flex items-center gap-3.5">
                <span className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-indigo/[.12] text-lg text-indigo">{s.icon}</span>
                <div className="flex-1">
                  <div className="text-[14.5px] font-medium">{s.name}</div>
                  <div className="text-[12.5px] text-muted-3">{s.tier}</div>
                </div>
                <StatusPill label={s.status} color={s.statusColor} tint={s.statusTint} />
              </div>
            ))}
          </div>
        </div>
        <div className={`${cardCls} p-6`}>
          <h2 className="mb-4 font-display text-lg font-semibold tracking-[-.01em]">Recent activity</h2>
          <div className="flex flex-col gap-4">
            {notifications.map((n) => (
              <div key={n.title} className="flex gap-3">
                <span className="grid h-8 w-8 flex-none place-items-center rounded-lg text-sm" style={{ background: "rgba(255,255,255,.05)", color: n.color }}>{n.icon}</span>
                <div>
                  <div className="text-[13.5px] leading-tight">{n.title}</div>
                  <div className="mt-0.5 text-[11.5px] text-muted-3">{n.meta}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MyServices({ services, setTab }: { services: SvcRow[]; setTab: (t: string) => void }) {
  return (
    <div className="mx-auto max-w-[1100px]">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-[22px] font-bold tracking-[-.02em]">Active services</h2>
        <button onClick={() => setTab("plans")} className="rounded-full bg-indigo px-5 py-2.5 text-[13px] font-semibold text-white">Browse add-ons →</button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {services.map((s) => (
          <div key={s.name} className={`${cardCls} p-6`}>
            <div className="flex items-start justify-between">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-indigo/[.12] text-xl text-indigo">{s.icon}</span>
              <StatusPill label={s.status} color={s.statusColor} tint={s.statusTint} />
            </div>
            <h3 className="mt-4 font-display text-[18px] font-semibold tracking-[-.01em]">{s.name}</h3>
            <p className="mt-1 text-[13px] text-muted-3">{s.tier}</p>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <span className="font-display text-2xl font-bold tracking-[-.02em]">{s.price}</span>
                <span className="text-[13px] text-muted-3"> / mo</span>
              </div>
              <span className="text-[12px] text-muted-3">{s.renew}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BrowsePlans({ plan, setPlan, activated, activate }: { plan: string; setPlan: (p: string) => void; activated: string[]; activate: (id: string) => void }) {
  return (
    <div className="mx-auto max-w-[1100px]">
      <h2 className="mb-5 font-display text-[22px] font-bold tracking-[-.02em]">Managed IT plans</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {planTiersPortal.map((t) => {
          const cur = t.name === plan.toUpperCase();
          return (
            <div key={t.name} className={`relative rounded-[18px] border p-6 ${t.popular ? "border-indigo/50 shadow-[0_10px_40px_rgba(94,91,255,.12)]" : "border-white/[.08]"} bg-white/[.018]`}>
              {t.popular && <div className="absolute right-5 top-5 rounded-full bg-lime px-2.5 py-1 font-mono text-[10px] font-semibold text-ink-950">POPULAR</div>}
              <div className="font-mono text-[12px] tracking-[.05em] text-indigo">{t.name}</div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-display text-[34px] font-bold tracking-[-.03em]">{t.price}</span>
                <span className="text-[13px] text-muted-3">{t.per}</span>
              </div>
              <p className="mt-2 min-h-[40px] text-[13px] leading-[1.5] text-muted-2">{t.tagline}</p>
              <div className="mt-4 flex flex-col gap-2.5">
                {t.features.map((f) => (
                  <div key={f} className="flex items-start gap-2 text-[13.5px] text-[#c4cad4]">
                    <span className="mt-0.5 text-lime">✔</span>{f}
                  </div>
                ))}
              </div>
              <button
                onClick={() => !cur && setPlan(t.name.charAt(0) + t.name.slice(1).toLowerCase())}
                className={`mt-6 w-full rounded-[11px] py-3 text-[14px] font-semibold ${cur ? "cursor-default bg-white/[.06] text-muted-2" : "bg-indigo text-white"}`}
              >
                {cur ? "✓ Current plan" : `Switch to ${t.name.charAt(0) + t.name.slice(1).toLowerCase()}`}
              </button>
            </div>
          );
        })}
      </div>

      <h2 className="mb-5 mt-10 font-display text-[22px] font-bold tracking-[-.02em]">Add-on services</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {addonCatalog.map((c) => {
          const on = activated.includes(c.id);
          return (
            <div key={c.id} className={`${cardCls} flex items-center gap-4 p-5`}>
              <span className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-indigo/[.12] text-lg text-indigo">{c.icon}</span>
              <div className="flex-1">
                <div className="text-[15px] font-semibold">{c.name}</div>
                <div className="text-[12.5px] text-muted-3">{c.desc}</div>
                <div className="mt-1 font-mono text-[12px] text-lime">{c.price}</div>
              </div>
              <button
                onClick={() => !on && activate(c.id)}
                className={`flex-none rounded-[10px] px-4 py-2.5 text-[13px] font-semibold ${on ? "cursor-default border border-lime/30 bg-lime/[.08] text-lime" : "bg-foreground text-ink-950"}`}
              >
                {on ? "Active ✓" : "Activate"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SoftwareMarket({ cat, setCat, swSel, setSwSel, flash }: { cat: string; setCat: (c: string) => void; swSel: string | null; setSwSel: (s: string | null) => void; flash: (m: string) => void }) {
  const fmt = (n: number) => "$" + (Number.isInteger(n) ? n : n.toFixed(2));
  const cats = ["All", ...Array.from(new Set(software.map((w) => w.category)))];
  const sel = software.find((w) => w.id === swSel) || null;
  const list = software.filter((w) => cat === "All" || w.category === cat);

  if (sel) {
    return (
      <div className="mx-auto max-w-[900px]">
        <button onClick={() => setSwSel(null)} className="mb-5 text-sm text-muted transition-colors hover:text-foreground">← All software</button>
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-2xl font-display text-2xl font-bold text-white" style={{ background: sel.color }}>{sel.letter}</span>
          <div>
            <h2 className="font-display text-[22px] font-bold tracking-[-.02em]">{sel.name}</h2>
            <p className="text-[13px] text-muted-2">{sel.brand} · {sel.category} — {sel.tagline}</p>
          </div>
        </div>
        <h3 className="mb-3 mt-7 font-display text-lg font-semibold">Plans</h3>
        <div className="flex flex-col gap-3">
          {sel.plans.map((p) => (
            <div key={p.id} className={`${cardCls} flex items-center gap-4 p-5`}>
              <div className="flex-1">
                <div className="text-[15px] font-semibold">{p.name}</div>
                <div className="text-[12.5px] text-muted-3">{p.feat}</div>
              </div>
              <div className="text-right">
                <div className="font-display text-lg font-bold">{fmt(p.priceNum)}</div>
                <div className="text-[11px] text-muted-3">/ user / mo</div>
              </div>
              <button onClick={() => flash(`Requested ${sel.name} ${p.name}. We’ll send a quote shortly.`)} className="flex-none rounded-[10px] bg-indigo px-4 py-2.5 text-[13px] font-semibold text-white">Request</button>
            </div>
          ))}
        </div>
        {sel.addons.length > 0 && (
          <>
            <h3 className="mb-3 mt-7 font-display text-lg font-semibold">Add-ons</h3>
            <div className="flex flex-col gap-3">
              {sel.addons.map((a) => (
                <div key={a.id} className={`${cardCls} flex items-center gap-4 p-5`}>
                  <div className="flex-1">
                    <div className="text-[15px] font-semibold">{a.name}</div>
                    <div className="text-[12.5px] text-muted-3">{a.desc}</div>
                  </div>
                  <div className="font-display text-lg font-bold">{fmt(a.priceNum)}<span className="text-[11px] text-muted-3"> /mo</span></div>
                  <button onClick={() => flash(`Requested ${a.name}. We’ll send a quote shortly.`)} className="flex-none rounded-[10px] bg-indigo px-4 py-2.5 text-[13px] font-semibold text-white">Request</button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1100px]">
      <h2 className="mb-4 font-display text-[22px] font-bold tracking-[-.02em]">Software &amp; licenses</h2>
      <div className="mb-6 flex flex-wrap gap-2">
        {cats.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={`rounded-full border px-3.5 py-1.5 text-[13px] transition-colors ${c === cat ? "border-indigo bg-indigo/[.16] text-foreground" : "border-white/[.12] text-muted"}`}>{c}</button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((w) => (
          <button key={w.id} onClick={() => setSwSel(w.id)} className={`${cardCls} p-5 text-left transition-colors hover:border-indigo/40`}>
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl font-display text-lg font-bold text-white" style={{ background: w.color }}>{w.letter}</span>
              <div>
                <div className="text-[15px] font-semibold">{w.name}</div>
                <div className="text-[12px] text-muted-3">{w.category}</div>
              </div>
            </div>
            <p className="mt-3 text-[13px] leading-[1.5] text-muted-2">{w.tagline}</p>
            <div className="mt-3 font-mono text-[12px] text-lime">from {fmt(Math.min(...w.plans.map((p) => p.priceNum)))} /user</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Tickets({ tkSel, setTkSel, replies, setReplies, flash }: { tkSel: string | null; setTkSel: (s: string | null) => void; replies: Record<string, { who: string; role: string; time: string; msg: string; you?: boolean }[]>; setReplies: (fn: (r: Record<string, { who: string; role: string; time: string; msg: string; you?: boolean }[]>) => Record<string, { who: string; role: string; time: string; msg: string; you?: boolean }[]>) => void; flash: (m: string) => void }) {
  const rec = tkSel && tkSel !== "new" ? allTickets.find((t) => t.id === tkSel) : null;

  if (tkSel === "new") {
    return (
      <div className="mx-auto max-w-[640px]">
        <button onClick={() => setTkSel(null)} className="mb-5 text-sm text-muted hover:text-foreground">← Back to tickets</button>
        <div className={`${cardCls} p-7`}>
          <h2 className="mb-5 font-display text-[20px] font-bold tracking-[-.02em]">New support ticket</h2>
          <form
            onSubmit={(e) => { e.preventDefault(); setTkSel(null); flash("Ticket #4823 created — our team will respond shortly."); }}
            className="flex flex-col gap-4"
          >
            <label className="flex flex-col gap-1.5 text-[12.5px] font-medium text-muted-2">Subject<input required placeholder="Short summary of the issue" className={input} /></label>
            <label className="flex flex-col gap-1.5 text-[12.5px] font-medium text-muted-2">Category
              <select className={input}><option>Email &amp; M365</option><option>Devices</option><option>Networking</option><option>Security</option><option>Other</option></select>
            </label>
            <label className="flex flex-col gap-1.5 text-[12.5px] font-medium text-muted-2">Details<textarea required rows={5} placeholder="Tell us what's happening…" className={`${input} resize-y`} /></label>
            <button className="mt-1 w-full rounded-[11px] bg-indigo py-3.5 text-[15px] font-semibold text-white">Create ticket →</button>
          </form>
        </div>
      </div>
    );
  }

  if (rec) {
    const extra = replies[rec.id] || [];
    const thread = [...rec.thread, ...extra];
    return (
      <div className="mx-auto max-w-[820px]">
        <button onClick={() => setTkSel(null)} className="mb-5 text-sm text-muted hover:text-foreground">← Back to tickets</button>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-[20px] font-bold tracking-[-.02em]">{rec.id} · {rec.title}</h2>
            <p className="mt-1 font-mono text-[12px] text-muted-3">{rec.category} · {rec.priority} priority · opened {rec.opened}</p>
          </div>
          <StatusPill label={rec.status} color={statusColor[rec.sc]} tint={statusTint[rec.sc]} />
        </div>
        <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          <div className={`${cardCls} p-6`}>
            <div className="flex flex-col gap-4">
              {thread.map((m, i) => (
                <div key={i} className={`max-w-[85%] rounded-[14px] px-4 py-3 text-[14px] leading-[1.5] ${m.you ? "self-end bg-indigo text-white" : "self-start bg-white/[.05] text-[#d5dae3]"}`}>
                  <div className="mb-1 text-[11px] opacity-70">{m.who} · {m.time}</div>
                  {m.msg}
                </div>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = e.currentTarget;
                const val = (f.elements.namedItem("reply") as HTMLInputElement).value.trim();
                if (!val) return;
                setReplies((r) => ({ ...r, [rec.id]: [...(r[rec.id] || []), { who: "You", role: "Client", time: "Just now", msg: val, you: true }] }));
                f.reset();
              }}
              className="mt-5 flex gap-2"
            >
              <input name="reply" placeholder="Type a reply…" className={input} />
              <button className="flex-none rounded-[11px] bg-indigo px-5 text-[14px] font-semibold text-white">Send</button>
            </form>
          </div>
          <div className={`${cardCls} p-6`}>
            <div className="mb-3 font-mono text-[12px] tracking-[.05em] text-indigo">TIMELINE</div>
            <div className="flex flex-col gap-4">
              {rec.timeline.map((ev) => (
                <div key={ev.label} className="flex gap-3">
                  <span className="mt-1 h-[11px] w-[11px] flex-none rounded-full" style={ev.done ? { background: "#c9f25e", boxShadow: "0 0 8px #c9f25e" } : { background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.25)" }} />
                  <div>
                    <div className={ev.done ? "text-[14px] font-medium text-foreground" : "text-[14px] text-muted-2"}>{ev.label}</div>
                    <div className="text-[11.5px] text-muted-3">{ev.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1000px]">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-[22px] font-bold tracking-[-.02em]">Tickets &amp; support</h2>
        <button onClick={() => setTkSel("new")} className="rounded-full bg-indigo px-5 py-2.5 text-[13px] font-semibold text-white">+ New ticket</button>
      </div>
      <div className="flex flex-col gap-3">
        {allTickets.map((t) => (
          <button key={t.id} onClick={() => setTkSel(t.id)} className={`${cardCls} flex flex-wrap items-center justify-between gap-3 p-5 text-left transition-colors hover:border-indigo/40`}>
            <div>
              <div className="text-[15px] font-semibold">{t.id} · {t.title}</div>
              <div className="mt-1 font-mono text-[12px] text-muted-3">{t.category} · {t.priority} priority · updated {t.updated}</div>
            </div>
            <StatusPill label={t.status} color={statusColor[t.sc]} tint={statusTint[t.sc]} />
          </button>
        ))}
      </div>
    </div>
  );
}

function Invoices({ flash }: { flash: (m: string) => void }) {
  return (
    <div className="mx-auto max-w-[1000px]">
      <h2 className="mb-5 font-display text-[22px] font-bold tracking-[-.02em]">Invoices &amp; billing</h2>
      <div className={`${cardCls} divide-y divide-white/[.06]`}>
        {invoiceData.map((iv) => (
          <div key={iv.id} className="flex flex-wrap items-center gap-4 px-6 py-4">
            <div className="min-w-[120px]">
              <div className="font-mono text-[13px] font-semibold">{iv.id}</div>
              <div className="text-[12px] text-muted-3">{iv.date}</div>
            </div>
            <div className="flex-1 text-[14px] text-muted-2">{iv.period}</div>
            <StatusPill label={iv.status} color={statusColor[iv.sc]} tint={statusTint[iv.sc]} />
            <div className="font-display text-[16px] font-bold">{iv.amount}</div>
            <button onClick={() => flash(`Invoice ${iv.id} downloaded.`)} className="rounded-[9px] border border-white/[.12] px-3 py-2 text-[12.5px] font-semibold text-muted transition-colors hover:text-foreground">Download</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Knowledge({ kbSel, setKbSel, kbQuery, setKbQuery }: { kbSel: string | null; setKbSel: (s: string | null) => void; kbQuery: string; setKbQuery: (q: string) => void }) {
  const article = kbSel ? kbArticles.find((a) => a.id === kbSel) : null;
  if (article) {
    return (
      <div className="mx-auto max-w-[760px]">
        <button onClick={() => setKbSel(null)} className="mb-5 text-sm text-muted hover:text-foreground">← Knowledge base</button>
        <div className="mb-2 font-mono text-[12px] tracking-[.05em] text-indigo">{article.cat.toUpperCase()} · {article.read}</div>
        <h1 className="font-display text-[clamp(24px,3.5vw,36px)] font-bold tracking-[-.02em]">{article.title}</h1>
        <div className="mt-6 flex flex-col gap-4">
          {article.body.map((p, i) => (
            <p key={i} className="text-[16px] leading-[1.7] text-[#c4cad4]">{p}</p>
          ))}
        </div>
      </div>
    );
  }
  const q = kbQuery.toLowerCase();
  const list = kbArticles.filter((a) => !q || `${a.title} ${a.excerpt} ${a.cat}`.toLowerCase().includes(q));
  return (
    <div className="mx-auto max-w-[1000px]">
      <h2 className="mb-4 font-display text-[22px] font-bold tracking-[-.02em]">Knowledge base</h2>
      <input value={kbQuery} onChange={(e) => setKbQuery(e.target.value)} placeholder="Search articles…" className={`${input} mb-6 max-w-md`} />
      <div className="grid gap-4 md:grid-cols-2">
        {list.map((a) => (
          <button key={a.id} onClick={() => setKbSel(a.id)} className={`${cardCls} p-5 text-left transition-colors hover:border-indigo/40`}>
            <div className="mb-2 font-mono text-[11.5px] tracking-[.05em] text-indigo">{a.cat.toUpperCase()} · {a.read}</div>
            <h3 className="font-display text-[16px] font-semibold tracking-[-.01em]">{a.title}</h3>
            <p className="mt-1.5 text-[13.5px] leading-[1.5] text-muted-2">{a.excerpt}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function Payments({ autopay, setAutopay, flash }: { autopay: boolean; setAutopay: (v: boolean) => void; flash: (m: string) => void }) {
  return (
    <div className="mx-auto max-w-[1000px]">
      <h2 className="mb-5 font-display text-[22px] font-bold tracking-[-.02em]">Payment methods</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {paymentMethods.map((p) => (
          <div key={p.number} className="relative flex min-h-[170px] flex-col justify-between overflow-hidden rounded-[18px] border border-white/[.1] p-6" style={{ background: p.gradient }}>
            <div className="flex items-center justify-between">
              <span className="font-display text-lg font-bold text-white">{p.brand}</span>
              {p.isDefault && <span className="rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-semibold text-white">DEFAULT</span>}
            </div>
            <div>
              <div className="font-mono text-[16px] tracking-[.1em] text-white">{p.number}</div>
              <div className="mt-1 text-[12px] text-white/70">Expires {p.exp}</div>
            </div>
          </div>
        ))}
        <button onClick={() => flash("Add-a-card flow would open here (demo).")} className="grid min-h-[170px] place-items-center rounded-[18px] border border-dashed border-white/[.18] text-muted transition-colors hover:border-indigo/50 hover:text-foreground">
          + Add a card
        </button>
      </div>

      <div className={`${cardCls} mt-6 flex items-center justify-between p-6`}>
        <div>
          <div className="text-[15px] font-semibold">Automatic payments</div>
          <div className="mt-0.5 text-[13px] text-muted-3">{autopay ? "On · invoices auto-charged to Visa •••• 4291" : "Off · pay manually each month"}</div>
        </div>
        <button onClick={() => setAutopay(!autopay)} className="box-border h-6 w-[42px] rounded-full p-[3px] transition-colors" style={{ background: autopay ? "#5e5bff" : "rgba(255,255,255,.14)" }} aria-label="Toggle auto-pay">
          <span className="block h-[18px] w-[18px] rounded-full bg-white transition-transform" style={{ transform: `translateX(${autopay ? "18px" : "0"})` }} />
        </button>
      </div>

      <h3 className="mb-4 mt-8 font-display text-lg font-semibold">Billing history</h3>
      <div className={`${cardCls} divide-y divide-white/[.06]`}>
        {billingHistory.map((b) => (
          <div key={b.desc} className="flex items-center gap-4 px-6 py-3.5">
            <div className="w-24 font-mono text-[13px] text-muted-3">{b.date}</div>
            <div className="flex-1 text-[14px]">{b.desc}</div>
            <span className="rounded-full bg-lime/[.12] px-2.5 py-1 text-[12px] font-medium text-lime">{b.status}</span>
            <div className="font-display font-bold">{b.amount}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Settings({ user, plan, mfaOn, setMfaOn, flash }: { user: User; plan: string; mfaOn: boolean; setMfaOn: (v: boolean) => void; flash: (m: string) => void }) {
  const rows = [
    { k: "Full name", v: user.name },
    { k: "Company", v: user.company },
    { k: "Email", v: user.email || "—" },
    { k: "Mobile", v: user.phone || "—" },
    { k: "Current plan", v: plan },
  ];
  return (
    <div className="mx-auto max-w-[760px]">
      <h2 className="mb-5 font-display text-[22px] font-bold tracking-[-.02em]">Profile &amp; settings</h2>
      <div className={`${cardCls} divide-y divide-white/[.06]`}>
        {rows.map((r) => (
          <div key={r.k} className="flex items-center justify-between px-6 py-4">
            <span className="text-[13px] text-muted-3">{r.k}</span>
            <span className="text-[14.5px] font-medium">{r.v}</span>
          </div>
        ))}
      </div>
      <div className={`${cardCls} mt-6 flex items-center justify-between p-6`}>
        <div>
          <div className="text-[15px] font-semibold">Multi-factor authentication</div>
          <div className="mt-0.5 text-[13px] text-muted-3">{mfaOn ? "On · your account is protected" : "Off · we strongly recommend enabling MFA"}</div>
        </div>
        <button onClick={() => { setMfaOn(!mfaOn); flash(!mfaOn ? "MFA enabled." : "MFA disabled."); }} className="box-border h-6 w-[42px] rounded-full p-[3px] transition-colors" style={{ background: mfaOn ? "#5e5bff" : "rgba(255,255,255,.14)" }} aria-label="Toggle MFA">
          <span className="block h-[18px] w-[18px] rounded-full bg-white transition-transform" style={{ transform: `translateX(${mfaOn ? "18px" : "0"})` }} />
        </button>
      </div>
    </div>
  );
}

/* ============================ Onboarding ============================ */
function Onboarding({ firstName, user, step, setStep, mfaOn, setMfaOn, finish, skip }: { firstName: string; user: User; step: number; setStep: (n: number) => void; mfaOn: boolean; setMfaOn: (v: boolean) => void; finish: () => void; skip: () => void }) {
  const steps = [
    { glyph: "✦", title: `Welcome, ${firstName}!`, body: "Your SyberInfo client portal is where you track tickets, services, invoices and more. Let’s take 30 seconds to get you set up.", next: "Get started" },
    { glyph: "⌂", title: "Confirm your details", body: "Make sure we’ve got the basics right — you can change these any time in Settings.", details: true, next: "Looks good" },
    { glyph: "⛨", title: "Secure your account", body: "Multi-factor authentication adds a second layer of protection. We strongly recommend switching it on now.", mfa: true, next: "Continue" },
    { glyph: "★", title: "You’re ready to go", body: "That’s everything set up. Here’s what you can do from your portal:", done: true, next: "Enter portal" },
  ];
  const cur = steps[Math.min(step, steps.length - 1)];
  const pct = Math.round(((step + 1) / steps.length) * 100);
  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-black/70 p-5 backdrop-blur-sm">
      <div className="w-full max-w-[480px] rounded-[22px] border border-white/[.1] bg-ink-900 p-8">
        <div className="mb-6 h-1 w-full overflow-hidden rounded-full bg-white/[.08]">
          <div className="h-full rounded-full bg-indigo transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-indigo/[.14] text-2xl text-indigo">{cur.glyph}</div>
        <h2 className="font-display text-[24px] font-bold tracking-[-.02em]">{cur.title}</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">{cur.body}</p>

        {cur.details && (
          <div className="mt-5 flex flex-col gap-2 rounded-[14px] border border-white/[.08] bg-white/[.02] p-4">
            {[{ k: "Name", v: user.name }, { k: "Company", v: user.company }, { k: "Email", v: user.email || "you@company.com.au" }].map((d) => (
              <div key={d.k} className="flex justify-between text-[13.5px]"><span className="text-muted-3">{d.k}</span><span className="font-medium">{d.v}</span></div>
            ))}
          </div>
        )}
        {cur.mfa && (
          <button onClick={() => setMfaOn(!mfaOn)} className="mt-5 flex w-full items-center justify-between rounded-[14px] border border-white/[.08] bg-white/[.02] p-4">
            <span className="text-[14px] font-medium">{mfaOn ? "MFA enabled ✓" : "Enable MFA"}</span>
            <span className="box-border h-6 w-[42px] rounded-full p-[3px]" style={{ background: mfaOn ? "#5e5bff" : "rgba(255,255,255,.14)" }}>
              <span className="block h-[18px] w-[18px] rounded-full bg-white transition-transform" style={{ transform: `translateX(${mfaOn ? "18px" : "0"})` }} />
            </span>
          </button>
        )}
        {cur.done && (
          <ul className="mt-5 flex flex-col gap-2.5">
            {["Raise and track support tickets", "Monitor your services and uptime", "Manage software licenses and invoices"].map((t) => (
              <li key={t} className="flex items-center gap-2.5 text-[14px] text-[#c4cad4]"><span className="text-lime">✔</span>{t}</li>
            ))}
          </ul>
        )}

        <div className="mt-7 flex items-center justify-between">
          {step > 0 ? (
            <button onClick={() => setStep(Math.max(0, step - 1))} className="text-[14px] font-semibold text-muted hover:text-foreground">← Back</button>
          ) : (
            <button onClick={skip} className="text-[14px] font-semibold text-muted-3 hover:text-foreground">Skip</button>
          )}
          <button onClick={() => (step >= steps.length - 1 ? finish() : setStep(step + 1))} className="rounded-full bg-indigo px-6 py-3 text-[14px] font-semibold text-white">
            {cur.next} →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================ Chat widget ============================ */
function ChatWidget({ open, setOpen, firstName, msgs, push }: { open: boolean; setOpen: (v: boolean) => void; firstName: string; msgs: { text: string; you?: boolean }[]; push: (t: string) => void }) {
  const display = [{ text: `Hi ${firstName}, you’re chatting with the SyberInfo helpdesk. How can we help today?` }, ...msgs];
  const quick = ["Reset my password", "Log a new issue", "Check ticket status"];
  return (
    <>
      {!open && (
        <button onClick={() => setOpen(true)} className="fixed bottom-6 right-6 z-[75] grid h-14 w-14 place-items-center rounded-full bg-indigo text-2xl text-white shadow-[0_10px_34px_rgba(94,91,255,.5)]" aria-label="Open chat">
          💬
        </button>
      )}
      {open && (
        <div className="fixed bottom-6 right-6 z-[75] flex h-[520px] w-[min(92vw,360px)] flex-col overflow-hidden rounded-[18px] border border-white/[.1] bg-ink-900 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/[.08] bg-[linear-gradient(135deg,#3F3DCC,#5E5BFF)] px-4 py-3">
            <div className="flex items-center gap-2.5 text-white">
              <span className="h-2 w-2 rounded-full bg-lime shadow-[0_0_8px_#c9f25e]" />
              <span className="text-sm font-semibold">SyberInfo helpdesk</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white" aria-label="Close chat">✕</button>
          </div>
          <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto p-4">
            {display.map((m, i) => (
              <div key={i} className={`max-w-[85%] rounded-[14px] px-3.5 py-2.5 text-[13.5px] leading-[1.45] ${m.you ? "self-end bg-indigo text-white" : "self-start bg-white/[.05] text-[#d5dae3]"}`}>{m.text}</div>
            ))}
          </div>
          {msgs.length === 0 && (
            <div className="flex flex-wrap gap-2 px-4 pb-2">
              {quick.map((q) => (
                <button key={q} onClick={() => push(q)} className="rounded-full border border-white/[.12] px-3 py-1.5 text-[12px] text-muted hover:text-foreground">{q}</button>
              ))}
            </div>
          )}
          <form
            onSubmit={(e) => { e.preventDefault(); const f = e.currentTarget; const v = (f.elements.namedItem("msg") as HTMLInputElement).value.trim(); if (!v) return; f.reset(); push(v); }}
            className="flex gap-2 border-t border-white/[.08] p-3"
          >
            <input name="msg" placeholder="Type a message…" className={`${input} py-2.5`} />
            <button className="flex-none rounded-[10px] bg-indigo px-4 text-[13px] font-semibold text-white">Send</button>
          </form>
        </div>
      )}
    </>
  );
}
