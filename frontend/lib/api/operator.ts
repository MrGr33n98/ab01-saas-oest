import { apiFetch } from "./client";

export type OperatorOnboardingSection =
  | "address"
  | "equipment"
  | "business"
  | "experience"
  | "documents"
  | "pricing";

export type OnboardingSectionState = {
  complete: boolean;
  data: Record<string, unknown>;
};

export type OperatorOnboarding = {
  status: "draft" | "ready" | "submitted" | "approved" | "rejected";
  completion_percentage: number;
  completed_sections: OperatorOnboardingSection[];
  ready_to_submit: boolean;
  sections: Record<OperatorOnboardingSection, OnboardingSectionState>;
};

export type OperatorInvite = {
  id: string;
  status: "pending" | "accepted" | "declined" | "expired" | "cancelled";
  message?: string | null;
  expires_at?: string | null;
  created_at: string;
  responded_at?: string | null;
  mission: {
    id: string;
    title: string;
    mission_type: string;
    country_code?: string | null;
    state_code?: string | null;
    city?: string | null;
    area_hectares?: number | null;
    deadline_at?: string | null;
    estimated_budget_min?: number | null;
    estimated_budget_max?: number | null;
    currency: string;
  };
};

export type OperatorDashboard = {
  organization: {
    id: string;
    name: string;
    tenant_type: "operator";
    verification_status: string;
    accepting_jobs: boolean;
  };
  profile_completion: {
    percentage: number;
    complete: boolean;
    completed_sections: OperatorOnboardingSection[];
  };
  onboarding_stages: Array<{
    id: OperatorOnboardingSection;
    label: string;
    complete: boolean;
    href: string;
  }>;
  invites_overview: { active: number; accepted: number };
  orders_overview: { active: number; completed: number; pending_payment: number };
  missions_overview: { active: number; completed: number };
  recent_invites: OperatorInvite[];
  recent_notifications: Array<{
    id: string;
    title: string;
    body?: string | null;
    action_url?: string | null;
    read: boolean;
    created_at: string;
  }>;
};

export type OperatorPayoutProfile = {
  configured: boolean;
  account_kind: "business" | "personal";
  billing: {
    legal_name?: string;
    billing_email?: string;
    tax_id?: string;
    address?: Record<string, string>;
  };
  payout_provider?: string;
  payout_provider_reference?: string | null;
  account_holder_name?: string | null;
  bank_name?: string | null;
  bank_account_last4?: string | null;
  swift_bic?: string | null;
  paypal_email?: string | null;
  verification_status: "unverified" | "pending" | "verified" | "rejected";
  updated_at?: string;
};

export type AssociatedOperator = {
  id: string;
  full_name: string;
  email?: string | null;
  phone_e164?: string | null;
  company_name?: string | null;
  country_code?: string | null;
  state_code?: string | null;
  city?: string | null;
  license_number?: string | null;
  status: "active" | "inactive" | "pending";
  source: "manual" | "csv";
  created_at: string;
};

export type OperatorContract = {
  id: string;
  contract_type: string;
  title: string;
  version?: string | null;
  status: "pending" | "active" | "expired" | "revoked";
  document_url?: string | null;
  signed_at?: string | null;
  expires_at?: string | null;
  created_at: string;
};

export type OperatorInvoice = {
  id: string;
  reference: string;
  order_id: string;
  mission_id: string;
  amount?: number | null;
  currency: string;
  status: string;
  issued_at: string;
  available_at?: string | null;
};

type Envelope<T> = { data: T };

export const operatorApi = {
  dashboard: () => apiFetch<Envelope<OperatorDashboard>>("/operator/dashboard"),
  onboarding: () => apiFetch<Envelope<OperatorOnboarding>>("/operator/onboarding"),
  saveOnboardingSection: (section: OperatorOnboardingSection, payload: Record<string, unknown>) =>
    apiFetch<Envelope<OperatorOnboarding>>(`/operator/onboarding/${section}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  invites: () => apiFetch<Envelope<OperatorInvite[]>>("/operator/invites"),
  respondToInvite: (id: string, action: "accept" | "decline") =>
    apiFetch<Envelope<OperatorInvite>>(`/operator/invites/${id}/${action}`, { method: "POST" }),
  invoices: () => apiFetch<Envelope<OperatorInvoice[]>>("/operator/invoices"),
  payoutProfile: () => apiFetch<Envelope<OperatorPayoutProfile>>("/operator/payout_profile"),
  updatePayoutProfile: (payload: Record<string, unknown>) =>
    apiFetch<Envelope<OperatorPayoutProfile>>("/operator/payout_profile", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  associatedOperators: () => apiFetch<Envelope<AssociatedOperator[]>>("/operator/associated_operators"),
  createAssociatedOperator: (payload: Record<string, unknown>) =>
    apiFetch<Envelope<AssociatedOperator>>("/operator/associated_operators", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  importAssociatedOperators: (rows: Array<Record<string, string>>) =>
    apiFetch<Envelope<{ imported: number; records: AssociatedOperator[] }>>("/operator/associated_operators/import", {
      method: "POST",
      body: JSON.stringify({ rows }),
    }),
  contracts: () => apiFetch<Envelope<OperatorContract[]>>("/operator/contracts"),
  createSupportRequest: (payload: Record<string, string>) =>
    apiFetch<Envelope<{ id: string; status: string }>>("/operator/support_requests", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
