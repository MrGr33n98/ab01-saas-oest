# frozen_string_literal: true

class User < ApplicationRecord
  devise :database_authenticatable, :validatable

  USER_TYPES = %w[operator enterprise].freeze

  has_many :organization_memberships, dependent: :restrict_with_exception
  has_many :organizations, through: :organization_memberships
  has_many :requested_enterprise_api_keys,
           class_name: "Enterprises::ApiKey",
           foreign_key: :requested_by_id,
           dependent: :restrict_with_exception
  has_many :operator_support_requests,
           class_name: "Operators::SupportRequest",
           foreign_key: :requested_by_id,
           dependent: :restrict_with_exception

  validates :email, presence: true, uniqueness: { case_sensitive: false }
  validates :platform_role, inclusion: { in: %w[user support admin super_admin] }
  validates :status, inclusion: { in: %w[active suspended deleted] }
  validates :user_type, inclusion: { in: USER_TYPES }

  def full_name
    [first_name, last_name].compact_blank.join(" ").presence || email
  end

  def platform_admin?
    platform_role.in?(%w[admin super_admin])
  end

  def super_admin?
    platform_role == "super_admin"
  end

  def operator?
    user_type == "operator"
  end

  def enterprise?
    user_type == "enterprise"
  end
end
