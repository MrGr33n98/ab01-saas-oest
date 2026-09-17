import { MOCK_OPERATORS, MOCK_MISSIONS, MOCK_COMPARISON_QUOTES } from "./data";

let MOCK_OPERATOR_ONBOARDING = {
  status: "draft",
  completion_percentage: 17,
  completed_sections: ["address"],
  ready_to_submit: false,
  sections: {
    address: { complete: true, data: { full_name: "Carlos Mendes", company_address: "Av. Brasil, 100", country_code: "BR", state_code: "MT", city: "Cuiabá", phone_e164: "+5565999990101", postal_code: "78000-000", max_travel_distance_km: 250, available_countries: ["BR"] } },
    equipment: { complete: false, data: {} },
    business: { complete: false, data: {} },
    experience: { complete: false, data: {} },
    documents: { complete: false, data: {} },
    pricing: { complete: false, data: {} },
  },
};

let MOCK_OPERATOR_PAYOUT = {
  configured: false,
  account_kind: "business",
  billing: {},
  verification_status: "unverified",
} as Record<string, unknown>;

let MOCK_ASSOCIATED_OPERATORS: Array<Record<string, unknown>> = [];

export async function mockApiFetch<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method || "GET").toUpperCase();
  const url = path.split("?")[0];

  // Artificial realistic network delay (100ms - 250ms)
  await new Promise((res) => setTimeout(res, 120));

  // --- AUTH ---
  if (url === "/auth/sign_in") {
    return {
      data: {
        user: { email: "demo.cliente@dronehub.com.br", first_name: "Cliente", last_name: "Agro", user_type: "enterprise" },
        organization: { id: "org-agro-1", name: "Agropecuária Rio Verde", role: "owner", tenant_type: "enterprise" },
        tokens: {
          access_token: "mock-jwt-access-token-dronehub",
          refresh_token: "mock-jwt-refresh-token-dronehub",
        },
      },
    } as T;
  }

  if (url === "/me") {
    return {
      data: {
        user: { id: "user-1", email: "demo@dronehub.com.br", first_name: "Demo", last_name: "User", user_type: "enterprise" },
        organization: { id: "org-1", name: "Agropecuária Rio Verde", organization_type: "enterprise", tenant_type: "enterprise" },
      },
    } as T;
  }

  // --- ENTERPRISE WORKSPACE ---
  if (url === "/enterprise/dashboard") {
    return {
      data: {
        organization: { id: "org-agro-1", name: "Agropecuária Rio Verde", tenant_type: "enterprise", organization_type: "enterprise" },
        total_orders: 2,
        profile_completion: {
          percentage: 67,
          complete: false,
          fields: { personal_details: true, contact_location: true, billing: false },
        },
        orders_overview: { unconfirmed: 0, confirmed: 1, active: 1, completed: 0 },
        missions_overview: { unconfirmed: 0, confirmed: 1, active: 1, completed: 0 },
        recent_notifications: [
          { id: "notice-enterprise-1", title: "Proposta recebida", body: "Uma nova proposta está disponível para sua missão de mapeamento.", read: false, created_at: "2026-09-15T14:00:00Z", action_url: "/app/missions/ms-101/quotes" },
        ],
      },
    } as T;
  }

  if (url === "/enterprise/profile") {
    const profile = {
      user: { id: "user-1", first_name: "Marina", last_name: "Oliveira", email: "marina@rioverde.com.br", user_type: "enterprise" },
      organization: { id: "org-agro-1", name: "Agropecuária Rio Verde", legal_name: "Agropecuária Rio Verde S.A.", tax_id: "12.345.678/0001-90", email: "contato@rioverde.com.br", country_code: "BR", state_code: "MT", city: "Cuiabá", organization_type: "enterprise" },
      profile: { industry: "Agronegócio", phone_e164: "+55 65 99999-0101", billing_email: "financeiro@rioverde.com.br", payment_currency: "BRL", billing_address: { street: "Av. das Fazendas, 100", postal_code: "78000-000" }, email_notifications: true },
    };
    if (method === "PATCH" && options.body) {
      const body = JSON.parse(options.body as string);
      return { data: { ...profile, user: { ...profile.user, ...body.user }, organization: { ...profile.organization, ...body.organization }, profile: { ...profile.profile, ...body.profile } } } as T;
    }
    return { data: profile } as T;
  }

  if (url === "/enterprise/api_keys") {
    if (method === "POST") {
      const body = options.body ? JSON.parse(options.body as string) : {};
      return { data: { id: `key-${Date.now()}`, name: body.name || "Integração", prefix: null, scopes: body.scopes || [], status: "requested", requested_at: new Date().toISOString(), approved_at: null, activated_at: null, last_used_at: null, expires_at: null } } as T;
    }
    return { data: [{ id: "key-demo-1", name: "BI corporativo", prefix: "dh_live_demo", scopes: ["missions:read", "orders:read"], status: "active", requested_at: "2026-09-12T10:00:00Z", activated_at: "2026-09-13T09:00:00Z", last_used_at: "2026-09-15T08:30:00Z" }, { id: "key-demo-2", name: "Automação de entregáveis", prefix: null, scopes: ["deliverables:read"], status: "requested", requested_at: "2026-09-15T10:00:00Z" }] } as T;
  }

  if (url.startsWith("/enterprise/api_keys/") && url.endsWith("/activate")) {
    const id = url.split("/")[3];
    return { data: { id, name: "Integração aprovada", prefix: "dh_live_7mR8", scopes: ["missions:read"], status: "active", requested_at: new Date().toISOString(), activated_at: new Date().toISOString(), secret: "dh_live_7mR8aG1mX8Vn4QaB2Lc3D5eF6hJ9kP0" } } as T;
  }

  if (url.startsWith("/enterprise/api_keys/") && (url.endsWith("/cancel") || url.endsWith("/revoke"))) {
    const id = url.split("/")[3];
    return { data: { id, name: "Integração", prefix: null, scopes: [], status: url.endsWith("/cancel") ? "cancelled" : "revoked", requested_at: new Date().toISOString() } } as T;
  }

  if (url === "/enterprise/invoices") {
    return { data: [{ id: "pay-demo-1", reference: "PAY-1A2B3C4D", order_id: "ord-201", amount: 5800, currency: "BRL", status: "paid", issued_at: "2026-09-11T10:00:00Z", paid_at: "2026-09-11T10:03:00Z" }] } as T;
  }

  // --- OPERATOR SHOWCASE & WIZARD ---
  if (url.startsWith("/operators/") && url.endsWith("/portfolio")) {
    const slug = url.split("/")[2];
    const op = MOCK_OPERATORS.find((o) => o.slug === slug) || MOCK_OPERATORS[0];
    return { data: op.portfolio_items } as T;
  }

  if (url.startsWith("/operators/") && url.endsWith("/data_intent_config")) {
    const slug = url.split("/")[2];
    const op = MOCK_OPERATORS.find((o) => o.slug === slug) || MOCK_OPERATORS[0];
    return { data: op.data_intent_config } as T;
  }

  if (url.startsWith("/operators/") && url.endsWith("/calculate_intent")) {
    const body = options.body ? JSON.parse(options.body as string) : {};
    const area = parseFloat(body.area_hectares) || 100;
    const type = body.service_type || "rgb";
    const rate = type === "multispectral" ? 42 : type === "lidar" ? 85 : 25;
    const base = 1500;
    const min = base + area * rate;
    return {
      data: {
        service_type: type,
        area_hectares: area,
        estimated_min_price: min,
        estimated_max_price: min * 1.2,
        estimated_days: 4,
        currency: "BRL",
      },
    } as T;
  }

  if (url.startsWith("/operators/") && url.endsWith("/inquiries")) {
    return {
      data: {
        inquiry_id: "inq-" + Date.now(),
        status: "pending_response",
      },
    } as T;
  }

  if (url.startsWith("/operators/") && url.endsWith("/reviews")) {
    const slug = url.split("/")[2];
    const op = MOCK_OPERATORS.find((o) => o.slug === slug) || MOCK_OPERATORS[0];
    return {
      data: {
        reviews: op.reviews,
        metrics: {
          total_count: op.reviews.length,
          overall_average: op.rating_average,
          technical_accuracy_average: 5.0,
          timeliness_average: 4.8,
          communication_average: 5.0,
          safety_compliance_average: 5.0,
        },
      },
    } as T;
  }

  // --- FOLLOWS & FAVORITES ---
  if (url.startsWith("/operators/") && url.endsWith("/follow_status")) {
    return { data: { following: false } } as T;
  }

  if (url.startsWith("/operators/") && url.endsWith("/follow")) {
    return { data: { following: true } } as T;
  }

  if (url.startsWith("/operators/") && url.endsWith("/unfollow")) {
    return { data: { following: false } } as T;
  }

  if (url === "/app/favorites/operators") {
    return {
      data: MOCK_OPERATORS.map((op) => ({
        follow_id: "fol-" + op.id,
        followed_at: new Date().toISOString(),
        operator: op,
      })),
    } as T;
  }

  // --- MISSIONS & QUOTES ---
  if (url.startsWith("/missions/") && url.endsWith("/quote-comparison")) {
    const id = url.split("/")[2];
    const mission = MOCK_MISSIONS.find((m) => m.id === id) || MOCK_MISSIONS[0];
    return {
      data: {
        mission: {
          id: mission.id,
          title: mission.title,
          status: mission.status,
          area_hectares: mission.area_hectares,
          deadline_at: mission.deadline_at,
          currency: "BRL",
        },
        quotes: MOCK_COMPARISON_QUOTES,
      },
    } as T;
  }

  if (url.startsWith("/missions/") && !url.includes("quote")) {
    const id = url.split("/")[2];
    const mission = MOCK_MISSIONS.find((m) => m.id === id) || MOCK_MISSIONS[0];
    return { data: mission } as T;
  }

  if (url === "/missions") {
    return { data: MOCK_MISSIONS } as T;
  }

  if (url.startsWith("/quotes/") && url.endsWith("/accept")) {
    return {
      data: {
        quote_id: "quote-101",
        order_id: "ord-201",
      },
    } as T;
  }

  // --- OPERATOR PROFILE SETTINGS & CUSTOMIZATION ---
  if (url === "/operator/profile") {
    const op = MOCK_OPERATORS[0];
    if (method === "PATCH" && options.body) {
      try {
        const body = JSON.parse(options.body as string);
        Object.assign(op, body);
        return { data: op } as T;
      } catch {
        return { data: op } as T;
      }
    }
    return { data: op } as T;
  }

  // --- OPERATOR DASHBOARD ---
  if (url === "/operator/dashboard") {
    return {
      data: {
        organization: { id: "op-org-1", name: "AeroVision Geotecnologia", tenant_type: "operator", verification_status: "pending", accepting_jobs: true },
        profile_completion: { percentage: MOCK_OPERATOR_ONBOARDING.completion_percentage, complete: false, completed_sections: MOCK_OPERATOR_ONBOARDING.completed_sections },
        onboarding_stages: [
          { id: "address", label: "Address & location", complete: true, href: "/operator/onboarding?section=address" },
          { id: "equipment", label: "Equipment & hardware", complete: false, href: "/operator/onboarding?section=equipment" },
          { id: "business", label: "Business & company", complete: false, href: "/operator/onboarding?section=business" },
          { id: "experience", label: "Experience & skills", complete: false, href: "/operator/onboarding?section=experience" },
          { id: "documents", label: "Documents", complete: false, href: "/operator/onboarding?section=documents" },
          { id: "pricing", label: "Pricing", complete: false, href: "/operator/onboarding?section=pricing" },
        ],
        invites_overview: { active: 1, accepted: 2 },
        orders_overview: { active: 1, completed: 8, pending_payment: 0 },
        missions_overview: { active: 1, completed: 8 },
        recent_invites: [],
        recent_notifications: [{ id: "op-notice-1", title: "Cadastro em revisão", body: "Complete equipamentos e documentos para receber a revisão da plataforma.", read: false, created_at: "2026-09-15T12:00:00Z" }],
      },
    } as T;
  }

  if (url === "/operator/onboarding") {
    return { data: MOCK_OPERATOR_ONBOARDING } as T;
  }

  if (url.startsWith("/operator/onboarding/") && method === "PATCH") {
    const section = url.split("/")[3] as keyof typeof MOCK_OPERATOR_ONBOARDING.sections;
    const body = options.body ? JSON.parse(options.body as string) : {};
    if (MOCK_OPERATOR_ONBOARDING.sections[section]) {
      MOCK_OPERATOR_ONBOARDING.sections[section] = { complete: true, data: body };
      MOCK_OPERATOR_ONBOARDING.completed_sections = Object.entries(MOCK_OPERATOR_ONBOARDING.sections).filter(([, value]) => value.complete).map(([key]) => key);
      MOCK_OPERATOR_ONBOARDING.completion_percentage = Math.round((MOCK_OPERATOR_ONBOARDING.completed_sections.length / 6) * 100);
      MOCK_OPERATOR_ONBOARDING.ready_to_submit = MOCK_OPERATOR_ONBOARDING.completed_sections.length === 6;
      MOCK_OPERATOR_ONBOARDING.status = MOCK_OPERATOR_ONBOARDING.ready_to_submit ? "ready" : "draft";
    }
    return { data: MOCK_OPERATOR_ONBOARDING } as T;
  }

  if (url === "/operator/invites") {
    return { data: [{ id: "invite-demo-1", status: "pending", message: "Precisamos de cobertura RGB e termográfica na janela de setembro.", expires_at: "2026-09-22T18:00:00Z", created_at: "2026-09-15T12:00:00Z", mission: { id: "mission-demo-1", title: "Inspeção de usina solar", mission_type: "inspection", country_code: "BR", state_code: "MT", city: "Cuiabá", area_hectares: 80, deadline_at: "2026-09-29T18:00:00Z", estimated_budget_min: 3500, estimated_budget_max: 5200, currency: "BRL" } }] } as T;
  }

  if (url.startsWith("/operator/invites/") && (url.endsWith("/accept") || url.endsWith("/decline"))) {
    const accepted = url.endsWith("/accept");
    return { data: { id: url.split("/")[3], status: accepted ? "accepted" : "declined", created_at: new Date().toISOString(), responded_at: new Date().toISOString(), mission: { id: "mission-demo-1", title: "Inspeção de usina solar", mission_type: "inspection", currency: "BRL" } } } as T;
  }

  if (url === "/operator/invoices") {
    return { data: [{ id: "invoice-demo-1", reference: "OP-9A43FEE1", order_id: "order-demo-1", mission_id: "mission-demo-1", amount: 4850, currency: "BRL", status: "available", issued_at: "2026-09-12T10:00:00Z", available_at: "2026-09-20T10:00:00Z" }] } as T;
  }

  if (url === "/operator/payout_profile") {
    if (method === "PATCH") {
      const body = options.body ? JSON.parse(options.body as string) : {};
      const bank = body.bank_account || {};
      const number = String(bank.account_number || "");
      MOCK_OPERATOR_PAYOUT = {
        configured: Boolean(number || body.paypal_email), account_kind: body.account_kind || "business", billing: body.billing || {},
        account_holder_name: bank.account_holder_name || null, bank_name: bank.bank_name || null,
        bank_account_last4: number ? number.slice(-4) : MOCK_OPERATOR_PAYOUT.bank_account_last4 || null,
        swift_bic: bank.swift_bic || null, paypal_email: body.paypal_email || null, verification_status: "unverified",
      };
    }
    return { data: MOCK_OPERATOR_PAYOUT } as T;
  }

  if (url === "/operator/associated_operators") {
    if (method === "POST") {
      const body = options.body ? JSON.parse(options.body as string) : {};
      const record = { id: `associate-${Date.now()}`, ...body, country_code: body.country_code || "BR", status: "active", source: "manual", created_at: new Date().toISOString() };
      MOCK_ASSOCIATED_OPERATORS = [record, ...MOCK_ASSOCIATED_OPERATORS];
      return { data: record } as T;
    }
    return { data: MOCK_ASSOCIATED_OPERATORS } as T;
  }

  if (url === "/operator/associated_operators/import" && method === "POST") {
    const body = options.body ? JSON.parse(options.body as string) : { rows: [] };
    const records = (body.rows || []).map((row: Record<string, string>, index: number) => ({ id: `associate-csv-${Date.now()}-${index}`, ...row, status: "active", source: "csv", created_at: new Date().toISOString() }));
    MOCK_ASSOCIATED_OPERATORS = [...records, ...MOCK_ASSOCIATED_OPERATORS];
    return { data: { imported: records.length, records } } as T;
  }

  if (url === "/operator/contracts") return { data: [] } as T;
  if (url === "/operator/support_requests" && method === "POST") return { data: { id: `support-${Date.now()}`, status: "open" } } as T;

  if (url === "/operator/portfolio") {
    return { data: MOCK_OPERATORS[0].portfolio_items } as T;
  }

  if (url === "/operator/services") {
    return { data: MOCK_OPERATORS[0].services } as T;
  }

  if (url === "/operator/fleet/drones" || url === "/operator/drones") {
    return { data: MOCK_OPERATORS[0].drones } as T;
  }

  if (url === "/operator/pilots") {
    return { data: MOCK_OPERATORS[0].pilots } as T;
  }

  // Generic fallback envelope
  return { data: {} } as T;
}
