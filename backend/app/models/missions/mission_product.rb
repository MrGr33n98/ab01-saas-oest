# frozen_string_literal: true

module Missions
  class MissionProduct < ApplicationRecord
    self.table_name = "mission_products"

    belongs_to :organization
    belongs_to :mission, class_name: "Missions::Mission"
    belongs_to :data_product, class_name: "Marketplace::DataProduct"

    validates :mission_id, uniqueness: { scope: :data_product_id }
  end
end
