import { getMessages, type Locale } from "./i18n";

const getApiBase = () =>
  process.env.OEST_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001/api/v1";

export type CategorySidebarItem = {
  id: string;
  slug: string;
  name: string;
  short_name?: string;
  description?: string;
  icon_key: string;
  operator_count: number;
  position: number;
};

export const DATA_PRODUCTS = [
  { slug: "orthomosaic", name: "Ortomosaico", type: "raster", unit: "hectare", description: "Mosaico ortorretificado em alta resolução (GSD < 3cm)" },
  { slug: "point-cloud", name: "Nuvem de pontos", type: "point_cloud", unit: "hectare", description: "Nuvem de pontos 3D densa classificada" },
  { slug: "dtm", name: "DTM / MDT", type: "raster", unit: "hectare", description: "Modelo Digital do Terreno sem vegetação/edificações" },
  { slug: "dsm", name: "DSM / MDS", type: "raster", unit: "hectare", description: "Modelo Digital de Superfície completo" },
  { slug: "ndvi", name: "NDVI / NDRE", type: "raster", unit: "hectare", description: "Índice de vegetação multiespectral" },
  { slug: "thermal", name: "Termografia", type: "raster", unit: "asset", description: "Termografia radiométrica calibrada" },
  { slug: "lidar", name: "LiDAR", type: "point_cloud", unit: "hectare", description: "Varredura laser de alta penetração" },
  { slug: "report", name: "Relatório técnico", type: "document", unit: "unit", description: "Laudo técnico com ART e assinatura de engenheiro" },
] as const;

export type CategoryUseCase = {
  id: string;
  title: string;
  short_description?: string;
  body?: string;
  icon_key?: string;
};

export type CategoryFaq = {
  id: string;
  question: string;
  short_answer?: string;
  answer: string;
};

export type CategoryRelated = {
  id: string;
  slug: string;
  name: string;
  icon_key: string;
  operators_count: number;
};

export type CategoryDetail = {
  id: string;
  public_id?: string;
  slug: string;
  name: string;
  short_name?: string;
  icon_key: string;
  eyebrow?: string;
  headline: string;
  subheadline: string;
  short_description?: string;
  long_description?: string;
  ai_summary?: string;
  hero: {
    image_url?: string | null;
    mobile_image_url?: string | null;
    alt?: string;
    caption?: string;
    focal_x?: number;
    focal_y?: number;
  };
  seo: {
    title: string;
    description: string;
    keywords?: string;
    canonical_url: string;
    robots_index: boolean;
    robots_follow: boolean;
    schema_type: string;
  };
  social: {
    og_title: string;
    og_description: string;
    og_image_url?: string | null;
    twitter_title: string;
    twitter_description: string;
    twitter_image_url?: string | null;
  };
  geo_aeo?: {
    answer_summary?: string;
    entity_description?: string;
  };
  editorial?: {
    overview_title?: string;
    overview_body?: string;
    services_title?: string;
    services_description?: string;
    use_cases_title?: string;
    use_cases_description?: string;
    operators_title?: string;
    operators_description?: string;
    faq_title?: string;
    faq_description?: string;
    related_categories_title?: string;
  };
  cta: {
    title: string;
    description: string;
    primary_label: string;
    primary_url: string;
    secondary_label: string;
    secondary_url: string;
  };
  counts: {
    operators: number;
    services: number;
  };
  use_cases: CategoryUseCase[];
  faqs: CategoryFaq[];
  related_categories: CategoryRelated[];
};

