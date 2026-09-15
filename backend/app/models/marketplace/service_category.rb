# frozen_string_literal: true

module Marketplace
  class ServiceCategory < ApplicationRecord
    self.table_name = "service_categories"

    # Status State Machine Enum
    enum status: {
      draft: "draft",
      review: "review",
      scheduled: "scheduled",
      published: "published",
      archived: "archived"
    }, _default: "draft"

    # Associations
    belongs_to :parent, class_name: "Marketplace::ServiceCategory", optional: true
    has_many :children, class_name: "Marketplace::ServiceCategory", foreign_key: :parent_id, dependent: :nullify
    has_many :service_offerings, class_name: "Marketplace::ServiceOffering", dependent: :restrict_with_exception
    has_many :faqs, class_name: "Marketplace::CategoryFaq", foreign_key: :service_category_id, dependent: :destroy
    has_many :use_cases, class_name: "Marketplace::CategoryUseCase", foreign_key: :service_category_id, dependent: :destroy
    has_many :category_relations, class_name: "Marketplace::CategoryRelation", foreign_key: :service_category_id, dependent: :destroy
    has_many :related_categories, through: :category_relations, source: :related_category
    has_many :redirects, class_name: "Marketplace::CategoryRedirect", foreign_key: :service_category_id, dependent: :destroy
    has_many :content_versions, class_name: "Marketplace::CategoryContentVersion", foreign_key: :service_category_id, dependent: :destroy

    accepts_nested_attributes_for :faqs, allow_destroy: true, reject_if: :all_blank
    accepts_nested_attributes_for :use_cases, allow_destroy: true, reject_if: :all_blank

    # Validations
    validates :slug, presence: true, uniqueness: { case_sensitive: false }
    validates :name, presence: true, length: { maximum: 160 }
    validate :prevent_circular_hierarchy

    # Scopes
    scope :active, -> { where(active: true) }
    scope :published_records, -> { where(status: :published, active: true) }
    scope :roots, -> { where(parent_id: nil) }
    scope :ordered, -> { order(:position, :name) }
    scope :featured, -> { where(featured: true) }
    scope :indexable, -> { where(robots_index: true, status: :published) }
    scope :missing_seo, -> { where("seo_title IS NULL OR seo_title = '' OR seo_description IS NULL OR seo_description = ''") }
    scope :missing_hero, -> { where("hero_image_url IS NULL OR hero_image_url = ''") }

    before_validation :normalize_slug
    before_validation :generate_public_id, on: :create

    def display_headline
      headline.presence || name
    end

    def display_subheadline
      subheadline.presence || short_description
    end

    def display_seo_title
      seo_title.presence || "#{name} · Operadores de Drone & Serviços | OEST"
    end

    def display_seo_description
      seo_description.presence || short_description.presence || "Encontre operadores certificados pela ANAC e serviços especializados em #{name} em todo o Brasil."
    end

    def operators_count
      # Computes distinct verified operators offering services under this category
      Marketplace::ServiceOffering
        .where(service_category_id: id, active: true)
        .joins(:operator_profile)
        .where(operator_profiles: { verification_status: "verified", accepting_jobs: true })
        .select(:operator_profile_id)
        .distinct
        .count
    end

    def services_count
      service_offerings.where(active: true).count
    end

    private

    def normalize_slug
      self.slug = slug.to_s.parameterize if slug.present?
    end

    def generate_public_id
      self.public_id ||= "cat_#{SecureRandom.alphanumeric(12).downcase}"
    end

    def prevent_circular_hierarchy
      return unless parent_id.present?
      if parent_id == id
        errors.add(:parent_id, "não pode ser pai de si mesma")
        return
      end

      ancestor = parent
      while ancestor
        if ancestor.id == id
          errors.add(:parent_id, "gera um ciclo na hierarquia de categorias")
          break
        end
        ancestor = ancestor.parent
      end
    end
  end
end
