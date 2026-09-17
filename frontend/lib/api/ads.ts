import { getApiBase } from "@/lib/api/client";
import type { BannerAd, BannerTrackingPayload } from "@/types/ads";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  const KEY = "oest.ads.session_id";
  let sid = sessionStorage.getItem(KEY);
  if (!sid) {
    sid = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `sid_${Date.now()}`;
    sessionStorage.setItem(KEY, sid);
  }
  return sid;
}

// Fallback mock banners for instant local development & offline resiliency
const MOCK_FALLBACK_BANNERS: Record<string, BannerAd[]> = {
  "category.hero_carousel": [
    {
      id: "mock-hero-dji-energia",
      placement_key: "category.hero_carousel",
      name: "DJI Enterprise — Q3 Energia & Infra",
      format_type: "hero_carousel",
      eyebrow: "EQUIPAMENTO HOMOLOGADO",
      title: "Inspeções Críticas com DJI Matrice 350 RTK & LiDAR",
      subtitle: "Acurácia centimétrica e sensores multiespectrais para usinas solares, eólicas e linhas de transmissão.",
      cta_label: "Solicitar Missão com Matrice 350",
      cta_url: "/app/missions/new",
      image_url: "/images/operator-hero-banner.jpg",
      background_color: "#08121B",
      text_color: "#FFFFFF",
      width_hint: 1200,
      height_hint: 320,
    },
    {
      id: "mock-hero-wingtra-agro",
      placement_key: "category.hero_carousel",
      name: "WingtraOne VTOL — Alta Produtividade",
      format_type: "hero_carousel",
      eyebrow: "TECNOLOGIA VTOL DE PONTA",
      title: "Mapeamento em Larga Escala com Acurácia Subcentimétrica",
      subtitle: "Cubra até 14x mais área por missão com decolagem e pouso vertical para lavouras e grandes obras.",
      cta_label: "Cotar Mapeamento VTOL",
      cta_url: "/app/missions/new",
      image_url: "/images/operator-hero-banner.jpg",
      background_color: "#0A1813",
      text_color: "#FFFFFF",
      width_hint: 1200,
      height_hint: 320,
    },
  ],
  "category.sidebar": [
    {
      id: "mock-sidebar-seguro-reta",
      placement_key: "category.sidebar",
      name: "Seguro RETA & Compliance ANAC",
      format_type: "sidebar",
      eyebrow: "PROTEÇÃO OPERACIONAL",
      title: "Seguro RETA com Apólice Instantânea para Operadores",
      subtitle: "Condições especiais e homologação expressa no SISANT para sua frota de drones.",
      cta_label: "Simular Seguro",
      cta_url: "/contact",
      image_url: null,
      background_color: "#111820",
      text_color: "#FFFFFF",
      width_hint: 260,
      height_hint: 300,
    },
  ],
  "category.footer_above": [
    {
      id: "mock-footer-cta-oest",
      placement_key: "category.footer_above",
      name: "Banner Pré-Rodapé — Plataforma OEST",
      format_type: "footer",
      eyebrow: "CONSULTORIA TÉCNICA",
      title: "Precisa de uma Operação Aérea Especializada em Seu Setor?",
      subtitle: "Nossos engenheiros e pilotos credenciados pelo DECEA planejam toda a missão com entrega em TIFF, LAS e DWG.",
      cta_label: "Falar com Especialista OEST",
      cta_url: "/contact",
      image_url: null,
      background_color: "#10170D",
      text_color: "#F4F7F2",
      width_hint: 1200,
      height_hint: 120,
    },
  ],
  "operators.top": [
    {
      id: "mock-operators-top",
      placement_key: "operators.top",
      name: "Frota Certificada OEST",
      format_type: "leaderboard",
      eyebrow: "REDE HOMOLOGADA",
      title: "Encontre os Melhores Operadores com Certificação DECEA",
      subtitle: "Mais de 180 operadores ativos prontos para decolar em todo o território nacional.",
      cta_label: "Publicar Demanda",
      cta_url: "/app/missions/new",
      image_url: null,
      background_color: "#0D192E",
      text_color: "#FFFFFF",
      width_hint: 1200,
      height_hint: 90,
    },
  ],
};

export async function fetchBannerAds({
  placement,
  category,
  limit = 1,
}: {
  placement: string;
  category?: string;
  limit?: number;
}): Promise<BannerAd[]> {
  try {
    const q = new URLSearchParams({ placement, limit: String(limit) });
    if (category) q.set("category", category);

    const res = await fetch(`${getApiBase()}/ads/banners?${q}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data) && json.data.length > 0) {
        return json.data as BannerAd[];
      }
    }
  } catch {
    /* Silent catch to fallback on mock data */
  }

  // Resilient fallback to mock campaigns
  const fallbacks = MOCK_FALLBACK_BANNERS[placement] || [];
  return fallbacks.slice(0, limit);
}

export async function trackBannerEvent(
  bannerId: string,
  payload: BannerTrackingPayload
): Promise<void> {
  try {
    const body = {
      event_type: payload.event_type,
      placement: payload.placement,
      page_path: payload.page_path || (typeof window !== "undefined" ? window.location.pathname : ""),
      category_slug: payload.category_slug,
      session_id: getSessionId(),
    };

    await fetch(`${getApiBase()}/ads/banners/${bannerId}/track`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Request-Id": typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "",
      },
      body: JSON.stringify(body),
      keepalive: true,
    });
  } catch {
    /* Non-blocking tracking */
  }
}
