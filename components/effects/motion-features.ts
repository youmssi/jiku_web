import { domMax } from "motion/react";

/**
 * Animation features loaded after the first paint by `MotionProvider`. Drag
 * (the card stack) needs the full set; keeping it in its own chunk means none
 * of it is in the JavaScript a phone downloads before showing the page.
 */
export default domMax;
