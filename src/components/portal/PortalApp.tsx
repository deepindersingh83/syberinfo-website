"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { planTiersPortal, kbArticles } from "@/lib/portal-data";

/* ============================================================================
   SyberInfo client portal — wired to the real Payload backend.
   Auth uses the `customers` auth collection (cookie session); data comes from
   /api/portal/me (owner-scoped subscriptions, invoices, tickets, domains).
========================================================================== */

type Customer = { id: string; name: string; company: string; email: string; phone: string };
type Subscription = { id: string; label: string; domain: string; status: string; billingCycle: string; recurringAmount: number; nextDueDate: string };
type Invoice = { id: string; number: string; total: number; status: string; dueDate: string; paidDate: string };
type TicketMsg = { author: string; message: string };
type Ticket = { id: string; subject: string; department: string; status: string; priority: string; updatedAt: string; messages: TicketMsg[] };
type Domain = { id: string; domain: string; status: string; expiryDate: string; autoRenew: boolean };
type SwPlan = { name: string; price: number; unit: string; feat: string };
type SwProduct = { id: string; name: string; brand: string; category: string; letter: string; color: string; tagline: string; plans: SwPlan[]; addons: { name: string; price: number; desc: string }[] };
type Me = {
  customer: Customer;
  subscriptions: Subscription[];
  invoices: Invoice[];
  tickets: Ticket[];
  domains: Domain[];
};

type View = "loading" | "login" | "register" | "forgot" | "dash";

const input =
  "w-full rounded-[11px] border border-white/[.12] bg-white/[.03] px-[15px] py-[13px] text-[14.5px] text-foreground outline-none transition-colors placeholder:text-muted-3 focus:border-indigo";
const card = "rounded-[18px] border border-white/[.08] bg-white/[.02]";

const money = (n: number) =>
  new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(n || 0);
const dateAU = (iso: string) =>
  iso ? new Date(iso).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }) : "—";

const STATUS_TINT: Record<string, { c: string; b: string }> = {
  active: { c: "#c9f25e", b: "rgba(201,242,94,.12)" },
  paid: { c: "#c9f25e", b: "rgba(201,242,94,.12)" },
  pending: { c: "#9d9bff", b: "rgba(94,91,255,.16)" },
  trial: { c: "#ffb570", b: "rgba(255,170,90,.14)" },
  suspended: { c: "#ffb570", b: "rgba(255,170,90,.14)" },
  unpaid: { c: "#ffb570", b: "rgba(255,170,90,.14)" },
  overdue: { c: "#ff8a8a", b: "rgba(255,120,120,.14)" },
  open: { c: "#9d9bff", b: "rgba(94,91,255,.16)" },
  "customer-reply": { c: "#9d9bff", b: "rgba(94,91,255,.16)" },
  answered: { c: "#c9f25e", b: "rgba(201,242,94,.12)" },
  closed: { c: "#8a92a1", b: "rgba(255,255,255,.06)" },
  cancelled: { c: "#8a92a1", b: "rgba(255,255,255,.06)" },
};
const Pill = ({ label }: { label: string }) => {
  const st = STATUS_TINT[label?.toLowerCase()] || { c: "#8a92a1", b: "rgba(255,255,255,.06)" };
  return (
    <span className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-medium capitalize" style={{ background: st.b, color: st.c }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: st.c }} />
      {label || "—"}
    </span>
  );
};

const NAV = [
  { key: "overview", label: "Overview", icon: "▦" },
  { key: "services", label: "My subscriptions", icon: "☰" },
  { key: "invoices", label: "Invoices", icon: "$" },
  { key: "tickets", label: "Support", icon: "✉" },
  { key: "plans", label: "Browse plans", icon: "◆" },
  { key: "software", label: "Software & licences", icon: "▧" },
  { key: "knowledge", label: "Knowledge base", icon: "?" },
  { key: "settings", label: "Settings", icon: "⚙" },
] as const;

async function api(path: string, init?: RequestInit) {
  return fetch(path, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...init,
  });
}

