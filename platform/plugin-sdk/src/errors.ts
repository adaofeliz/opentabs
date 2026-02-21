// ---------------------------------------------------------------------------
// Shared error types for the SDK
// ---------------------------------------------------------------------------

/** Standard error categories for structured error metadata. */
export type ErrorCategory = 'auth' | 'rate_limit' | 'not_found' | 'validation' | 'internal' | 'timeout';

/** Optional structured metadata for ToolError. */
export interface ToolErrorOptions {
  retryable?: boolean;
  retryAfterMs?: number;
  category?: ErrorCategory;
}

/**
 * Typed error for tool handlers — the platform catches these
 * and returns structured MCP error responses.
 */
export class ToolError extends Error {
  /** Whether this error is retryable (defaults to false). */
  readonly retryable: boolean;
  /** Suggested delay before retrying, in milliseconds. */
  readonly retryAfterMs: number | undefined;
  /** Error category for structured error classification. */
  readonly category: ErrorCategory | undefined;

  constructor(
    message: string,
    /** Machine-readable error code (e.g., 'CHANNEL_NOT_FOUND') */
    public readonly code: string,
    opts?: ToolErrorOptions,
  ) {
    super(message);
    this.name = 'ToolError';
    this.retryable = opts?.retryable ?? false;
    this.retryAfterMs = opts?.retryAfterMs;
    this.category = opts?.category;
  }
}
