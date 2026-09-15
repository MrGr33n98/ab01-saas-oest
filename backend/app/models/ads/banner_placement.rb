# frozen_string_literal: true

module Ads
  class BannerPlacement < ApplicationRecord
    self.table_name = "banner_placements"

    has_many :banner_placement_assignments, class_name: "Ads::BannerPlacementAssignment", dependent: :destroy
    has_many :banners, through: :banner_placement_assignments, class_name: "Ads::Banner"

    validates :key, presence: true, uniqueness: true
    validates :name, presence: true
    validates :page_context, inclusion: {
      in: %w[global landing category operators services data_products app_shell mission_workspace pricing]
    }

    # Canonical slot catalog for the platform
    CATALOG = [
      { key: "landing.hero_below", name: "Landing — abaixo do hero", page_context: "landing", width_hint: 1200, height_hint: 120 },
      { key: "landing.mid_page", name: "Landing — meio da página", page_context: "landing", width_hint: 1200, height_hint: 90 },
      { key: "category.top", name: "Categoria — topo", page_context: "category", width_hint: 1200, height_hint: 90 },
      { key: "category.sidebar", name: "Categoria — sidebar", page_context: "category", width_hint: 300, height_hint: 250 },
      { key: "operators.top", name: "Operadores — topo da listagem", page_context: "operators", width_hint: 1200, height_hint: 90 },
      { key: "operators.list_inline", name: "Operadores — inline na lista", page_context: "operators", width_hint: 728, height_hint: 90 },
      { key: "services.top", name: "Serviços — topo", page_context: "services", width_hint: 1200, height_hint: 90 },
      { key: "data_products.top", name: "Data products — topo", page_context: "data_products", width_hint: 1200, height_hint: 90 },
      { key: "pricing.top", name: "Pricing — topo", page_context: "pricing", width_hint: 1200, height_hint: 90 },
      { key: "app.dashboard_top", name: "App — topo do dashboard", page_context: "app_shell", width_hint: 960, height_hint: 80 },
      { key: "mission.workspace_aside", name: "Missão — lateral do workspace", page_context: "mission_workspace", width_hint: 300, height_hint: 250 }
    ].freeze

    def self.seed_catalog!
      CATALOG.each do |row|
        find_or_create_by!(key: row[:key]) do |p|
          p.name = row[:name]
          p.page_context = row[:page_context]
          p.width_hint = row[:width_hint]
          p.height_hint = row[:height_hint]
          p.active = true
          p.description = "Slot de publicidade #{row[:name]}"
        end
      end
    end
  end
end
