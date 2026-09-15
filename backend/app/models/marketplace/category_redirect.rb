# frozen_string_literal: true

module Marketplace
  class CategoryRedirect < ApplicationRecord
    self.table_name = "category_redirects"

    belongs_to :service_category, class_name: "Marketplace::ServiceCategory"

    validates :old_slug, presence: true, uniqueness: true
    validates :new_slug, presence: true
    validates :redirect_type, presence: true, inclusion: { in: [301, 302, 307, 308] }
  end
end
