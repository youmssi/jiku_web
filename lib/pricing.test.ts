import { strict as assert } from "node:assert";
import { test } from "node:test";
import { organizerPackBreakEven, organizerPackCost, perEventCost } from "./pricing.ts";

test("an event pays each guest, all included", () => {
  assert.equal(perEventCost(300, "GNF"), 225_000);
  assert.equal(perEventCost(300, "FCFA"), 15_000);
  assert.equal(perEventCost(300, "USD"), 2_400);
  assert.equal(perEventCost(-5, "GNF"), 0);
});

test("Pro Organisateur covers its guests, then charges each one beyond", () => {
  assert.equal(organizerPackCost(400, "GNF"), 600_000);
  assert.equal(organizerPackCost(1_000, "GNF"), 600_000);
  assert.equal(organizerPackCost(1_200, "GNF"), 600_000 + 200 * 600);
});

test("Pro Organisateur becomes the cheaper choice from 800 guests a month", () => {
  assert.equal(organizerPackBreakEven("GNF"), 800);
  assert.equal(organizerPackBreakEven("FCFA"), 800);
  assert.ok(organizerPackCost(800, "GNF") <= perEventCost(800, "GNF"));
  assert.ok(organizerPackCost(799, "GNF") > perEventCost(799, "GNF"));
});
