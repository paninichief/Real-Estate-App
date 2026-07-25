/** Operational failure categories distinct from a normal "not found" result. */
export type RentCastErrorKind =
  | "missing_api_key"
  | "auth_failed"
  | "rate_limited"
  | "server_error"
  | "timeout"
  | "network_error"
  | "unexpected_response";

/**
 * Thrown by the RentCast client/adapter for infrastructure-level failures
 * (bad credentials, rate limiting, RentCast being down, a timed-out
 * request). Never thrown for "no property at this address" — that is a
 * normal PropertySearchResult/getById outcome, not an error. Callers must
 * not treat a thrown RentCastError as "no match"; doing so would silently
 * mask a real failure behind fabricated-looking empty results.
 */
export class RentCastError extends Error {
  readonly kind: RentCastErrorKind;
  readonly status?: number;

  constructor(kind: RentCastErrorKind, message: string, options?: { status?: number; cause?: unknown }) {
    super(message, options?.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = "RentCastError";
    this.kind = kind;
    this.status = options?.status;
  }
}
