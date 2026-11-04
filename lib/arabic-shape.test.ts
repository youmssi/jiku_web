import { strict as assert } from "node:assert";
import { test } from "node:test";
import { shapeArabic, visualArabicWord } from "./arabic-shape.ts";

test("letters take their joined form from their neighbours", () => {
  // ح initial, ف medial, ل final: "حفل".
  assert.equal(shapeArabic("حفل"), "ﺣﻔﻞ");
  // A right-joining letter (ا) ends the join: "باب" is initial, final, isolated.
  assert.equal(shapeArabic("باب"), "ﺑﺎﺏ");
});

test("lam and alef make one ligature, isolated or final", () => {
  assert.equal(shapeArabic("لا"), "ﻻ");
  assert.equal(shapeArabic("كلا"), "ﻛﻼ");
});

test("a vowel mark does not break the join and stays with its letter", () => {
  assert.equal(shapeArabic("ردّ"), "ﺭﺩّ");
  assert.equal(visualArabicWord("ردّ"), "ﺩّﺭ");
});

test("other text is left as it is", () => {
  assert.equal(shapeArabic("Gala 12"), "Gala 12");
});
