import { captureException } from "@/lib/error-tracking";

/**
 * Uniform outcome of a Server Action: data on success, or a user-ready message on
 * failure. Components branch on `ok` and never inspect HTTP statuses themselves.
 */
export type ActionResult<T = null> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export const ok = <T>(data: T): ActionResult<T> => ({ ok: true, data });
export const fail = (error: string): ActionResult<never> => ({ ok: false, error });

const GENERIC = "Something went wrong. Please try again.";

type StatusMessages = Partial<Record<number, string>> & { default?: string };

/**
 * Converts a fetch `Response` to an `ActionResult`, centralizing status→message
 * mapping and routing every failure through the frontend error sink. Use this for
 * calls that return a body; for fire-and-forget writes use `ok`/`fail` with
 * `reportApiError` directly.
 */
export async function fromResponse<T>(
  response: Response,
  messages: StatusMessages = {},
): Promise<ActionResult<T>> {
  if (response.ok) {
    return { ok: true, data: (await response.json()) as T };
  }
  reportApiError(response);
  return { ok: false, error: messages[response.status] ?? messages.default ?? GENERIC };
}

/**
 * Reports a non-OK backend response to the error sink, carrying the backend's
 * `X-Request-Id` so this report and the backend's own event for the same failed
 * request can be lined up.
 */
export function reportApiError(response: Response, source = "service"): void {
  captureException(new Error(`API ${response.status} on ${response.url}`), {
    source,
    status: response.status,
    requestId: response.headers.get("X-Request-Id") ?? undefined,
  });
}
