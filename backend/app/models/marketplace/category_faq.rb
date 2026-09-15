# frozen_string_literal: true

module Marketplace
  class CategoryFaq < ApplicationRecord
    self.table_name = "category_faqs"

    belongs_to :service_category, class_name: "Marketplace::ServiceCategory"

    validates :question, presence: true, length: { maximum: 300 }
    validates :answer, presence: true

    scope :published, -> { where(published: true) }
    scope :ordered, -> { order(:position, :created_at) }
  end
end
