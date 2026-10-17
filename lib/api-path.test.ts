import { strict as assert } from "node:assert";
import { test } from "node:test";
import { assertApiPath } from "./api-path.ts";

test("ordinary API paths pass, dots inside a value included", () => {
  for (const path of ["/events/42/guests", "/branding/logo", "/events?status=PUBLISHED", "/files/report.v2.pdf", "/search?q=../x"]) {
    assert.equal(assertApiPath(path), path);
  }
});

test("a path that climbs out of its route is refused", () => {
  for (const path of ["/events/../members", "/events/%2e%2e/members", "/events/%2E%2e/x", "/events/./x", "/events/..", "events/42"]) {
    assert.throws(() => assertApiPath(path), /Refused API path/, path);
  }
});
