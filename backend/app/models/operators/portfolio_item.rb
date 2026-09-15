# frozen_string_literal: true

module Operators
  class PortfolioItem < ApplicationRecord
    self.table_name = "operator_portfolio_items"

    ITEM_TYPES = %w[gallery before_after ortho_sample case_study].freeze

    belongs_to :operator_profile, class_name: "Operators::OperatorProfile"
    belongs_to :service_category, class_name: "Marketplace::ServiceCategory", optional: true

    validates :title, presence: true, length: { maximum: 160 }
    validates :item_type, inclusion: { in: ITEM_TYPES }

    scope :featured, -> { where(featured: true) }
    scope :ordered, -> { order(position: :asc, created_at: :desc) }
    scope :by_category, ->(category_id) { where(service_category_id: category_id) if category_id.present? }
  end
end
