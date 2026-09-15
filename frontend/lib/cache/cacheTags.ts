/**
 * Public cache tags only. Never add tenant, user, authorization, billing, or
 * session-derived data to this module: those values must never enter a shared
 * Next/CDN cache.
 */
function segment(value: string) {
  // Three filter segments share one tag. Keeping each bounded leaves room
  // below Next's maximum tag length while preserving readable diagnostics.
  return encodeURIComponent(value.trim().toLowerCase()).slice(0, 48);
}

export const cacheTags = {
  homepage: () => "homepage",
  pricing: () => "pricing",
  operator: (slug: string) => `operator:${segment(slug)}`,
  operatorDirectory: () => "operators",
  operatorDirectoryFilters: (filters: { service?: string; state?: string; minRating?: string } = {}) => {
    const values = [
      `service=${segment(filters.service || "all")}`,
      `state=${segment(filters.state || "all")}`,
      `rating=${segment(filters.minRating || "all")}`,
    ];
    return `operators:${values.join(";")}`;
  },
  category: (slug: string) => `category:${segment(slug)}`,
  service: (slug: string) => `service:${segment(slug)}`,
  articleIndex: (locale: string) => `articles:${segment(locale)}`,
  article: (slug: string) => `article:${segment(slug)}`,
} as const;
