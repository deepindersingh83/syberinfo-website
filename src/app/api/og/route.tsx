import { ImageResponse } from "next/og";

export const runtime = "nodejs";

/**
 * Branded Open Graph / Twitter card image, rendered on demand.
 *   /api/og?title=…&kicker=…
 * Pages point og:image / twitter:image here so links unfurl with a proper
 * SyberInfo-branded card in Slack, LinkedIn, iMessage and AI answer engines —
 * previously they had no image at all. 1200×630, the standard OG size.
 */
export function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get("title") || "Managed IT, Cloud & Cybersecurity").slice(0, 120);
  const kicker = (searchParams.get("kicker") || "SyberInfo").slice(0, 60);

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0A0C10",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 10, background: "#5E5BFF" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 12,
              background: "#5E5BFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 28,
              fontWeight: 800,
            }}
          >
            S
          </div>
          <div style={{ color: "#C9F25E", fontSize: 26, fontWeight: 700, letterSpacing: 1 }}>{kicker}</div>
        </div>

        <div
          style={{
            display: "flex",
            color: "#F4F5F7",
            fontSize: title.length > 60 ? 64 : 78,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: -2,
            maxWidth: 1000,
          }}
        >
          {title}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ color: "#8A90A0", fontSize: 28 }}>syberinfo.com.au</div>
          <div style={{ color: "#8A90A0", fontSize: 24 }}>Managed IT · Cloud · Cybersecurity</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      // The card is deterministic by title/kicker, so let scrapers and CDNs
      // cache it hard instead of re-rendering on every unfurl.
      headers: { "Cache-Control": "public, max-age=31536000, immutable" },
    },
  );
}