export const PRIMARY_SECTORS: CategorySidebarItem[] = [
  { id: "sec-all", slug: "all", name: "Todos os setores", description: "Todos os setores e categorias de serviços aéreos", icon_key: "layout-grid", operator_count: 128, position: 0 },
  { id: "sec-1", slug: "energia", name: "Energia", description: "Usinas solares, eólicas e linhas de transmissão", icon_key: "zap", operator_count: 18, position: 1 },
  { id: "sec-2", slug: "infraestrutura", name: "Infraestrutura", description: "Rodovias, ferrovias, portos e obras lineares", icon_key: "building-2", operator_count: 24, position: 2 },
  { id: "sec-3", slug: "construcao", name: "Construção", description: "Acompanhamento de obras e volumetria", icon_key: "hard-hat", operator_count: 16, position: 3 },
  { id: "sec-4", slug: "mineracao", name: "Mineração", description: "Pilhas de minério, cavas e cálculos de volume", icon_key: "mountain", operator_count: 14, position: 4 },
  { id: "sec-5", slug: "agronegocio", name: "Agronegócio", description: "NDVI, sanidade vegetal e agricultura de precisão", icon_key: "sprout", operator_count: 22, position: 5 },
  { id: "sec-6", slug: "imobiliario", name: "Imobiliário", description: "Loteamentos, inspeção predial e imagens aéreas", icon_key: "home", operator_count: 10, position: 6 },
  { id: "sec-7", slug: "seguranca", name: "Segurança", description: "Vigilância perimetral e monitoramento de áreas críticas", icon_key: "shield-check", operator_count: 12, position: 7 },
  { id: "sec-8", slug: "ambiental", name: "Ambiental", description: "Monitoramento de APPs, reflorestamento e fauna", icon_key: "trees", operator_count: 15, position: 8 },
];

export const SERVICE_CATEGORIES = PRIMARY_SECTORS.filter((s) => s.slug !== "all");

/**
 * Returns sectors localized according to active locale
 */
export function getLocalizedSectors(locale: Locale = "pt-BR"): CategorySidebarItem[] {
  const msgs = getMessages(locale);
  return PRIMARY_SECTORS.map((sec) => {
    const secMsgs = msgs.sectors[sec.slug as keyof typeof msgs.sectors];
    if (secMsgs) {
      return {
        ...sec,
        name: secMsgs.name,
        short_name: secMsgs.shortName,
        description: secMsgs.description,
      };
    }
    return sec;
  });
}

