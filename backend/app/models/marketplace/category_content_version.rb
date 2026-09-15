# frozen_string_literal: true

module Marketplace
  class CategoryContentVersion < ApplicationRecord
    self.table_name = "category_content_versions"

    belongs_to :service_category, class_name: "Marketplace::ServiceCategory"

    validates :version, presence: true, uniqueness: { scope: :service_category_id }
    validates :snapshot, presence: true

    scope :ordered, -> { order(version: :desc) }
  end
end
