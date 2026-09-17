# frozen_string_literal: true

class Organization < ApplicationRecord
  TYPES = %w[
    customer drone_operator data_company engineering_company
    survey_company enterprise government research
  ].freeze

  has_many :organization_memberships, dependent: :restrict_with_exception
  has_many :users, through: :organization_memberships
  has_one :operator_profile, class_name: "Operators::OperatorProfile", dependent: :destroy
  has_one :operator_payout_profile, class_name: "Operators::PayoutProfile", dependent: :destroy
  has_many :operator_associated_operators, class_name: "Operators::AssociatedOperator", dependent: :destroy
  has_many :operator_contracts, class_name: "Operators::OperatorContract", dependent: :destroy
  has_many :operator_support_requests, class_name: "Operators::SupportRequest", dependent: :restrict_with_exception
  has_one :enterprise_profile, class_name: "Enterprises::Profile", dependent: :destroy
  has_many :enterprise_api_keys, class_name: "Enterprises::ApiKey", dependent: :restrict_with_exception
  has_many :projects, class_name: "Projects::Project", dependent: :restrict_with_exception
  has_many :missions, class_name: "Missions::Mission", dependent: :restrict_with_exception

  has_many :organization_follows,
           foreign_key: :follower_organization_id,
           class_name: "OrganizationFollow",
           dependent: :destroy
  has_many :followed_operator_profiles,
           through: :organization_follows,
           source: :followed_operator_profile

  validates :name, presence: true, length: { maximum: 180 }
  validates :slug, presence: true, uniqueness: { case_sensitive: false }
  validates :organization_type, inclusion: { in: TYPES }
  validates :country_code, presence: true, length: { is: 2 }
  validates :status, inclusion: { in: %w[active suspended closed] }

  before_validation :normalize_slug, if: -> { slug.present? }

  def operator?
    organization_type == "drone_operator" || operator_profile.present?
  end

  def enterprise?
    !operator?
  end

  def tenant_type
    operator? ? "operator" : "enterprise"
  end

  def following?(operator_profile)
    organization_follows.exists?(followed_operator_profile_id: operator_profile.id)
  end

  private

  def normalize_slug
    self.slug = slug.to_s.parameterize
  end
end
