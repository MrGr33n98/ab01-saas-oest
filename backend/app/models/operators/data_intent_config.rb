# frozen_string_literal: true

module Operators
  class DataIntentConfig < ApplicationRecord
    self.table_name = "operator_data_intent_configs"

    belongs_to :operator_profile, class_name: "Operators::OperatorProfile"

    validates :min_base_price, numericality: { greater_than_or_equal_to: 0 }
    validates :typical_delivery_days, numericality: { greater_than: 0 }

    def calculate_estimate(service_type:, area_ha:)
      area = area_ha.to_f
      price_per_ha = case service_type.to_s
                     when "multispectral", "agriculture", "ndvi"
                       price_per_hectare_multispectral || 45.0
                     when "lidar", "topography_lidar"
                       price_per_hectare_lidar || 85.0
                     when "thermal", "solar_thermal"
                       # For thermal, base price is flat + lower incremental
                       return {
                         min_price: (thermal_asset_base_price || 3200.0).to_f,
                         max_price: ((thermal_asset_base_price || 3200.0) * 1.25).to_f,
                         estimated_days: typical_delivery_days
                       }
                     else # rgb, mapping, default
                       price_per_hectare_rgb || 25.0
                     end

      calculated = (min_base_price || 1500.0).to_f + (area * price_per_ha.to_f)
      {
        min_price: calculated.round(2),
        max_price: (calculated * 1.20).round(2),
        estimated_days: typical_delivery_days
      }
    end
  end
end
