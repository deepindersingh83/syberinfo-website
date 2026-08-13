/**
 * Client-side first-touch attribution. On the first page a visitor lands on we
 * capture the UTM parameters, referrer and landing path and stash them in
 * sessionStorage, so that whenever they later submit the contact form we can
 * attribute the lead to the campaign/source that brought them — even after they
 * navigate around the site. Safe to call in any client component.
 */

export type Attribution = {
  source?: string;
  medium?: string;
  campaign?: string;
  referrer?: string;
  landingPage?: string;
};

const KEY = "si_attribution";

/** Capture first-touch attribution once per session. Call on mount. */
export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  try {
    if (sessionStorage.getItem(KEY)) return; // first touch already recorded
    const p = new URLSearchParams(window.location.search);
    const data: Attribution = {
      source: p.get("utm_source") || undefined,
      medium: p.get("utm_medium") || undefined,
      campaign: p.get("utm_campaign") || undefined,
      referrer: document.referrer ? new URL(document.referrer).hostname : undefined,
      landingPage: window.location.pathname || undefined,
    };
    sessionStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* storage unavailable — ignore */
  }
}

/** Read the stored first-touch attribution (empty object if none). */
export function readAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Attribution) : {};
  } catch {
    return {};
  }
}
