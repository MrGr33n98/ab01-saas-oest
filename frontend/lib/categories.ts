/** Catálogo estático de categorias (V1 — espelha seeds / API). */
export const SERVICE_CATEGORIES = [
  { slug: "mapping", name: "Mapeamento", description: "Ortomosaico, topografia e curvas de nível" },
  { slug: "inspection", name: "Inspeção", description: "Ativos, torres, linhas e infraestrutura" },
  { slug: "thermal-inspection", name: "Inspeção térmica", description: "Termografia de painéis e equipamentos" },
  { slug: "agriculture", name: "Agricultura", description: "NDVI, monitoramento de lavoura" },
  { slug: "construction", name: "Construção", description: "Acompanhamento de obra e volumes" },
  { slug: "mining", name: "Mineração", description: "Pilhas, cortes e medição de volume" },
  { slug: "media", name: "Mídia aérea", description: "Fotos e vídeos profissionais" },
  { slug: "survey", name: "Topografia", description: "Levantamento cadastral e geodésico" },
] as const;

export const DATA_PRODUCTS = [
  { slug: "orthomosaic", name: "Ortomosaico", type: "raster", unit: "hectare" },
  { slug: "point-cloud", name: "Nuvem de pontos", type: "point_cloud", unit: "hectare" },
  { slug: "dtm", name: "DTM", type: "raster", unit: "hectare" },
  { slug: "dsm", name: "DSM", type: "raster", unit: "hectare" },
  { slug: "ndvi", name: "NDVI", type: "raster", unit: "hectare" },
  { slug: "thermal", name: "Termografia", type: "raster", unit: "asset" },
  { slug: "lidar", name: "LiDAR", type: "point_cloud", unit: "hectare" },
  { slug: "report", name: "Relatório técnico", type: "document", unit: "unit" },
] as const;
