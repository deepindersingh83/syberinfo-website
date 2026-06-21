import { NextResponse } from "next/server";
import { saveSubscriber } from "@/lib/content";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: { email?: string; source?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const source = body.source?.trim() || "website";
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  // Always store locally so subscribers are never lost.
  await saveSubscriber(email, source);

  // If Klaviyo is configured, also subscribe the profile to the list.
  const apiKey = process.env.KLAVIYO_API_KEY;
  const listId = process.env.KLAVIYO_LIST_ID;
  if (apiKey && listId) {
    try {
      await fetch(
        "https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs",
        {
          method: "POST",
          headers: {
            Authorization: `Klaviyo-API-Key ${apiKey}`,
            "Content-Type": "application/json",
            accept: "application/json",
            revision: "2024-10-15",
          },
          body: JSON.stringify({
            data: {
              type: "profile-subscription-bulk-create-job",
              attributes: {
                profiles: {
                  data: [
                    {
                      type: "profile",
                      attributes: {
                        email,
                        subscriptions: { email: { marketing: { consent: "SUBSCRIBED" } } },
                      },
                    },
                  ],
                },
              },
              relationships: { list: { data: { type: "list", id: listId } } },
            },
          }),
        },
      );
    } catch (err) {
      // Non-fatal: we've already stored the subscriber locally.
      console.error("Klaviyo subscribe failed:", err);
    }
  }

  return NextResponse.json({ ok: true });
}
