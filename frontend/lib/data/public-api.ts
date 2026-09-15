import "server-only";

/**
 * Server Components prefer the private Docker-network URL in production,
 * avoiding a public CDN/TLS round trip back to Rails. The browser never sees
 * this variable. Public builds retain NEXT_PUBLIC_API_URL as a fallback.
 */
export function publicApiBase() {
  return (
    process.env.OEST_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3001/api/v1"
  );
}