export const MOCK_CATEGORY_DETAILS: Record<string, CategoryDetail> = {
  infraestrutura: {
    id: "cat-infra-01",
    public_id: "cat_infra01",
    slug: "infraestrutura",
    name: "Infraestrutura",
    short_name: "Infra",
    icon_key: "building-2",
    eyebrow: "02",
    headline: "Infraestrutura",
    subheadline: "Levantamento, monitoramento e inspeção de ativos críticos com dados geoespaciais de alta precisão.",
    short_description: "Soluções de sensoriamento remoto, aerolevantamento com LiDAR e inspeção visual de rodovias, ferrovias, portos e linhas de transmissão.",
    hero: {
      image_url: "/images/operator-hero-banner.jpg",
      mobile_image_url: "/images/operator-hero-banner.jpg",
      alt: "Inspeção aérea de infraestrutura rodoviária e pontes com drones",
      caption: "Aerofotogrametria e LiDAR em obras de grande porte",
      focal_x: 50,
      focal_y: 50,
    },
    seo: {
      title: "Serviços de Drones para Infraestrutura · Operadores Homologados ANAC | OEST",
      description: "Contrate empresas e pilotos de drone certificados para inspeção de rodovias, ferrovias, linhas de transmissão e obras civis em todo o Brasil.",
      keywords: "drones infraestrutura, lidar aéreo, inspeção de rodovias, ortomosaico obras, topografia drone",
      canonical_url: "https://oest.com.br/categories/infraestrutura",
      robots_index: true,
      robots_follow: true,
      schema_type: "CollectionPage",
    },
    social: {
      og_title: "Drones para Infraestrutura · Inteligência Geoespacial e LiDAR",
      og_description: "Encontre operadores certificados para mapeamento topográfico, inspeção de pontes e monitoramento de obras civis.",
      og_image_url: "/images/operator-hero-banner.jpg",
      twitter_title: "Drones para Infraestrutura | OEST",
      twitter_description: "Encontre operadores certificados para mapeamento topográfico e inspeções.",
      twitter_image_url: "/images/operator-hero-banner.jpg",
    },
    geo_aeo: {
      answer_summary: "OEST conecta empresas de engenharia a operadores de drone homologados pela ANAC para aerolevantamentos com LiDAR, inspeção de estruturas e geração de modelos DTM/DSM milimétricos.",
      entity_description: "Categoria de serviços aéreos especializados em obras lineares, transporte e concessões rodoviárias.",
    },
    editorial: {
      overview_title: "Como os drones transformam o ciclo de vida da infraestrutura",
      overview_body: "A captura de dados geoespaciais de alta frequência permite aos gestores de infraestrutura acompanhar o avanço físico de obras, prever descalçamentos em encostas, mapear faixas de servidão e auditar conformidade de terraplanagem com relatórios compatíveis com BIM e GIS.",
      services_title: "Serviços Mais Solicitados em Infraestrutura",
      services_description: "Tecnologia de ponta embarcada em sensores LiDAR e câmeras full-frame fotogramétricas.",
      use_cases_title: "Sub-segmentos & Aplicações Especializadas",
      use_cases_description: "Missões padronizadas e homologadas para os principais setores de infraestrutura do país.",
      operators_title: "Operadores Especializados em Infraestrutura",
      operators_description: "Empresas com registro no SISANT/ANAC, seguro RETA obrigatório e histórico auditado de entregas.",
      faq_title: "Perguntas Frequentes sobre Operações em Infraestrutura",
      faq_description: "Esclareça dúvidas sobre precisão, entregáveis e normas regulatórias.",
      related_categories_title: "Setores Relacionados",
    },
    cta: {
      title: "Pronto para mapear ou inspecionar sua obra?",
      description: "Descreva a área de interesse (KML/KMZ) e receba até 3 propostas de operadores verificados em menos de 24 horas.",
      primary_label: "Solicitar Missão de Infraestrutura",
      primary_url: "/app/missions/new?category=infraestrutura",
      secondary_label: "Falar com Especialista",
      secondary_url: "/contact",
    },
    counts: {
      operators: 24,
      services: 8,
    },
    use_cases: [
      { id: "uc-1", title: "Rodovias", icon_key: "road", short_description: "Levantamento de faixa de domínio, drenagem e asfalto com LiDAR." },
      { id: "uc-2", title: "Ferrovias", icon_key: "train", short_description: "Inspeção de trilhos, taludes e gabaritos ferroviários." },
      { id: "uc-3", title: "Linhas de Transmissão", icon_key: "zap", short_description: "Inspeção termográfica e LiDAR de corona e vegetação." },
      { id: "uc-4", title: "Obras Civis", icon_key: "building-2", short_description: "Controle de terraplanagem, volumetria e gêmeo digital BIM." },
      { id: "uc-5", title: "Portos e Aeroportos", icon_key: "anchor", short_description: "Mapeamento perimetral, pistas e batimetria integrada." },
    ],
    faqs: [
      {
        id: "faq-1",
        question: "Qual a precisão posicional alcançada nos levantamentos de infraestrutura?",
        short_answer: "Com suporte a GNSS RTK/PPK e pontos de controle em solo (GCPs), a acurácia alcança de 1 a 3 cm horizontal e 3 a 5 cm vertical.",
        answer: "Os operadores homologados utilizam receptores geodésicos de dupla frequência em solo e drones com tecnologia RTK/PPK embarcada, garantindo que os ortomosaicos e nuvens de pontos LiDAR atendam aos mais rigorosos padrões de engenharia (Padrão de Exatidão Cartográfica - PEC Classe A).",
      },
      {
        id: "faq-2",
        question: "Quais formatos de arquivo são entregues para a equipe de engenharia?",
        short_answer: "GeoTIFF, LAS/LAZ (nuvem de pontos), DWG/DXF (curvas de nível), SHP e relatórios volumétricos.",
        answer: "Todos os produtos são entregues nos sistemas de coordenadas oficiais do Brasil (SIRGAS 2000 / UTM) prontos para importação direta no AutoCAD Civil 3D, QGIS, ArcGIS, Revit e softwares de cálculo de corte/aterro.",
      },
      {
        id: "faq-3",
        question: "As operações cumprem todas as exigências da ANAC e DECEA?",
        short_answer: "Sim, 100% dos voos são registrados com seguro RETA e autorização DECEA/SARPAS.",
        answer: "A plataforma OEST só publica operadores com pilotos credenciados (CANAC), aeronaves registradas no SISANT e cobertura de seguro de responsabilidade civil aeronáutica (RETA) rigorosamente em dia.",
      },
    ],
    related_categories: [
      { id: "rel-1", slug: "construcao", name: "Construção", icon_key: "hard-hat", operators_count: 16 },
      { id: "rel-2", slug: "energia", name: "Energia", icon_key: "zap", operators_count: 18 },
      { id: "rel-3", slug: "mineracao", name: "Mineração", icon_key: "mountain", operators_count: 14 },
    ],
  },
  energia: {
    id: "cat-energia-01",
    public_id: "cat_energy01",
    slug: "energia",
    name: "Energia",
    short_name: "Energia",
    icon_key: "zap",
    eyebrow: "01",
    headline: "Energia & Renováveis",
    subheadline: "Termografia radiométrica e inspeção de usinas solares, parques eólicos e subestações.",
    short_description: "Auditoria termográfica com drones para identificação de hotspots em painéis fotovoltaicos e pás eólicas.",
    hero: {
      image_url: "/images/operator-hero-banner.jpg",
      mobile_image_url: "/images/operator-hero-banner.jpg",
      alt: "Inspeção aérea com termografia de usina solar fotovoltaica",
      caption: "Termografia aérea e diagnóstico de eficiência energética",
      focal_x: 50,
      focal_y: 50,
    },
    seo: {
      title: "Inspeção de Usinas Solares e Eólicas com Drones · OEST",
      description: "Contrate inspeções termográficas radiométricas para comissionamento e manutenção de usinas fotovoltaicas e parques eólicos.",
      canonical_url: "https://oest.com.br/categories/energia",
      robots_index: true,
      robots_follow: true,
      schema_type: "CollectionPage",
    },
    social: {
      og_title: "Inspeção de Energia & Termografia Aérea",
      og_description: "Laudos termográficos com sensor radiométrico FLIR para usinas solares e subestações.",
      og_image_url: "/images/operator-hero-banner.jpg",
      twitter_title: "Drones para Energia | OEST",
      twitter_description: "Inspeção de parques solares e linhas de alta tensão.",
      twitter_image_url: "/images/operator-hero-banner.jpg",
    },
    cta: {
      title: "Monitore a eficiência da sua usina",
      description: "Receba relatórios detalhados com classificação IEC de anomalias térmicas e georreferenciamento de módulos defeituosos.",
      primary_label: "Solicitar Inspeção Solar",
      primary_url: "/app/missions/new?category=energia",
      secondary_label: "Falar com Engenheiro",
      secondary_url: "/contact",
    },
    counts: {
      operators: 18,
      services: 6,
    },
    use_cases: [
      { id: "uc-en-1", title: "Usinas Solares", icon_key: "sun", short_description: "Auditoria termográfica radiométrica IEC 62446-3." },
      { id: "uc-en-2", title: "Parques Eólicos", icon_key: "wind", short_description: "Inspeção estrutural de pás e naceles com IA." },
      { id: "uc-en-3", title: "Subestações", icon_key: "zap", short_description: "Termografia de transformadores e isoladores de alta tensão." },
    ],
    faqs: [
      {
        id: "faq-en-1",
        question: "A inspeção termográfica segue as normas internacionais IEC?",
        short_answer: "Sim, os laudos são elaborados em estrita conformidade com a norma IEC 62446-3.",
        answer: "A captura é realizada durante irradiância solar superior a 600 W/m² com câmeras radiométricas calibradas, gerando laudos categorizados por severidade térmica (delta T).",
      },
    ],
    related_categories: [
      { id: "rel-en-1", slug: "infraestrutura", name: "Infraestrutura", icon_key: "building-2", operators_count: 24 },
      { id: "rel-en-2", slug: "ambiental", name: "Ambiental", icon_key: "trees", operators_count: 15 },
    ],
  },
};

