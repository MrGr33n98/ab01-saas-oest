# frozen_string_literal: true

class PortfolioItemSerializer < ApplicationSerializer
  attributes :id, :operator_profile_id, :service_category_id, :title,
             :description, :item_type, :media_assets, :before_after_assets,
             :location_city, :location_state, :area_hectares, :position,
             :featured, :created_at

  attribute :category_name do |item|
    item.service_category&.name
  end
end
