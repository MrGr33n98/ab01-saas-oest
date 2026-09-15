import type { MetadataRoute } from "next";
import { SERVICE_CATEGORIES, DATA_PRODUCTS } from "@/lib/categories";
import { GLOSSARY, LOCATIONS, CUSTOMERS } from "@/lib/seo/content";

const BASE = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPaths = [
    "",
    "/how-it-works",
    "/pricing",
    "/enterprise",
    "/contact",
    "/coverage",
    "/operators",
    "/services",
    "/data-products",
    "/blog",
    "/faq",
    "/glossary",
    "/customers",
    "/compare/dronehub-vs-contratar-avulso",
    "/en",
    "/legal/terms",
    "/legal/privacy",
  ];

  const entries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  for (const c of SERVICE_CATEGORIES) {
    entries.push({
      url: `${BASE}/categories/${c.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    });
    for (const uf of Object.keys(LOCATIONS)) {
      entries.push({
        url: `${BASE}/categories/${c.slug}/${uf}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  for (const p of DATA_PRODUCTS) {
    entries.push({
      url: `${BASE}/data-products/${p.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  for (const [uf, loc] of Object.entries(LOCATIONS)) {
    entries.push({
      url: `${BASE}/locations/${uf}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.75,
    });
    for (const city of loc.cities) {
      entries.push({
        url: `${BASE}/locations/${uf}/${city.slug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.65,
      });
    }
  }

  for (const term of Object.keys(GLOSSARY)) {
    entries.push({
      url: `${BASE}/glossary/${term}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.55,
    });
  }

  for (const c of CUSTOMERS) {
    entries.push({
      url: `${BASE}/customers/${c.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  try {
    const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
    for (const locale of ["pt-BR", "en"]) {
      const res = await fetch(`${api}/content/posts?locale=${locale}&limit=50`, {
        next: { revalidate: 300 },
      });
      if (!res.ok) continue;
      const body = await res.json();
      for (const p of body.data || []) {
        entries.push({
          url: `${BASE}${p.path || `/blog/${p.slug}`}`,
          lastModified: p.published_at ? new Date(p.published_at) : now,
          changeFrequency: "monthly",
          priority: 0.6,
        });
      }
    }
  } catch {
    /* offline */
  }

  return entries;
}