export default function PortalApp() {
  const [view, setView] = useState<View>("loading");
  const [me, setMe] = useState<Me | null>(null);
  const [tab, setTab] = useState("overview");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [tkSel, setTkSel] = useState<string | null>(null);
  const [kbSel, setKbSel] = useState<string | null>(null);
  const [catalog, setCatalog] = useState<SwProduct[] | null>(null);
  const [swSel, setSwSel] = useState<string | null>(null);
  const [swCat, setSwCat] = useState("All");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flash = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3000);
  }, []);
  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  const loadMe = useCallback(async (): Promise<boolean> => {
    try {
      const res = await api("/api/portal/me");
      const data = await res.json();
      if (data.authenticated) {
        setMe(data as Me);
        return true;
      }
    } catch {
      /* ignore */
    }
    setMe(null);
    return false;
  }, []);

  useEffect(() => {
    // Async session bootstrap on mount: load the customer, then show the
    // dashboard or the sign-in screen. setState runs after the await, not
    // synchronously in the effect body.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadMe().then((ok) => setView(ok ? "dash" : "login"));
  }, [loadMe]);

  useEffect(() => {
    if (view !== "dash" || catalog) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    api("/api/portal/software")
      .then((r) => r.json())
      .then((d) => setCatalog(d.products || []))
      .catch(() => setCatalog([]));
  }, [view, catalog]);

  async function onLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget;
    const email = (f.elements.namedItem("email") as HTMLInputElement).value.trim();
    const password = (f.elements.namedItem("password") as HTMLInputElement).value;
    if (!email || !password) return setError("Enter your email and password.");
    setBusy(true);
    setError("");
    try {
      const res = await api("/api/customers/login", { method: "POST", body: JSON.stringify({ email, password }) });
      if (!res.ok) throw new Error();
      await loadMe();
      setTab("overview");
      setView("dash");
    } catch {
      setError("Incorrect email or password.");
    } finally {
      setBusy(false);
    }
  }

  async function onRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget;
    const get = (n: string) => (f.elements.namedItem(n) as HTMLInputElement)?.value.trim() ?? "";
    const body = { name: get("name"), company: get("company"), email: get("email"), phone: get("phone"), password: get("password") };
    if (!body.name || !body.email || body.password.length < 8) {
      return setError("Fill in your name, email and a password of at least 8 characters.");
    }
    setBusy(true);
    setError("");
    try {
      const res = await api("/api/portal/register", { method: "POST", body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not create your account.");
      // Auto-login.
      await api("/api/customers/login", { method: "POST", body: JSON.stringify({ email: body.email, password: body.password }) });
      await loadMe();
      setView("dash");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create your account.");
    } finally {
      setBusy(false);
    }
  }

  async function onForgot(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = ((e.currentTarget.elements.namedItem("email") as HTMLInputElement).value || "").trim();
    if (!email) return setError("Enter your email.");
    setBusy(true);
    setError("");
    try {
      await api("/api/customers/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
    } catch {
      /* don't leak whether the email exists */
    } finally {
      setBusy(false);
      setView("login");
      flash("If that email has an account, a reset link is on its way.");
    }
  }

  async function logout() {
    try {
      await api("/api/customers/logout", { method: "POST" });
    } catch {
      /* ignore */
    }
    setMe(null);
    setView("login");
    setTab("overview");
  }

  async function payInvoice(invoiceId: string) {
    setBusy(true);
    try {
      const res = await api("/api/portal/checkout", { method: "POST", body: JSON.stringify({ invoiceId }) });
      const data = await res.json().catch(() => ({}));
      if (res.status === 501) {
        flash("Online payment isn't enabled yet — please pay via your usual method.");
      } else if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        flash(data.error || "Could not start checkout.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function submitTicket(subject: string, department: string, message: string) {
    const res = await api("/api/portal/tickets", { method: "POST", body: JSON.stringify({ subject, department, message }) });
    if (res.ok) {
      await loadMe();
      setTkSel(null);
      flash("Ticket created — our team will respond shortly.");
    } else {
      flash("Could not create the ticket.");
    }
  }

  async function replyTicket(id: string, message: string) {
    const res = await api(`/api/portal/tickets/${id}/reply`, { method: "POST", body: JSON.stringify({ message }) });
    if (res.ok) await loadMe();
    else flash("Could not send your reply.");
  }

  /* ------------------------------- LOADING ------------------------------- */
  if (view === "loading") {
    return (
      <div className="grid min-h-screen place-items-center bg-ink-950 text-muted">
        <div className="animate-pulse font-mono text-sm">Loading your portal…</div>
      </div>
    );
  }

  /* -------------------------------- AUTH --------------------------------- */
  if (view !== "dash" || !me) {
    return (
      <div className="grid min-h-screen lg:grid-cols-2">
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
              Track subscriptions, pay invoices, and reach your engineers — the SyberInfo client portal.
            </p>
          </div>
          <div className="relative font-mono text-[12px] text-white/60">© {new Date().getFullYear()} SyberInfo Pty Ltd</div>
        </div>

        <div className="flex items-center justify-center bg-ink-950 px-5 py-16">
          <div className="w-full max-w-[400px]">
            {view !== "forgot" && (
              <div className="mb-7 flex rounded-[11px] bg-white/[.04] p-1">
                <button onClick={() => { setView("login"); setError(""); }} className={`flex-1 rounded-[9px] py-2.5 text-sm font-semibold transition-colors ${view === "login" ? "bg-foreground text-ink-950" : "text-muted-2"}`}>Sign in</button>
                <button onClick={() => { setView("register"); setError(""); }} className={`flex-1 rounded-[9px] py-2.5 text-sm font-semibold transition-colors ${view === "register" ? "bg-foreground text-ink-950" : "text-muted-2"}`}>Create account</button>
              </div>
            )}

            {view === "login" && (
              <form onSubmit={onLogin} className="flex flex-col gap-4">
                <h2 className="font-display text-2xl font-bold tracking-[-.02em]">Welcome back</h2>
                <label className="flex flex-col gap-1.5 text-[12.5px] font-medium text-muted-2">Email<input name="email" type="email" autoComplete="email" placeholder="you@company.com.au" className={input} /></label>
                <label className="flex flex-col gap-1.5 text-[12.5px] font-medium text-muted-2">Password<input name="password" type="password" autoComplete="current-password" placeholder="••••••••" className={input} /></label>
                {error && <p className="text-[13px] text-[#ff8a8a]">{error}</p>}
                <button disabled={busy} className="mt-1 w-full rounded-[11px] bg-indigo py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_26px_rgba(94,91,255,.4)] disabled:opacity-60">{busy ? "Signing in…" : "Sign in →"}</button>
                <button type="button" onClick={() => { setView("forgot"); setError(""); }} className="text-center text-[13px] text-muted-2 hover:text-foreground">Forgot your password?</button>
              </form>
            )}

            {view === "register" && (
              <form onSubmit={onRegister} className="flex flex-col gap-4">
                <h2 className="font-display text-2xl font-bold tracking-[-.02em]">Create your account</h2>
                <label className="flex flex-col gap-1.5 text-[12.5px] font-medium text-muted-2">Full name<input name="name" placeholder="Jane Doe" className={input} /></label>
                <label className="flex flex-col gap-1.5 text-[12.5px] font-medium text-muted-2">Company<input name="company" placeholder="Acme Pty Ltd" className={input} /></label>
                <label className="flex flex-col gap-1.5 text-[12.5px] font-medium text-muted-2">Work email<input name="email" type="email" placeholder="jane@company.com.au" className={input} /></label>
                <label className="flex flex-col gap-1.5 text-[12.5px] font-medium text-muted-2">Mobile<input name="phone" placeholder="0400 000 000" className={input} /></label>
                <label className="flex flex-col gap-1.5 text-[12.5px] font-medium text-muted-2">Password<input name="password" type="password" placeholder="At least 8 characters" className={input} /></label>
                {error && <p className="text-[13px] text-[#ff8a8a]">{error}</p>}
                <button disabled={busy} className="mt-1 w-full rounded-[11px] bg-indigo py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_26px_rgba(94,91,255,.4)] disabled:opacity-60">{busy ? "Creating…" : "Create account →"}</button>
              </form>
            )}

            {view === "forgot" && (
              <form onSubmit={onForgot} className="flex flex-col gap-4">
                <h2 className="font-display text-2xl font-bold tracking-[-.02em]">Reset your password</h2>
                <p className="text-[14px] text-muted-2">Enter your email and we&rsquo;ll send a reset link.</p>
                <label className="flex flex-col gap-1.5 text-[12.5px] font-medium text-muted-2">Email<input name="email" type="email" placeholder="you@company.com.au" className={input} /></label>
                {error && <p className="text-[13px] text-[#ff8a8a]">{error}</p>}
                <button disabled={busy} className="mt-1 w-full rounded-[11px] bg-indigo py-3.5 text-[15px] font-semibold text-white disabled:opacity-60">{busy ? "Sending…" : "Send reset link →"}</button>
                <button type="button" onClick={() => { setView("login"); setError(""); }} className="text-center text-[13px] text-muted-2 hover:text-foreground">← Back to sign in</button>
              </form>
            )}
          </div>
        </div>
        {toast && <div className="fixed bottom-6 left-1/2 z-[80] -translate-x-1/2 rounded-full border border-white/[.12] bg-ink-800 px-5 py-3 text-sm text-foreground shadow-xl">{toast}</div>}
      </div>
    );
  }

  /* ------------------------------ DASHBOARD ------------------------------ */
  const { customer } = me;
  const firstName = (customer.name || "there").split(" ")[0];
  const initials = (customer.name || "C").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const today = new Date().toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" }).toUpperCase();

  return (
    <div className="flex min-h-screen bg-ink-950">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-[248px] flex-none flex-col gap-1 border-r border-white/[.06] bg-ink-900 p-4 md:flex">
        <Link href="/" className="mb-4 flex items-center gap-2.5 px-2 py-1.5 text-foreground">
          <span className="grid h-[30px] w-[30px] place-items-center rounded-lg bg-indigo font-display text-[16px] font-extrabold text-white">S</span>
          <span className="font-display text-[17px] font-bold tracking-[-.02em]">SyberInfo</span>
        </Link>
        {NAV.map((t) => {
          const on = tab === t.key;
          const badge = t.key === "tickets" ? me.tickets.filter((k) => k.status !== "closed").length : 0;
          return (
            <button key={t.key} onClick={() => { setTab(t.key); setTkSel(null); setKbSel(null); }} className={`flex items-center gap-3 rounded-[10px] px-3 py-[11px] text-sm transition-colors ${on ? "bg-indigo/[.16] font-semibold text-foreground" : "text-muted-2 hover:bg-white/[.04]"}`}>
              <span className="grid h-5 w-5 place-items-center text-[13px]" style={{ color: on ? "#9d9bff" : undefined }}>{t.icon}</span>
              <span className="flex-1 text-left">{t.label}</span>
              {badge > 0 && <span className="rounded-full bg-indigo px-2 py-0.5 text-[11px] font-semibold text-white">{badge}</span>}
            </button>
          );
        })}
        <div className="mt-auto rounded-[12px] border border-white/[.08] bg-white/[.02] p-4">
          <div className="text-[13px] font-semibold">Need a hand?</div>
          <p className="mt-1 text-[12px] leading-[1.5] text-muted-3">Open a ticket and an engineer will jump in.</p>
          <button onClick={() => { setTab("tickets"); setTkSel("new"); }} className="mt-3 w-full rounded-[9px] bg-indigo py-2 text-[13px] font-semibold text-white">New ticket</button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-white/[.06] bg-ink-950/90 px-5 py-3.5 backdrop-blur-md sm:px-8">
          <select value={tab} onChange={(e) => { setTab(e.target.value); setTkSel(null); setKbSel(null); }} className="rounded-lg border border-white/[.12] bg-white/[.03] px-3 py-2 text-sm text-foreground md:hidden">
            {NAV.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
          <div className="hidden md:block">
            <div className="font-mono text-[11px] tracking-[.06em] text-muted-3">{today}</div>
            <div className="font-display text-[19px] font-bold tracking-[-.02em]">Welcome back, {firstName}</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-indigo/[.18] font-display text-[13px] font-bold text-indigo">{initials}</span>
              <span className="hidden text-sm sm:block">{customer.name}</span>
            </div>
            <button onClick={logout} className="rounded-[9px] border border-white/[.12] px-3 py-2 text-[13px] font-semibold text-muted transition-colors hover:text-foreground">Log out</button>
          </div>
        </header>

        <main className="flex-1 px-5 py-7 sm:px-8">
          {tab === "overview" && <Overview me={me} setTab={setTab} />}
          {tab === "services" && <Services subs={me.subscriptions} domains={me.domains} onUpgrade={() => setTab("plans")} />}
          {tab === "invoices" && <Invoices invoices={me.invoices} onPay={payInvoice} busy={busy} />}
          {tab === "tickets" && <Tickets tickets={me.tickets} sel={tkSel} setSel={setTkSel} onCreate={submitTicket} onReply={replyTicket} custName={customer.name || customer.email} />}
          {tab === "plans" && <Plans onRequest={(name) => submitTicket(`Plan change request: ${name}`, "sales", `I'd like to move to the ${name} plan.`)} />}
          {tab === "software" && (
            <Software
              catalog={catalog}
              sel={swSel}
              setSel={setSwSel}
              cat={swCat}
              setCat={setSwCat}
              onRequest={(label) => submitTicket(`Licence request: ${label}`, "sales", `Please quote and provision: ${label}.`)}
            />
          )}
          {tab === "knowledge" && <Knowledge sel={kbSel} setSel={setKbSel} />}
          {tab === "settings" && <Settings customer={customer} onReset={() => api("/api/customers/forgot-password", { method: "POST", body: JSON.stringify({ email: customer.email }) }).then(() => flash("Password reset link sent to your email."))} />}
        </main>
      </div>

      {toast && <div className="fixed bottom-6 left-1/2 z-[80] -translate-x-1/2 rounded-full border border-white/[.12] bg-ink-800 px-5 py-3 text-sm text-foreground shadow-xl">{toast}</div>}
    </div>
  );
}

/* ============================ Tabs ============================ */
const Empty = ({ children }: { children: React.ReactNode }) => (
  <div className={`${card} px-6 py-12 text-center text-[14px] text-muted-2`}>{children}</div>
);

function Overview({ me, setTab }: { me: Me; setTab: (t: string) => void }) {
  const active = me.subscriptions.filter((s) => s.status === "active").length;
  const openTickets = me.tickets.filter((t) => t.status !== "closed").length;
  const nextInvoice = me.invoices.find((i) => i.status === "unpaid" || i.status === "overdue");
  const monthly = me.subscriptions
    .filter((s) => s.status === "active")
    .reduce((sum, s) => sum + (s.recurringAmount || 0), 0);
  const tiles = [
    { label: "Active subscriptions", value: String(active), tab: "services" },
    { label: "Open tickets", value: String(openTickets), tab: "tickets" },
    { label: "Next invoice", value: nextInvoice ? money(nextInvoice.total) : "—", tab: "invoices" },
    { label: "Monthly spend", value: money(monthly), tab: "services" },
  ];
  return (
    <div className="mx-auto max-w-[1100px]">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <button key={t.label} onClick={() => setTab(t.tab)} className={`${card} px-5 py-6 text-left transition-colors hover:border-indigo/40`}>
            <div className="font-display text-[30px] font-bold tracking-[-.02em]">{t.value}</div>
            <div className="mt-1 text-[13px] text-muted-2">{t.label}</div>
          </button>
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className={`${card} p-6`}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold tracking-[-.01em]">Your subscriptions</h2>
            <button onClick={() => setTab("services")} className="text-[13px] font-semibold text-lime">View all →</button>
          </div>
          {me.subscriptions.length === 0 ? (
            <p className="text-[14px] text-muted-2">No active subscriptions yet. Browse plans to get started.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {me.subscriptions.slice(0, 5).map((s) => (
                <div key={s.id} className="flex items-center gap-3.5">
                  <span className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-indigo/[.12] text-lg text-indigo">☰</span>
                  <div className="flex-1"><div className="text-[14.5px] font-medium">{s.label}</div><div className="text-[12.5px] text-muted-3">{s.billingCycle} · {money(s.recurringAmount)}</div></div>
                  <Pill label={s.status} />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className={`${card} p-6`}>
          <h2 className="mb-4 font-display text-lg font-semibold tracking-[-.01em]">Recent invoices</h2>
          {me.invoices.length === 0 ? (
            <p className="text-[14px] text-muted-2">No invoices yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {me.invoices.slice(0, 4).map((iv) => (
                <div key={iv.id} className="flex items-center justify-between gap-2">
                  <div><div className="text-[13.5px] font-medium">{iv.number}</div><div className="text-[11.5px] text-muted-3">{dateAU(iv.dueDate)}</div></div>
                  <div className="text-right"><div className="font-display text-[14px] font-bold">{money(iv.total)}</div><Pill label={iv.status} /></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Services({ subs, domains, onUpgrade }: { subs: Subscription[]; domains: Domain[]; onUpgrade: () => void }) {
  return (
    <div className="mx-auto max-w-[1100px]">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-[22px] font-bold tracking-[-.02em]">My subscriptions</h2>
        <button onClick={onUpgrade} className="rounded-full bg-indigo px-5 py-2.5 text-[13px] font-semibold text-white">Browse plans →</button>
      </div>
      {subs.length === 0 ? (
        <Empty>You don&rsquo;t have any active subscriptions yet.</Empty>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {subs.map((s) => (
            <div key={s.id} className={`${card} p-6`}>
              <div className="flex items-start justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-indigo/[.12] text-xl text-indigo">☰</span>
                <Pill label={s.status} />
              </div>
              <h3 className="mt-4 font-display text-[18px] font-semibold tracking-[-.01em]">{s.label}</h3>
              {s.domain && <p className="mt-1 text-[13px] text-muted-3">{s.domain}</p>}
              <div className="mt-4 flex items-end justify-between">
                <div><span className="font-display text-2xl font-bold tracking-[-.02em]">{money(s.recurringAmount)}</span><span className="text-[13px] text-muted-3"> / {s.billingCycle || "mo"}</span></div>
                <span className="text-[12px] text-muted-3">Renews {dateAU(s.nextDueDate)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {domains.length > 0 && (
        <>
          <h2 className="mb-4 mt-10 font-display text-[22px] font-bold tracking-[-.02em]">Domains</h2>
          <div className={`${card} divide-y divide-white/[.06]`}>
            {domains.map((d) => (
              <div key={d.id} className="flex items-center gap-4 px-6 py-4">
                <div className="flex-1 font-mono text-[14px]">{d.domain}</div>
                <span className="text-[12.5px] text-muted-3">Expires {dateAU(d.expiryDate)}</span>
                <Pill label={d.status} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Invoices({ invoices, onPay, busy }: { invoices: Invoice[]; onPay: (id: string) => void; busy: boolean }) {
  return (
    <div className="mx-auto max-w-[1000px]">
      <h2 className="mb-5 font-display text-[22px] font-bold tracking-[-.02em]">Invoices &amp; billing</h2>
      {invoices.length === 0 ? (
        <Empty>No invoices yet.</Empty>
      ) : (
        <div className={`${card} divide-y divide-white/[.06]`}>
          {invoices.map((iv) => {
            const payable = iv.status === "unpaid" || iv.status === "overdue";
            return (
              <div key={iv.id} className="flex flex-wrap items-center gap-4 px-6 py-4">
                <div className="min-w-[120px]"><div className="font-mono text-[13px] font-semibold">{iv.number}</div><div className="text-[12px] text-muted-3">Due {dateAU(iv.dueDate)}</div></div>
                <div className="flex-1" />
                <Pill label={iv.status} />
                <div className="w-24 text-right font-display text-[16px] font-bold">{money(iv.total)}</div>
                {payable ? (
                  <button disabled={busy} onClick={() => onPay(iv.id)} className="rounded-[9px] bg-indigo px-4 py-2 text-[12.5px] font-semibold text-white disabled:opacity-60">Pay now</button>
                ) : (
                  <span className="w-[68px] text-right text-[12.5px] text-muted-3">Paid {iv.paidDate ? dateAU(iv.paidDate) : ""}</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Tickets({ tickets, sel, setSel, onCreate, onReply, custName }: {
  tickets: Ticket[]; sel: string | null; setSel: (s: string | null) => void;
  onCreate: (subject: string, dept: string, message: string) => void;
  onReply: (id: string, message: string) => void; custName: string;
}) {
  if (sel === "new") {
    return (
      <div className="mx-auto max-w-[640px]">
        <button onClick={() => setSel(null)} className="mb-5 text-sm text-muted hover:text-foreground">← Back to tickets</button>
        <div className={`${card} p-7`}>
          <h2 className="mb-5 font-display text-[20px] font-bold tracking-[-.02em]">New support ticket</h2>
          <form onSubmit={(e) => { e.preventDefault(); const f = e.currentTarget; onCreate((f.elements.namedItem("subject") as HTMLInputElement).value, (f.elements.namedItem("dept") as HTMLSelectElement).value, (f.elements.namedItem("message") as HTMLTextAreaElement).value); }} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-[12.5px] font-medium text-muted-2">Subject<input name="subject" required placeholder="Short summary" className={input} /></label>
            <label className="flex flex-col gap-1.5 text-[12.5px] font-medium text-muted-2">Department<select name="dept" className={input}><option value="support">Support</option><option value="billing">Billing</option><option value="sales">Sales</option></select></label>
            <label className="flex flex-col gap-1.5 text-[12.5px] font-medium text-muted-2">Details<textarea name="message" required rows={5} placeholder="Tell us what's happening…" className={`${input} resize-y`} /></label>
            <button className="mt-1 w-full rounded-[11px] bg-indigo py-3.5 text-[15px] font-semibold text-white">Create ticket →</button>
          </form>
        </div>
      </div>
    );
  }
  const rec = sel ? tickets.find((t) => t.id === sel) : null;
  if (rec) {
    return (
      <div className="mx-auto max-w-[760px]">
        <button onClick={() => setSel(null)} className="mb-5 text-sm text-muted hover:text-foreground">← Back to tickets</button>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="font-display text-[20px] font-bold tracking-[-.02em]">{rec.subject}</h2><p className="mt-1 font-mono text-[12px] text-muted-3 capitalize">{rec.department} · {rec.priority} priority</p></div>
          <Pill label={rec.status} />
        </div>
        <div className={`${card} p-6`}>
          <div className="flex flex-col gap-4">
            {rec.messages.length === 0 && <p className="text-[14px] text-muted-2">No messages yet.</p>}
            {rec.messages.map((m, i) => {
              const you = m.author === custName;
              return (
                <div key={i} className={`max-w-[85%] rounded-[14px] px-4 py-3 text-[14px] leading-[1.5] ${you ? "self-end bg-indigo text-white" : "self-start bg-white/[.05] text-[#d5dae3]"}`}>
                  <div className="mb-1 text-[11px] opacity-70">{m.author}</div>{m.message}
                </div>
              );
            })}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); const f = e.currentTarget; const v = (f.elements.namedItem("reply") as HTMLInputElement).value.trim(); if (!v) return; onReply(rec.id, v); f.reset(); }} className="mt-5 flex gap-2">
            <input name="reply" placeholder="Type a reply…" className={input} />
            <button className="flex-none rounded-[11px] bg-indigo px-5 text-[14px] font-semibold text-white">Send</button>
          </form>
        </div>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-[1000px]">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-[22px] font-bold tracking-[-.02em]">Support tickets</h2>
        <button onClick={() => setSel("new")} className="rounded-full bg-indigo px-5 py-2.5 text-[13px] font-semibold text-white">+ New ticket</button>
      </div>
      {tickets.length === 0 ? (
        <Empty>No tickets yet. Open one and an engineer will respond.</Empty>
      ) : (
        <div className="flex flex-col gap-3">
          {tickets.map((t) => (
            <button key={t.id} onClick={() => setSel(t.id)} className={`${card} flex flex-wrap items-center justify-between gap-3 p-5 text-left transition-colors hover:border-indigo/40`}>
              <div><div className="text-[15px] font-semibold">{t.subject}</div><div className="mt-1 font-mono text-[12px] text-muted-3 capitalize">{t.department} · {t.priority} priority</div></div>
              <Pill label={t.status} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Software({ catalog, sel, setSel, cat, setCat, onRequest }: {
  catalog: SwProduct[] | null;
  sel: string | null; setSel: (s: string | null) => void;
  cat: string; setCat: (c: string) => void;
  onRequest: (label: string) => void;
}) {
  const money = (n: number) => "$" + (Number.isInteger(n) ? n : n.toFixed(2));
  const [qty, setQty] = useState<Record<string, number>>({});
  const step = (k: string, d: number) => setQty((q) => ({ ...q, [k]: Math.max(1, (q[k] || 1) + d) }));

  if (catalog === null) {
    return <div className={`${card} px-6 py-12 text-center text-[14px] text-muted-2`}>Loading catalogue…</div>;
  }

  const product = sel ? catalog.find((w) => w.id === sel) : null;
  if (product) {
    return (
      <div className="mx-auto max-w-[900px]">
        <button onClick={() => setSel(null)} className="mb-5 text-sm text-muted hover:text-foreground">← All software</button>
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-2xl font-display text-2xl font-bold text-white" style={{ background: product.color }}>{product.letter}</span>
          <div>
            <h2 className="font-display text-[22px] font-bold tracking-[-.02em]">{product.name}</h2>
            <p className="text-[13px] text-muted-2">{product.brand} · {product.category} — {product.tagline}</p>
          </div>
        </div>
        <h3 className="mb-3 mt-7 font-display text-lg font-semibold">Licence plans</h3>
        <div className="flex flex-col gap-3">
          {product.plans.map((p) => {
            const key = `${product.id}:${p.name}`;
            const q = qty[key] || 1;
            return (
              <div key={p.name} className={`${card} flex flex-wrap items-center gap-4 p-5`}>
                <div className="min-w-[180px] flex-1">
                  <div className="text-[15px] font-semibold">{p.name}</div>
                  <div className="text-[12.5px] text-muted-3">{p.feat}</div>
                </div>
                <div className="text-right"><div className="font-display text-lg font-bold">{money(p.price)}</div><div className="text-[11px] text-muted-3">{p.unit}</div></div>
                <div className="flex items-center gap-1 rounded-[10px] border border-white/[.12] px-1">
                  <button onClick={() => step(key, -1)} className="grid h-8 w-8 place-items-center text-muted hover:text-foreground">−</button>
                  <span className="w-6 text-center text-[14px]">{q}</span>
                  <button onClick={() => step(key, 1)} className="grid h-8 w-8 place-items-center text-muted hover:text-foreground">+</button>
                </div>
                <button onClick={() => onRequest(`${product.name} — ${p.name} × ${q} (≈ ${money(p.price * q)} ${p.unit})`)} className="flex-none rounded-[10px] bg-indigo px-4 py-2.5 text-[13px] font-semibold text-white">Request</button>
              </div>
            );
          })}
        </div>
        {product.addons.length > 0 && (
          <>
            <h3 className="mb-3 mt-7 font-display text-lg font-semibold">Add-ons</h3>
            <div className="flex flex-col gap-3">
              {product.addons.map((a) => (
                <div key={a.name} className={`${card} flex items-center gap-4 p-5`}>
                  <div className="flex-1"><div className="text-[15px] font-semibold">{a.name}</div><div className="text-[12.5px] text-muted-3">{a.desc}</div></div>
                  <div className="font-display text-lg font-bold">{money(a.price)}<span className="text-[11px] text-muted-3"> /mo</span></div>
                  <button onClick={() => onRequest(`${product.name} add-on — ${a.name}`)} className="flex-none rounded-[10px] bg-indigo px-4 py-2.5 text-[13px] font-semibold text-white">Request</button>
                </div>
              ))}
            </div>
          </>
        )}
        <p className="mt-5 text-[13px] text-muted-3">Requesting opens a ticket with our team — we&rsquo;ll confirm pricing, provision the licences and add them to your next invoice.</p>
      </div>
    );
  }

  const cats = ["All", ...Array.from(new Set(catalog.map((w) => w.category)))];
  const list = catalog.filter((w) => cat === "All" || w.category === cat);
  return (
    <div className="mx-auto max-w-[1100px]">
      <h2 className="mb-4 font-display text-[22px] font-bold tracking-[-.02em]">Software &amp; licences</h2>
      {catalog.length === 0 ? (
        <div className={`${card} px-6 py-12 text-center text-[14px] text-muted-2`}>No software in the catalogue yet.</div>
      ) : (
        <>
          <div className="mb-6 flex flex-wrap gap-2">
            {cats.map((c) => (
              <button key={c} onClick={() => setCat(c)} className={`rounded-full border px-3.5 py-1.5 text-[13px] transition-colors ${c === cat ? "border-indigo bg-indigo/[.16] text-foreground" : "border-white/[.12] text-muted"}`}>{c}</button>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((w) => (
              <button key={w.id} onClick={() => setSel(w.id)} className={`${card} p-5 text-left transition-colors hover:border-indigo/40`}>
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl font-display text-lg font-bold text-white" style={{ background: w.color }}>{w.letter}</span>
                  <div><div className="text-[15px] font-semibold">{w.name}</div><div className="text-[12px] text-muted-3">{w.category}</div></div>
                </div>
                <p className="mt-3 text-[13px] leading-[1.5] text-muted-2">{w.tagline}</p>
                {w.plans.length > 0 && (
                  <div className="mt-3 font-mono text-[12px] text-lime">from ${Math.min(...w.plans.map((p) => p.price))} /user</div>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Plans({ onRequest }: { onRequest: (name: string) => void }) {
  return (
    <div className="mx-auto max-w-[1100px]">
      <h2 className="mb-5 font-display text-[22px] font-bold tracking-[-.02em]">Managed IT plans</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {planTiersPortal.map((t) => (
          <div key={t.name} className={`relative rounded-[18px] border p-6 ${t.popular ? "border-indigo/50 shadow-[0_10px_40px_rgba(94,91,255,.12)]" : "border-white/[.08]"} bg-white/[.018]`}>
            {t.popular && <div className="absolute right-5 top-5 rounded-full bg-lime px-2.5 py-1 font-mono text-[10px] font-semibold text-ink-950">POPULAR</div>}
            <div className="font-mono text-[12px] tracking-[.05em] text-indigo">{t.name}</div>
            <div className="mt-3 flex items-baseline gap-1"><span className="font-display text-[34px] font-bold tracking-[-.03em]">{t.price}</span><span className="text-[13px] text-muted-3">{t.per}</span></div>
            <p className="mt-2 min-h-[40px] text-[13px] leading-[1.5] text-muted-2">{t.tagline}</p>
            <div className="mt-4 flex flex-col gap-2.5">{t.features.map((f) => <div key={f} className="flex items-start gap-2 text-[13.5px] text-[#c4cad4]"><span className="mt-0.5 text-lime">✔</span>{f}</div>)}</div>
            <button onClick={() => onRequest(t.name.charAt(0) + t.name.slice(1).toLowerCase())} className="mt-6 w-full rounded-[11px] bg-indigo py-3 text-[14px] font-semibold text-white">Request this plan</button>
          </div>
        ))}
      </div>
      <p className="mt-5 text-center text-[13px] text-muted-3">Requesting a plan opens a ticket with our team — we&rsquo;ll confirm pricing and prorate your next invoice.</p>
    </div>
  );
}

function Knowledge({ sel, setSel }: { sel: string | null; setSel: (s: string | null) => void }) {
  const article = sel ? kbArticles.find((a) => a.id === sel) : null;
  if (article) {
    return (
      <div className="mx-auto max-w-[760px]">
        <button onClick={() => setSel(null)} className="mb-5 text-sm text-muted hover:text-foreground">← Knowledge base</button>
        <div className="mb-2 font-mono text-[12px] tracking-[.05em] text-indigo">{article.cat.toUpperCase()} · {article.read}</div>
        <h1 className="font-display text-[clamp(24px,3.5vw,36px)] font-bold tracking-[-.02em]">{article.title}</h1>
        <div className="mt-6 flex flex-col gap-4">{article.body.map((p, i) => <p key={i} className="text-[16px] leading-[1.7] text-[#c4cad4]">{p}</p>)}</div>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-[1000px]">
      <h2 className="mb-5 font-display text-[22px] font-bold tracking-[-.02em]">Knowledge base</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {kbArticles.map((a) => (
          <button key={a.id} onClick={() => setSel(a.id)} className={`${card} p-5 text-left transition-colors hover:border-indigo/40`}>
            <div className="mb-2 font-mono text-[11.5px] tracking-[.05em] text-indigo">{a.cat.toUpperCase()} · {a.read}</div>
            <h3 className="font-display text-[16px] font-semibold tracking-[-.01em]">{a.title}</h3>
            <p className="mt-1.5 text-[13.5px] leading-[1.5] text-muted-2">{a.excerpt}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function Settings({ customer, onReset }: { customer: Customer; onReset: () => void }) {
  const rows = [
    { k: "Full name", v: customer.name },
    { k: "Company", v: customer.company || "—" },
    { k: "Email", v: customer.email },
    { k: "Mobile", v: customer.phone || "—" },
  ];
  return (
    <div className="mx-auto max-w-[760px]">
      <h2 className="mb-5 font-display text-[22px] font-bold tracking-[-.02em]">Profile &amp; settings</h2>
      <div className={`${card} divide-y divide-white/[.06]`}>
        {rows.map((r) => (
          <div key={r.k} className="flex items-center justify-between px-6 py-4"><span className="text-[13px] text-muted-3">{r.k}</span><span className="text-[14.5px] font-medium">{r.v}</span></div>
        ))}
      </div>
      <div className={`${card} mt-6 flex items-center justify-between p-6`}>
        <div><div className="text-[15px] font-semibold">Password</div><div className="mt-0.5 text-[13px] text-muted-3">We&rsquo;ll email you a secure reset link.</div></div>
        <button onClick={onReset} className="rounded-[10px] border border-white/[.16] px-4 py-2.5 text-[13px] font-semibold text-foreground">Reset password</button>
      </div>
    </div>
  );
}
