import { strict as assert } from "node:assert";
import { test } from "node:test";
import { bookingStep, slotStepDay } from "./booking-step.ts";

test("only step=slot skips the presentation", () => {
  assert.equal(bookingStep("slot"), "slot");
  for (const value of [null, undefined, "", "SLOT", "presentation"]) {
    assert.equal(bookingStep(value), null, String(value));
  }
});

test("a link in slot mode opens on the first free time's day, in the service's zone", () => {
  // 23:30 UTC on the 18th is already the 19th in Dubai and still the 18th in Conakry.
  const upcoming = [{ startsAt: "2026-11-18T23:30:00Z" }, { startsAt: "2026-11-19T09:00:00Z" }];
  assert.equal(slotStepDay(upcoming, "Africa/Conakry"), "2026-11-18");
  assert.equal(slotStepDay(upcoming, "Asia/Dubai"), "2026-11-19");
});

test("no free time this week falls back to the presentation", () => {
  assert.equal(slotStepDay([], "Africa/Conakry"), null);
  assert.equal(slotStepDay(null, "Africa/Conakry"), null);
});
