# frozen_string_literal: true

module Marketplace
  class CategoryUseCase < ApplicationRecord
    self.table_name = "category_use_cases"

    belongs_to :service_category, class_name: "Marketplace::ServiceCategory"

    validates :title, presence: true, length: { maximum: 160 }

    scope :published, -> { where(published: true) }
    scope :ordered, -> { order(:position, :created_at) }
  end
end
