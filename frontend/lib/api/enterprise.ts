import { apiFetch } from "./client";

export type TenantType = "operator" | "enterprise";

export type EnterpriseOverview = {
  unconfirmed: number;
  confirmed: number;
  active: number;
  completed: number;
};

export type EnterpriseDashboard = {
  organization: { id: string; name: string; tenant_type: TenantType; organization_type: string };
  total_orders: number;
  profile_completion: {
    percentage: number;
    complete: boolean;
    fields: Record<string, boolean>;
  };
  orders_overview: EnterpriseOverview;
  missions_overview: EnterpriseOverview;
  recent_notifications: Array<{
    id: string;
    title: string;
    body?: string | null;
    action_url?: string | null;
    read: boolean;
    created_at: string;
  }>;
};

export type EnterpriseProfile = {
  user: {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    email: string;
    user_type: TenantType;
  };
  organization: {
    id: string;
    name: string;
    legal_name?: string | null;
    tax_id?: string | null;
    email?: string | null;
    country_code?: string | null;
    state_code?: string | null;
    city?: string | null;
    organization_type: string;
  };
  profile: {
    industry?: string | null;
    phone_e164?: string | null;
    billing_email?: string | null;
    payment_currency: string;
    billing_address: Record<string, string | undefined>;
    email_notifications: boolean;
  };
};

export type EnterpriseApiKey = {
  id: string;
  name: string;
  prefix?: string | null;
  scopes: string[];
  status: "requested" | "approved" | "active" | "revoked" | "cancelled";
  requested_at: string;
  approved_at?: string | null;
  activated_at?: string | null;
  last_used_at?: string | null;
  expires_at?: string | null;
};

export type EnterpriseInvoice = {
  id: string;
  reference: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
  issued_at: string;
  paid_at?: string | null;
};

export type UpdateEnterpriseProfile = {
  user?: Partial<EnterpriseProfile["user"]>;
  organization?: Partial<EnterpriseProfile["organization"]>;
  profile?: Partial<EnterpriseProfile["profile"]>;
};

export type ApiKeyItem = EnterpriseApiKey;

export type EnterpriseOrder = {
  id: string;
  order_name: string;
  status: string;
  delivery_deadline?: string;
  description?: string;
  map_types: string[];
  location_map?: any;
  specifications?: Record<string, any>;
  estimated_area_hectares?: number;
  quotes_count?: number;
  created_at: string;
  updated_at: string;
  deliverables_count?: number;
};

export type EnterpriseOrderDelivery = {
  order_id: string;
  order_name: string;
  status: string;
  delivery_ready: boolean;
  items: Array<{
    id: string;
    name: string;
    file_type: string;
    file_size_bytes?: number;
    checksum_sha256?: string;
    status: string;
    download_url: string;
    expires_at: string;
  }>;
  delivery_deadline?: string;
};

export const enterpriseApi = {
  dashboard: () => apiFetch<{ data: EnterpriseDashboard }>("/enterprise/dashboard"),
  profile: () => apiFetch<{ data: EnterpriseProfile }>("/enterprise/profile"),
  updateProfile: (body: UpdateEnterpriseProfile) =>
    apiFetch<{ data: EnterpriseProfile }>("/enterprise/profile", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  apiKeys: () => apiFetch<{ data: EnterpriseApiKey[] }>("/enterprise/api_keys"),
  requestApiKey: (body: { name: string; scopes: string[]; expires_at?: string }) =>
    apiFetch<{ data: EnterpriseApiKey }>("/enterprise/api_keys", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  activateApiKey: (id: string) =>
    apiFetch<{ data: EnterpriseApiKey & { secret: string } }>(`/enterprise/api_keys/${id}/activate`, {
      method: "POST",
    }),
  cancelApiKey: (id: string) =>
    apiFetch<{ data: EnterpriseApiKey }>(`/enterprise/api_keys/${id}/cancel`, { method: "POST" }),
  revokeApiKey: (id: string) =>
    apiFetch<{ data: EnterpriseApiKey }>(`/enterprise/api_keys/${id}/revoke`, { method: "POST" }),
  invoices: (status = "all") =>
    apiFetch<{ data: EnterpriseInvoice[] }>(`/enterprise/invoices?status=${encodeURIComponent(status)}`),
  // Orders API
  orders: (status?: string) =>
    apiFetch<{ data: EnterpriseOrder[]; meta?: { total_count: number } }>(
      `/enterprise/orders${status ? `?status=${encodeURIComponent(status)}` : ""}`
    ),
  order: (id: string) => apiFetch<{ data: EnterpriseOrder }>(`/enterprise/orders/${id}`),
  createOrder: (body: {
    orderName: string;
    deliveryDeadline: string;
    mapTypes: string[];
    locationMap: any;
    description?: string;
    specifications?: Record<string, any>;
  }) =>
    apiFetch<{ data: EnterpriseOrder }>("/enterprise/orders", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  cancelOrder: (id: string, reason?: string) =>
    apiFetch<{ data: EnterpriseOrder }>(`/enterprise/orders/${id}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),
  delivery: (id: string) =>
    apiFetch<{ data: EnterpriseOrderDelivery }>(`/enterprise/orders/${id}/delivery`),
};

export const getEnterpriseApiKeys = enterpriseApi.apiKeys;
export const createEnterpriseApiKey = enterpriseApi.requestApiKey;
export const activateEnterpriseApiKey = enterpriseApi.activateApiKey;
export const revokeEnterpriseApiKey = enterpriseApi.revokeApiKey;
export const getEnterpriseOrders = enterpriseApi.orders;
export const createEnterpriseOrder = enterpriseApi.createOrder;

