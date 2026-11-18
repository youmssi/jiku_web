import { strict as assert } from "node:assert";
import { test } from "node:test";
import { webPageUrl } from "./safe-url.ts";

test("only a web page address is kept", () => {
  assert.equal(webPageUrl("https://pay.example.com/c/1"), "https://pay.example.com/c/1");
  for (const value of ["javascript:alert(1)", "data:text/html,x", "/relative", "not a url"]) {
    assert.equal(webPageUrl(value), null, value);
  }
});
