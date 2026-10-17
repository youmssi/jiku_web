import { strict as assert } from "node:assert";
import { test } from "node:test";
import { jsonLd } from "./json-ld.ts";

test("a value cannot close the script tag", () => {
  const html = jsonLd({ name: "</script><script>alert(1)</script>" });
  assert.ok(!html.includes("</script>"));
  assert.deepEqual(JSON.parse(html), { name: "</script><script>alert(1)</script>" });
});
