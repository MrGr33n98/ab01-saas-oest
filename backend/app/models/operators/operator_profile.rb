# frozen_string_literal: true

module Operators
  class OperatorProfile < ApplicationRecord
    self.table_name = "operator_profiles"

    KINDS = %w[solo company].freeze

    belongs_to :organization
    has_one :operator_onboarding_profile, class_name: "Operators::OnboardingProfile", dependent: :destroy
    has_many :mission_invites, class_name: "Operators::MissionInvite", dependent: :destroy
    has_many :associated_operators, class_name: "Operators::AssociatedOperator", dependent: :destroy
    has_many :operator_contracts, class_name: "Operators::OperatorContract", dependent: :destroy
    has_many :service_offerings, class_name: "Marketplace::ServiceOffering", dependent: :destroy
    has_many :coverage_areas, class_name: "Operators::CoverageArea", dependent: :destroy
    has_many :operator_data_products, class_name: "Operators::OperatorDataProduct", dependent: :destroy
    has_many :operator_badges, class_name: "Operators::OperatorBadge", dependent: :destroy
    has_many :verification_badges, through: :operator_badges
    has_many :operator_materials, class_name: "Operators::OperatorMaterial", dependent: :destroy
    has_many :quote_requests, class_name: "QuoteRequest", dependent: :destroy
    has_many :drones, class_name: "Operators::Drone", dependent: :destroy
    has_many :pilots, class_name: "Operators::Pilot", dependent: :destroy
    has_many :reviews, class_name: "Reviews::Review", dependent: :restrict_with_exception

    # New B2B Network & Showcase Associations
    has_many :portfolio_items, class_name: "Operators::PortfolioItem", dependent: :destroy
    has_one :data_intent_config, class_name: "Operators::DataIntentConfig", dependent: :destroy
    has_many :lead_inquiries, class_name: "Operators::LeadInquiry", dependent: :destroy
    has_many :organization_follows,
             foreign_key: :followed_operator_profile_id,
             class_name: "OrganizationFollow",
             dependent: :destroy
    has_many :followers, through: :organization_follows, source: :follower_organization

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

    def effective_banner_headline
      banner_headline.presence || "Dados do mundo real. Decisões de alto impacto."
    end

    def effective_banner_subtitle
      banner_subtitle.presence || "Mapeamento aéreo, LiDAR e inteligência geoespacial para infraestrutura, engenharia e grandes projetos."
    end

    def effective_banner_badges
      banner_badges.presence || ["Todo o Brasil", "Alta Precisão", "Resultados Comprovados"]
    end

    def recalculate_rating_metrics!
      approved_reviews = reviews.where(moderation_status: "published")
      count = approved_reviews.count
      avg = count.positive? ? approved_reviews.average(:overall_rating).to_f.round(2) : nil

      update_columns(
        rating_average: avg,
        rating_count: count
      )
    end

    private

    def normalize_slug
      self.slug = slug.to_s.parameterize if slug.present?
    end
  end
end
