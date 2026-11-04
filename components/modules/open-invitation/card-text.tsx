import { visualArabicWord } from "@/lib/arabic-shape";

/**
 * Text in a card image (JIKU-293). The image renderer lays words left to right
 * and measures Arabic letters unjoined, so a line holding Arabic is set word by
 * word: each Arabic word already joined and in visual order, a right-to-left
 * line running its words from the right, and a left-to-right line keeping an
 * Arabic phrase in its own reading order. Text without Arabic on a
 * left-to-right card is drawn as before.
 */
const RTL_LETTER = /[֐-ࣿיִ-﷿ﹰ-﻿]/;
const LTR_LETTER = /[A-Za-z0-9À-ɏḀ-ỿ]/;

export type TextDirection = "ltr" | "rtl";

interface Run {
  direction: TextDirection;
  words: string[];
}

export function hasArabic(text: string): boolean {
  return RTL_LETTER.test(text);
}

function wordDirection(word: string): TextDirection | null {
  if (RTL_LETTER.test(word)) return "rtl";
  if (LTR_LETTER.test(word)) return "ltr";
  return null;
}

/** The direction of the first word that has one, as `dir="auto"` reads it. */
export function textDirection(text: string, fallback: TextDirection): TextDirection {
  for (const word of text.split(/\s+/)) {
    const direction = wordDirection(word);
    if (direction) return direction;
  }
  return fallback;
}

/** Consecutive words of one direction; a word with no letter (·, –, digits aside) joins the run before it. */
export function runs(text: string, base: TextDirection): Run[] {
  const result: Run[] = [];
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const direction = wordDirection(word) ?? result.at(-1)?.direction ?? base;
    const last = result.at(-1);
    if (last && last.direction === direction) last.words.push(word);
    else result.push({ direction, words: [word] });
  }
  return result;
}

const WORD_GAP = "0.27em";

/** A word in the line's own direction, or a phrase in the other one, kept in its reading order. */
type Item = { key: string; text: string; phrase: null } | { key: string; text: null; phrase: string[] };

/**
 * [text] laid out for the image renderer. [direction] is the line's own; left
 * out, it follows the text's first word, which suits what the organizer wrote.
 * Only [wrap] text (a title, a place) breaks onto more lines; a label stays whole.
 */
export function CardText({ text, direction, wrap = false }: { text: string; direction?: TextDirection; wrap?: boolean }) {
  const base = direction ?? textDirection(text, "ltr");
  if (base === "ltr" && !hasArabic(text)) return text;
  const items = runs(text, base).flatMap((run, index): Item[] => {
    const words = run.words.map((word) => (wordDirection(word) === "rtl" ? visualArabicWord(word) : word));
    if (run.direction === base) return words.map((word, at) => ({ key: `${index}-${at}`, text: word, phrase: null }));
    return [{ key: `${index}`, text: null, phrase: words }];
  });
  return (
    <div
      style={{
        display: "flex",
        flexDirection: base === "rtl" ? "row-reverse" : "row",
        flexWrap: wrap ? "wrap" : "nowrap",
        alignItems: "baseline",
        columnGap: WORD_GAP,
      }}
    >
      {items.map((item) =>
        item.phrase ? (
          <div key={item.key} style={{ display: "flex", flexShrink: 0, flexDirection: base === "rtl" ? "row" : "row-reverse", alignItems: "baseline", columnGap: WORD_GAP }}>
            {item.phrase.map((word, at) => (
              <div key={at} style={{ display: "flex", flexShrink: 0 }}>
                {word}
              </div>
            ))}
          </div>
        ) : (
          <div key={item.key} style={{ display: "flex", flexShrink: 0 }}>
            {item.text}
          </div>
        ),
      )}
    </div>
  );
}
