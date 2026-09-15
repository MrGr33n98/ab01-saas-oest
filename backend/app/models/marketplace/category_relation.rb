# frozen_string_literal: true

module Marketplace
  class CategoryRelation < ApplicationRecord
    self.table_name = "category_relations"

    belongs_to :service_category, class_name: "Marketplace::ServiceCategory"
    belongs_to :related_category, class_name: "Marketplace::ServiceCategory"

    validates :related_category_id, uniqueness: { scope: :service_category_id }

    scope :ordered, -> { order(:position, :created_at) }
  end
end
