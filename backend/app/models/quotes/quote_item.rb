# frozen_string_literal: true

module Quotes
  class QuoteItem < ApplicationRecord
    self.table_name = "quote_items"

    belongs_to :quote, class_name: "Quotes::Quote"
    belongs_to :service_category, class_name: "Marketplace::ServiceCategory", optional: true
    belongs_to :data_product, class_name: "Marketplace::DataProduct", optional: true

    validates :description, :quantity, :unit, :unit_price, :total_price, presence: true
  end
end
