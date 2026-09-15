# frozen_string_literal: true

class OrganizationFollow < ApplicationRecord
  self.table_name = "organization_follows"

  belongs_to :follower_organization, class_name: "Organization"
  belongs_to :followed_operator_profile, class_name: "Operators::OperatorProfile"

  validates :follower_organization_id, uniqueness: { scope: :followed_operator_profile_id }
  validate :cannot_follow_own_profile

  private

  def cannot_follow_own_profile
    return unless follower_organization_id.present? && followed_operator_profile.present?

    if follower_organization_id == followed_operator_profile.organization_id
      errors.add(:base, "Organization cannot follow its own operator profile")
    end
  end
end
