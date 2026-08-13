import { test } from "node:test";
import assert from "node:assert/strict";
import { toMonthly } from "./analytics.ts";

test("toMonthly normalises annual to a twelfth", () => {
  assert.equal(toMonthly(1200, "annually"), 100);
  assert.equal(toMonthly(1200, "yearly"), 100);
});

test("toMonthly normalises quarterly and weekly", () => {
  assert.equal(toMonthly(300, "quarterly"), 100);
  assert.equal(Math.round(toMonthly(10, "weekly")), 43); // 10 * 52 / 12
});

test("toMonthly leaves monthly/unknown untouched", () => {
  assert.equal(toMonthly(50, "monthly"), 50);
  assert.equal(toMonthly(50, ""), 50);
});
