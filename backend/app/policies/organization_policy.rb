# frozen_string_literal: true

class OrganizationPolicy < ApplicationPolicy
  def index?
    user.present?
  end

  def show?
    platform_admin? || member?
  end

  def create?
    user.present?
  end

  def update?
    platform_admin? || owner_or_admin?
  end

  def manage_members?
    platform_admin? || owner_or_admin?
  end

  class Scope < ApplicationPolicy::Scope
    def resolve
      if user&.platform_admin?
        scope.all
      else
        scope.joins(:organization_memberships)
             .where(organization_memberships: { user_id: user.id, status: "active" })
      end
    end
  end
end
