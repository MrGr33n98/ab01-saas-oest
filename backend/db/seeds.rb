# frozen_string_literal: true

puts "== DroneHub MVP seeds (BRL / BR) =="

[
  { slug: "mapping", name: "Mapeamento", position: 1 },
  { slug: "inspection", name: "Inspeção", position: 2 },
  { slug: "agriculture", name: "Agricultura", position: 3 },
  { slug: "construction", name: "Construção", position: 4 },
  { slug: "mining", name: "Mineração", position: 5 },
  { slug: "thermal-inspection", name: "Inspeção térmica", position: 6 },
  { slug: "media", name: "Mídia aérea", position: 7 },
  { slug: "survey", name: "Topografia", position: 8 }
].each do |attrs|
  Marketplace::ServiceCategory.find_or_create_by!(slug: attrs[:slug]) do |c|
    c.name = attrs[:name]
    c.position = attrs[:position]
    c.active = true
  end
end

[
  { slug: "orthomosaic", name: "Ortomosaico", product_type: "raster", default_unit: "hectare" },
  { slug: "point-cloud", name: "Nuvem de pontos", product_type: "point_cloud", default_unit: "hectare" },
  { slug: "dtm", name: "DTM", product_type: "raster", default_unit: "hectare" },
  { slug: "dsm", name: "DSM", product_type: "raster", default_unit: "hectare" },
  { slug: "ndvi", name: "NDVI", product_type: "raster", default_unit: "hectare" },
  { slug: "thermal", name: "Termografia", product_type: "raster", default_unit: "asset" },
  { slug: "lidar", name: "LiDAR", product_type: "point_cloud", default_unit: "hectare" },
  { slug: "report", name: "Relatório técnico", product_type: "document", default_unit: "unit" }
].each do |attrs|
  Marketplace::DataProduct.find_or_create_by!(slug: attrs[:slug]) do |p|
    p.name = attrs[:name]
    p.product_type = attrs[:product_type]
    p.default_unit = attrs[:default_unit]
    p.active = true
  end
end

admin = User.find_or_initialize_by(email: "admin@dronehub.local")
admin.assign_attributes(
  password: "dronehub-mvp-password",
  password_confirmation: "dronehub-mvp-password",
  platform_role: "super_admin",
  user_type: "enterprise",
  first_name: "Admin",
  last_name: "DroneHub",
  jti: SecureRandom.uuid,
  accepted_terms_at: Time.current
)
admin.save!

puts "Categories: #{Marketplace::ServiceCategory.count}"
puts "Data products: #{Marketplace::DataProduct.count}"
puts "Admin: admin@dronehub.local / password"
puts "== done =="


# --- Ads / Banners ---
begin
  Ads::BannerPlacement.seed_catalog!
  
  sample_campaigns = [
    {
      name: "DJI Enterprise — Q3 Energia & Infra",
      status: "active",
      format_type: "hero_carousel",
      eyebrow: "EQUIPAMENTO HOMOLOGADO",
      title: "Inspeções Críticas com DJI Matrice 350 RTK & LiDAR",
      subtitle: "Acurácia centimétrica e sensores multiespectrais para usinas solares, eólicas e linhas de transmissão.",
      cta_label: "Solicitar Missão com Matrice 350",
      cta_url: "/app/missions/new",
      image_url: "/images/operator-hero-banner.jpg",
      background_color: "#08121B",
      text_color: "#FFFFFF",
      priority: 20,
      weight: 10,
      target_audience: "all",
      geo_scope: "BR",
      targeting: { "category_slugs" => %w[energia infraestrutura mineracao construcao] },
      starts_at: Time.current - 1.day,
      ends_at: Time.current + 365.days,
      placements: %w[category.hero_carousel category.top landing.hero_below]
    },
    {
      name: "WingtraOne VTOL — Agro & Mapeamento",
      status: "active",
      format_type: "hero_carousel",
      eyebrow: "ALTA PRODUTIVIDADE VTOL",
      title: "Mapeamento em Larga Escala com Acurácia Subcentimétrica",
      subtitle: "Cubra até 14x mais área por missão com decolagem e pouso vertical para lavouras e grandes obras.",
      cta_label: "Cotar Mapeamento VTOL",
      cta_url: "/app/missions/new",
      image_url: "/images/operator-hero-banner.jpg",
      background_color: "#0B1A15",
      text_color: "#FFFFFF",
      priority: 15,
      weight: 8,
      target_audience: "all",
      geo_scope: "BR",
      targeting: { "category_slugs" => %w[agronegocio ambiental topografia] },
      starts_at: Time.current - 1.day,
      ends_at: Time.current + 365.days,
      placements: %w[category.hero_carousel category.top]
    },
    {
      name: "Seguro RETA & Compliance ANAC",
      status: "active",
      format_type: "sidebar",
      eyebrow: "PROTEÇÃO OPERACIONAL",
      title: "Seguro RETA com Apólice Instantânea para Operadores",
      subtitle: "Condições especiais e homologação expressa no SISANT para sua frota de drones.",
      cta_label: "Simular Seguro",
      cta_url: "/contact",
      image_url: nil,
      background_color: "#111820",
      text_color: "#FFFFFF",
      priority: 10,
      weight: 5,
      target_audience: "all",
      geo_scope: "BR",
      targeting: {},
      starts_at: Time.current - 1.day,
      ends_at: Time.current + 365.days,
      placements: %w[category.sidebar operators.sidebar blog.sidebar]
    },
    {
      name: "Banner Pré-Rodapé — Plataforma OEST",
      status: "active",
      format_type: "footer",
      eyebrow: "CONSULTORIA TÉCNICA",
      title: "Precisa de uma Operação Aérea Especializada em Seu Setor?",
      subtitle: "Nossos engenheiros e pilotos credenciados pelo DECEA planejam toda a missão com entrega em TIFF, LAS e DWG.",
      cta_label: "Falar com Especialista OEST",
      cta_url: "/contact",
      image_url: nil,
      background_color: "#10170D",
      text_color: "#F4F7F2",
      priority: 5,
      weight: 1,
      target_audience: "all",
      geo_scope: "BR",
      targeting: {},
      starts_at: Time.current - 1.day,
      ends_at: Time.current + 365.days,
      placements: %w[category.footer_above landing.footer_above]
    }
  ]

  sample_campaigns.each do |cdata|
    p_keys = cdata.delete(:placements)
    banner = Ads::Banner.find_or_initialize_by(name: cdata[:name])
    banner.assign_attributes(cdata)
    banner.save!
    
    Ads::BannerPlacement.where(key: p_keys).find_each do |p|
      Ads::BannerPlacementAssignment.find_or_create_by!(banner: banner, banner_placement: p)
    end
  end
