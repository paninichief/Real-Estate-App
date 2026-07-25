import "server-only";
import { RentCastError } from "./rentcast-errors";

const RENTCAST_BASE_URL = "https://api.rentcast.io/v1";
const REQUEST_TIMEOUT_MS = 10_000;

export type RentCastResult<T> = { found: true; data: T } | { found: false };

interface RentCastErrorBody {
  status?: number;
  error?: string;
  message?: string;
}

function getApiKey(): string {
  const key = process.env.RENTCAST_API_KEY;
  if (!key) {
    throw new RentCastError(
      "missing_api_key",
      "RENTCAST_API_KEY is not set. Add it to .env.local to enable live RentCast lookups.",
    );
  }
  return key;
}

async function describeError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as RentCastErrorBody;
    return body.message ?? response.statusText;
  } catch {
    return response.statusText;
  }
}

function isAbortError(error: unknown): boolean {
  // Node's fetch throws a DOMException for an aborted request, which isn't
  // reliably `instanceof Error` — check by name instead of type.
  return typeof error === "object" && error !== null && (error as { name?: unknown }).name === "AbortError";
}

/**
 * Authenticated GET against the RentCast API. Spec requirements this
 * satisfies: requests never leave the server (this module is server-only
 * and never imported by a client component), a 10s timeout so a stuck
 * request can't hang a page indefinitely, and every documented non-2xx
 * status is mapped to a specific, typed outcome rather than a generic
 * failure or a silent empty result.
 *
 * 400 (unparseable/invalid query) and 404 (no matching record) both
 * resolve to `{ found: false }` — from a caller's perspective both mean
 * "RentCast has nothing for this query," which is a normal outcome, not an
 * operational error. Every other non-2xx status throws a RentCastError,
 * since those represent RentCast/the request being unable to answer at
 * all (bad credentials, rate limiting, RentCast being down) rather than a
 * legitimate "no data" answer — conflating the two would let a live
 * outage look identical to "this address doesn't exist."
 */
export async function rentcastGet<T>(
  path: string,
  params: Record<string, string | undefined>,
): Promise<RentCastResult<T>> {
  const apiKey = getApiKey();

  const url = new URL(`${RENTCAST_BASE_URL}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, value);
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, {
      method: "GET",
      headers: { "X-Api-Key": apiKey, Accept: "application/json" },
      signal: controller.signal,
    });
  } catch (cause) {
    if (isAbortError(cause)) {
      throw new RentCastError(
        "timeout",
        `RentCast request to ${path} did not respond within ${REQUEST_TIMEOUT_MS}ms.`,
        { cause },
      );
    }
    throw new RentCastError("network_error", `Network error calling RentCast (${path}).`, { cause });
  } finally {
    clearTimeout(timeoutId);
  }

  if (response.status === 400 || response.status === 404) {
    return { found: false };
  }

  if (response.status === 401 || response.status === 403) {
    throw new RentCastError(
      "auth_failed",
      `RentCast authentication failed: ${await describeError(response)}`,
      { status: response.status },
    );
  }

  if (response.status === 429) {
    throw new RentCastError(
      "rate_limited",
      `RentCast rate limit exceeded: ${await describeError(response)}`,
      { status: response.status },
    );
  }

  // RentCast documents 504 specifically as its own server-side timeout,
  // distinct from the client-side AbortController timeout above.
  if (response.status === 504) {
    throw new RentCastError("timeout", `RentCast server timed out: ${await describeError(response)}`, {
      status: response.status,
    });
  }

  if (response.status >= 500) {
    throw new RentCastError(
      "server_error",
      `RentCast server error (${response.status}): ${await describeError(response)}`,
      { status: response.status },
    );
  }

  if (!response.ok) {
    throw new RentCastError(
      "unexpected_response",
      `Unexpected RentCast response (${response.status}): ${await describeError(response)}`,
      { status: response.status },
    );
  }

  try {
    const data = (await response.json()) as T;
    return { found: true, data };
  } catch (cause) {
    throw new RentCastError("unexpected_response", `RentCast returned an unparseable response body.`, {
      cause,
    });
  }
}
