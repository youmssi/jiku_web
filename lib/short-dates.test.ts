import { strict as assert } from "node:assert";
import { test } from "node:test";
import { fullWhen, liveWhen, relativeDay, shortDay, shortTime, shortWhen } from "./short-dates.ts";

const CONAKRY = "Africa/Conakry";
const now = new Date("2026-09-27T10:00:00Z");

test("a day this year is short, without the year", () => {
  assert.equal(shortDay("2026-11-14T19:00:00Z", CONAKRY, "fr", { now }), "sam. 14 nov.");
  assert.equal(shortDay("2026-11-14T19:00:00Z", CONAKRY, "en", { now }), "Sat, Nov 14");
});

test("a day far ahead or in a past year shows its year", () => {
  assert.equal(shortDay("2027-10-02T19:00:00Z", CONAKRY, "fr", { now }), "sam. 2 oct. 2027");
  assert.equal(shortDay("2025-12-20T19:00:00Z", CONAKRY, "en", { now }), "Sat, Dec 20, 2025");
});

test("next January is close enough to go without its year", () => {
  assert.equal(shortDay("2027-01-09T19:00:00Z", CONAKRY, "fr", { now }), "sam. 9 janv.");
});

test("the weekday can be left out", () => {
  assert.equal(shortDay("2026-11-07T20:00:00Z", CONAKRY, "fr", { weekday: false, now }), "7 nov.");
});

test("a round hour has no minutes", () => {
  assert.equal(shortTime("2026-11-14T19:00:00Z", CONAKRY, "fr"), "19 h");
  assert.equal(shortTime("2026-11-14T19:00:00Z", CONAKRY, "en"), "7 PM");
});

test("minutes show when they are not zero", () => {
  assert.equal(shortTime("2026-11-14T19:30:00Z", CONAKRY, "fr"), "19 h 30");
  assert.equal(shortTime("2026-11-14T09:05:00Z", CONAKRY, "fr"), "9 h 05");
  assert.equal(shortTime("2026-11-14T19:30:00Z", CONAKRY, "en"), "7:30 PM");
});

test("the time is read in the event's zone, not the viewer's", () => {
  assert.equal(shortTime("2026-11-14T19:00:00Z", "Africa/Lagos", "fr"), "20 h");
  assert.equal(shortDay("2026-11-14T23:30:00Z", "Africa/Lagos", "fr", { now }), "dim. 15 nov.");
});

test("day and time share one line", () => {
  assert.equal(shortWhen("2026-11-14T19:00:00Z", CONAKRY, "fr", { now }), "sam. 14 nov. · 19 h");
});

test("a close day is said relatively on a live page", () => {
  assert.equal(relativeDay("2026-09-27T19:00:00Z", CONAKRY, "fr", now), "Aujourd’hui");
  assert.equal(relativeDay("2026-09-28T19:00:00Z", CONAKRY, "fr", now), "Demain");
  assert.equal(relativeDay("2026-09-30T19:00:00Z", CONAKRY, "en", now), "In 3 days");
  assert.equal(liveWhen("2026-09-28T19:00:00Z", CONAKRY, "fr", now), "Demain · 19 h");
});

test("a far or past day is not said relatively", () => {
  assert.equal(relativeDay("2026-10-10T19:00:00Z", CONAKRY, "fr", now), null);
  assert.equal(relativeDay("2026-09-26T19:00:00Z", CONAKRY, "fr", now), null);
  assert.equal(liveWhen("2026-11-14T19:00:00Z", CONAKRY, "fr", now), "sam. 14 nov. · 19 h");
});

test("the full form keeps everything for a tooltip", () => {
  assert.match(fullWhen("2026-11-14T19:00:00Z", CONAKRY, "fr"), /samedi 14 novembre 2026/);
});
