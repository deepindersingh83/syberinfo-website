import { test } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { verifyWebhook } from "./stripe.ts";

const SECRET = "whsec_test_123";

function sign(payload: string, ts: number, secret = SECRET): string {
  const sig = crypto.createHmac("sha256", secret).update(`${ts}.${payload}`).digest("hex");
  return `t=${ts},v1=${sig}`;
}

test("verifyWebhook accepts a correctly signed, fresh event", () => {
  process.env.STRIPE_WEBHOOK_SECRET = SECRET;
  const payload = JSON.stringify({ type: "checkout.session.completed" });
  const ts = Math.floor(Date.now() / 1000);
  const event = verifyWebhook(payload, sign(payload, ts)) as { type?: string } | null;
  assert.ok(event, "should parse a valid event");
  assert.equal(event?.type, "checkout.session.completed");
});

test("verifyWebhook rejects a tampered body", () => {
  process.env.STRIPE_WEBHOOK_SECRET = SECRET;
  const ts = Math.floor(Date.now() / 1000);
  const header = sign(JSON.stringify({ a: 1 }), ts);
  assert.equal(verifyWebhook(JSON.stringify({ a: 2 }), header), null);
});

test("verifyWebhook rejects an old timestamp (replay)", () => {
  process.env.STRIPE_WEBHOOK_SECRET = SECRET;
  const payload = JSON.stringify({ ok: true });
  const oldTs = Math.floor(Date.now() / 1000) - 10_000;
  assert.equal(verifyWebhook(payload, sign(payload, oldTs)), null);
});

test("verifyWebhook returns null when no secret is configured", () => {
  delete process.env.STRIPE_WEBHOOK_SECRET;
  const payload = JSON.stringify({ ok: true });
  const ts = Math.floor(Date.now() / 1000);
  assert.equal(verifyWebhook(payload, sign(payload, ts)), null);
});
