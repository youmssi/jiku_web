import { strict as assert } from "node:assert";
import { test } from "node:test";
import { safeNext } from "./safe-next.ts";

test("a path on this site is kept, query and hash included", () => {
  assert.equal(safeNext("/events/42?tab=guests#top", "/dashboard"), "/events/42?tab=guests#top");
  assert.equal(safeNext("/invitations/accept/abc", "/dashboard"), "/invitations/accept/abc");
});

test("anything that leaves the site falls back", () => {
  for (const next of [
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "/\\/evil.example",
    "\\\\evil.example",
    "/\tevil",
    "javascript:alert(1)",
    "",
    undefined,
  ]) {
    assert.equal(safeNext(next, "/dashboard"), "/dashboard", String(next));
  }
});
