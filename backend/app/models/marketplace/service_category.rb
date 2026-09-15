# frozen_string_literal: true

module Marketplace
  class ServiceCategory < ApplicationRecord
    self.table_name = "service_categories"

    belongs_to :parent, class_name: "Marketplace::ServiceCategory", optional: true
    has_many :children, class_name: "Marketplace::ServiceCategory", foreign_key: :parent_id, dependent: :nullify
    has_many :service_offerings, class_name: "Marketplace::ServiceOffering", dependent: :restrict_with_exception

    validates :slug, presence: true, uniqueness: { case_sensitive: false }
    validates :name, presence: true, length: { maximum: 160 }

    scope :active, -> { where(active: true) }
    scope :roots, -> { where(parent_id: nil) }
    scope :ordered, -> { order(:position, :name) }

    before_validation :normalize_slug

    private

    def normalize_slug
      self.slug = slug.to_s.parameterize if slug.present?
    end
  end
end