/**
 * Returns localized category detail when language is English
 */
export function getLocalizedCategoryDetail(detail: CategoryDetail, locale: Locale = "pt-BR"): CategoryDetail {
  if (locale !== "en") return detail;

  const msgs = getMessages(locale);
  const secMsgs = msgs.sectors[detail.slug as keyof typeof msgs.sectors];

  const localizedName = secMsgs?.name || detail.name;
  const localizedHeadline = detail.slug === "energia" ? "Energy & Renewables" : detail.slug === "infraestrutura" ? "Infrastructure" : localizedName;
  const localizedSubheadline = detail.slug === "energia"
    ? "Radiometric thermography and high-precision inspection of solar plants, wind farms and substations."
    : detail.slug === "infraestrutura"
    ? "Surveys, monitoring and inspection of critical assets with millimeter-precision geospatial data."
    : `Specialized aerial surveys and drone operations for ${localizedName}.`;

  return {
    ...detail,
    name: localizedName,
    short_name: secMsgs?.shortName || detail.short_name,
    headline: localizedHeadline,
    subheadline: localizedSubheadline,
    short_description: secMsgs?.description || detail.short_description,
    editorial: detail.editorial ? {
      ...detail.editorial,
      overview_title: detail.slug === "infraestrutura" ? "How drones transform the infrastructure lifecycle" : "Sector Overview",
      services_title: "Featured Services",
      services_description: "Cutting-edge LiDAR sensors and full-frame photogrammetric systems.",
      use_cases_title: "Sub-segments & Specialized Applications",
      use_cases_description: "Standardized and certified missions for major industries.",
      operators_title: "Specialized Certified Operators",
      operators_description: "Companies with valid ANAC/SISANT registration and mandatory RETA insurance.",
      faq_title: "Frequently Asked Questions",
      faq_description: "Key answers about accuracy, deliverables, and flight regulations.",
      related_categories_title: "Related Sectors",
    } : undefined,
    cta: {
      title: `Ready to map or inspect in ${localizedName}?`,
      description: "Describe your area of interest (KML/KMZ) and receive up to 3 verified proposals within 24 hours.",
      primary_label: `Request ${localizedName} Mission`,
      primary_url: detail.cta.primary_url,
      secondary_label: "Talk to a Specialist",
      secondary_url: detail.cta.secondary_url,
    },
    related_categories: detail.related_categories.map((rel) => {
      const relSec = msgs.sectors[rel.slug as keyof typeof msgs.sectors];
      return {
        ...rel,
        name: relSec?.name || rel.name,
      };
    }),
  };
}

