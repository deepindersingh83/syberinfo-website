import { NextResponse } from "next/server";
import { saveDataRequest } from "@/lib/content";
import { verifyTurnstile } from "@/lib/turnstile";
import { rateLimit, clientIp } from "@/lib/rateLimit";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!rateLimit(`data-request:${ip}`, 5, 60_000).ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429 },
    );
  }

  let body: {
    email?: string;
    type?: string;
    details?: string;
    turnstileToken?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!(await verifyTurnstile(body.turnstileToken, ip))) {
    return NextResponse.json(
      { error: "Spam check failed. Please try again." },
      { status: 400 },
    );
  }

  const email = body.email?.trim().toLowerCase();
  const type = body.type === "delete" ? "delete" : "export";
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  const ok = await saveDataRequest(email, type, body.details?.trim());
  if (!ok) {
    return NextResponse.json(
      { error: "Could not submit your request. Please email us directly." },
      { status: 502 },
    );
  }
  return NextResponse.json({ ok: true });
}
