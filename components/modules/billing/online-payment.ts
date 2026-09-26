import "server-only";

/**
 * Whether organizers are offered online payment (JIKU-165). Off unless
 * ONLINE_PAYMENT_ENABLED is "true": turn it on once the backend's payment
 * provider is a real one (PAYMENT_PROVIDER=cinetpay), so nobody is sent to the
 * sandbox's pretend page in production. The manual transfer stays available
 * either way.
 */
export function isOnlinePaymentEnabled(): boolean {
  return process.env.ONLINE_PAYMENT_ENABLED === "true";
}