export const MOCK_CATEGORY_OPERATORS = [
  {
    id: "op-1",
    slug: "aerovision-mt",
    name: "AeroVision MT",
    headline: "Especialista em mapeamento de infraestrutura linear, obras viárias e monitoramento de ativos.",
    headline_en: "Specialist in linear infrastructure mapping, road works, and asset monitoring.",
    city: "Sinop",
    state_code: "MT",
    rating_average: 5.0,
    rating_count: 28,
    missions_completed: 34,
    anac_verified: true,
    available: true,
    skills: ["LiDAR", "Fotogrametria", "Inspeção", "RTK"],
    avatar_url: "/images/nuvem-geo-logo.png",
    banner_image_url: "/images/operator-hero-banner.jpg",
  },
  {
    id: "op-2",
    slug: "geoscan-brasil",
    name: "GeoScan Brasil",
    headline: "Levantamento e inspeção de linhas de transmissão, subestações e grandes estruturas.",
    headline_en: "Survey and inspection of transmission lines, substations, and large structures.",
    city: "São Paulo",
    state_code: "SP",
    rating_average: 4.8,
    rating_count: 19,
    missions_completed: 27,
    anac_verified: true,
    available: true,
    skills: ["Termografia", "Inspeção", "LiDAR", "BIM"],
    avatar_url: "/images/oest-logo.png",
    banner_image_url: "/images/operator-hero-banner.jpg",
  },
  {
    id: "op-3",
    slug: "terramap",
    name: "TerraMap",
    headline: "Mapeamento e acompanhamento de obras de grande escala com alta precisão e produtividade.",
    headline_en: "Large-scale construction mapping and progress tracking with high precision and productivity.",
    city: "Belo Horizonte",
    state_code: "MG",
    rating_average: 4.9,
    rating_count: 31,
    missions_completed: 42,
    anac_verified: true,
    available: true,
    skills: ["Fotogrametria", "Volumetria", "Ortomosaico", "PPK"],
    avatar_url: "/images/nuvem-geo-logo.png",
    banner_image_url: "/images/operator-hero-banner.jpg",
  },
  {
    id: "op-4",
    slug: "horus-drones",
    name: "Horus Drones",
    headline: "Inspeção e monitoramento de rodovias, taludes e obras de infraestrutura.",
    headline_en: "Inspection and monitoring of highways, slopes, and infrastructure works.",
    city: "Curitiba",
    state_code: "PR",
    rating_average: 4.7,
    rating_count: 16,
    missions_completed: 18,
    anac_verified: true,
    available: true,
    skills: ["Inspeção", "LiDAR", "Fotogrametria", "Termografia"],
    avatar_url: "/images/oest-logo.png",
    banner_image_url: "/images/operator-hero-banner.jpg",
  },
  {
    id: "op-5",
    slug: "vista-aerea",
    name: "Vista Aérea",
    headline: "Mapeamento de obras, controle de avanço físico e modelagem 3D para infraestrutura.",
    headline_en: "Construction mapping, physical progress monitoring, and 3D modeling for infrastructure.",
    city: "Goiânia",
    state_code: "GO",
    rating_average: 4.8,
    rating_count: 23,
    missions_completed: 31,
    anac_verified: true,
    available: true,
    skills: ["Ortomosaico", "BIM", "Volumetria", "PPK"],
    avatar_url: "/images/nuvem-geo-logo.png",
    banner_image_url: "/images/operator-hero-banner.jpg",
  },
  {
    id: "op-6",
    slug: "maptech",
    name: "MapTech",
    headline: "Soluções em geoinformação para obras civis, ferroviárias e infraestrutura urbana.",
    headline_en: "Geoinformation solutions for civil works, railways, and urban infrastructure.",
    city: "Porto Alegre",
    state_code: "RS",
    rating_average: 4.9,
    rating_count: 27,
    missions_completed: 29,
    anac_verified: true,
    available: true,
    skills: ["LiDAR", "Inspeção", "BIM", "Fotogrametria"],
    avatar_url: "/images/oest-logo.png",
    banner_image_url: "/images/operator-hero-banner.jpg",
  },
];

