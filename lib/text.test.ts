import { strict as assert } from "node:assert";
import { test } from "node:test";
import { upperFirst } from "./text.ts";

test("only the first letter of a date is capitalised", () => {
  assert.equal(upperFirst("jeudi 15 octobre", "fr"), "Jeudi 15 octobre");
  assert.equal(upperFirst("Thursday, October 15", "en"), "Thursday, October 15");
  assert.equal(upperFirst("", "fr"), "");
});
