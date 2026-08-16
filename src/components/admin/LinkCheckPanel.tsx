"use client";

import { useState } from "react";

type Broken = { url: string; status: number; foundOn: string[] };
type Report = { pagesCrawled: number; linksChecked: number; broken: Broken[]; ranAt: string };

/**
 * Admin dashboard tool: crawl the site on demand and list broken internal
 * links. Uses the logged-in admin session against /api/admin/link-check.
 */
export default function LinkCheckPanel() {
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");

  async function run() {
    setState("busy");
    setError("");
    try {
      const res = await fetch("/api/admin/link-check", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Link check failed.");
        setState("error");
        return;
      }
      setReport(data);
      setState("done");
    } catch {
      setError("Network error.");
      setState("error");
    }
  }

  return (
    <div style={{ margin: "0 0 1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
        <h2 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0 }}>Broken link checker</h2>
        <button
          onClick={run}
          disabled={state === "busy"}
          style={{
            fontSize: "0.8rem",
            fontWeight: 600,
            padding: "0.35rem 0.85rem",
            borderRadius: "999px",
            border: "1px solid var(--theme-elevation-150)",
            background: "var(--theme-elevation-50)",
            color: "var(--theme-text)",
            cursor: state === "busy" ? "default" : "pointer",
            opacity: state === "busy" ? 0.6 : 1,
          }}
        >
          {state === "busy" ? "Crawling…" : "Run check"}
        </button>
      </div>

      {error && <p style={{ color: "#e0563f", fontSize: "0.85rem" }}>{error}</p>}

      {report && (
        <div style={{ fontSize: "0.85rem" }}>
          <p style={{ color: "var(--theme-elevation-600)", marginBottom: "0.75rem" }}>
            Crawled {report.pagesCrawled} pages, checked {report.linksChecked} internal links —{" "}
            <strong style={{ color: report.broken.length ? "#e0563f" : "#2f9e44" }}>
              {report.broken.length} broken
            </strong>
            .
          </p>
          {report.broken.length > 0 && (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
              <thead>
                <tr style={{ textAlign: "left", color: "var(--theme-elevation-500)" }}>
                  <th style={{ padding: "0.35rem 0.5rem" }}>Status</th>
                  <th style={{ padding: "0.35rem 0.5rem" }}>Broken link</th>
                  <th style={{ padding: "0.35rem 0.5rem" }}>Found on</th>
                </tr>
              </thead>
              <tbody>
                {report.broken.map((b) => (
                  <tr key={b.url} style={{ borderTop: "1px solid var(--theme-elevation-100)" }}>
                    <td style={{ padding: "0.35rem 0.5rem", color: "#e0563f", fontWeight: 600 }}>{b.status || "err"}</td>
                    <td style={{ padding: "0.35rem 0.5rem", fontFamily: "monospace" }}>{b.url}</td>
                    <td style={{ padding: "0.35rem 0.5rem", color: "var(--theme-elevation-600)" }}>
                      {b.foundOn.slice(0, 3).join(", ")}
                      {b.foundOn.length > 3 ? ` +${b.foundOn.length - 3}` : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
