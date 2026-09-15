import "server-only";
import { cache } from "react";
import type { OperatorCardData } from "@/components/marketplace/operator-card";
import { cacheTags } from "@/lib/cache/cacheTags";
import { nextRevalidation } from "@/lib/cache/policies";
import { publicApiBase } from "@/lib/data/public-api";
import { MOCK_OPERATORS } from "@/lib/mock/data";

export type OperatorProfile = OperatorCardData & {
  about?: string | null;
  verification_status?: string;
  currency?: string;
  minimum_job_value?: number | null;
  years_experience?: number | null;
  response_rate?: number | null;
  organization?: {
    id: string;
    name: string;
    slug: string;
    city?: string | null;
    state_code?: string | null;
    country_code?: string | null;
    verified?: boolean;
  } | null;
  services?: Array<{
    id: string;
    title: string;
    description?: string | null;
    pricing_model?: string;
    price_from?: number | null;
    currency?: string;
    category?: { slug: string; name: string } | null;
  }>;
  data_products?: Array<{
    id: string;
    base_price?: number | null;
    pricing_model?: string;
    turnaround_hours?: number | null;
    sample_url?: string | null;
    product?: { slug: string; name: string; product_type?: string } | null;
  }>;
  coverage?: {
    areas: Array<{
      id: string;
      name?: string | null;
      state_code?: string | null;
      city?: string | null;
    }>;
    summary: string[];
  };
  fleet?: {
    drones: Array<{
      id: string;
      manufacturer: string;
      model: string;
      aircraft_type?: string | null;
    }>;
    payloads: Array<{
      id: string;
      name: string;
      payload_type: string;
    }>;
  };
  pilots?: Array<{
    id: string;
    full_name: string;
    experience_years?: number | null;
    verification_status?: string;
  }>;
  drones?: Array<{ manufacturer: string; model: string }>;
  reviews?: Array<{
    id: string;
    overall_rating: number;
    title?: string | null;
    body?: string | null;
    published_at?: string | null;
    verified?: boolean;
  }>;
  portfolio?: Array<{
    kind: string;
    title: string;
    product_slug?: string;
    url: string;
  }>;
  portfolio_items?: any[];
  data_intent_config?: any;
  review_metrics?: any;
};

type Envelope<T> = { data: T };

export const fetchOperators = cache(async (params?: {
  service?: string;
  state?: string;
  min_rating?: string;
}): Promise<OperatorCardData[]> => {
  const q = new URLSearchParams();
  if (params?.service) q.set("filter[service]", params.service);
  if (params?.state) q.set("filter[state]", params.state);
  if (params?.min_rating) q.set("filter[min_rating]", params.min_rating);
  q.set("limit", "25");

  try {
    const res = await fetch(
      `${publicApiBase()}/marketplace/operators?${q.toString()}`,
      {
        next: {
          revalidate: nextRevalidation("operatorDirectory"),
          tags: [
            cacheTags.operatorDirectory(),
            cacheTags.operatorDirectoryFilters({
              service: params?.service,
              state: params?.state,
              minRating: params?.min_rating,
            }),
          ],
        },
      }
    );
    if (!res.ok) return MOCK_OPERATORS as any;
    const body = (await res.json()) as Envelope<OperatorCardData[]>;
    return body.data || (MOCK_OPERATORS as any);
  } catch {
    // Return realistic mock operators if API is offline
    return MOCK_OPERATORS as any;
  }
});

export const fetchOperatorBySlug = cache(async (
  slug: string
): Promise<OperatorProfile | null> => {
  try {
    const res = await fetch(
      `${publicApiBase()}/marketplace/operators/${encodeURIComponent(slug)}`,
      {
        next: {
          revalidate: nextRevalidation("operatorProfile"),
          tags: [cacheTags.operator(slug)],
        },
      }
    );
    if (!res.ok) {
      return (MOCK_OPERATORS.find((o) => o.slug === slug) as any) || (MOCK_OPERATORS[0] as any);
    }
    const body = (await res.json()) as Envelope<OperatorProfile>;
    return body.data || ((MOCK_OPERATORS.find((o) => o.slug === slug) as any) || (MOCK_OPERATORS[0] as any));
  } catch {
    // Return realistic mock operator if API is offline
    return (MOCK_OPERATORS.find((o) => o.slug === slug) as any) || (MOCK_OPERATORS[0] as any);
  }
});
