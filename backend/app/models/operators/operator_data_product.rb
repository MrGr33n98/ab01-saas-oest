# frozen_string_literal: true

module Operators
  class OperatorDataProduct < ApplicationRecord
    self.table_name = "operator_data_products"

    belongs_to :organization
    belongs_to :operator_profile, class_name: "Operators::OperatorProfile"
    belongs_to :data_product, class_name: "Marketplace::DataProduct"

    validates :pricing_model, presence: true
    validates :operator_profile_id, uniqueness: { scope: :data_product_id }

    scope :active, -> { where(active: true) }
  end
end
