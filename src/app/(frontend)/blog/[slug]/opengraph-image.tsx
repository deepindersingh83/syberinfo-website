import { ImageResponse } from "next/og";
import { getPost } from "@/lib/content";
import { site } from "@/lib/site";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "SyberInfo article";

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  const title = post?.title ?? "SyberInfo Blog";
  const category = post?.category ?? "Insights";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "linear-gradient(135deg, #050816 0%, #111733 60%, #1b2347 100%)",
          color: "#e8ecff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 28 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #22d3ee, #8b5cf6)",
              color: "#050816",
              fontWeight: 800,
            }}
          >
            S
          </div>
          <span style={{ fontWeight: 700 }}>SyberInfo</span>
          <span style={{ color: "#22d3ee", marginLeft: 8 }}>· {category}</span>
        </div>
        <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.1, maxWidth: 1000 }}>
          {title}
        </div>
        <div style={{ fontSize: 28, color: "#9aa4c7" }}>{site.url.replace("https://", "")}</div>
      </div>
    ),
    { ...size },
  );
}
