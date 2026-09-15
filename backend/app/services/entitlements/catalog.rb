# frozen_string_literal: true

module Entitlements
  # Canonical paid feature keys — source of truth for flags.
  module Catalog
    FEATURES = {
      "profile.hero_custom" => {
        name: "Hero banner customizado",
        description: "Banner estilo LinkedIn no perfil público",
        category: "profile",
        min_plan: "pro"
      },
      "profile.materials" => {
        name: "Materiais baixáveis",
        description: "Upload de PDFs/portfólio no perfil",
        category: "profile",
        min_plan: "pro"
      },
      "profile.quote_request" => {
        name: "Botão solicitar orçamento",
        description: "Lead form no perfil público",
        category: "growth",
        min_plan: "starter"
      },
      "marketplace.category_featured" => {
        name: "Destaque em categoria",
        description: "Visibilidade prioritária nas listagens de categoria",
        category: "growth",
        min_plan: "pro"
      },
      "marketplace.ads_eligible" => {
        name: "Elegível a anúncios pagos",
        description: "Pode comprar slots de banner no marketplace",
        category: "ads",
        min_plan: "pro"
      },
      "analytics.advanced" => {
        name: "Analytics avançado",
        description: "Métricas de perfil e propostas",
        category: "analytics",
        min_plan: "pro"
      },
      "team.seats_extra" => {
        name: "Assentos extras de time",
        description: "Mais de 3 membros na organização",
        category: "team",
        min_plan: "enterprise"
      }
    }.freeze

    module_function

    def keys
      FEATURES.keys
    end

    def fetch(key)
      FEATURES.fetch(key.to_s)
    end
  end
end
