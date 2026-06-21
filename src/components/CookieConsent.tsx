"use client";

import { useEffect, useState } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const STORAGE_KEY = "syber-consent";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function loadAnalytics() {
  if (!GA_ID || document.getElementById("ga-script")) return;
  const s = document.createElement("script");
  s.id = "ga-script";
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA_ID, { anonymize_ip: true });
}

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const choice = localStorage.getItem(STORAGE_KEY);
    if (choice === "accepted") {
      loadAnalytics();
      return;
    }
    if (choice === "declined") return;
    // Show the banner on the next frame (client-only; avoids a synchronous
    // setState in the effect body and any hydration flash).
    const id = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(id);
  }, []);

  function decide(accepted: boolean) {
    localStorage.setItem(STORAGE_KEY, accepted ? "accepted" : "declined");
    if (accepted) loadAnalytics();
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl rounded-2xl glass p-5 shadow-2xl sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <p className="flex-1 text-sm text-muted">
          We use cookies to analyse traffic and improve your experience. See our
          approach to privacy. You can accept or decline analytics cookies.
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => decide(false)}
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold transition-colors hover:bg-white/10"
          >
            Decline
          </button>
          <button
            onClick={() => decide(true)}
            className="rounded-full bg-gradient-to-r from-cyan-glow to-violet-glow px-4 py-2 text-sm font-semibold text-ink-950 transition-transform hover:scale-[1.03]"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
