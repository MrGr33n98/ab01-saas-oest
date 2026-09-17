# frozen_string_literal: true

module Ads
  class BannerPlacement < ApplicationRecord
    self.table_name = "banner_placements"

    has_many :banner_placement_assignments, class_name: "Ads::BannerPlacementAssignment", dependent: :destroy
    has_many :banners, through: :banner_placement_assignments, class_name: "Ads::Banner"

    validates :key, presence: true, uniqueness: true
    validates :name, presence: true
    validates :page_context, inclusion: {
      in: %w[global landing category operators services data_products app_shell mission_workspace pricing blog]
    }

    # Canonical slot catalog for the entire platform (19 Placements)
    CATALOG = [
      # Category Placements
      { key: "category.hero_carousel", name: "Categoria — Hero Carrossel rotativo", page_context: "category", width_hint: 1200, height_hint: 320, description: "Carrossel rotativo de alta visibilidade no Hero das categorias setoriais." },
      { key: "category.top", name: "Categoria — Topo Leaderboard", page_context: "category", width_hint: 1200, height_hint: 90, description: "Leaderboard acima do grid de operadores e use cases." },
      { key: "category.sidebar", name: "Categoria — Sidebar lateral", page_context: "category", width_hint: 260, height_hint: 300, description: "Banner na sidebar abaixo da navegação de setores." },
      { key: "category.in_feed", name: "Categoria — Card Patrocinado no Grid", page_context: "category", width_hint: 400, height_hint: 320, description: "Card patrocinado inserido organicamente entre os operadores homologados." },
      { key: "category.footer_above", name: "Categoria — Banner Pré-Rodapé", page_context: "category", width_hint: 1200, height_hint: 120, description: "Banner full-width de alta conversão antes do rodapé." },

      # Landing Page Placements
      { key: "landing.hero_below", name: "Landing — Abaixo do Hero", page_context: "landing", width_hint: 1200, height_hint: 120, description: "Banner de parceiro institucional logo abaixo do Hero principal." },
      { key: "landing.mid_page", name: "Landing — Meio da página", page_context: "landing", width_hint: 1200, height_hint: 100, description: "Intersticial full-width entre seções de produto e cobertura." },
      { key: "landing.footer_above", name: "Landing — Banner Pré-Rodapé", page_context: "landing", width_hint: 1200, height_hint: 140, description: "Banner largo antes do rodapé principal da plataforma." },

      # Operators Directory & Profiles
      { key: "operators.top", name: "Operadores — Topo da listagem", page_context: "operators", width_hint: 1200, height_hint: 90, description: "Leaderboard no topo do marketplace de operadores." },
      { key: "operators.sidebar", name: "Operadores — Sidebar de filtros", page_context: "operators", width_hint: 260, height_hint: 280, description: "Banner na lateral de filtros do diretório." },
      { key: "operators.list_inline", name: "Operadores — Inline na lista", page_context: "operators", width_hint: 728, height_hint: 90, description: "Card patrocinado a cada N operadores listados." },
      { key: "operator_profile.sponsor", name: "Perfil do Operador — Sponsor Bar / Hardware", page_context: "operators", width_hint: 728, height_hint: 90, description: "Slot de patrocinador/equipamentos no perfil homologado." },

      # Institutional, Pricing & Services
      { key: "services.top", name: "Serviços — Topo Leaderboard", page_context: "services", width_hint: 1200, height_hint: 90, description: "Leaderboard no catálogo de serviços aéreos." },
      { key: "data_products.top", name: "Data Products — Topo", page_context: "data_products", width_hint: 1200, height_hint: 90, description: "Leaderboard na central de produtos de dados e GIS." },
      { key: "pricing.top", name: "Pricing — Topo", page_context: "pricing", width_hint: 1200, height_hint: 90, description: "Banner promocional no topo da tabela de planos." },

      # Blog & Content
      { key: "blog.post_inline", name: "Blog — Meio do artigo", page_context: "blog", width_hint: 728, height_hint: 90, description: "Banner contextual inserido no meio de artigos técnicos." },
      { key: "blog.sidebar", name: "Blog — Sidebar do artigo", page_context: "blog", width_hint: 300, height_hint: 250, description: "Sticky banner na lateral de leitura do blog." },

      # App Portal & Dashboards
      { key: "app.dashboard_top", name: "App — Topo do dashboard do cliente", page_context: "app_shell", width_hint: 960, height_hint: 80, description: "Notificação/anúncio de upgrade no painel do cliente." },
      { key: "operator.portal_top", name: "Portal do Operador — Topo", page_context: "app_shell", width_hint: 960, height_hint: 80, description: "Oportunidades de capacitação e seguros RETA para operadores." },

      # Global Ticker
      { key: "global.header_ticker", name: "Global — Ticker bar no topo do site", page_context: "global", width_hint: 1440, height_hint: 36, description: "Ticker fixo/anúncio prioritário em todo o site." }
    ].freeze

    def self.seed_catalog!
      CATALOG.each do |row|
        placement = find_or_initialize_by(key: row[:key])
        placement.name = row[:name]
        placement.page_context = row[:page_context]
        placement.width_hint = row[:width_hint]
        placement.height_hint = row[:height_hint]
        placement.description = row[:description]
        placement.active = true if placement.new_record?
        placement.save!
      end
    end
  end
end
