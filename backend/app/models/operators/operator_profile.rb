# frozen_string_literal: true

module Operators
  class OperatorProfile < ApplicationRecord
    self.table_name = "operator_profiles"

    KINDS = %w[solo company].freeze

    belongs_to :organization
    has_many :service_offerings, class_name: "Marketplace::ServiceOffering", dependent: :destroy
    has_many :coverage_areas, class_name: "Operators::CoverageArea", dependent: :destroy
    has_many :operator_data_products, class_name: "Operators::OperatorDataProduct", dependent: :destroy
    has_many :operator_badges, class_name: "Operators::OperatorBadge", dependent: :destroy
    has_many :verification_badges, through: :operator_badges
    has_many :operator_materials, class_name: "Operators::OperatorMaterial", dependent: :destroy
    has_many :quote_requests, class_name: "QuoteRequest", dependent: :destroy

    validates :slug, presence: true, uniqueness: { case_sensitive: false }
    validates :verification_status, inclusion: {
      in: %w[pending submitted verified rejected suspended]
    }
    validates :profile_kind, inclusion: { in: KINDS }

    scope :searchable, -> { where(searchable: true, accepting_jobs: true) }
    scope :verified, -> { where(verification_status: "verified") }
    scope :solo, -> { where(profile_kind: "solo") }
    scope :companies, -> { where(profile_kind: "company") }
    scope :featured, -> { where(category_featured: true) }

    before_validation :normalize_slug

    def company?
      profile_kind == "company"
    end

    def display_name
      company? ? (company_name.presence || organization&.name) : (headline.presence || organization&.name)
    end

    def public_path
      company? ? "/companies/#{slug}" : "/operators/#{slug}"
    end

    private

    def normalize_slug
      self.slug = slug.to_s.parameterize if slug.present?
    end
  end
end
