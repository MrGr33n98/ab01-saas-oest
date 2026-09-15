import { apiFetch } from "./api/client";

type Envelope<T> = { data: T };

export type Workspace = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  mission_type?: string;
  area_hectares?: number | null;
  deadline_at?: string | null;
  published_at?: string | null;
  completed_at?: string | null;
  currency?: string;
  estimated_budget_min?: number | null;
  estimated_budget_max?: number | null;
  next_action?: { key: string; label: string; href?: string | null };
  geometry_present?: boolean;
  products?: Array<{ name?: string; slug?: string; quantity?: number }>;
  quotes_summary?: { open_count: number; comparison_path: string };
  order?: {
    id: string;
    status: string;
    payment_status?: string | null;
    total?: number;
    currency?: string;
  } | null;
  operator?: {
    slug?: string;
    name?: string;
    verified?: boolean;
    headline?: string | null;
  } | null;
  deliverables?: Array<{
    id: string;
    title: string;
    status: string;
    version: number;
    preview_url?: string | null;
    download_ready?: boolean;
    rejection_reason?: string | null;
  }>;
  timeline?: Array<{
    from_status?: string | null;
    to_status: string;
    reason_code?: string | null;
    created_at?: string;
  }>;
};

export type QuoteComparison = {
  mission: {
    id: string;
    title: string;
    status: string;
    area_hectares?: number | null;
    deadline_at?: string | null;
    currency?: string;
  };
  quotes: Array<{
    id: string;
    status: string;
    subtotal?: number;
    platform_fee?: number;
    total?: number;
    currency?: string;
    estimated_start_at?: string | null;
    estimated_delivery_at?: string | null;
    proposal_text?: string | null;
    lock_version?: number;
    acceptible?: boolean;
    items?: Array<{
      description: string;
      quantity: number;
      unit: string;
      unit_price: number;
      total_price: number;
    }>;
    operator?: {
      slug?: string;
      headline?: string | null;
      verified?: boolean;
      rating_average?: number | null;
      rating_count?: number;
      missions_completed?: number;
      organization_name?: string;
      logo_url?: string | null;
    };
    coverage_fit?: { label: string; level: string };
    equipment_summary?: string[];
  }>;
};

export async function fetchWorkspace(missionId: string) {
  return apiFetch<Envelope<Workspace>>(`/missions/${missionId}`);
}

export async function fetchQuoteComparison(missionId: string) {
  return apiFetch<Envelope<QuoteComparison>>(
    `/missions/${missionId}/quote-comparison`
  );
}

export async function acceptQuote(
  quoteId: string,
  lockVersion: number,
  idempotencyKey: string
) {
  return apiFetch<Envelope<{ order_id?: string; status?: string }>>(
    `/quotes/${quoteId}/accept`,
    {
      method: "POST",
      body: JSON.stringify({ lock_version: lockVersion }),
      idempotencyKey,
    }
  );
}

export async function approveDeliverable(id: string) {
  return apiFetch(`/deliverables/${id}/approve`, { method: "POST", body: "{}" });
}

export async function rejectDeliverable(id: string, reason: string) {
  return apiFetch(`/deliverables/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}
