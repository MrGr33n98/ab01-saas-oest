# frozen_string_literal: true

class OrganizationMembership < ApplicationRecord
  ROLES = %w[
    owner admin manager procurement operator_manager
    pilot analyst billing viewer
  ].freeze

  belongs_to :organization
  belongs_to :user
  belongs_to :invited_by, class_name: "User", optional: true

  validates :role, inclusion: { in: ROLES }
  validates :status, inclusion: { in: %w[invited active suspended] }
  validates :user_id, uniqueness: { scope: :organization_id }

  scope :active, -> { where(status: "active") }

  def owner_or_admin?
    role.in?(%w[owner admin])
  end

  def can_manage_missions?
    role.in?(%w[owner admin manager procurement])
  end

  def can_submit_quotes?
    role.in?(%w[owner admin operator_manager])
  end

  def can_execute?
    role.in?(%w[owner admin operator_manager pilot])
  end
end
