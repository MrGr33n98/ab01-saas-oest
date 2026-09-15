# frozen_string_literal: true

class User < ApplicationRecord
  has_many :organization_memberships, dependent: :restrict_with_exception
  has_many :organizations, through: :organization_memberships

  validates :email, presence: true, uniqueness: { case_sensitive: false }
  validates :platform_role, inclusion: { in: %w[user support admin super_admin] }
  validates :status, inclusion: { in: %w[active suspended deleted] }

  def full_name
    [first_name, last_name].compact_blank.join(" ").presence || email
  end

  def platform_admin?
    platform_role.in?(%w[admin super_admin])
  end

  def super_admin?
    platform_role == "super_admin"
  end
end