rescue StandardError => e
  puts "Ads seed notice: #{e.message}"
end

# --- Plans & feature matrix ---
plans = [
  { slug: "free", name: "Free", audience: "operator", price_monthly_cents: 0, features_json: {} },
  { slug: "starter", name: "Starter", audience: "operator", price_monthly_cents: 9900, features_json: { "profile.quote_request" => true } },
  { slug: "pro", name: "Pro", audience: "operator", price_monthly_cents: 29900, features_json: {
    "profile.quote_request" => true,
    "profile.hero_custom" => true,
    "profile.materials" => true,
    "marketplace.category_featured" => true,
    "marketplace.ads_eligible" => true,
    "analytics.advanced" => true
  }},
  { slug: "enterprise", name: "Enterprise", audience: "operator", price_monthly_cents: 0, features_json: {
    "profile.quote_request" => true,
    "profile.hero_custom" => true,
    "profile.materials" => true,
    "marketplace.category_featured" => true,
    "marketplace.ads_eligible" => true,
    "analytics.advanced" => true,
    "team.seats_extra" => true
  }}
]
plans.each do |attrs|
  p = Billing::Plan.find_or_initialize_by(slug: attrs[:slug])
  p.assign_attributes(attrs.merge(active: true, currency: "BRL"))
  p.save!
end

Entitlements::Catalog::FEATURES.each do |key, meta|
  FeatureDefinition.find_or_create_by!(key: key) do |f|
    f.name = meta[:name]
    f.description = meta[:description]
    f.category = meta[:category]
    f.min_plan = meta[:min_plan]
    f.active = true
  end
end

%w[starter pro enterprise].each do |plan_slug|
  plan = Billing::Plan.find_by!(slug: plan_slug)
  FeatureDefinition.find_each do |fd|
    enabled = plan.features_json[fd.key] == true
    next unless enabled
    PlanFeature.find_or_create_by!(plan: plan, feature_definition: fd) do |pf|
      pf.enabled = true
    end
  end
end

[
  { key: "identity_verified", name: "Identidade verificada", name_en: "Identity verified", icon: "shield", position: 1 },
  { key: "company_verified", name: "Empresa verificada", name_en: "Company verified", icon: "building", position: 2 },
  { key: "insurance", name: "Seguro declarado", name_en: "Insurance on file", icon: "file", position: 3 },
  { key: "fleet_certified", name: "Frota certificada", name_en: "Certified fleet", icon: "plane", position: 4 },
  { key: "top_responder", name: "Resposta rápida", name_en: "Fast responder", icon: "zap", position: 5 }
].each do |b|
  VerificationBadge.find_or_create_by!(key: b[:key]) do |vb|
    vb.name = b[:name]
    vb.name_en = b[:name_en]
    vb.icon = b[:icon]
    vb.position = b[:position]
    vb.active = true
  end
end

puts "Plans: #{Billing::Plan.count} Features: #{FeatureDefinition.count} Badges: #{VerificationBadge.count}"
