import { MOCK_OPERATORS, MOCK_MISSIONS, MOCK_COMPARISON_QUOTES } from "./data";

export async function mockApiFetch<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method || "GET").toUpperCase();
  const url = path.split("?")[0];

  // Artificial realistic network delay (100ms - 250ms)
  await new Promise((res) => setTimeout(res, 120));

  // --- AUTH ---
  if (url === "/auth/sign_in") {
    return {
      data: {
        user: { email: "demo.cliente@dronehub.com.br", first_name: "Cliente", last_name: "Agro" },
        organization: { id: "org-agro-1", name: "Agropecuária Rio Verde", role: "owner" },
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
        user: { id: "user-1", email: "demo@dronehub.com.br", first_name: "Demo", last_name: "User" },
        organization: { id: "org-1", name: "Agropecuária Rio Verde", organization_type: "customer" },
      },
    } as T;
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

  // --- OPERATOR DASHBOARD ---
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
