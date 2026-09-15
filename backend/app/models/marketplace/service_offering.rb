# frozen_string_literal: true

module Marketplace
  class ServiceOffering < ApplicationRecord
    self.table_name = "service_offerings"

    belongs_to :organization
    belongs_to :operator_profile, class_name: "Operators::OperatorProfile"
    belongs_to :service_category, class_name: "Marketplace::ServiceCategory"

    validates :title, presence: true, length: { maximum: 180 }
    validates :pricing_model, presence: true
    validates :currency, length: { is: 3 }

    scope :active, -> { where(active: true) }
  end
end
