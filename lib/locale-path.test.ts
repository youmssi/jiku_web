import { strict as assert } from "node:assert";
import { test } from "node:test";
import { withoutLocalePrefix } from "./locale-path.ts";

const LOCALES = ["fr", "en", "ar"];

test("a leading locale segment is dropped, query and hash kept", () => {
  assert.equal(withoutLocalePrefix("/en/events/42", LOCALES), "/events/42");
  assert.equal(withoutLocalePrefix("/en/events/42?tab=guests#top", LOCALES), "/events/42?tab=guests#top");
  assert.equal(withoutLocalePrefix("/en", LOCALES), "/");
  assert.equal(withoutLocalePrefix("/en?x=1", LOCALES), "/?x=1");
  assert.equal(withoutLocalePrefix("/ar/r/abc", LOCALES), "/r/abc");
});

test("a path without a locale is left alone", () => {
  assert.equal(withoutLocalePrefix("/events/42", LOCALES), "/events/42");
  assert.equal(withoutLocalePrefix("/english-page", LOCALES), "/english-page");
  assert.equal(withoutLocalePrefix("/", LOCALES), "/");
});
