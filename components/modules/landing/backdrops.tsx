import { LazyBackground } from "@/components/effects";

// The two backgrounds of the marketing pages (JIKU-221), in the brand's greys
// only: the colour on a page comes from the invitation cards, never from here.

const PEARL: [string, string, string] = ["#FAFAFA", "#E4E4E7", "#F4F4F5"];
const PEARL_FALLBACK =
  "radial-gradient(70% 60% at 15% 10%, #f4f4f5 0%, transparent 60%), radial-gradient(60% 60% at 90% 85%, #e4e4e7 0%, transparent 55%), #fafafa";
const SILVER: [string, string, string] = ["#F4F4F5", "#E4E4E7", "#F4F4F5"];
const SILVER_FALLBACK = "linear-gradient(180deg, #e4e4e7 0%, #fafafa 70%)";

/** A slow pearl grain, for the top of a page. */
export function PearlBackdrop() {
  return <LazyBackground kind="grainient" colors={PEARL} speed={0.12} grain={0.05} contrast={1} fallback={PEARL_FALLBACK} />;
}

/** A silver aurora, for a showcase panel further down. */
export function SilverBackdrop() {
  return <LazyBackground kind="aurora" colors={SILVER} amplitude={0.8} blend={0.8} speed={0.5} fallback={SILVER_FALLBACK} />;
}
