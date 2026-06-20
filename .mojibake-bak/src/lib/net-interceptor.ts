/**
 * src/lib/net-interceptor.ts â€” Bambeh
 *
 * FIX: super() call was missing backticks around the template literal.
 * Original broken line:  super(Network request failed: + url);
 * Fixed line:            super(`Network request failed: ${url}`);
 */

export class NetworkError extends Error {
  constructor(public url: string, public cause?: unknown) {
    super(`Network request failed: ${url}`);
    this.name = "NetworkError";
  }
}

/**
 * Wraps fetch() and throws NetworkError on network failure.
 * HTTP error status codes (4xx, 5xx) are NOT thrown â€” callers
 * must check response.ok themselves if needed.
 */
export async function fetchWithInterceptor(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : (input as Request).url;
  try {
    return await fetch(input, init);
  } catch (err) {
    throw new NetworkError(url, err);
  }
}
