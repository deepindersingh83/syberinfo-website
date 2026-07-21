import { NextResponse } from "next/server";
import { saveSubscriber } from "@/lib/content";
import { rateLimit, clientIp } from "@/lib/rateLimit";

export const runtime = "nodejs";

function normaliseUrl(input: string): string | null {
  let u = input.trim();
  if (!u) return null;
  if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
  try {
    const parsed = new URL(u);
    if (!parsed.hostname.includes(".")) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const ip = clientIp(req);
  // PageSpeed calls are slow/expensive — keep this tight.
  if (!rateLimit(`audit:${ip}`, 5, 60_000).ok) {
    return NextResponse.json(
      { error: "Too many audits. Please wait a minute and try again." },
      { status: 429 },
    );
  }

  let body: { url?: string; email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const url = normaliseUrl(body.url || "");
  if (!url) {
    return NextResponse.json(
      { error: "Please enter a valid website address." },
      { status: 400 },
    );
  }

  // Optionally capture the email as a subscriber lead.
  const email = body.email?.trim().toLowerCase();
  if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    await saveSubscriber(email, "seo-audit");
  }

  const params = new URLSearchParams({ url, strategy: "mobile" });
  ["PERFORMANCE", "SEO", "ACCESSIBILITY", "BEST_PRACTICES"].forEach((c) =>
    params.append("category", c),
  );
  if (process.env.PAGESPEED_API_KEY) {
    params.append("key", process.env.PAGESPEED_API_KEY);
  }

  try {
    const res = await fetch(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params}`,
      { signal: AbortSignal.timeout(45_000) },
    );
    if (!res.ok) {
      return NextResponse.json(
        { error: "Could not analyse that URL. Check it's publicly reachable." },
        { status: 502 },
      );
    }
    const data = await res.json();
    const cats = data?.lighthouseResult?.categories ?? {};
    const audits = data?.lighthouseResult?.audits ?? {};
    const pct = (s: unknown) =>
      typeof s === "number" ? Math.round(s * 100) : null;

    return NextResponse.json({
      url: data?.id || url,
      scores: {
        performance: pct(cats.performance?.score),
        seo: pct(cats.seo?.score),
        accessibility: pct(cats.accessibility?.score),
        bestPractices: pct(cats["best-practices"]?.score),
      },
      metrics: {
        lcp: audits["largest-contentful-paint"]?.displayValue ?? "—",
        fcp: audits["first-contentful-paint"]?.displayValue ?? "—",
        cls: audits["cumulative-layout-shift"]?.displayValue ?? "—",
        tbt: audits["total-blocking-time"]?.displayValue ?? "—",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "The audit timed out. Please try again." },
      { status: 504 },
    );
  }
}
