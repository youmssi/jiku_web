import { unstable_isUnrecognizedActionError } from "next/navigation";

/** Set once a reload for a new deployment is under way, so it happens only once. */
let reloading = false;

/**
 * Runs one background refresh of a polling hook without letting it fail loudly
 * (JIKU-308). A refresh can fail because the page is being left, the network
 * dropped or the server hiccuped: the next tick simply tries again. If the tab
 * still runs a build older than the server, its server actions no longer
 * exist, so the page reloads once to pick up the new version.
 */
export async function refreshQuietly(refresh: () => Promise<void>): Promise<void> {
  try {
    await refresh();
  } catch (error) {
    if (unstable_isUnrecognizedActionError(error) && !reloading) {
      reloading = true;
      window.location.reload();
    }
  }
}
