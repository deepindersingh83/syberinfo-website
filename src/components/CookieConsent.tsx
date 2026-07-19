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
    <div className="glass fixed inset-x-0 bottom-0 z-[70] border-t border-white/10 bg-ink-900/[.96]">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-5 px-5 py-[18px] sm:px-10">
        <p className="m-0 max-w-[68ch] text-[13.5px] leading-relaxed text-muted">
          We use cookies to keep the site running smoothly and understand how
          it&rsquo;s used. You can accept all cookies or stick to the essentials
          only. See our{" "}
          <a href="/privacy" className="text-lime no-underline">
            Privacy Policy
          </a>
          .
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            onClick={() => decide(false)}
            className="rounded-full border border-white/[.18] bg-transparent px-5 py-[11px] text-[13.5px] font-semibold text-foreground"
          >
            Essentials only
          </button>
          <button
            onClick={() => decide(true)}
            className="rounded-full bg-indigo px-5 py-[11px] text-[13.5px] font-semibold text-white"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
