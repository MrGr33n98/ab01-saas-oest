# frozen_string_literal: true

class Organization < ApplicationRecord
  TYPES = %w[
    customer drone_operator data_company engineering_company
    survey_company enterprise government research
  ].freeze

  has_many :organization_memberships, dependent: :restrict_with_exception
  has_many :users, through: :organization_memberships
  has_one :operator_profile, class_name: "Operators::OperatorProfile", dependent: :destroy
  has_many :projects, class_name: "Projects::Project", dependent: :restrict_with_exception
  has_many :missions, class_name: "Missions::Mission", dependent: :restrict_with_exception

  validates :name, presence: true, length: { maximum: 180 }
  validates :slug, presence: true, uniqueness: { case_sensitive: false }
  validates :organization_type, inclusion: { in: TYPES }
  validates :country_code, presence: true, length: { is: 2 }
  validates :status, inclusion: { in: %w[active suspended closed] }

  before_validation :normalize_slug, if: -> { slug.present? }

  def operator?
    organization_type == "drone_operator" || operator_profile.present?
  end

  private

  def normalize_slug
    self.slug = slug.to_s.parameterize
  end
end
