import { NextResponse } from "next/server";
import { site } from "@/lib/site";

export const runtime = "nodejs";

type Payload = {
  name?: string;
  email?: string;
  phone?: string;
  service?: string;
  message?: string;
  company_website?: string; // honeypot
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let data: Payload;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: bots fill hidden fields → silently accept, do nothing.
  if (data.company_website) {
    return NextResponse.json({ ok: true });
  }

  const name = data.name?.trim();
  const email = data.email?.trim();
  const message = data.message?.trim();

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Please fill in your name, email and message." },
      { status: 400 },
    );
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  const lead = {
    name,
    email,
    phone: data.phone?.trim() || "—",
    service: data.service?.trim() || "—",
    message,
    receivedAt: new Date().toISOString(),
  };

  // If Resend is configured, send a notification email. Otherwise log the lead
  // so it's never lost in development / before email is wired up.
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.CONTACT_FROM || `SyberInfo <noreply@${site.domain}>`,
          to: process.env.CONTACT_TO || site.email,
          reply_to: email,
          subject: `New enquiry: ${lead.service} — ${name}`,
          text: [
            `Name: ${lead.name}`,
            `Email: ${lead.email}`,
            `Phone: ${lead.phone}`,
            `Service: ${lead.service}`,
            "",
            lead.message,
            "",
            `Received: ${lead.receivedAt}`,
          ].join("\n"),
        }),
      });
      if (!res.ok) {
        const detail = await res.text();
        console.error("Resend error:", detail);
        return NextResponse.json(
          { error: "Could not send your message. Please email us directly." },
          { status: 502 },
        );
      }
    } catch (err) {
      console.error("Contact email failed:", err);
      return NextResponse.json(
        { error: "Could not send your message. Please email us directly." },
        { status: 502 },
      );
    }
  } else {
    console.info("[contact] New lead (email not configured):", lead);
  }

  return NextResponse.json({ ok: true });
}
