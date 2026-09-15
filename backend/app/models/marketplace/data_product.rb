# frozen_string_literal: true

module Marketplace
  class DataProduct < ApplicationRecord
    self.table_name = "data_products"

    has_many :mission_products, class_name: "Missions::MissionProduct", dependent: :restrict_with_exception
    has_many :operator_data_products, class_name: "Operators::OperatorDataProduct", dependent: :restrict_with_exception

    validates :slug, presence: true, uniqueness: { case_sensitive: false }
    validates :name, presence: true
    validates :product_type, presence: true

    scope :active, -> { where(active: true) }

    before_validation :normalize_slug

    private

    def normalize_slug
      self.slug = slug.to_s.parameterize if slug.present?
    end
  end
end