export async function fetchCategoryBySlug(slug: string): Promise<CategoryDetail> {
  try {
    const res = await fetch(`${getApiBase()}/marketplace/categories/${slug}`, {
      next: { revalidate: 60, tags: [`category:${slug}`] },
    });
    if (!res.ok) {
      return MOCK_CATEGORY_DETAILS[slug] || generateFallbackCategory(slug);
    }
    const json = await res.json();
    return json.data || (MOCK_CATEGORY_DETAILS[slug] || generateFallbackCategory(slug));
  } catch {
    return MOCK_CATEGORY_DETAILS[slug] || generateFallbackCategory(slug);
  }
}

export async function fetchCategoryNavigation(): Promise<CategorySidebarItem[]> {
  try {
    const res = await fetch(`${getApiBase()}/marketplace/categories`, {
      next: { revalidate: 300, tags: ["categories:navigation"] },
    });
    if (!res.ok) return PRIMARY_SECTORS;
    const json = await res.json();
    return json.data?.length ? json.data : PRIMARY_SECTORS;
  } catch {
    return PRIMARY_SECTORS;
  }
}

function generateFallbackCategory(slug: string): CategoryDetail {
  const match = PRIMARY_SECTORS.find((s) => s.slug === slug);
  const name = match?.name || slug.charAt(0).toUpperCase() + slug.slice(1);
  return {
    id: `cat-${slug}`,
    slug: slug,
    name: name,
    icon_key: match?.icon_key || "building-2",
    eyebrow: "SETOR",
    headline: name,
    subheadline: `Levantamento e serviços aéreos especializados para ${name} com drones homologados.`,
    hero: {
      image_url: "/images/operator-hero-banner.jpg",
      alt: `Operação de drones em ${name}`,
      focal_x: 50,
      focal_y: 50,
    },
    seo: {
      title: `Serviços de Drones para ${name} | OEST`,
      description: `Contrate operadores de drone verificados para missões no setor de ${name}.`,
      canonical_url: `https://oest.com.br/categories/${slug}`,
      robots_index: true,
      robots_follow: true,
      schema_type: "CollectionPage",
    },
    social: {
      og_title: `Drones para ${name} | OEST`,
      og_description: `Operadores homologados e serviços especializados em ${name}.`,
      og_image_url: "/images/operator-hero-banner.jpg",
      twitter_title: `Drones para ${name} | OEST`,
      twitter_description: `Operadores homologados em ${name}.`,
      twitter_image_url: "/images/operator-hero-banner.jpg",
    },
    cta: {
      title: `Precisa de uma operação em ${name}?`,
      description: "Receba orçamentos de empresas verificadas pela ANAC.",
      primary_label: "Solicitar Missão",
      primary_url: `/app/missions/new?category=${slug}`,
      secondary_label: "Falar com Consultor",
      secondary_url: "/contact",
    },
    counts: {
      operators: match?.operator_count || 12,
      services: 4,
    },
    use_cases: [],
    faqs: [],
    related_categories: PRIMARY_SECTORS.filter((s) => s.slug !== slug && s.slug !== "all").slice(0, 3).map((s) => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
      icon_key: s.icon_key,
      operators_count: s.operator_count,
    })),
  };
}
