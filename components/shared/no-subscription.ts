/**
 * The subscribe function of `useSyncExternalStore` for a browser value that never
 * changes while the page is open (time zone, origin, a supported API): read once
 * on the client, the server's fallback before hydration.
 */
export function noSubscription(): () => void {
  return () => {};
}
