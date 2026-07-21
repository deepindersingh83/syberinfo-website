import { test } from "node:test";
import assert from "node:assert/strict";
import { rateLimit } from "./rateLimit.ts";

test("rateLimit allows up to the limit then blocks", () => {
  const key = `t:${Math.random()}`;
  for (let i = 0; i < 5; i++) {
    assert.equal(rateLimit(key, 5, 60_000).ok, true, `hit ${i + 1} should pass`);
  }
  const blocked = rateLimit(key, 5, 60_000);
  assert.equal(blocked.ok, false, "6th hit should be blocked");
  assert.ok(blocked.retryAfter > 0, "blocked hit reports retryAfter");
});

test("rateLimit windows are independent per key", () => {
  const a = `a:${Math.random()}`;
  const b = `b:${Math.random()}`;
  for (let i = 0; i < 5; i++) rateLimit(a, 5, 60_000);
  assert.equal(rateLimit(a, 5, 60_000).ok, false);
  assert.equal(rateLimit(b, 5, 60_000).ok, true, "different key is unaffected");
});
