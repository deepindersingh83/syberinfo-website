"use client";

import { useMemo, useState } from "react";

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const TIME_SLOTS = ["9:00 AM", "9:30 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"];

const expect = [
  { t: "A 30-minute call", d: "Video or phone — whatever suits you." },
  { t: "A real engineer", d: "Not a salesperson reading a script." },
  { t: "A written summary", d: "Key risks and recommended next steps, yours to keep." },
];

export default function BookingWidget() {
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const days = useMemo(() => {
    const list: Date[] = [];
    const dt = new Date();
    dt.setHours(0, 0, 0, 0);
    while (list.length < 9) {
      dt.setDate(dt.getDate() + 1);
      const wd = dt.getDay();
      if (wd === 0 || wd === 6) continue;
      list.push(new Date(dt));
    }
    return list.map((d) => ({
      iso: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      dow: DOW[d.getDay()],
      day: d.getDate(),
      mon: MON[d.getMonth()],
    }));
  }, []);

  const summary = (() => {
    if (!date) return "";
    const d = new Date(date + "T00:00:00");
    return `${DOW[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]}${time ? ` at ${time}` : ""}`;
  })();

  // When a real scheduler is configured (Cal.com / Calendly / Google), embed it
  // so bookings land straight in the team's calendar. Otherwise fall back to the
  // built-in day/time picker below.
  const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL;
  if (bookingUrl) {
    return (
      <div className="grid gap-8 lg:grid-cols-[1fr_1.6fr]">
        <div>
          <h2 className="mb-5 font-display text-[22px] font-bold tracking-[-.02em]">What to expect</h2>
          <div className="flex flex-col gap-4">
            {expect.map((e) => (
              <div key={e.t} className="flex items-start gap-3.5">
                <span className="mt-1 grid h-6 w-6 flex-none place-items-center rounded-full bg-lime/[.14] text-[13px] text-lime">
                  ✓
                </span>
                <div>
                  <div className="text-[15px] font-semibold">{e.t}</div>
                  <div className="text-[13.5px] text-muted-2">{e.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card overflow-hidden p-0">
          <iframe
            src={bookingUrl}
            title="Book a call with SyberInfo"
            className="h-[720px] w-full border-0"
            loading="lazy"
          />
        </div>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="card mx-auto max-w-[560px] px-8 py-12 text-center">
        <div className="mx-auto mb-5 grid h-[60px] w-[60px] place-items-center rounded-full bg-lime/[.14] text-[28px] text-lime">
          ✓
        </div>
        <h3 className="mb-3 font-display text-2xl font-bold tracking-[-.02em]">
          Your audit is booked.
        </h3>
        <p className="mx-auto mb-7 max-w-[38ch] text-[15px] leading-relaxed text-muted">
          We&rsquo;ve pencilled you in for <span className="text-foreground">{summary}</span>. A confirmation
          and calendar invite are on their way — an engineer will be in touch to confirm the details.
        </p>
        <button
          onClick={() => {
            setSent(false);
            setDate(null);
            setTime(null);
          }}
          className="rounded-full border border-white/[.16] px-[22px] py-[11px] text-sm font-semibold text-foreground"
        >
          Book another time
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
      {/* What to expect */}
      <div>
        <h2 className="mb-5 font-display text-[22px] font-bold tracking-[-.02em]">
          What to expect
        </h2>
        <div className="flex flex-col gap-4">
          {expect.map((e) => (
            <div key={e.t} className="flex items-start gap-3.5">
              <span className="mt-1 grid h-6 w-6 flex-none place-items-center rounded-full bg-lime/[.14] text-[13px] text-lime">
                ✓
              </span>
              <div>
                <div className="text-[15px] font-semibold">{e.t}</div>
                <div className="text-[13.5px] text-muted-2">{e.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Picker */}
      <div className="card px-7 py-7">
        <div className="mb-3 font-mono text-[12.5px] tracking-[.05em] text-indigo">1. PICK A DAY</div>
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
          {days.map((d) => {
            const on = date === d.iso;
            return (
              <button
                key={d.iso}
                onClick={() => {
                  setDate(d.iso);
                  setTime(null);
                }}
                className={`rounded-xl border px-2 py-3 text-center transition-colors ${
                  on ? "border-indigo bg-indigo/[.16]" : "border-white/10 bg-white/[.02] hover:border-white/20"
                }`}
              >
                <div className={`font-mono text-[11px] ${on ? "text-[#9d9bff]" : "text-muted-3"}`}>
                  {d.dow}
                </div>
                <div className={`font-display text-[20px] font-bold ${on ? "text-foreground" : "text-[#c4cad4]"}`}>
                  {d.day}
                </div>
                <div className="font-mono text-[10px] text-muted-3">{d.mon}</div>
              </button>
            );
          })}
        </div>

        <div className={`mt-6 transition-opacity ${date ? "opacity-100" : "pointer-events-none opacity-40"}`}>
          <div className="mb-3 font-mono text-[12.5px] tracking-[.05em] text-indigo">2. PICK A TIME</div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {TIME_SLOTS.map((t) => {
              const on = time === t;
              return (
                <button
                  key={t}
                  disabled={!date}
                  onClick={() => setTime(t)}
                  className={`rounded-xl border px-2 py-3 text-[13px] font-medium transition-colors ${
                    on
                      ? "border-indigo bg-indigo text-white"
                      : "border-white/[.12] bg-white/[.03] text-[#c4cad4] hover:border-white/25"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        <button
          disabled={!date || !time}
          onClick={() => setSent(true)}
          className="mt-7 w-full rounded-full bg-indigo px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_26px_rgba(94,91,255,.4)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {summary ? `Confirm ${summary} →` : "Select a day and time"}
        </button>
      </div>
    </div>
  );
}
