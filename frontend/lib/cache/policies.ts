/**
 * Single source of truth for public-data freshness.
 * Private and tenant-scoped data must not use these policies in a shared cache.
 */
export const CACHE_POLICY = {
  homepage: { revalidate: 600, swr: 3600 },
  operatorDirectory: { revalidate: 300, swr: 1800 },
  operatorProfile: { revalidate: 300, swr: 3600 },
  category: { revalidate: 1800, swr: 86400 },
  service: { revalidate: 1800, swr: 86400 },
  articleIndex: { revalidate: 3600, swr: 86400 },
  article: { revalidate: 3600, swr: 86400 },
  pricing: { revalidate: 600, swr: 3600 },
  legal: { revalidate: 86400, swr: 604800 },
} as const;

export type CachePolicyName = keyof typeof CACHE_POLICY;

export function nextRevalidation(policy: CachePolicyName) {
  return CACHE_POLICY[policy].revalidate;
}
