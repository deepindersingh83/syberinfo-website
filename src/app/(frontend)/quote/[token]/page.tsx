import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";
import QuoteAccept from "@/components/QuoteAccept";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Your proposal", robots: { index: false } };

type Params = { params: Promise<{ token: string }> };

const aud = (n: number) => new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(Number(n) || 0);
const fmt = (d?: string) => (d ? new Date(d).toLocaleDateString("en-AU", { day: "2-digit", month: "long", year: "numeric" }) : "");

async function getQuote(token: string) {
  try {
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: "quotes",
      where: { acceptToken: { equals: token } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });
    return (docs[0] as unknown as Record<string, unknown>) || null;
  } catch {
    return null;
  }
}

export default async function QuotePage({ params }: Params) {
  const { token } = await params;
  const quote = await getQuote(token);
  if (!quote) notFound();

  const items = Array.isArray(quote.items)
    ? (quote.items as { description?: string; quantity?: number; unitPrice?: number }[])
    : [];
  const accepted = quote.status === "accepted";
  const expired = !accepted && quote.validUntil ? new Date(quote.validUntil as string) < new Date() : false;

  return (
    <div className="relative z-[1] mx-auto max-w-[820px] px-5 pb-24 pt-32 sm:px-8">
      <div className="mb-2 font-mono text-[12.5px] tracking-[.06em] text-indigo">PROPOSAL · {String(quote.number || "")}</div>
      <h1 className="font-display text-[clamp(28px,5vw,42px)] font-bold tracking-[-.02em]">{String(quote.title || "Proposal")}</h1>
      <p className="mt-2 text-[15px] text-muted-2">
        Prepared for {String(quote.prospectName || "")} · valid until {fmt(quote.validUntil as string)}
      </p>

      {quote.intro ? <p className="mt-6 text-[15.5px] leading-relaxed text-muted">{String(quote.intro)}</p> : null}

      <div className="card mt-8 divide-y divide-white/[.06] p-0">
        {items.map((it, i) => {
          const qty = Number(it.quantity) || 1;
          const line = qty * (Number(it.unitPrice) || 0);
          return (
            <div key={i} className="flex items-center gap-4 px-6 py-4">
              <div className="flex-1">
                <div className="text-[15px] font-semibold">{it.description}</div>
                <div className="text-[12.5px] text-muted-3">
                  {qty} × {aud(Number(it.unitPrice) || 0)}
                </div>
              </div>
              <div className="font-display text-[16px] font-bold">{aud(line)}</div>
            </div>
          );
        })}
        <div className="flex flex-col gap-1.5 px-6 py-4 text-[14px]">
          <div className="flex justify-between text-muted-2"><span>Subtotal</span><span>{aud(Number(quote.subtotal) || 0)}</span></div>
          <div className="flex justify-between text-muted-2"><span>GST (10%)</span><span>{aud(Number(quote.tax) || 0)}</span></div>
          <div className="mt-1 flex justify-between font-display text-[18px] font-bold"><span>Total</span><span>{aud(Number(quote.total) || 0)}</span></div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
        <a
          href={`/api/quotes/${token}/pdf`}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-white/[.16] px-6 py-3 text-[14px] font-semibold text-foreground"
        >
          Download PDF
        </a>
      </div>

      <div className="mt-8">
        {expired ? (
          <div className="rounded-xl border border-[#E0B341]/30 bg-[#E0B341]/[.08] px-6 py-5 text-center text-[14px] text-[#e8c877]">
            This proposal has expired. Please contact us for an updated quote.
          </div>
        ) : (
          <QuoteAccept token={token} accepted={accepted} />
        )}
      </div>
    </div>
  );
}
